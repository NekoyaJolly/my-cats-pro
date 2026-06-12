import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { TagAutomationEventType, TagAutomationRunStatus, TagAutomationTriggerType } from "@prisma/client";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PERMISSIONS } from '../auth/permissions';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

import { CreateTagAutomationRuleDto, UpdateTagAutomationRuleDto } from "./dto";
import { TagAutomationExecutionService } from "./tag-automation-execution.service";
import { TagAutomationService } from "./tag-automation.service";

@ApiTags("Tag Automation")
@Controller("tags/automation")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TagAutomationController {
  constructor(
    private readonly tagAutomationService: TagAutomationService,
    private readonly executionService: TagAutomationExecutionService,
  ) {}

  @Get("rules")
  @ApiOperation({ summary: "自動化ルール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "ルール一覧を返却" })
  @ApiQuery({
    name: "active",
    required: false,
    description: "アクティブなルールのみ取得",
    type: Boolean,
  })
  @ApiQuery({
    name: "scope",
    required: false,
    description: "スコープでフィルタ",
    type: String,
  })
  @ApiQuery({
    name: "triggerType",
    required: false,
    description: "トリガータイプでフィルタ",
    type: String,
  })
  @ApiQuery({
    name: "eventType",
    required: false,
    description: "イベントタイプでフィルタ",
    type: String,
  })
  async findRules(
    @Query("active") active?: string,
    @Query("scope") scope?: string,
    @Query("triggerType") triggerType?: string,
    @Query("eventType") eventType?: string,
  ) {
    const activeFlag = active === "true" ? true : active === "false" ? false : undefined;

    return this.tagAutomationService.findRules({
      isActive: activeFlag,
      scope: scope || undefined,
      triggerTypes: triggerType ? [triggerType as TagAutomationTriggerType] : undefined,
      eventTypes: eventType ? [eventType as TagAutomationEventType] : undefined,
    });
  }

  @Get("rules/:id")
  @ApiOperation({ summary: "自動化ルール詳細の取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "ルール詳細を返却" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "ルールが見つかりません" })
  @ApiParam({ name: "id", description: "ルールID" })
  @ApiQuery({
    name: "includeRuns",
    required: false,
    description: "実行履歴を含める",
    type: Boolean,
  })
  @ApiQuery({
    name: "includeHistoryCount",
    required: false,
    description: "付与履歴件数を含める",
    type: Boolean,
  })
  async findRuleById(
    @Param("id") id: string,
    @Query("includeRuns") includeRuns?: string,
    @Query("includeHistoryCount") includeHistoryCount?: string,
  ) {
    const includeRunsFlag = includeRuns === "true";
    const includeHistoryCountFlag = includeHistoryCount === "true";

    return this.tagAutomationService.findRuleById(id, {
      includeRuns: includeRunsFlag,
      includeHistoryCount: includeHistoryCountFlag,
    });
  }

  @Post("rules")
  @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @ApiOperation({ summary: "自動化ルールの作成" })
  @ApiResponse({ status: HttpStatus.CREATED, description: "ルールを作成しました" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "入力エラー" })
  async createRule(@Body() dto: CreateTagAutomationRuleDto) {
    return this.tagAutomationService.createRule(dto);
  }

  @Patch("rules/:id")
  @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @ApiOperation({ summary: "自動化ルールの更新" })
  @ApiResponse({ status: HttpStatus.OK, description: "ルールを更新しました" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "ルールが見つかりません" })
  @ApiParam({ name: "id", description: "ルールID" })
  async updateRule(@Param("id") id: string, @Body() dto: UpdateTagAutomationRuleDto) {
    return this.tagAutomationService.updateRule(id, dto);
  }

  @Delete("rules/:id")
  @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "自動化ルールの削除" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "ルールを削除しました" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "ルールが見つかりません" })
  @ApiParam({ name: "id", description: "ルールID" })
  async deleteRule(@Param("id") id: string) {
    await this.tagAutomationService.deleteRule(id);
  }

  @Get("runs")
  @ApiOperation({ summary: "ルール実行履歴の取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "実行履歴一覧を返却" })
  @ApiQuery({
    name: "ruleId",
    required: false,
    description: "ルールIDでフィルタ",
    type: String,
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "ステータスでフィルタ (PENDING, COMPLETED, FAILED)",
    type: String,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "取得件数の上限",
    type: Number,
  })
  async findRuns(
    @Query("ruleId") ruleId?: string,
    @Query("status") status?: string,
    @Query("limit") limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const statuses = status ? [status as TagAutomationRunStatus] : undefined;

    return this.tagAutomationService.findRuns({
      ruleId: ruleId || undefined,
      statuses,
      take: limitNum,
    });
  }

    @Post("rules/:id/execute")
    @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "ルールを手動実行（実データの対象猫に即時適用）" })
  @ApiParam({ name: "id", description: "ルールID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "ルール実行結果",
  })
  async executeRule(@Param("id") id: string, @Body() testPayload?: Record<string, unknown>) {
    // 対象猫の解決と適用は実行サービス側で行う（Controller -> Service の層構造を維持）
    return this.executionService.executeRuleManually(id, testPayload);
  }
}
