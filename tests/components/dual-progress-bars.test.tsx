import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { DualProgressBars, type ResponsiveLayout } from "../../src/components/dual-progress-bars";

describe("DualProgressBars", () => {
  const createLayout = (overrides: Partial<ResponsiveLayout> = {}): ResponsiveLayout => ({
    isNarrow: false,
    isWide: false,
    isMedium: true,
    width: 80,
    contentWidth: 76,
    dualColumnWidth: 36,
    ...overrides,
  });

  describe("Narrow layout", () => {
    test("should render stacked progress bars on narrow screens", () => {
      const layout = createLayout({ isNarrow: true, width: 50 });
      const { lastFrame } = render(
        <DualProgressBars successRate={75.5} errorRate={24.5} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/🟢 Success/);
      expect(lastFrame()).toMatch(/75\.5%/);
      expect(lastFrame()).toMatch(/🔴 Error/);
      expect(lastFrame()).toMatch(/24\.5%/);
    });

    test("should handle 100% success rate on narrow screens", () => {
      const layout = createLayout({ isNarrow: true });
      const { lastFrame } = render(
        <DualProgressBars successRate={100} errorRate={0} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/100\.0%/);
      expect(lastFrame()).toMatch(/0\.0%/);
    });

    test("should handle 100% error rate on narrow screens", () => {
      const layout = createLayout({ isNarrow: true });
      const { lastFrame } = render(
        <DualProgressBars successRate={0} errorRate={100} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/0\.0%/);
      expect(lastFrame()).toMatch(/100\.0%/);
    });
  });

  describe("Wide layout", () => {
    test("should render side-by-side progress bars on wide screens", () => {
      const layout = createLayout({ isWide: true, width: 120, dualColumnWidth: 45 });
      const { lastFrame } = render(
        <DualProgressBars successRate={85.2} errorRate={14.8} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/🟢 Success Rate/);
      expect(lastFrame()).toMatch(/85\.2%/);
      expect(lastFrame()).toMatch(/🔴 Error Rate/);
      expect(lastFrame()).toMatch(/14\.8%/);
    });
  });

  describe("Medium layout", () => {
    test("should render side-by-side progress bars on medium screens", () => {
      const layout = createLayout({ isMedium: true });
      const { lastFrame } = render(
        <DualProgressBars successRate={60.3} errorRate={39.7} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/🟢 Success Rate/);
      expect(lastFrame()).toMatch(/60\.3%/);
      expect(lastFrame()).toMatch(/🔴 Error Rate/);
      expect(lastFrame()).toMatch(/39\.7%/);
    });
  });

  describe("Rate calculations", () => {
    test("should handle decimal rates correctly", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={66.666} errorRate={33.334} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/66\.7%/); // Rounded to 1 decimal
      expect(lastFrame()).toMatch(/33\.3%/); // Rounded to 1 decimal
    });

    test("should handle very small rates", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={99.9} errorRate={0.1} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/99\.9%/);
      expect(lastFrame()).toMatch(/0\.1%/);
    });

    test("should handle zero rates", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={0} errorRate={0} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/0\.0%/);
      expect(lastFrame()).toMatch(/0\.0%/);
    });

    test("should handle rates that sum to more than 100%", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={60} errorRate={50} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/60\.0%/);
      expect(lastFrame()).toMatch(/50\.0%/);
    });
  });

  describe("Layout responsiveness", () => {
    test("should adapt to very narrow screens", () => {
      const layout = createLayout({
        isNarrow: true,
        width: 30,
        contentWidth: 26,
        dualColumnWidth: 10,
      });
      const { lastFrame } = render(
        <DualProgressBars successRate={75} errorRate={25} layout={layout} />,
      );

      // Should still display both rates
      expect(lastFrame()).toMatch(/75\.0%/);
      expect(lastFrame()).toMatch(/25\.0%/);
    });

    test("should adapt to very wide screens", () => {
      const layout = createLayout({
        isWide: true,
        width: 200,
        contentWidth: 196,
        dualColumnWidth: 90,
      });
      const { lastFrame } = render(
        <DualProgressBars successRate={82.5} errorRate={17.5} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/Success Rate/);
      expect(lastFrame()).toMatch(/Error Rate/);
      expect(lastFrame()).toMatch(/82\.5%/);
      expect(lastFrame()).toMatch(/17\.5%/);
    });
  });

  describe("Edge cases", () => {
    test("should handle negative rates gracefully", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={-5} errorRate={105} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/-5\.0%/);
      expect(lastFrame()).toMatch(/105\.0%/);
    });

    test("should handle very large rates", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={999.99} errorRate={0.01} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/999\.99/);
      expect(lastFrame()).toMatch(/0\.0%/);
    });

    test("should handle NaN rates", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={NaN} errorRate={50} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/NaN/);
      expect(lastFrame()).toMatch(/50\.0%/);
    });

    test("should handle Infinity rates", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={Infinity} errorRate={25} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/Infinity/);
      expect(lastFrame()).toMatch(/25\.0%/);
    });
  });

  describe("Layout boundary conditions", () => {
    test("should handle exactly 60 width (narrow boundary)", () => {
      const layout = createLayout({
        isNarrow: false,
        isMedium: true,
        width: 60,
      });
      const { lastFrame } = render(
        <DualProgressBars successRate={70} errorRate={30} layout={layout} />,
      );

      // Should not be narrow, so side-by-side layout
      expect(lastFrame()).toMatch(/Success Rate/);
      expect(lastFrame()).toMatch(/Error Rate/);
    });

    test("should handle exactly 120 width (wide boundary)", () => {
      const layout = createLayout({
        isNarrow: false,
        isMedium: false,
        isWide: true,
        width: 120,
      });
      const { lastFrame } = render(
        <DualProgressBars successRate={80} errorRate={20} layout={layout} />,
      );

      // Should be wide layout
      expect(lastFrame()).toMatch(/Success Rate/);
      expect(lastFrame()).toMatch(/Error Rate/);
    });
  });

  describe("Progress bar values", () => {
    test("should round progress bar values correctly", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={75.4} errorRate={24.6} layout={layout} />,
      );

      // Values should be rounded for progress bars (Math.round())
      // but displayed with decimal precision in text
      expect(lastFrame()).toMatch(/75\.4%/);
      expect(lastFrame()).toMatch(/24\.6%/);
    });

    test("should handle decimal rounding edge cases", () => {
      const layout = createLayout();
      const { lastFrame } = render(
        <DualProgressBars successRate={50.5} errorRate={49.5} layout={layout} />,
      );

      expect(lastFrame()).toMatch(/50\.5%/);
      expect(lastFrame()).toMatch(/49\.5%/);
    });
  });
});
