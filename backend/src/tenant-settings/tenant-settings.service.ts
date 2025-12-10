import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { TagColorDefaultsDto, UpdateTagColorDefaultsDto } from './dto/tag-color-defaults.dto';

// フロントエンドのデフォルト値と同期
// 参照: frontend/src/app/tags/page.tsx の DEFAULT_*_COLOR 定数
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

interface ColorSetting {
  color: string;
  textColor: string;
}

interface StoredDefaults {
  category?: ColorSetting;
  group?: ColorSetting;
  tag?: ColorSetting;
}

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
    // 設定とテナントを同時に取得
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
      include: { tenant: true },
    });

    if (settings) {
      // テナントが存在しない場合（外部キー制約により通常は発生しない）
      if (!settings.tenant) {
        throw new NotFoundException('テナントが見つかりません');
      }
      // 設定が存在する場合はそれを返す
      if (settings.tagColorDefaults) {
        return this.mergeWithDefaults(settings.tagColorDefaults as StoredDefaults);
      }
    } else {
      // 設定が存在しない場合はテナントの存在のみ確認
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });
      if (!tenant) {
        throw new NotFoundException('テナントが見つかりません');
      }
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
    // 既存の設定を取得
    const existingSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    // 既存の設定とマージ
    const currentDefaults = existingSettings?.tagColorDefaults
      ? (existingSettings.tagColorDefaults as StoredDefaults)
      : {};

    const updatedDefaults: StoredDefaults = {
      category: {
        color: dto.category?.color ?? currentDefaults.category?.color ?? FRONTEND_DEFAULTS.category?.color ?? '#6366F1',
        textColor: dto.category?.textColor ?? currentDefaults.category?.textColor ?? FRONTEND_DEFAULTS.category?.textColor ?? '#111827',
      },
      group: {
        color: dto.group?.color ?? currentDefaults.group?.color ?? FRONTEND_DEFAULTS.group?.color ?? '#3B82F6',
        textColor: dto.group?.textColor ?? currentDefaults.group?.textColor ?? FRONTEND_DEFAULTS.group?.textColor ?? '#111827',
      },
      tag: {
        color: dto.tag?.color ?? currentDefaults.tag?.color ?? FRONTEND_DEFAULTS.tag?.color ?? '#3B82F6',
        textColor: dto.tag?.textColor ?? currentDefaults.tag?.textColor ?? FRONTEND_DEFAULTS.tag?.textColor ?? '#FFFFFF',
      },
    };

    try {
      // 設定を更新（upsert）
      // 外部キー制約により、存在しないテナントIDに対しては自動的に失敗する
      const updated = await this.prisma.tenantSettings.upsert({
        where: { tenantId },
        create: {
          tenantId,
          tagColorDefaults: updatedDefaults as Prisma.InputJsonValue,
        },
        update: {
          tagColorDefaults: updatedDefaults as Prisma.InputJsonValue,
        },
      });

      return this.mergeWithDefaults(updated.tagColorDefaults as StoredDefaults);
    } catch (error) {
      // Prisma の外部キー制約エラーをキャッチ
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new NotFoundException('テナントが見つかりません');
      }
      throw error;
    }
  }

  /**
   * ストアされた設定とデフォルト値をマージ
   * 
   * @param stored ストアされた設定
   * @returns マージ後の設定
   */
  private mergeWithDefaults(stored: StoredDefaults): TagColorDefaultsDto {
    return {
      category: {
        color: stored.category?.color ?? FRONTEND_DEFAULTS.category?.color ?? '#6366F1',
        textColor: stored.category?.textColor ?? FRONTEND_DEFAULTS.category?.textColor ?? '#111827',
      },
      group: {
        color: stored.group?.color ?? FRONTEND_DEFAULTS.group?.color ?? '#3B82F6',
        textColor: stored.group?.textColor ?? FRONTEND_DEFAULTS.group?.textColor ?? '#111827',
      },
      tag: {
        color: stored.tag?.color ?? FRONTEND_DEFAULTS.tag?.color ?? '#3B82F6',
        textColor: stored.tag?.textColor ?? FRONTEND_DEFAULTS.tag?.textColor ?? '#FFFFFF',
      },
    };
  }
}
