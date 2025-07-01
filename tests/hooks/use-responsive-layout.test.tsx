import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
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

  const testHook = (columns: number | undefined | null = 80) => {
    mockUseStdout.mockReturnValue({
      stdout: columns === undefined || columns === null ? null : { columns },
    });
    return useResponsiveLayout();
  };

  describe("Terminal width detection", () => {
    test("should use provided terminal width", () => {
      const result = testHook(100);
      expect(result.width).toBe(100);
    });

    test("should default to 80 when stdout is null", () => {
      mockUseStdout.mockReturnValue({ stdout: null });
      const result = useResponsiveLayout();
      expect(result.width).toBe(80);
    });

    test("should default to 80 when columns is undefined", () => {
      mockUseStdout.mockReturnValue({ stdout: { columns: undefined } });
      const result = useResponsiveLayout();
      expect(result.width).toBe(80);
    });
  });

  describe("Layout categorization", () => {
    test("should identify narrow layout (< 60)", () => {
      const result = testHook(50);
      expect(result.isNarrow).toBe(true);
      expect(result.isMedium).toBe(false);
      expect(result.isWide).toBe(false);
    });

    test("should identify medium layout (80-119)", () => {
      const result = testHook(100);
      expect(result.isNarrow).toBe(false);
      expect(result.isMedium).toBe(true);
      expect(result.isWide).toBe(false);
    });

    test("should identify wide layout (>= 120)", () => {
      const result = testHook(150);
      expect(result.isNarrow).toBe(false);
      expect(result.isMedium).toBe(false);
      expect(result.isWide).toBe(true);
    });

    test("should handle boundary cases correctly", () => {
      // Test exactly 59 (narrow)
      const narrow = testHook(59);
      expect(narrow.isNarrow).toBe(true);
      expect(narrow.isMedium).toBe(false);

      // Test exactly 60 (medium)
      const medium60 = testHook(60);
      expect(medium60.isNarrow).toBe(false);
      expect(medium60.isMedium).toBe(false); // 60-79 is neither medium nor wide
      expect(medium60.isWide).toBe(false);

      // Test exactly 80 (medium)
      const medium80 = testHook(80);
      expect(medium80.isNarrow).toBe(false);
      expect(medium80.isMedium).toBe(true);
      expect(medium80.isWide).toBe(false);

      // Test exactly 119 (medium)
      const medium119 = testHook(119);
      expect(medium119.isNarrow).toBe(false);
      expect(medium119.isMedium).toBe(true);
      expect(medium119.isWide).toBe(false);

      // Test exactly 120 (wide)
      const wide = testHook(120);
      expect(wide.isNarrow).toBe(false);
      expect(wide.isMedium).toBe(false);
      expect(wide.isWide).toBe(true);
    });
  });

  describe("Content width calculation", () => {
    test("should calculate content width with minimum of 40", () => {
      const result = testHook(30);
      expect(result.contentWidth).toBe(40); // Math.max(40, 30-4) = 40
    });

    test("should calculate content width with maximum of 100", () => {
      const result = testHook(200);
      expect(result.contentWidth).toBe(100); // Math.min(200-4, 100) = 100
    });

    test("should calculate content width normally for typical sizes", () => {
      const result = testHook(80);
      expect(result.contentWidth).toBe(76); // 80 - 4
    });

    test("should handle edge case with exactly 44 columns", () => {
      const result = testHook(44);
      expect(result.contentWidth).toBe(40); // Math.max(40, 44-4) = 40
    });

    test("should handle edge case with exactly 104 columns", () => {
      const result = testHook(104);
      expect(result.contentWidth).toBe(100); // Math.min(104-4, 100) = 100
    });
  });

  describe("Dual column width calculation", () => {
    test("should calculate dual column width correctly", () => {
      const result = testHook(100);
      expect(result.dualColumnWidth).toBe(46); // Math.floor((100-8)/2) = 46
    });

    test("should handle odd width calculations", () => {
      const result = testHook(101);
      expect(result.dualColumnWidth).toBe(46); // Math.floor((101-8)/2) = 46
    });

    test("should handle very narrow widths for dual columns", () => {
      const result = testHook(20);
      expect(result.dualColumnWidth).toBe(6); // Math.floor((20-8)/2) = 6
    });

    test("should handle negative calculations gracefully", () => {
      const result = testHook(5);
      expect(result.dualColumnWidth).toBe(-2); // Math.floor((5-8)/2) = Math.floor(-1.5) = -2
    });
  });

  describe("Complete layout object", () => {
    test("should return all expected properties", () => {
      const result = testHook(100);
      expect(result).toEqual({
        width: 100,
        contentWidth: 96, // Math.max(40, Math.min(100-4, 100)) = 96
        dualColumnWidth: 46, // Math.floor((100-8)/2) = 46
        isNarrow: false,
        isMedium: true,
        isWide: false,
      });
    });

    test("should handle very small terminal widths", () => {
      const result = testHook(20);
      expect(result).toEqual({
        width: 20,
        contentWidth: 40, // Math.max(40, Math.min(20-4, 100)) = 40
        dualColumnWidth: 6, // Math.floor((20-8)/2) = 6
        isNarrow: true,
        isMedium: false,
        isWide: false,
      });
    });

    test("should handle very large terminal widths", () => {
      const result = testHook(300);
      expect(result).toEqual({
        width: 300,
        contentWidth: 100, // Math.max(40, Math.min(300-4, 100)) = 100
        dualColumnWidth: 146, // Math.floor((300-8)/2) = 146
        isNarrow: false,
        isMedium: false,
        isWide: true,
      });
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle zero columns", () => {
      const result = testHook(0);
      expect(result.width).toBe(0);
      expect(result.contentWidth).toBe(40); // Math.max(40, -4) = 40
    });

    test("should handle negative columns", () => {
      const result = testHook(-10);
      expect(result.width).toBe(-10);
      expect(result.contentWidth).toBe(40); // Math.max(40, -14) = 40
    });

    test("should handle NaN columns", () => {
      mockUseStdout.mockReturnValue({ stdout: { columns: NaN } });
      const result = useResponsiveLayout();
      expect(result.width).toBe(80); // Default fallback
    });

    test("should handle undefined columns property", () => {
      mockUseStdout.mockReturnValue({ stdout: { columns: undefined } });
      const result = useResponsiveLayout();
      expect(result.width).toBe(80); // Default fallback
    });

    test("should handle null columns property", () => {
      mockUseStdout.mockReturnValue({ stdout: { columns: null } });
      const result = useResponsiveLayout();
      expect(result.width).toBe(80); // Default fallback
    });
  });
});
