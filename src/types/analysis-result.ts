/**
 * Represents detailed analysis results of ping command output
 */
export interface PingAnalysisResult {
  // Basic packet statistics
  readonly totalPackets: number;
  readonly successfulPackets: number;
  readonly failedPackets: number;

  // Response time statistics (in milliseconds)
  readonly minSuccessTime: number | null;
  readonly minSuccessTimeHuman: string | null; // Human-readable format
  readonly maxSuccessTime: number | null;
  readonly maxSuccessTimeHuman: string | null; // Human-readable format
  readonly avgSuccessTime: number | null;
  readonly medianSuccessTime: number | null;
  readonly responseTimeStdDev: number | null;

  // Success/failure rates (0-100 percentage)
  readonly successRate: number; // Overall success rate
  readonly failureRate: number; // Overall failure rate
  readonly timeoutRate: number; // Timeout-specific rate
  readonly unreachableRate: number; // Unreachable-specific rate

  // Network quality metrics
  readonly packetLoss: number; // Percentage (0-100)
  readonly jitter: number | null; // Response time variance
  readonly consistency: number; // Stability score (0-100)

  // Streak analysis
  readonly longestSuccessStreak: number;
  readonly longestFailureStreak: number;
  readonly currentStreak: { type: "success" | "failure"; count: number };

  // Error categorization
  readonly timeouts: number;
  readonly unreachableHosts: number;
  readonly otherErrors: number;

  // Advanced metrics
  readonly responseTimes: ReadonlyArray<number>; // All successful response times
  readonly sequenceNumbers: ReadonlyArray<number>; // Detected sequence numbers
  readonly timeDistribution: ReadonlyMap<string, number>; // Response time ranges

  // Performance indicators
  readonly networkQualityScore: number; // Overall score (0-100)
  readonly networkQualityText: string; // Human-readable quality assessment
  readonly isStable: boolean; // Network stability assessment
  readonly recommendedAction: string; // Suggested next steps
}
