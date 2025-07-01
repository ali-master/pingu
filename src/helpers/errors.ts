// Types
import type { PingEntry } from "../types/entry";
/**
 * Categorizes different types of ping failures
 */
export function categorizeErrors(entries: PingEntry[]): {
  timeouts: number;
  unreachable: number;
  other: number;
} {
  const stats = { timeouts: 0, unreachable: 0, other: 0 };

  entries.forEach((entry) => {
    if (!entry.isSuccess) {
      switch (entry.errorType) {
        case "timeout":
          stats.timeouts++;
          break;
        case "unreachable":
          stats.unreachable++;
          break;
        default:
          stats.other++;
      }
    }
  });

  return stats;
}
