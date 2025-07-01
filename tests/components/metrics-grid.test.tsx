import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { Text } from "ink";
import { MetricsGrid } from "../../src/components/metrics-grid";
import type { ResponsiveLayout } from "../../src/components/dual-progress-bars";

describe("MetricsGrid", () => {
  const createLayout = (overrides: Partial<ResponsiveLayout> = {}): ResponsiveLayout => ({
    width: 80,
    contentWidth: 76,
    dualColumnWidth: 36,
    isNarrow: false,
    isMedium: true,
    isWide: false,
    ...overrides,
  });

  const TestChild = ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>;

  describe("Narrow layout", () => {
    test("should render children in single column on narrow screens", () => {
      const layout = createLayout({ isNarrow: true, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Item 1</TestChild>
          <TestChild>Item 2</TestChild>
          <TestChild>Item 3</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 2/);
      expect(lastFrame()).toMatch(/Item 3/);
    });

    test("should handle single child on narrow screens", () => {
      const layout = createLayout({ isNarrow: true, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Single Item</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Single Item/);
    });

    test("should handle no children on narrow screens", () => {
      const layout = createLayout({ isNarrow: true, isMedium: false });
      const { lastFrame } = render(<MetricsGrid layout={layout}></MetricsGrid>);

      expect(lastFrame()).toBeDefined();
    });
  });

  describe("Wide layout", () => {
    test("should render children in two columns on wide screens", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Item 1</TestChild>
          <TestChild>Item 2</TestChild>
          <TestChild>Item 3</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 2/);
      expect(lastFrame()).toMatch(/Item 3/);
    });

    test("should handle odd number of children on wide screens", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Item 1</TestChild>
          <TestChild>Item 2</TestChild>
          <TestChild>Item 3</TestChild>
          <TestChild>Item 4</TestChild>
          <TestChild>Item 5</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 2/);
      expect(lastFrame()).toMatch(/Item 5/);
    });

    test("should handle single child on wide screens", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Single Item</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Single Item/);
    });
  });

  describe("Medium layout", () => {
    test("should render children in single column on medium screens", () => {
      const layout = createLayout({ isMedium: true, isNarrow: false, isWide: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Item 1</TestChild>
          <TestChild>Item 2</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 2/);
    });
  });

  describe("Children handling", () => {
    test("should handle null and undefined children", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Valid child 1</TestChild>
          {null}
          {undefined}
          <TestChild>Valid child 2</TestChild>
          {false}
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Valid child 1/);
      expect(lastFrame()).toMatch(/Valid child 2/);
    });

    test("should handle conditional children", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const showConditional = true;

      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Always shown</TestChild>
          {showConditional && <TestChild>Conditionally shown</TestChild>}
          {!showConditional && <TestChild>Not shown</TestChild>}
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Always shown/);
      expect(lastFrame()).toMatch(/Conditionally shown/);
      expect(lastFrame()).not.toMatch(/Not shown/);
    });
  });
});
