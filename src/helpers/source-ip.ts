/**
 * Extracts source IP address from a ping line
 */
export function extractSourceIp(line: string): string | null {
  const ipMatch = line.match(/(?:from|From)\s+([\d.]+)/);

  return ipMatch ? ipMatch[1] : null;
}
