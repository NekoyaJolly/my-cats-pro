import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';

import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

/**
 * フィードバック機能を提供するモジュール。
 * 既存の EmailModule を再利用して管理者宛にメール送信する（DB 保存なし）。
 */
@Module({
  imports: [EmailModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
