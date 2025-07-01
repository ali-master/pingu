import { calculateJitter } from "./jitter";

/**
 * Calculates network consistency score (0-100)
 */
export function calculateConsistency(times: number[], jitterThreshold: number): number {
  if (times.length === 0) return 0;

  const jitter = calculateJitter(times);
  if (jitter === null) return 100;

  // Consistency decreases as jitter increases
  const consistencyScore = Math.max(0, 100 - (jitter / jitterThreshold) * 100);
  return Math.round(consistencyScore * 100) / 100;
}
