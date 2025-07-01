import { parsePingLine } from "./parse-line";
// Types
import type { PingEntry } from "../types/entry";

/**
 * Parses ping output text into structured entries
 * Handles multiple platform formats:
 * - Linux/macOS: "64 bytes from 8.8.8.8: icmp_seq=6521 ttl=117 time=220.874 ms"
 * - Windows: "Reply from 8.8.8.8: bytes=32 time=1ms TTL=64"
 * - Timeouts: "Request timeout for icmp_seq 6511"
 */
export function parsePingOutput(output: string): PingEntry[] {
  const lines = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const entries: PingEntry[] = [];

  for (const line of lines) {
    const entry = parsePingLine(line);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}
