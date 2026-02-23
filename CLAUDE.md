# mycats-pro

猫管理システム（血統・繁殖・健康管理・子猫管理）のモノレポ。

- **frontend/**: Next.js 15 (App Router) / React 19 / TypeScript 5 / Mantine UI / Tailwind CSS
- **backend/**: NestJS 10 / Prisma 6 / PostgreSQL 15+
- **環境**: Node.js 20.x / pnpm 9.x / macOS + Docker Compose

## 言語ポリシー

- すべてのやり取り・コメント・ドキュメント・UI テキスト・エラーメッセージ: **日本語**
- 変数名・関数名・型名・クラス名: **英語**
- 命名規約の詳細: @docs/naming_convention_guidelines_v2.md

## コマンド

### 品質ゲート（タスク完了前に必ず実行）

- `pnpm lint` -- root + frontend + backend の lint を並列実行
- `pnpm backend:build` -- バックエンドのコンパイルチェック
- `pnpm frontend:build` -- フロントエンドの Next.js ビルド

### 開発

- `pnpm dev` -- backend (PORT=3004) → frontend (PORT=3000) の順で起動
- `pnpm dev:stop` -- 開発サーバー停止
- `pnpm dev:health` -- ヘルスチェック

### データベース（スキーマ変更時）

- `pnpm db:migrate` -- マイグレーション生成・適用
- `pnpm db:seed` -- シードデータ投入
- `pnpm prisma:studio` -- DB ビジュアルブラウザ

### テスト

- `pnpm test:e2e` -- バックエンド e2e テスト
- `pnpm --filter frontend test` -- フロントエンド単体テスト

## 型安全ポリシー（厳格）

- `any` / `unknown` 禁止 -- 型ガード / ジェネリクス / Partial / Pick / Omit を使う
- `!` 非 null アサーション禁止 -- `if (!value) return` でガード
- `as unknown as X` 二段キャスト禁止
- `@ts-ignore` / `// eslint-disable` 原則禁止 -- 根本原因を修正する
- すべての公開関数に引数・戻り値の型を明示。`Promise` は `Promise<T>` で記述
- `switch` 分岐は `never` による exhaustiveness check を実施
- API 入出力は既存 DTO / Prisma 型 / 共通 `types/` を再利用。重複定義を避ける
- 例外: 外部ライブラリの制約で不可避な場合のみ、該当行に理由・試行した代替案・影響範囲をコメントで記載

## アーキテクチャ

### Backend (NestJS)

- レイヤー順序: Controller → Service → PrismaService（レイヤーを飛ばさない）
- 入出力は DTO + `class-validator` で定義
- エラーは `HttpException` サブクラスで日本語メッセージを返す
- Prisma クエリは `select` / `include` で必要フィールドに限定し N+1 を回避

### Frontend (Next.js App Router)

- Server Components をデフォルトにする。`"use client"` は必要な場合のみ（理由をコメント）
- データフェッチはサーバー側で実行し、キャッシュ戦略（`revalidate` 等）を明示
- UI は Mantine コンポーネント優先 → Tailwind ユーティリティで補完
- `error.tsx` / `loading.tsx` をルートセグメントごとに配置
- API 呼び出しは `src/lib/api/` 経由。コンポーネント内で直接 `fetch` しない

## 変更禁止ファイル

- **自動生成**: `node_modules/`, `dist/`, `.next/`, `backend/prisma/migrations/`, `frontend/src/lib/api/generated/`
- **インフラ**（明示指示なし）: `.github/workflows/`, `cloudbuild.yaml`, `Dockerfile.*`, `docker-compose.yml`
- **環境・ロック**: `.env`, `.env.production`, `pnpm-lock.yaml`

## ワークフロー

- **型ファースト**: 型定義（interface / type / DTO / Zod schema）→ 実装 → テストの順で作業
- **最小差分**: 依頼範囲外のリファクタリング禁止。触れたファイル内の明白なバグのみ副次修正可
- **再利用優先**: 新規作成前に既存コンポーネント・サービス・DTO・API を検索し再利用を検討
- Controller に Service 依存を追加したら、対応する `*.controller.spec.ts` の `providers` も更新する
- 新規ファイルは責務が最も近いディレクトリに配置し、既存の命名規則に従う

## エラー処理

- 空の `catch` ブロック禁止
- `console.error` だけで終了させない -- 適切なエラーハンドリングを実装
- `void someAsync()` の放置禁止 -- エラーを必ず処理
- バックエンド: NestJS 例外フィルタ (`HttpException`, `BadRequestException` 等) + ロガー
- フロントエンド: ユーザー向けに日本語のエラーメッセージをトースト / バナーで表示

## 参照ドキュメント

- サブディレクトリの `CODE_GUIDE.md` がある場合、そのローカル規約を本ファイルより優先する
- 公式ドキュメントと本ファイルが矛盾した場合は公式仕様を優先し、差分理由をコメントで共有する
