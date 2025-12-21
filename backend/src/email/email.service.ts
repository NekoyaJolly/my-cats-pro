import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * メール送信DTO
 */
export interface SendEmailDto {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

/**
 * メール送信サービス
 * Resend APIを使用してメールを送信
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  private readonly from: string;
  private readonly fromName: string;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from = this.configService.get<string>('EMAIL_FROM', 'noreply@nekoya.co.jp');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'MyCats Pro');

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.isEnabled = true;
      this.logger.log(`EmailService initialized with from: ${this.fromName} <${this.from}>`);
    } else {
      this.isEnabled = false;
      this.logger.warn('RESEND_API_KEY not set. Email sending is disabled.');
    }
  }

  /**
   * メールを送信
   */
  async sendEmail(dto: SendEmailDto): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isEnabled || !this.resend) {
      this.logger.warn('Email sending is disabled. Skipping.');
      return { success: false };
    }

    try {
      const emailOptions = {
        from: `${this.fromName} <${this.from}>`,
        to: dto.to,
        subject: dto.subject,
        ...(dto.html && { html: dto.html }),
        ...(dto.text && { text: dto.text }),
        ...(dto.replyTo && { replyTo: dto.replyTo }),
      } as Parameters<Resend['emails']['send']>[0];

      const response = await this.resend.emails.send(emailOptions);

      if (response.error) {
        this.logger.error(`Failed to send email: ${response.error.message}`);
        return { success: false };
      }

      this.logger.log(`Email sent successfully: ${response.data?.id}`);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending email: ${errorMessage}`);
      return { success: false };
    }
  }

  /**
   * パスワードリセットメールを送信
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `https://nekoya.co.jp/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>パスワードリセット</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>パスワードリセットのリクエスト</h2>
          <p>パスワードリセットのリクエストを受け付けました。</p>
          <p>以下のリンクをクリックして、新しいパスワードを設定してください:</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              パスワードをリセット
            </a>
          </p>
          <p>または、以下のURLをブラウザにコピー&ペーストしてください:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          <p><strong>このリンクは1時間後に無効になります。</strong></p>
          <p>このメールに心当たりがない場合は、無視してください。</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            このメールは MyCats Pro から自動送信されています。<br>
            返信はできませんのでご了承ください。
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
パスワードリセットのリクエスト

パスワードリセットのリクエストを受け付けました。
以下のURLにアクセスして、新しいパスワードを設定してください:

${resetUrl}

このリンクは1時間後に無効になります。

このメールに心当たりがない場合は、無視してください。
    `;

    const result = await this.sendEmail({
      to: email,
      subject: 'パスワードリセットのご案内',
      html,
      text,
    });

    return result.success;
  }

  /**
   * ウェルカムメールを送信
   */
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ようこそ MyCats Pro へ</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>ようこそ、${username} さん!</h2>
          <p>MyCats Pro へのご登録ありがとうございます。</p>
          <p>さっそく、あなたの猫ちゃんたちを登録してみましょう。</p>
          <p>
            <a href="https://nekoya.co.jp/cats/new" style="display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              猫を登録する
            </a>
          </p>
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            MyCats Pro - 猫生体管理システム<br>
            https://nekoya.co.jp
          </p>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail({
      to: email,
      subject: 'MyCats Pro へようこそ!',
      html,
    });

    return result.success;
  }

  /**
   * 猫の登録確認メールを送信
   */
  async sendCatRegistrationEmail(email: string, catName: string, registrationNumber: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>猫の登録完了</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>猫の登録が完了しました</h2>
          <p><strong>${catName}</strong> の登録が完了しました。</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>猫の名前:</strong> ${catName}</p>
            <p style="margin: 5px 0;"><strong>登録番号:</strong> ${registrationNumber}</p>
          </div>
          <p>
            <a href="https://nekoya.co.jp/cats/${registrationNumber}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              詳細を見る
            </a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            MyCats Pro - 猫生体管理システム<br>
            https://nekoya.co.jp
          </p>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail({
      to: email,
      subject: `【登録完了】${catName} の登録が完了しました`,
      html,
    });

    return result.success;
  }
}
