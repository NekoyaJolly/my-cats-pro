/**
 * 交配管理ページで使用するユーティリティ関数
 */

import type { MonthDate } from './types';

/**
 * 指定された年月のカレンダー日付を生成
 */
export const generateMonthDates = (year: number, month: number): MonthDate[] => {
  const dates: MonthDate[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    dates.push({
      date: day,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      dayOfWeek: date.getDay(),
    });
  }
  return dates;
};

/**
 * 年齢を月単位で計算
 */
export const calculateAgeInMonths = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  
  // もし今月の日付が誕生日の日付より前なら、1ヶ月引く
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
};

/**
 * 日付文字列をフォーマット
 */
export const formatDateJP = (dateString: string): string => {
  if (!dateString) return '不明';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
};





