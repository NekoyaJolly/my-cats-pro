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
  Logger,
  UseGuards,
  ParseUUIDPipe,
  Header,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CatsService } from "./cats.service";
import { GENDER_MASTER } from "./constants/gender";
import {
  CreateCatDto,
  UpdateCatDto,
  CatQueryDto,
  KittenQueryDto,
  CreateWeightRecordDto,
  UpdateWeightRecordDto,
  WeightRecordQueryDto,
  CreateBulkWeightRecordsDto,
} from "./dto";

@ApiTags("Cats")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cats")
export class CatsController {
  private readonly logger = new Logger(CatsController.name);

  constructor(private readonly catsService: CatsService) {}

  @Post()
  @ApiOperation({ summary: "猫データを作成" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "猫データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  create(@Body() createCatDto: CreateCatDto) {
    this.logger.log({
      message: 'Creating new cat',
      catName: createCatDto.name,
      breedId: createCatDto.breedId,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.create(createCatDto);
  }

  @Get()
  @Header('Cache-Control', 'no-cache')
  @ApiOperation({ summary: "猫データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "猫データの一覧" })
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
  @ApiQuery({ name: "gender", required: false, description: "性別" })
  @ApiQuery({ name: "status", required: false, description: "ステータス" })
  @ApiQuery({ name: "ageMin", required: false, description: "最小年齢" })
  @ApiQuery({ name: "ageMax", required: false, description: "最大年齢" })
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
  findAll(@Query() query: CatQueryDto) {
    return this.catsService.findAll(query);
  }

  @Get("statistics")
  @ApiOperation({ summary: "猫データの統計情報を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "統計情報" })
  getStatistics() {
    return this.catsService.getStatistics();
  }

  @Get("kittens")
  @Header('Cache-Control', 'no-cache')
  @ApiOperation({ summary: "子猫一覧を取得（生後6ヶ月未満、母猫ごとにグループ化）" })
  @ApiResponse({ status: HttpStatus.OK, description: "子猫データの一覧（母猫ごとにグループ化）" })
  @ApiQuery({
    name: "motherId",
    required: false,
    description: "母猫ID（指定時はその母猫の子猫のみ取得）",
  })
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
    example: 50,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード（子猫名）" })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "birthDate",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  findKittens(@Query() query: KittenQueryDto) {
    return this.catsService.findKittens(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで猫データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "猫データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.catsService.findOne(id);
  }

  @Get(":id/breeding-history")
  @ApiOperation({ summary: "猫の繁殖履歴を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "繁殖履歴" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  getBreedingHistory(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.catsService.getBreedingHistory(id);
  }

  @Get(":id/care-history")
  @ApiOperation({ summary: "猫のケア履歴を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "ケア履歴" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  getCareHistory(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.catsService.getCareHistory(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "猫データを更新" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "猫データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateCatDto: UpdateCatDto,
  ) {
    this.logger.log({
      message: 'Updating cat',
      catId: id,
      fields: Object.keys(updateCatDto),
      timestamp: new Date().toISOString(),
    });
    return this.catsService.update(id, updateCatDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "猫データを削除" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "猫データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    this.logger.warn({
      message: 'Deleting cat',
      catId: id,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.remove(id);
  }

  @Get("genders")
  @ApiOperation({ summary: "性別マスタデータを取得" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "性別マスタデータを返却",
  })
  getGenders() {
    return {
      success: true,
      data: GENDER_MASTER.map(record => ({
        id: parseInt(record.key),
        code: parseInt(record.key),
        name: record.name,
        canonical: record.canonical,
      })),
    };
  }

  // ==========================================
  // 体重記録 API エンドポイント
  // ==========================================

  @Get(":id/weight-records")
  @Header("Cache-Control", "no-cache")
  @ApiOperation({ summary: "猫の体重記録一覧を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "体重記録一覧" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
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
    example: 50,
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "開始日",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "終了日",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  getWeightRecords(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Query() query: WeightRecordQueryDto,
    @GetUser() user: RequestUser,
  ) {
    return this.catsService.getWeightRecords(id, query, user.userId);
  }

  @Post(":id/weight-records")
  @ApiOperation({ summary: "猫の体重記録を追加" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "体重記録が正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  createWeightRecord(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: CreateWeightRecordDto,
    @GetUser() user: RequestUser,
  ) {
    this.logger.log({
      message: "Creating weight record",
      catId: id,
      weight: dto.weight,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.createWeightRecord(id, dto, user.userId);
  }

  @Get("weight-records/:recordId")
  @ApiOperation({ summary: "体重記録を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "体重記録" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "体重記録が見つかりません",
  })
  @ApiParam({ name: "recordId", description: "体重記録のID" })
  getWeightRecord(
    @Param("recordId", new ParseUUIDPipe({ version: "4" })) recordId: string,
  ) {
    return this.catsService.getWeightRecord(recordId);
  }

  @Patch("weight-records/:recordId")
  @ApiOperation({ summary: "体重記録を更新" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "体重記録が正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "体重記録が見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiParam({ name: "recordId", description: "体重記録のID" })
  updateWeightRecord(
    @Param("recordId", new ParseUUIDPipe({ version: "4" })) recordId: string,
    @Body() dto: UpdateWeightRecordDto,
    @GetUser() user: RequestUser,
  ) {
    this.logger.log({
      message: "Updating weight record",
      recordId,
      fields: Object.keys(dto),
      timestamp: new Date().toISOString(),
    });
    return this.catsService.updateWeightRecord(recordId, dto, user.userId);
  }

  @Delete("weight-records/:recordId")
  @ApiOperation({ summary: "体重記録を削除" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "体重記録が正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "体重記録が見つかりません",
  })
  @ApiParam({ name: "recordId", description: "体重記録のID" })
  deleteWeightRecord(
    @Param("recordId", new ParseUUIDPipe({ version: "4" })) recordId: string,
    @GetUser() user: RequestUser,
  ) {
    this.logger.warn({
      message: "Deleting weight record",
      recordId,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.deleteWeightRecord(recordId, user.userId);
  }

  @Post("weight-records/bulk")
  @ApiOperation({ summary: "複数の猫の体重を一括登録" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "体重記録が正常に一括作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  createBulkWeightRecords(
    @Body() dto: CreateBulkWeightRecordsDto,
    @GetUser() user: RequestUser,
  ) {
    this.logger.log({
      message: "Creating bulk weight records",
      count: dto.records.length,
      recordedAt: dto.recordedAt,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.createBulkWeightRecords(dto, user.userId);
  }
}
