# mycats-pro Copilot Instructions

## ガイド概要

- 本書はルート `AGENTS.md` と `GEMINI.md` の内容を統合した、mycats-pro 専用の AI コーディングエージェント向け包括ガイドです。Copilot / Gemini / そのほかの LLM は本ドキュメントを唯一の参照として利用してください。
- 元の `AGENTS.md` が定義するプロジェクト規約が依然として唯一のソースです。本書は重複していた指示を整理しつつ、Gemini 固有の運用ヒントも同じ場所で確認できるよう再編しています。
- 参照した公式情報：
  - 最終更新 2025-11-18 UTC: [Gemini API ドキュメント](https://ai.google.dev/gemini-api/docs) — モデル一覧、利用可能なツール、レートリミット、セキュリティポリシー。
  - [プロンプト設計戦略](https://ai.google.dev/gemini-api/docs/prompting-strategies) — 指示の構造化、少数ショット例、長文コンテキスト制御、Gemini 3 での推奨温度設定など。
  - 最終更新 2025-11-26 UTC: [GitHub Copilot Coding Agent Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results) — タスク設計、カスタム指示、エージェント活用。
- 公式ドキュメントより新しい指針を適用する場合は、根拠 URL と最終更新日を本書に追記し、`AGENTS.md` / `GEMINI.md` と内容を同期させてください。

## 専門エージェント

このプロジェクトでは、タスクに応じて専門化されたエージェントを活用できます：

- **Backend Agent** (`.github/agents/backend-agent.md`) - NestJS + Prisma + PostgreSQL の専門家
- **Frontend Agent** (`.github/agents/frontend-agent.md`) - Next.js + React + Mantine の専門家
- **Documentation Agent** (`.github/agents/docs-agent.md`) - ドキュメント作成・保守の専門家
- **Test Agent** (`.github/agents/test-agent.md`) - テスト作成・カバレッジ向上の専門家

各エージェントは特定のドメインに特化しており、より的確なサポートを提供します。タスクに応じて適切なエージェントを参照してください。

## パス固有の指示

以下のディレクトリには専用の指示ファイルがあります：

- `backend/**` → `.github/instructions/backend.instructions.md`
- `frontend/**` → `.github/instructions/frontend.instructions.md`
- `**/*.md` → `.github/instructions/docs.instructions.md`

## Gemini 固有の運用ヒント

### 1-1. プロンプトとコンテキストの構造
- `role/context/task/output` など **明示的なセクション** を用いてプロンプトをタグ付けします。例: `<context>…</context>`, `## Instructions`。
- 重要な制約・日本語 UI 要件・型安全ポリシーはシステム指示（最上位ブロック）にまとめ、ユーザー入力の後では上書きしない。
- 少数ショット（few-shot）例を 1〜3 件添え、成功フォーマットを固定。Gemini ドキュメントでは一貫した例構造が推奨されています。
- 長文ドキュメントを渡すときは `[context] → [指示]` の順に配置し、「上記の情報に基づいて…」のようなアンカーフレーズを挿入。

### 1-2. モデル選定とパラメータ
- コード生成や厳密な推論は `gemini-2.5-pro` または `gemini-3.0-pro`（利用可能な場合）を既定とし、軽量応答は `gemini-2.5-flash` を検討。
- Gemini 3 系では温度 `1.0` を保つことが公式で推奨されています。確定性を上げたい場合は `topK=1, topP<=0.6` を優先的に調整し、温度操作は最終手段とする。
- `max_output_tokens` は期待するレスポンス長に応じて明示設定（例: 設計書要約は 1024、ログ要約は 512）。

### 1-3. セーフティとフォールバック
- 公式 Usage Policies を満たすよう、違反リスクのある入力を検知したら PR/Issue を参照する指示にフォールバック。Gemini が安全フィルタで停止した場合は温度を上げる前に入力を再構成。
- ファイル／URL 参照を行うときは `files API` や `URL context` の利用を明示し、社内機密はローカルパス経由で扱う。

### 1-4. レスポンス検証
- 公式テンプレートに倣い、`Plan → Execute → Validate → Format` の 4 ステップで思考を整理。最終レスポンス前に「依頼の意図」「日本語 UI」「品質ゲート」の 3 点チェックを行う。
- 出力形式（Markdown 見出し、表、JSON 等）はプロンプトで指定し、`stop_sequences` が必要な場合は PRD 通りに設定。

---

## 0. クイックリファレンス

### 0-1. セットアップ & 起動

- `pnpm install` / `pnpm install:all`: ルートで依存関係を同期。Node.js 20.x + pnpm 9.x を使用。
- `pnpm setup`: `scripts/setup-dev.sh` を呼び出し、初回セットアップと環境変数チェックを実施。
- `pnpm dev` / `pnpm dev:stable`: `backend:dev` (PORT=3004) → `frontend:dev` (PORT=3000) → `prisma:sync` の順で立ち上げ。停止は `pnpm dev:stop`。
- DB 操作: `pnpm db:migrate`, `pnpm db:seed`, `pnpm prisma:studio`。PostgreSQL 15+ を前提。

### 0-2. テスト / 静的解析

- ルート品質ゲート: `pnpm lint`（`lint:root`, `lint:backend`, `lint:frontend` を並列実行）。
- バックエンド: `pnpm --filter backend run test:e2e -- --passWithNoTests`、`pnpm backend:build`。
- フロントエンド: `pnpm frontend:lint`, `pnpm frontend:build`。
- 軽量ヘルスチェック: `pnpm dev:health`、API 煙テスト `pnpm api:smoke`。

### 0-3. PR 前セルフチェック

1. `pnpm lint` → `pnpm backend:build` → `pnpm frontend:build`。
2. `pnpm db:migrate` + `pnpm db:seed` でスキーマ差分を検証（Prisma 変更時）。
3. 必要に応じて `pnpm test:e2e`、`pnpm frontend:test`（存在時）を追加実行。
4. `pnpm dev:health` が 200 を返すことを確認。

記載されたコマンドはエージェントが自動で実行する可能性があります。失敗時は原因調査と再実行を行ってください。

---

## 1. 言語設定とコミュニケーション

- 本プロジェクトは **日本語 UI / ドキュメント** を前提とし、やり取りも日本語で統一。
  - チャット、レビュー、PR 説明: すべて日本語で回答。
  - コードコメント / README / 設計資料: 日本語で記述。
  - エラーメッセージ: 可能な限り日本語で表示し、開発者向けログも日本語コメントを添付。
- 変数名 / 関数名 / 型名は国際慣習に従い英語で統一。
- 機械翻訳感を避け、簡潔で実務的な日本語を心掛ける。

---

## 2. このファイルの目的

- mycats-pro で動く **AI コーディングエージェント専用の行動規範 + プロンプトテンプレート**。
- 目標:
  1. エージェントが最短でプロジェクト背景と開発フローを理解すること。
  2. Next.js / NestJS / Prisma 公式ベストプラクティスに沿った、安全で一貫性のある変更を行うこと。
  3. 型安全・最小差分・再利用優先で、不要な破壊的変更やノイズを防ぐこと。

---

## 3. 技術スタックと前提

- フロントエンド: Next.js 15 (App Router + React Server Components) / React 19 / TypeScript 5 / Mantine / Tailwind CSS。
- バックエンド: NestJS 10 / Prisma 6.14.0 / PostgreSQL 15+。
- 開発環境: Node.js 20.x / pnpm 9.x / macOS + Docker Compose（ローカル DB）。
- 公式ドキュメントと本ファイルが矛盾した場合は **公式仕様を優先** し、差分理由をコメントで共有してください。

---

## 4. プロジェクト構造と参照ガイド

- `frontend/`: App Router 配下のページは `src/app/**/page.tsx`。共有 UI は `src/components/` に集約。
- `backend/`: NestJS モジュールが `src/**` に縦割りで配置。Prisma スキーマは `prisma/schema.prisma`、マイグレーションは `prisma/migrations/`。
- `docs/`, `DATABASE_*.md`: システム構成・ER 図・運用ドキュメント。
- 命名規約: `docs/naming_convention_guidelines_v2.md` を常に参照し、命名方針の更新があれば本ファイルとセットで反映。
- `scripts/`, `nginx/`, `docker-compose.yml`: 開発・配布スクリプトとインフラ定義。
- **配置ルール**: 新規ファイルは責務が最も近いディレクトリへ置き、既存命名規則に従うこと。

### 4-1. フォルダ専用ガイド (`CODE_GUIDE.md`)

- 主要フォルダにはローカルルールをまとめた `CODE_GUIDE.md` を設置済。
- 変更対象の直下に該当ファイルがある場合は **必読**。ここで定義されたローカル規約は本ファイルより優先される。

### 4-2. 境界 - 変更してはいけないもの

以下のファイル・ディレクトリは **絶対に変更・削除してはいけません**：

- **自動生成ファイル**:
  - `node_modules/**` - 依存関係
  - `dist/**`, `.next/**` - ビルド成果物
  - `backend/prisma/migrations/**` - データベースマイグレーション（手動編集禁止）
  - `frontend/src/lib/api/generated/**` - OpenAPI 自動生成型

- **設定ファイル** (必要な場合のみ慎重に変更):
  - `.env`, `.env.production` - 機密情報
  - `pnpm-lock.yaml` - ロックファイル
  - `docker-compose.yml` - インフラ設定
  - `nginx/nginx.conf` - Web サーバー設定

- **CI/CD とデプロイ** (明示的な指示がない限り変更禁止):
  - `.github/workflows/**` - GitHub Actions
  - `cloudbuild.yaml` - GCP ビルド設定
  - `Dockerfile.*` - コンテナ設定

- **データベース**:
  - 既存のマイグレーションファイルは編集不可
  - スキーマ変更は新規マイグレーションで対応

このプロジェクトでは、上記の境界を守ることでシステムの安定性と再現性を保証しています。

---

## 5. AGENTS.md の読み方 / 運用

- ルート `AGENTS.md` は共通ルール。必要に応じてサブディレクトリに追加の `AGENTS.md` を配置してもよい（最も近いファイルが優先される）。
- 変更を加えたら必ず本ファイルを最新の状態に保ち、PR 説明にも更新内容を記載。
- 他ツール（Aider / Gemini CLI 等）と併用する場合もファイル名は `AGENTS.md` に統一する。
- ルールとユーザー指示に矛盾が発生した場合は、作業を中断してユーザーに優先順位（どちらを採用するか）を確認し、判断を得てから再開する。

---

## 6. 作業フローと品質ゲート

1. **調査**: 関連ファイル・既存実装・`CODE_GUIDE.md` を確認。既存テストや型定義を先に把握する。
2. **タイプファースト**: 変更内容に対する型 (`interface / type / DTO / Zod schema`) を更新 → 実装 → テストの順で作業。
3. **自動化チェック**: 変更に影響するテスト / Lint / 型チェックを即時実行し、失敗を解消。
4. **自己レビュー**: 影響範囲、例外処理、翻訳の整合性、doc 更新を確認。

補足（ユニットテストの再発防止）:
- Controller のコンストラクタ依存（注入する Service）を追加・変更した場合、対応する `*.controller.spec.ts` の `Test.createTestingModule` の `providers`（または `overrideProvider`）も必ず追随させる。

最低限、以下の品質ゲートを PASS させてから作業完了とする:

- `pnpm lint`（root + frontend + backend）。
- 影響したパッケージの `pnpm build` / `pnpm test`。
- Prisma 変更時は `pnpm db:migrate` + `pnpm db:seed` で再現確認。

---

## 7. 型安全ポリシー（厳格版）

- `any` / `unknown` の使用は禁止。ライブラリの制約で不可避な場合のみ、**該当行に理由コメントを記載**し、型ガードやジェネリクスで露出を局所化する。
- 非 null アサーション（`!`）は禁止。nullable を扱う際はガードや `if (!value) return` で安全に扱う。
- 乱暴な二段キャスト（`value as unknown as X`, `as any`）は禁止。必要な場合は型ガード・判定ロジックを実装。
- `// eslint-disable` / `@ts-ignore` は原則禁止。やむを得ない場合は 1 行限定 + 理由コメント。
- ESLint / tsconfig の設定で型エラーを黙殺することは禁止。エラー原因をコードで解決する。
- すべての公開関数・クラスは引数・戻り値を完全に型定義。`Promise` 関数は `Promise<ResultType>` を明示。
- 分岐は可能な限り **exhaustiveness check** を実施（`switch` + `never`）。
- API 入出力は既存 DTO / Prisma 型 / 共通 `types/` を再利用。重複定義を避け、型が足りない場合は共通場所に追加してから使用する。

---

## 8. エラー処理とロギング

- 空の `catch`、`console.error` のみで終了、`void someAsync()` の放置は禁止。
- バックエンド: NestJS の例外フィルタ (`HttpException`, `BadRequestException`, カスタム例外) とロガーを使用。
- フロントエンド: ユーザー向けに日本語のエラーメッセージを表示し、必要に応じてトースト/バナーなどで状態管理。
- `unknown` なエラーは型ガードで分類し、必要なら `instanceof` 判定やステータスコードで分岐。

---

## 9. 変更スコープと再利用

- 依頼範囲以外の大規模リファクタリングは禁止。触れたファイル内の明らかな不具合のみ副次的に修正可。
- 既存の API / DTO / UI コンポーネント / サービスをまず探索し、再利用できないか確認する。
- 同じロジックを複製せず、抽象化または共通化を検討。重複が必要そうな場合は根拠をコメントで説明。

---

## 10. Next.js（App Router）ガイド

1. `frontend/src/app` 配下で App Router 規約（`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` 等）を遵守。
2. サーバーコンポーネント優先。`use client` は最小限にし、`client` を付ける理由をコメントで共有。
3. データフェッチはサーバー側で実行し、`fetch` のキャッシュ戦略（`revalidate` 等）を明示。
4. フォーム/ミューテーションはサーバーアクション or API Route を活用し、CSRF・バリデーションを考慮。

---

## 11. NestJS + Prisma ガイド

1. Controller → Service → Repository/Prisma のレイヤーを守り、Controller で直接 Prisma を呼ばない。
2. DTO + `class-validator` で入出力を定義。レスポンス整形用の Presenter / Serializer を導入してもよい。
3. Prisma クエリは `select` / `include` で必要なフィールドに限定し、N+1 を避ける。
4. `schema.prisma` 変更時はマイグレーションを生成し、影響範囲（破壊的か否か）を PR で説明。

---

## 12. Dev Environment Tips

- `pnpm help` で利用可能な主要スクリプトを一覧確認できる。
- `scripts/` 配下のシェルスクリプト（例: `start-dev-stable.sh`, `preflight-backend.sh`）は macOS + zsh 前提。必要に応じて `chmod +x` 済か確認。
- ローカル DB 初期化は `init_database.sql` / `seed_data.sql` を参照。Docker Compose で `database/init` が自動適用される。

---

## 13. AI への依頼テンプレート

### 13-1. 機能追加リクエスト

```
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
- 機能概要: （ここに概要を書く）
- 対象画面 / API: （例: frontend/src/app/cats, backend/src/cats など）

【必ず守ってほしいこと】
- any/unknown / 非 null アサーションは禁止。型定義 → 実装 → テストの順で更新。
- エラー処理は Next.js / NestJS のベストプラクティスに従い、日本語メッセージを返す。
- 無関係なリファクタリングを避け、既存の似た実装を再利用。

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. 主要なコード変更点 + 型安全性のポイント
3. 追加 / 更新したテストと意図
4. 実行したコマンドと再現手順（pnpm ベース）
```

### 13-2. バグ修正リクエスト

```
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js / NestJS / Prisma のベストプラクティスと AGENTS.md に従って、以下のバグを修正してください。

【バグ内容】
- 現象: （何がどうおかしいか）
- 再現手順: （URL, 操作手順など）
- 期待する挙動: （どうなっていてほしいか）

【制約】
- 修正範囲を原因箇所周辺に限定し、any/unknown を使わずに解決。
- `@ts-ignore` や `eslint-disable` を使わない。どうしても必要なら理由と撤去メモを残す。
- 再発防止テストを追加（ユニット or e2e）。

【出力してほしいこと】
1. 想定原因と根拠
2. 修正ファイルと変更概要
3. 追加 / 更新したテスト内容
4. 再現確認と回帰確認に使用したコマンド
```

---

## 14. 期待する回答スタイル

- 日本語で簡潔かつ情報密度の高い説明を行う。無駄な前置きや感想を省き、事実と手順を優先。
- mycats-pro 固有の文脈に紐づけて説明し、一般論だけで終わらせない。
- コードは必要最小限の抜粋に留め、パス・関数名を明示。
- 可能な限りテスト戦略と実行コマンドを併記し、品質ゲートを明文化。
