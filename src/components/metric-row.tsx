import React from "react";
import { Box, Text } from "ink";

export interface MetricRowProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  width?: number;
  compact?: boolean;
}

export const MetricRow: React.FC<MetricRowProps> = ({
  label,
  value,
  unit = "",
  color = "white",
  width = 60,
  compact = false,
}) => (
  <Box justifyContent="space-between" width={width}>
    <Text color="gray">{compact ? label.slice(0, 10) : label}:</Text>
    <Box gap={1}>
      <Text bold color={color}>
        {value}
      </Text>
      {unit && <Text color="gray">{unit}</Text>}
    </Box>
  </Box>
);
