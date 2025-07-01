import { describe, test, expect } from "vitest";
import { analyzePingResult } from "../src/analyzer";

describe("analyzePingResult", () => {
  const createMockPingOutput = (
    responses: Array<{ success: boolean; time?: number; error?: string; seq?: number }>,
  ) => {
    return responses
      .map((response, index) => {
        if (response.success) {
          return `64 bytes from 8.8.8.8: icmp_seq=${response.seq ?? index + 1} ttl=117 time=${response.time ?? 25}ms`;
        } else if (response.error === "timeout") {
          return `Request timeout for icmp_seq ${response.seq ?? index + 1}`;
        } else if (response.error === "unreachable") {
          return `From 8.8.8.8: Destination Host Unreachable`;
        }
        return "";
      })
      .join("\n");
  };

  describe("Basic packet statistics", () => {
    test("should calculate correct packet counts for all successful pings", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: true, time: 25 },
        { success: true, time: 30 },
      ]);

      const result = analyzePingResult(output);

      expect(result.totalPackets).toBe(3);
      expect(result.successfulPackets).toBe(3);
      expect(result.failedPackets).toBe(0);
      expect(result.successRate).toBe(100);
      expect(result.failureRate).toBe(0);
      expect(result.packetLoss).toBe(0);
    });

    test("should calculate correct packet counts for mixed results", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: false, error: "timeout" },
        { success: true, time: 30 },
        { success: false, error: "unreachable" },
      ]);

      const result = analyzePingResult(output);

      expect(result.totalPackets).toBe(4);
      expect(result.successfulPackets).toBe(2);
      expect(result.failedPackets).toBe(2);
      expect(result.successRate).toBe(50);
      expect(result.failureRate).toBe(50);
      expect(result.packetLoss).toBe(50);
    });

    test("should handle all failed pings", () => {
      const output = createMockPingOutput([
        { success: false, error: "timeout" },
        { success: false, error: "timeout" },
        { success: false, error: "unreachable" },
      ]);

      const result = analyzePingResult(output);

      expect(result.totalPackets).toBe(3);
      expect(result.successfulPackets).toBe(0);
      expect(result.failedPackets).toBe(3);
      expect(result.successRate).toBe(0);
      expect(result.failureRate).toBe(100);
      expect(result.packetLoss).toBe(100);
    });
  });

  describe("Response time statistics", () => {
    test("should calculate correct time statistics", () => {
      const output = createMockPingOutput([
        { success: true, time: 10 },
        { success: true, time: 20 },
        { success: true, time: 30 },
        { success: true, time: 40 },
        { success: true, time: 50 },
      ]);

      const result = analyzePingResult(output);

      expect(result.minSuccessTime).toBe(10);
      expect(result.maxSuccessTime).toBe(50);
      expect(result.avgSuccessTime).toBe(30);
      expect(result.medianSuccessTime).toBe(30);
      expect(result.responseTimeStdDev).toBeCloseTo(14.14, 1);
    });

    test("should handle single successful ping", () => {
      const output = createMockPingOutput([{ success: true, time: 25 }]);

      const result = analyzePingResult(output);

      expect(result.minSuccessTime).toBe(25);
      expect(result.maxSuccessTime).toBe(25);
      expect(result.avgSuccessTime).toBe(25);
      expect(result.medianSuccessTime).toBe(25);
      expect(result.responseTimeStdDev).toBe(0);
    });

    test("should handle no successful pings", () => {
      const output = createMockPingOutput([
        { success: false, error: "timeout" },
        { success: false, error: "unreachable" },
      ]);

      const result = analyzePingResult(output);

      expect(result.minSuccessTime).toBeNull();
      expect(result.maxSuccessTime).toBeNull();
      expect(result.avgSuccessTime).toBeNull();
      expect(result.medianSuccessTime).toBeNull();
      expect(result.responseTimeStdDev).toBeNull();
    });

    test("should calculate jitter correctly", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: true, time: 25 },
        { success: true, time: 30 },
        { success: true, time: 35 },
      ]);

      const result = analyzePingResult(output);

      expect(result.jitter).toBeGreaterThan(0);
      expect(result.jitter).toBeLessThan(10); // Should be reasonable jitter value
    });
  });

  describe("Error categorization", () => {
    test("should categorize timeouts correctly", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: false, error: "timeout" },
        { success: false, error: "timeout" },
        { success: false, error: "unreachable" },
      ]);

      const result = analyzePingResult(output);

      expect(result.timeouts).toBe(2);
      expect(result.unreachableHosts).toBe(1);
      expect(result.timeoutRate).toBe(50);
      expect(result.unreachableRate).toBe(25);
    });

    test("should handle zero errors", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: true, time: 25 },
      ]);

      const result = analyzePingResult(output);

      expect(result.timeouts).toBe(0);
      expect(result.unreachableHosts).toBe(0);
      expect(result.otherErrors).toBe(0);
      expect(result.timeoutRate).toBe(0);
      expect(result.unreachableRate).toBe(0);
    });
  });

  describe("Network quality assessment", () => {
    test("should rate excellent network quality", () => {
      const output = createMockPingOutput([
        { success: true, time: 5 },
        { success: true, time: 6 },
        { success: true, time: 7 },
        { success: true, time: 8 },
        { success: true, time: 9 },
      ]);

      const result = analyzePingResult(output);

      expect(result.networkQualityScore).toBeGreaterThan(90);
      expect(result.networkQualityText).toBe("Excellent");
      expect(result.isStable).toBe(true);
      expect(result.consistency).toBeGreaterThan(90);
    });

    test("should rate poor network quality", () => {
      const output = createMockPingOutput([
        { success: true, time: 500 },
        { success: false, error: "timeout" },
        { success: true, time: 800 },
        { success: false, error: "timeout" },
      ]);

      const result = analyzePingResult(output);

      expect(result.networkQualityScore).toBeLessThan(50);
      expect(result.networkQualityText).toBe("Critical");
      expect(result.isStable).toBe(false);
    });
  });

  describe("Streak analysis", () => {
    test("should calculate success streaks correctly", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: true, time: 25 },
        { success: true, time: 30 },
        { success: false, error: "timeout" },
        { success: true, time: 35 },
      ]);

      const result = analyzePingResult(output);

      expect(result.longestSuccessStreak).toBe(3);
      expect(result.longestFailureStreak).toBe(1);
      expect(result.currentStreak.type).toBe("success");
      expect(result.currentStreak.count).toBe(1);
    });

    test("should handle ending with failure streak", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: false, error: "timeout" },
        { success: false, error: "timeout" },
      ]);

      const result = analyzePingResult(output);

      expect(result.currentStreak.type).toBe("failure");
      expect(result.currentStreak.count).toBe(2);
    });
  });

  describe("Advanced metrics", () => {
    test("should include response times array", () => {
      const output = createMockPingOutput([
        { success: true, time: 10 },
        { success: false, error: "timeout" },
        { success: true, time: 30 },
      ]);

      const result = analyzePingResult(output);

      expect(result.responseTimes).toEqual([10, 30]);
      expect(Object.isFrozen(result.responseTimes)).toBe(true);
    });

    test("should include sequence numbers array", () => {
      const output = createMockPingOutput([
        { success: true, time: 10, seq: 1 },
        { success: false, error: "timeout", seq: 2 },
        { success: true, time: 30, seq: 3 },
      ]);

      const result = analyzePingResult(output);

      expect(result.sequenceNumbers).toEqual([1, 2, 3]);
      expect(Object.isFrozen(result.sequenceNumbers)).toBe(true);
    });

    test("should create time distribution", () => {
      const output = createMockPingOutput([
        { success: true, time: 5 },
        { success: true, time: 15 },
        { success: true, time: 25 },
        { success: true, time: 55 },
        { success: true, time: 150 },
      ]);

      const result = analyzePingResult(output);

      expect(result.timeDistribution).toBeInstanceOf(Map);
      expect(result.timeDistribution.size).toBeGreaterThan(0);
    });

    test("should provide recommendations", () => {
      const output = createMockPingOutput([
        { success: false, error: "timeout" },
        { success: false, error: "timeout" },
        { success: false, error: "timeout" },
      ]);

      const result = analyzePingResult(output);

      expect(result.recommendedAction).toBeTruthy();
      expect(typeof result.recommendedAction).toBe("string");
      expect(result.recommendedAction.length).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    test("should handle empty ping output", () => {
      const result = analyzePingResult("");

      expect(result.totalPackets).toBe(0);
      expect(result.successfulPackets).toBe(0);
      expect(result.failedPackets).toBe(0);
      expect(result.successRate).toBe(0);
      expect(result.responseTimes).toEqual([]);
      expect(result.sequenceNumbers).toEqual([]);
    });

    test("should handle whitespace-only output", () => {
      const result = analyzePingResult("   \n\n   \t   ");

      expect(result.totalPackets).toBe(0);
      expect(result.successfulPackets).toBe(0);
    });

    test("should handle malformed ping output", () => {
      const result = analyzePingResult("This is not ping output\nRandom text\nMore random text");

      expect(result.totalPackets).toBe(0);
      expect(result.successfulPackets).toBe(0);
    });

    test("should use custom options", () => {
      const output = createMockPingOutput([
        { success: true, time: 20 },
        { success: true, time: 25 },
      ]);

      const result = analyzePingResult(output, {
        timeoutThreshold: 500,
        jitterThreshold: 25,
        stabilityThreshold: 80,
      });

      // Options should affect the analysis
      expect(result).toBeDefined();
      expect(result.totalPackets).toBe(2);
    });

    test("should handle very large response times", () => {
      const output = createMockPingOutput([{ success: true, time: 9999 }]);

      const result = analyzePingResult(output);

      expect(result.avgSuccessTime).toBe(9999);
      expect(result.networkQualityScore).toBeLessThan(80);
    });

    test("should handle very small response times", () => {
      const output = createMockPingOutput([{ success: true, time: 0.1 }]);

      const result = analyzePingResult(output);

      expect(result.avgSuccessTime).toBe(0.1);
      expect(result.networkQualityScore).toBeGreaterThan(90);
    });
  });

  describe("Human-readable formatting", () => {
    test("should format time values as human readable", () => {
      const output = createMockPingOutput([
        { success: true, time: 1.234 },
        { success: true, time: 5678.9 },
      ]);

      const result = analyzePingResult(output);

      expect(result.minSuccessTimeHuman).toBeTruthy();
      expect(result.maxSuccessTimeHuman).toBeTruthy();
      expect(typeof result.minSuccessTimeHuman).toBe("string");
      expect(typeof result.maxSuccessTimeHuman).toBe("string");
    });

    test("should handle null time values", () => {
      const output = createMockPingOutput([{ success: false, error: "timeout" }]);

      const result = analyzePingResult(output);

      expect(result.minSuccessTimeHuman).toBeNull();
      expect(result.maxSuccessTimeHuman).toBeNull();
    });
  });
});
