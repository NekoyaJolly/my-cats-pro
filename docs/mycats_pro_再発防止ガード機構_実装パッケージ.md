# mycats-pro 再発防止ガード機構 実装パッケージ

本ドキュメントは、開発以来初めて発生した重大インシデントを受け、**同種の事故を二度と起こさない**ことを目的として整備した AI ガード機構一式をまとめたものです。

この内容は、そのまま **次の AI エージェントへ渡す実行指示書**として利用できる粒度で記述されています。

---

## 1. 作成ファイル一覧と概要

| ファイルパス | 目的・概要 |
|---|---|
| `.github/ai-checklist.md` | AI が作業完了を宣言する前に必ず実行する自己検証チェックリスト |
| `.github/guards/package-added-guard.md` | `pnpm add` 実行時に AI が必ず踏む手順を定義するガイド |
| `.github/staged-verification.md` | 実装フェーズごとの段階的検証ポイント定義 |
| `.github/user-feedback-priority.md` | ユーザーフィードバックを最優先で扱うための判断基準 |
| `AGENTS.md`（更新） | 型安全例外条項の厳格化（any / unknown 使用条件の明文化） |
| `.github/copilot-instructions.md`（更新） | Copilot / AI 共通の型安全例外ルール統一 |

---

## 2. タスク1: AI 自己検証チェックリスト

**ファイル:** `.github/ai-checklist.md`

```markdown
# AI エージェント 自己検証チェックリスト

## 📋 作業開始前チェック

- [ ] 関連する CODE_GUIDE.md / AGENTS.md を読み込み済み
- [ ] 既存の類似実装を検索済み（再利用可能性を確認）
- [ ] 影響範囲のファイルと依存関係を特定済み

## 🔧 実装中チェック（ファイル単位）

- [ ] 新規ファイル作成時: 配置ディレクトリが責務に適合
- [ ] 型定義: any/unknown を使用していない（例外時は理由コメント + 代替案検討済み）
- [ ] 関数: 引数・戻り値の型が完全に明示
- [ ] Prisma: スキーマ変更時は `pnpm prisma:generate` 実行済み
- [ ] パッケージ追加時: `pnpm prisma:generate` 実行済み（Prisma Client 再生成）
- [ ] エラー処理: 空 catch / console.error のみ / void async がない

## ✅ 機能完成時チェック

- [ ] 影響範囲のテストを実行: `pnpm test`（該当モジュール）
- [ ] Lint チェック: `pnpm lint` で警告・エラーゼロ
- [ ] ビルド確認: `pnpm build`（backend / frontend）成功
- [ ] Prisma 変更時: `pnpm db:migrate` + `pnpm db:seed` で動作確認

## 🚨 ユーザーフィードバック優先度

- [ ] ユーザーの調査示唆は即座に方針へ反映
- [ ] エラー・警告指摘時は他作業を中断
- [ ] AI 判断とユーザー指示が矛盾した場合は必ずユーザーを優先

## 📝 作業完了前の最終確認

- [ ] すべての品質ゲートを PASS（lint / build / test）
- [ ] 日本語 UI 要件を満たす（メッセージ・コメント）
- [ ] 型安全性: any / unknown / 非 null アサーション / 二段キャストなし
- [ ] ドキュメント更新（README / 設計資料）
- [ ] 変更理由と影響範囲を説明可能

## 📎 証跡提示（必須）

- [ ] 実行したコマンドと結果ログ、または CI 実行 URL を提示
```

---

## 3. タスク2: パッケージ追加時の自動ガイド

**ファイル:** `.github/guards/package-added-guard.md`

```markdown
# パッケージ追加時の必須手順

## 1. インストール直後

```bash
pnpm install
pnpm prisma:generate
```

理由: node_modules 更新により Prisma Client の依存関係が変化する可能性があるため

## 2. 型チェック

```bash
pnpm --filter backend run build
pnpm --filter frontend run build
```

## 3. Lint チェック

```bash
pnpm lint
```

## 4. 依存関係の確認

- package.json の diff 確認
- pnpm-lock.yaml 更新確認
- `pnpm audit` による脆弱性チェック

## ルール

- いずれかで失敗した場合、次工程へ進まない
- 原因解決を最優先とする
```

---

## 4. タスク3: 型安全例外条項（AGENTS.md / copilot-instructions.md）

```markdown
`any` / `unknown` の使用は禁止。

【例外条件（すべて必須）】
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
```

---

## 5. タスク4: 段階的検証ポイント

**ファイル:** `.github/staged-verification.md`

```markdown
# 段階的検証ポイント

## Stage 1: ファイル変更時

```bash
pnpm lint
```

## Stage 2: 機能単位完成時

```bash
pnpm --filter <package> run test
pnpm --filter <package> run build
```

## Stage 3: PR 前最終検証

```bash
pnpm lint
pnpm backend:build
pnpm frontend:build
pnpm db:migrate
pnpm db:seed
pnpm dev:health
```

## 禁止事項

- エラーを残したまま次工程へ進む
- 後回し前提のコミット
```

---

## 6. タスク5: ユーザーフィードバック優先度マトリクス

**ファイル:** `.github/user-feedback-priority.md`

```markdown
# ユーザーフィードバック優先度マトリクス

## 🔴 Critical

- エラー・警告報告
- 調査示唆
- CI/CD 失敗

対応: 作業中断 → 調査方針変更 → 報告

## 🟡 High

- 機能変更要望
- パフォーマンス・セキュリティ懸念

## 🟢 Normal

- ドキュメント改善
- UI/UX 提案

## NG パターン

ユーザー示唆を独自判断で無視すること
```

---

## 7. 再発防止の確認方法

- AI は `.github/ai-checklist.md` を完了しない限り作業完了を宣言できない
- package.json 変更時は必ず package-added-guard を適用
- ユーザー指摘は priority マトリクスに従い処理
- CI の成功ログを最終証跡とする

---

## 8. 次の AI エージェントへの引き渡し方

このドキュメントを **そのままプロンプトとして渡す**。
追加指示や省略は行わず、ここに記載されたルールを最優先で遵守させること。

