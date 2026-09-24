# MyCats Pro 復元手順

この文書は、MyCats Pro を日常運用するためではなく、
将来必要になったときに「当時のアプリを再現できる」ことを目的としています。

## 1. 復元元

最終機能コードは次の固定ブランチを使用します。

```bash
git clone https://github.com/NekoyaJolly/my-cats-pro.git
cd my-cats-pro
git checkout archive/mycats-pro-final-2026-09-24
```

基準SHA:

```text
63ed3a6098a504ae4071fdb43305313fe55825ac
```

## 2. 推奨環境

- Node.js 20.x
- pnpm 10.18.1
- PostgreSQL 16 以上
- macOS / Linux / WSL2
- Docker は任意

`pnpm-lock.yaml` を必ず使用し、依存関係の再解決は極力避けてください。

## 3. 依存関係

```bash
corepack enable
corepack prepare pnpm@10.18.1 --activate
pnpm install --frozen-lockfile
```

## 4. DB

構造の正本:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`

データの正本:

- 退役時に取得する Supabase DB 外部バックアップ

DBを新規PostgreSQLへ復元後、接続先を `DATABASE_URL` / `DIRECT_URL` に設定します。

Supabase を再利用する場合:

- `DATABASE_URL`: Transaction Pooler
- `DIRECT_URL`: Direct Connection

新規DBにスキーマだけ構築する場合:

```bash
pnpm run db:generate
pnpm run db:deploy
```

データバックアップがある場合は、スキーマとデータをバックアップ方式に応じて復元してください。
データ復元後に Prisma Client を再生成します。

```bash
pnpm run db:generate
```

## 5. Backend 環境変数

秘密値はGitHubへ保存しません。復元時に新規発行してください。

最低限:

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=
DIRECT_URL=
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

メールも再現する場合:

```env
RESEND_API_KEY=
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=MyCats Pro
FRONTEND_URL=http://localhost:3000
```

任意:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
SENTRY_DSN=
LOG_LEVEL=info
HEALTH_CHECK_DATABASE=true
```

## 6. ローカル起動

Backend:

```bash
pnpm run backend:dev
```

Frontend:

```bash
pnpm run frontend:dev:wait
```

または同時起動:

```bash
pnpm run dev
```

アクセス:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:3004/health`

## 7. 復元確認

最低限、以下を確認します。

1. Backend `/health` が 200
2. Frontend が表示される
3. ログインできる
4. 猫一覧が表示される
5. 血統データが表示される
6. 交配管理の既存データを読める
7. 主要な画像/添付ファイルが必要なら別バックアップから戻す
8. 本番メールを有効化する場合は Resend のドメイン認証を再設定

## 8. 本番相当で再公開する場合

旧ドメイン `nekoya.co.jp` を前提にしないでください。
復元時の新しいホスト名を設定し、少なくとも以下を更新します。

- Backend `CORS_ORIGIN`
- Frontend `NEXT_PUBLIC_API_URL`
- Backend `FRONTEND_URL`
- Resend の From domain
- DNS / TLS
- PWA / OpenGraph 等の公開URL

## 9. 注意

このアーカイブは「当時のMyCats Proを再現する」ためのものです。
将来の本番運用を再開する場合は、依存関係・脆弱性・認証・バックアップ方式を改めて監査してください。
