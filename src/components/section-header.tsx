import React from "react";
import { Box, Text } from "ink";

export interface SectionHeaderProps {
  title: string;
  icon: string;
  compact?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon, compact = false }) => (
  <Box gap={1} marginTop={compact ? 0 : 1}>
    <Text bold color="cyan">
      {icon}{" "}
    </Text>
    <Text bold color="white">
      {compact ? title.slice(0, 12) : title}
    </Text>
  </Box>
);
