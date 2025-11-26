# GitHub Copilot Instructions 構造ガイド

このディレクトリには、GitHub Copilot Coding Agent の動作を制御する指示ファイルが含まれています。

## ファイル構造

```
.github/
├── copilot-instructions.md          # メイン指示ファイル
├── agents/                           # 専門エージェント定義
│   ├── backend-agent.md             # NestJS/Prisma 専門
│   ├── frontend-agent.md            # Next.js/React 専門
│   ├── docs-agent.md                # ドキュメント専門
│   └── test-agent.md                # テスト専門
└── instructions/                     # パス固有の指示
    ├── backend.instructions.md      # backend/** 用
    ├── frontend.instructions.md     # frontend/** 用
    └── docs.instructions.md         # **/*.md 用
```

## 主要ファイル

### copilot-instructions.md
プロジェクト全体の共通指示。すべての AI コーディングエージェントが最初に参照するファイル。

**含まれる内容:**
- 技術スタック概要
- 言語設定（日本語優先）
- 型安全ポリシー
- 作業フロー
- 品質ゲート

### agents/
タスクに特化した専門エージェント定義。

#### backend-agent.md
- **対象**: NestJS、Prisma、PostgreSQL
- **専門領域**: API 設計、ビジネスロジック、DB スキーマ
- **主要原則**: レイヤリング、DTO パターン、型安全

#### frontend-agent.md
- **対象**: Next.js、React、Mantine UI
- **専門領域**: UI/UX、Server Components、状態管理
- **主要原則**: Server Component ファースト、アクセシビリティ

#### docs-agent.md
- **対象**: すべてのドキュメント
- **専門領域**: README、セットアップガイド、技術資料
- **境界**: ソースコードは変更しない

#### test-agent.md
- **対象**: ユニット、統合、E2E テスト
- **専門領域**: Jest、Supertest、Testing Library
- **目標**: カバレッジ 80%以上

### instructions/
パス固有のルールを定義。特定のディレクトリで作業する際に自動適用。

#### backend.instructions.md
```yaml
applyTo: "backend/**"
```
バックエンド専用のアーキテクチャ、型安全、Prisma ルール。

#### frontend.instructions.md
```yaml
applyTo: "frontend/**"
```
フロントエンド専用の React/Next.js、UI/UX、スタイリングルール。

#### docs.instructions.md
```yaml
applyTo: "**.md"
excludeAgent: "coding-agent"
```
ドキュメント専用。コーディングエージェントを除外し、ドキュメントエージェントのみ適用。

## 使い方

### Copilot への指示例

```markdown
@backend-agent
猫の新しい API エンドポイントを追加してください。
GET /api/v1/cats/:id/relatives で親子関係を取得します。
```

```markdown
@frontend-agent
猫一覧ページにフィルター機能を追加してください。
品種、色、年齢でフィルタリングできるようにします。
```

```markdown
@docs-agent
新しいセットアップ手順を SETUP_GUIDE.md に追加してください。
Redis のインストールと設定について記述します。
```

```markdown
@test-agent
CatsService の新しいメソッドのテストを追加してください。
正常系と異常系の両方をカバーします。
```

### パス固有の自動適用

`backend/` ディレクトリで作業すると、自動的に `backend.instructions.md` のルールが適用されます。

```typescript
// backend/src/cats/cats.service.ts
// この場所では backend.instructions.md のルールが適用される
// - Controller で直接 Prisma を呼ばない
// - any/unknown 禁止
// - 日本語エラーメッセージ
```

## ベストプラクティス

### 1. タスクを明確に定義
```markdown
悪い例: 猫機能を改善して
良い例: 猫一覧ページに品種フィルター（ドロップダウン）を追加し、
       選択時に API を呼び出してフィルタリングされた結果を表示
```

### 2. 適切なエージェントを選択
- バックエンド API → `@backend-agent`
- フロントエンド UI → `@frontend-agent`
- ドキュメント → `@docs-agent`
- テスト追加 → `@test-agent`

### 3. 境界を明確に
各エージェントは特定の領域のみを変更します：
- Backend Agent: `backend/src/**`
- Frontend Agent: `frontend/src/**`
- Documentation Agent: `**/*.md` のみ
- Test Agent: `**/*.spec.ts`, `**/*.test.tsx`

### 4. 品質ゲートを必ず通す
変更後は必ず実行：
```bash
pnpm lint
pnpm backend:build
pnpm frontend:build
pnpm test:e2e
```

## 更新ガイド

### エージェント定義を更新する場合
1. 該当する `agents/*.md` を編集
2. YAML フロントマター（name, description, commands, boundaries）を更新
3. コード例を追加・更新
4. 品質チェックリストを見直し

### パス固有指示を更新する場合
1. 該当する `instructions/*.instructions.md` を編集
2. YAML フロントマター（applyTo, excludeAgent）を確認
3. 必須ルール、コマンド、コード例を更新
4. 変更してはいけないファイルリストを見直し

### メイン指示を更新する場合
1. `copilot-instructions.md` を編集
2. 専門エージェント・パス固有指示との整合性を確認
3. ルート `AGENTS.md` との同期を確認

## 参考資料

- [GitHub Copilot Coding Agent ベストプラクティス](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [カスタム指示のドキュメント](https://github.blog/changelog/2025-07-23-github-copilot-coding-agent-now-supports-instructions-md-custom-instructions/)
- [効果的な agents.md の書き方](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

## トラブルシューティング

### Copilot が指示を認識しない
- `copilot-instructions.md` のフォーマットを確認
- YAML フロントマターの構文エラーをチェック
- ファイルパスが正しいか確認

### エージェントが適切に動作しない
- タスクが明確に定義されているか確認
- 適切なエージェントを指定しているか確認
- 境界を超えた作業を依頼していないか確認

### パス固有指示が適用されない
- `applyTo` のパスパターンを確認
- グロブパターンが正しいか確認
- `excludeAgent` の設定を確認

## フィードバック

指示ファイルの改善提案は Issue または PR でお願いします。
