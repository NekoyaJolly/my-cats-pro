/**
 * 血統書データ移行スクリプトのテスト
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * toIntOrNull のテスト用エクスポート
 */
export function toIntOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? null : num;
}

/**
 * toStringOrNull のテスト用エクスポート
 */
export function toStringOrNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * parseCsv のテスト用エクスポート
 */
export function parseCsv<T>(content: string): T[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relaxColumnCount: true,
    bom: true,
  }) as T[];

  return records;
}

describe('migrate_csv_to_supabase helper functions', () => {
  describe('toIntOrNull', () => {
    it('should convert valid integer strings to numbers', () => {
      expect(toIntOrNull('123')).toBe(123);
      expect(toIntOrNull('0')).toBe(0);
      expect(toIntOrNull('-456')).toBe(-456);
    });

    it('should handle whitespace correctly', () => {
      expect(toIntOrNull('  789  ')).toBe(789);
    });

    it('should return null for empty or invalid values', () => {
      expect(toIntOrNull('')).toBe(null);
      expect(toIntOrNull('   ')).toBe(null);
      expect(toIntOrNull(undefined)).toBe(null);
      expect(toIntOrNull('abc')).toBe(null);
      expect(toIntOrNull('12.34')).toBe(12); // parseInt は小数点以下を無視
    });
  });

  describe('toStringOrNull', () => {
    it('should return trimmed strings for valid input', () => {
      expect(toStringOrNull('hello')).toBe('hello');
      expect(toStringOrNull('  world  ')).toBe('world');
    });

    it('should return null for empty or undefined values', () => {
      expect(toStringOrNull('')).toBe(null);
      expect(toStringOrNull('   ')).toBe(null);
      expect(toStringOrNull(undefined)).toBe(null);
    });
  });

  describe('parseCsv', () => {
    it('should parse simple CSV content', () => {
      const csvContent = `name,age,city
John,30,Tokyo
Jane,25,Osaka`;

      interface TestRow {
        name: string;
        age: string;
        city: string;
      }

      const result = parseCsv<TestRow>(csvContent);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'John', age: '30', city: 'Tokyo' });
      expect(result[1]).toEqual({ name: 'Jane', age: '25', city: 'Osaka' });
    });

    it('should handle CSV with quoted fields containing commas', () => {
      const csvContent = `name,description
Product A,"This is a product, with a comma"
Product B,"Another product"`;

      interface TestRow {
        name: string;
        description: string;
      }

      const result = parseCsv<TestRow>(csvContent);

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('This is a product, with a comma');
      expect(result[1].description).toBe('Another product');
    });

    it('should skip empty lines', () => {
      const csvContent = `name,value
A,1

B,2

C,3`;

      interface TestRow {
        name: string;
        value: string;
      }

      const result = parseCsv<TestRow>(csvContent);

      expect(result).toHaveLength(3);
    });

    it('should handle UTF-8 BOM', () => {
      const csvContent = '\uFEFFname,value\nTest,123';

      interface TestRow {
        name: string;
        value: string;
      }

      const result = parseCsv<TestRow>(csvContent);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test');
    });
  });
});

describe('CSV migration integration test', () => {
  it('should parse a sample pedigree CSV structure', () => {
    const sampleCsv = `pedigreeId,catName,breedCode,genderCode,birthDate
701606,テスト猫1,1,1,2020-01-01
701607,テスト猫2,2,2,2020-02-01`;

    interface PedigreeSample {
      pedigreeId: string;
      catName: string;
      breedCode: string;
      genderCode: string;
      birthDate: string;
    }

    const result = parseCsv<PedigreeSample>(sampleCsv);

    expect(result).toHaveLength(2);
    expect(result[0].pedigreeId).toBe('701606');
    expect(result[0].catName).toBe('テスト猫1');
    expect(result[1].pedigreeId).toBe('701607');
  });
});
