import { expect, test, vi, beforeEach } from "vitest";
import { getOrCreateAnonymousId } from "./anonymousId";

const store: Record<string, string> = {};

vi.stubGlobal("localStorage", {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
});

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.clearAllMocks();
});

test("generates and stores a UUID on first call", () => {
  const id = getOrCreateAnonymousId();
  expect(id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
  expect(localStorage.setItem).toHaveBeenCalledWith("paCommentsAnonymousId", id);
});

test("returns the same ID on subsequent calls", () => {
  const id1 = getOrCreateAnonymousId();
  const id2 = getOrCreateAnonymousId();
  expect(id1).toBe(id2);
});
