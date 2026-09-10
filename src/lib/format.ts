export function formatPace(distanceKm: number, durationMin: number): string {
  if (distanceKm <= 0) return "–";
  const paceMinPerKm = durationMin / distanceKm;
  let minutes = Math.floor(paceMinPerKm);
  let seconds = Math.round((paceMinPerKm - minutes) * 60);
  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

/** "Bryst", "Skuldre", "Triceps" → "Bryst, skuldre og triceps" (kun første ord med stort). */
export function joinDanish(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  const lowered = items.map((item, i) => (i === 0 ? item : item.toLowerCase()));
  return `${lowered.slice(0, -1).join(", ")} og ${lowered[lowered.length - 1]}`;
}
