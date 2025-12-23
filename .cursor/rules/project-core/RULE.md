---
description: "mycats-pro プロジェクト全体の共通ルール（言語、型安全、品質ゲート）"
alwaysApply: true
---

# mycats-pro プロジェクト共通ルール

## 言語設定とコミュニケーション

- 本プロジェクトは **日本語 UI / ドキュメント** を前提とし、やり取りも日本語で統一
  - チャット、レビュー、PR 説明: すべて日本語で回答
  - コードコメント / README / 設計資料: 日本語で記述
  - エラーメッセージ: 可能な限り日本語で表示
- 変数名 / 関数名 / 型名は国際慣習に従い英語で統一
- 機械翻訳感を避け、簡潔で実務的な日本語を心掛ける

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router + RSC) / React 19 / TypeScript 5 / Mantine / Tailwind CSS
- **バックエンド**: NestJS 10 / Prisma 6.14.0 / PostgreSQL 15+
- **開発環境**: Node.js 20.x / pnpm 9.x

## 型安全ポリシー（厳格版）

### 禁止事項

- `any` / `unknown` の使用禁止（例外は理由コメント必須）
- 非 null アサーション（`!`）禁止 → ガードで安全に扱う
- 二段キャスト（`value as unknown as X`）禁止
- `// eslint-disable` / `@ts-ignore` 原則禁止

### any/unknown 例外条件（すべて必須）

1. 外部ライブラリの型定義が実態と異なり修正不能
2. 以下の代替案をすべて試行し失敗:
   - 型ガード / Partial / Pick / Omit / ジェネリクス / 型アサーション
3. 該当行に記載必須:
   - 試行した代替案と結果
   - any 使用理由
   - 影響範囲最小化方法

### 必須事項

- すべての公開関数・クラスは引数・戻り値を完全に型定義
- `Promise` 関数は `Promise<ResultType>` を明示
- 分岐は可能な限り exhaustiveness check を実施（`switch` + `never`）
- API 入出力は既存 DTO / Prisma 型 / 共通 `types/` を再利用

## エラー処理とロギング

- 空の `catch`、`console.error` のみで終了、`void someAsync()` の放置は禁止
- バックエンド: NestJS の例外フィルタ（HttpException 系）とロガーを使用
- フロントエンド: ユーザー向けに日本語のエラーメッセージを表示

## 変更スコープと再利用

- 依頼範囲以外の大規模リファクタリングは禁止
- 既存の API / DTO / UI コンポーネント / サービスをまず探索し、再利用
- 同じロジックを複製せず、抽象化または共通化を検討

## クイックリファレンス

### セットアップ & 起動

```bash
pnpm install          # 依存関係を同期
pnpm dev              # 開発サーバー起動（backend:3004, frontend:3000）
pnpm dev:stop         # 停止
```

### 品質ゲート（PR 前必須）

```bash
pnpm lint             # root + frontend + backend の Lint
pnpm backend:build    # バックエンドビルド
pnpm frontend:build   # フロントエンドビルド
```

### DB 操作

```bash
pnpm db:migrate       # マイグレーション適用
pnpm db:seed          # シードデータ投入
pnpm prisma:studio    # Prisma Studio 起動
```

## 変更してはいけないもの

### 自動生成ファイル

- `node_modules/**`
- `dist/**`, `.next/**`
- `backend/prisma/migrations/**`（手動編集禁止）
- `frontend/src/lib/api/generated/**`

### 設定ファイル（慎重に変更）

- `.env`, `.env.production`
- `pnpm-lock.yaml`
- `docker-compose.yml`

### CI/CD（明示的指示がない限り変更禁止）

- `.github/workflows/**`
- `cloudbuild.yaml`
- `Dockerfile.*`

## 作業フロー

1. **調査**: 関連ファイル・既存実装・CODE_GUIDE.md を確認
2. **タイプファースト**: 型定義 → 実装 → テストの順で作業
3. **自動化チェック**: 変更に影響するテスト / Lint / 型チェックを即時実行
4. **自己レビュー**: 影響範囲、例外処理、翻訳の整合性を確認

## 期待する回答スタイル

- 日本語で簡潔かつ情報密度の高い説明
- mycats-pro 固有の文脈に紐づけて説明
- コードは必要最小限の抜粋、パス・関数名を明示
- テスト戦略と実行コマンドを併記

