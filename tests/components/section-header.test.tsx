import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "ink-testing-library";
import { SectionHeader } from "../../src/components/section-header";

describe("SectionHeader", () => {
  test("should render title and icon in normal mode", () => {
    const { lastFrame } = render(<SectionHeader title="Network Quality" icon="🌐" />);

    expect(lastFrame()).toMatch(/🌐/);
    expect(lastFrame()).toMatch(/Network Quality/);
  });

  test("should render title and icon in compact mode", () => {
    const { lastFrame } = render(
      <SectionHeader title="Network Quality Assessment" icon="🌐" compact={true} />,
    );

    expect(lastFrame()).toMatch(/🌐/);
    expect(lastFrame()).toMatch(/Network Qual/); // Truncated to 12 chars
    expect(lastFrame()).not.toMatch(/Network Quality Assessment/); // Full text not present
  });

  test("should handle short titles in compact mode", () => {
    const { lastFrame } = render(<SectionHeader title="Stats" icon="📊" compact={true} />);

    expect(lastFrame()).toMatch(/📊/);
    expect(lastFrame()).toMatch(/Stats/);
  });

  test("should handle empty title", () => {
    const { lastFrame } = render(<SectionHeader title="" icon="🔍" />);

    expect(lastFrame()).toMatch(/🔍/);
    // Should render without crashing
  });

  test("should handle unicode icons", () => {
    const { lastFrame } = render(<SectionHeader title="Test" icon="🚀" />);

    expect(lastFrame()).toMatch(/🚀/);
    expect(lastFrame()).toMatch(/Test/);
  });

  test("should render without compact mode by default", () => {
    const { lastFrame } = render(
      <SectionHeader title="Very Long Section Title That Should Not Be Truncated" icon="⚡" />,
    );

    expect(lastFrame()).toMatch(/⚡/);
    expect(lastFrame()).toMatch(/Very Long Section Title That Should Not Be Truncated/);
  });

  test("should handle long titles correctly in compact mode", () => {
    const longTitle = "This is a very long title that exceeds twelve characters";
    const { lastFrame } = render(<SectionHeader title={longTitle} icon="🎯" compact={true} />);

    expect(lastFrame()).toMatch(/🎯/);
    expect(lastFrame()).toMatch(/This is a ve/); // First 12 characters
    expect(lastFrame()).not.toMatch(/very long title/); // Rest should be truncated
  });

  test("should handle exactly 12 character title in compact mode", () => {
    const { lastFrame } = render(<SectionHeader title="ExactlyTwelv" icon="✨" compact={true} />);

    expect(lastFrame()).toMatch(/✨/);
    expect(lastFrame()).toMatch(/ExactlyTwelv/);
  });
});
