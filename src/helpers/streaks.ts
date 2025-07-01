// Types
import type { PingEntry } from "../types/entry";
/**
 * Analyzes success and failure streaks in ping responses
 */
export function analyzeStreaks(entries: PingEntry[]): {
  longestSuccess: number;
  longestFailure: number;
  current: { type: "success" | "failure"; count: number };
} {
  if (entries.length === 0) {
    return { longestSuccess: 0, longestFailure: 0, current: { type: "success", count: 0 } };
  }

  let longestSuccess = 0;
  let longestFailure = 0;
  let currentSuccessStreak = 0;
  let currentFailureStreak = 0;

  entries.forEach((entry) => {
    if (entry.isSuccess) {
      currentSuccessStreak++;
      longestSuccess = Math.max(longestSuccess, currentSuccessStreak);
      currentFailureStreak = 0;
    } else {
      currentFailureStreak++;
      longestFailure = Math.max(longestFailure, currentFailureStreak);
      currentSuccessStreak = 0;
    }
  });

  const lastEntry = entries[entries.length - 1];
  const current = lastEntry.isSuccess
    ? { type: "success" as const, count: currentSuccessStreak }
    : { type: "failure" as const, count: currentFailureStreak };

  return { longestSuccess, longestFailure, current };
}
