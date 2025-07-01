/**
 * Converts network quality score to human-readable text
 */
export function getNetworkQualityText(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";

  return "Critical";
}

export function calculateNetworkQuality(
  successRate: number,
  avgTime: number | null,
  jitter: number | null,
  consistency: number,
): number {
  // Weight factors for different metrics
  const weights = {
    successRate: 0.4,
    responseTime: 0.3,
    jitter: 0.2,
    consistency: 0.1,
  };

  // Success rate score (0-100)
  const successScore = successRate;

  // Response time score (inverse relationship - lower is better)
  const timeScore =
    avgTime !== null
      ? Math.max(0, 100 - Math.min(avgTime / 10, 100)) // 1000ms = 0 score
      : 0;

  // Jitter score (inverse relationship - lower is better)
  const jitterScore =
    jitter !== null
      ? Math.max(0, 100 - Math.min(jitter * 2, 100)) // 50ms jitter = 0 score
      : 100;

  const qualityScore =
    successScore * weights.successRate +
    timeScore * weights.responseTime +
    jitterScore * weights.jitter +
    consistency * weights.consistency;

  return Math.round(qualityScore * 100) / 100;
}
