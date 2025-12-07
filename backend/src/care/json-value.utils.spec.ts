/**
 * json-value.utils.ts の単体テスト
 */

import { Prisma } from "@prisma/client";

import {
  parseSymptomDetails,
  parseMedications,
  mapDtoToSymptomDetails,
  mapDtoToMedications,
  serializeSymptomDetails,
  serializeMedications,
} from "./json-value.utils";

describe("JsonValueUtils", () => {
  describe("parseSymptomDetails", () => {
    it("nullの場合は空配列を返す", () => {
      expect(parseSymptomDetails(null)).toEqual([]);
      expect(parseSymptomDetails(undefined)).toEqual([]);
    });

    it("配列でない場合は空配列を返す", () => {
      expect(parseSymptomDetails("string" as Prisma.JsonValue)).toEqual([]);
      expect(parseSymptomDetails({ key: "value" } as Prisma.JsonValue)).toEqual([]);
    });

    it("有効な症状詳細配列を解析できる", () => {
      const input = [
        { label: "くしゃみ", note: "1週間続いている" },
        { label: "食欲低下", note: null },
      ] as Prisma.JsonValue;

      const result = parseSymptomDetails(input);

      expect(result).toEqual([
        { label: "くしゃみ", note: "1週間続いている" },
        { label: "食欲低下", note: null },
      ]);
    });

    it("不正なオブジェクトをフィルタリングする", () => {
      const input = [
        { label: "くしゃみ", note: "test" },
        { invalid: "item" }, // labelがない
        null,
        "string",
        { label: 123 }, // labelが文字列でない
      ] as Prisma.JsonValue;

      const result = parseSymptomDetails(input);

      expect(result).toEqual([{ label: "くしゃみ", note: "test" }]);
    });

    it("noteがundefinedの場合はnullに変換する", () => {
      const input = [{ label: "症状1" }] as Prisma.JsonValue;

      const result = parseSymptomDetails(input);

      expect(result[0].note).toBeNull();
    });
  });

  describe("parseMedications", () => {
    it("nullの場合は空配列を返す", () => {
      expect(parseMedications(null)).toEqual([]);
      expect(parseMedications(undefined)).toEqual([]);
    });

    it("有効な投薬情報配列を解析できる", () => {
      const input = [
        { name: "抗生物質", dosage: "朝晩1錠" },
        { name: "胃薬", dosage: null },
      ] as Prisma.JsonValue;

      const result = parseMedications(input);

      expect(result).toEqual([
        { name: "抗生物質", dosage: "朝晩1錠" },
        { name: "胃薬", dosage: null },
      ]);
    });

    it("不正なオブジェクトをフィルタリングする", () => {
      const input = [
        { name: "薬A", dosage: "test" },
        { invalid: "item" }, // nameがない
        null,
      ] as Prisma.JsonValue;

      const result = parseMedications(input);

      expect(result).toEqual([{ name: "薬A", dosage: "test" }]);
    });
  });

  describe("mapDtoToSymptomDetails", () => {
    it("undefinedの場合は空配列を返す", () => {
      expect(mapDtoToSymptomDetails(undefined)).toEqual([]);
    });

    it("空配列の場合は空配列を返す", () => {
      expect(mapDtoToSymptomDetails([])).toEqual([]);
    });

    it("DTO形式を正しく変換する", () => {
      const input = [
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下" }, // noteなし
      ];

      const result = mapDtoToSymptomDetails(input);

      expect(result).toEqual([
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下", note: null },
      ]);
    });
  });

  describe("mapDtoToMedications", () => {
    it("undefinedの場合は空配列を返す", () => {
      expect(mapDtoToMedications(undefined)).toEqual([]);
    });

    it("DTO形式を正しく変換する", () => {
      const input = [
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B" }, // dosageなし
      ];

      const result = mapDtoToMedications(input);

      expect(result).toEqual([
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B", dosage: null },
      ]);
    });
  });

  describe("serializeSymptomDetails", () => {
    it("undefinedの場合はDbNullを返す", () => {
      const result = serializeSymptomDetails(undefined);

      expect(result).toBe(Prisma.DbNull);
    });

    it("空配列の場合はDbNullを返す", () => {
      const result = serializeSymptomDetails([]);

      expect(result).toBe(Prisma.DbNull);
    });

    it("データがある場合はJsonArrayを返す", () => {
      const input = [
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下", note: null },
      ];

      const result = serializeSymptomDetails(input);

      expect(result).toEqual([
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下", note: null },
      ]);
    });
  });

  describe("serializeMedications", () => {
    it("undefinedの場合はDbNullを返す", () => {
      const result = serializeMedications(undefined);

      expect(result).toBe(Prisma.DbNull);
    });

    it("空配列の場合はDbNullを返す", () => {
      const result = serializeMedications([]);

      expect(result).toBe(Prisma.DbNull);
    });

    it("データがある場合はJsonArrayを返す", () => {
      const input = [
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B", dosage: null },
      ];

      const result = serializeMedications(input);

      expect(result).toEqual([
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B", dosage: null },
      ]);
    });
  });
});
