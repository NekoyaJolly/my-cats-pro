import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import {
  CreatePrintTemplateDto,
  UpdatePrintTemplateDto,
  QueryPrintTemplatesDto,
  DuplicatePrintTemplateDto,
  PrintTemplateCategory,
  PrintTemplateResponse,
} from './dto';

@Injectable()
export class PrintTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * テンプレート一覧を取得
   */
  async findAll(query: QueryPrintTemplatesDto): Promise<PrintTemplateResponse[]> {
    const where: Prisma.PrintTemplateWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.tenantId) {
      if (query.includeGlobal) {
        // テナント固有 + 共通テンプレート
        where.OR = [
          { tenantId: query.tenantId },
          { tenantId: null },
        ];
      } else {
        where.tenantId = query.tenantId;
      }
    }

    const templates = await this.prisma.printTemplate.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return templates.map(this.mapToResponse);
  }

  /**
   * カテゴリごとのテンプレート一覧を取得
   */
  async findByCategory(
    category: PrintTemplateCategory,
    tenantId?: string,
  ): Promise<PrintTemplateResponse[]> {
    const where: Prisma.PrintTemplateWhereInput = {
      category,
      isActive: true,
    };

    if (tenantId) {
      where.OR = [
        { tenantId },
        { tenantId: null },
      ];
    }

    const templates = await this.prisma.printTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return templates.map(this.mapToResponse);
  }

  /**
   * テンプレートを1件取得
   */
  async findOne(id: string): Promise<PrintTemplateResponse> {
    const template = await this.prisma.printTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`テンプレートが見つかりません: ${id}`);
    }

    return this.mapToResponse(template);
  }

  /**
   * デフォルトテンプレートを取得
   */
  async findDefault(
    category: PrintTemplateCategory,
    tenantId?: string,
  ): Promise<PrintTemplateResponse | null> {
    // まずテナント固有のデフォルトを探す
    if (tenantId) {
      const tenantDefault = await this.prisma.printTemplate.findFirst({
        where: {
          category,
          tenantId,
          isDefault: true,
          isActive: true,
        },
      });
      if (tenantDefault) {
        return this.mapToResponse(tenantDefault);
      }
    }

    // なければ共通デフォルトを探す
    const globalDefault = await this.prisma.printTemplate.findFirst({
      where: {
        category,
        tenantId: null,
        isDefault: true,
        isActive: true,
      },
    });

    return globalDefault ? this.mapToResponse(globalDefault) : null;
  }

  /**
   * テンプレートを作成
   */
  async create(
    dto: CreatePrintTemplateDto,
    tenantId?: string,
  ): Promise<PrintTemplateResponse> {
    // デフォルト設定の場合、同カテゴリの既存デフォルトを解除
    if (dto.isDefault) {
      await this.clearDefaultForCategory(dto.category, tenantId ?? null);
    }

    const template = await this.prisma.printTemplate.create({
      data: {
        tenantId: tenantId || null,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        paperWidth: dto.paperWidth,
        paperHeight: dto.paperHeight,
        backgroundUrl: dto.backgroundUrl,
        backgroundOpacity: dto.backgroundOpacity ?? 100,
        positions: dto.positions as Prisma.InputJsonValue,
        fontSizes: dto.fontSizes as Prisma.InputJsonValue,
        isDefault: dto.isDefault ?? false,
        displayOrder: dto.displayOrder ?? 0,
      },
    });

    return this.mapToResponse(template);
  }

  /**
   * テンプレートを更新
   */
  async update(
    id: string,
    dto: UpdatePrintTemplateDto,
  ): Promise<PrintTemplateResponse> {
    const existing = await this.prisma.printTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`テンプレートが見つかりません: ${id}`);
    }

    // デフォルトに設定する場合、同カテゴリの既存デフォルトを解除
    if (dto.isDefault && !existing.isDefault) {
      const category = dto.category || (existing.category as PrintTemplateCategory);
      await this.clearDefaultForCategory(category, existing.tenantId);
    }

    const template = await this.prisma.printTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        paperWidth: dto.paperWidth,
        paperHeight: dto.paperHeight,
        backgroundUrl: dto.backgroundUrl,
        backgroundOpacity: dto.backgroundOpacity,
        positions: dto.positions as Prisma.InputJsonValue,
        fontSizes: dto.fontSizes as Prisma.InputJsonValue,
        isActive: dto.isActive,
        isDefault: dto.isDefault,
        displayOrder: dto.displayOrder,
      },
    });

    return this.mapToResponse(template);
  }

  /**
   * テンプレートを削除
   */
  async remove(id: string): Promise<void> {
    const existing = await this.prisma.printTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`テンプレートが見つかりません: ${id}`);
    }

    await this.prisma.printTemplate.delete({
      where: { id },
    });
  }

  /**
   * テンプレートを複製
   */
  async duplicate(
    id: string,
    dto: DuplicatePrintTemplateDto,
  ): Promise<PrintTemplateResponse> {
    const source = await this.prisma.printTemplate.findUnique({
      where: { id },
    });

    if (!source) {
      throw new NotFoundException(`テンプレートが見つかりません: ${id}`);
    }

    const template = await this.prisma.printTemplate.create({
      data: {
        tenantId: dto.tenantId || source.tenantId,
        name: dto.name,
        description: source.description ? `${source.description} (コピー)` : null,
        category: source.category as PrintTemplateCategory,
        paperWidth: source.paperWidth,
        paperHeight: source.paperHeight,
        backgroundUrl: source.backgroundUrl,
        backgroundOpacity: source.backgroundOpacity,
        positions: source.positions as Prisma.InputJsonValue,
        fontSizes: source.fontSizes as Prisma.InputJsonValue,
        isDefault: false, // 複製はデフォルトにしない
        displayOrder: source.displayOrder,
      },
    });

    return this.mapToResponse(template);
  }

  /**
   * 利用可能なカテゴリ一覧を取得
   */
  getCategories(): Array<{ value: PrintTemplateCategory; label: string }> {
    return Object.values(PrintTemplateCategory).map((value) => ({
      value,
      label: this.getCategoryLabel(value),
    }));
  }

  /**
   * 同カテゴリ・同テナントの既存デフォルトを解除
   */
  private async clearDefaultForCategory(
    category: PrintTemplateCategory,
    tenantId: string | null,
  ): Promise<void> {
    await this.prisma.printTemplate.updateMany({
      where: {
        category,
        tenantId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  /**
   * カテゴリの日本語ラベルを取得
   */
  private getCategoryLabel(category: PrintTemplateCategory): string {
    const labels: Record<PrintTemplateCategory, string> = {
      [PrintTemplateCategory.PEDIGREE]: '血統書',
      [PrintTemplateCategory.KITTEN_TRANSFER]: '子猫譲渡証明書',
      [PrintTemplateCategory.HEALTH_CERTIFICATE]: '健康診断書',
      [PrintTemplateCategory.VACCINATION_RECORD]: 'ワクチン接種記録',
      [PrintTemplateCategory.BREEDING_RECORD]: '繁殖記録',
      [PrintTemplateCategory.CONTRACT]: '契約書',
      [PrintTemplateCategory.INVOICE]: '請求書/領収書',
      [PrintTemplateCategory.CUSTOM]: 'カスタム書類',
    };
    return labels[category] || category;
  }

  /**
   * DBモデルをレスポンス型に変換
   */
  private mapToResponse(template: {
    id: string;
    tenantId: string | null;
    name: string;
    description: string | null;
    category: string;
    paperWidth: number;
    paperHeight: number;
    backgroundUrl: string | null;
    backgroundOpacity: number;
    positions: Prisma.JsonValue;
    fontSizes: Prisma.JsonValue;
    isActive: boolean;
    isDefault: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }): PrintTemplateResponse {
    return {
      id: template.id,
      tenantId: template.tenantId,
      name: template.name,
      description: template.description,
      category: template.category as PrintTemplateCategory,
      paperWidth: template.paperWidth,
      paperHeight: template.paperHeight,
      backgroundUrl: template.backgroundUrl,
      backgroundOpacity: template.backgroundOpacity,
      positions: template.positions as Record<string, unknown>,
      fontSizes: template.fontSizes as Record<string, number> | null,
      isActive: template.isActive,
      isDefault: template.isDefault,
      displayOrder: template.displayOrder,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
