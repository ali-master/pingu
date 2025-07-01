import React from "react";
import { Box } from "ink";
import type { ResponsiveLayout } from "./dual-progress-bars";

export interface MetricsGridProps {
  children: React.ReactNode;
  layout: ResponsiveLayout;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ children, layout }) => {
  if (layout.isNarrow) {
    return (
      <Box flexDirection="column" gap={0}>
        {children}
      </Box>
    );
  }

  if (layout.isWide) {
    // Two column layout for wide screens
    const childArray = React.Children.toArray(children);
    const leftColumn = childArray.filter((_, index) => index % 2 === 0);
    const rightColumn = childArray.filter((_, index) => index % 2 === 1);

    return (
      <Box gap={4}>
        <Box flexDirection="column" gap={0} width="48%">
          {leftColumn}
        </Box>
        <Box flexDirection="column" gap={0} width="48%">
          {rightColumn}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={0}>
      {children}
    </Box>
  );
};
