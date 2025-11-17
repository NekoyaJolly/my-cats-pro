# mycats-pro Frontend AGENTS ガイドライン

## 0. クイックリファレンス

- ルートで `pnpm install` 済みであれば `cd frontend && pnpm install` のみで依存同期。
- 開発サーバー: `pnpm --filter frontend dev`（PORT=3000、`pnpm dev` でも backend 起動待ちを考慮）。
- ビルド / 本番起動: `pnpm --filter frontend build` → `pnpm --filter frontend start`。
- Lint / 型チェック: `pnpm --filter frontend lint`, `pnpm --filter frontend type-check`。
- テスト: `pnpm --filter frontend test`（Jest） / `pnpm --filter frontend test:watch`。
- OpenAPI 型更新: ルートで backend の Swagger 生成後、`pnpm --filter frontend generate:api-types`。

## 1. このファイルの目的と優先度

- フロントエンド配下で作業する AI エージェントに対し、App Router、React 19、Mantine、Tailwind、Zustand/TanStack Query といった技術スタック固有のルールを明示。
- ルート `AGENTS.md` の共通方針に加えて、フロント特化のベストプラクティスを提供し、タスクあたりの認識齟齬を最小化。
- もっとも近い `AGENTS.md` が優先されるため、frontend 配下では本ファイルの指示がルートより上書きされる。

## 2. 技術スタックと参照ドキュメント

| 領域 | バージョン / ツール | 公式ドキュメント |
| --- | --- | --- |
| Next.js App Router | 15.x (React Server Components) | [Docs](https://nextjs.org/docs/app) |
| React | 19.x | [React Learn](https://react.dev/learn) |
| UI | Mantine 8.x / Tailwind CSS 4.x | [Mantine](https://mantine.dev) / [Tailwind Docs](https://tailwindcss.com/docs) |
| 状態管理 | TanStack Query + Zustand | [TanStack Query](https://tanstack.com/query/latest) |
| 型 | TypeScript 5.x (strict) | [TypeScript Docs](https://www.typescriptlang.org/docs) |

> 公式ドキュメントと矛盾した場合は公式を優先し、差分をコメントか PR 説明で共有すること。

## 3. 言語設定とコミュニケーション

- すべての対話・コメント・ドキュメントは日本語。ユーザ向け UI 文言も日本語で統一。
- 変数・関数・型名は英語で命名。テスト名は「日本語説明 + 英語識別子」の併記可。
- エラーメッセージは日本語を優先し、ログに技術的補足を付ける。

## 4. ディレクトリ / 依存ファイルの読み方

- `src/app/**`: App Router のページ・レイアウト・Server Actions。`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` を Next.js ファイル規約に従い配置。
- `src/components/**`: 再利用 UI。新規コンポーネント追加時は既存の `AppLayout`, `TagSelector` など類似実装を再利用。
- `src/lib/api/**`: OpenAPI 生成型 (`generated/`) と手書きクライアント (`client.ts`)。API 呼び出しはここ経由。
- `src/styles/**`: Tailwind / Mantine テーマ設定。テーマ改修は `src/styles/theme.ts`（存在する場合）を優先。
- `docs/` や `../docs` 配下の設計資料も参照し、UI/UX の背景を把握。

## 5. 作業フロー（タイプファースト）

1. **調査**: 対象ページ / コンポーネント / API を特定し、`CODE_GUIDE.md` があれば先に読む。
2. **型定義**: DTO / Zod schema / Props / Hooks 型を最初に更新。`any` / `unknown` 禁止（ライブラリ制約時のみ理由コメント）。
3. **実装**: Server Component をデフォルトとし、クライアント側でのみ必要な箇所に `"use client"` を付与（理由コメント必須）。
4. **検証**: `pnpm --filter frontend lint`, `type-check`, `test`, 必要なら `pnpm frontend:build`。
5. **自己レビュー**: i18n、アクセシビリティ（ARIA, focus trap）、レスポンシブ崩れを確認。

## 6. Next.js App Router ガイド (公式 Doc 準拠)

- **Server Components 優先**: フォームを除き可能な限り Server Component で組み、クライアント状態が必要な最小範囲だけを Client Component に切り出す（Next.js Docs: App Router > Server and Client Components）。
- **データ取得**: `fetch` / `cache()` / `revalidateTag` を活用し、`fetch` には `next: { revalidate: number }` もしくは `cache: 'no-cache'` を必ず設定。TanStack Query を使う場合も、初期データは Server Component で取得して `dehydrate` から共有。
- **Route Handler / Server Actions**: 可能な限り Server Action を利用し、CSRF とバリデーション（Zod など）を必須化。`"use server"` の関数は `src/app/(routes)/actions.ts` 等に整理。
- **エラーバウンダリ**: `error.tsx`, `not-found.tsx`, `loading.tsx` を各セグメント直下に用意し、ユーザ向け日本語メッセージを表示。`error.tsx` 内で `reset()` を提供。
- **Metadata / SEO**: `generateMetadata` でタイトル・OGP を定義し、`robots` / `sitemap` など Next.js metadata API を活用。
- **静的最適化**: `Route Segment Config`（`export const dynamic = 'force-static' | 'force-dynamic'` 等）を適切に設定し、不要な動的レンダリングを避ける。

## 7. React 19 / 状態管理ベストプラクティス

- React Hooks はトップレベルのみで呼び出し。条件分岐内での Hook 呼び出し禁止（React Docs: Using Hooks）。
- 状態は「サーバーデータ (TanStack Query)」「一時 UI 状態 (Zustand/Mantine state)」「フォーム状態 (react-hook-form など)」を役割ごとに分離。
- `useEffect` の乱用を避け、可能な限り Server Component + props 伝搬で完結させる。
- `Suspense` を利用し、API フェッチ時のローディング UI を `loading.tsx` か `React.Suspense` で提供。

## 8. Mantine + Tailwind スタイル指針

- Mantine の `MantineProvider` と `ColorSchemeScript` は `src/app/layout.tsx` で一度だけ設定し、`createTheme` でブランドカラーを統一。コンポーネント側でのテーマ上書きは最小限。
- コンポーネント内スタイルは「Mantine props → Mantine `classNames` → Tailwind utility」の順に検討。Tailwind は `styles/tailwind.css`（または同等ファイル）で `@tailwind base/components/utilities` をインポート済みであることを確認。
- Tailwind クラスは冗長化を避け、`clsx` や `tailwind-merge` を用いて重複排除。任意カラー指定よりテーマトークンを優先。
- Mantine の `Styles API` を使う場合は `styles` プロップに型付けされたオブジェクトを渡し、`style` 生指定は避ける。
- PostCSS / `postcss-preset-mantine` を変更する場合はルートで共有される影響に注意し、PR 説明で理由を明記。

## 9. API 通信とデータ層

- すべての HTTP 通信は `src/lib/api/client.ts` もしくは `src/lib/api/hooks/**` 経由。直接 `fetch` を書かない。
- OpenAPI から生成された型 (`generated/`) をリクエスト/レスポンスの単一情報源とし、重複型を定義しない。
- React Query フックを追加する際は `queryKey` を共通化し、`invalidateQueries` / `revalidateTag` の組み合わせでフロント・バック間のキャッシュを同期。
- エラー時は `useQuery` / `useMutation` の `onError` で Mantine Notifications を発火し、日本語メッセージを表示。

## 10. 変更スコープと UI 再利用

- レイアウトや大規模デザイン改修はプロダクトオーナーの明示指示がある場合のみ実施。
- `src/components` に類似機能が存在する場合は必ず再利用を検討。重複がやむを得ない場合は根拠をコメントに残す。
- Storybook（存在する場合）は主要コンポーネントの再現テストとして更新し、スナップショットの差分も確認。

## 11. テスト / 品質ゲート

| 種別 | コマンド | 備考 |
| --- | --- | --- |
| Lint | `pnpm --filter frontend lint` | ESLint + TypeScript plugin。警告も解消する。 |
| 型チェック | `pnpm --filter frontend type-check` | `tsc --noEmit`。App Router は `tsconfig.json` の `paths` を利用。 |
| ユニット/統合 | `pnpm --filter frontend test` | Jest + React Testing Library。`__tests__` / `*.test.tsx` を優先。 |
| E2E（必要時） | `pnpm --filter frontend test:e2e`（存在する場合） | Playwright/Cypress などツールに合わせて実行。 |
| ビルド | `pnpm --filter frontend build` | Next.js `next build`。失敗時は `NEXT_PUBLIC_*` を確認。 |

> ルート AGENTS の品質ゲート (`pnpm lint`, `pnpm frontend:build` 等) も合わせて実行すること。

## 12. パフォーマンス / アクセシビリティ

- Next.js 推奨の [Production Checklist](https://nextjs.org/docs/app/guides/production-checklist) を踏襲。`next/image`, `next/font` を活用し、LCP 向上を意識。
- `useMemo` / `useCallback` は必要最小限に留め、まずはレンダリング階層を整理。
- Mantine コンポーネントはデフォルトで ARIA 対応だが、カスタム実装時は `role`, `aria-*`, `aria-live` を適切に設定。
- 国際化が必要な場合もまずは日本語 UI を完成させ、`next-intl` 等の導入は別タスクとする。

## 13. よくあるタスク別 Tips

| タスク | 指針 |
| --- | --- |
| **フォーム追加** | Server Action + Zod でバリデーション → `useForm` (Mantine) + `Controller`。API 呼び出しは `useMutation` で統一。 |
| **一覧テーブル** | 既存の `DataTable` コンポーネントや Mantine `Table` + Tailwind を再利用。無限スクロールは TanStack Query の `useInfiniteQuery` を使用。 |
| **モーダル** | Mantine `ModalsProvider` を活用し、`modals.openContextModal` で状態管理を一元化。 |
| **通知** | Mantine `notifications.show` を使い、成功/失敗メッセージを日本語で表示。 |
| **レスポンシブ対応** | Tailwind の `md:` ブレークポイントか Mantine の `useMediaQuery` を使用し、Figma 指示があれば `docs/ui-button-design-guide.md` を参照。 |
| **デザインルール** |　猫情報を表示する時は、1行＝1頭の原則
詳細ページなどの例外を除いて、猫の概要を表示するときは1行に1頭のレコードをまとめることが理想。 |

## 14. フロントエンド向け依頼テンプレ（推奨）

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
- 背景 / 目的
- 対象ページ or コンポーネント (例: src/app/cats/page.tsx)

【制約】
- Server Component 優先 / "use client" は理由コメント必須
- 型定義 → 実装 → テスト の順
- 既存 UI コンポーネントを再利用し、i18n (日本語) を統一

【出力してほしいこと】
1. 変更ファイルと役割
2. 主要な実装ポイント（型安全性、データ取得、状態管理）
3. 追加 / 更新したテストの内容
4. 実行したコマンド（pnpm --filter frontend ...）
```

---

上記に記載がない事項はルート `AGENTS.md` の指示に従い、疑義があれば PR かコメントで周知してください。
