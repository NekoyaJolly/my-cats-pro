import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  CreatePrintTemplateDto,
  UpdatePrintTemplateDto,
  QueryPrintTemplatesDto,
  DuplicatePrintTemplateDto,
  CreatePrintDocCategoryDto,
  UpdatePrintDocCategoryDto,
} from './dto';
import { PrintTemplatesService } from './print-templates.service';

@Controller('print-templates')
export class PrintTemplatesController {
  constructor(private readonly service: PrintTemplatesService) { }

  // ==========================================
  // カテゴリ管理
  // ==========================================

  /**
   * カテゴリ一覧を取得
   * GET /api/v1/print-templates/categories
   */
  @Get('categories')
  async getCategories(@Query('tenantId') tenantId?: string) {
    const categories = await this.service.findAllCategories(tenantId);
    return {
      success: true,
      data: categories,
    };
  }

  /**
   * カテゴリを1件取得
   * GET /api/v1/print-templates/categories/:id
   */
  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    const category = await this.service.findOneCategory(id);
    return {
      success: true,
      data: category,
    };
  }

  /**
   * カテゴリを作成
   * POST /api/v1/print-templates/categories
   */
  @Post('categories')
  async createCategory(@Body() dto: CreatePrintDocCategoryDto) {
    const category = await this.service.createCategory(dto);
    return {
      success: true,
      data: category,
    };
  }

  /**
   * カテゴリを更新
   * PATCH /api/v1/print-templates/categories/:id
   */
  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdatePrintDocCategoryDto,
  ) {
    const category = await this.service.updateCategory(id, dto);
    return {
      success: true,
      data: category,
    };
  }

  /**
   * カテゴリを削除
   * DELETE /api/v1/print-templates/categories/:id
   */
  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCategory(@Param('id') id: string) {
    await this.service.removeCategory(id);
  }

  // ==========================================
  // データソース
  // ==========================================

  /**
   * 利用可能なデータソース一覧を取得
   * GET /api/v1/print-templates/data-sources
   */
  @Get('data-sources')
  getDataSources() {
    return {
      success: true,
      data: this.service.getDataSources(),
    };
  }

  // ==========================================
  // テンプレート管理
  // ==========================================

  /**
   * テンプレート一覧を取得
   * GET /api/v1/print-templates
   */
  @Get()
  async findAll(@Query() query: QueryPrintTemplatesDto) {
    const templates = await this.service.findAll(query);
    return {
      success: true,
      data: templates,
    };
  }

  /**
   * テンプレートを1件取得
   * GET /api/v1/print-templates/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const template = await this.service.findOne(id);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * テンプレートを作成
   * POST /api/v1/print-templates
   */
  @Post()
  async create(@Body() dto: CreatePrintTemplateDto) {
    const template = await this.service.create(dto, dto.tenantId);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * テンプレートを複製
   * POST /api/v1/print-templates/:id/duplicate
   */
  @Post(':id/duplicate')
  async duplicate(
    @Param('id') id: string,
    @Body() dto: DuplicatePrintTemplateDto,
  ) {
    const template = await this.service.duplicate(id, dto);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * テンプレートを更新
   * PATCH /api/v1/print-templates/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrintTemplateDto,
  ) {
    const template = await this.service.update(id, dto);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * テンプレートを削除
   * DELETE /api/v1/print-templates/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
