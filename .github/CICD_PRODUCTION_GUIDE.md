# CI/CD Production Deployment Guide for Cloud Run

このドキュメントでは、Google Cloud Run へのデプロイに最適化された CI/CD パイプラインについて説明します。

## 📋 概要

本番環境への安全なデプロイを保証するため、以下の Cloud Run ベストプラクティスを実装しています：

- ✅ Dockerコンテナのセキュリティスキャン
- ✅ Dockerfile のベストプラクティス検証
- ✅ ヘルスチェックエンドポイントの検証
- ✅ Cloud Run 互換性チェック
- ✅ 本番環境デプロイの準備完了チェック

## 🔄 CI/CD パイプラインフロー

### 1. セキュリティスキャン (Security Scan)
**目的**: 依存関係とソースコードの脆弱性検出

- Trivy によるファイルシステムスキャン
- CRITICAL および HIGH の脆弱性でビルド失敗
- pnpm audit による依存関係の監査
- GitHub Security タブへの結果アップロード

**必須条件**: 
- CRITICAL/HIGH の脆弱性が存在しないこと
- 本番依存関係に高レベルの脆弱性がないこと

### 2. Lint & Type Check
**目的**: コード品質とタイプセーフティの保証

- バックエンド: **ゼロ警告ポリシー** (`--max-warnings=0`)
- フロントエンド: Lint チェック
- TypeScript 型チェック (backend/frontend)

**変更点**: 
- 本番環境では警告を許可しない厳格なポリシーに変更（以前は300件まで許可）

### 3. ユニットテスト (Unit Tests)
**目的**: ビジネスロジックの検証

- PostgreSQL 15 サービスコンテナを使用
- Prisma マイグレーションの実行
- Backend/Frontend のユニットテスト

### 4. E2Eテスト (E2E Tests)
**目的**: エンドツーエンドの動作検証

- 完全な統合テスト環境
- Prisma Client (Node-API) による互換性テスト

### 5. ビルド (Build)
**目的**: 本番用アーティファクトの作成

- Backend: `dist/` ディレクトリの生成
- Frontend: `.next/` ディレクトリの生成
- ビルド出力の検証
- アーティファクトのアップロード（7日間保持）

### 6. Dockerfile Validation (NEW)
**目的**: Dockerfile のベストプラクティス検証

#### Hadolint によるチェック
- Dockerfile の構文と推奨事項の検証
- セキュリティとパフォーマンスの最適化

#### Cloud Run 要件の検証
- ✅ Port 8080 の公開（Cloud Run 必須）
- ✅ マルチステージビルドの使用
- ✅ .dockerignore の存在確認
- ⚠️ 非rootユーザーの推奨

**失敗条件**:
- Port 8080 が公開されていない場合

### 7. Docker Build & Container Image Scan (NEW)
**目的**: Dockerイメージのビルドとセキュリティ検証

#### ビルドプロセス
- Docker Buildx を使用した最適化ビルド
- GitHub Actions キャッシュの活用
- Backend/Frontend を並列ビルド（マトリックス戦略）

#### セキュリティスキャン
- Trivy によるイメージスキャン
- CRITICAL/HIGH の脆弱性を検出
- GitHub Security タブへの結果アップロード

#### コンテナテスト
- コンテナの起動テスト（2分タイムアウト）
- Backend: データベース接続なしでの起動検証
- Frontend: 環境変数設定での起動検証
- イメージサイズとレイヤーの検査

**失敗条件**:
- イメージビルドの失敗
- CRITICAL/HIGH の脆弱性検出
- コンテナ起動失敗

### 8. Cloud Run Compatibility Check (NEW)
**目的**: Cloud Run 環境での動作保証

#### ヘルスチェック検証
```bash
GET /health
Expected: 200 OK
Response: {
  "success": true,
  "data": {
    "status": "ok",
    "service": "Cat Management System API",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "environment": "production"
  }
}
```

#### 検証項目
- ✅ `/health` エンドポイントが 200 OK を返す
- ✅ API の準備完了（リトライ機能付き）
- ✅ Port 8080 でリッスン
- ✅ レスポンスタイム < 1秒（コールドスタート対応）
- ✅ CORS 設定の検証
- ✅ 環境変数の適切な処理

#### 実行環境
- PostgreSQL 15 データベース
- 本番環境設定での実行
- データベースマイグレーション実行

**失敗条件**:
- ヘルスチェックが失敗
- API が30回のリトライ後も準備完了しない
- Port 8080 でリッスンしていない

### 9. Production Deployment Readiness (NEW)
**目的**: 本番デプロイの最終確認

#### 検証項目
- ✅ `cloudbuild.yaml` の存在確認
- ✅ Cloud Build 設定の妥当性検証
- ✅ すべての前段階チェックの成功確認

## 🚀 Cloud Run ベストプラクティス

### 1. コンテナセキュリティ
- **脆弱性スキャン**: ファイルシステムとDockerイメージの両方
- **自動ブロック**: CRITICAL/HIGH の脆弱性検出時
- **継続的監視**: GitHub Security タブでの追跡

### 2. Dockerfile 最適化
```dockerfile
# ✅ 推奨: マルチステージビルド
FROM node:20-alpine AS base
FROM base AS deps
FROM base AS build
FROM node:20-alpine AS production

# ✅ 推奨: Port 8080 (Cloud Run デフォルト)
EXPOSE 8080

# ⚠️ 推奨: 非rootユーザー
USER node

# ✅ 推奨: 最小限のベースイメージ
FROM node:20-alpine
```

### 3. ヘルスチェック
Cloud Run は以下のヘルスチェックタイプをサポート：

- **Startup Probe**: コンテナの初期化完了を確認
- **Liveness Probe**: 継続的な稼働状態を監視

```typescript
// Backend: /health エンドポイント
@Get('health')
check() {
  return {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  };
}
```

### 4. 起動パフォーマンス
- **コールドスタート最適化**: レスポンスタイム < 1秒
- **起動タイムアウト**: コンテナ起動 < 2分
- **リソース効率**: 適切なメモリと CPU 設定

### 5. 環境設定
```yaml
# Cloud Run 推奨設定 (cloudbuild.yaml 参照)
--port=8080                    # デフォルトポート
--memory=512Mi                 # メモリ制限
--cpu=1                        # CPU制限
--max-instances=3              # 最大インスタンス数
--min-instances=0              # 最小インスタンス数（コスト最適化）
--timeout=300                  # タイムアウト（秒）
--set-secrets=...              # Secret Manager 統合
--add-cloudsql-instances=...   # Cloud SQL 統合
```

## 📊 パイプライン実行時間の目安

| ジョブ | 実行時間 | 並列実行 |
|-------|---------|---------|
| Security Scan | 3-5分 | - |
| Lint & Type Check | 2-3分 | - |
| Unit Tests | 3-4分 | - |
| E2E Tests | 4-6分 | - |
| Build | 5-7分 | - |
| Dockerfile Validation | 1-2分 | - |
| Docker Build & Scan | 5-10分 | ✅ (2並列) |
| Cloud Run Validation | 3-5分 | - |
| Deployment Readiness | 1分未満 | - |

**合計実行時間**: 約 30-40分

## ❌ パイプライン失敗の主な原因

### 1. セキュリティスキャン失敗
```
❌ Critical or high severity vulnerabilities detected!
```
**対処法**:
- 依存関係を最新バージョンにアップデート
- `pnpm update` で修正されたバージョンをインストール
- 一時的な除外が必要な場合は `.trivyignore` を使用

### 2. Lint 警告
```
❌ Lint failed with warnings (max-warnings=0)
```
**対処法**:
- すべての lint 警告を修正
- ESLint の `--fix` オプションで自動修正
- 必要に応じて ESLint ルールを調整

### 3. Dockerfile 検証失敗
```
❌ Backend: Port 8080 not exposed
```
**対処法**:
- Dockerfile に `EXPOSE 8080` を追加
- Cloud Run は Port 8080 を必須とします

### 4. Docker イメージ脆弱性
```
❌ Critical or high vulnerabilities found in backend image!
```
**対処法**:
- ベースイメージを最新版にアップデート
- `node:20-alpine` など軽量イメージを使用
- レイヤーキャッシュをクリア

### 5. コンテナ起動失敗
```
❌ Container failed to start
```
**対処法**:
- Docker ログを確認: `docker logs test-backend`
- 環境変数が正しく設定されているか確認
- データベース接続設定を確認

### 6. ヘルスチェック失敗
```
❌ Health check endpoint failed with status: 500
```
**対処法**:
- `/health` エンドポイントの実装を確認
- 依存サービスの起動を確認
- ログでエラーメッセージを確認

## 🔧 トラブルシューティング

### GitHub Actions ログの確認
1. GitHub リポジトリの **Actions** タブを開く
2. 失敗したワークフローをクリック
3. 失敗したジョブの詳細ログを確認

### ローカルでの検証

#### Dockerfile のビルドテスト
```bash
# Backend
docker build -f Dockerfile.backend -t mycats-backend:test .

# Frontend
docker build -f Dockerfile.frontend -t mycats-frontend:test .
```

#### コンテナの起動テスト
```bash
# Backend
docker run -d --name test-backend \
  -e DATABASE_URL="postgresql://user:pass@localhost:5432/db" \
  -e JWT_SECRET="test-secret-minimum-32-chars-long" \
  -e NODE_ENV="production" \
  -e PORT=8080 \
  -p 8080:8080 \
  mycats-backend:test

# ログ確認
docker logs test-backend

# 停止
docker stop test-backend
docker rm test-backend
```

#### ヘルスチェックのテスト
```bash
curl http://localhost:8080/health
```

#### Hadolint によるチェック
```bash
# Hadolint のインストール
wget -O hadolint https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64
chmod +x hadolint

# チェック実行
./hadolint Dockerfile.backend
./hadolint Dockerfile.frontend
```

## 📚 参考リンク

### Google Cloud 公式ドキュメント
- [Cloud Run のベストプラクティス](https://cloud.google.com/run/docs/best-practices)
- [Cloud Run ヘルスチェック](https://cloud.google.com/run/docs/configuring/healthchecks)
- [Cloud Build CI/CD](https://cloud.google.com/build/docs/ci-cd)
- [Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

### Docker ベストプラクティス
- [Docker 公式ベストプラクティス](https://docs.docker.com/build/building/best-practices/)
- [Hadolint - Dockerfile Linter](https://github.com/hadolint/hadolint)
- [Trivy - 脆弱性スキャナー](https://github.com/aquasecurity/trivy)

### CI/CD ベストプラクティス
- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [Google Cloud CI/CD ベストプラクティス](https://cloud.google.com/architecture/devops/devops-tech-ci-cd)

## 🎯 次のステップ

1. **初回デプロイ**
   - cloudbuild.yaml の設定値を環境に合わせて調整
   - GCP プロジェクトとシークレットを設定
   - Cloud Build トリガーを設定

2. **モニタリング設定**
   - Cloud Monitoring でアラート設定
   - Cloud Logging でログ監視
   - エラー率とレイテンシの追跡

3. **パフォーマンス最適化**
   - コールドスタート時間の測定
   - イメージサイズの最適化
   - リソース使用量の調整

4. **セキュリティ強化**
   - 定期的な依存関係アップデート
   - セキュリティスキャンの自動化
   - Secret ローテーション

---

**最終更新**: 2024-11-13
**バージョン**: 1.0.0
