import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus, UseGuards 
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";


import { BreedingService } from "./breeding.service";
import {
  BreedingQueryDto,
  CreateBreedingDto,
  UpdateBreedingDto,
  CreateBreedingNgRuleDto,
  UpdateBreedingNgRuleDto,
  CreatePregnancyCheckDto,
  UpdatePregnancyCheckDto,
  PregnancyCheckQueryDto,
  CreateBirthPlanDto,
  UpdateBirthPlanDto,
  BirthPlanQueryDto,
} from "./dto";
import { CreateKittenDispositionDto, UpdateKittenDispositionDto } from "./dto/kitten-disposition.dto";

@ApiTags("Breeding")
@Controller("breeding")
export class BreedingController {
  constructor(private readonly breedingService: BreedingService) {}

  @Get()
  @ApiOperation({ summary: "交配記録一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAll(@Query() query: BreedingQueryDto) {
    return this.breedingService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "交配記録の新規作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(
    @Body() dto: CreateBreedingDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.create(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // NOTE: parameterized routes for the main breeding resource are defined
  // later in the file so that static subpaths (e.g. "pregnancy-checks",
  // "birth-plans") are registered first. This prevents Express from
  // matching those static paths as an ":id" and returning 404.

  @Get("ng-rules")
  @ApiOperation({ summary: "NGペアルール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findNgRules() {
    return this.breedingService.findNgRules();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("ng-rules")
  @ApiOperation({ summary: "NGペアルールの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createNgRule(@Body() dto: CreateBreedingNgRuleDto) {
    return this.breedingService.createNgRule(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("ng-rules/:id")
  @ApiOperation({ summary: "NGペアルールの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateNgRule(@Param("id") id: string, @Body() dto: UpdateBreedingNgRuleDto) {
    return this.breedingService.updateNgRule(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("ng-rules/:id")
  @ApiOperation({ summary: "NGペアルールの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeNgRule(@Param("id") id: string) {
    return this.breedingService.removeNgRule(id);
  }

  // Pregnancy Check endpoints
  @Get("test")
  @ApiOperation({ summary: "テスト" })
  @ApiResponse({ status: HttpStatus.OK })
  test() {
    return { message: "test" };
  }

  @Get("pregnancy-checks")
  @ApiOperation({ summary: "妊娠チェック一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAllPregnancyChecks(@Query() query: PregnancyCheckQueryDto) {
    return this.breedingService.findAllPregnancyChecks(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("pregnancy-checks")
  @ApiOperation({ summary: "妊娠チェックの新規作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createPregnancyCheck(
    @Body() dto: CreatePregnancyCheckDto,
    @GetUser() user?: RequestUser,
  ) {
    console.log('[DEBUG] createPregnancyCheck - Received DTO:', JSON.stringify(dto, null, 2));
    console.log('[DEBUG] motherId type:', typeof dto.motherId, 'value:', dto.motherId);
    console.log('[DEBUG] fatherId type:', typeof dto.fatherId, 'value:', dto.fatherId);
    return this.breedingService.createPregnancyCheck(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("pregnancy-checks/:id")
  @ApiOperation({ summary: "妊娠チェックの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updatePregnancyCheck(@Param("id") id: string, @Body() dto: UpdatePregnancyCheckDto) {
    return this.breedingService.updatePregnancyCheck(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("pregnancy-checks/:id")
  @ApiOperation({ summary: "妊娠チェックの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removePregnancyCheck(@Param("id") id: string) {
    return this.breedingService.removePregnancyCheck(id);
  }

  // Birth Plan endpoints
  @Get("birth-plans")
  @ApiOperation({ summary: "出産計画一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAllBirthPlans(@Query() query: BirthPlanQueryDto) {
    return this.breedingService.findAllBirthPlans(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("birth-plans")
  @ApiOperation({ summary: "出産計画の新規作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createBirthPlan(
    @Body() dto: CreateBirthPlanDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.createBirthPlan(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("birth-plans/:id")
  @ApiOperation({ summary: "出産計画の更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateBirthPlan(@Param("id") id: string, @Body() dto: UpdateBirthPlanDto) {
    return this.breedingService.updateBirthPlan(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("birth-plans/:id")
  @ApiOperation({ summary: "出産計画の削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeBirthPlan(@Param("id") id: string) {
    return this.breedingService.removeBirthPlan(id);
  }

  // ========== Kitten Disposition Endpoints ==========

  @Get("kitten-dispositions/:birthRecordId")
  @ApiOperation({ summary: "出産記録の子猫処遇一覧取得" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "birthRecordId" })
  findAllKittenDispositions(@Param("birthRecordId") birthRecordId: string) {
    return this.breedingService.findAllKittenDispositions(birthRecordId);
  }

  @Post("kitten-dispositions")
  @ApiOperation({ summary: "子猫処遇の登録" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createKittenDisposition(
    @Body() dto: CreateKittenDispositionDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.createKittenDisposition(dto, user?.userId);
  }

  @Patch("kitten-dispositions/:id")
  @ApiOperation({ summary: "子猫処遇の更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateKittenDisposition(@Param("id") id: string, @Body() dto: UpdateKittenDispositionDto) {
    return this.breedingService.updateKittenDisposition(id, dto);
  }

  @Delete("kitten-dispositions/:id")
  @ApiOperation({ summary: "子猫処遇の削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeKittenDisposition(@Param("id") id: string) {
    return this.breedingService.removeKittenDisposition(id);
  }

  @Post("birth-plans/:id/complete")
  @ApiOperation({ summary: "出産記録の完了" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  completeBirthRecord(@Param("id") id: string) {
    return this.breedingService.completeBirthRecord(id);
  }

  // Parameterized routes for the main breeding resource.
  // These are intentionally placed after static subpaths such as
  // "pregnancy-checks" and "birth-plans" so that Express does not
  // interpret those paths as an ":id" and cause 404s.
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Patch(":id")
  // @ApiOperation({ summary: "交配記録の更新" })
  // @ApiResponse({ status: HttpStatus.OK })
  // @ApiParam({ name: "id" })
  // update(@Param("id") id: string, @Body() dto: UpdateBreedingDto) {
  //   return this.breedingService.update(id, dto);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Delete(":id")
  // @ApiOperation({ summary: "交配記録の削除" })
  // @ApiResponse({ status: HttpStatus.OK })
  // @ApiParam({ name: "id" })
  // remove(@Param("id") id: string) {
  //   return this.breedingService.remove(id);
  // }
}
