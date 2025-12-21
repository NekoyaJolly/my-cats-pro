import { Module } from '@nestjs/common';

import { EmailService } from './email.service';

/**
 * メール送信機能を提供するモジュール
 * Resend APIを使用してメール送信を実行
 */
@Module({
  providers: [EmailService],
  exports: [EmailService], // 他のモジュールで使用可能にする
})
export class EmailModule {}
