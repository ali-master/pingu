import React from "react";
import { Box, Text } from "ink";
import type { PingEntry } from "../types/entry";

export interface LiveFeedEntryProps {
  entry: PingEntry;
  index: number;
  compact?: boolean;
}

export const LiveFeedEntry: React.FC<LiveFeedEntryProps> = ({ entry, index, compact = false }) => {
  const getStatusIcon = (entry: PingEntry) => {
    if (entry.isSuccess) return "🟢";
    if (entry.errorType === "timeout") return "⏰";
    if (entry.errorType === "unreachable") return "🚫";
    return "❌";
  };

  const getStatusColor = (entry: PingEntry) => {
    if (entry.isSuccess) return "green";
    return "red";
  };

  const getStatusText = (entry: PingEntry, compact: boolean) => {
    if (entry.isSuccess) {
      return compact ? `${entry.responseTime}ms` : `${entry.responseTime}ms TTL=${entry.ttl}`;
    }
    if (entry.errorType === "timeout") return compact ? "Timeout" : "Request timeout";
    if (entry.errorType === "unreachable")
      return compact ? "Unreachable" : "Destination unreachable";
    return "Failed";
  };

  return (
    <Box gap={1} key={index} flexWrap="wrap">
      <Text color="gray">#{entry.sequenceNumber?.toString().padStart(3, "0") || "???"}</Text>
      <Text>{getStatusIcon(entry)}</Text>
      <Text bold color={getStatusColor(entry)}>
        {getStatusText(entry, compact)}
      </Text>
    </Box>
  );
};
