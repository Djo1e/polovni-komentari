import { v } from "convex/values";
import { action, internalMutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

    const userId = await ctx.runMutation(internal.users.createOrUpdateUser, {
      googleId,
      email,
      firstName,
      anonymousId,
    });

    await ctx.runMutation(internal.users.migrateAnonymousComments, {
      anonymousId,
      userId,
    });

    const user = await ctx.runQuery(internal.users.getUserInternal, { userId });

    return {
      userId,
      firstName: user!.firstName,
      email: user!.email,
      displayName: user!.displayName,
      isCustomName: user!.isCustomName,
      emailNotifications: user!.emailNotifications,
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
    const existing = await ctx.db
      .query("users")
      .withIndex("by_googleId", (q) => q.eq("googleId", googleId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: Date.now() });
      return existing._id;
    }

    return ctx.db.insert("users", {
      googleId,
      email,
      firstName,
      displayName: firstName,
      isCustomName: false,
      anonymousId,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      emailNotifications: true,
      commentCount: 0,
      upvotesReceived: 0,
    });
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
      .filter((q) => q.eq(q.field("authorId"), anonymousId))
      .collect();

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
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      displayName: user.displayName,
      isCustomName: user.isCustomName,
      emailNotifications: user.emailNotifications,
      firstName: user.firstName,
    };
  },
});
