import React from "react";
import { Box, Text } from "ink";
import { Badge } from "@inkjs/ui";

export interface QualityIndicatorProps {
  score: number;
  label: string;
  compact?: boolean;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({
  score,
  label,
  compact = false,
}) => {
  const getColor = (score: number) => {
    if (score >= 90) return "green";
    if (score >= 70) return "yellow";
    if (score >= 50) return "magenta";
    return "red";
  };

  const getEmoji = (score: number) => {
    if (score >= 90) return "🟢";
    if (score >= 70) return "🟡";
    if (score >= 50) return "🟠";
    return "🔴";
  };

  return (
    <Box gap={1} alignItems="center" flexWrap="wrap">
      <Text>{getEmoji(score)}</Text>
      <Badge color={getColor(score)}>{compact ? label.slice(0, 8) : label}</Badge>
      <Text color="gray">({score.toFixed(1)}/100)</Text>
    </Box>
  );
};
