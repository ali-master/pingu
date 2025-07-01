import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { Spinner, StatusMessage, Badge, Alert } from "@inkjs/ui";
import { spawn } from "child_process";
import { writeFileSync } from "fs";
import { analyzePingResult } from "./analyzer";
import type { PingEntry } from "./types/entry";
import { parsePingLine } from "./helpers/parse-line";
import { SectionHeader } from "./components/section-header";
import { MetricRow } from "./components/metric-row";
import { QualityIndicator } from "./components/quality-indicator";
import { StreakDisplay } from "./components/streak-display";
import { LiveFeedEntry } from "./components/live-feed-entry";
import { DualProgressBars } from "./components/dual-progress-bars";
import { MetricsGrid } from "./components/metrics-grid";
import { useResponsiveLayout } from "./hooks/use-responsive-layout";
import { formatDuration } from "./utils/format-duration";
import { buildPingArgs } from "./utils/ping-command";

type Props = {
  host: string;
  options: {
    count?: number;
    interval?: number;
    timeout?: number;
    size?: number;
    export?: boolean;
  };
};

type PingState = {
  entries: PingEntry[];
  isRunning: boolean;
  error: string | null;
  output: string;
  exportedFile?: string;
  startTime: Date;
};

export default function App({ host, options }: Props) {
  const [state, setState] = useState<PingState>({
    entries: [],
    isRunning: true,
    error: null,
    output: "",
    startTime: new Date(),
  });

  const [duration, setDuration] = useState<string>("0s");
  const layout = useResponsiveLayout();

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

      const lines = chunk.split("\n");
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
      setState((prev) => ({
        ...prev,
        error: data.toString(),
        isRunning: false,
      }));
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

  if (state.error) {
    return (
      <Box flexDirection="column" gap={1}>
        <Alert variant="error">
          🚨 Error pinging {host}: {state.error}
        </Alert>
      </Box>
    );
  }

  const successfulPings = state.entries.filter((e) => e.isSuccess).length;
  const totalPings = state.entries.length;
  const failedPings = totalPings - successfulPings;
  const successRate = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0;
  const errorRate = totalPings > 0 ? (failedPings / totalPings) * 100 : 0;
  const analysis = totalPings > 0 ? analyzePingResult(state.output) : null;

  // Responsive content based on terminal width
  const maxLiveFeedEntries = layout.isNarrow ? 3 : layout.isMedium ? 5 : 8;
  const compactMode = layout.isNarrow;

  return (
    <Box flexDirection="column" gap={layout.isNarrow ? 0 : 1}>
      {/* Enhanced Header Section with Duration */}
      <Box
        justifyContent="space-between"
        alignItems="center"
        flexWrap={layout.isNarrow ? "wrap" : "nowrap"}
      >
        <Box gap={layout.isNarrow ? 1 : 2} alignItems="center" flexWrap="wrap">
          <Text bold color="cyan">
            {compactMode ? "🐧" : "🐧 PINGU"}
          </Text>
          {!compactMode && <Text color="gray">→</Text>}
          <Text bold color="white">
            {compactMode ? host.slice(0, 15) : host}
          </Text>
          {state.isRunning && <Spinner label={compactMode ? "" : "Running"} />}
          {!state.isRunning && <Badge color="green">{compactMode ? "✅" : "✅ Complete"}</Badge>}
        </Box>
        <Box gap={1} alignItems="center">
          <Text color="gray">⏱️</Text>
          <Text bold color="cyan">
            {duration}
          </Text>
        </Box>
      </Box>

      {/* Enhanced Live Feed Section */}
      <SectionHeader title="Live Feed" icon="📡" compact={compactMode} />
      <Box
        flexDirection="column"
        gap={0}
        paddingLeft={compactMode ? 1 : 2}
        borderStyle={layout.isNarrow ? "single" : "round"}
        borderColor="gray"
      >
        {state.entries.length === 0 && state.isRunning && (
          <Box paddingY={1}>
            <Text color="gray" italic>
              {compactMode ? "Waiting..." : "Waiting for ping responses..."}
            </Text>
          </Box>
        )}

        {state.entries.slice(-maxLiveFeedEntries).map((entry, index) => (
          <LiveFeedEntry key={index} entry={entry} index={index} compact={compactMode} />
        ))}

        {state.entries.length > maxLiveFeedEntries && (
          <Box marginTop={1}>
            <Text color="gray" italic>
              {compactMode
                ? `... +${state.entries.length - maxLiveFeedEntries}`
                : `... and ${state.entries.length - maxLiveFeedEntries} more responses`}
            </Text>
          </Box>
        )}
      </Box>

      {/* Statistics Dashboard */}
      {totalPings > 0 && analysis && (
        <>
          {/* Quick Stats */}
          <SectionHeader
            title={compactMode ? "Stats" : "Quick Statistics"}
            icon="📊"
            compact={compactMode}
          />
          <Box paddingLeft={compactMode ? 1 : 2}>
            <MetricsGrid layout={layout}>
              <MetricRow
                label="Total Packets"
                value={analysis.totalPackets}
                width={layout.contentWidth}
                compact={compactMode}
              />
              <MetricRow
                label="Successful"
                value={analysis.successfulPackets}
                color="green"
                width={layout.contentWidth}
                compact={compactMode}
              />
              <MetricRow
                label="Failed"
                value={analysis.failedPackets}
                color="red"
                width={layout.contentWidth}
                compact={compactMode}
              />
              <MetricRow
                label="Packet Loss"
                value={analysis.packetLoss.toFixed(1)}
                unit="%"
                color="red"
                width={layout.contentWidth}
                compact={compactMode}
              />
            </MetricsGrid>
          </Box>

          {/* Enhanced Dual Progress Bars */}
          <SectionHeader
            title={compactMode ? "Performance" : "Performance Overview"}
            icon="📈"
            compact={compactMode}
          />
          <Box paddingLeft={compactMode ? 1 : 2}>
            <DualProgressBars successRate={successRate} errorRate={errorRate} layout={layout} />
          </Box>

          {/* Fixed Network Quality Assessment */}
          <SectionHeader
            title={compactMode ? "Quality" : "Network Quality"}
            icon="🌐"
            compact={compactMode}
          />
          <Box flexDirection="column" gap={0} paddingLeft={compactMode ? 1 : 2}>
            <QualityIndicator
              score={analysis.networkQualityScore}
              label={analysis.networkQualityText}
              compact={compactMode}
            />
            <Box marginTop={1}>
              <MetricRow
                label="Stability"
                value={analysis.isStable ? "Stable" : "Unstable"}
                color={analysis.isStable ? "green" : "red"}
                width={layout.contentWidth}
                compact={compactMode}
              />
            </Box>
            <Box marginTop={0}>
              <MetricRow
                label="Consistency"
                value={analysis.consistency.toFixed(1)}
                unit="/100"
                color={
                  analysis.consistency >= 80
                    ? "green"
                    : analysis.consistency >= 60
                      ? "yellow"
                      : "red"
                }
                width={layout.contentWidth}
                compact={compactMode}
              />
            </Box>
          </Box>

          {/* Response Time Analysis */}
          {analysis.avgSuccessTime !== null && analysis.avgSuccessTime > 0 && (
            <>
              <SectionHeader
                title={compactMode ? "Response Times" : "Response Time Analysis"}
                icon="⏱️"
                compact={compactMode}
              />
              <Box paddingLeft={compactMode ? 1 : 2}>
                <MetricsGrid layout={layout}>
                  <MetricRow
                    label="Minimum"
                    value={analysis.minSuccessTimeHuman || "N/A"}
                    color="green"
                    width={layout.contentWidth}
                    compact={compactMode}
                  />
                  <MetricRow
                    label="Average"
                    value={analysis.avgSuccessTime.toFixed(1)}
                    unit="ms"
                    color="cyan"
                    width={layout.contentWidth}
                    compact={compactMode}
                  />
                  <MetricRow
                    label="Maximum"
                    value={analysis.maxSuccessTimeHuman || "N/A"}
                    color="yellow"
                    width={layout.contentWidth}
                    compact={compactMode}
                  />
                  <MetricRow
                    label="Median"
                    value={analysis.medianSuccessTime?.toFixed(1) || "N/A"}
                    unit="ms"
                    width={layout.contentWidth}
                    compact={compactMode}
                  />
                  <MetricRow
                    label={compactMode ? "Std Dev" : "Std Deviation"}
                    value={analysis.responseTimeStdDev?.toFixed(1) || "N/A"}
                    unit="ms"
                    width={layout.contentWidth}
                    compact={compactMode}
                  />
                  <MetricRow
                    label="Jitter"
                    value={analysis.jitter?.toFixed(1) || "0.0"}
                    unit="ms"
                    color={
                      analysis.jitter && analysis.jitter > 50
                        ? "red"
                        : analysis.jitter && analysis.jitter > 20
                          ? "yellow"
                          : "green"
                    }
                    width={layout.contentWidth}
                    compact={compactMode}
                  />
                </MetricsGrid>
              </Box>
            </>
          )}

          {/* Error Analysis - Only show if there are errors and not in compact mode */}
          {!compactMode &&
            (analysis.timeouts > 0 ||
              analysis.unreachableHosts > 0 ||
              analysis.otherErrors > 0) && (
              <>
                <SectionHeader title="Error Analysis" icon="🚨" />
                <Box flexDirection="column" gap={0} paddingLeft={2}>
                  {analysis.timeouts > 0 && (
                    <MetricRow
                      label="Timeouts"
                      value={analysis.timeouts}
                      color="red"
                      width={layout.contentWidth}
                    />
                  )}
                  {analysis.unreachableHosts > 0 && (
                    <MetricRow
                      label="Unreachable"
                      value={analysis.unreachableHosts}
                      color="red"
                      width={layout.contentWidth}
                    />
                  )}
                  {analysis.otherErrors > 0 && (
                    <MetricRow
                      label="Other Errors"
                      value={analysis.otherErrors}
                      color="red"
                      width={layout.contentWidth}
                    />
                  )}
                  <MetricRow
                    label="Timeout Rate"
                    value={analysis.timeoutRate.toFixed(1)}
                    unit="%"
                    color="red"
                    width={layout.contentWidth}
                  />
                  <MetricRow
                    label="Unreachable Rate"
                    value={analysis.unreachableRate.toFixed(1)}
                    unit="%"
                    color="red"
                    width={layout.contentWidth}
                  />
                </Box>
              </>
            )}

          {/* Streak Analysis */}
          <SectionHeader
            title={compactMode ? "Streaks" : "Streak Analysis"}
            icon="🔥"
            compact={compactMode}
          />
          <Box flexDirection="column" gap={0} paddingLeft={compactMode ? 1 : 2}>
            <StreakDisplay streak={analysis.currentStreak} compact={compactMode} />
            <MetricRow
              label={compactMode ? "Best" : "Longest Success"}
              value={analysis.longestSuccessStreak}
              color="green"
              width={layout.contentWidth}
              compact={compactMode}
            />
            <MetricRow
              label={compactMode ? "Worst" : "Longest Failure"}
              value={analysis.longestFailureStreak}
              color="red"
              width={layout.contentWidth}
              compact={compactMode}
            />
          </Box>

          {/* Advanced Metrics - Only show on wider screens */}
          {!compactMode && (
            <>
              <SectionHeader title="Advanced Metrics" icon="🔬" />
              <Box flexDirection="column" gap={0} paddingLeft={2}>
                <MetricRow
                  label="Response Samples"
                  value={analysis.responseTimes.length}
                  width={layout.contentWidth}
                />
                <MetricRow
                  label="Sequence Numbers"
                  value={analysis.sequenceNumbers.length}
                  width={layout.contentWidth}
                />

                {/* Time Distribution - Only on wide screens */}
                {layout.isWide && analysis.timeDistribution.size > 0 && (
                  <Box marginTop={1}>
                    <Text color="gray">Response Time Distribution:</Text>
                    <Box flexDirection="column" paddingLeft={2}>
                      {Array.from(analysis.timeDistribution.entries()).map(([range, count]) => (
                        <Box
                          key={range}
                          justifyContent="space-between"
                          width={Math.min(50, layout.contentWidth)}
                        >
                          <Text color="gray">{range}:</Text>
                          <Text color="cyan">{count} packets</Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Recommendations */}
          {analysis.recommendedAction && (
            <>
              <SectionHeader
                title={compactMode ? "Tips" : "Recommendations"}
                icon="💡"
                compact={compactMode}
              />
              <Box paddingLeft={compactMode ? 1 : 2}>
                <Alert variant="info">
                  {compactMode && analysis.recommendedAction.length > 60
                    ? analysis.recommendedAction.slice(0, 60) + "..."
                    : analysis.recommendedAction}
                </Alert>
              </Box>
            </>
          )}
        </>
      )}

      {/* No Data State */}
      {!state.isRunning && totalPings === 0 && (
        <Box marginTop={compactMode ? 0 : 2}>
          <StatusMessage variant="warning">
            {compactMode ? "🔍 No responses" : `🔍 No ping responses received from ${host}`}
          </StatusMessage>
        </Box>
      )}

      {/* Export Confirmation */}
      {state.exportedFile && (
        <Box marginTop={1}>
          <StatusMessage variant="success">
            {compactMode ? "💾 Exported" : `💾 Results exported to ${state.exportedFile}`}
          </StatusMessage>
        </Box>
      )}
    </Box>
  );
}
