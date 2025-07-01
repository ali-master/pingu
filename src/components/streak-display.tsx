import React from "react";
import { Box, Text } from "ink";
import { Badge } from "@inkjs/ui";

export interface StreakDisplayProps {
  streak: { type: "success" | "failure"; count: number };
  compact?: boolean;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, compact = false }) => (
  <Box gap={1} alignItems="center" flexWrap="wrap">
    <Text color="gray">{compact ? "Streak:" : "Current Streak:"}</Text>
    <Badge color={streak.type === "success" ? "green" : "red"}>
      {streak.count} {streak.type === "success" ? "✓" : "✗"}
    </Badge>
  </Box>
);
