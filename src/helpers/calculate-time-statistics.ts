/**
 * Calculates comprehensive time-based statistics
 */
export function calculateTimeStatistics(times: number[]): {
  min: number | null;
  max: number | null;
  avg: number | null;
  median: number | null;
  stdDev: number | null;
} {
  if (times.length === 0) {
    return { min: null, max: null, avg: null, median: null, stdDev: null };
  }

  const sortedTimes = [...times].sort((a, b) => a - b);
  const sum = times.reduce((acc, time) => acc + time, 0);
  const avg = sum / times.length;

  // Calculate median
  const median =
    sortedTimes.length % 2 === 0
      ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
      : sortedTimes[Math.floor(sortedTimes.length / 2)];

  // Calculate standard deviation
  const variance = times.reduce((acc, time) => acc + Math.pow(time - avg, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: sortedTimes[0],
    max: sortedTimes[sortedTimes.length - 1],
    avg,
    median,
    stdDev,
  };
}
