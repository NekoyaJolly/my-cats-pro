/**
 * Prisma JsonValue の型安全なバリデーション・変換ユーティリティ
 *
 * symptomDetails, medications などのJSONフィールドを型安全に扱う
 */

import { Prisma } from "@prisma/client";

/**
 * 症状詳細の型定義
 */
export interface SymptomDetail {
  label: string;
  note: string | null;
}

/**
 * 投薬情報の型定義
 */
export interface MedicationDetail {
  name: string;
  dosage: string | null;
}

/**
 * 未知のオブジェクトが SymptomDetail の構造を持つかチェック
 */
function isSymptomDetailLike(value: unknown): value is SymptomDetail {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.label === "string" &&
    (obj.note === null || obj.note === undefined || typeof obj.note === "string")
  );
}

/**
 * 未知のオブジェクトが MedicationDetail の構造を持つかチェック
 */
function isMedicationDetailLike(value: unknown): value is MedicationDetail {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    (obj.dosage === null || obj.dosage === undefined || typeof obj.dosage === "string")
  );
}

/**
 * Prisma JsonValue を SymptomDetail[] に型安全に変換
 *
 * @param data Prismaから取得したJsonValue
 * @returns 検証済みの SymptomDetail 配列
 */
export function parseSymptomDetails(
  data: Prisma.JsonValue | null | undefined,
): SymptomDetail[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const result: SymptomDetail[] = [];
  for (const item of data) {
    if (isSymptomDetailLike(item)) {
      result.push({
        label: item.label,
        note: typeof item.note === "string" ? item.note : null,
      });
    }
  }
  return result;
}

/**
 * Prisma JsonValue を MedicationDetail[] に型安全に変換
 *
 * @param data Prismaから取得したJsonValue
 * @returns 検証済みの MedicationDetail 配列
 */
export function parseMedications(
  data: Prisma.JsonValue | null | undefined,
): MedicationDetail[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const result: MedicationDetail[] = [];
  for (const item of data) {
    if (isMedicationDetailLike(item)) {
      result.push({
        name: item.name,
        dosage: typeof item.dosage === "string" ? item.dosage : null,
      });
    }
  }
  return result;
}

/**
 * SymptomDetail[] を Prisma JsonArray に変換
 *
 * @param details 症状詳細配列
 * @returns Prisma JsonArray または DbNull
 */
export function serializeSymptomDetails(
  details: SymptomDetail[] | undefined,
): Prisma.JsonArray | typeof Prisma.DbNull {
  if (!details || details.length === 0) {
    return Prisma.DbNull;
  }

  return details.map((detail) => ({
    label: detail.label,
    note: detail.note ?? null,
  })) as Prisma.JsonArray;
}

/**
 * MedicationDetail[] を Prisma JsonArray に変換
 *
 * @param medications 投薬情報配列
 * @returns Prisma JsonArray または DbNull
 */
export function serializeMedications(
  medications: MedicationDetail[] | undefined,
): Prisma.JsonArray | typeof Prisma.DbNull {
  if (!medications || medications.length === 0) {
    return Prisma.DbNull;
  }

  return medications.map((medication) => ({
    name: medication.name,
    dosage: medication.dosage ?? null,
  })) as Prisma.JsonArray;
}

/**
 * DTO形式の症状詳細を型安全に変換
 */
export function mapDtoToSymptomDetails(
  dtoDetails: Array<{ label: string; note?: string }> | undefined,
): SymptomDetail[] {
  if (!dtoDetails || dtoDetails.length === 0) {
    return [];
  }

  return dtoDetails.map((detail) => ({
    label: detail.label,
    note: detail.note ?? null,
  }));
}

/**
 * DTO形式の投薬情報を型安全に変換
 */
export function mapDtoToMedications(
  dtoMedications: Array<{ name: string; dosage?: string }> | undefined,
): MedicationDetail[] {
  if (!dtoMedications || dtoMedications.length === 0) {
    return [];
  }

  return dtoMedications.map((medication) => ({
    name: medication.name,
    dosage: medication.dosage ?? null,
  }));
}
