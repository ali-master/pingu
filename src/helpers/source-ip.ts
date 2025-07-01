/**
 * Extracts source IP address from a ping line
 */
export function extractSourceIp(line: string): string | null {
  // Match IP addresses in parentheses first (domain name resolution)
  let ipMatch = line.match(/\(([\d.:a-f]+)\)/i);
  if (ipMatch) {
    return ipMatch[1];
  }

  // Match IPv4 addresses after "from"
  ipMatch = line.match(/(?:from|From)\s+([\d.]+)/);
  if (ipMatch) {
    return ipMatch[1];
  }

  // Match IPv6 addresses after "from" (more specific pattern)
  ipMatch = line.match(/(?:from|From)\s+([\da-f:]+:[\da-f:]*)/i);
  if (ipMatch) {
    return ipMatch[1];
  }

  return null;
}
