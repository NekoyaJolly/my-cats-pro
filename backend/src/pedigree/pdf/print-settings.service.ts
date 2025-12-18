import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

// 座標設定の型定義
export interface Position {
  x: number;
  y: number;
  align?: "left" | "center" | "right";
}

export interface ParentPositions {
  name: Position;
  color: Position;
  eyeColor?: Position;
  jcu: Position;
}

export interface GrandParentPositions {
  name: Position;
  color: Position;
  jcu: Position;
}

export interface GreatGrandParentPositions {
  name: Position;
  jcu: Position;
}

export interface FontSizes {
  catName: number;
  wcaNo: number;
  headerInfo: number;
  parentName: number;
  parentDetail: number;
  grandParentName: number;
  grandParentDetail: number;
  greatGrandParent: number;
  footer: number;
}

export interface PositionsConfig {
  offsetX: number;
  offsetY: number;
  breed: Position;
  sex: Position;
  dateOfBirth: Position;
  eyeColor: Position;
  color: Position;
  catName: Position;
  wcaNo: Position;
  owner: Position;
  breeder: Position;
  dateOfRegistration: Position;
  littersM: Position;
  littersF: Position;
  sire: ParentPositions;
  dam: ParentPositions;
  grandParents: {
    ff: GrandParentPositions;
    fm: GrandParentPositions;
    mf: GrandParentPositions;
    mm: GrandParentPositions;
  };
  greatGrandParents: {
    fff: GreatGrandParentPositions;
    ffm: GreatGrandParentPositions;
    fmf: GreatGrandParentPositions;
    fmm: GreatGrandParentPositions;
    mff: GreatGrandParentPositions;
    mfm: GreatGrandParentPositions;
    mmf: GreatGrandParentPositions;
    mmm: GreatGrandParentPositions;
  };
  otherOrganizationsNo: Position;
  fontSizes: FontSizes;
}

@Injectable()
export class PrintSettingsService {
  private readonly logger = new Logger(PrintSettingsService.name);
  private readonly GLOBAL_KEY = "GLOBAL";

  private readonly defaultSettings: PositionsConfig = {
    offsetX: 0,
    offsetY: 0,
    breed: { x: 50, y: 50 },
    sex: { x: 50, y: 60 },
    dateOfBirth: { x: 77, y: 60 },
    eyeColor: { x: 50, y: 69 },
    color: { x: 77, y: 69 },
    catName: { x: 170, y: 55, align: "center" },
    wcaNo: { x: 170, y: 69, align: "center" },
    owner: { x: 320, y: 50, align: "right" },
    breeder: { x: 320, y: 60, align: "right" },
    dateOfRegistration: { x: 240, y: 69 },
    littersM: { x: 277, y: 69 },
    littersF: { x: 285, y: 69 },
    sire: {
      name: { x: 50, y: 110 },
      color: { x: 50, y: 127 },
      eyeColor: { x: 50, y: 132 },
      jcu: { x: 50, y: 137 },
    },
    dam: {
      name: { x: 50, y: 160 },
      color: { x: 50, y: 177 },
      eyeColor: { x: 50, y: 182 },
      jcu: { x: 50, y: 188 },
    },
    grandParents: {
      ff: { name: { x: 140, y: 101 }, color: { x: 140, y: 106 }, jcu: { x: 140, y: 111 } },
      fm: { name: { x: 140, y: 127 }, color: { x: 140, y: 132 }, jcu: { x: 140, y: 137 } },
      mf: { name: { x: 140, y: 152 }, color: { x: 140, y: 157 }, jcu: { x: 140, y: 162 } },
      mm: { name: { x: 140, y: 178 }, color: { x: 140, y: 183 }, jcu: { x: 140, y: 188 } },
    },
    greatGrandParents: {
      fff: { name: { x: 232, y: 94 }, jcu: { x: 232, y: 98 } },
      ffm: { name: { x: 232, y: 107 }, jcu: { x: 232, y: 111 } },
      fmf: { name: { x: 232, y: 120 }, jcu: { x: 232, y: 124 } },
      fmm: { name: { x: 232, y: 133 }, jcu: { x: 232, y: 137 } },
      mff: { name: { x: 232, y: 146 }, jcu: { x: 232, y: 150 } },
      mfm: { name: { x: 232, y: 158 }, jcu: { x: 232, y: 162 } },
      mmf: { name: { x: 232, y: 171 }, jcu: { x: 232, y: 175 } },
      mmm: { name: { x: 232, y: 184 }, jcu: { x: 232, y: 188 } },
    },
    otherOrganizationsNo: { x: 85, y: 210 },
    fontSizes: {
      catName: 13,
      wcaNo: 12,
      headerInfo: 11,
      parentName: 12,
      parentDetail: 11,
      grandParentName: 11,
      grandParentDetail: 11,
      greatGrandParent: 10,
      footer: 7,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId?: string): Promise<PositionsConfig> {
    try {
      const where = this.buildWhereClause(tenantId);
      const record = await this.prisma.pedigreePrintSetting.findUnique({ where });
      if (!record) {
        return this.defaultSettings;
      }
      return this.deserializeSettings(record.settings);
    } catch (error) {
      this.logger.error(
        "印刷設定の取得に失敗しました",
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new InternalServerErrorException("印刷設定の取得に失敗しました");
    }
  }

  async updateSettings(settings: PositionsConfig, tenantId?: string): Promise<PositionsConfig> {
    try {
      const where = this.buildWhereClause(tenantId);
      const settingsJson = this.serializeSettings(settings);
      await this.prisma.pedigreePrintSetting.upsert({
        where,
        create: {
          tenantId: tenantId ?? null,
          globalKey: tenantId ? null : this.GLOBAL_KEY,
          settings: settingsJson,
        },
        update: {
          settings: settingsJson,
          version: { increment: 1 },
        },
      });
      return settings;
    } catch (error) {
      this.logger.error(
        "印刷設定の保存に失敗しました",
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new InternalServerErrorException("印刷設定の保存に失敗しました");
    }
  }

  async resetToDefault(tenantId?: string): Promise<PositionsConfig> {
    return this.updateSettings(this.defaultSettings, tenantId);
  }

  /**
   * 印刷設定の構造を検証する
   * @param value 検証対象の値
   * @returns 有効な PositionsConfig であれば true
   */
  public isPositionsConfig(value: unknown): value is PositionsConfig {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;

    // 基本的な数値・オブジェクトフィールドのチェック
    if (typeof record.offsetX !== "number" || typeof record.offsetY !== "number") {
      return false;
    }
    if (typeof record.breed !== "object" || record.breed === null) {
      return false;
    }

    // PDF 生成時に必須となる主要なネスト構造の存在チェック
    const requiredObjectKeys = [
      "sex",
      "dateOfBirth",
      "catName",
      "sire",
      "dam",
      "grandParents",
      "greatGrandParents",
      "fontSizes",
    ] as const;

    for (const key of requiredObjectKeys) {
      const v = record[key as string];
      if (typeof v !== "object" || v === null) {
        return false;
      }
    }

    return true;
  }

  private buildWhereClause(tenantId?: string): Prisma.PedigreePrintSettingWhereUniqueInput {
    if (tenantId) {
      return { tenantId };
    }
    return { globalKey: this.GLOBAL_KEY };
  }

  private deserializeSettings(value: Prisma.JsonValue | null): PositionsConfig {
    if (!value || !this.isPositionsConfig(value)) {
      return this.defaultSettings;
    }
    // Prisma の JsonValue はプレーンオブジェクト互換のため、直接キャスト可能
    // TypeScript の型チェックを通過するため、unknown を経由してキャスト
    return value as unknown as PositionsConfig;
  }

  private serializeSettings(settings: PositionsConfig): Prisma.InputJsonValue {
    // Prisma の JsonValue/InputJsonValue はプレーンオブジェクト互換のため、そのまま保存する
    // TypeScript の型チェックを通過するため、unknown を経由してキャスト
    return settings as unknown as Prisma.InputJsonValue;
  }
}
