
# mycats-pro AGENTS ガイドライン

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
- 変更対象の直下に該当ファイルがある場合は **必読**。ここで定義されたローカル規約は本ファイルより優先。

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

### 7-1. any / unknown 例外条件（すべて必須）

1. 外部ライブラリの型定義が実態と異なり修正不能
2. 以下の代替案をすべて試行し失敗:
   - 型ガード
   - Partial / Pick / Omit
   - ジェネリクス
   - 型アサーション
   - ライブラリ更新・代替検討
3. 該当行に以下を必ず記載:
   - 試行した代替案と結果
   - any 使用理由
   - 影響範囲最小化方法

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

```text
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

```text
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

---

## 15. Gemini MCP Server の活用 (Code Analysis)

本プロジェクトには、Google Drive 上の最新コードベースを知識源とする Gemini MCP Server (`gemini-drive-mcp`) が統合されています。
Antigravity (Agent) は、以下のシナリオで積極的にこのツールを活用してください。

1. **仕様の確認**: 「現在の実装はどうなっているか？」とユーザーに聞かれた場合、`analyze_codebase` を使用してコードから仕様を逆引きする。
2. **影響範囲の調査**: リファクタリングや機能追加の際、関連するファイルや依存関係を網羅的に把握するために使用する。
3. **矛盾の検知**: 新しい実装方針が、既存のドメイン設計（Breeding, Care, Settingsなど）と矛盾しないか検証をする。

**利用方法**:
- ツール名: `analyze_codebase`
- プロンプト例: 「繁殖スケジュール機能のDBスキーマ設計と、フロントエンドの実装状況を教えて」

---
