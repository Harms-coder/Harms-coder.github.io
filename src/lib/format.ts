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
