/* eslint-disable no-var */
declare var process: { env: Record<string, string | undefined> };

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";

export const sendReplyNotificationEmail = internalAction({
  args: {
    notificationId: v.id("notifications"),
    toEmail: v.string(),
    recipientName: v.string(),
    replierName: v.string(),
    replySnippet: v.string(),
    listingTitle: v.string(),
    listingUrl: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set, skipping email send");
      return;
    }

    const resend = new Resend(apiKey);

    const convexUrl = process.env.CONVEX_SITE_URL ?? "";
    const unsubscribeUrl = `${convexUrl}/unsubscribe?userId=${args.userId}`;

    await resend.emails.send({
      from: "Polovni Komentari <notifications@polovnikomentari.rs>",
      to: args.toEmail,
      subject: `${args.replierName} je odgovorio/la na tvoj komentar`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h3 style="color: #333;">${args.replierName} je odgovorio/la na tvoj komentar</h3>
          <p style="color: #555; font-size: 15px; line-height: 1.5; background: #f5f5f5; padding: 12px; border-radius: 8px;">
            &ldquo;${args.replySnippet}&rdquo;
          </p>
          <p style="color: #888; font-size: 13px;">Na oglasu: ${args.listingTitle}</p>
          <a href="${args.listingUrl}" style="display: inline-block; background: #f97316; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-top: 8px;">
            Pogledaj na Polovni Automobili &rarr;
          </a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 11px;">
            <a href="${unsubscribeUrl}" style="color: #aaa;">Isključi email obaveštenja</a>
            &middot; Polovni Komentari
          </p>
        </div>
      `,
    });

    await ctx.runMutation(internal.notifications.markEmailSent, {
      notificationId: args.notificationId,
    });
  },
});
