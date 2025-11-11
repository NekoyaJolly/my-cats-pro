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
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { TagAutomationEventType, TagAutomationTriggerType } from "@prisma/client";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CreateTagAutomationRuleDto, UpdateTagAutomationRuleDto } from "./dto";
import { TAG_AUTOMATION_EVENTS } from "./events/tag-automation.events";
import { TagAutomationService } from "./tag-automation.service";

@ApiTags("Tag Automation")
@Controller("tags/automation")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagAutomationController {
  constructor(
    private readonly tagAutomationService: TagAutomationService,
    private readonly eventEmitter: EventEmitter2,
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
  @ApiOperation({ summary: "自動化ルールの作成" })
  @ApiResponse({ status: HttpStatus.CREATED, description: "ルールを作成しました" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "入力エラー" })
  async createRule(@Body() dto: CreateTagAutomationRuleDto) {
    return this.tagAutomationService.createRule(dto);
  }

  @Patch("rules/:id")
  @ApiOperation({ summary: "自動化ルールの更新" })
  @ApiResponse({ status: HttpStatus.OK, description: "ルールを更新しました" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "ルールが見つかりません" })
  @ApiParam({ name: "id", description: "ルールID" })
  async updateRule(@Param("id") id: string, @Body() dto: UpdateTagAutomationRuleDto) {
    return this.tagAutomationService.updateRule(id, dto);
  }

  @Delete("rules/:id")
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
    // 実行履歴取得のロジックは後で実装
    // とりあえず基本的な構造を返す
    return {
      runs: [],
      message: "実行履歴取得機能は開発中です",
    };
  }

    @Post("rules/:id/execute")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "ルールを手動実行（テスト用）" })
  @ApiParam({ name: "id", description: "ルールID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "ルール実行成功",
  })
  async executeRule(@Param("id") id: string, @Body() testPayload?: Record<string, unknown>) {
    // ルールを取得
    const ruleResponse = await this.tagAutomationService.findRuleById(id);
    const rule = ruleResponse.data;

    // テストイベントを発行
    let eventName: string;
    let eventPayload: Record<string, unknown>;

    switch (rule.eventType) {
      case "BREEDING_PLANNED":
        eventName = TAG_AUTOMATION_EVENTS.BREEDING_PLANNED;
        eventPayload = {
          eventType: "BREEDING_PLANNED" as const,
          breedingId: testPayload?.breedingId || "test-breeding-id",
          maleId: testPayload?.maleId || "test-male-id",
          femaleId: testPayload?.femaleId || "test-female-id",
        };
        break;

      case "BREEDING_CONFIRMED":
        eventName = TAG_AUTOMATION_EVENTS.BREEDING_CONFIRMED;
        eventPayload = {
          eventType: "BREEDING_CONFIRMED" as const,
          breedingId: testPayload?.breedingId || "test-breeding-id",
          maleId: testPayload?.maleId || "test-male-id",
          femaleId: testPayload?.femaleId || "test-female-id",
        };
        break;

      case "PREGNANCY_CONFIRMED":
        eventName = TAG_AUTOMATION_EVENTS.PREGNANCY_CONFIRMED;
        eventPayload = {
          eventType: "PREGNANCY_CONFIRMED" as const,
          pregnancyCheckId: testPayload?.pregnancyCheckId || "test-pregnancy-id",
          femaleId: testPayload?.femaleId || "test-female-id",
          maleId: testPayload?.maleId as string | undefined,
        };
        break;

      case "KITTEN_REGISTERED":
        eventName = TAG_AUTOMATION_EVENTS.KITTEN_REGISTERED;
        eventPayload = {
          eventType: "KITTEN_REGISTERED" as const,
          kittenId: testPayload?.kittenId || "test-kitten-id",
          motherId: testPayload?.motherId as string | undefined,
          fatherId: testPayload?.fatherId as string | undefined,
        };
        break;

      case "AGE_THRESHOLD":
        eventName = TAG_AUTOMATION_EVENTS.AGE_THRESHOLD;
        eventPayload = {
          eventType: "AGE_THRESHOLD" as const,
          catId: testPayload?.catId || "test-cat-id",
          ageInMonths: testPayload?.ageInMonths || 12,
        };
        break;

      case "PAGE_ACTION":
        eventName = TAG_AUTOMATION_EVENTS.PAGE_ACTION;
        eventPayload = {
          eventType: "PAGE_ACTION" as const,
          page: testPayload?.page || (typeof rule.config === 'object' && rule.config !== null && 'page' in rule.config ? rule.config['page'] as string : "cats"),
          action: testPayload?.action || (typeof rule.config === 'object' && rule.config !== null && 'action' in rule.config ? rule.config['action'] as string : "create"),
          targetId: testPayload?.targetId || "test-target-id",
          targetType: testPayload?.targetType as string | undefined,
          additionalData: testPayload?.additionalData as Record<string, unknown> | undefined,
        };
        break;

      case "CUSTOM":
        eventName = TAG_AUTOMATION_EVENTS.CUSTOM;
        eventPayload = {
          eventType: "CUSTOM" as const,
          customEventType: testPayload?.customEventType || "test",
          targetId: testPayload?.targetId || "test-target-id",
          metadata: testPayload?.metadata as Record<string, unknown> | undefined,
        };
        break;

      default:
        return {
          success: false,
          message: `Unsupported event type: ${rule.eventType}`,
        };
    }

    // イベント発行
    this.eventEmitter.emit(eventName, eventPayload);

    return {
      success: true,
      message: `Test event emitted for rule: ${rule.name}`,
      eventType: rule.eventType,
      eventName,
      payload: eventPayload,
    };
  }
}
