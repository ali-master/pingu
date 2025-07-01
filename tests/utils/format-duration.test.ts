import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDuration } from "../../src/utils/format-duration";

describe("formatDuration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should format seconds correctly", () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2024-01-01T00:00:30Z"));

    expect(formatDuration(startTime)).toBe("30s");
  });

  test("should format minutes and seconds correctly", () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2024-01-01T00:02:30Z"));

    expect(formatDuration(startTime)).toBe("2m 30s");
  });

  test("should format hours, minutes and seconds correctly", () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2024-01-01T01:05:15Z"));

    expect(formatDuration(startTime)).toBe("1h 5m 15s");
  });

  test("should handle zero duration", () => {
    const now = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(now);

    expect(formatDuration(now)).toBe("0s");
  });

  test("should handle multiple hours", () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2024-01-02T01:30:45Z"));

    expect(formatDuration(startTime)).toBe("25h 30m 45s");
  });

  test("should handle edge case with exact minutes", () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2024-01-01T00:05:00Z"));

    expect(formatDuration(startTime)).toBe("5m 0s");
  });

  test("should handle edge case with exact hours", () => {
    const startTime = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2024-01-01T02:00:00Z"));

    expect(formatDuration(startTime)).toBe("2h 0m 0s");
  });
});
