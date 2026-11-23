import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BUSINESS_TIMEZONE,
  getBusinessToday,
  parseDateOnly,
  isPastBusinessDate,
  formatBusinessDate,
  formatBusinessDateTime,
  formatBusinessTime,
} from "../date";

describe("Shared Business Date Utility (date.ts)", () => {
  it("configures Asia/Kolkata as the business timezone", () => {
    assert.equal(BUSINESS_TIMEZONE, "Asia/Kolkata");
  });

  describe("getBusinessToday", () => {
    it("returns YYYY-MM-DD format", () => {
      const today = getBusinessToday();
      assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
    });

    it("handles midnight boundary accurately in Asia/Kolkata (+5:30)", () => {
      // 2026-10-15 18:31:00 UTC is 2026-10-16 00:01:00 IST
      const utcTime = new Date("2026-10-15T18:31:00Z");
      assert.equal(getBusinessToday(utcTime), "2026-10-16");

      // 2026-10-15 18:29:00 UTC is 2026-10-15 23:59:00 IST
      const utcBeforeMidnight = new Date("2026-10-15T18:29:00Z");
      assert.equal(getBusinessToday(utcBeforeMidnight), "2026-10-15");
    });
  });

  describe("parseDateOnly", () => {
    it("parses YYYY-MM-DD preserving exact calendar day without day boundary shifting", () => {
      const d = parseDateOnly("2026-10-15");
      assert.equal(d.getFullYear(), 2026);
      assert.equal(d.getMonth(), 9); // 0-indexed month 9 is October
      assert.equal(d.getDate(), 15);
    });

    it("handles invalid or empty inputs gracefully", () => {
      assert.equal(isNaN(parseDateOnly("").getTime()), true);
      assert.equal(isNaN(parseDateOnly("invalid-date").getTime()), true);
    });
  });

  describe("isPastBusinessDate", () => {
    it("correctly identifies past dates relative to reference today", () => {
      assert.equal(isPastBusinessDate("2026-10-14", "2026-10-15"), true);
      assert.equal(isPastBusinessDate("2026-10-15", "2026-10-15"), false);
      assert.equal(isPastBusinessDate("2026-10-16", "2026-10-15"), false);
    });

    it("returns false for empty input", () => {
      assert.equal(isPastBusinessDate(""), false);
    });
  });

  describe("formatBusinessDate", () => {
    it("formats YYYY-MM-DD date-only string accurately without UTC shift", () => {
      const formatted = formatBusinessDate("2026-10-15");
      assert.equal(formatted, "Oct 15, 2026");
    });

    it("formats Date instance in Asia/Kolkata timezone", () => {
      // 2026-10-15 19:00:00 UTC is 2026-10-16 in IST
      const d = new Date("2026-10-15T19:00:00Z");
      assert.equal(formatBusinessDate(d), "Oct 16, 2026");
    });

    it("returns empty string for null/undefined/empty input", () => {
      assert.equal(formatBusinessDate(null), "");
      assert.equal(formatBusinessDate(undefined), "");
      assert.equal(formatBusinessDate(""), "");
    });
  });

  describe("formatBusinessDateTime", () => {
    it("formats ISO timestamp accurately in Asia/Kolkata timezone", () => {
      // 2026-10-15 05:00:00 UTC is 10:30 AM IST (+5:30)
      const d = new Date("2026-10-15T05:00:00Z");
      const formatted = formatBusinessDateTime(d);
      assert.ok(formatted.includes("Oct 15, 2026"));
      assert.ok(formatted.includes("10:30 AM"));
    });

    it("returns empty string for null/undefined/empty input", () => {
      assert.equal(formatBusinessDateTime(null), "");
      assert.equal(formatBusinessDateTime(undefined), "");
      assert.equal(formatBusinessDateTime(""), "");
    });
  });

  describe("formatBusinessTime", () => {
    it("converts 24-hour time string into 12-hour formatted time", () => {
      assert.equal(formatBusinessTime("14:30:00"), "02:30 PM");
      assert.equal(formatBusinessTime("14:30"), "02:30 PM");
      assert.equal(formatBusinessTime("09:00:00"), "09:00 AM");
      assert.equal(formatBusinessTime("09:00"), "09:00 AM");
      assert.equal(formatBusinessTime("00:15:00"), "12:15 AM");
      assert.equal(formatBusinessTime("12:00:00"), "12:00 PM");
    });

    it("preserves already formatted times cleanly", () => {
      assert.equal(formatBusinessTime("10:30 AM"), "10:30 AM");
      assert.equal(formatBusinessTime("02:00 PM"), "02:00 PM");
    });

    it("returns empty string when input is missing or empty", () => {
      assert.equal(formatBusinessTime(null), "");
      assert.equal(formatBusinessTime(undefined), "");
      assert.equal(formatBusinessTime(""), "");
      assert.equal(formatBusinessTime("   "), "");
    });
  });
});
