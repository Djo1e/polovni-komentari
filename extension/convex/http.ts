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
    const userId = url.searchParams.get("userId") as Id<"users"> | null;

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    await ctx.runMutation(internal.users.disableEmailNotifications, { userId });

    return new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
        <h2>Email obaveštenja su isključena</h2>
        <p>Više nećeš dobijati email obaveštenja od Polovni Komentari.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }),
});

export default http;
