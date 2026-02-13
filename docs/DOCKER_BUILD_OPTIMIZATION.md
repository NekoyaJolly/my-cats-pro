# Docker ビルドキャッシュ最適化ガイド

## 現在の実装: `--no-cache` アプローチ

### メリット

✅ **確実性**: 毎回完全にクリーンなビルドを保証  
✅ **シンプル**: 設定が簡単で理解しやすい  
✅ **デバッグしやすい**: キャッシュ起因の問題を排除

### デメリット

⚠️ **ビルド時間**: 通常 3-5分 → 8-12分に増加  
⚠️ **コスト**: Cloud Build の課金時間が増加  
⚠️ **帯域幅**: 依存関係を毎回ダウンロード

## 代替案: コミットハッシュベースのタグ戦略

より効率的なアプローチとして、イメージタグにコミットハッシュを含める方法があります。

### 実装例

#### 1. cloudbuild.yaml の修正

```yaml
steps:
  # Frontend のビルド
  - name: 'gcr.io/cloud-builders/docker'
    id: 'Build Frontend'
    args:
      - 'build'
      # コミットハッシュをタグに含める
      - '-t'
      - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:${_GITHUB_SHA}'
      - '-t'
      - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:latest'
      - '--build-arg'
      - 'NEXT_PUBLIC_API_URL=${_NEXT_PUBLIC_API_URL}'
      - '--build-arg'
      - 'GITHUB_SHA=${_GITHUB_SHA}'
      - '--build-arg'
      - 'BUILD_TIME=${_BUILD_TIME}'
      # キャッシュを活用（--no-cache を削除）
      - '-f'
      - 'Dockerfile.frontend'
      - '.'
    waitFor: ['-']

  # Frontend イメージをプッシュ（両方のタグ）
  - name: 'gcr.io/cloud-builders/docker'
    id: 'Push Frontend SHA Tag'
    args:
      - 'push'
      - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:${_GITHUB_SHA}'
    waitFor: ['Build Frontend']

  - name: 'gcr.io/cloud-builders/docker'
    id: 'Push Frontend Latest Tag'
    args:
      - 'push'
      - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:latest'
    waitFor: ['Build Frontend']

  # Cloud Run デプロイ（SHA タグを使用）
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    id: 'Deploy Frontend'
    entrypoint: bash
    args:
      - '-c'
      - |
        gcloud run deploy "${_FRONTEND_SERVICE_NAME}" \
          --image "${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:${_GITHUB_SHA}" \
          --region "${_LOCATION}" \
          # ... その他のオプション ...
    waitFor: ['Push Frontend SHA Tag']

# イメージリストも更新
images:
  - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:${_GITHUB_SHA}'
  - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:latest'
```

### この方法のメリット

✅ **ビルドキャッシュを活用**: 依存関係が変わらなければ再利用  
✅ **バージョン管理**: コミットごとにイメージが保存される  
✅ **ロールバックが簡単**: 特定のコミットのイメージを指定するだけ  
✅ **ビルド時間の短縮**: 平均 5-7分（キャッシュヒット時）

### この方法のデメリット

⚠️ **ストレージコスト**: 各コミットのイメージが保存される  
⚠️ **管理の複雑さ**: 古いイメージの削除が必要

## ハイブリッドアプローチ（推奨）

### 戦略

1. **通常のデプロイ**: コミットハッシュタグ + キャッシュ利用
2. **重要なリリース**: `--no-cache` で完全ビルド
3. **定期的なクリーンビルド**: 週1回など、スケジュールで完全ビルド

### 実装

#### deploy-only.yml に環境変数を追加

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        # ... 既存の設定 ...
      use_cache:
        description: 'ビルドキャッシュを使用するか'
        required: false
        type: boolean
        default: true
```

#### cloudbuild.yaml を条件分岐

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    id: 'Build Frontend'
    args:
      - 'build'
      - '-t'
      - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:${_GITHUB_SHA}'
      - '-t'
      - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:latest'
      # 条件付きで --no-cache を追加
      - '${_NO_CACHE_FLAG}'
      - '-f'
      - 'Dockerfile.frontend'
      - '.'

substitutions:
  _NO_CACHE_FLAG: ''  # デフォルトはキャッシュを使用
  # または
  # _NO_CACHE_FLAG: '--no-cache'  # キャッシュを使用しない
```

#### deploy-only.yml から制御

```bash
# キャッシュ使用フラグを設定
if [ "${{ inputs.use_cache }}" = "false" ]; then
  NO_CACHE_FLAG="--no-cache"
else
  NO_CACHE_FLAG=""
fi

SUBSTITUTIONS="${SUBSTITUTIONS},_NO_CACHE_FLAG=${NO_CACHE_FLAG}"
```

## Dockerfile のマルチステージビルド最適化

### 依存関係レイヤーの分離

```dockerfile
# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.18.1

# ---- Dependencies Stage ---- (キャッシュされやすい)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile --filter frontend...

# ---- Build Stage ---- (コード変更で再ビルド)
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend ./frontend
WORKDIR /app/frontend

ARG NEXT_PUBLIC_API_URL
ARG GITHUB_SHA
ARG BUILD_TIME

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV GITHUB_SHA=${GITHUB_SHA}
ENV BUILD_TIME=${BUILD_TIME}

RUN pnpm build

# ---- Production Stage ----
FROM node:20-alpine AS production
# ... 既存の production stage ...
```

### 効果

- `package.json` が変わらなければ、`deps` ステージがキャッシュされる
- ソースコードだけ変更した場合、依存関係のインストールをスキップ
- ビルド時間: 3-4分（キャッシュヒット時）

## 古いイメージの自動削除

### GCP Artifact Registry のライフサイクルポリシー

```bash
# 90日以上前のイメージを削除
gcloud artifacts repositories set-cleanup-policies mycats-pro \
  --location=asia-northeast1 \
  --policy=policy.json
```

#### policy.json

```json
{
  "name": "delete-old-images",
  "action": "DELETE",
  "condition": {
    "olderThan": "7776000s",  // 90日
    "tagState": "UNTAGGED"
  }
}
```

または、タグ数で管理:

```json
{
  "name": "keep-recent-versions",
  "action": "KEEP",
  "mostRecentVersions": {
    "keepCount": 10  // 最新10バージョンを保持
  }
}
```

## パフォーマンス比較

| 手法 | 初回ビルド | キャッシュヒット | コスト | 確実性 |
|-----|-----------|----------------|--------|--------|
| `--no-cache` | 8-12分 | 8-12分 | 高 | ⭐⭐⭐⭐⭐ |
| コミットハッシュタグ | 8-12分 | 3-5分 | 中 | ⭐⭐⭐⭐ |
| マルチステージ最適化 | 8-12分 | 2-4分 | 中 | ⭐⭐⭐⭐ |
| ハイブリッド | 可変 | 可変 | 中 | ⭐⭐⭐⭐⭐ |

## 推奨される移行パス

### フェーズ 1: 現状維持（`--no-cache`）

- ✅ 実装済み
- 確実性を最優先
- キャッシュ問題を完全に排除

### フェーズ 2: コミットハッシュタグ導入

1. `cloudbuild.yaml` を更新してコミットハッシュタグを追加
2. `--no-cache` は残したまま、両方のタグでイメージを保存
3. Cloud Run のデプロイで SHA タグを使用するように変更
4. 1-2週間運用して問題がないことを確認

### フェーズ 3: キャッシュ活用（オプション）

1. ビルドキャッシュが問題を起こさないことを確認
2. `--no-cache` をオプショナルにする（デフォルトは使用しない）
3. 重要なリリース時のみ `--no-cache` を指定

### フェーズ 4: Dockerfile 最適化（長期）

1. マルチステージビルドを依存関係レイヤーで分離
2. ビルド時間とキャッシュ効率を測定
3. 継続的に最適化

## モニタリング

### ビルド時間の追跡

```bash
# Cloud Build の履歴を取得
gcloud builds list \
  --region=asia-northeast1 \
  --limit=20 \
  --format='table(id,createTime,duration,status)'
```

### 平均ビルド時間の計算

```bash
# 過去10件の平均ビルド時間
gcloud builds list \
  --region=asia-northeast1 \
  --limit=10 \
  --format='value(duration)' | \
  awk '{sum+=$1; count++} END {print sum/count " seconds"}'
```

## まとめ

### 現在の実装（`--no-cache`）が適している場合

- デプロイ頻度が低い（週1-2回）
- 確実性を最優先する
- ビルド時間の増加が許容できる

### コミットハッシュタグが適している場合

- デプロイ頻度が高い（日に複数回）
- ビルド時間を短縮したい
- バージョン管理を厳密にしたい
- ロールバックの柔軟性が必要

### ハイブリッドアプローチが適している場合

- 柔軟性を求める
- 通常は高速、重要時は確実に
- 段階的に最適化したい

現在の実装は問題の根本原因を解決しているため、まずは **フェーズ 1（現状維持）** で運用し、ビルド時間が問題になったら **フェーズ 2** への移行を検討することを推奨します。
