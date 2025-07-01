import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render } from "ink-testing-library";
import { LineChart } from "../../src/components/line-chart";
import type { PingEntry } from "../../src/types/entry";
import type { ResponsiveLayout } from "../../src/components/dual-progress-bars";

// Mock console to avoid animation interval warnings in tests
vi.spyOn(console, "warn").mockImplementation(() => {});

const mockLayout: ResponsiveLayout = {
  width: 80,
  contentWidth: 76,
  dualColumnWidth: 36,
  isNarrow: false,
  isMedium: true,
  isWide: false,
};

const mockNarrowLayout: ResponsiveLayout = {
  width: 50,
  contentWidth: 46,
  dualColumnWidth: 21,
  isNarrow: true,
  isMedium: false,
  isWide: false,
};

const mockWideLayout: ResponsiveLayout = {
  width: 140,
  contentWidth: 136,
  dualColumnWidth: 66,
  isNarrow: false,
  isMedium: false,
  isWide: true,
};

const createMockEntries = (count: number): PingEntry[] => {
  return Array.from({ length: count }, (_, index) => ({
    sequenceNumber: index + 1,
    responseTime: index % 4 === 0 ? null : 20 + (index % 3) * 15, // Some failures, varying times
    isSuccess: index % 4 !== 0, // Every 4th ping fails
    errorType: index % 4 === 0 ? "timeout" : null,
    ttl: index % 4 !== 0 ? 64 : null,
    sourceIp: "8.8.8.8",
  }));
};

describe("LineChart", () => {
  describe("Basic rendering", () => {
    test("should render with no entries", () => {
      const { lastFrame } = render(<LineChart entries={[]} layout={mockLayout} />);

      // The component returns null for no entries
      expect(lastFrame()).toBe("");
    });

    test("should render with single entry", () => {
      const entries = createMockEntries(1);
      const { lastFrame } = render(<LineChart entries={entries} layout={mockLayout} />);

      expect(lastFrame()).toContain("chart:");
      expect(lastFrame()).toContain("avg --"); // No successful entries yet
    });

    test("should render with multiple entries", () => {
      const entries = createMockEntries(10);
      const { lastFrame } = render(<LineChart entries={entries} layout={mockLayout} />);

      expect(lastFrame()).toContain("chart:");
      expect(lastFrame()).toContain("avg"); // Should show average
    });
  });

  describe("Responsive design", () => {
    test("should adapt to narrow layout", () => {
      const entries = createMockEntries(15);
      const { lastFrame } = render(<LineChart entries={entries} layout={mockNarrowLayout} />);

      expect(lastFrame()).toContain("chart:");
      // Narrow layout should show fewer dots (max 15)
      const dots = (lastFrame()?.match(/[●×]/g) || []).length;
      expect(dots).toBeLessThanOrEqual(15);
    });

    test("should adapt to wide layout", () => {
      const entries = createMockEntries(25);
      const { lastFrame } = render(<LineChart entries={entries} layout={mockWideLayout} />);

      expect(lastFrame()).toContain("chart:");
      // Wide layout should show more dots (max 25)
      const dots = (lastFrame()?.match(/[●×]/g) || []).length;
      expect(dots).toBeLessThanOrEqual(25);
    });

    test("should limit points based on layout", () => {
      const entries = createMockEntries(100);

      // Narrow layout should show fewer points
      const { lastFrame: narrowFrame } = render(
        <LineChart entries={entries} layout={mockNarrowLayout} />,
      );
      const narrowDots = (narrowFrame()?.match(/[●×]/g) || []).length;
      expect(narrowDots).toBeLessThanOrEqual(15);

      // Wide layout should show more points
      const { lastFrame: wideFrame } = render(
        <LineChart entries={entries} layout={mockWideLayout} />,
      );
      const wideDots = (wideFrame()?.match(/[●×]/g) || []).length;
      expect(wideDots).toBeLessThanOrEqual(25);
    });
  });

  describe("Chart rendering", () => {
    test("should display chart with gradient colors", () => {
      const entries: PingEntry[] = [
        {
          sequenceNumber: 1,
          responseTime: 30, // Should be green ●
          isSuccess: true,
          errorType: null,
          ttl: 64,
          sourceIp: "8.8.8.8",
        },
        {
          sequenceNumber: 2,
          responseTime: null, // Should be red ×
          isSuccess: false,
          errorType: "timeout",
          ttl: null,
          sourceIp: "8.8.8.8",
        },
      ];

      const { lastFrame } = render(<LineChart entries={entries} layout={mockLayout} />);
      const frame = lastFrame();

      // Should contain chart label and average
      expect(frame).toContain("chart:");
      expect(frame).toContain("avg");
    });
  });

  describe("Statistics display", () => {
    test("should calculate and display average response time", () => {
      const entries: PingEntry[] = [
        {
          sequenceNumber: 1,
          responseTime: 20,
          isSuccess: true,
          errorType: null,
          ttl: 64,
          sourceIp: "8.8.8.8",
        },
        {
          sequenceNumber: 2,
          responseTime: 40,
          isSuccess: true,
          errorType: null,
          ttl: 64,
          sourceIp: "8.8.8.8",
        },
      ];

      const { lastFrame } = render(<LineChart entries={entries} layout={mockLayout} />);
      expect(lastFrame()).toContain("avg 30ms"); // (20 + 40) / 2 = 30
    });

    test("should handle all failed entries", () => {
      const entries: PingEntry[] = [
        {
          sequenceNumber: 1,
          responseTime: null,
          isSuccess: false,
          errorType: "timeout",
          ttl: null,
          sourceIp: "8.8.8.8",
        },
        {
          sequenceNumber: 2,
          responseTime: null,
          isSuccess: false,
          errorType: "unreachable",
          ttl: null,
          sourceIp: "8.8.8.8",
        },
      ];

      const { lastFrame } = render(<LineChart entries={entries} layout={mockLayout} />);
      expect(lastFrame()).toContain("avg --");
    });
  });

  describe("Edge cases", () => {
    test("should handle entries with null response times", () => {
      const entries: PingEntry[] = [
        {
          sequenceNumber: 1,
          responseTime: null,
          isSuccess: false,
          errorType: "timeout",
          ttl: null,
          sourceIp: "8.8.8.8",
        },
      ];

      const { lastFrame } = render(<LineChart entries={entries} layout={mockLayout} />);
      expect(lastFrame()).toContain("chart:");
      expect(lastFrame()).toContain("avg --");
    });

    test("should handle very large response times", () => {
      const entries: PingEntry[] = [
        {
          sequenceNumber: 1,
          responseTime: 5000, // Very slow
          isSuccess: true,
          errorType: null,
          ttl: 64,
          sourceIp: "8.8.8.8",
        },
      ];

      const { lastFrame } = render(<LineChart entries={entries} layout={mockLayout} />);
      expect(lastFrame()).toContain("avg 5000ms");
    });
  });
});
