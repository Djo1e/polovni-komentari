export function extractListingId(url) {
    const match = /\/auto-oglasi\/oglas\/[^/]+-(\d+)\.html/.exec(url);
    return match ? match[1] : null;
}
