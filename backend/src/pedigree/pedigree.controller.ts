import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Response } from 'express';

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../auth/roles.decorator";
import { Public } from "../common/decorators/public.decorator";

import { CreatePedigreeDto, UpdatePedigreeDto, PedigreeQueryDto } from "./dto";
import { PedigreePdfService } from "./pdf/pedigree-pdf.service";
import { PrintSettingsService, PositionsConfig } from "./pdf/print-settings.service";
import { PedigreeService } from "./pedigree.service";


@ApiTags("Pedigrees")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("pedigrees")
export class PedigreeController {
  constructor(
    private readonly pedigreeService: PedigreeService,
    private readonly pedigreePdfService: PedigreePdfService,
    private readonly printSettingsService: PrintSettingsService,
  ) {}

  // TODO: 本番リリース前に削除 - @Public()は開発環境専用
  @Public()
  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを作成（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "血統書データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  create(@Body() createPedigreeDto: CreatePedigreeDto) {
    return this.pedigreeService.create(createPedigreeDto);
  }

  @Get()
  @ApiOperation({ summary: "血統書データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データの一覧" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 10,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード" })
  @ApiQuery({ name: "breedId", required: false, description: "品種ID" })
  @ApiQuery({ name: "coatColorId", required: false, description: "毛色ID" })
  @ApiQuery({
    name: "gender",
    required: false,
    description: "性別 (1: オス, 2: メス)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "createdAt",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  findAll(@Query() query: PedigreeQueryDto) {
    return this.pedigreeService.findAll(query);
  }

  @Get("next-id")
  @ApiOperation({ summary: "次の血統書番号を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "次の血統書番号" })
  getNextId() {
    return this.pedigreeService.getNextId();
  }

  // ===== 印刷設定 API（静的ルートなので :id より先に定義） =====

  @Get("print-settings")
  @Public()
  @ApiOperation({ summary: "印刷設定を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "現在の印刷設定" })
  async getPrintSettings() {
    return this.printSettingsService.getSettings();
  }

  @Patch("print-settings")
  @Public()
  @ApiOperation({ summary: "印刷設定を更新" })
  @ApiResponse({ status: HttpStatus.OK, description: "更新後の印刷設定" })
  async updatePrintSettings(@Body() settings: PositionsConfig) {
    return this.printSettingsService.updateSettings(settings);
  }

  @Post("print-settings/reset")
  @Public()
  @ApiOperation({ summary: "印刷設定をデフォルトにリセット" })
  @ApiResponse({ status: HttpStatus.OK, description: "リセット後の印刷設定" })
  async resetPrintSettings() {
    return this.printSettingsService.resetToDefault();
  }

  @Get("pedigree-id/:pedigreeId/pdf")
  // TODO: 本番リリース前に削除 - @Public()は開発環境専用
  @Public()
  @ApiOperation({ summary: "血統書PDFを生成してダウンロード" })
  @ApiResponse({ status: HttpStatus.OK, description: "PDF生成成功", type: 'application/pdf' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "pedigreeId", description: "血統書番号" })
  @ApiQuery({ name: "format", required: false, description: "出力形式 (pdf|base64)", example: "pdf" })
  @ApiQuery({ name: "debug", required: false, description: "デバッグモード（背景画像表示）", example: "false" })
  async generatePdf(
    @Param("pedigreeId") pedigreeId: string,
    @Query("format") format: string = "pdf",
    @Query("debug") debug: string = "false",
    @Res() res: Response,
  ) {
    const debugMode = debug === "true" || debug === "1";
    
    if (format === "base64") {
      const base64Data = await this.pedigreePdfService.generateBase64(pedigreeId);
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      return res.json({
        pedigreeId,
        format: "base64",
        data: base64Data,
        filename: `pedigree_${pedigreeId}_${today}.pdf`,
      });
    }

    const pdfBuffer = await this.pedigreePdfService.generatePdf(pedigreeId, debugMode);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `pedigree_${pedigreeId}_${today}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    // ブラウザ内プレビュー（PDFビューア）を優先し、印刷に進みやすくする
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  }

  @Get("pedigree-id/:pedigreeId")
  @ApiOperation({ summary: "血統書番号で血統書データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "pedigreeId", description: "血統書番号" })
  findByPedigreeId(@Param("pedigreeId") pedigreeId: string) {
    return this.pedigreeService.findByPedigreeId(pedigreeId);
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで血統書データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  findOne(@Param("id") id: string) {
    return this.pedigreeService.findOne(id);
  }

  @Get(":id/family-tree")
  @ApiOperation({ summary: "血統書の家系図を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "家系図データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  getFamilyTree(@Param("id") id: string) {
    return this.pedigreeService.getFamilyTree(id);
  }

  @Get(":id/family")
  @ApiOperation({ summary: "血統書データの家系図を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "家系図データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  @ApiQuery({
    name: "generations",
    required: false,
    description: "取得する世代数",
    example: 3,
  })
  getFamily(
    @Param("id") id: string,
    @Query("generations") generations?: number,
  ) {
    return this.pedigreeService.getFamily(id, generations);
  }

  @Get(":id/descendants")
  @ApiOperation({ summary: "血統書データの子孫を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "子孫データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  getDescendants(@Param("id") id: string) {
    return this.pedigreeService.getDescendants(id);
  }

  // TODO: 本番リリース前に削除 - @Public()は開発環境専用
  @Public()
  @Patch(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを更新（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "血統書データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  update(
    @Param("id") id: string,
    @Body() updatePedigreeDto: UpdatePedigreeDto,
  ) {
    return this.pedigreeService.update(id, updatePedigreeDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを削除（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "血統書データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  remove(@Param("id") id: string) {
    return this.pedigreeService.remove(id);
  }
}
