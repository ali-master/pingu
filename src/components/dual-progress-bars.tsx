import React from "react";
import { Box, Text } from "ink";
import { ProgressBar } from "@inkjs/ui";

export interface ResponsiveLayout {
  isNarrow: boolean;
  isWide: boolean;
  isMedium: boolean;
  width: number;
  contentWidth: number;
  dualColumnWidth: number;
}

export interface DualProgressBarsProps {
  successRate: number;
  errorRate: number;
  layout: ResponsiveLayout;
}

export const DualProgressBars: React.FC<DualProgressBarsProps> = ({
  successRate,
  errorRate,
  layout,
}) => {
  if (layout.isNarrow) {
    // Stack vertically on narrow screens
    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Box gap={1} marginBottom={1}>
            <Text color="green">🟢 Success</Text>
            <Text bold color="green">
              {successRate.toFixed(1)}%
            </Text>
          </Box>
          <ProgressBar value={Math.round(successRate)} />
        </Box>

        <Box flexDirection="column">
          <Box gap={1} marginBottom={1}>
            <Text color="red">🔴 Error</Text>
            <Text bold color="red">
              {errorRate.toFixed(1)}%
            </Text>
          </Box>
          <ProgressBar value={Math.round(errorRate)} />
        </Box>
      </Box>
    );
  }

  // Side-by-side on wider screens
  return (
    <Box flexDirection="column" gap={1}>
      <Box justifyContent="space-between">
        <Box flexDirection="column" width={`${layout.dualColumnWidth}%`}>
          <Box gap={1} marginBottom={1}>
            <Text color="green">🟢 Success Rate</Text>
            <Text bold color="green">
              {successRate.toFixed(1)}%
            </Text>
          </Box>
          <ProgressBar value={Math.round(successRate)} />
        </Box>

        <Box flexDirection="column" width={`${layout.dualColumnWidth}%`}>
          <Box gap={1} marginBottom={1}>
            <Text color="red">🔴 Error Rate</Text>
            <Text bold color="red">
              {errorRate.toFixed(1)}%
            </Text>
          </Box>
          <ProgressBar value={Math.round(errorRate)} />
        </Box>
      </Box>
    </Box>
  );
};
