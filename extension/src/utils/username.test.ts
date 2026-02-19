import { describe, it, expect } from "vitest";
import { generateRandomUsername } from "./username";

describe("generateRandomUsername", () => {
  it("returns a string matching CarBrand + 3-digit number pattern", () => {
    const name = generateRandomUsername();
    expect(name).toMatch(/^[A-Z][a-z]+\d{3}$/);
  });

  it("generates different names on repeated calls", () => {
    const names = new Set(Array.from({ length: 20 }, () => generateRandomUsername()));
    expect(names.size).toBeGreaterThan(1);
  });
});
