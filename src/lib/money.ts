export function formatPrice(cents: number): string {
  const rand = cents / 100;
  return `R${Number.isInteger(rand) ? rand : rand.toFixed(2)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
