import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/unsubscribe",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("userId");
    const token = url.searchParams.get("token");

    if (!userIdParam || !token) {
      return new Response("Invalid link", { status: 400 });
    }

    let user;
    try {
      user = await ctx.runQuery(internal.users.getUserInternal, { userId: userIdParam as Id<"users"> });
    } catch {
      return new Response("Invalid link", { status: 400 });
    }
    if (!user || user.unsubscribeToken !== token) {
      return new Response("Invalid or expired link", { status: 403 });
    }

    const userId = user._id;

    await ctx.runMutation(internal.users.disableEmailNotifications, { userId });

    return new Response(
      `<html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;text-align:center;padding:60px;">
        <h2>Email obaveštenja su isključena</h2>
        <p>Više nećeš dobijati email obaveštenja od Polovni Komentari.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }),
});

export default http;
