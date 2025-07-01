import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { QualityIndicator } from "../../src/components/quality-indicator";

describe("QualityIndicator", () => {
  test("should render excellent quality (90+)", () => {
    const { lastFrame } = render(<QualityIndicator score={95.5} label="Excellent" />);

    expect(lastFrame()).toMatch(/🟢/);
    expect(lastFrame()).toMatch(/EXCELLENT/);
    expect(lastFrame()).toMatch(/\(95\.5\/100\)/);
  });

  test("should render good quality (70-89)", () => {
    const { lastFrame } = render(<QualityIndicator score={75.2} label="Good" />);

    expect(lastFrame()).toMatch(/🟡/);
    expect(lastFrame()).toMatch(/GOOD/);
    expect(lastFrame()).toMatch(/\(75\.2\/100\)/);
  });

  test("should render fair quality (50-69)", () => {
    const { lastFrame } = render(<QualityIndicator score={60.8} label="Fair" />);

    expect(lastFrame()).toMatch(/🟠/);
    expect(lastFrame()).toMatch(/FAIR/);
    expect(lastFrame()).toMatch(/\(60\.8\/100\)/);
  });

  test("should render poor quality (<50)", () => {
    const { lastFrame } = render(<QualityIndicator score={25.3} label="Poor" />);

    expect(lastFrame()).toMatch(/🔴/);
    expect(lastFrame()).toMatch(/POOR/);
    expect(lastFrame()).toMatch(/\(25\.3\/100\)/);
  });

  test("should render in compact mode", () => {
    const { lastFrame } = render(
      <QualityIndicator score={85.5} label="Very Good Quality" compact={true} />,
    );

    expect(lastFrame()).toMatch(/🟡/);
    expect(lastFrame()).toMatch(/VERY GOO/); // Truncated to 8 chars
    expect(lastFrame()).not.toMatch(/Very Good Quality/); // Full text not present
    expect(lastFrame()).toMatch(/\(85\.5\/100\)/);
  });

  test("should handle edge cases at boundaries", () => {
    // Test exactly 90
    const { lastFrame: frame90 } = render(<QualityIndicator score={90} label="Boundary" />);
    expect(frame90()).toMatch(/🟢/);

    // Test exactly 70
    const { lastFrame: frame70 } = render(<QualityIndicator score={70} label="Boundary" />);
    expect(frame70()).toMatch(/🟡/);

    // Test exactly 50
    const { lastFrame: frame50 } = render(<QualityIndicator score={50} label="Boundary" />);
    expect(frame50()).toMatch(/🟠/);

    // Test just below 50
    const { lastFrame: frame49 } = render(<QualityIndicator score={49.9} label="Boundary" />);
    expect(frame49()).toMatch(/🔴/);
  });

  test("should handle zero score", () => {
    const { lastFrame } = render(<QualityIndicator score={0} label="None" />);

    expect(lastFrame()).toMatch(/🔴/);
    expect(lastFrame()).toMatch(/NONE/);
    expect(lastFrame()).toMatch(/\(0\.0\/100\)/);
  });

  test("should handle maximum score", () => {
    const { lastFrame } = render(<QualityIndicator score={100} label="Perfect" />);

    expect(lastFrame()).toMatch(/🟢/);
    expect(lastFrame()).toMatch(/PERFECT/);
    expect(lastFrame()).toMatch(/\(100\.0\/100\)/);
  });

  test("should format decimal places correctly", () => {
    const { lastFrame } = render(<QualityIndicator score={12.3456789} label="Test" />);

    expect(lastFrame()).toMatch(/\(12\.3\/100\)/); // Should be rounded to 1 decimal
  });

  test("should handle very small decimal values", () => {
    const { lastFrame } = render(<QualityIndicator score={0.1} label="Minimal" />);

    expect(lastFrame()).toMatch(/🔴/);
    expect(lastFrame()).toMatch(/\(0\.1\/100\)/);
  });

  test("should handle exactly 8 character label in compact mode", () => {
    const { lastFrame } = render(<QualityIndicator score={75} label="ExactFit" compact={true} />);

    expect(lastFrame()).toMatch(/🟡/);
    expect(lastFrame()).toMatch(/EXACTFIT/);
  });

  test("should handle short labels in compact mode", () => {
    const { lastFrame } = render(<QualityIndicator score={85} label="OK" compact={true} />);

    expect(lastFrame()).toMatch(/🟡/);
    expect(lastFrame()).toMatch(/OK/);
  });

  test("should handle integer scores", () => {
    const { lastFrame } = render(<QualityIndicator score={88} label="Integer" />);

    expect(lastFrame()).toMatch(/🟡/);
    expect(lastFrame()).toMatch(/INTEGER/);
    expect(lastFrame()).toMatch(/\(88\.0\/100\)/);
  });

  test("should handle negative scores (edge case)", () => {
    const { lastFrame } = render(<QualityIndicator score={-5} label="Negative" />);

    expect(lastFrame()).toMatch(/🔴/); // Should be red for negative
    expect(lastFrame()).toMatch(/NEGATIVE/);
    expect(lastFrame()).toMatch(/\(-5\.0\/100\)/);
  });

  test("should handle scores above 100 (edge case)", () => {
    const { lastFrame } = render(<QualityIndicator score={105} label="Above" />);

    expect(lastFrame()).toMatch(/🟢/); // Should be green for >90
    expect(lastFrame()).toMatch(/ABOVE/);
    expect(lastFrame()).toMatch(/\(105\.0\/100\)/);
  });
});
