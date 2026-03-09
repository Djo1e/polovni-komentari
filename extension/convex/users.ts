import { v } from "convex/values";
import { action, internalMutation, mutation, query, internalQuery, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

async function verifySession(ctx: MutationCtx, userId: Id<"users">, sessionToken: string) {
  const user = await ctx.db.get(userId);
  if (!user || user.sessionToken !== sessionToken) {
    throw new Error("Invalid session");
  }
  return user;
}

export const signIn = action({
  args: {
    googleToken: v.string(),
    anonymousId: v.string(),
  },
  handler: async (ctx, { googleToken, anonymousId }): Promise<{
    userId: Id<"users">;
    firstName: string;
    email: string;
    displayName: string;
    isCustomName: boolean;
    emailNotifications: boolean;
    sessionToken: string;
  }> => {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${googleToken}` } }
    );
    if (!response.ok) throw new Error("Invalid Google token");

    const profile = await response.json();
    const googleId = profile.sub as string;
    const email = profile.email as string;
    const firstName = (profile.given_name || profile.name || "User") as string;

    const result = await ctx.runMutation(internal.users.createOrUpdateUser, {
      googleId,
      email,
      firstName,
      anonymousId,
    });

    await ctx.runMutation(internal.users.migrateAnonymousComments, {
      anonymousId,
      userId: result.userId,
    });

    const user = await ctx.runQuery(internal.users.getUserInternal, { userId: result.userId });

    return {
      userId: result.userId,
      firstName: user!.firstName,
      email: user!.email,
      displayName: user!.displayName,
      isCustomName: user!.isCustomName,
      emailNotifications: user!.emailNotifications,
      sessionToken: result.sessionToken,
    };
  },
});

export const createOrUpdateUser = internalMutation({
  args: {
    googleId: v.string(),
    email: v.string(),
    firstName: v.string(),
    anonymousId: v.string(),
  },
  handler: async (ctx, { googleId, email, firstName, anonymousId }) => {
    const sessionToken = crypto.randomUUID();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_googleId", (q) => q.eq("googleId", googleId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: Date.now(), sessionToken, email, firstName });
      return { userId: existing._id, sessionToken };
    }

    const userId = await ctx.db.insert("users", {
      googleId,
      email,
      firstName,
      displayName: firstName,
      isCustomName: false,
      anonymousId,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      emailNotifications: true,
      sessionToken,
      unsubscribeToken: crypto.randomUUID(),
    });
    return { userId, sessionToken };
  },
});

export const migrateAnonymousComments = internalMutation({
  args: {
    anonymousId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { anonymousId, userId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_authorId", (q) => q.eq("authorId", anonymousId))
      .take(500);

    for (const comment of comments) {
      if (!comment.userId) {
        await ctx.db.patch(comment._id, { userId });
      }
    }
  },
});

export const getUserInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db.get(userId);
  },
});

export const getUser = query({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, { userId, sessionToken }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.sessionToken !== sessionToken) return null;
    return {
      displayName: user.displayName,
      isCustomName: user.isCustomName,
      emailNotifications: user.emailNotifications,
    };
  },
});

export const updateDisplayName = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, { userId, sessionToken, displayName }) => {
    await verifySession(ctx, userId, sessionToken);
    const trimmed = displayName.trim();
    if (trimmed.length === 0) throw new Error("Display name cannot be empty");
    if (trimmed.length > 30) throw new Error("Display name too long");
    const sanitized = trimmed.replace(/[\x00-\x1F\x7F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
    if (sanitized.length === 0) throw new Error("Display name cannot be empty");
    await ctx.db.patch(userId, { displayName: sanitized, isCustomName: true });
  },
});

export const updateEmailNotifications = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, { userId, sessionToken, enabled }) => {
    await verifySession(ctx, userId, sessionToken);
    await ctx.db.patch(userId, { emailNotifications: enabled });
  },
});

export const disableEmailNotifications = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, { emailNotifications: false });
    }
  },
});
