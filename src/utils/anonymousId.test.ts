import { expect, test, vi, beforeEach } from "vitest";
import { getOrCreateAnonymousId } from "./anonymousId";

const store: Record<string, string> = {};
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(async (key: string) => ({ [key]: store[key] })),
      set: vi.fn(async (obj: Record<string, string>) => {
        Object.assign(store, obj);
      }),
    },
  },
};
vi.stubGlobal("chrome", chromeMock);

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.clearAllMocks();
});

test("generates and stores a UUID on first call", async () => {
  const id = await getOrCreateAnonymousId();
  expect(id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
  expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ anonymousId: id });
});

test("returns the same ID on subsequent calls", async () => {
  const id1 = await getOrCreateAnonymousId();
  const id2 = await getOrCreateAnonymousId();
  expect(id1).toBe(id2);
});
