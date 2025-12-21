# メール送信機能実装ガイド (Resend)

このドキュメントは、NestJSバックエンドにResendを使用したメール送信機能を実装する手順を説明します。

## なぜResendを選んだか?

| サービス | メリット | デメリット |
|---------|---------|----------|
| **Resend** ✅ | ・日本語メール対応<br>・無料枠: 100通/日<br>・シンプルなAPI<br>・React Email対応 | - |
| SendGrid | ・信頼性が高い<br>・無料枠: 100通/日 | ・設定が複雑<br>・日本語ドキュメントが少ない |
| Google Workspace | ・ドメインメール使用可 | ・月額課金必須<br>・API設定が複雑 |

**結論**: Resend が最適 (シンプル・低コスト・日本語対応)

---

## アーキテクチャ

```
[NestJS Backend] → [Resend API] → [受信者]
     ↓
[EmailModule]
  ├── EmailService (ビジネスロジック)
  └── ResendClient (API呼び出し)
```

---

## ステップ1: Resendアカウント作成

### 1-1. Resendにサインアップ

https://resend.com/signup にアクセスし、アカウントを作成

### 1-2. ドメインを追加

1. ダッシュボードで「Domains」→「Add Domain」をクリック
2. `nekoya.co.jp` を入力
3. 表示されるDNSレコードをメモ

**例**:
```
Type: TXT
Name: _resend
Value: resend-domain-verify=abc123xyz
TTL: 3600

Type: MX
Name: @
Value: mx1.resend.com
Priority: 10
TTL: 3600
```

### 1-3. お名前.comでDNS設定

お名前.comの管理画面で以下を追加:

| ホスト名 | TYPE | 値 | 優先度 | TTL |
|---------|------|-----|-------|-----|
| _resend | TXT | `resend-domain-verify=abc123xyz` | - | 3600 |
| @ | MX | `mx1.resend.com` | 10 | 3600 |

### 1-4. ドメイン検証

Resendダッシュボードで「Verify Domain」をクリックし、検証完了を待つ (通常5〜15分)

### 1-5. APIキーを取得

1. 「API Keys」→「Create API Key」をクリック
2. 名前: `MyCats Pro Backend`
3. Permission: `Sending access`
4. APIキーをコピー (例: `re_123456789abcdefg`)

---

## ステップ2: バックエンドへの実装

### 2-1. パッケージのインストール

```bash
cd backend
pnpm add resend
```

### 2-2. 環境変数の追加

`.env` と `.env.production` に以下を追加:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@nekoya.co.jp
EMAIL_FROM_NAME=MyCats Pro
```

### 2-3. 環境変数バリデーションの更新

`backend/src/common/config/env.validation.ts` に追加:

```typescript
// Resend Email
RESEND_API_KEY: z.string().min(1).optional(),
EMAIL_FROM: z.string().email().optional(),
EMAIL_FROM_NAME: z.string().min(1).optional(),
```

### 2-4. EmailModuleの作成

```bash
cd backend
npx nest generate module email
npx nest generate service email
```

### 2-5. EmailServiceの実装

`backend/src/email/email.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
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
    if (!this.isEnabled) {
      this.logger.warn('Email sending is disabled. Skipping.');
      return { success: false };
    }

    try {
      const response = await this.resend.emails.send({
        from: `${this.fromName} <${this.from}>`,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
        reply_to: dto.replyTo,
      });

      if (response.error) {
        this.logger.error(`Failed to send email: ${response.error.message}`);
        return { success: false };
      }

      this.logger.log(`Email sent successfully: ${response.data?.id}`);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
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
}
```

### 2-6. EmailModuleのエクスポート設定

`backend/src/email/email.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService], // 他のモジュールで使用可能にする
})
export class EmailModule {}
```

### 2-7. AppModuleへの登録

`backend/src/app.module.ts`:

```typescript
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // ... 既存のimports
    EmailModule,
  ],
  // ...
})
export class AppModule {}
```

---

## ステップ3: Secret Managerへの登録

### 3-1. Resend APIキーをSecret Managerに保存

```bash
# シークレットを作成
gcloud secrets create RESEND_API_KEY_production \
  --replication-policy="automatic" \
  --project=my-cats-pro

# 値を設定
echo -n "re_your_actual_api_key_here" | \
  gcloud secrets versions add RESEND_API_KEY_production \
    --data-file=- \
    --project=my-cats-pro

# 他の環境変数も登録
echo -n "noreply@nekoya.co.jp" | \
  gcloud secrets versions add EMAIL_FROM_production \
    --data-file=- \
    --project=my-cats-pro

echo -n "MyCats Pro" | \
  gcloud secrets versions add EMAIL_FROM_NAME_production \
    --data-file=- \
    --project=my-cats-pro
```

### 3-2. Cloud Runサービスアカウントに権限付与

```bash
gcloud secrets add-iam-policy-binding RESEND_API_KEY_production \
  --member="serviceAccount:cloud-run-backend@my-cats-pro.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=my-cats-pro

gcloud secrets add-iam-policy-binding EMAIL_FROM_production \
  --member="serviceAccount:cloud-run-backend@my-cats-pro.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=my-cats-pro

gcloud secrets add-iam-policy-binding EMAIL_FROM_NAME_production \
  --member="serviceAccount:cloud-run-backend@my-cats-pro.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=my-cats-pro
```

---

## ステップ4: cloudbuild.yamlの更新

`cloudbuild.yaml` のバックエンドデプロイステップに環境変数を追加:

```yaml
--set-secrets "DATABASE_URL=...,RESEND_API_KEY=${_RESEND_API_KEY_SECRET_NAME}:${_RESEND_API_KEY_SECRET_VERSION}" \
--set-env-vars "NODE_ENV=${_ENVIRONMENT},EMAIL_FROM=${_EMAIL_FROM},EMAIL_FROM_NAME=${_EMAIL_FROM_NAME}"
```

置換変数を追加:

```yaml
substitutions:
  _RESEND_API_KEY_SECRET_NAME: RESEND_API_KEY_${_ENVIRONMENT}
  _RESEND_API_KEY_SECRET_VERSION: latest
  _EMAIL_FROM: noreply@nekoya.co.jp
  _EMAIL_FROM_NAME: MyCats Pro
```

---

## ステップ5: 使用例

### AuthServiceでパスワードリセットメールを送信

`backend/src/auth/auth.service.ts`:

```typescript
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    // ... 既存の依存性
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    // ユーザーを検索
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // セキュリティ上、ユーザーが存在しない場合も成功レスポンスを返す
      return;
    }

    // リセットトークンを生成
    const resetToken = this.generateResetToken();
    
    // DBにトークンを保存 (1時間有効)
    await this.userRepository.savePasswordResetToken(user.id, resetToken, new Date(Date.now() + 3600000));

    // メール送信
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }
}
```

---

## ステップ6: テスト

### ローカルでのテスト

```bash
# .env に Resend APIキーを設定
echo "RESEND_API_KEY=re_your_test_api_key" >> backend/.env

# バックエンドを起動
pnpm dev

# メール送信APIを呼び出し
curl -X POST http://localhost:3004/api/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### 本番環境でのテスト

```bash
# Cloud Runにデプロイ後
curl -X POST https://api.nekoya.co.jp/api/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# ログ確認
gcloud run services logs read mycats-pro-backend --region=asia-northeast1 --limit=50
```

---

## トラブルシューティング

### メールが届かない

**原因1**: SPF/DKIM/DMARC設定が不足
- Resendダッシュボードで「Domain Status」を確認
- お名前.comで追加のTXTレコードを設定

**原因2**: APIキーが無効
```bash
# APIキーを再発行し、Secret Managerを更新
echo -n "re_new_api_key" | gcloud secrets versions add RESEND_API_KEY_production --data-file=-
```

### エラー: `RESEND_API_KEY not set`

**解決**:
```bash
# Cloud Runの環境変数を確認
gcloud run services describe mycats-pro-backend --region=asia-northeast1 --format="get(spec.template.spec.containers[0].env)"
```

---

## 参考資料

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resend/resend-node)
- [React Email](https://react.email/) (HTMLメールテンプレート作成)

---

## まとめ

実装完了後、以下の機能が利用可能になります:

- ✅ パスワードリセットメール送信
- ✅ ウェルカムメール送信
- ✅ カスタムメールテンプレート
- ✅ 日本語メール対応
- ✅ 低コスト運用 (無料枠: 100通/日)
