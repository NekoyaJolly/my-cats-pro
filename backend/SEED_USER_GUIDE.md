# シードユーザーでのログイン確認ガイド

## 概要

本プロジェクトは、開発・検証環境で即座にログインテストを行えるよう、シードスクリプトでデフォルトのAdminユーザーを作成します。

## デフォルトシードユーザー情報

### Adminユーザー（デフォルト）

- **Email**: `admin@example.com`
- **Password**: `Passw0rd!`
- **Role**: `ADMIN`
- **説明**: システム全体の管理権限を持つユーザー

## シードユーザーの作成方法

### 1. データベースの初期化とシード実行

```bash
cd backend

# 環境変数を設定（オプション - デフォルト値を使う場合は不要）
# export ADMIN_EMAIL="admin@example.com"
# export ADMIN_PASSWORD="Passw0rd!"

# マイグレーションとシードを実行
pnpm prisma:deploy
pnpm seed
```

### 2. シード結果の確認

シードスクリプトは実行後に以下のような出力を表示します:

```
Seeding database...
➡️ Syncing breed master data...
✅ Synced 100 breed records
➡️ Syncing coat color master data...
✅ Synced 50 coat color records
➡️ Syncing gender master data...
✅ Synced 3 gender records
Seed complete ✅
Admin: { email: 'admin@example.com', password: 'Passw0rd!', id: '...', action: 'created' }
...
```

## ログイン確認手順

### 方法1: E2Eテストで確認

```bash
cd backend
pnpm test:e2e
```

特に `auth-seed-user.e2e-spec.ts` テストが、シードユーザーでのログインを確認します。

### 方法2: 手動APIリクエストで確認

#### cURLを使用:

```bash
# ログインリクエスト（CSRFトークン不要）
curl -X POST http://localhost:3004/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Passw0rd!"
  }'
```

成功レスポンス例:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "...",
      "email": "admin@example.com",
      "role": "ADMIN",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

#### 保護されたエンドポイントへのアクセス:

```bash
# 上記で取得したaccess_tokenを使用
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3004/api/v1/cats \
  -H "Authorization: Bearer $TOKEN"
```

### 方法3: フロントエンドから確認

1. フロントエンドアプリケーションを起動:
   ```bash
   cd frontend
   pnpm dev
   ```

2. ブラウザで http://localhost:3000 にアクセス

3. ログイン画面で以下の情報を入力:
   - Email: `admin@example.com`
   - Password: `Passw0rd!`

4. ログイン成功後、ダッシュボードにアクセスできることを確認

## カスタムシードユーザーの作成

環境変数を使用してデフォルト値を上書きできます:

```bash
# .env ファイルに追加、または環境変数として設定
ADMIN_EMAIL=custom@example.com
ADMIN_PASSWORD=CustomPass123!
ADMIN_FORCE_UPDATE=1  # 既存ユーザーのパスワードも強制更新

# シード実行
pnpm seed
```

## 注意事項

### セキュリティ

- **本番環境では必ずデフォルトパスワードを変更してください**
- シードユーザーは開発・テスト環境専用です
- 本番デプロイ前に強固なパスワードに変更し、環境変数で管理してください

### CSRF撤去について

**重要**: 本プロジェクトではCSRF保護を完全に撤去しました。

- `/api/v1/auth/login` や `/api/v1/auth/register` などの認証エンドポイントは、CSRFトークンなしでアクセス可能です
- JWT認証ベースのため、CSRFトークンの取得は不要です
- すべてのAPIリクエストは `Authorization: Bearer <token>` ヘッダーで認証します

### トラブルシューティング

#### ログインが403エラーになる

- ✅ **解決済**: CSRF関連の403エラーは撤去により解消されました
- データベースが正しく初期化されていない可能性があります。以下を実行:
  ```bash
  cd backend
  pnpm prisma:deploy
  pnpm seed
  ```

#### ログインが401エラーになる

- メールアドレスまたはパスワードが間違っている可能性があります
- シードが正しく実行されたか確認してください
- 環境変数 `ADMIN_EMAIL` / `ADMIN_PASSWORD` の値を確認してください

#### JWTトークンが無効

- トークンの有効期限が切れている可能性があります（デフォルト15分）
- `/api/v1/auth/refresh` エンドポイントで新しいトークンを取得してください

## 関連ファイル

- シードスクリプト: `backend/src/prisma/seed.ts`
- シードユーザーログインテスト: `backend/test/auth-seed-user.e2e-spec.ts`
- 認証サービス: `backend/src/auth/auth.service.ts`
- 認証コントローラー: `backend/src/auth/auth.controller.ts`
