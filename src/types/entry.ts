/**
 * Represents a parsed ping result entry
 */
export interface PingEntry {
  readonly sequenceNumber: number | null;
  readonly responseTime: number | null;
  readonly isSuccess: boolean;
  readonly errorType: "timeout" | "unreachable" | "other" | null;
  readonly ttl: number | null;
  readonly sourceIp: string | null;
}
