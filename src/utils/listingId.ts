export function extractListingId(url: string): string | null {
  const match = /\/auto-oglasi\/oglas\/[^/]+-(\d+)\.html/.exec(url);
  return match ? match[1] : null;
}
