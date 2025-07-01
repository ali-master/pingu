import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { MetricRow } from "../../src/components/metric-row";

describe("MetricRow", () => {
  test("should render label and value", () => {
    const { lastFrame } = render(<MetricRow label="Response Time" value={25.5} />);

    expect(lastFrame()).toMatch(/Response Time:/);
    expect(lastFrame()).toMatch(/25\.5/);
  });

  test("should render with unit", () => {
    const { lastFrame } = render(<MetricRow label="Packet Loss" value={2.5} unit="%" />);

    expect(lastFrame()).toMatch(/Packet Loss:/);
    expect(lastFrame()).toMatch(/2\.5/);
    expect(lastFrame()).toMatch(/%/);
  });

  test("should render string values", () => {
    const { lastFrame } = render(<MetricRow label="Status" value="Excellent" />);

    expect(lastFrame()).toMatch(/Status:/);
    expect(lastFrame()).toMatch(/Excellent/);
  });

  test("should render in compact mode", () => {
    const { lastFrame } = render(
      <MetricRow label="Very Long Label Name" value={100} compact={true} />,
    );

    expect(lastFrame()).toMatch(/Very Long/); // Truncated to 10 chars
    expect(lastFrame()).not.toMatch(/Very Long Label Name/); // Full text not present
    expect(lastFrame()).toMatch(/100/);
  });

  test("should handle zero values", () => {
    const { lastFrame } = render(<MetricRow label="Failures" value={0} />);

    expect(lastFrame()).toMatch(/Failures:/);
    expect(lastFrame()).toMatch(/0/);
  });

  test("should handle negative values", () => {
    const { lastFrame } = render(<MetricRow label="Offset" value={-5.2} unit="ms" />);

    expect(lastFrame()).toMatch(/Offset:/);
    expect(lastFrame()).toMatch(/-5\.2/);
    expect(lastFrame()).toMatch(/ms/);
  });

  test("should handle large values", () => {
    const { lastFrame } = render(<MetricRow label="Total Bytes" value={1234567} unit="bytes" />);

    expect(lastFrame()).toMatch(/Total Bytes:/);
    expect(lastFrame()).toMatch(/1234567/);
    expect(lastFrame()).toMatch(/bytes/);
  });

  test("should handle decimal values", () => {
    const { lastFrame } = render(<MetricRow label="Average" value={12.345} unit="ms" />);

    expect(lastFrame()).toMatch(/Average:/);
    expect(lastFrame()).toMatch(/12\.345/);
    expect(lastFrame()).toMatch(/ms/);
  });

  test("should use custom color", () => {
    const { lastFrame } = render(
      <MetricRow label="Success Rate" value={95} unit="%" color="green" />,
    );

    expect(lastFrame()).toMatch(/Success Rate:/);
    expect(lastFrame()).toMatch(/95/);
    expect(lastFrame()).toMatch(/%/);
  });

  test("should handle empty string values", () => {
    const { lastFrame } = render(<MetricRow label="Description" value="" />);

    expect(lastFrame()).toMatch(/Description:/);
    expect(lastFrame()).toMatch(/$/); // Should end properly without crashing
  });

  test("should handle short labels in compact mode", () => {
    const { lastFrame } = render(<MetricRow label="TTL" value={64} compact={true} />);

    expect(lastFrame()).toMatch(/TTL:/);
    expect(lastFrame()).toMatch(/64/);
  });

  test("should handle exactly 10 character label in compact mode", () => {
    const { lastFrame } = render(<MetricRow label="TenCharMax" value={42} compact={true} />);

    expect(lastFrame()).toMatch(/TenCharMax:/);
    expect(lastFrame()).toMatch(/42/);
  });

  test("should render without unit when not provided", () => {
    const { lastFrame } = render(<MetricRow label="Count" value={150} />);

    expect(lastFrame()).toMatch(/Count:/);
    expect(lastFrame()).toMatch(/150/);
    // Should not have any unit text
  });

  test("should handle special characters in values", () => {
    const { lastFrame } = render(<MetricRow label="Special" value="N/A" />);

    expect(lastFrame()).toMatch(/Special:/);
    expect(lastFrame()).toMatch(/N\/A/);
  });
});
