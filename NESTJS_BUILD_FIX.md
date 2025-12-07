# NestJS ビルド出力パス修正ガイド

## 問題の概要

CI/CD パイプラインの "Cloud Run Compatibility" チェックで、ビルド後に `dist/main.js` が見つからないエラーが発生していました。

## 根本原因

`nest-cli.json` ファイルが存在しなかったため、NestJS はデフォルト設定でビルドを実行していました。デフォルト設定では、ソースディレクトリの構造がビルド出力にも反映されるため、`src/main.ts` が `dist/src/main.js` としてコンパイルされていました。

## 修正内容

### 1. `backend/nest-cli.json` の作成

標準的な NestJS CLI 設定ファイルを作成しました。

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "entryFile": "main",
  "compilerOptions": {
    "deleteOutDir": true,
    "tsConfigPath": "tsconfig.build.json",
    "webpack": false,
    "assets": [],
    "watchAssets": false
  }
}
```

### 2. `backend/tsconfig.build.json` の修正

`rootDir` を `./src` に設定することで、ビルド出力が `dist/` 直下に配置されるようにしました。

**変更前:**
```json
{
  "compilerOptions": {
    "rootDir": ".",
    ...
  },
  "include": ["src/**/*", "prisma/seed.ts"]
}
```

**変更後:**
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    ...
  },
  "include": ["src/**/*"]
}
```

### 3. `backend/package.json` の修正

**変更前:**
```json
"start:prod": "node dist/src/main"
```

**変更後:**
```json
"start:prod": "node dist/main"
```

### 4. `backend/docker-entrypoint.sh` の修正

**変更前:**
```bash
exec node dist/src/main.js
```

**変更後:**
```bash
exec node dist/main.js
```

## ビルド出力の変更

### 変更前の構造
```
dist/
├── src/
│   ├── main.js
│   ├── app.module.js
│   └── ...
└── prisma/
    └── seed.js
```

### 変更後の構造
```
dist/
├── main.js          ← エントリーポイント
├── app.module.js
├── prisma/
│   └── seed.js
└── ...
```

## 検証方法

### ローカル環境での確認

```bash
# 1. クリーンビルド
cd backend
rm -rf dist
npm run build

# 2. ビルド出力の確認
ls -la dist/main.js

# 3. 起動テスト（環境変数を設定して実行）
NODE_ENV=production \
DATABASE_URL="postgresql://user:pass@localhost:5432/db" \
JWT_SECRET="your-secret-key-minimum-32-chars" \
JWT_REFRESH_SECRET="your-refresh-secret-key-minimum-32-chars" \
CSRF_TOKEN_SECRET="your-csrf-token-secret-minimum-32-chars" \
CORS_ORIGIN="http://localhost:3000" \
PORT=8080 \
node dist/main
```

### CI/CD での確認

Cloud Run Compatibility チェックが成功することを確認：

```bash
# CI ワークフローの該当ステップ
npm run build
if [ ! -f dist/main.js ]; then
  echo "❌ Error: dist/main.js not found after build"
  exit 1
fi
```

## トラブルシューティング

### Q: ビルド後も `dist/src/main.js` が生成される

A: `nest-cli.json` と `tsconfig.build.json` が正しく設定されているか確認してください。特に `tsconfig.build.json` の `rootDir` が `./src` になっているか確認してください。

### Q: `dist/prisma/seed.js` が生成されない

A: `src/prisma/seed.ts` が存在することを確認してください。ルートの `prisma/seed.ts` ではなく、`src/` 配下のファイルがコンパイルされます。

### Q: Docker コンテナが起動しない

A: `docker-entrypoint.sh` が `node dist/main.js` を実行していることを確認してください。

## 参考資料

- [NestJS CLI Configuration](https://docs.nestjs.com/cli/monorepo#cli-configuration-file)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

## 関連する問題

- Cloud Run 互換性チェックの失敗
- Docker イメージビルドの失敗
- デプロイ後のアプリケーション起動失敗
