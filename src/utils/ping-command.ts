export interface PingOptions {
  count?: number;
  interval?: number;
  timeout?: number;
  size?: number;
}

export const buildPingArgs = (host: string, options: PingOptions): string[] => {
  const args: string[] = [];

  // Build ping command args based on OS
  const isWindows = process.platform === "win32";
  const isMac = process.platform === "darwin";

  if (isWindows) {
    if (options.count !== undefined) args.push("-n", options.count.toString());
    else args.push("-t"); // Continuous ping
    if (options.timeout !== undefined) args.push("-w", (options.timeout * 1000).toString());
    if (options.size !== undefined) args.push("-l", options.size.toString());
  } else {
    if (options.count !== undefined) args.push("-c", options.count.toString());
    if (options.interval !== undefined) args.push("-i", options.interval.toString());
    if (options.timeout !== undefined) {
      if (isMac) args.push("-W", (options.timeout * 1000).toString());
      else args.push("-W", options.timeout.toString());
    }
    if (options.size !== undefined) args.push("-s", options.size.toString());
  }

  args.push(host);
  return args;
};
