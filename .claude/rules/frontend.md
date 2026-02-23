---
paths:
  - "frontend/**"
---

# Frontend ルール (Next.js App Router + React + Mantine)

## App Router 規約

- `frontend/src/app` 配下で App Router ファイル規約を遵守: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Server Components をデフォルトとする。`"use client"` は必要な場合のみ使用し、理由をコメントに記載
- データフェッチはサーバー側で実行し、キャッシュ戦略（`revalidate` / `no-cache`）を明示
- フォーム/ミューテーションはサーバーアクション or API Route を活用

## UI コンポーネント

- Mantine UI コンポーネントを優先的に使用
- Tailwind CSS はユーティリティクラスとして Mantine を補完する位置付け
- インラインスタイルは使用しない
- アイコンは Tabler Icons (`@tabler/icons-react`) を使用

## 状態管理・データ取得

- サーバーデータ: TanStack React Query (`@tanstack/react-query`)
- クライアント状態: Zustand (`src/lib/store/`)
- フォーム: React Hook Form + Mantine Form
- API 呼び出しは `src/lib/api/` 経由。コンポーネント内で直接 `fetch` しない

## バリデーション

- クライアントサイドバリデーションは Zod スキーマ (`src/lib/schemas/`) を使用
- サーバーサイドと整合性を保つ

## UI テキスト・エラー

- ユーザー向けテキストは日本語
- エラーメッセージは日本語で Mantine Notifications (トースト) / バナーで表示
- 開発者向けログにも日本語コメントを添付

## テスト

- テストファイル: `*.test.tsx`, `*.spec.tsx`
- テスト環境: jsdom (Jest)
- 品質ゲート: `pnpm frontend:lint` → `pnpm frontend:build`

## レスポンシブ

- Tailwind `md:` ブレークポイント or Mantine `useMediaQuery` で対応
- カスタムコンポーネントに ARIA 属性を付与
