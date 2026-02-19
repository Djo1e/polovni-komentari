import { expect, test } from "vitest";
import { extractListingId } from "./listingId";

test("extracts ID from real listing URL", () => {
  expect(
    extractListingId("https://www.polovniautomobili.com/auto-oglasi/28478932/audi-a6-40-tdi-3xs-line?attp=p19_pv0_pc1_pl10_plv0")
  ).toBe("28478932");
});

test("extracts ID with no query string", () => {
  expect(
    extractListingId("https://www.polovniautomobili.com/auto-oglasi/12345678/volkswagen-golf-7")
  ).toBe("12345678");
});

test("returns null for listing index page (no numeric id segment)", () => {
  expect(
    extractListingId("https://www.polovniautomobili.com/auto-oglasi/")
  ).toBeNull();
});

test("returns null for empty string", () => {
  expect(extractListingId("")).toBeNull();
});
