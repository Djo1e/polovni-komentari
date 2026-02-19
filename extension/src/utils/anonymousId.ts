const STORAGE_KEY = "paCommentsAnonymousId";

export function getOrCreateAnonymousId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
