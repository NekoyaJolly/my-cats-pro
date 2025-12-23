# 独自ドメイン + メール送信機能 セットアップ手順

## 📋 概要

このドキュメントは、GCP上で稼働するmycats-proプロジェクトに以下を設定する完全ガイドです：

1. **独自ドメイン設定** (`nekoya.co.jp`)
2. **SSL証明書** (Google Managed)
3. **メール送信機能** (Resend)

## 🎯 目標アーキテクチャ

```
[お名前.com DNS]
    ↓
[Google Load Balancer + SSL]
    ↓
┌──────────────────────────────────────┐
│  https://nekoya.co.jp                │ → Cloud Run (Frontend)
│  https://api.nekoya.co.jp/api/v1     │ → Cloud Run (Backend)
└──────────────────────────────────────┘
    ↓
[Resend API] → メール送信
```

---

## ⚙️ 事前準備

### 1. 必要なアカウント・リソース

- ✅ お名前.comアカウント (ドメイン `nekoya.co.jp` 取得済み)
- ✅ GCPプロジェクト `my-cats-pro` (Cloud Run稼働中)
- ✅ Resendアカウント (https://resend.com)

### 2. 必要なツール

```bash
# gcloud CLI
gcloud version

# 現在のプロジェクト確認
gcloud config get-value project  # → my-cats-pro
```

---

## 🚀 セットアップ手順

### パターンA: 自動セットアップ (推奨)

すべての手順を自動化したスクリプトを使用します。

```bash
# スクリプトに実行権限を付与
chmod +x scripts/setup-custom-domain.sh
chmod +x scripts/setup-domain-and-email.sh

# セットアップ実行
./scripts/setup-domain-and-email.sh
```

スクリプトが以下を実行します：
1. 静的IPアドレスの予約
2. Serverless NEGの作成
3. Load Balancerの設定
4. SSL証明書の作成
5. Resend APIキーの登録
6. Cloud Runサービスの環境変数更新

---

### パターンB: 手動セットアップ

#### ステップ1: GCP Load Balancerの設定

詳細は [docs/deployment/CUSTOM_DOMAIN_SETUP.md](docs/deployment/CUSTOM_DOMAIN_SETUP.md) を参照してください。

**概要**:
1. 静的IPアドレスを予約
2. Serverless NEG (Network Endpoint Group) を作成
3. バックエンドサービスを作成
4. URLマップを作成
5. SSL証明書を作成
6. HTTPSプロキシを作成
7. 転送ルールを作成
8. HTTP→HTTPSリダイレクトを設定

#### ステップ2: お名前.comでDNS設定

1. お名前.com管理画面にログイン
2. `nekoya.co.jp` のDNS設定画面へ移動
3. 以下のAレコードを追加:

| ホスト名 | TYPE | TTL | VALUE |
|---------|------|-----|-------|
| (空欄) | A | 3600 | `<ステップ1で取得したIP>` |
| www | A | 3600 | `<ステップ1で取得したIP>` |
| api | A | 3600 | `<ステップ1で取得したIP>` |

#### ステップ3: Resendの設定

詳細は [docs/EMAIL_INTEGRATION_GUIDE.md](docs/EMAIL_INTEGRATION_GUIDE.md) を参照してください。

**概要**:
1. Resendアカウント作成
2. ドメイン `nekoya.co.jp` を追加
3. 表示されるDNSレコード (TXT, MX) をお名前.comに追加
4. ドメイン検証完了を待つ
5. APIキーを作成
6. Secret Managerに登録

```bash
# APIキーをSecret Managerに登録
echo -n "re_your_actual_api_key" | \
  gcloud secrets versions add RESEND_API_KEY_production \
    --data-file=- \
    --project=my-cats-pro

# 権限付与
gcloud secrets add-iam-policy-binding RESEND_API_KEY_production \
  --member="serviceAccount:cloud-run-backend@my-cats-pro.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=my-cats-pro
```

#### ステップ4: Cloud Runサービスの更新

```bash
# バックエンドサービスを更新
gcloud run services update mycats-pro-backend \
  --region=asia-northeast1 \
  --update-secrets=RESEND_API_KEY=RESEND_API_KEY_production:latest \
  --set-env-vars="EMAIL_FROM=noreply@nekoya.co.jp,EMAIL_FROM_NAME=MyCats Pro,CORS_ORIGIN=https://nekoya.co.jp,https://www.nekoya.co.jp" \
  --project=my-cats-pro
```

---

## ✅ 動作確認

### 1. DNS解決の確認

```bash
nslookup nekoya.co.jp
nslookup api.nekoya.co.jp
```

### 2. SSL証明書の状態確認

```bash
gcloud compute ssl-certificates describe mycats-ssl-cert --global

# 状態が ACTIVE になるまで待機 (15分〜24時間)
watch -n 60 'gcloud compute ssl-certificates describe mycats-ssl-cert --global --format="get(managed.status)"'
```

### 3. HTTPSアクセス確認

```bash
# フロントエンド
curl -I https://nekoya.co.jp

# バックエンドAPI
curl https://api.nekoya.co.jp/api/v1/health
```

### 4. メール送信テスト

バックエンドにテスト用エンドポイントを追加して確認:

```bash
curl -X POST https://api.nekoya.co.jp/api/v1/test/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"to":"your-email@example.com","subject":"テスト","message":"メール送信テストです"}'
```

または、ログで確認:

```bash
gcloud run services logs read mycats-pro-backend \
  --region=asia-northeast1 \
  --limit=50 | grep -i email
```

---

## 📊 設定一覧

### GCPリソース

| リソース | 名前 | 用途 |
|---------|------|------|
| 静的IP | `mycats-pro-lb-ip` | Load Balancer用グローバルIP |
| SSL証明書 | `mycats-ssl-cert` | nekoya.co.jp, www, api用 |
| Serverless NEG | `mycats-frontend-neg` | フロントエンドへのルーティング |
| Serverless NEG | `mycats-backend-neg` | バックエンドへのルーティング |
| Backend Service | `mycats-frontend-backend` | フロントエンド |
| Backend Service | `mycats-backend-backend` | バックエンドAPI |
| URL Map | `mycats-lb-urlmap` | トラフィックルーティング |
| HTTPS Proxy | `mycats-https-proxy` | HTTPS終端 |
| HTTP Proxy | `mycats-http-proxy` | HTTPリダイレクト |

### Secret Manager

| シークレット名 | 用途 |
|---------------|------|
| `RESEND_API_KEY_production` | Resend API認証 |
| `DATABASE_URL_production` | PostgreSQL接続文字列 |
| `JWT_SECRET_production` | JWTアクセストークン署名 |
| `JWT_REFRESH_SECRET_production` | JWTリフレッシュトークン署名 |
| `CSRF_TOKEN_SECRET_production` | CSRF保護 |

### 環境変数 (Cloud Run Backend)

| 変数名 | 値 |
|-------|-----|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://nekoya.co.jp,https://www.nekoya.co.jp` |
| `EMAIL_FROM` | `noreply@nekoya.co.jp` |
| `EMAIL_FROM_NAME` | `MyCats Pro` |

---

## 🔧 次回デプロイ時の設定

GitHub ActionsまたはCloud Buildでデプロイする際は、以下の置換変数を使用してください:

```yaml
_RESEND_API_KEY_SECRET_NAME: RESEND_API_KEY
_RESEND_API_KEY_SECRET_VERSION: latest
_EMAIL_FROM: noreply@nekoya.co.jp
_EMAIL_FROM_NAME: MyCats Pro
_CORS_ORIGIN: https://nekoya.co.jp,https://www.nekoya.co.jp
_NEXT_PUBLIC_API_URL: https://api.nekoya.co.jp/api/v1
```

---

## 🐛 トラブルシューティング

### SSL証明書が `PROVISIONING` のまま

**原因**: DNS設定が反映されていない

**解決**:
```bash
# DNS伝播を確認
dig nekoya.co.jp +short
dig api.nekoya.co.jp +short

# お名前.comの設定を再確認
```

### 502 Bad Gateway エラー

**原因**: Cloud Runサービスが応答していない

**解決**:
```bash
# サービスの状態確認
gcloud run services describe mycats-pro-backend --region=asia-northeast1

# ログ確認
gcloud run services logs read mycats-pro-backend --region=asia-northeast1 --limit=100
```

### メールが送信されない

**原因1**: RESEND_API_KEYが設定されていない

```bash
# 環境変数を確認
gcloud run services describe mycats-pro-backend \
  --region=asia-northeast1 \
  --format="get(spec.template.spec.containers[0].env)"
```

**原因2**: Resendドメイン検証が未完了

- Resendダッシュボードで「Domain Status」を確認
- お名前.comでTXT/MXレコードが正しく設定されているか確認

---

## 📚 関連ドキュメント

- [カスタムドメイン設定ガイド](docs/deployment/CUSTOM_DOMAIN_SETUP.md)
- [メール送信機能実装ガイド](docs/EMAIL_INTEGRATION_GUIDE.md)
- [GCPデプロイメントガイド](docs/deployment/GCP_DEPLOYMENT_GUIDE.md)
- [CI/CDデプロイメントフロー](docs/CICD_DEPLOYMENT_FLOW.md)

---

## 📝 まとめ

完了後、以下のURLでサービスにアクセスできます:

- **フロントエンド**: https://nekoya.co.jp
- **バックエンドAPI**: https://api.nekoya.co.jp/api/v1
- **ヘルスチェック**: https://api.nekoya.co.jp/api/v1/health

メール送信機能は以下で利用可能:
- パスワードリセット
- ウェルカムメール
- 猫登録確認メール
- カスタム通知

すべての設定が完了すると、プロフェッショナルなカスタムドメインとメール送信機能を備えた本番環境が整います。
