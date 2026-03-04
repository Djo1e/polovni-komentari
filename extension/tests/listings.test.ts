import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";

test("markListingDeleted sets isDeleted on existing listing", async () => {
  const t = convexTest(schema);

  await t.mutation(api.listings.upsertListing, {
    listingId: "12345",
    title: "Opel Astra",
    price: "1.899 €",
    imageUrl: "https://example.com/img.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/12345/opel-astra",
  });

  await t.mutation(api.listings.markListingDeleted, {
    listingId: "12345",
  });

  const listing = await t.run(async (ctx) => {
    return ctx.db
      .query("listings")
      .withIndex("by_listingId", (q) => q.eq("listingId", "12345"))
      .first();
  });

  expect(listing?.isDeleted).toBe(true);
});

test("markListingDeleted is a no-op for unknown listing", async () => {
  const t = convexTest(schema);
  // Should not throw
  await t.mutation(api.listings.markListingDeleted, {
    listingId: "99999",
  });
});
