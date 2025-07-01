import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { MetricsGrid } from "../../src/components/metrics-grid";
import type { ResponsiveLayout } from "../../src/components/dual-progress-bars";

describe("MetricsGrid", () => {
  const createLayout = (overrides: Partial<ResponsiveLayout> = {}): ResponsiveLayout => ({
    isNarrow: false,
    isWide: false,
    isMedium: true,
    width: 80,
    contentWidth: 76,
    dualColumnWidth: 36,
    ...overrides,
  });

  const TestChild = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

  describe("Narrow layout", () => {
    test("should render children in single column on narrow screens", () => {
      const layout = createLayout({ isNarrow: true });
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
      const layout = createLayout({ isNarrow: true });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Single Item</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Single Item/);
    });

    test("should handle no children on narrow screens", () => {
      const layout = createLayout({ isNarrow: true });
      const { lastFrame } = render(<MetricsGrid layout={layout}></MetricsGrid>);

      expect(lastFrame()).not.toThrow();
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
          <TestChild>Item 4</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 2/);
      expect(lastFrame()).toMatch(/Item 3/);
      expect(lastFrame()).toMatch(/Item 4/);
    });

    test("should handle odd number of children on wide screens", () => {
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

    test("should handle single child on wide screens", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Single Item</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Single Item/);
    });

    test("should handle large number of children on wide screens", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const children = Array.from({ length: 10 }, (_, i) => (
        <TestChild key={i}>Item {i + 1}</TestChild>
      ));

      const { lastFrame } = render(<MetricsGrid layout={layout}>{children}</MetricsGrid>);

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 10/);
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
    test("should handle mixed React element types", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <div>Div element</div>
          <span>Span element</span>
          <TestChild>Custom component</TestChild>
          {"Text node"}
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Div element/);
      expect(lastFrame()).toMatch(/Span element/);
      expect(lastFrame()).toMatch(/Custom component/);
      expect(lastFrame()).toMatch(/Text node/);
    });

    test("should handle fragments and nested elements", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <React.Fragment>
            <TestChild>Fragment child 1</TestChild>
            <TestChild>Fragment child 2</TestChild>
          </React.Fragment>
          <div>
            <span>Nested content</span>
          </div>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Fragment child 1/);
      expect(lastFrame()).toMatch(/Fragment child 2/);
      expect(lastFrame()).toMatch(/Nested content/);
    });

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

  describe("Layout boundaries", () => {
    test("should handle transition from narrow to medium", () => {
      const layout = createLayout({
        isNarrow: false,
        isMedium: true,
        isWide: false,
        width: 60,
      });

      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Item 1</TestChild>
          <TestChild>Item 2</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 2/);
    });

    test("should handle transition from medium to wide", () => {
      const layout = createLayout({
        isNarrow: false,
        isMedium: false,
        isWide: true,
        width: 120,
      });

      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Item 1</TestChild>
          <TestChild>Item 2</TestChild>
          <TestChild>Item 3</TestChild>
          <TestChild>Item 4</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 2/);
      expect(lastFrame()).toMatch(/Item 3/);
      expect(lastFrame()).toMatch(/Item 4/);
    });
  });

  describe("Column distribution on wide screens", () => {
    test("should distribute even number of children correctly", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Left 1</TestChild> {/* index 0 - left */}
          <TestChild>Right 1</TestChild> {/* index 1 - right */}
          <TestChild>Left 2</TestChild> {/* index 2 - left */}
          <TestChild>Right 2</TestChild> {/* index 3 - right */}
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Left 1/);
      expect(lastFrame()).toMatch(/Right 1/);
      expect(lastFrame()).toMatch(/Left 2/);
      expect(lastFrame()).toMatch(/Right 2/);
    });

    test("should distribute odd number of children correctly", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild>Left 1</TestChild> {/* index 0 - left */}
          <TestChild>Right 1</TestChild> {/* index 1 - right */}
          <TestChild>Left 2</TestChild> {/* index 2 - left */}
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/Left 1/);
      expect(lastFrame()).toMatch(/Right 1/);
      expect(lastFrame()).toMatch(/Left 2/);
    });

    test("should handle empty children array on wide screens", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(<MetricsGrid layout={layout}>{[]}</MetricsGrid>);

      expect(lastFrame()).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    test("should handle very large number of children", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const manyChildren = Array.from({ length: 100 }, (_, i) => (
        <TestChild key={i}>Item {i + 1}</TestChild>
      ));

      const { lastFrame } = render(<MetricsGrid layout={layout}>{manyChildren}</MetricsGrid>);

      expect(lastFrame()).toMatch(/Item 1/);
      expect(lastFrame()).toMatch(/Item 100/);
    });

    test("should handle children with keys", () => {
      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <TestChild key="first">First item</TestChild>
          <TestChild key="second">Second item</TestChild>
          <TestChild key="third">Third item</TestChild>
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/First item/);
      expect(lastFrame()).toMatch(/Second item/);
      expect(lastFrame()).toMatch(/Third item/);
    });

    test("should handle children with complex props", () => {
      const ComplexChild = ({ id, data }: { id: string; data: { value: number } }) => (
        <div>
          {id}: {data.value}
        </div>
      );

      const layout = createLayout({ isWide: true, isNarrow: false, isMedium: false });
      const { lastFrame } = render(
        <MetricsGrid layout={layout}>
          <ComplexChild id="test1" data={{ value: 42 }} />
          <ComplexChild id="test2" data={{ value: 84 }} />
        </MetricsGrid>,
      );

      expect(lastFrame()).toMatch(/test1: 42/);
      expect(lastFrame()).toMatch(/test2: 84/);
    });
  });
});
