---
paths:
  - "backend/prisma/**"
---

# Prisma ルール

## スキーマ

- `backend/prisma/schema.prisma` が DB 型のソースオブトゥルース
- Model 名: PascalCase (`Cat`, `BreedingRecord`)
- フィールド名: camelCase (`createdAt`, `tenantId`)
- DB カラム名: snake_case にマッピング (`@map("created_at")`, `@@map("breeding_records")`)
- 主キーは UUID (`@id @default(uuid())`)
- タイムスタンプ: `createdAt DateTime @default(now()) @map("created_at")` + `updatedAt DateTime @updatedAt @map("updated_at")`

## マルチテナンシー

- ほぼ全テーブルに `tenantId` が必須 -- 新規モデル追加時も必ず含める
- クエリには常に `tenantId` 条件を含める

## マイグレーション

- `prisma/migrations/` のファイルは自動生成 -- **手動編集禁止**
- スキーマ変更後: `pnpm db:migrate` → `pnpm db:seed` で検証
- PR で破壊的変更（カラム削除・型変更等）か追加的変更かを説明する
- インデックスは外部キーと頻繁にクエリされるフィールドに設定

## リレーション

- リレーションフィールドには必ず逆参照を定義
- `select` / `include` で取得フィールドを明示し、不要なデータを読み込まない
