/**
 * Formats response time in human-readable format with performance assessment
 */
export function formatTimeHuman(timeMs: number | null): string | null {
  if (timeMs === null) return null;

  if (timeMs < 1) {
    return `${(timeMs * 1000).toFixed(0)} microseconds (instant)`;
  } else if (timeMs < 10) {
    return `${timeMs.toFixed(2)} ms (excellent)`;
  } else if (timeMs < 50) {
    return `${timeMs.toFixed(2)} ms (very good)`;
  } else if (timeMs < 100) {
    return `${timeMs.toFixed(2)} ms (good)`;
  } else if (timeMs < 200) {
    return `${timeMs.toFixed(2)} ms (acceptable)`;
  } else if (timeMs < 500) {
    return `${timeMs.toFixed(2)} ms (slow)`;
  } else if (timeMs < 1000) {
    return `${timeMs.toFixed(2)} ms (very slow)`;
  } else if (timeMs < 2000) {
    return `${(timeMs / 1000).toFixed(2)} seconds (poor)`;
  } else {
    return `${(timeMs / 1000).toFixed(2)} seconds (critical)`;
  }
}
