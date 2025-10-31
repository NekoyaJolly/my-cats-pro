import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";

import { PrismaService } from "../prisma/prisma.service";

import { TAG_AUTOMATION_EVENTS } from "./events/tag-automation.events";

/**
 * 年齢閾値チェックサービス
 * 
 * 定期的に猫の年齢をチェックし、閾値に達したらイベントを発火
 */
@Injectable()
export class AgeThresholdCheckerService {
  private readonly logger = new Logger(AgeThresholdCheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 毎日午前0時に年齢閾値をチェック
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAgeThresholds() {
    this.logger.log("年齢閾値チェック開始");

    try {
      // アクティブな年齢閾値ルールを取得
      const rules = await this.prisma.tagAutomationRule.findMany({
        where: {
          isActive: true,
          eventType: "AGE_THRESHOLD",
        },
      });

      if (rules.length === 0) {
        this.logger.log("アクティブな年齢閾値ルールがありません");
        return;
      }

      // すべての在舎猫を取得
      const cats = await this.prisma.cat.findMany({
        where: {
          isInHouse: true,
        },
        select: {
          id: true,
          birthDate: true,
          motherId: true,
        },
      });

      this.logger.log(`${cats.length}匹の猫をチェックします`);

      const today = new Date();
      let eventsEmitted = 0;

      for (const cat of cats) {
        const birthDate = new Date(cat.birthDate);
        const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        const ageInMonths = this.calculateAgeInMonths(birthDate, today);

        for (const rule of rules) {
          if (this.shouldTriggerRule(rule, ageInDays, ageInMonths, cat.motherId)) {
            this.logger.log(`猫ID ${cat.id} がルール "${rule.name}" の閾値に到達`);
            
            // イベントを発火
            this.eventEmitter.emit(TAG_AUTOMATION_EVENTS.AGE_THRESHOLD, {
              eventType: "AGE_THRESHOLD" as const,
              catId: cat.id,
              ageInDays,
              ageInMonths,
              ruleId: rule.id,
            });

            eventsEmitted++;
          }
        }
      }

      this.logger.log(`年齢閾値チェック完了: ${eventsEmitted}件のイベント発火`);
    } catch (error) {
      this.logger.error("年齢閾値チェック中にエラーが発生", error);
    }
  }

  /**
   * 年齢を月単位で計算
   */
  private calculateAgeInMonths(birthDate: Date, currentDate: Date): number {
    let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    months += currentDate.getMonth() - birthDate.getMonth();
    
    // 日付を考慮
    if (currentDate.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  }

  /**
   * ルールが発火すべきかを判定
   */
  private shouldTriggerRule(
    rule: any,
    ageInDays: number,
    ageInMonths: number,
    motherId: string | null,
  ): boolean {
    const config = rule.config as Record<string, unknown> | null;
    if (!config) return false;

    // 子猫用の日数チェック（母猫IDがある場合）
    if (motherId && config.kitten) {
      const kittenConfig = config.kitten as Record<string, unknown>;
      const minDays = kittenConfig.minDays as number | undefined;
      const maxDays = kittenConfig.maxDays as number | undefined;

      if (minDays !== undefined && ageInDays < minDays) return false;
      if (maxDays !== undefined && ageInDays >= maxDays) return false;

      return true;
    }

    // 成猫用の月数チェック
    if (config.adult) {
      const adultConfig = config.adult as Record<string, unknown>;
      const minMonths = adultConfig.minMonths as number | undefined;
      const maxMonths = adultConfig.maxMonths as number | undefined;

      if (minMonths !== undefined && ageInMonths < minMonths) return false;
      if (maxMonths !== undefined && ageInMonths >= maxMonths) return false;

      return true;
    }

    return false;
  }

  /**
   * 手動で年齢チェックを実行（テスト用）
   */
  async manualCheck() {
    this.logger.log("手動年齢閾値チェックを実行");
    await this.checkAgeThresholds();
  }
}
