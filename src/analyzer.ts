import type { PingAnalysisOptions } from "./types/options";
import type { PingAnalysisResult } from "./types/analysis-result";
import { calculateTimeStatistics } from "./helpers/calculate-time-statistics";
import { categorizeErrors } from "./helpers/errors";
import { analyzeStreaks } from "./helpers/streaks";
import { calculateJitter } from "./helpers/jitter";
import { calculateConsistency } from "./helpers/consistency";
import { createTimeDistribution } from "./helpers/time-distribution";
import { calculateNetworkQuality, getNetworkQualityText } from "./helpers/network-quality";
import { generateRecommendation } from "./helpers/recommendations";
import { formatTimeHuman } from "./helpers/format-time";
import { parsePingOutput } from "./helpers/parse-output";

/**
 * Cross-platform ping command result analyzer
 *
 * Parses ping output from Windows, Linux, and macOS systems to extract
 * comprehensive network performance metrics and provide actionable insights.
 *
 * Process Flow:
 * ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
 * │   Raw Ping      │───▶│   Parse Lines    │───▶│  Extract Data   │
 * │   Output        │    │   Multi-platform │    │   Structures    │
 * └─────────────────┘    └──────────────────┘    └─────────────────┘
 *          │                       │                       │
 *          ▼                       ▼                       ▼
 * ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
 * │  Categorize     │    │  Calculate       │    │  Generate       │
 * │  Responses      │───▶│  Statistics      │───▶│  Insights       │
 * └─────────────────┘    └──────────────────┘    └─────────────────┘
 */
export function analyzePingResult(
  pingOutput: string,
  options: PingAnalysisOptions = {},
): PingAnalysisResult {
  const { timeoutThreshold = 1000, jitterThreshold = 50, stabilityThreshold = 95 } = options;

  // Parse the ping output into structured entries
  const entries = parsePingOutput(pingOutput);

  // Extract successful response times and calculate basic statistics
  const responseTimes = entries
    .filter((entry: any) => entry.isSuccess && entry.responseTime !== null)
    .map((entry: any) => entry.responseTime!);

  const sequenceNumbers = entries
    .map((entry: any) => entry.sequenceNumber)
    .filter((seq: any): seq is number => seq !== null);

  // Calculate basic metrics
  const totalPackets = entries.length;
  const successfulPackets = responseTimes.length;
  const failedPackets = totalPackets - successfulPackets;

  // Response time statistics
  const timeStats = calculateTimeStatistics(responseTimes);

  // Error categorization
  const errorStats = categorizeErrors(entries);

  // Streak analysis
  const streakStats = analyzeStreaks(entries);

  // Advanced metrics
  const jitter = calculateJitter(responseTimes);
  const consistency = calculateConsistency(responseTimes, jitterThreshold);
  const timeDistribution = createTimeDistribution(responseTimes);

  // Performance scoring
  const networkQualityScore = calculateNetworkQuality(
    (successfulPackets / totalPackets) * 100,
    timeStats.avg,
    jitter,
    consistency,
  );

  const networkQualityText = getNetworkQualityText(networkQualityScore);

  // Improved stability calculation considering multiple factors
  const packetLossRate = (failedPackets / totalPackets) * 100;
  const isStable =
    packetLossRate <= 5 && // Less than 5% packet loss
    (consistency >= 60 || (jitter !== null && jitter <= 100)) && // Reasonable consistency OR low jitter
    streakStats.longestFailure <= Math.max(2, totalPackets * 0.1); // Failure streaks are short

  const recommendedAction = generateRecommendation(networkQualityScore, isStable, errorStats);

  // Calculate specific rates
  const successRate = totalPackets > 0 ? (successfulPackets / totalPackets) * 100 : 0;
  const failureRate = totalPackets > 0 ? (failedPackets / totalPackets) * 100 : 0;
  const timeoutRate = totalPackets > 0 ? (errorStats.timeouts / totalPackets) * 100 : 0;
  const unreachableRate = totalPackets > 0 ? (errorStats.unreachable / totalPackets) * 100 : 0;

  return {
    totalPackets,
    successfulPackets,
    failedPackets,
    minSuccessTime: timeStats.min,
    minSuccessTimeHuman: formatTimeHuman(timeStats.min),
    maxSuccessTime: timeStats.max,
    maxSuccessTimeHuman: formatTimeHuman(timeStats.max),
    avgSuccessTime: timeStats.avg,
    medianSuccessTime: timeStats.median,
    responseTimeStdDev: timeStats.stdDev,
    successRate,
    failureRate,
    timeoutRate,
    unreachableRate,
    packetLoss: failureRate,
    jitter,
    consistency,
    longestSuccessStreak: streakStats.longestSuccess,
    longestFailureStreak: streakStats.longestFailure,
    currentStreak: streakStats.current,
    timeouts: errorStats.timeouts,
    unreachableHosts: errorStats.unreachable,
    otherErrors: errorStats.other,
    responseTimes: Object.freeze([...responseTimes]),
    sequenceNumbers: Object.freeze([...sequenceNumbers]),
    timeDistribution,
    networkQualityScore,
    networkQualityText,
    isStable,
    recommendedAction,
  };
}
