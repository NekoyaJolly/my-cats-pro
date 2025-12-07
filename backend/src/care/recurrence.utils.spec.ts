/**
 * recurrence.utils.ts の単体テスト
 */

import dayjs from "dayjs";

import {
  parseRRule,
  calculateNextScheduleDate,
  hasValidRecurrence,
  type ParsedRRule,
} from "./recurrence.utils";

describe("RecurrenceUtils", () => {
  describe("parseRRule", () => {
    it("nullまたはundefinedの場合、nullを返す", () => {
      expect(parseRRule(null)).toBeNull();
      expect(parseRRule(undefined)).toBeNull();
      expect(parseRRule("")).toBeNull();
    });

    it("無効なRRULE文字列の場合、nullを返す", () => {
      expect(parseRRule("INVALID")).toBeNull();
      expect(parseRRule("FREQ=INVALID")).toBeNull();
    });

    describe("DAILY", () => {
      it("基本的な毎日繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=DAILY;INTERVAL=1");

        expect(result).not.toBeNull();
        expect(result?.frequency).toBe("DAILY");
        expect(result?.interval).toBe(1);
      });

      it("2日ごとの繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=DAILY;INTERVAL=2");

        expect(result?.frequency).toBe("DAILY");
        expect(result?.interval).toBe(2);
      });
    });

    describe("WEEKLY", () => {
      it("基本的な毎週繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;INTERVAL=1");

        expect(result?.frequency).toBe("WEEKLY");
        expect(result?.interval).toBe(1);
        expect(result?.byDay).toBeNull();
      });

      it("曜日指定付きの毎週繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR");

        expect(result?.frequency).toBe("WEEKLY");
        expect(result?.byDay).toEqual([1, 3, 5]); // 月、水、金
      });

      it("単一曜日の繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;BYDAY=TU");

        expect(result?.byDay).toEqual([2]); // 火曜日
      });
    });

    describe("MONTHLY", () => {
      it("基本的な毎月繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=MONTHLY;INTERVAL=1");

        expect(result?.frequency).toBe("MONTHLY");
        expect(result?.byMonthDay).toBeNull();
      });

      it("日付指定付きの毎月繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=MONTHLY;BYMONTHDAY=15");

        expect(result?.frequency).toBe("MONTHLY");
        expect(result?.byMonthDay).toBe(15);
      });
    });

    describe("YEARLY", () => {
      it("毎年繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=YEARLY;INTERVAL=1");

        expect(result?.frequency).toBe("YEARLY");
        expect(result?.interval).toBe(1);
      });
    });

    describe("終了条件", () => {
      it("COUNT指定を解析できる", () => {
        const result = parseRRule("FREQ=DAILY;COUNT=10");

        expect(result?.count).toBe(10);
      });

      it("UNTIL指定（YYYYMMDD形式）を解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;UNTIL=20251231");

        expect(result?.until).not.toBeNull();
        expect(result?.until?.getFullYear()).toBe(2025);
        expect(result?.until?.getMonth()).toBe(11); // 12月
        expect(result?.until?.getDate()).toBe(31);
      });

      it("UNTIL指定（ISO8601形式）を解析できる", () => {
        const result = parseRRule("FREQ=MONTHLY;UNTIL=20251231T235959Z");

        expect(result?.until).not.toBeNull();
      });
    });
  });

  describe("calculateNextScheduleDate", () => {
    const baseDate = new Date("2025-01-15T10:00:00.000Z");

    describe("DAILY", () => {
      it("次の日を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "DAILY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(next).not.toBeNull();
        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-16");
      });

      it("3日後を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "DAILY",
          interval: 3,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-18");
      });
    });

    describe("WEEKLY", () => {
      it("次の週を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "WEEKLY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-22");
      });

      it("曜日指定で次の該当曜日を計算できる（今週）", () => {
        // 2025-01-15は水曜日
        const rrule: ParsedRRule = {
          frequency: "WEEKLY",
          interval: 1,
          byDay: [4, 5], // 木、金
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        // 次は木曜日 (2025-01-16)
        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-16");
      });
    });

    describe("MONTHLY", () => {
      it("次の月を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "MONTHLY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-02-15");
      });

      it("日付指定で次の該当日を計算できる（今月）", () => {
        // 15日より後の20日
        const rrule: ParsedRRule = {
          frequency: "MONTHLY",
          interval: 1,
          byDay: null,
          byMonthDay: 20,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-20");
      });

      it("日付指定で次の該当日を計算できる（翌月）", () => {
        // 15日より前の10日 → 翌月
        const rrule: ParsedRRule = {
          frequency: "MONTHLY",
          interval: 1,
          byDay: null,
          byMonthDay: 10,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-02-10");
      });
    });

    describe("YEARLY", () => {
      it("次の年を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "YEARLY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2026-01-15");
      });
    });

    describe("終了条件", () => {
      it("UNTIL日を超える場合はnullを返す", () => {
        const rrule: ParsedRRule = {
          frequency: "DAILY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: new Date("2025-01-15T00:00:00.000Z"), // 基準日と同じ
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(next).toBeNull();
      });
    });
  });

  describe("hasValidRecurrence", () => {
    it("有効なRRULEの場合はtrueを返す", () => {
      expect(hasValidRecurrence("FREQ=DAILY")).toBe(true);
      expect(hasValidRecurrence("FREQ=WEEKLY;BYDAY=MO")).toBe(true);
      expect(hasValidRecurrence("FREQ=MONTHLY;BYMONTHDAY=1")).toBe(true);
      expect(hasValidRecurrence("FREQ=YEARLY")).toBe(true);
    });

    it("無効なRRULEの場合はfalseを返す", () => {
      expect(hasValidRecurrence(null)).toBe(false);
      expect(hasValidRecurrence(undefined)).toBe(false);
      expect(hasValidRecurrence("")).toBe(false);
      expect(hasValidRecurrence("INVALID")).toBe(false);
    });
  });
});
