import { describe, test, expect } from "vitest";
import { parsePingLine } from "../../src/helpers/parse-line";

describe("parsePingLine", () => {
  describe("Non-ping lines (should return null)", () => {
    test("should skip PING header lines", () => {
      expect(parsePingLine("PING google.com (8.8.8.8): 56 data bytes")).toBeNull();
    });

    test("should skip statistics header lines", () => {
      expect(parsePingLine("--- google.com ping statistics ---")).toBeNull();
    });

    test("should skip packet transmission summary lines", () => {
      expect(parsePingLine("5 packets transmitted, 5 received, 0% packet loss")).toBeNull();
    });

    test("should skip round-trip time summary lines", () => {
      expect(
        parsePingLine("round-trip min/avg/max/stddev = 1.234/2.345/3.456/0.123 ms"),
      ).toBeNull();
    });

    test("should skip rtt summary lines", () => {
      expect(parsePingLine("rtt min/avg/max/mdev = 1.234/2.345/3.456/0.123 ms")).toBeNull();
    });

    test("should skip empty lines", () => {
      expect(parsePingLine("")).toBeNull();
      expect(parsePingLine("   ")).toBeNull();
    });

    test("should skip control-C interrupt", () => {
      expect(parsePingLine("^C")).toBeNull();
    });

    test("should skip hex dump lines", () => {
      expect(
        parsePingLine("Vr HL TOS  Len   ID Flg  off TTL Pro  cks      Src      Dst"),
      ).toBeNull();
      expect(
        parsePingLine(" 4  5  00 5400 0000   0 0000  40  01 b179 192.168.1.1  8.8.8.8"),
      ).toBeNull();
    });
  });

  describe("Timeout lines", () => {
    test("should parse timeout with sequence number", () => {
      const result = parsePingLine("Request timeout for icmp_seq 5");
      expect(result).toEqual({
        sequenceNumber: 5,
        responseTime: null,
        isSuccess: false,
        errorType: "timeout",
        ttl: null,
        sourceIp: null,
      });
    });

    test("should parse timeout with different format", () => {
      const result = parsePingLine("timeout: icmp_seq=10");
      expect(result).toEqual({
        sequenceNumber: 10,
        responseTime: null,
        isSuccess: false,
        errorType: "timeout",
        ttl: null,
        sourceIp: null,
      });
    });

    test("should parse timeout without sequence number", () => {
      const result = parsePingLine("Request timeout");
      expect(result).toEqual({
        sequenceNumber: null,
        responseTime: null,
        isSuccess: false,
        errorType: "timeout",
        ttl: null,
        sourceIp: null,
      });
    });
  });

  describe("Unreachable lines", () => {
    test("should parse destination unreachable", () => {
      const result = parsePingLine("From 192.168.1.1: Destination Host Unreachable");
      expect(result).toEqual({
        sequenceNumber: null,
        responseTime: null,
        isSuccess: false,
        errorType: "unreachable",
        ttl: null,
        sourceIp: "192.168.1.1",
      });
    });

    test("should parse network unreachable", () => {
      const result = parsePingLine("Network is unreachable");
      expect(result).toEqual({
        sequenceNumber: null,
        responseTime: null,
        isSuccess: false,
        errorType: "unreachable",
        ttl: null,
        sourceIp: null,
      });
    });
  });

  describe("Successful ping responses", () => {
    test("should parse Unix/Linux format", () => {
      const result = parsePingLine("64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=25.123 ms");
      expect(result).toEqual({
        sequenceNumber: 1,
        responseTime: 25.123,
        isSuccess: true,
        errorType: null,
        ttl: 117,
        sourceIp: "8.8.8.8",
      });
    });

    test("should parse Windows format with exact time", () => {
      const result = parsePingLine("Reply from 8.8.8.8: bytes=32 time=1ms TTL=64");
      expect(result).toEqual({
        sequenceNumber: null,
        responseTime: 1,
        isSuccess: true,
        errorType: null,
        ttl: 64,
        sourceIp: "8.8.8.8",
      });
    });

    test("should parse Windows format with less-than time", () => {
      const result = parsePingLine("Reply from 8.8.8.8: bytes=32 time<1ms TTL=64");
      expect(result).toEqual({
        sequenceNumber: null,
        responseTime: 1,
        isSuccess: true,
        errorType: null,
        ttl: 64,
        sourceIp: "8.8.8.8",
      });
    });

    test("should parse alternative time format", () => {
      const result = parsePingLine("PING 8.8.8.8 (8.8.8.8): 56(84) bytes of data. time=15.5 ms");
      expect(result).toEqual({
        sequenceNumber: null,
        responseTime: 15.5,
        isSuccess: true,
        errorType: null,
        ttl: null,
        sourceIp: "8.8.8.8",
      });
    });

    test("should parse format with colon time separator", () => {
      const result = parsePingLine(
        "64 bytes from example.com (93.184.216.34): icmp_seq:5 ttl:56 time: 45.789 ms",
      );
      expect(result).toEqual({
        sequenceNumber: 5,
        responseTime: 45.789,
        isSuccess: true,
        errorType: null,
        ttl: 56,
        sourceIp: "93.184.216.34",
      });
    });

    test("should handle missing TTL", () => {
      const result = parsePingLine("64 bytes from 8.8.8.8: icmp_seq=1 time=25.123 ms");
      expect(result).toEqual({
        sequenceNumber: 1,
        responseTime: 25.123,
        isSuccess: true,
        errorType: null,
        ttl: null,
        sourceIp: "8.8.8.8",
      });
    });

    test("should handle missing sequence number", () => {
      const result = parsePingLine("64 bytes from 8.8.8.8: ttl=117 time=25.123 ms");
      expect(result).toEqual({
        sequenceNumber: null,
        responseTime: 25.123,
        isSuccess: true,
        errorType: null,
        ttl: 117,
        sourceIp: "8.8.8.8",
      });
    });

    test("should parse IPv6 addresses", () => {
      const result = parsePingLine(
        "64 bytes from 2001:4860:4860::8888: icmp_seq=1 ttl=117 time=25.123 ms",
      );
      expect(result).toEqual({
        sequenceNumber: 1,
        responseTime: 25.123,
        isSuccess: true,
        errorType: null,
        ttl: 117,
        sourceIp: "2001:4860:4860::8888",
      });
    });
  });

  describe("Edge cases", () => {
    test("should return null for unrecognized format", () => {
      expect(parsePingLine("Some random text that doesn't match any pattern")).toBeNull();
    });

    test("should handle case-insensitive matching", () => {
      const result = parsePingLine("REQUEST TIMEOUT for ICMP_SEQ 5");
      expect(result).toEqual({
        sequenceNumber: 5,
        responseTime: null,
        isSuccess: false,
        errorType: "timeout",
        ttl: null,
        sourceIp: null,
      });
    });

    test("should handle decimal sequence numbers", () => {
      const result = parsePingLine("64 bytes from 8.8.8.8: icmp_seq=123 ttl=117 time=25.123 ms");
      expect(result).toEqual({
        sequenceNumber: 123,
        responseTime: 25.123,
        isSuccess: true,
        errorType: null,
        ttl: 117,
        sourceIp: "8.8.8.8",
      });
    });

    test("should handle very small response times", () => {
      const result = parsePingLine("64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=0.123 ms");
      expect(result).toEqual({
        sequenceNumber: 1,
        responseTime: 0.123,
        isSuccess: true,
        errorType: null,
        ttl: 117,
        sourceIp: "8.8.8.8",
      });
    });

    test("should handle large response times", () => {
      const result = parsePingLine("64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=1234.567 ms");
      expect(result).toEqual({
        sequenceNumber: 1,
        responseTime: 1234.567,
        isSuccess: true,
        errorType: null,
        ttl: 117,
        sourceIp: "8.8.8.8",
      });
    });
  });
});
