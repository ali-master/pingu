/**
 * Generates actionable recommendations based on analysis
 */
export function generateRecommendation(
  qualityScore: number,
  isStable: boolean,
  errorStats: { timeouts: number; unreachable: number; other: number },
): string {
  if (qualityScore >= 90 && isStable) {
    return "Excellent network performance. No action required.";
  }

  if (qualityScore >= 70) {
    return isStable
      ? "Good network performance with minor optimization opportunities."
      : "Network performance is good but shows some instability. Monitor for patterns.";
  }

  if (errorStats.unreachable > errorStats.timeouts) {
    return "High unreachable host errors detected. Check routing and firewall configurations.";
  }

  if (errorStats.timeouts > 0) {
    return "Frequent timeouts detected. Investigate network congestion and connection stability.";
  }

  return "Network performance issues detected. Consider checking connection quality and network infrastructure.";
}
