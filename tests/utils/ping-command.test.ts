import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { buildPingArgs } from "../../src/utils/ping-command";

describe("buildPingArgs", () => {
  const originalPlatform = process.platform;

  afterEach(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      writable: true,
    });
  });

  describe("Windows platform", () => {
    beforeEach(() => {
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
      });
    });

    test("should build Windows args with count", () => {
      const args = buildPingArgs("google.com", { count: 5 });
      expect(args).toEqual(["-n", "5", "google.com"]);
    });

    test("should build Windows args for continuous ping", () => {
      const args = buildPingArgs("google.com", {});
      expect(args).toEqual(["-t", "google.com"]);
    });

    test("should build Windows args with timeout", () => {
      const args = buildPingArgs("google.com", { timeout: 5 });
      expect(args).toEqual(["-t", "-w", "5000", "google.com"]);
    });

    test("should build Windows args with size", () => {
      const args = buildPingArgs("google.com", { size: 64 });
      expect(args).toEqual(["-t", "-l", "64", "google.com"]);
    });

    test("should build Windows args with all options", () => {
      const args = buildPingArgs("google.com", {
        count: 10,
        timeout: 3,
        size: 32,
      });
      expect(args).toEqual(["-n", "10", "-w", "3000", "-l", "32", "google.com"]);
    });
  });

  describe("macOS platform", () => {
    beforeEach(() => {
      Object.defineProperty(process, "platform", {
        value: "darwin",
        writable: true,
      });
    });

    test("should build macOS args with count", () => {
      const args = buildPingArgs("google.com", { count: 5 });
      expect(args).toEqual(["-c", "5", "google.com"]);
    });

    test("should build macOS args with interval", () => {
      const args = buildPingArgs("google.com", { interval: 2 });
      expect(args).toEqual(["-i", "2", "google.com"]);
    });

    test("should build macOS args with timeout (milliseconds)", () => {
      const args = buildPingArgs("google.com", { timeout: 5 });
      expect(args).toEqual(["-W", "5000", "google.com"]);
    });

    test("should build macOS args with size", () => {
      const args = buildPingArgs("google.com", { size: 64 });
      expect(args).toEqual(["-s", "64", "google.com"]);
    });

    test("should build macOS args with all options", () => {
      const args = buildPingArgs("google.com", {
        count: 10,
        interval: 1,
        timeout: 3,
        size: 32,
      });
      expect(args).toEqual(["-c", "10", "-i", "1", "-W", "3000", "-s", "32", "google.com"]);
    });
  });

  describe("Linux platform", () => {
    beforeEach(() => {
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
      });
    });

    test("should build Linux args with count", () => {
      const args = buildPingArgs("google.com", { count: 5 });
      expect(args).toEqual(["-c", "5", "google.com"]);
    });

    test("should build Linux args with interval", () => {
      const args = buildPingArgs("google.com", { interval: 2 });
      expect(args).toEqual(["-i", "2", "google.com"]);
    });

    test("should build Linux args with timeout (seconds)", () => {
      const args = buildPingArgs("google.com", { timeout: 5 });
      expect(args).toEqual(["-W", "5", "google.com"]);
    });

    test("should build Linux args with size", () => {
      const args = buildPingArgs("google.com", { size: 64 });
      expect(args).toEqual(["-s", "64", "google.com"]);
    });

    test("should build Linux args without options", () => {
      const args = buildPingArgs("google.com", {});
      expect(args).toEqual(["google.com"]);
    });

    test("should build Linux args with all options", () => {
      const args = buildPingArgs("google.com", {
        count: 10,
        interval: 1,
        timeout: 3,
        size: 32,
      });
      expect(args).toEqual(["-c", "10", "-i", "1", "-W", "3", "-s", "32", "google.com"]);
    });
  });

  describe("Edge cases", () => {
    test("should handle zero values", () => {
      Object.defineProperty(process, "platform", { value: "linux", writable: true });
      const args = buildPingArgs("google.com", {
        count: 0,
        interval: 0,
        timeout: 0,
        size: 0,
      });
      expect(args).toEqual(["-c", "0", "-i", "0", "-W", "0", "-s", "0", "google.com"]);
    });

    test("should handle undefined options", () => {
      Object.defineProperty(process, "platform", { value: "linux", writable: true });
      const args = buildPingArgs("google.com", {
        count: undefined,
        interval: undefined,
        timeout: undefined,
        size: undefined,
      });
      expect(args).toEqual(["google.com"]);
    });

    test("should handle special hostname characters", () => {
      Object.defineProperty(process, "platform", { value: "linux", writable: true });
      const args = buildPingArgs("sub-domain.example-site.com", { count: 1 });
      expect(args).toEqual(["-c", "1", "sub-domain.example-site.com"]);
    });
  });
});
