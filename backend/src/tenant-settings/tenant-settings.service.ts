import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TagColorDefaultsDto, UpdateTagColorDefaultsDto } from './dto/tag-color-defaults.dto';

// フロントエンドのデフォルト値と同期
const FRONTEND_DEFAULTS: TagColorDefaultsDto = {
  category: {
    color: '#6366F1',
    textColor: '#111827',
  },
  group: {
    color: '#3B82F6',
    textColor: '#111827',
  },
  tag: {
    color: '#3B82F6',
    textColor: '#FFFFFF',
  },
};

/**
 * テナント設定サービス
 * 
 * テナント単位の各種設定を管理します。
 * 現在はタグカラーのデフォルト設定をサポートしています。
 */
@Injectable()
export class TenantSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * タグカラーデフォルト設定を取得
   * 
   * @param tenantId テナントID
   * @returns タグカラーデフォルト設定（設定がない場合はフロントエンドのデフォルト値を返す）
   */
  async getTagColorDefaults(tenantId: string): Promise<TagColorDefaultsDto> {
    // テナントの存在確認
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }

    // 設定を取得
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    // 設定が存在する場合はそれを返す
    if (settings?.tagColorDefaults) {
      const stored = settings.tagColorDefaults as Record<string, unknown>;
      return this.mergeWithDefaults(stored);
    }

    // 設定が存在しない場合はフロントエンドのデフォルト値を返す
    return FRONTEND_DEFAULTS;
  }

  /**
   * タグカラーデフォルト設定を更新
   * 
   * @param tenantId テナントID
   * @param dto 更新内容（部分更新をサポート）
   * @returns 更新後のタグカラーデフォルト設定
   */
  async updateTagColorDefaults(
    tenantId: string,
    dto: UpdateTagColorDefaultsDto,
  ): Promise<TagColorDefaultsDto> {
    // テナントの存在確認
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }

    // 既存の設定を取得
    const existingSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    // 既存の設定とマージ
    const currentDefaults = existingSettings?.tagColorDefaults
      ? (existingSettings.tagColorDefaults as Record<string, unknown>)
      : {};

    const updatedDefaults = {
      category: {
        ...(currentDefaults.category as Record<string, unknown> || FRONTEND_DEFAULTS.category),
        ...(dto.category || {}),
      },
      group: {
        ...(currentDefaults.group as Record<string, unknown> || FRONTEND_DEFAULTS.group),
        ...(dto.group || {}),
      },
      tag: {
        ...(currentDefaults.tag as Record<string, unknown> || FRONTEND_DEFAULTS.tag),
        ...(dto.tag || {}),
      },
    };

    // 設定を更新（upsert）
    const updated = await this.prisma.tenantSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        tagColorDefaults: updatedDefaults,
      },
      update: {
        tagColorDefaults: updatedDefaults,
      },
    });

    return this.mergeWithDefaults(updated.tagColorDefaults as Record<string, unknown>);
  }

  /**
   * ストアされた設定とデフォルト値をマージ
   * 
   * @param stored ストアされた設定
   * @returns マージ後の設定
   */
  private mergeWithDefaults(stored: Record<string, unknown>): TagColorDefaultsDto {
    return {
      category: {
        ...FRONTEND_DEFAULTS.category,
        ...(stored.category as Record<string, unknown> || {}),
      },
      group: {
        ...FRONTEND_DEFAULTS.group,
        ...(stored.group as Record<string, unknown> || {}),
      },
      tag: {
        ...FRONTEND_DEFAULTS.tag,
        ...(stored.tag as Record<string, unknown> || {}),
      },
    } as TagColorDefaultsDto;
  }
}
