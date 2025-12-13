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
  PrintTemplateCategory,
} from './dto';
import { PrintTemplatesService } from './print-templates.service';

@Controller('print-templates')
export class PrintTemplatesController {
  constructor(private readonly service: PrintTemplatesService) {}

  /**
   * 利用可能なカテゴリ一覧を取得
   * GET /api/v1/print-templates/categories
   */
  @Get('categories')
  getCategories() {
    return {
      success: true,
      data: this.service.getCategories(),
    };
  }

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
   * カテゴリ別テンプレート一覧を取得
   * GET /api/v1/print-templates/category/:category
   */
  @Get('category/:category')
  async findByCategory(
    @Param('category') category: PrintTemplateCategory,
    @Query('tenantId') tenantId?: string,
  ) {
    const templates = await this.service.findByCategory(category, tenantId);
    return {
      success: true,
      data: templates,
    };
  }

  /**
   * デフォルトテンプレートを取得
   * GET /api/v1/print-templates/default/:category
   */
  @Get('default/:category')
  async findDefault(
    @Param('category') category: PrintTemplateCategory,
    @Query('tenantId') tenantId?: string,
  ) {
    const template = await this.service.findDefault(category, tenantId);
    return {
      success: true,
      data: template,
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
