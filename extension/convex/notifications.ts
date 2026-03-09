import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";

// Shared helper function so postComment can call it directly (not via scheduler)
export async function createNotificationsForReplyHelper(
  ctx: MutationCtx,
  args: {
    commentId: Id<"comments">;
    parentId: Id<"comments">;
    listingId: string;
    authorName: string;
    authorId: string;
    userId?: Id<"users">;
  }
) {
  const { commentId, parentId, listingId, authorName, authorId, userId } = args;

  // Find the direct parent comment
  const parent = await ctx.db.get(parentId);
  if (!parent) return;

  // Walk up to find root comment
  let root = parent;
  for (let i = 0; i < 100; i++) {
    if (!root.parentId) break;
    const next = await ctx.db.get(root.parentId);
    if (!next) break;
    root = next;
  }

  // Collect unique signed-in user IDs to notify
  const userIdsToNotify = new Set<Id<"users">>();

  // Resolve user ID from comment: use userId field, or look up by authorId
  async function resolveUserId(comment: { userId?: Id<"users">; authorId: string }): Promise<Id<"users"> | null> {
    if (comment.userId) return comment.userId;
    const user = await ctx.db
      .query("users")
      .withIndex("by_anonymousId", (q) => q.eq("anonymousId", comment.authorId))
      .first();
    return user?._id ?? null;
  }

  // Notify parent comment author
  const parentUserId = await resolveUserId(parent);
  if (parentUserId) userIdsToNotify.add(parentUserId);

  // Notify root comment author (if different from parent)
  const rootUserId = await resolveUserId(root);
  if (rootUserId) userIdsToNotify.add(rootUserId);

  // Don't notify the reply author themselves
  if (userId) {
    userIdsToNotify.delete(userId);
  } else {
    // Anonymous replier: resolve their userId via authorId to exclude self-notifications
    const replierUserId = await resolveUserId({ authorId });
    if (replierUserId) userIdsToNotify.delete(replierUserId);
  }

  // Create notifications
  for (const userId of userIdsToNotify) {
    const notificationId = await ctx.db.insert("notifications", {
      userId,
      type: "reply",
      commentId,
      triggerAuthorName: authorName,
      listingId,
      read: false,
      emailSent: false,
      createdAt: Date.now(),
    });

    // Schedule email if user has notifications enabled
    const user = await ctx.db.get(userId);
    if (user && user.emailNotifications) {
      // Get the reply text for the email snippet
      const replyComment = await ctx.db.get(commentId);
      const fullText = replyComment ? replyComment.text : "";
      const replySnippet = fullText.length > 40 ? fullText.slice(0, 40) + "..." : fullText;

      const listing = await ctx.db
        .query("listings")
        .withIndex("by_listingId", (q) => q.eq("listingId", listingId))
        .first();

      await ctx.scheduler.runAfter(0, internal.email.sendReplyNotificationEmail, {
        notificationId,
        toEmail: user.email,
        recipientName: user.displayName,
        replierName: authorName,
        replySnippet,
        listingTitle: listing?.title ?? "Oglas",
        listingUrl: listing?.url ?? `https://www.polovniautomobili.com/auto-oglasi/${listingId}`,
        userId,
      });
    }
  }
}

// Internal mutation wrapper (for use with ctx.runMutation from actions)
export const createNotificationsForReply = internalMutation({
  args: {
    commentId: v.id("comments"),
    parentId: v.id("comments"),
    listingId: v.string(),
    authorName: v.string(),
    authorId: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await createNotificationsForReplyHelper(ctx, args);
  },
});

export const getNotifications = query({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, { userId, sessionToken }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.sessionToken !== sessionToken) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    const listingCache = new Map<string, string | null>();
    const results = [];
    for (const n of notifications) {
      if (!listingCache.has(n.listingId)) {
        const listing = await ctx.db
          .query("listings")
          .withIndex("by_listingId", (q) => q.eq("listingId", n.listingId))
          .first();
        listingCache.set(n.listingId, listing?.url ?? null);
      }
      results.push({ ...n, listingUrl: listingCache.get(n.listingId)! });
    }
    return results;
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, { userId, sessionToken }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.sessionToken !== sessionToken) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", userId).eq("read", false)
      )
      .take(100);
    return unread.length;
  },
});

export const markAllRead = mutation({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, { userId, sessionToken }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.sessionToken !== sessionToken) throw new Error("Invalid session");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", userId).eq("read", false)
      )
      .take(500);
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications"), userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, { notificationId, userId, sessionToken }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.sessionToken !== sessionToken) throw new Error("Invalid session");
    const notification = await ctx.db.get(notificationId);
    if (!notification || notification.userId !== userId) throw new Error("Not your notification");
    await ctx.db.patch(notificationId, { read: true });
  },
});

export const markEmailSent = internalMutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { emailSent: true });
  },
});
