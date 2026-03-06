import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";
import { ListingInfo } from "../src/utils/listingInfo";

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

test("upsertListing accepts a full ListingInfo shape (vin + boughtNewInSerbia)", async () => {
  const t = convexTest(schema);

  // Simulate what App.tsx does: spread listingInfo into the mutation
  const listingInfo: ListingInfo = {
    title: "Audi Q3 2.0TDI",
    price: "16.990 €",
    imageUrl: "https://example.com/img.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/28293552/audi-q3",
    vin: "WAUZZZ8U1FR012345",
    boughtNewInSerbia: false,
  };

  const listingId = "28293552";

  // This must not throw — mirrors the exact call pattern in App.tsx
  await t.mutation(api.listings.upsertListing, {
    listingId,
    ...listingInfo,
  });

  const listing = await t.query(api.listings.getListing, { listingId });
  expect(listing).not.toBeNull();
  expect(listing!.title).toBe("Audi Q3 2.0TDI");
});

test("upsertListing accepts ListingInfo with null vin", async () => {
  const t = convexTest(schema);

  const listingInfo: ListingInfo = {
    title: "Opel Corsa",
    price: "3.500 €",
    imageUrl: "https://example.com/img2.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/99999/opel-corsa",
    vin: null,
    boughtNewInSerbia: true,
  };

  await t.mutation(api.listings.upsertListing, {
    listingId: "99999",
    ...listingInfo,
  });

  const listing = await t.query(api.listings.getListing, { listingId: "99999" });
  expect(listing).not.toBeNull();
  expect(listing!.title).toBe("Opel Corsa");
});

test("getListing returns null for unknown listing", async () => {
  const t = convexTest(schema);
  const listing = await t.query(api.listings.getListing, { listingId: "99999" });
  expect(listing).toBeNull();
});
