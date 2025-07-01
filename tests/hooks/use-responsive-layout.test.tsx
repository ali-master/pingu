import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useResponsiveLayout } from "../../src/hooks/use-responsive-layout";

// Mock ink's useStdout hook
vi.mock("ink", () => ({
  useStdout: vi.fn(),
}));

describe("useResponsiveLayout", () => {
  let mockUseStdout: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseStdout = vi.mocked((await import("ink")).useStdout);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Terminal width detection", () => {
    test("should use provided terminal width", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 100 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(100);
    });

    test("should default to 80 when stdout is null", () => {
      mockUseStdout.mockReturnValue({
        stdout: null,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(80);
    });

    test("should default to 80 when columns is undefined", () => {
      mockUseStdout.mockReturnValue({
        stdout: {} as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(80);
    });
  });

  describe("Layout categorization", () => {
    test("should identify narrow layout (< 60)", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 50 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isNarrow).toBe(true);
      expect(result.current.isMedium).toBe(false);
      expect(result.current.isWide).toBe(false);
    });

    test("should identify medium layout (80-119)", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 100 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isNarrow).toBe(false);
      expect(result.current.isMedium).toBe(true);
      expect(result.current.isWide).toBe(false);
    });

    test("should identify wide layout (>= 120)", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 150 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isNarrow).toBe(false);
      expect(result.current.isMedium).toBe(false);
      expect(result.current.isWide).toBe(true);
    });

    test("should handle boundary cases correctly", () => {
      // Test width = 59 (narrow)
      mockUseStdout.mockReturnValue({
        stdout: { columns: 59 } as NodeJS.WriteStream,
      });

      let { result } = renderHook(() => useResponsiveLayout());
      expect(result.current.isNarrow).toBe(true);

      // Test width = 60 (not narrow, but not medium either)
      mockUseStdout.mockReturnValue({
        stdout: { columns: 60 } as NodeJS.WriteStream,
      });

      ({ result } = renderHook(() => useResponsiveLayout()));
      expect(result.current.isNarrow).toBe(false);
      expect(result.current.isMedium).toBe(false);
      expect(result.current.isWide).toBe(false);

      // Test width = 80 (medium)
      mockUseStdout.mockReturnValue({
        stdout: { columns: 80 } as NodeJS.WriteStream,
      });

      ({ result } = renderHook(() => useResponsiveLayout()));
      expect(result.current.isMedium).toBe(true);

      // Test width = 119 (still medium)
      mockUseStdout.mockReturnValue({
        stdout: { columns: 119 } as NodeJS.WriteStream,
      });

      ({ result } = renderHook(() => useResponsiveLayout()));
      expect(result.current.isMedium).toBe(true);
      expect(result.current.isWide).toBe(false);

      // Test width = 120 (wide)
      mockUseStdout.mockReturnValue({
        stdout: { columns: 120 } as NodeJS.WriteStream,
      });

      ({ result } = renderHook(() => useResponsiveLayout()));
      expect(result.current.isWide).toBe(true);
      expect(result.current.isMedium).toBe(false);
    });
  });

  describe("Content width calculation", () => {
    test("should calculate content width with minimum of 40", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 30 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.contentWidth).toBe(40); // Math.max(40, 30-4)
    });

    test("should calculate content width with maximum of 100", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 200 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.contentWidth).toBe(100); // Math.min(200-4, 100)
    });

    test("should calculate content width normally for typical sizes", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 80 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.contentWidth).toBe(76); // 80 - 4
    });

    test("should handle edge case with exactly 44 columns", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 44 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.contentWidth).toBe(40); // Math.max(40, 44-4)
    });

    test("should handle edge case with exactly 104 columns", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 104 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.contentWidth).toBe(100); // Math.min(104-4, 100)
    });
  });

  describe("Dual column width calculation", () => {
    test("should calculate dual column width correctly", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 100 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.dualColumnWidth).toBe(46); // Math.floor((100-8)/2)
    });

    test("should handle odd width calculations", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 101 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.dualColumnWidth).toBe(46); // Math.floor((101-8)/2) = Math.floor(93/2) = 46
    });

    test("should handle very narrow widths for dual columns", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 20 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.dualColumnWidth).toBe(6); // Math.floor((20-8)/2)
    });

    test("should handle negative calculations gracefully", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 5 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.dualColumnWidth).toBe(-1); // Math.floor((5-8)/2) = Math.floor(-3/2) = -1
    });
  });

  describe("Complete layout object", () => {
    test("should return all expected properties", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 100 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current).toEqual({
        isNarrow: false,
        isWide: false,
        isMedium: true,
        width: 100,
        contentWidth: 96,
        dualColumnWidth: 46,
      });
    });

    test("should handle very small terminal widths", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 10 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current).toEqual({
        isNarrow: true,
        isWide: false,
        isMedium: false,
        width: 10,
        contentWidth: 40, // Minimum enforced
        dualColumnWidth: 1,
      });
    });

    test("should handle very large terminal widths", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 300 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current).toEqual({
        isNarrow: false,
        isWide: true,
        isMedium: false,
        width: 300,
        contentWidth: 100, // Maximum enforced
        dualColumnWidth: 146,
      });
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle zero columns", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: 0 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(0);
      expect(result.current.contentWidth).toBe(40); // Minimum enforced
      expect(result.current.isNarrow).toBe(true);
    });

    test("should handle negative columns", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: -10 } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(-10);
      expect(result.current.contentWidth).toBe(40); // Minimum enforced
      expect(result.current.isNarrow).toBe(true);
    });

    test("should handle NaN columns", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: NaN } as NodeJS.WriteStream,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(80); // Default fallback
    });

    test("should handle undefined columns property", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: undefined } as any,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(80); // Default fallback
    });

    test("should handle null columns property", () => {
      mockUseStdout.mockReturnValue({
        stdout: { columns: null } as any,
      });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.width).toBe(80); // Default fallback
    });
  });
});
