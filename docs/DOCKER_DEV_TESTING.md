# Docker 開発環境 テスト手順書

このドキュメントは、Docker 開発環境の実装が正しく動作するかを検証するためのテスト手順をまとめたものです。

## 📋 前提条件

- Docker Desktop がインストールされていること
- プロジェクトのクローンが完了していること
- ポート 3000, 3004, 5433 が空いていること

## ✅ テスト1: Docker Compose YAML 構文検証

### 目的
docker-compose.dev.yml の YAML 構文が正しいことを確認

### 手順
```bash
cd /path/to/my-cats-pro
docker compose -f docker-compose.dev.yml config --quiet
```

### 期待結果
- エラーが出力されないこと
- exit code が 0 であること

## ✅ テスト2: Dockerfile マルチステージビルド検証

### 目的
Dockerfile.backend と Dockerfile.frontend に development ステージが正しく定義されていることを確認

### 手順
```bash
# Backend の development ステージ確認
grep "^FROM.*AS development" Dockerfile.backend

# Frontend の development ステージ確認
grep "^FROM.*AS development" Dockerfile.frontend

# すべてのステージを確認
grep "^FROM" Dockerfile.backend
grep "^FROM" Dockerfile.frontend
```

### 期待結果
Backend:
```
FROM base AS development
```

Frontend:
```
FROM base AS development
```

すべてのステージ (Backend):
```
FROM node:20-alpine3.22 AS base
FROM base AS development
FROM base AS build
FROM node:20-alpine3.22 AS production
```

すべてのステージ (Frontend):
```
FROM node:20-alpine AS base
FROM base AS development
FROM base AS build
FROM node:20-alpine AS production
```

## ✅ テスト3: package.json スクリプト検証

### 目的
必要なスクリプトが正しく追加されていることを確認

### 手順
```bash
# ルート package.json のスクリプト確認
node -e "const pkg = require('./package.json'); 
console.log('docker:dev:', pkg.scripts['docker:dev']);
console.log('docker:dev:build:', pkg.scripts['docker:dev:build']);
console.log('docker:dev:down:', pkg.scripts['docker:dev:down']);
console.log('docker:dev:clean:', pkg.scripts['docker:dev:clean']);
console.log('build:parallel:', pkg.scripts['build:parallel']);
console.log('test:changed:', pkg.scripts['test:changed']);"

# backend package.json のスクリプト確認
node -e "const pkg = require('./backend/package.json');
console.log('test:changed:', pkg.scripts['test:changed']);
console.log('test:watch:', pkg.scripts['test:watch']);"
```

### 期待結果
ルート package.json:
```
docker:dev: docker compose -f docker-compose.dev.yml up
docker:dev:build: docker compose -f docker-compose.dev.yml up --build
docker:dev:down: docker compose -f docker-compose.dev.yml down
docker:dev:clean: docker compose -f docker-compose.dev.yml down -v
build:parallel: pnpm --parallel --filter './backend' --filter './frontend' run build
test:changed: pnpm --filter './backend' run test:changed
```

backend/package.json:
```
test:changed: jest --onlyChanged
test:watch: jest --watch
```

## ✅ テスト4: Docker イメージビルドテスト

### 目的
development ステージのイメージが正しくビルドできることを確認

### 手順
```bash
# Backend development イメージをビルド（キャッシュなし）
docker build --target development -f Dockerfile.backend -t mycats-backend-dev:test .

# Frontend development イメージをビルド（キャッシュなし）
docker build --target development -f Dockerfile.frontend -t mycats-frontend-dev:test .

# ビルドされたイメージを確認
docker images | grep mycats
```

### 期待結果
- ビルドエラーが発生しないこと
- `mycats-backend-dev:test` と `mycats-frontend-dev:test` のイメージが表示されること

### クリーンアップ
```bash
docker rmi mycats-backend-dev:test mycats-frontend-dev:test
```

## ✅ テスト5: コンテナ起動とヘルスチェック（Full E2E）

### 目的
Docker Compose で全サービスが正常に起動し、ヘルスチェックが成功することを確認

### 前提条件
- ローカルの開発サーバーが停止していること
```bash
# ローカルサーバーの停止
pnpm run dev:stop

# ポートが空いていることを確認
lsof -i :3000
lsof -i :3004
lsof -i :5433
```

### 手順（初回起動）
```bash
# 1. Docker Compose でビルド & 起動
pnpm run docker:dev:build

# 別ターミナルで以下のコマンドを実行

# 2. コンテナの状態を確認（すべて healthy になるまで待つ）
docker ps

# 3. PostgreSQL のヘルスチェック
docker exec mycats_dev_postgres pg_isready -U mycats -d mycats_development

# 4. Backend のヘルスチェック
curl -f http://localhost:3004/health

# 5. Frontend のアクセス確認（ブラウザまたは curl）
curl -I http://localhost:3000
```

### 期待結果

**docker ps の出力例**:
```
CONTAINER ID   IMAGE                      STATUS                    PORTS
abc123         mycats-dev-backend         Up 2 minutes (healthy)    0.0.0.0:3004->3004/tcp
def456         mycats-dev-frontend        Up 2 minutes              0.0.0.0:3000->3000/tcp
ghi789         postgres:15-alpine         Up 2 minutes (healthy)    0.0.0.0:5433->5432/tcp
```

**PostgreSQL ヘルスチェック**:
```
/var/run/postgresql:5432 - accepting connections
```

**Backend ヘルスチェック**:
```json
{"status":"ok","info":{"database":{"status":"up"},...}}
```

**Frontend アクセス**:
```
HTTP/1.1 200 OK
```

### 手順（2回目以降の起動）
```bash
# キャッシュを利用して高速起動
pnpm run docker:dev

# ヘルスチェック
curl -f http://localhost:3004/health
```

### 期待結果
- 30秒〜1分程度で起動すること（初回より大幅に高速）

### クリーンアップ
```bash
# サービスを停止（データは保持）
pnpm run docker:dev:down

# サービスを停止してデータも削除
pnpm run docker:dev:clean
```

## ✅ テスト6: ホットリロード動作確認

### 目的
ソースコード変更が自動的にコンテナに反映されることを確認

### 前提条件
- テスト5 でコンテナが起動していること

### 手順（Backend）
```bash
# 1. Backend のログを監視（別ターミナル）
docker compose -f docker-compose.dev.yml logs -f backend

# 2. Backend のソースコードを編集
echo "// Test comment" >> backend/src/main.ts

# 3. ログを確認
# NestJS が自動的に再起動することを確認
```

### 期待結果
- ファイル変更後、10秒以内に NestJS が再起動すること
- ログに `Starting Nest application...` のようなメッセージが表示されること

### 手順（Frontend）
```bash
# 1. Frontend のログを監視（別ターミナル）
docker compose -f docker-compose.dev.yml logs -f frontend

# 2. Frontend のソースコードを編集
# 例: frontend/src/app/page.tsx の一部を変更

# 3. ブラウザで http://localhost:3000 を開く
# 4. 変更が即座に反映されることを確認（Fast Refresh）
```

### 期待結果
- ファイル変更後、数秒以内に変更が反映されること
- ブラウザが自動的にリロードされること（Fast Refresh）

## ✅ テスト7: 並列ビルドテスト

### 目的
backend と frontend を並列ビルドできることを確認

### 前提条件
- pnpm がインストールされていること
- 依存関係がインストール済みであること

### 手順
```bash
# 並列ビルド実行
pnpm run build:parallel
```

### 期待結果
- backend と frontend のビルドが並列実行されること
- 両方のビルドが成功すること
- backend/dist と frontend/.next が生成されること

### 確認コマンド
```bash
ls -la backend/dist
ls -la frontend/.next
```

## ✅ テスト8: test:changed スクリプトテスト

### 目的
変更されたファイルのみテストが実行されることを確認

### 前提条件
- Git リポジトリが初期化されていること
- backend のテストファイルが存在すること

### 手順
```bash
# Backend のテストファイルを変更
# 例: backend/src/app.controller.spec.ts に空白を追加

# Git でステージング
cd backend
git add src/app.controller.spec.ts

# 変更されたファイルのみテスト
pnpm run test:changed
```

### 期待結果
- 変更されたテストファイルのみが実行されること
- Jest が `--onlyChanged` オプションで動作すること

## 🎯 すべてのテストが成功した場合

以下の完了条件がすべて満たされています：

✅ 1. `pnpm run docker:dev:build` で全サービスが起動すること  
✅ 2. http://localhost:3000 でフロントエンドにアクセスできること  
✅ 3. http://localhost:3004/health でバックエンドのヘルスチェックが成功すること  
✅ 4. ソースコード変更時にホットリロードが動作すること  
✅ 5. `pnpm run build:parallel` で backend/frontend が並列ビルドされること  
✅ 6. 新規ドキュメント `docs/DOCKER_DEV_SETUP.md` が作成されていること  
✅ 7. README.md に Docker Compose での起動方法が追記されていること

## 📝 トラブルシューティング

各テストで問題が発生した場合は、[docs/DOCKER_DEV_SETUP.md](./DOCKER_DEV_SETUP.md) のトラブルシューティングセクションを参照してください。

## 🔄 テスト環境のリセット

すべてのテストを最初からやり直したい場合：

```bash
# 1. すべてのコンテナとボリュームを削除
pnpm run docker:dev:clean

# 2. Docker イメージも削除
docker rmi $(docker images -q 'mycats*')

# 3. ビルドキャッシュをクリア
docker builder prune -af

# 4. 最初から起動
pnpm run docker:dev:build
```
