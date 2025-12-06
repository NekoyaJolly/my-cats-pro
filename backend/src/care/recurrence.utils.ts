/**
 * 繰り返しルール（RRULE）の解析とスケジュール生成ユーティリティ
 *
 * 対応タイプ: 毎日(DAILY)、毎週(WEEKLY)、毎月(MONTHLY)、毎年(YEARLY)
 */

import dayjs from "dayjs";

/**
 * RRULE頻度タイプ
 */
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/**
 * 解析されたRRULE情報
 */
export interface ParsedRRule {
  /** 繰り返し頻度 */
  frequency: RecurrenceFrequency;
  /** 繰り返し間隔（デフォルト: 1） */
  interval: number;
  /** 曜日指定（WEEKLY用）: 0=日曜〜6=土曜 */
  byDay: number[] | null;
  /** 日付指定（MONTHLY用）: 1〜31 */
  byMonthDay: number | null;
  /** 終了回数 */
  count: number | null;
  /** 終了日時 */
  until: Date | null;
}

/**
 * RRULEを解析する
 *
 * @param rule RRULE文字列（例: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE"）
 * @returns 解析結果。無効なルールの場合はnull
 */
export function parseRRule(rule: string | null | undefined): ParsedRRule | null {
  if (!rule || typeof rule !== "string") {
    return null;
  }

  const parts = rule.split(";");
  const params: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) {
      params[key.trim().toUpperCase()] = value.trim();
    }
  }

  const freqValue = params["FREQ"];
  if (!freqValue || !isValidFrequency(freqValue)) {
    return null;
  }

  const frequency = freqValue as RecurrenceFrequency;
  const interval = parseInt(params["INTERVAL"] || "1", 10);
  const count = params["COUNT"] ? parseInt(params["COUNT"], 10) : null;
  const until = params["UNTIL"] ? parseRRuleDate(params["UNTIL"]) : null;

  // BYDAY解析（曜日）
  let byDay: number[] | null = null;
  if (params["BYDAY"]) {
    byDay = parseByDay(params["BYDAY"]);
  }

  // BYMONTHDAY解析（月の日付）
  let byMonthDay: number | null = null;
  if (params["BYMONTHDAY"]) {
    const day = parseInt(params["BYMONTHDAY"], 10);
    if (day >= 1 && day <= 31) {
      byMonthDay = day;
    }
  }

  return {
    frequency,
    interval: Number.isNaN(interval) || interval < 1 ? 1 : interval,
    byDay,
    byMonthDay,
    count: count && !Number.isNaN(count) ? count : null,
    until,
  };
}

/**
 * 有効な頻度値かどうかをチェック
 */
function isValidFrequency(value: string): value is RecurrenceFrequency {
  return ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(value.toUpperCase());
}

/**
 * RRULEのBYDAY値を解析する
 *
 * @param byday 曜日文字列（例: "MO,WE,FR"）
 * @returns 曜日のインデックス配列（0=日曜〜6=土曜）
 */
function parseByDay(byday: string): number[] {
  const dayMap: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const days = byday.split(",").map((d) => d.trim().toUpperCase());
  const result: number[] = [];

  for (const day of days) {
    // 「-1MO」のような形式にも対応（最初の数字部分を除去）
    const cleanDay = day.replace(/^-?\d*/, "");
    if (dayMap[cleanDay] !== undefined) {
      result.push(dayMap[cleanDay]);
    }
  }

  return result.length > 0 ? result : [];
}

/**
 * RRULEの日付文字列を解析する
 *
 * @param dateStr RRULE日付（例: "20251231T235959Z" または "20251231"）
 * @returns Dateオブジェクト。無効な場合はnull
 */
function parseRRuleDate(dateStr: string): Date | null {
  // YYYYMMDD形式
  if (/^\d{8}$/.test(dateStr)) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // YYYYMMDDTHHmmssZ形式
  if (/^\d{8}T\d{6}Z?$/.test(dateStr)) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = parseInt(dateStr.substring(9, 11), 10);
    const minute = parseInt(dateStr.substring(11, 13), 10);
    const second = parseInt(dateStr.substring(13, 15), 10);
    const date = new Date(Date.UTC(year, month, day, hour, minute, second));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // ISO8601形式を試行
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * RRULEに基づいて次回予定日を計算する
 *
 * @param rrule 解析済みRRULE
 * @param baseDate 基準日（通常は完了日またはスケジュール日）
 * @returns 次回予定日。終了条件を満たした場合はnull
 */
export function calculateNextScheduleDate(
  rrule: ParsedRRule,
  baseDate: Date,
): Date | null {
  const base = dayjs(baseDate);
  let next: dayjs.Dayjs;

  switch (rrule.frequency) {
    case "DAILY":
      next = base.add(rrule.interval, "day");
      break;

    case "WEEKLY":
      if (rrule.byDay && rrule.byDay.length > 0) {
        // 曜日指定がある場合、次の該当曜日を探す
        next = findNextDayOfWeek(base, rrule.byDay, rrule.interval);
      } else {
        next = base.add(rrule.interval, "week");
      }
      break;

    case "MONTHLY":
      if (rrule.byMonthDay !== null) {
        // 日付指定がある場合、次の指定日を探す
        next = findNextMonthDay(base, rrule.byMonthDay, rrule.interval);
      } else {
        next = base.add(rrule.interval, "month");
      }
      break;

    case "YEARLY":
      next = base.add(rrule.interval, "year");
      break;

    default:
      return null;
  }

  // 終了条件チェック
  if (rrule.until && next.isAfter(rrule.until)) {
    return null;
  }

  return next.toDate();
}

/**
 * 次の指定曜日を探す
 */
function findNextDayOfWeek(
  base: dayjs.Dayjs,
  targetDays: number[],
  weekInterval: number,
): dayjs.Dayjs {
  const currentDay = base.day();
  const sortedDays = [...targetDays].sort((a, b) => a - b);

  // 今週の残りの曜日から探す
  for (const day of sortedDays) {
    if (day > currentDay) {
      return base.day(day);
    }
  }

  // 次の週の最初の該当曜日
  const nextWeekBase = base.add(weekInterval, "week").startOf("week");
  return nextWeekBase.day(sortedDays[0]);
}

/**
 * 次の指定日を探す
 */
function findNextMonthDay(
  base: dayjs.Dayjs,
  targetDay: number,
  monthInterval: number,
): dayjs.Dayjs {
  const currentDay = base.date();

  // 今月の指定日がまだ来ていない場合
  if (currentDay < targetDay) {
    const daysInMonth = base.daysInMonth();
    const actualDay = Math.min(targetDay, daysInMonth);
    return base.date(actualDay);
  }

  // 次の月の指定日
  const nextMonth = base.add(monthInterval, "month");
  const daysInNextMonth = nextMonth.daysInMonth();
  const actualDay = Math.min(targetDay, daysInNextMonth);
  return nextMonth.date(actualDay);
}

/**
 * 繰り返しルールが有効かどうかを確認する
 */
export function hasValidRecurrence(rule: string | null | undefined): boolean {
  return parseRRule(rule) !== null;
}
