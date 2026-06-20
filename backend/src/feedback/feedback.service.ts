import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { RequestUser } from '../auth/auth.types';
import { EmailService } from '../email/email.service';

import { CreateFeedbackDto } from './dto/create-feedback.dto';

/**
 * フィードバックを管理者へ届けるサービス。
 * 既存のメール基盤（EmailService / Resend）を再利用し、ADMIN_EMAIL 宛にメール送信する。
 * DB には保存しない（メール送信のみ）。
 */
@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async submit(dto: CreateFeedbackDto, user?: RequestUser): Promise<{ sent: boolean }> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.error('ADMIN_EMAIL が未設定のため、フィードバックメールを送信できません。');
      return { sent: false };
    }

    const senderLabel = user?.email ?? '不明なユーザー';
    const result = await this.emailService.sendEmail({
      to: adminEmail,
      replyTo: user?.email,
      subject: '[MyCats Pro] フィードバックが届きました',
      html: `
        <p>アプリ利用者からフィードバックが届きました。</p>
        <p><strong>送信者:</strong> ${this.escapeHtml(senderLabel)}</p>
        <hr />
        <p style="white-space: pre-wrap;">${this.escapeHtml(dto.message)}</p>
      `,
      text: `フィードバック (送信者: ${senderLabel})\n\n${dto.message}`,
    });

    if (!result.success) {
      this.logger.warn(
        'フィードバックメールの送信に失敗しました（RESEND_API_KEY / EMAIL_FROM などの設定を確認してください）。',
      );
    }

    return { sent: result.success };
  }

  /** メール本文に埋め込む前にユーザー入力をエスケープする */
  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
