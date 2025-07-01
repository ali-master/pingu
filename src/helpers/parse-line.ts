// Utilities
import { extractSourceIp } from "./source-ip";
// Types
import type { PingEntry } from "../types/entry";

/**
 * Parses a single ping output line into a structured entry
 */
export function parsePingLine(line: string): PingEntry | null {
  // Skip non-ping related lines (headers, summaries, etc.)
  if (isNonPingLine(line)) {
    return null;
  }

  // Handle timeout cases
  if (line.toLowerCase().includes("timeout")) {
    const seqMatch = line.match(/icmp_seq[=\s]+(\d+)/i);
    return {
      sequenceNumber: seqMatch ? parseInt(seqMatch[1], 10) : null,
      responseTime: null,
      isSuccess: false,
      errorType: "timeout",
      ttl: null,
      sourceIp: null,
    };
  }

  // Handle unreachable cases
  if (line.toLowerCase().includes("unreachable")) {
    return {
      sequenceNumber: null,
      responseTime: null,
      isSuccess: false,
      errorType: "unreachable",
      ttl: null,
      sourceIp: extractSourceIp(line),
    };
  }

  // Handle successful pings - multiple formats
  const successMatch = parseSuccessfulPing(line);
  if (successMatch) {
    return {
      sequenceNumber: successMatch.sequence,
      responseTime: successMatch.time,
      isSuccess: true,
      errorType: null,
      ttl: successMatch.ttl,
      sourceIp: successMatch.sourceIp,
    };
  }

  return null;
}

/**
 * Determines if a line should be skipped (headers, summaries, etc.)
 */
function isNonPingLine(line: string): boolean {
  const skipPatterns = [
    /^PING\s.*\s+data$|^PING\s.*\s+bytes$/i, // Header lines that end with "data" or "bytes" (not response lines)
    /^---.*ping\s+statistics/i,
    /^\d+\s+packets\s+transmitted/i,
    /^round-trip/i,
    /^rtt/i,
    /^Vr\s+HL\s+TOS/i, // Header lines in unreachable messages
    /^\s*\d+\s+\d+\s+\d+\s+\d+/i, // Data dump lines (hex dumps)
    /^$/,
    /^\s*$/,
    /^\^C$/, // Control-C interrupt signal
  ];

  // Don't skip lines that contain time measurements even if they start with PING
  if (line.match(/time[=<]?\s*[\d.]+\s*ms/i)) {
    return false;
  }

  return skipPatterns.some((pattern) => pattern.test(line));
}

/**
 * Parses successful ping responses across different platforms
 */
function parseSuccessfulPing(line: string): {
  sequence: number | null;
  time: number;
  ttl: number | null;
  sourceIp: string | null;
} | null {
  // Unix/Linux format: "64 bytes from 8.8.8.8: icmp_seq=6521 ttl=117 time=220.874 ms"
  // Also handles IPv6: "64 bytes from 2001:4860:4860::8888: icmp_seq=1 ttl=117 time=25.123 ms"
  const unixMatch = line.match(
    /(\d+)\s+bytes\s+from\s+([\d.:a-f]+):\s+icmp_seq[=:](\d+)\s+ttl[=:](\d+)\s+time[=:]\s*([\d.]+)\s*ms/i,
  );

  if (unixMatch) {
    return {
      sequence: parseInt(unixMatch[3], 10),
      time: parseFloat(unixMatch[5]),
      ttl: parseInt(unixMatch[4], 10),
      sourceIp: unixMatch[2],
    };
  }

  // Windows format: "Reply from 8.8.8.8: bytes=32 time=1ms TTL=64"
  const windowsMatch = line.match(
    /Reply\s+from\s+([\d.]+):\s+bytes=\d+\s+time[=<](\d+)ms\s+TTL=(\d+)/i,
  );

  if (windowsMatch) {
    return {
      sequence: null, // Windows doesn't typically show sequence in this format
      time: parseInt(windowsMatch[2], 10),
      ttl: parseInt(windowsMatch[3], 10),
      sourceIp: windowsMatch[1],
    };
  }

  // Alternative time extraction for various formats
  const timeMatch = line.match(/time[=<:]?\s*([\d.]+)\s*ms/i);
  if (timeMatch) {
    const sourceIp = extractSourceIp(line);
    const ttlMatch = line.match(/ttl[=:]\s*(\d+)/i);
    const seqMatch = line.match(/(?:icmp_)?seq[=:]\s*(\d+)/i);

    return {
      sequence: seqMatch ? parseInt(seqMatch[1], 10) : null,
      time: parseFloat(timeMatch[1]),
      ttl: ttlMatch ? parseInt(ttlMatch[1], 10) : null,
      sourceIp,
    };
  }

  return null;
}
