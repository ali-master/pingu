import { useEffect, useState } from "react";
import { spawn } from "child_process";
import { writeFileSync } from "fs";
import { analyzePingResult } from "../analyzer";
import type { PingEntry } from "../types/entry";
import { parsePingLine } from "../helpers/parse-line";
import { formatDuration } from "../utils/format-duration";
import { buildPingArgs } from "../utils/ping-command";

type UsePingOptions = {
  count?: number;
  interval?: number;
  timeout?: number;
  size?: number;
  export?: boolean;
};

type PingState = {
  entries: PingEntry[];
  isRunning: boolean;
  error: string | null;
  output: string;
  exportedFile?: string;
  startTime: Date;
};

export function usePing(host: string, options: UsePingOptions = {}) {
  const [state, setState] = useState<PingState>({
    entries: [],
    isRunning: true,
    error: null,
    output: "",
    startTime: new Date(),
  });

  const [duration, setDuration] = useState<string>("0s");

  // Update duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(state.startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.startTime]);

  useEffect(() => {
    const args = buildPingArgs(host, options);

    const pingProcess = spawn("ping", args);
    let outputBuffer = "";

    pingProcess.stdout.on("data", (data) => {
      const chunk = data.toString();
      outputBuffer += chunk;

      const lines = chunk.split("\\n");
      lines.forEach((line: string) => {
        if (line.trim()) {
          const entry = parsePingLine(line);
          if (entry) {
            setState((prev) => ({
              ...prev,
              entries: [...prev.entries, entry],
              output: outputBuffer,
            }));
          }
        }
      });
    });

    pingProcess.stderr.on("data", (data) => {
      const errorMessage = data.toString();

      // Check if this is a recoverable network error that should continue as failed pings
      const isRecoverableError =
        errorMessage.includes("No route to host") ||
        errorMessage.includes("Network is unreachable") ||
        errorMessage.includes("Host is down") ||
        errorMessage.includes("Request timeout") ||
        errorMessage.includes("Destination unreachable");

      if (isRecoverableError) {
        // Treat as a failed ping entry and continue
        const failedEntry: PingEntry = {
          sequenceNumber: null,
          responseTime: null,
          ttl: null,
          isSuccess: false,
          errorType:
            errorMessage.includes("No route to host") ||
            errorMessage.includes("Network is unreachable")
              ? ("unreachable" as const)
              : ("other" as const),
          sourceIp: null,
        };

        setState((prev) => ({
          ...prev,
          entries: [...prev.entries, failedEntry],
          output: prev.output + errorMessage,
        }));
      } else {
        // Fatal error - stop the ping process
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isRunning: false,
        }));
      }
    });

    pingProcess.on("close", () => {
      setState((prev) => {
        if (options.export && prev.entries.length > 0) {
          const analysis = analyzePingResult(prev.output);
          const exportData = {
            host,
            timestamp: new Date().toISOString(),
            duration: formatDuration(prev.startTime),
            options: {
              count: options.count,
              interval: options.interval,
              timeout: options.timeout,
              size: options.size,
            },
            summary: {
              totalPackets: prev.entries.length,
              successfulPackets: prev.entries.filter((e) => e.isSuccess).length,
              failedPackets: prev.entries.filter((e) => !e.isSuccess).length,
              successRate:
                (prev.entries.filter((e) => e.isSuccess).length / prev.entries.length) * 100,
            },
            analysis,
            entries: prev.entries,
          };

          const filename = `pingu-${host.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.json`;
          writeFileSync(filename, JSON.stringify(exportData, null, 2));

          return {
            ...prev,
            isRunning: false,
            exportedFile: filename,
          };
        }

        return {
          ...prev,
          isRunning: false,
        };
      });
    });

    // Handle Ctrl+C
    const handleExit = () => {
      pingProcess.kill();
      process.exit(0);
    };

    process.on("SIGINT", handleExit);
    process.on("SIGTERM", handleExit);

    return () => {
      pingProcess.kill();
      process.removeListener("SIGINT", handleExit);
      process.removeListener("SIGTERM", handleExit);
    };
  }, [host, options]);

  // Calculate metrics
  const successfulPings = state.entries.filter((e) => e.isSuccess).length;
  const totalPings = state.entries.length;
  const failedPings = totalPings - successfulPings;
  const successRate = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0;
  const errorRate = totalPings > 0 ? (failedPings / totalPings) * 100 : 0;
  const analysis = totalPings > 0 ? analyzePingResult(state.output) : null;

  return {
    ...state,
    duration,
    successfulPings,
    totalPings,
    failedPings,
    successRate,
    errorRate,
    analysis,
  };
}
