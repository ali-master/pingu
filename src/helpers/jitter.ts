/**
 * Calculates jitter (variance in response times)
 */
export function calculateJitter(times: number[]): number | null {
  if (times.length < 2) return null;

  const differences: number[] = [];
  for (let i = 1; i < times.length; i++) {
    differences.push(Math.abs(times[i] - times[i - 1]));
  }

  return differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
}
