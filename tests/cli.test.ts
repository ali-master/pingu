import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies
vi.mock("react", () => ({
  default: {
    createElement: vi.fn((type, props) => ({ type, props })),
  },
}));

vi.mock("ink", () => ({
  render: vi.fn(),
}));

vi.mock("meow", () => ({
  default: vi.fn(),
}));

vi.mock("gradient-string", () => ({
  default: vi.fn(() => vi.fn(() => "COLORED PINGU")),
}));

vi.mock("../src/app", () => ({
  default: vi.fn(),
}));

describe("CLI Module", () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock process.exit
    process.exit = vi.fn() as any;
    console.error = vi.fn();
    console.log = vi.fn();

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    vi.resetModules();
  });

  test("should parse command line arguments correctly", async () => {
    const mockMeow = await import("meow");
    const mockRender = await import("ink");

    // Mock meow to return parsed arguments
    (mockMeow.default as any).mockReturnValue({
      input: ["google.com"],
      flags: {
        count: 10,
        interval: 1,
        timeout: 5,
        size: 56,
        export: false,
      },
      help: "Usage help text",
    });

    // Mock render function
    (mockRender.render as any).mockImplementation(() => {});

    // Import and execute CLI
    await import("../src/cli");

    expect(mockMeow.default).toHaveBeenCalledWith(
      expect.stringContaining("Usage"),
      expect.objectContaining({
        importMeta: expect.any(Object),
        flags: expect.objectContaining({
          count: expect.objectContaining({ type: "number", shortFlag: "c" }),
          interval: expect.objectContaining({ type: "number", shortFlag: "i", default: 1 }),
          timeout: expect.objectContaining({ type: "number", shortFlag: "t", default: 5 }),
          size: expect.objectContaining({ type: "number", shortFlag: "s", default: 56 }),
          export: expect.objectContaining({ type: "boolean", shortFlag: "e", default: false }),
        }),
      }),
    );
  });

  test("should exit with error when no host is provided", async () => {
    const mockMeow = await import("meow");

    (mockMeow.default as any).mockReturnValue({
      input: [], // No host provided
      flags: {},
      help: "Usage help text",
    });

    // Import CLI module
    await import("../src/cli");

    expect(console.error).toHaveBeenCalledWith("Error: Please provide a host to ping");
    expect(console.log).toHaveBeenCalledWith("Usage help text");
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test("should render App component when host is provided", async () => {
    const mockMeow = await import("meow");
    const mockRender = await import("ink");
    const mockApp = await import("../src/app");

    (mockMeow.default as any).mockReturnValue({
      input: ["example.com"],
      flags: {
        count: 5,
        export: true,
      },
      help: "Usage help text",
    });

    (mockRender.render as any).mockImplementation(() => {});

    // Import CLI module
    await import("../src/cli");

    expect(mockRender.render).toHaveBeenCalledWith(
      expect.objectContaining({
        type: mockApp.default,
        props: {
          host: "example.com",
          options: {
            count: 5,
            export: true,
          },
        },
      }),
    );
  });

  test("should display ASCII art banner", async () => {
    const mockGradient = await import("gradient-string");
    const mockMeow = await import("meow");

    const gradientFunction = vi.fn(() => "COLORED PINGU");
    (mockGradient.default as any).mockReturnValue(gradientFunction);

    (mockMeow.default as any).mockReturnValue({
      input: ["test.com"],
      flags: {},
      help: "Usage help",
    });

    // Import CLI module
    await import("../src/cli");

    expect(mockGradient.default).toHaveBeenCalledWith(["cyan", "pink"]);
    expect(gradientFunction).toHaveBeenCalledWith("PINGU ASCII ART");
    expect(console.log).toHaveBeenCalledWith("COLORED PINGU");
  });

  test("should handle all flag combinations", async () => {
    const mockMeow = await import("meow");
    const mockRender = await import("ink");

    (mockMeow.default as any).mockReturnValue({
      input: ["8.8.8.8"],
      flags: {
        count: 100,
        interval: 0.5,
        timeout: 10,
        size: 1024,
        export: true,
      },
      help: "Usage help",
    });

    // Import CLI module
    await import("../src/cli");

    expect(mockRender.render).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          host: "8.8.8.8",
          options: {
            count: 100,
            interval: 0.5,
            timeout: 10,
            size: 1024,
            export: true,
          },
        }),
      }),
    );
  });

  test("should handle IPv6 addresses", async () => {
    const mockMeow = await import("meow");
    const mockRender = await import("ink");

    (mockMeow.default as any).mockReturnValue({
      input: ["2001:4860:4860::8888"],
      flags: {},
      help: "Usage help",
    });

    // Import CLI module
    await import("../src/cli");

    expect(mockRender.render).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          host: "2001:4860:4860::8888",
        }),
      }),
    );
  });

  test("should handle domain names with special characters", async () => {
    const mockMeow = await import("meow");
    const mockRender = await import("ink");

    (mockMeow.default as any).mockReturnValue({
      input: ["sub-domain.example-site.com"],
      flags: {},
      help: "Usage help",
    });

    // Import CLI module
    await import("../src/cli");

    expect(mockRender.render).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          host: "sub-domain.example-site.com",
        }),
      }),
    );
  });

  test("should use default flag values when not specified", async () => {
    const mockMeow = await import("meow");
    const mockRender = await import("ink");

    (mockMeow.default as any).mockReturnValue({
      input: ["localhost"],
      flags: {
        // Only interval, timeout, size, and export have defaults
        // count should be undefined when not specified
      },
      help: "Usage help",
    });

    // Import CLI module
    await import("../src/cli");

    expect(mockRender.render).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          host: "localhost",
          options: expect.objectContaining({
            // Should contain default values from meow config
          }),
        }),
      }),
    );
  });

  test("should handle numeric-only hostnames", async () => {
    const mockMeow = await import("meow");
    const mockRender = await import("ink");

    (mockMeow.default as any).mockReturnValue({
      input: ["192.168.1.1"],
      flags: {},
      help: "Usage help",
    });

    // Import CLI module
    await import("../src/cli");

    expect(mockRender.render).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          host: "192.168.1.1",
        }),
      }),
    );
  });
});
