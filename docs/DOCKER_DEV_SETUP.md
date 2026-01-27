# Docker 開発環境セットアップガイド

このドキュメントでは、Docker Compose を使用した完全コンテナ化開発環境のセットアップ方法を説明します。

## 📋 目次

- [概要](#概要)
- [メリット](#メリット)
- [前提条件](#前提条件)
- [クイックスタート](#クイックスタート)
- [docker-compose.dev.yml の構成](#docker-composedevyml-の構成)
- [ボリュームマウント戦略](#ボリュームマウント戦略)
- [トラブルシューティング](#トラブルシューティング)

## 概要

`docker-compose.dev.yml` は開発環境専用の Docker Compose 設定ファイルです。本番環境の `docker-compose.yml` とは分離して管理されており、以下のサービスを提供します：

- **PostgreSQL**: データベースサービス
- **Backend**: NestJS API サーバー（ホットリロード対応）
- **Frontend**: Next.js フロントエンドサーバー（Fast Refresh対応）

## メリット

### 1. 環境構築の簡略化
- Node.js、PostgreSQL、pnpm のローカルインストール不要
- 環境変数の設定ミスを防止
- チーム間で統一された開発環境

### 2. 依存関係の分離
- ホストマシンの環境に影響されない
- プロジェクト間の依存関係の競合を回避
- クリーンな状態での再構築が容易

### 3. 開発効率の向上
- ワンコマンドで全サービス起動
- ホットリロード対応（コード変更を即座に反映）
- データベースの初期化・シードデータの自動投入

### 4. 本番環境との一貫性
- 同じベースイメージ（node:20-alpine3.22）を使用
- Docker ネットワーク経由のサービス間通信
- 本番デプロイ前のコンテナ動作確認

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Docker Desktop**: 最新版（Docker Compose 含む）
  - [macOS](https://docs.docker.com/desktop/install/mac-install/)
  - [Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Linux](https://docs.docker.com/desktop/install/linux-install/)

## クイックスタート

### 初回起動（ビルド含む）

```bash
# Docker イメージをビルドして全サービスを起動
pnpm run docker:dev:build
```

初回は以下の処理が実行されます：
1. ベースイメージのダウンロード
2. 依存関係のインストール
3. Prisma クライアントの生成
4. PostgreSQL コンテナの起動
5. Backend コンテナの起動（マイグレーション実行）
6. Frontend コンテナの起動

**起動時間**: 初回は 5〜10 分程度（ネットワーク速度に依存）

### 2回目以降の起動

```bash
# キャッシュを利用して起動（高速）
pnpm run docker:dev
```

**起動時間**: 30秒〜1分程度

### サービスの確認

起動後、以下の URL にアクセスできます：

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:3004
- **ヘルスチェック**: http://localhost:3004/health
- **Swagger UI**: http://localhost:3004/api

### 停止とクリーンアップ

```bash
# サービスを停止（データは保持）
pnpm run docker:dev:down

# サービスを停止してデータも削除
pnpm run docker:dev:clean
```

## docker-compose.dev.yml の構成

### サービス構成

```yaml
services:
  postgres:     # PostgreSQL 15
  backend:      # NestJS API (development ステージ)
  frontend:     # Next.js (development ステージ)
```

### ネットワーク

- **ネットワーク名**: `mycats_dev_network`
- **サービス間通信**: コンテナ名で名前解決（例: `http://backend:3004`）
- **ホストからのアクセス**: `localhost` でポートマッピング

### ポートマッピング

| サービス | コンテナ内ポート | ホストポート | 用途 |
|---------|----------------|------------|------|
| postgres | 5432 | 5433 | PostgreSQL |
| backend | 3004 | 3004 | NestJS API |
| frontend | 3000 | 3000 | Next.js |

### 環境変数

#### Backend
```yaml
DATABASE_URL: postgresql://mycats:mycats_dev_password@postgres:5432/mycats_development
NODE_ENV: development
PORT: 3004
CORS_ORIGIN: http://localhost:3000
```

#### Frontend
```yaml
NEXT_PUBLIC_API_URL: http://localhost:3004
NODE_ENV: development
```

## ボリュームマウント戦略

### Backend

```yaml
volumes:
  - ./backend:/app/backend:cached          # ソースコード（macOS最適化）
  - ./node_modules:/app/node_modules:delegated
  - /app/backend/node_modules              # コンテナ内で管理
```

**ポイント**:
- `:cached` オプションでホスト→コンテナの書き込みパフォーマンス向上（macOS）
- `node_modules` はコンテナ内で独立管理（ホストとの混在を防止）

### Frontend

```yaml
volumes:
  - ./frontend:/app/frontend:cached         # ソースコード（macOS最適化）
  - ./node_modules:/app/node_modules:delegated
  - /app/frontend/node_modules              # コンテナ内で管理
  - /app/frontend/.next                     # Next.js キャッシュを永続化
```

**ポイント**:
- `.next` ディレクトリをコンテナ内で管理（ビルドキャッシュ最適化）
- Fast Refresh が正常に動作

## トラブルシューティング

### ポート競合エラー

**症状**:
```
Error starting userland proxy: listen tcp4 0.0.0.0:3004: bind: address already in use
```

**原因**: ホストマシンで既に同じポートが使用されている

**解決方法**:
```bash
# 1. ローカルの開発サーバーを停止
pnpm run dev:stop

# 2. プロセスを確認
lsof -i :3004
lsof -i :3000

# 3. プロセスを強制終了（PID は lsof の出力から取得）
kill -9 <PID>

# 4. Docker Compose を再起動
pnpm run docker:dev
```

### ホットリロードが動作しない

**症状**: ソースコード変更がコンテナに反映されない

**原因1**: ボリュームマウントの設定ミス

**解決方法**:
```bash
# コンテナを完全に削除して再構築
pnpm run docker:dev:clean
pnpm run docker:dev:build
```

**原因2**: macOS/Windows のファイルシステム通知の遅延

**解決方法**:
```bash
# polling モードを有効化（docker-compose.dev.yml に追記）
environment:
  - CHOKIDAR_USEPOLLING=true
```

### データベース接続エラー

**症状**:
```
Error: P1001: Can't reach database server at `postgres:5432`
```

**原因**: PostgreSQL コンテナが起動していない、またはヘルスチェックが失敗

**解決方法**:
```bash
# 1. PostgreSQL のログを確認
docker logs mycats_dev_postgres

# 2. ヘルスチェックの状態を確認
docker ps

# 3. PostgreSQL を再起動
docker restart mycats_dev_postgres

# 4. データベースに直接接続してテスト
docker exec -it mycats_dev_postgres psql -U mycats -d mycats_development
```

### ビルドキャッシュの問題

**症状**: 依存関係の変更が反映されない

**解決方法**:
```bash
# キャッシュなしで再ビルド
docker-compose -f docker-compose.dev.yml build --no-cache

# または
pnpm run docker:dev:clean
pnpm run docker:dev:build
```

### メモリ不足エラー

**症状**:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**原因**: Docker Desktop のメモリ制限が不足

**解決方法**:

1. **Docker Desktop の設定を開く**
2. **Resources → Advanced**
3. **Memory を 4GB 以上に設定**（推奨: 8GB）
4. **Apply & Restart**

### ログの確認方法

```bash
# すべてのコンテナのログを表示
docker-compose -f docker-compose.dev.yml logs

# 特定のサービスのログのみ表示
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs frontend

# リアルタイムでログを追跡
docker-compose -f docker-compose.dev.yml logs -f backend
```

## 高度な使い方

### 個別サービスの起動

```bash
# PostgreSQL のみ起動
docker-compose -f docker-compose.dev.yml up postgres

# Backend のみ起動（PostgreSQL は自動起動）
docker-compose -f docker-compose.dev.yml up backend

# Frontend のみ起動（Backend と PostgreSQL は自動起動）
docker-compose -f docker-compose.dev.yml up frontend
```

### コンテナ内でコマンド実行

```bash
# Backend コンテナで Prisma マイグレーション実行
docker exec -it mycats_dev_backend pnpm --filter backend run prisma:migrate

# Frontend コンテナでビルド実行
docker exec -it mycats_dev_frontend pnpm --filter frontend run build

# Backend コンテナに対話的にログイン
docker exec -it mycats_dev_backend sh
```

### データベースのリセット

```bash
# 1. データベースボリュームを削除
pnpm run docker:dev:clean

# 2. 再起動（初期化スクリプトが自動実行される）
pnpm run docker:dev:build
```

## ローカル開発とコンテナ開発の使い分け

| 項目 | ローカル開発 | コンテナ開発 |
|-----|------------|------------|
| 起動速度 | 速い | 初回は遅い（2回目以降は高速） |
| 環境構築 | 必要 | 不要 |
| メモリ使用量 | 少ない | 多い（Docker Desktop が必要） |
| 分離性 | 低い | 高い |
| 本番環境との一貫性 | 低い | 高い |
| トラブルシューティング | 容易 | やや複雑 |

**推奨**:
- **日常開発**: ローカル開発（`pnpm run dev`）
- **環境問題の切り分け**: コンテナ開発（`pnpm run docker:dev`）
- **本番デプロイ前の検証**: コンテナ開発
- **新メンバーのオンボーディング**: コンテナ開発

## 関連ドキュメント

- [README.md](../README.md) - プロジェクト全体の概要
- [docker-compose.yml](../docker-compose.yml) - 本番環境の設定
- [Dockerfile.backend](../Dockerfile.backend) - Backend Dockerfile
- [Dockerfile.frontend](../Dockerfile.frontend) - Frontend Dockerfile
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - 一般的なトラブルシューティング

## まとめ

Docker Compose 開発環境は以下の場合に特に有用です：

✅ **チーム開発**: 環境の統一が重要な場合  
✅ **新メンバーのオンボーディング**: セットアップ時間を短縮したい場合  
✅ **本番環境の検証**: コンテナ環境での動作確認が必要な場合  
✅ **クリーンな環境**: 依存関係の問題を切り分けたい場合

通常の開発では `pnpm run dev` を使用し、必要に応じて Docker 環境を活用することを推奨します。
