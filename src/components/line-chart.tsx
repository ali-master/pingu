import React, { useMemo } from "react";
import { Box, Text } from "ink";
import gradient from "gradient-string";
import type { ResponsiveLayout } from "./dual-progress-bars";
import type { PingEntry } from "../types/entry";

export interface LineChartProps {
  entries: PingEntry[];
  layout: ResponsiveLayout;
}

// Define beautiful gradients for different performance levels
const excellentGradient = gradient(["#00ff88", "#00cc66"]); // Fast response times
const goodGradient = gradient(["#ffdd00", "#ffaa00"]); // Medium response times
const fairGradient = gradient(["#ff8800", "#ff6600"]); // Slow response times
const poorGradient = gradient(["#ff4444", "#cc0000"]); // Very slow response times
const failedGradient = gradient(["#ff0066", "#990033"]); // Failed pings
const chartGradient = gradient(["#6366f1", "#8b5cf6", "#a855f7"]); // Chart label

const getGradientForValue = (value: number, isSuccess: boolean) => {
  if (!isSuccess) return failedGradient;
  if (value <= 50) return excellentGradient;
  if (value <= 100) return goodGradient;
  if (value <= 200) return fairGradient;
  return poorGradient;
};

export const LineChart: React.FC<LineChartProps> = ({ entries, layout }) => {
  const chartData = useMemo(() => {
    // Get recent entries for the mini chart
    const maxPoints = layout.isNarrow ? 15 : 25;
    const recentEntries = entries.slice(-maxPoints);

    if (recentEntries.length === 0) return null;

    const successfulEntries = recentEntries.filter(
      (entry) => entry.isSuccess && entry.responseTime !== null,
    );
    const avgTime =
      successfulEntries.length > 0
        ? successfulEntries.reduce((sum, entry) => sum + (entry.responseTime || 0), 0) /
          successfulEntries.length
        : 0;

    // Chart dimensions
    const chartHeight = 3;
    const chartWidth = Math.min(recentEntries.length, maxPoints);

    // Get max response time for scaling
    const maxTime = Math.max(
      ...successfulEntries.map((entry) => entry.responseTime || 0),
      100, // minimum scale
    );

    // Create chart matrix
    const chart: { char: string; gradientText: string }[][] = Array(chartHeight)
      .fill(null)
      .map(() => Array(chartWidth).fill({ char: " ", gradientText: "" }));

    // Plot data points and lines
    recentEntries.forEach((entry, x) => {
      if (x >= chartWidth) return;

      const gradientFn = getGradientForValue(entry.responseTime || 0, entry.isSuccess);

      if (!entry.isSuccess) {
        // Show failed pings at bottom
        chart[chartHeight - 1][x] = {
          char: "×",
          gradientText: gradientFn("×"),
        };
      } else {
        // Scale response time to chart height
        const normalizedValue = ((entry.responseTime || 0) / maxTime) * (chartHeight - 1);
        const y = Math.floor(chartHeight - 1 - normalizedValue);
        const clampedY = Math.max(0, Math.min(chartHeight - 1, y));

        chart[clampedY][x] = {
          char: "●",
          gradientText: gradientFn("●"),
        };

        // Draw connection lines to previous point
        if (x > 0) {
          const prevEntry = recentEntries[x - 1];
          if (prevEntry.isSuccess && prevEntry.responseTime !== null) {
            const prevNormalizedValue = (prevEntry.responseTime / maxTime) * (chartHeight - 1);
            const prevY = Math.floor(chartHeight - 1 - prevNormalizedValue);
            const prevClampedY = Math.max(0, Math.min(chartHeight - 1, prevY));

            // Draw simple connecting line
            const minY = Math.min(clampedY, prevClampedY);
            const maxY = Math.max(clampedY, prevClampedY);

            // Use a subtle connecting line gradient
            const connectionGradient = gradient(["#64748b", "#94a3b8"]);

            for (let lineY = minY; lineY <= maxY; lineY++) {
              if (chart[lineY][x - 1].char === " ") {
                chart[lineY][x - 1] = {
                  char: "━",
                  gradientText: connectionGradient("━"),
                };
              }
            }
          }
        }
      }
    });

    return {
      chart,
      avgTime,
      chartWidth,
    };
  }, [entries, layout]);

  if (!chartData) return null;

  const { chart, avgTime, chartWidth } = chartData;

  // Create gradient for chart label and average
  const avgGradient =
    avgTime > 0 ? getGradientForValue(avgTime, true) : gradient(["#6b7280", "#9ca3af"]);

  return (
    <Box gap={1} alignItems="center">
      <Text>{chartGradient("chart:")}</Text>
      <Box flexDirection="column">
        {chart.map((row, y) => (
          <Box key={y}>
            {row.slice(0, chartWidth).map((cell, x) => (
              <Text key={x}>{cell.gradientText || cell.char}</Text>
            ))}
          </Box>
        ))}
      </Box>
      <Text>{avgGradient(`avg ${avgTime > 0 ? `${avgTime.toFixed(0)}ms` : "--"}`)}</Text>
    </Box>
  );
};
