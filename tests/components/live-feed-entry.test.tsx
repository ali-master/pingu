import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { LiveFeedEntry } from "../../src/components/live-feed-entry";
import type { PingEntry } from "../../src/types/entry";

describe("LiveFeedEntry", () => {
  const createSuccessEntry = (overrides: Partial<PingEntry> = {}): PingEntry => ({
    sequenceNumber: 1,
    responseTime: 25.5,
    isSuccess: true,
    errorType: null,
    ttl: 64,
    sourceIp: "8.8.8.8",
    ...overrides,
  });

  const createFailureEntry = (
    errorType: "timeout" | "unreachable" | null,
    overrides: Partial<PingEntry> = {},
  ): PingEntry => ({
    sequenceNumber: 1,
    responseTime: null,
    isSuccess: false,
    errorType,
    ttl: null,
    sourceIp: null,
    ...overrides,
  });

  describe("Successful ping entries", () => {
    test("should render successful ping in normal mode", () => {
      const entry = createSuccessEntry();
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#001/); // Padded sequence number
      expect(lastFrame()).toMatch(/🟢/); // Success icon
      expect(lastFrame()).toMatch(/25\.5ms TTL=64/); // Response time and TTL
    });

    test("should render successful ping in compact mode", () => {
      const entry = createSuccessEntry();
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} compact={true} />);

      expect(lastFrame()).toMatch(/#001/);
      expect(lastFrame()).toMatch(/🟢/);
      expect(lastFrame()).toMatch(/25\.5ms/); // Only response time, no TTL
      expect(lastFrame()).not.toMatch(/TTL/);
    });

    test("should handle null sequence number", () => {
      const entry = createSuccessEntry({ sequenceNumber: null });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#\?\?\?/); // Unknown sequence number
      expect(lastFrame()).toMatch(/🟢/);
      expect(lastFrame()).toMatch(/25\.5ms/);
    });

    test("should handle large sequence numbers", () => {
      const entry = createSuccessEntry({ sequenceNumber: 12345 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#12345/); // Large number should not be padded with zeros
      expect(lastFrame()).toMatch(/🟢/);
    });

    test("should handle decimal response times", () => {
      const entry = createSuccessEntry({ responseTime: 0.123 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/0\.123ms/);
    });

    test("should handle null TTL", () => {
      const entry = createSuccessEntry({ ttl: null });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/25\.5ms TTL=null/);
    });
  });

  describe("Timeout entries", () => {
    test("should render timeout in normal mode", () => {
      const entry = createFailureEntry("timeout");
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#001/);
      expect(lastFrame()).toMatch(/⏰/); // Timeout icon
      expect(lastFrame()).toMatch(/Request timeout/);
    });

    test("should render timeout in compact mode", () => {
      const entry = createFailureEntry("timeout");
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} compact={true} />);

      expect(lastFrame()).toMatch(/#001/);
      expect(lastFrame()).toMatch(/⏰/);
      expect(lastFrame()).toMatch(/Timeout/);
      expect(lastFrame()).not.toMatch(/Request timeout/);
    });
  });

  describe("Unreachable entries", () => {
    test("should render unreachable in normal mode", () => {
      const entry = createFailureEntry("unreachable");
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#001/);
      expect(lastFrame()).toMatch(/🚫/); // Unreachable icon
      expect(lastFrame()).toMatch(/Destination unreachable/);
    });

    test("should render unreachable in compact mode", () => {
      const entry = createFailureEntry("unreachable");
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} compact={true} />);

      expect(lastFrame()).toMatch(/#001/);
      expect(lastFrame()).toMatch(/🚫/);
      expect(lastFrame()).toMatch(/Unreachable/);
      expect(lastFrame()).not.toMatch(/Destination unreachable/);
    });
  });

  describe("Generic failure entries", () => {
    test("should render generic failure", () => {
      const entry = createFailureEntry(null);
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#001/);
      expect(lastFrame()).toMatch(/❌/); // Generic error icon
      expect(lastFrame()).toMatch(/Failed/);
    });
  });

  describe("Edge cases", () => {
    test("should handle zero response time", () => {
      const entry = createSuccessEntry({ responseTime: 0 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/0ms/);
    });

    test("should handle very large response times", () => {
      const entry = createSuccessEntry({ responseTime: 9999.999 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/9999\.999ms/);
    });

    test("should handle zero sequence number", () => {
      const entry = createSuccessEntry({ sequenceNumber: 0 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#000/);
    });

    test("should handle large index values", () => {
      const entry = createSuccessEntry();
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={9999} />);

      // Index shouldn't affect the display, only the key
      expect(lastFrame()).toMatch(/#001/);
      expect(lastFrame()).toMatch(/🟢/);
    });

    test("should handle TTL of zero", () => {
      const entry = createSuccessEntry({ ttl: 0 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/TTL=0/);
    });

    test("should handle negative response time (edge case)", () => {
      const entry = createSuccessEntry({ responseTime: -1 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/-1ms/);
    });

    test("should handle very high TTL values", () => {
      const entry = createSuccessEntry({ ttl: 255 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/TTL=255/);
    });

    test("should handle sequence numbers with padding", () => {
      const entry = createSuccessEntry({ sequenceNumber: 5 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#005/); // Should be padded to 3 digits
    });

    test("should handle sequence numbers that need no padding", () => {
      const entry = createSuccessEntry({ sequenceNumber: 123 });
      const { lastFrame } = render(<LiveFeedEntry entry={entry} index={0} />);

      expect(lastFrame()).toMatch(/#123/); // No padding needed
    });
  });
});
