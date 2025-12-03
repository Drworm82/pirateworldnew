// utils/time.js

export function formatETA(eta) {
  if (!eta) return "—";
  return new Date(eta).toLocaleString();
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
