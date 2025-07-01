import React from "react";
import { Box, Text } from "ink";
import { Spinner, Badge, Alert } from "@inkjs/ui";
import gradient from "gradient-string";
import { MetricRow } from "./components/metric-row";
import { LiveFeedEntry } from "./components/live-feed-entry";
import { LineChart } from "./components/line-chart";
import { useResponsiveLayout } from "./hooks/use-responsive-layout";
import { usePing } from "./hooks/use-ping";

// Modern gradients for the app
const headerGradient = gradient(["#6366f1", "#8b5cf6"]);
const successGradient = gradient(["#10b981", "#059669"]);
const errorGradient = gradient(["#ef4444", "#dc2626"]);
const metricGradient = gradient(["#06b6d4", "#0891b2"]);

type Props = {
  host: string;
  options: {
    count?: number;
    display?: number;
    chart?: boolean;
    interval?: number;
    timeout?: number;
    size?: number;
    export?: boolean;
  };
};

export default function App({ host, options }: Props) {
  const ping = usePing(host, options);
  const layout = useResponsiveLayout();

  if (ping.error) {
    return (
      <Box flexDirection="column" gap={1}>
        <Alert variant="error">
          🚨 Error pinging {host}: {ping.error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      {/* Enhanced Header with more info */}
      <Box justifyContent="space-between" alignItems="center" paddingY={1}>
        <Box gap={2} alignItems="center">
          <Text>{headerGradient("🐧 PINGU")}</Text>
          <Text bold color="white">
            {host.length > 25 ? host.slice(0, 25) + "..." : host}
          </Text>
          {ping.isRunning && <Spinner />}
          {!ping.isRunning && <Badge color="green">COMPLETE</Badge>}
        </Box>
        <Box gap={2} alignItems="center">
          <Text color="gray">Duration:</Text>
          <Text>{metricGradient(ping.duration)}</Text>
          {ping.totalPings > 0 && (
            <Box gap={1} alignItems="center">
              <Text color="gray">|</Text>
              <Text color="white">{ping.totalPings} packets</Text>
              {ping.analysis && (
                <>
                  <Text color="gray">|</Text>
                  <Text
                    color={
                      ping.successRate >= 95 ? "green" : ping.successRate >= 80 ? "yellow" : "red"
                    }
                  >
                    {ping.successRate.toFixed(1)}% success
                  </Text>
                  <Text color="gray">|</Text>
                  <Text color="red">{ping.errorRate.toFixed(1)}% error</Text>
                  <Text color="gray">|</Text>
                  <Text color="cyan">
                    {ping.totalPings > 1
                      ? (
                          (new Date().getTime() - ping.startTime.getTime()) /
                          (ping.totalPings - 1) /
                          1000
                        ).toFixed(1)
                      : "N/A"}
                    s avg
                  </Text>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Live Feed Section with padding */}
      {ping.entries.length === 0 && ping.isRunning ? (
        <Box paddingY={1}>
          <Text color="gray" italic>
            Waiting for ping responses...
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column" gap={0} marginY={1}>
          {/* Show more recent pings */}
          {ping.entries.slice(-(options.display ?? 8)).map((entry, index) => (
            <LiveFeedEntry key={index} entry={entry} index={index} compact={false} />
          ))}

          {/* Chart with margins */}
          {ping.totalPings > 0 && options.chart && (
            <Box marginY={1}>
              <LineChart entries={ping.entries} layout={layout} />
            </Box>
          )}

          {/* Additional entries indicator */}
          {ping.entries.length > (options.display ?? 8) && (
            <Box marginTop={1}>
              <Text color="gray" dimColor>
                +{ping.entries.length - (options.display ?? 8)} more responses
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Enhanced Statistics with proper spacing */}
      {ping.totalPings > 0 && ping.analysis && (
        <Box flexDirection="column" gap={1} paddingY={1}>
          {/* Essential Stats with text labels */}
          <Box
            flexDirection="column"
            gap={1}
            marginBottom={2}
            padding={1}
            borderStyle="single"
            borderColor="gray"
          >
            {/* Primary Stats Row */}
            <Box>
              <Box width="33%" minWidth={25} maxWidth={35} paddingRight={1}>
                <Text color="gray">
                  Success: <Text>{successGradient(`${ping.successfulPings} packets`)}</Text>
                </Text>
              </Box>
              <Box width="33%" minWidth={25} maxWidth={35} paddingX={1}>
                <Text color="gray">
                  Failed: <Text>{errorGradient(`${ping.failedPings} packets`)}</Text>
                </Text>
              </Box>
              <Box width="34%" minWidth={25} maxWidth={35} paddingLeft={1}>
                <Text color="gray">
                  Rate:{" "}
                  <Text
                    color={
                      ping.successRate >= 95 ? "green" : ping.successRate >= 80 ? "yellow" : "red"
                    }
                  >
                    {ping.successRate.toFixed(1)}%
                  </Text>
                </Text>
              </Box>
            </Box>

            {/* Performance Stats Row */}
            <Box>
              <Box width="50%">
                <Text color="gray">
                  Avg Response:{" "}
                  <Text>{metricGradient(`${ping.analysis.avgSuccessTime?.toFixed(1)}ms`)}</Text>
                </Text>
              </Box>
              <Box width="50%">
                <Text color="gray">
                  Quality:{" "}
                  <Text
                    color={
                      ping.analysis.networkQualityScore >= 80
                        ? "green"
                        : ping.analysis.networkQualityScore >= 60
                          ? "yellow"
                          : "red"
                    }
                  >
                    {ping.analysis.networkQualityText} (
                    {ping.analysis.networkQualityScore.toFixed(1)}/100)
                  </Text>
                </Text>
              </Box>
            </Box>

            {/* Additional Info Row */}
            <Box>
              <Box width="33%">
                <Text color="gray">
                  Packet Loss: <Text color="red">{ping.analysis.packetLoss.toFixed(2)}%</Text>
                </Text>
              </Box>
              <Box width="33%">
                <Text color="gray">
                  Current Streak:{" "}
                  <Text color={ping.analysis.currentStreak.type === "success" ? "green" : "red"}>
                    {ping.analysis.currentStreak.count}{" "}
                    {ping.analysis.currentStreak.type === "success" ? "successes" : "failures"}
                  </Text>
                </Text>
              </Box>
              <Box width="34%">
                <Text color="gray">
                  Duration: <Text color="cyan">{ping.duration}</Text>
                </Text>
              </Box>
            </Box>

            {/* Success/Error Rate Table */}
            <Box marginTop={1}>
              <Box width="50%">
                <Text color="gray">
                  Success Rate: <Text color="green">{ping.successRate.toFixed(1)}%</Text>
                </Text>
              </Box>
              <Box width="50%">
                <Text color="gray">
                  Error Rate: <Text color="red">{ping.errorRate.toFixed(1)}%</Text>
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Detailed Metrics Section */}
          <Box flexDirection="column" gap={1} padding={1} borderStyle="single" borderColor="blue">
            <Text bold color="cyan">
              Network Performance Details:
            </Text>

            {/* Response Time Stats */}
            <Box flexDirection="column" gap={0} marginTop={1}>
              <Text color="gray" bold>
                Response Time Statistics:
              </Text>
              <Box gap={3} alignItems="center" flexWrap="wrap" marginTop={1} paddingLeft={1}>
                <Text color="gray">
                  Min Response:{" "}
                  <Text color="green">{ping.analysis.minSuccessTimeHuman || "N/A"}</Text>
                </Text>
                <Text color="gray">
                  Max Response:{" "}
                  <Text color="yellow">{ping.analysis.maxSuccessTimeHuman || "N/A"}</Text>
                </Text>
                <Text color="gray">
                  Median:{" "}
                  <Text color="cyan">{ping.analysis.medianSuccessTime?.toFixed(2) || "N/A"}ms</Text>
                </Text>
              </Box>
              <Box gap={3} alignItems="center" flexWrap="wrap" marginTop={1} paddingLeft={1}>
                <Text color="gray">
                  Std Deviation:{" "}
                  <Text color="magenta">
                    {ping.analysis.responseTimeStdDev?.toFixed(2) || "N/A"}ms
                  </Text>
                </Text>
                <Text color="gray">
                  Jitter:{" "}
                  <Text
                    color={
                      (ping.analysis.jitter || 0) > 50
                        ? "red"
                        : (ping.analysis.jitter || 0) > 20
                          ? "yellow"
                          : "green"
                    }
                  >
                    {ping.analysis.jitter?.toFixed(2) || "0.00"}ms
                  </Text>
                </Text>
                <Text color="gray">
                  Consistency:{" "}
                  <Text
                    color={
                      ping.analysis.consistency >= 70
                        ? "green"
                        : ping.analysis.consistency >= 40
                          ? "yellow"
                          : ping.analysis.consistency >= 20
                            ? "magenta"
                            : "red"
                    }
                  >
                    {ping.analysis.consistency.toFixed(1)}/100
                  </Text>
                </Text>
              </Box>
            </Box>

            {/* Connection Analysis */}
            <Box flexDirection="column" gap={0} marginTop={1}>
              <Text color="gray" bold>
                Connection Analysis:
              </Text>
              <Box gap={3} alignItems="center" flexWrap="wrap" marginTop={1} paddingLeft={1}>
                <Text color="gray">
                  Stability:{" "}
                  <Text color={ping.analysis.isStable ? "green" : "red"}>
                    {ping.analysis.isStable ? "Network Stable" : "Network Unstable"}
                  </Text>
                </Text>
                <Text color="gray">
                  Best Streak:{" "}
                  <Text color="green">{ping.analysis.longestSuccessStreak} successes</Text>
                </Text>
                <Text color="gray">
                  Worst Streak:{" "}
                  <Text color="red">{ping.analysis.longestFailureStreak} failures</Text>
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Error Analysis (if there are errors) */}
          {(ping.analysis.timeouts > 0 || ping.analysis.unreachableHosts > 0) && (
            <Box marginTop={1} gap={3} alignItems="center" flexWrap="wrap">
              {ping.analysis.timeouts > 0 && (
                <Text color="gray">
                  Timeouts: <Text color="red">{ping.analysis.timeouts}</Text>
                </Text>
              )}
              {ping.analysis.unreachableHosts > 0 && (
                <Text color="gray">
                  Unreachable: <Text color="red">{ping.analysis.unreachableHosts}</Text>
                </Text>
              )}
              <Text color="gray">
                Timeout Rate: <Text color="red">{ping.analysis.timeoutRate.toFixed(1)}%</Text>
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Advanced Full Report - Show when completed */}
      {!ping.isRunning && ping.totalPings > 0 && ping.analysis && (
        <Box
          flexDirection="column"
          gap={1}
          marginTop={2}
          padding={1}
          borderStyle="round"
          borderColor="gray"
        >
          <Text bold>{headerGradient("COMPREHENSIVE NETWORK ANALYSIS REPORT")}</Text>

          {/* Summary Statistics */}
          <Box flexDirection="column" gap={0} marginTop={1}>
            <Text bold color="cyan">
              Network Performance Summary:
            </Text>
            <Box marginTop={1} flexDirection="column" gap={0}>
              <MetricRow
                label="Total Packets Sent"
                value={ping.analysis.totalPackets}
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Successful Responses"
                value={ping.analysis.successfulPackets}
                color="green"
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Failed Packets"
                value={ping.analysis.failedPackets}
                color="red"
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Overall Success Rate"
                value={ping.successRate.toFixed(2)}
                unit="%"
                color={ping.successRate >= 95 ? "green" : ping.successRate >= 80 ? "yellow" : "red"}
                width={layout.contentWidth}
                compact={false}
              />
            </Box>
          </Box>

          {/* Response Time Analysis */}
          {ping.analysis.avgSuccessTime !== null && ping.analysis.avgSuccessTime > 0 && (
            <Box flexDirection="column" gap={0} marginTop={1}>
              <Text bold color="cyan">
                Response Time Analysis:
              </Text>
              <Box marginTop={1} flexDirection="column" gap={0}>
                <MetricRow
                  label="Average Response Time"
                  value={ping.analysis.avgSuccessTime.toFixed(2)}
                  unit="ms"
                  color="cyan"
                  width={layout.contentWidth}
                  compact={false}
                />
                <MetricRow
                  label="Minimum Response Time"
                  value={ping.analysis.minSuccessTime?.toFixed(2) || "N/A"}
                  unit="ms"
                  color="green"
                  width={layout.contentWidth}
                  compact={false}
                />
                <MetricRow
                  label="Maximum Response Time"
                  value={ping.analysis.maxSuccessTime?.toFixed(2) || "N/A"}
                  unit="ms"
                  color="yellow"
                  width={layout.contentWidth}
                  compact={false}
                />
                <MetricRow
                  label="Median Response Time"
                  value={ping.analysis.medianSuccessTime?.toFixed(2) || "N/A"}
                  unit="ms"
                  color="blue"
                  width={layout.contentWidth}
                  compact={false}
                />
                <MetricRow
                  label="Standard Deviation"
                  value={ping.analysis.responseTimeStdDev?.toFixed(2) || "N/A"}
                  unit="ms"
                  color="magenta"
                  width={layout.contentWidth}
                  compact={false}
                />
                <MetricRow
                  label="Jitter (Variance)"
                  value={ping.analysis.jitter?.toFixed(2) || "0.00"}
                  unit="ms"
                  color={
                    ping.analysis.jitter && ping.analysis.jitter > 50
                      ? "red"
                      : ping.analysis.jitter && ping.analysis.jitter > 20
                        ? "yellow"
                        : "green"
                  }
                  width={layout.contentWidth}
                  compact={false}
                />
              </Box>
            </Box>
          )}

          {/* Network Quality Assessment */}
          <Box flexDirection="column" gap={0} marginTop={1}>
            <Text bold color="cyan">
              Network Quality Assessment:
            </Text>
            <Box marginTop={1} flexDirection="column" gap={0}>
              <MetricRow
                label="Quality Score"
                value={ping.analysis.networkQualityScore.toFixed(1)}
                unit="/100"
                color={
                  ping.analysis.networkQualityScore >= 80
                    ? "green"
                    : ping.analysis.networkQualityScore >= 60
                      ? "yellow"
                      : "red"
                }
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Quality Rating"
                value={ping.analysis.networkQualityText}
                color={
                  ping.analysis.networkQualityScore >= 80
                    ? "green"
                    : ping.analysis.networkQualityScore >= 60
                      ? "yellow"
                      : "red"
                }
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Network Stability"
                value={ping.analysis.isStable ? "Stable" : "Unstable"}
                color={ping.analysis.isStable ? "green" : "red"}
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Consistency Score"
                value={ping.analysis.consistency.toFixed(1)}
                unit="/100"
                color={
                  ping.analysis.consistency >= 70
                    ? "green"
                    : ping.analysis.consistency >= 40
                      ? "yellow"
                      : ping.analysis.consistency >= 20
                        ? "magenta"
                        : "red"
                }
                width={layout.contentWidth}
                compact={false}
              />
            </Box>
          </Box>

          {/* Error Analysis */}
          {(ping.analysis.timeouts > 0 ||
            ping.analysis.unreachableHosts > 0 ||
            ping.analysis.otherErrors > 0) && (
            <Box flexDirection="column" gap={0} marginTop={1}>
              <Text bold color="red">
                Error Analysis:
              </Text>
              <Box marginTop={1} flexDirection="column" gap={0}>
                {ping.analysis.timeouts > 0 && (
                  <MetricRow
                    label="Timeout Errors"
                    value={ping.analysis.timeouts}
                    color="red"
                    width={layout.contentWidth}
                    compact={false}
                  />
                )}
                {ping.analysis.unreachableHosts > 0 && (
                  <MetricRow
                    label="Unreachable Host Errors"
                    value={ping.analysis.unreachableHosts}
                    color="red"
                    width={layout.contentWidth}
                    compact={false}
                  />
                )}
                {ping.analysis.otherErrors > 0 && (
                  <MetricRow
                    label="Other Network Errors"
                    value={ping.analysis.otherErrors}
                    color="red"
                    width={layout.contentWidth}
                    compact={false}
                  />
                )}
                <MetricRow
                  label="Timeout Rate"
                  value={ping.analysis.timeoutRate.toFixed(2)}
                  unit="%"
                  color="red"
                  width={layout.contentWidth}
                  compact={false}
                />
                <MetricRow
                  label="Unreachable Rate"
                  value={ping.analysis.unreachableRate.toFixed(2)}
                  unit="%"
                  color="red"
                  width={layout.contentWidth}
                  compact={false}
                />
              </Box>
            </Box>
          )}

          {/* Streak Analysis */}
          <Box flexDirection="column" gap={0} marginTop={1}>
            <Text bold color="cyan">
              Connection Patterns:
            </Text>
            <Box marginTop={1} flexDirection="column" gap={0}>
              <MetricRow
                label="Current Streak"
                value={`${ping.analysis.currentStreak.count} ${ping.analysis.currentStreak.type === "success" ? "successes" : "failures"}`}
                color={ping.analysis.currentStreak.type === "success" ? "green" : "red"}
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Longest Success Streak"
                value={ping.analysis.longestSuccessStreak}
                color="green"
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Longest Failure Streak"
                value={ping.analysis.longestFailureStreak}
                color="red"
                width={layout.contentWidth}
                compact={false}
              />
            </Box>
          </Box>

          {/* Time Distribution */}
          {ping.analysis.timeDistribution.size > 0 && (
            <Box flexDirection="column" gap={0} marginTop={1}>
              <Text bold color="cyan">
                Response Time Distribution:
              </Text>
              <Box marginTop={1} flexDirection="column" gap={0}>
                {Array.from(ping.analysis.timeDistribution.entries()).map(([range, count]) => (
                  <MetricRow
                    key={range}
                    label={range}
                    value={count}
                    unit="packets"
                    color="gray"
                    width={layout.contentWidth}
                    compact={false}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Session Summary */}
          <Box flexDirection="column" gap={0} marginTop={1}>
            <Text bold color="cyan">
              Session Summary:
            </Text>
            <Box marginTop={1} flexDirection="column" gap={0}>
              <MetricRow
                label="Total Duration"
                value={ping.duration}
                color="cyan"
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Average Ping Interval"
                value={
                  ping.totalPings > 1
                    ? (
                        (new Date().getTime() - ping.startTime.getTime()) /
                        (ping.totalPings - 1) /
                        1000
                      ).toFixed(1)
                    : "N/A"
                }
                unit="seconds"
                color="gray"
                width={layout.contentWidth}
                compact={false}
              />
              <MetricRow
                label="Data Points Collected"
                value={ping.analysis.responseTimes.length}
                color="blue"
                width={layout.contentWidth}
                compact={false}
              />
            </Box>
          </Box>

          {/* Recommendations */}
          {ping.analysis.recommendedAction && (
            <Box marginTop={1}>
              <Text bold color="yellow">
                Network Recommendations:
              </Text>
              <Box marginTop={1}>
                <Text color="gray">{ping.analysis.recommendedAction}</Text>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* No Data State */}
      {!ping.isRunning && ping.totalPings === 0 && (
        <Box marginTop={2} padding={1}>
          <Text color="yellow">No ping responses received from {host}</Text>
          <Box marginTop={1}>
            <Text color="gray">
              This could indicate network connectivity issues or that the host is not responding to
              ping requests.
            </Text>
          </Box>
        </Box>
      )}

      {/* Export Confirmation */}
      {ping.exportedFile && (
        <Box marginTop={1}>
          <Text color="green">Results exported to {ping.exportedFile}</Text>
        </Box>
      )}
    </Box>
  );
}
