import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { StreakDisplay } from "../../src/components/streak-display";

describe("StreakDisplay", () => {
  describe("Success streaks", () => {
    test("should render success streak in normal mode", () => {
      const streak = { type: "success" as const, count: 5 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/Current Streak:/);
      expect(lastFrame()).toMatch(/5 ✓/);
    });

    test("should render success streak in compact mode", () => {
      const streak = { type: "success" as const, count: 10 };
      const { lastFrame } = render(<StreakDisplay streak={streak} compact={true} />);

      expect(lastFrame()).toMatch(/Streak:/);
      expect(lastFrame()).not.toMatch(/Current Streak:/);
      expect(lastFrame()).toMatch(/10 ✓/);
    });

    test("should handle single success streak", () => {
      const streak = { type: "success" as const, count: 1 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/1 ✓/);
    });

    test("should handle large success streak", () => {
      const streak = { type: "success" as const, count: 999 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/999 ✓/);
    });
  });

  describe("Failure streaks", () => {
    test("should render failure streak in normal mode", () => {
      const streak = { type: "failure" as const, count: 3 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/Current Streak:/);
      expect(lastFrame()).toMatch(/3 ✗/);
    });

    test("should render failure streak in compact mode", () => {
      const streak = { type: "failure" as const, count: 7 };
      const { lastFrame } = render(<StreakDisplay streak={streak} compact={true} />);

      expect(lastFrame()).toMatch(/Streak:/);
      expect(lastFrame()).not.toMatch(/Current Streak:/);
      expect(lastFrame()).toMatch(/7 ✗/);
    });

    test("should handle single failure streak", () => {
      const streak = { type: "failure" as const, count: 1 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/1 ✗/);
    });

    test("should handle large failure streak", () => {
      const streak = { type: "failure" as const, count: 500 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/500 ✗/);
    });
  });

  describe("Zero streaks", () => {
    test("should handle zero success streak", () => {
      const streak = { type: "success" as const, count: 0 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/0 ✓/);
    });

    test("should handle zero failure streak", () => {
      const streak = { type: "failure" as const, count: 0 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/0 ✗/);
    });
  });

  describe("Color coding", () => {
    test("should use green badge for success streaks", () => {
      const streak = { type: "success" as const, count: 5 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      // We can't directly test color in text output, but we can verify the content
      expect(lastFrame()).toMatch(/5 ✓/);
    });

    test("should use red badge for failure streaks", () => {
      const streak = { type: "failure" as const, count: 3 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      // We can't directly test color in text output, but we can verify the content
      expect(lastFrame()).toMatch(/3 ✗/);
    });
  });

  describe("Text formatting", () => {
    test("should show full label in normal mode", () => {
      const streak = { type: "success" as const, count: 1 };
      const { lastFrame } = render(<StreakDisplay streak={streak} compact={false} />);

      expect(lastFrame()).toMatch(/Current Streak:/);
      expect(lastFrame()).not.toMatch(/^Streak:$/);
    });

    test("should show abbreviated label in compact mode", () => {
      const streak = { type: "success" as const, count: 1 };
      const { lastFrame } = render(<StreakDisplay streak={streak} compact={true} />);

      expect(lastFrame()).toMatch(/Streak:/);
      expect(lastFrame()).not.toMatch(/Current Streak:/);
    });

    test("should use compact mode when explicitly set to false", () => {
      const streak = { type: "failure" as const, count: 2 };
      const { lastFrame } = render(<StreakDisplay streak={streak} compact={false} />);

      expect(lastFrame()).toMatch(/Current Streak:/);
    });
  });

  describe("Edge cases", () => {
    test("should handle very large streak counts", () => {
      const streak = { type: "success" as const, count: 999999 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/999999 ✓/);
    });

    test("should handle negative streak counts (edge case)", () => {
      const streak = { type: "failure" as const, count: -5 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/-5 ✗/);
    });

    test("should handle decimal streak counts (edge case)", () => {
      const streak = { type: "success" as const, count: 3.5 as any };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/3\.5 ✓/);
    });

    test("should handle NaN streak counts (edge case)", () => {
      const streak = { type: "failure" as const, count: NaN };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/NaN ✗/);
    });

    test("should handle Infinity streak counts (edge case)", () => {
      const streak = { type: "success" as const, count: Infinity };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/Infinity ✓/);
    });
  });

  describe("Component structure", () => {
    test("should render without crashing", () => {
      const streak = { type: "success" as const, count: 1 };

      expect(() => {
        render(<StreakDisplay streak={streak} />);
      }).not.toThrow();
    });

    test("should handle missing compact prop (default behavior)", () => {
      const streak = { type: "failure" as const, count: 2 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      expect(lastFrame()).toMatch(/Current Streak:/); // Should default to false
    });

    test("should handle all valid streak types", () => {
      const successStreak = { type: "success" as const, count: 1 };
      const failureStreak = { type: "failure" as const, count: 1 };

      const { lastFrame: successFrame } = render(<StreakDisplay streak={successStreak} />);
      const { lastFrame: failureFrame } = render(<StreakDisplay streak={failureStreak} />);

      expect(successFrame()).toMatch(/1 ✓/);
      expect(failureFrame()).toMatch(/1 ✗/);
    });
  });

  describe("Accessibility and content", () => {
    test("should include meaningful text for screen readers", () => {
      const streak = { type: "success" as const, count: 5 };
      const { lastFrame } = render(<StreakDisplay streak={streak} />);

      const frame = lastFrame();
      expect(frame).toMatch(/Current Streak:/);
      expect(frame).toMatch(/5/);
      expect(frame).toMatch(/✓/);
    });

    test("should be readable in both compact and normal modes", () => {
      const streak = { type: "failure" as const, count: 3 };

      const { lastFrame: normalFrame } = render(<StreakDisplay streak={streak} compact={false} />);
      const { lastFrame: compactFrame } = render(<StreakDisplay streak={streak} compact={true} />);

      expect(normalFrame()).toMatch(/Current Streak:/);
      expect(normalFrame()).toMatch(/3 ✗/);

      expect(compactFrame()).toMatch(/Streak:/);
      expect(compactFrame()).toMatch(/3 ✗/);
    });
  });
});
