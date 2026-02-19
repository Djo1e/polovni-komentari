export function extractListingId(url: string): string | null {
  const match = /\/auto-oglasi\/(\d+)\//.exec(url);
  return match ? match[1] : null;
}
