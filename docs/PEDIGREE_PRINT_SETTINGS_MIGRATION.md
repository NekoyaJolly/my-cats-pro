# 血統書印刷設定のデータ移行ガイド

このガイドでは、既存の `positions.json` ファイルから新しいデータベースベースの印刷設定システムへの移行手順を説明します。

## 📋 概要

バージョン 2.0 以降、血統書の印刷設定は JSON ファイルではなくデータベースで管理されるようになりました。これにより以下のメリットが得られます：

- **テナントごとの設定**: マルチテナント環境で、テナントごとに異なる印刷設定を管理可能
- **バージョン管理**: 設定変更履歴の追跡が容易
- **サーバー再起動不要**: 設定変更が即座に反映
- **一貫性**: 複数サーバー環境での設定同期

## 🔧 前提条件

- マイグレーション `20251219090000_add_pedigree_print_settings` が適用済みであること
- 既存の `backend/src/pedigree/pdf/positions.json`（または類似ファイル）が存在すること
- データベースへのアクセス権限があること

## 📝 移行手順

### オプション A: API 経由での移行（推奨）

既存の印刷設定ファイルが存在する場合、API 経由で設定をインポートできます。

1. **既存設定を確認**

   ```bash
   # 既存の positions.json を確認
   cat backend/src/pedigree/pdf/positions.json
   ```

2. **API 経由で設定を登録**

   ```bash
   # グローバル設定として登録
   curl -X PATCH http://localhost:3004/pedigrees/print-settings \
     -H "Content-Type: application/json" \
     -d @backend/src/pedigree/pdf/positions.json
   ```

3. **設定が正しく登録されたか確認**

   ```bash
   curl http://localhost:3004/pedigrees/print-settings
   ```

### オプション B: SQL による直接移行

API が利用できない場合や、大量の設定を一括で移行する場合は SQL を直接実行します。

1. **JSON ファイルを読み込み**

   既存の `positions.json` の内容を確認します。

2. **SQL で設定を挿入**

   ```sql
   -- グローバル設定として挿入する例
   INSERT INTO pedigree_print_settings (
       id,
       tenant_id,
       global_key,
       settings,
       version,
       created_at,
       updated_at
   ) VALUES (
       gen_random_uuid(),  -- または 'GLOBAL' など固定ID
       NULL,               -- グローバル設定の場合は NULL
       'GLOBAL',           -- グローバルキー
       '{
         "offsetX": 0,
         "offsetY": 0,
         "breed": {"x": 50, "y": 50},
         "sex": {"x": 50, "y": 60},
         ...（positions.json の内容をここにコピー）
       }'::JSONB,
       1,                  -- 初期バージョン
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
   )
   ON CONFLICT (global_key) DO UPDATE
   SET
       settings = EXCLUDED.settings,
       version = pedigree_print_settings.version + 1,
       updated_at = CURRENT_TIMESTAMP;
   ```

3. **テナント固有の設定を移行する場合**

   ```sql
   -- 特定テナント用の設定
   INSERT INTO pedigree_print_settings (
       id,
       tenant_id,
       global_key,
       settings,
       version,
       created_at,
       updated_at
   ) VALUES (
       gen_random_uuid(),
       'テナントID',      -- 実際のテナントID
       NULL,              -- テナント設定の場合は NULL
       '{...}'::JSONB,    -- 設定内容
       1,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
   )
   ON CONFLICT (tenant_id) DO UPDATE
   SET
       settings = EXCLUDED.settings,
       version = pedigree_print_settings.version + 1,
       updated_at = CURRENT_TIMESTAMP;
   ```

### オプション C: Prisma スクリプトによる移行

より安全で再利用可能な方法として、Prisma スクリプトを作成できます。

1. **移行スクリプトを作成**

   `backend/scripts/migrate-print-settings.ts` を作成：

   ```typescript
   import { PrismaClient } from '@prisma/client';
   import * as fs from 'fs';
   import * as path from 'path';

   const prisma = new PrismaClient();

   async function main() {
     // 既存の positions.json を読み込み
     const settingsPath = path.join(__dirname, '../src/pedigree/pdf/positions.json');
     
     if (!fs.existsSync(settingsPath)) {
       console.log('positions.json が見つかりません。移行をスキップします。');
       return;
     }

     const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

     // グローバル設定として保存
     await prisma.pedigreePrintSetting.upsert({
       where: { globalKey: 'GLOBAL' },
       create: {
         globalKey: 'GLOBAL',
         settings: settingsData,
         version: 1,
       },
       update: {
         settings: settingsData,
         version: { increment: 1 },
       },
     });

     console.log('印刷設定の移行が完了しました。');
   }

   main()
     .catch((e) => {
       console.error(e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();
     });
   ```

2. **スクリプトを実行**

   ```bash
   cd backend
   pnpm ts-node scripts/migrate-print-settings.ts
   ```

## ✅ 移行後の確認

1. **API で設定を確認**

   ```bash
   curl http://localhost:3004/pedigrees/print-settings
   ```

2. **PDF 生成をテスト**

   実際に血統書 PDF を生成し、座標が正しく反映されているか確認します。

   ```bash
   curl http://localhost:3004/pedigrees/pedigree-id/YOUR_PEDIGREE_ID/pdf \
     --output test.pdf
   ```

3. **データベースで直接確認**

   ```sql
   SELECT id, global_key, tenant_id, version, created_at, updated_at
   FROM pedigree_print_settings;
   ```

## 🔄 ロールバック手順

万が一、移行に問題があった場合のロールバック手順：

1. **データベースから設定を削除**

   ```sql
   DELETE FROM pedigree_print_settings WHERE global_key = 'GLOBAL';
   ```

2. **古いバージョンに戻す**

   マイグレーションをロールバックする場合：

   ```bash
   cd backend
   pnpm prisma migrate resolve --rolled-back 20251219090000_add_pedigree_print_settings
   ```

   ⚠️ **警告**: これはマイグレーションを記録上ロールバック済みとマークしますが、実際のテーブルは削除されません。テーブルを削除する場合は手動で DROP してください。

## 📚 関連ドキュメント

- [DATABASE_DEPLOYMENT_GUIDE.md](./DATABASE_DEPLOYMENT_GUIDE.md) - データベース全般のデプロイガイド
- [PEDIGREE_PDF_DESIGN.md](./PEDIGREE_PDF_DESIGN.md) - 血統書 PDF の設計仕様
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## ❓ トラブルシューティング

### 設定が反映されない

- キャッシュの問題: サーバーを再起動してみてください
- API エンドポイントの確認: `/pedigrees/print-settings` にアクセス可能か確認
- ログを確認: `PrintSettingsService` のエラーログをチェック

### JSON 形式エラー

- `isPositionsConfig` バリデーションに失敗している可能性があります
- 必須フィールド（`offsetX`, `offsetY`, `breed`, `sex`, `dateOfBirth`, `catName`, `sire`, `dam`, `grandParents`, `greatGrandParents`, `fontSizes`）が存在するか確認

### テナント設定が見つからない

- `tenant_id` と `global_key` の UNIQUE 制約により、各テナントは1つの設定のみ保持できます
- グローバル設定（`global_key = 'GLOBAL'`）は、テナント固有の設定がない場合のフォールバックとして機能します

## 🎯 ベストプラクティス

1. **移行前にバックアップ**: 既存の `positions.json` をバックアップしてください
2. **段階的な移行**: まずステージング環境で移行をテストしてください
3. **バージョン管理**: 移行スクリプトは Git で管理し、再現可能にしてください
4. **テナントごとの設定**: 各テナントが独自の設定を必要とする場合、事前に要件を確認してください
