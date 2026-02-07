import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import {
  CreatePrintTemplateDto,
  UpdatePrintTemplateDto,
  QueryPrintTemplatesDto,
  DuplicatePrintTemplateDto,
  PrintTemplateResponse,
  CreatePrintDocCategoryDto,
  UpdatePrintDocCategoryDto,
  PrintDocCategoryResponse,
  DataSourceInfo,
} from './dto';

@Injectable()
export class PrintTemplatesService {
  constructor(private readonly prisma: PrismaService) { }

  // ==========================================
  // カテゴリ CRUD
  // ==========================================

  /** カテゴリ一覧を取得 */
  async findAllCategories(tenantId?: string): Promise<PrintDocCategoryResponse[]> {
    const where: Prisma.PrintDocCategoryWhereInput = {
      isActive: true,
    };

    if (tenantId) {
      where.OR = [
        { tenantId },
        { tenantId: null },
      ];
    }

    const categories = await this.prisma.printDocCategory.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories.map(this.mapCategoryToResponse);
  }

  /** カテゴリを1件取得 */
  async findOneCategory(id: string): Promise<PrintDocCategoryResponse> {
    const category = await this.prisma.printDocCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`カテゴリが見つかりません: ${id}`);
    }

    return this.mapCategoryToResponse(category);
  }

  /** カテゴリを作成 */
  async createCategory(dto: CreatePrintDocCategoryDto): Promise<PrintDocCategoryResponse> {
    // スラッグ重複チェック
    const existing = await this.prisma.printDocCategory.findFirst({
      where: {
        tenantId: dto.tenantId ?? null,
        slug: dto.slug,
      },
    });

    if (existing) {
      throw new ConflictException(`同じスラッグ「${dto.slug}」のカテゴリが既に存在します`);
    }

    const category = await this.prisma.printDocCategory.create({
      data: {
        tenantId: dto.tenantId ?? null,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        defaultFields: dto.defaultFields ? (JSON.parse(JSON.stringify(dto.defaultFields)) as Prisma.InputJsonValue) : Prisma.JsonNull,
        displayOrder: dto.displayOrder ?? 0,
      },
    });

    return this.mapCategoryToResponse(category);
  }

  /** カテゴリを更新 */
  async updateCategory(id: string, dto: UpdatePrintDocCategoryDto): Promise<PrintDocCategoryResponse> {
    const existing = await this.prisma.printDocCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`カテゴリが見つかりません: ${id}`);
    }

    const category = await this.prisma.printDocCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        defaultFields: dto.defaultFields !== undefined
          ? (dto.defaultFields ? (JSON.parse(JSON.stringify(dto.defaultFields)) as Prisma.InputJsonValue) : Prisma.JsonNull)
          : undefined,
        displayOrder: dto.displayOrder,
        isActive: dto.isActive,
      },
    });

    return this.mapCategoryToResponse(category);
  }

  /** カテゴリを削除 */
  async removeCategory(id: string): Promise<void> {
    const existing = await this.prisma.printDocCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`カテゴリが見つかりません: ${id}`);
    }

    // 紐づくテンプレートのcategoryIdをnullに
    await this.prisma.printTemplate.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await this.prisma.printDocCategory.delete({
      where: { id },
    });
  }

  // ==========================================
  // テンプレート CRUD
  // ==========================================

  /** テンプレート一覧を取得 */
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

  /** テンプレートを1件取得 */
  async findOne(id: string): Promise<PrintTemplateResponse> {
    const template = await this.prisma.printTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`テンプレートが見つかりません: ${id}`);
    }

    return this.mapToResponse(template);
  }

  /** テンプレートを作成 */
  async create(
    dto: CreatePrintTemplateDto,
    tenantId?: string,
  ): Promise<PrintTemplateResponse> {
    if (dto.isDefault) {
      await this.clearDefaultForCategory(dto.category, tenantId ?? null);
    }

    const template = await this.prisma.printTemplate.create({
      data: {
        tenantId: tenantId || null,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        categoryId: dto.categoryId ?? null,
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

  /** テンプレートを更新 */
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

    if (dto.isDefault && !existing.isDefault) {
      const category = dto.category || existing.category;
      await this.clearDefaultForCategory(category, existing.tenantId);
    }

    const template = await this.prisma.printTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        categoryId: dto.categoryId,
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

  /** テンプレートを削除 */
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

  /** テンプレートを複製 */
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
        category: source.category,
        categoryId: source.categoryId,
        paperWidth: source.paperWidth,
        paperHeight: source.paperHeight,
        backgroundUrl: source.backgroundUrl,
        backgroundOpacity: source.backgroundOpacity,
        positions: source.positions as Prisma.InputJsonValue,
        fontSizes: source.fontSizes as Prisma.InputJsonValue,
        isDefault: false,
        displayOrder: source.displayOrder,
      },
    });

    return this.mapToResponse(template);
  }

  // ==========================================
  // データソース定義
  // ==========================================

  /** 利用可能なデータソース一覧を返す */
  getDataSources(): DataSourceInfo[] {
    return [
      {
        type: 'cat',
        label: '猫データ',
        description: '登録されている猫の情報',
        fields: [
          { key: 'name', label: '猫名', type: 'string' },
          { key: 'registrationNumber', label: '登録番号', type: 'string' },
          { key: 'breed', label: '品種', type: 'string' },
          { key: 'coatColor', label: '毛色', type: 'string' },
          { key: 'gender', label: '性別', type: 'string' },
          { key: 'birthDate', label: '生年月日', type: 'date' },
          { key: 'microchipNumber', label: 'マイクロチップ番号', type: 'string' },
          { key: 'fatherName', label: '父猫名', type: 'string' },
          { key: 'motherName', label: '母猫名', type: 'string' },
        ],
      },
      {
        type: 'breeding',
        label: '繁殖記録',
        description: '交配・出産の記録',
        fields: [
          { key: 'maleName', label: '父猫名', type: 'string' },
          { key: 'femaleName', label: '母猫名', type: 'string' },
          { key: 'breedingDate', label: '交配日', type: 'date' },
          { key: 'expectedDueDate', label: '出産予定日', type: 'date' },
          { key: 'actualDueDate', label: '実際の出産日', type: 'date' },
          { key: 'numberOfKittens', label: '子猫数', type: 'number' },
          { key: 'status', label: 'ステータス', type: 'string' },
        ],
      },
      {
        type: 'medical',
        label: '医療記録',
        description: '健康診断・治療の記録',
        fields: [
          { key: 'visitDate', label: '診察日', type: 'date' },
          { key: 'hospitalName', label: '病院名', type: 'string' },
          { key: 'diseaseName', label: '病名', type: 'string' },
          { key: 'symptom', label: '症状', type: 'string' },
          { key: 'diagnosis', label: '診断内容', type: 'string' },
          { key: 'treatmentPlan', label: '治療方針', type: 'string' },
        ],
      },
      {
        type: 'pedigree',
        label: '血統書',
        description: '血統書の情報',
        fields: [
          { key: 'pedigreeId', label: '血統書番号', type: 'string' },
          { key: 'title', label: 'タイトル', type: 'string' },
          { key: 'catName', label: '猫名', type: 'string' },
          { key: 'breederName', label: '繁殖者名', type: 'string' },
          { key: 'ownerName', label: '所有者名', type: 'string' },
          { key: 'registrationDate', label: '登録日', type: 'date' },
        ],
      },
      {
        type: 'tenant',
        label: 'テナント情報',
        description: 'ブリーダー・事業者の情報',
        fields: [
          { key: 'name', label: 'テナント名', type: 'string' },
          { key: 'slug', label: 'スラッグ', type: 'string' },
        ],
      },
      {
        type: 'static',
        label: '自由入力',
        description: 'ユーザーが直接入力する固定テキスト',
        fields: [
          { key: 'value', label: 'テキスト', type: 'string' },
        ],
      },
    ];
  }

  // ==========================================
  // ヘルパー
  // ==========================================

  /** 同カテゴリ・同テナントの既存デフォルトを解除 */
  private async clearDefaultForCategory(
    category: string,
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

  /** カテゴリをレスポンス型に変換 */
  private mapCategoryToResponse(category: {
    id: string;
    tenantId: string | null;
    name: string;
    slug: string;
    description: string | null;
    defaultFields: Prisma.JsonValue;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PrintDocCategoryResponse {
    return {
      id: category.id,
      tenantId: category.tenantId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      defaultFields: category.defaultFields as PrintDocCategoryResponse['defaultFields'],
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /** テンプレートをレスポンス型に変換 */
  private mapToResponse(template: {
    id: string;
    tenantId: string | null;
    name: string;
    description: string | null;
    category: string;
    categoryId: string | null;
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
      category: template.category,
      categoryId: template.categoryId,
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
