import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import type { Prisma } from "@prisma/client";
import {
  TagAssignmentAction,
  TagAssignmentSource,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  TAG_AUTOMATION_EVENTS,
  type TagAutomationEvent,
  type BreedingPlannedEvent,
  type BreedingConfirmedEvent,
  type PregnancyConfirmedEvent,
  type KittenRegisteredEvent,
  type AgeThresholdEvent,
  type PageActionEvent,
  type CustomEvent,
} from "./events/tag-automation.events";
import { TagAutomationService } from "./tag-automation.service";

interface RuleExecutionResult {
  ruleId: string;
  ruleName: string;
  success: boolean;
  tagsAssigned: number;
  error?: string;
}

@Injectable()
export class TagAutomationExecutionService {
  private readonly logger = new Logger(TagAutomationExecutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: TagAutomationService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**
   * イベントに基づいてルールを実行
   */
  async executeRulesForEvent(event: TagAutomationEvent): Promise<RuleExecutionResult[]> {
    this.logger.log(`Executing rules for event: ${event.eventType}`);

    try {
      // アクティブなルールを取得（イベントタイプでフィルタ、優先度順）
      const rulesResponse = await this.automationService.findRules({
        isActive: true,
        eventTypes: [event.eventType],
        includeRuns: false,
      });

      const rules = rulesResponse.data;

      if (rules.length === 0) {
        this.logger.debug(`No active rules found for event type: ${event.eventType}`);
        return [];
      }

      this.logger.log(`Found ${rules.length} active rules for event type: ${event.eventType}`);

      // 優先度順にルールを実行（既にソート済み）
      const results: RuleExecutionResult[] = [];

      for (const rule of rules) {
        try {
          const result = await this.executeRule(rule.id, event);
          results.push(result);
        } catch (error) {
          this.logger.error(
            `Failed to execute rule ${rule.id} (${rule.name}):`,
            error instanceof Error ? error.message : String(error),
          );
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            tagsAssigned: 0,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Error executing rules for event ${event.eventType}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * 個別ルールの実行
   */
  private async executeRule(
    ruleId: string,
    event: TagAutomationEvent,
  ): Promise<RuleExecutionResult> {
    // ルール詳細を取得
    const ruleResponse = await this.automationService.findRuleById(ruleId);
    const rule = ruleResponse.data;

    this.logger.debug(`Executing rule: ${rule.name} (${ruleId})`);

    // 実行記録を作成
    const runResponse = await this.automationService.createRun(
      ruleId,
      event as unknown as Record<string, unknown>,
    );
    const run = runResponse.data;

    try {
      // 対象猫を取得
      const targetCatIds = await this.getTargetCats(rule, event);

      if (targetCatIds.length === 0) {
        this.logger.debug(`No target cats found for rule: ${rule.name}`);
        await this.automationService.markRunCompleted(run.id);
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          success: true,
          tagsAssigned: 0,
        };
      }

      // 付与するタグを取得
      const tagIds = await this.getTagsToAssign(rule);

      if (tagIds.length === 0) {
        this.logger.warn(`No tags configured for rule: ${rule.name}`);
        await this.automationService.markRunCompleted(run.id);
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          success: true,
          tagsAssigned: 0,
        };
      }

      // configからactionTypeを判定（デフォルトはASSIGN）
      const config = rule.config as Record<string, unknown> | null;
      const actionType = (config?.['actionType'] as string) === 'REMOVE' ? 'REMOVE' : 'ASSIGN';

      // タグを付与または削除
      let processedCount = 0;
      for (const catId of targetCatIds) {
        for (const tagId of tagIds) {
          try {
            if (actionType === 'REMOVE') {
              await this.removeTag(catId, tagId, rule.id, run.id);
            } else {
              await this.assignTag(catId, tagId, rule.id, run.id);
            }
            processedCount++;
          } catch (error) {
            this.logger.warn(
              `Failed to ${actionType.toLowerCase()} tag ${tagId} for cat ${catId}:`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      }

      // 実行完了を記録
      await this.automationService.markRunCompleted(run.id);

      this.logger.log(`Rule ${rule.name} executed successfully. ${actionType === 'REMOVE' ? 'Removed' : 'Assigned'} ${processedCount} tags.`);

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        success: true,
        tagsAssigned: processedCount,
      };
    } catch (error) {
      // 実行失敗を記録
      await this.automationService.markRunFailed(
        run.id,
        error instanceof Error ? error.message : String(error),
      );

      throw error;
    }
  }

  /**
   * 対象となる猫のIDを取得
   */
  private async getTargetCats(
    rule: { config?: Prisma.JsonValue },
    event: TagAutomationEvent,
  ): Promise<string[]> {
    const catIds: string[] = [];

    // イベントタイプに応じて対象猫を特定
    switch (event.eventType) {
      case 'BREEDING_PLANNED':
      case 'BREEDING_CONFIRMED':
        catIds.push((event as BreedingPlannedEvent).maleId, (event as BreedingPlannedEvent).femaleId);
        break;

      case 'PREGNANCY_CONFIRMED':
        catIds.push((event as PregnancyConfirmedEvent).femaleId);
        if ((event as PregnancyConfirmedEvent).maleId) {
          catIds.push((event as PregnancyConfirmedEvent).maleId!);
        }
        break;

      case 'KITTEN_REGISTERED':
        catIds.push((event as KittenRegisteredEvent).kittenId);
        if ((event as KittenRegisteredEvent).motherId) {
          catIds.push((event as KittenRegisteredEvent).motherId!);
        }
        if ((event as KittenRegisteredEvent).fatherId) {
          catIds.push((event as KittenRegisteredEvent).fatherId!);
        }
        break;

      case 'AGE_THRESHOLD':
        catIds.push((event as AgeThresholdEvent).catId);
        break;

      case 'PAGE_ACTION': {
        // PAGE_ACTIONイベントの処理
        const pageEvent = event as PageActionEvent;

        // configから対象猫の選択方法を取得
        const config = rule.config as Record<string, unknown> | null;
        const targetSelection = config?.['targetSelection'] as string | undefined;

        if (targetSelection === 'event_target' && pageEvent.targetType === 'cat') {
          // イベントで指定された猫を対象とする
          catIds.push(pageEvent.targetId);
        } else if (targetSelection === 'specific_cats' && config?.['specificCatIds']) {
          // 特定の猫リストを対象とする
          const specificCats = config['specificCatIds'] as string[];
          catIds.push(...specificCats);
        } else if (targetSelection === 'all_cats') {
          // 全猫を対象とする（スコープやフィルタを適用可能）
          const filters = config?.['filters'] as Record<string, unknown> | undefined;
          const allCats = await this.getAllCatsMatchingFilters(filters);
          catIds.push(...allCats.map(cat => cat.id));
        } else {
          // デフォルト: イベントターゲットが猫の場合はそれを使用
          if (pageEvent.targetType === 'cat') {
            catIds.push(pageEvent.targetId);
          }
        }
        break;
      }

      case 'CUSTOM':
        catIds.push((event as CustomEvent).targetId);
        break;
    }

    // configに基づいて対象をフィルタリング（将来的な拡張用）
    if (rule.config && typeof rule.config === 'object') {
      // 例: { "targetRole": "mother_only" } などの条件でフィルタ
      // 今はシンプルにすべての対象を返す
    }

    return [...new Set(catIds)]; // 重複を削除
  }

  /**
   * 付与するタグのIDを取得
   */
  private async getTagsToAssign(rule: {
    config?: Prisma.JsonValue;
  }): Promise<string[]> {
    // configからタグIDを取得
    if (!rule.config || typeof rule.config !== 'object') {
      return [];
    }

    const config = rule.config as { tagIds?: string[] };
    return config.tagIds ?? [];
  }

  /**
   * タグを猫に付与
   */
  private async assignTag(
    catId: string,
    tagId: string,
    ruleId: string,
    automationRunId: string,
  ): Promise<void> {
    // 既に付与されているかチェック
    const existing = await this.prisma.catTag.findUnique({
      where: {
        catId_tagId: {
          catId,
          tagId,
        },
      },
    });

    if (existing) {
      this.logger.debug(`Tag ${tagId} already assigned to cat ${catId}`);
      return;
    }

    // タグを付与
    await this.prisma.catTag.create({
      data: {
        catId,
        tagId,
      },
    });

    // 履歴を記録
    await this.automationService.recordAssignment({
      catId,
      tagId,
      action: TagAssignmentAction.ASSIGNED,
      source: TagAssignmentSource.AUTOMATION,
      ruleId,
      automationRunId,
      applyTagMutation: false, // 既に付与済み
    });

    this.logger.debug(`Assigned tag ${tagId} to cat ${catId} via rule ${ruleId}`);
  }

  /**
   * タグを猫から削除
   */
  private async removeTag(
    catId: string,
    tagId: string,
    ruleId: string,
    automationRunId: string,
  ): Promise<void> {
    // 付与されているかチェック
    const existing = await this.prisma.catTag.findUnique({
      where: {
        catId_tagId: {
          catId,
          tagId,
        },
      },
    });

    if (!existing) {
      this.logger.debug(`Tag ${tagId} not assigned to cat ${catId}, skipping removal`);
      return;
    }

    // タグを削除
    await this.prisma.catTag.delete({
      where: {
        catId_tagId: {
          catId,
          tagId,
        },
      },
    });

    // 履歴を記録
    await this.automationService.recordAssignment({
      catId,
      tagId,
      action: TagAssignmentAction.UNASSIGNED,
      source: TagAssignmentSource.AUTOMATION,
      ruleId,
      automationRunId,
      applyTagMutation: false, // 既に削除済み
    });

    this.logger.debug(`Removed tag ${tagId} from cat ${catId} via rule ${ruleId}`);
  }

  /**
   * フィルタに一致する全猫を取得
   */
  private async getAllCatsMatchingFilters(
    filters?: Record<string, unknown>,
  ): Promise<Array<{ id: string }>> {
    const where: Prisma.CatWhereInput = {};

    if (filters) {
      // フィルタ条件を適用
      if (filters['breedId']) {
        where.breedId = filters['breedId'] as string;
      }
      if (filters['gender']) {
        where.gender = filters['gender'] as string;
      }
      // 他のフィルタ条件も必要に応じて追加
    }

    const cats = await this.prisma.cat.findMany({
      where,
      select: { id: true },
    });

    return cats;
  }

  /**
   * イベントリスナー: 交配予定
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.BREEDING_PLANNED)
  async handleBreedingPlanned(event: BreedingPlannedEvent) {
    this.logger.log(`Handling BREEDING_PLANNED event: ${event.breedingId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 交配確認
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.BREEDING_CONFIRMED)
  async handleBreedingConfirmed(event: BreedingConfirmedEvent) {
    this.logger.log(`Handling BREEDING_CONFIRMED event: ${event.breedingId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 妊娠確認
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.PREGNANCY_CONFIRMED)
  async handlePregnancyConfirmed(event: PregnancyConfirmedEvent) {
    this.logger.log(`Handling PREGNANCY_CONFIRMED event: ${event.pregnancyCheckId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 子猫登録
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.KITTEN_REGISTERED)
  async handleKittenRegistered(event: KittenRegisteredEvent) {
    this.logger.log(`Handling KITTEN_REGISTERED event: ${event.kittenId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 年齢閾値
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.AGE_THRESHOLD)
  async handleAgeThreshold(event: AgeThresholdEvent) {
    this.logger.log(`Handling AGE_THRESHOLD event for cat: ${event.catId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: ページ・アクション
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.PAGE_ACTION)
  async handlePageAction(event: PageActionEvent) {
    this.logger.log(`Handling PAGE_ACTION event: ${event.page}.${event.action}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: カスタム
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.CUSTOM)
  async handleCustomEvent(event: CustomEvent) {
    this.logger.log(`Handling CUSTOM event: ${event.customEventType}`);
    await this.executeRulesForEvent(event);
  }
}
