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

test("getListing returns listing by listingId", async () => {
  const t = convexTest(schema);

  await t.mutation(api.listings.upsertListing, {
    listingId: "12345",
    title: "Opel Astra",
    price: "1.899 EUR",
    imageUrl: "https://example.com/img.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/12345/opel-astra",
  });

  const listing = await t.query(api.listings.getListing, { listingId: "12345" });
  expect(listing).not.toBeNull();
  expect(listing!.title).toBe("Opel Astra");
  expect(listing!.price).toBe("1.899 EUR");
  expect(listing!.isDeleted).toBe(false);
});

test("getListing returns null for unknown listing", async () => {
  const t = convexTest(schema);
  const listing = await t.query(api.listings.getListing, { listingId: "99999" });
  expect(listing).toBeNull();
});
