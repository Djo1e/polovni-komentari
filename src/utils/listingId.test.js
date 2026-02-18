import { expect, test } from "vitest";
import { extractListingId } from "./listingId";
test("extracts ID from standard listing URL", () => {
    expect(extractListingId("https://www.polovniautomobili.com/auto-oglasi/oglas/kia-sportage-1-6-crdi-24536789.html")).toBe("24536789");
});
test("extracts ID when car name has many hyphens", () => {
    expect(extractListingId("https://www.polovniautomobili.com/auto-oglasi/oglas/mercedes-benz-c-220-d-amg-line-99887766.html")).toBe("99887766");
});
test("returns null for non-listing URL", () => {
    expect(extractListingId("https://www.polovniautomobili.com/auto-oglasi/")).toBeNull();
});
test("returns null for empty string", () => {
    expect(extractListingId("")).toBeNull();
});
