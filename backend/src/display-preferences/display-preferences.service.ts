import { BadRequestException, Injectable } from "@nestjs/common";
import { DisplayNameMode, type DisplayPreference, Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import type {
  DisplayPreferenceView,
  LabelOverrideMap,
  PersonalizedMasterRecord,
} from "./display-preferences.types";
import { LabelOverrideDto, UpdateDisplayPreferenceDto } from "./dto/update-display-preference.dto";

type MasterDataDomain = "breed" | "coatColor";
interface MasterRecord {
  code: number;
  name: string;
}

@Injectable()
export class DisplayPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string): Promise<DisplayPreferenceView> {
    const preference = await this.prisma.displayPreference.findUnique({
      where: { userId },
    });

    return preference ? this.toView(preference) : this.buildDefaultView(userId);
  }

  async upsertPreferences(
    userId: string,
    dto: UpdateDisplayPreferenceDto,
  ): Promise<DisplayPreferenceView> {
    const breedOverrides = await this.normalizeOverrides(
      dto.breedLabelOverrides,
      "breed",
    );
    const coatColorOverrides = await this.normalizeOverrides(
      dto.coatColorLabelOverrides,
      "coatColor",
    );

    const createData: Prisma.DisplayPreferenceCreateInput = {
      user: {
        connect: { id: userId },
      },
      breedNameMode: dto.breedNameMode ?? DisplayNameMode.CANONICAL,
      coatColorNameMode: dto.coatColorNameMode ?? DisplayNameMode.CANONICAL,
      breedNameOverrides: this.serializeOverrides(breedOverrides),
      coatColorNameOverrides: this.serializeOverrides(coatColorOverrides),
    };

    const updateData: Prisma.DisplayPreferenceUpdateInput = {};
    if (dto.breedNameMode) {
      updateData.breedNameMode = dto.breedNameMode;
    }
    if (dto.coatColorNameMode) {
      updateData.coatColorNameMode = dto.coatColorNameMode;
    }
    if (dto.breedLabelOverrides !== undefined) {
      updateData.breedNameOverrides = this.serializeOverrides(breedOverrides);
    }
    if (dto.coatColorLabelOverrides !== undefined) {
      updateData.coatColorNameOverrides = this.serializeOverrides(
        coatColorOverrides,
      );
    }

    const result = await this.prisma.displayPreference.upsert({
      where: { userId },
      create: createData,
      update: updateData,
    });

    return this.toView(result);
  }

  async buildPersonalizedBreedRecords(
    preference: DisplayPreferenceView,
  ): Promise<PersonalizedMasterRecord[]> {
    const records = await this.fetchMasterRecords("breed");
    return this.buildPersonalizedRecords(
      records,
      preference.breedNameMode,
      preference.breedLabelOverrides,
    );
  }

  async buildPersonalizedCoatColorRecords(
    preference: DisplayPreferenceView,
  ): Promise<PersonalizedMasterRecord[]> {
    const records = await this.fetchMasterRecords("coatColor");
    return this.buildPersonalizedRecords(
      records,
      preference.coatColorNameMode,
      preference.coatColorLabelOverrides,
    );
  }

  private buildPersonalizedRecords(
    sourceRecords: ReadonlyArray<MasterRecord>,
    displayMode: DisplayNameMode,
    overrides: LabelOverrideMap,
  ): PersonalizedMasterRecord[] {
    const records: PersonalizedMasterRecord[] = [];
    sourceRecords.forEach((record) => {
      const displayName = this.resolveDisplayName(
        record,
        displayMode,
        overrides,
      );
      records.push({
        code: record.code,
        canonicalName: record.name,
        displayName,
        displayNameMode: displayMode,
        isOverridden: overrides[record.code] !== undefined,
      });
    });

    return records;
  }

  private resolveDisplayName(
    record: { code: number; name: string },
    mode: DisplayNameMode,
    overrides: LabelOverrideMap,
  ): string {
    if (mode === DisplayNameMode.CUSTOM) {
      const override = overrides[record.code];
      if (override) {
        return override;
      }
    }

    if (mode === DisplayNameMode.CODE_AND_NAME) {
      const label = record.name ? `${record.code} - ${record.name}` : `${record.code}`;
      return label;
    }

    return record.name || `${record.code}`;
  }

  private serializeOverrides(
    map: LabelOverrideMap,
  ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
    const entries = Object.entries(map);
    if (entries.length === 0) {
      return Prisma.JsonNull;
    }

    return entries.reduce<Prisma.JsonObject>((acc, [code, label]) => {
      acc[code] = label;
      return acc;
    }, {});
  }

  private async normalizeOverrides(
    overrides: LabelOverrideDto[] | undefined,
    domain: MasterDataDomain,
  ): Promise<LabelOverrideMap> {
    if (!overrides || overrides.length === 0) {
      return {};
    }

    const sourceMap = await this.buildMasterRecordMap(domain);

    return overrides.reduce<LabelOverrideMap>((acc, item) => {
      const label = item.label.trim();
      if (!label) {
        return acc;
      }

      if (!sourceMap.has(item.code)) {
        throw new BadRequestException(`存在しない${domain === "breed" ? "品種" : "毛色"}コード: ${item.code}`);
      }

      acc[item.code] = label;
      return acc;
    }, {});
  }

  private buildDefaultView(userId: string): DisplayPreferenceView {
    return {
      userId,
      breedNameMode: DisplayNameMode.CANONICAL,
      coatColorNameMode: DisplayNameMode.CANONICAL,
      breedLabelOverrides: {},
      coatColorLabelOverrides: {},
      updatedAt: new Date(0),
      createdAt: undefined,
    };
  }

  private async fetchMasterRecords(domain: MasterDataDomain): Promise<ReadonlyArray<MasterRecord>> {
    if (domain === "breed") {
      return this.prisma.breed.findMany({
        select: { code: true, name: true },
        where: { isActive: true },
        orderBy: { code: "asc" },
      });
    }

    return this.prisma.coatColor.findMany({
      select: { code: true, name: true },
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
  }

  private async buildMasterRecordMap(domain: MasterDataDomain): Promise<Map<number, string>> {
    const records = await this.fetchMasterRecords(domain);
    return records.reduce<Map<number, string>>((acc, record) => {
      acc.set(record.code, record.name ?? "");
      return acc;
    }, new Map());
  }

  private toView(entity: DisplayPreference): DisplayPreferenceView {
    return {
      userId: entity.userId,
      breedNameMode: entity.breedNameMode,
      coatColorNameMode: entity.coatColorNameMode,
      breedLabelOverrides: this.parseOverrideMap(entity.breedNameOverrides),
      coatColorLabelOverrides: this.parseOverrideMap(entity.coatColorNameOverrides),
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }

  private parseOverrideMap(value: Prisma.JsonValue | null): LabelOverrideMap {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.entries(value).reduce<LabelOverrideMap>((acc, [code, label]) => {
      if (typeof label === "string" && label.trim()) {
        const numericCode = Number(code);
        if (!Number.isNaN(numericCode)) {
          acc[numericCode] = label;
        }
      }
      return acc;
    }, {});
  }
}
