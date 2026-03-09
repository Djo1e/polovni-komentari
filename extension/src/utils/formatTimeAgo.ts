export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "upravo";
  if (minutes < 60) return `pre ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `pre ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `pre ${days}d`;
  const weeks = Math.floor(days / 7);
  return `pre ${weeks}n`;
}
