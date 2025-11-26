---
name: frontend_agent
description: Next.js 15 + React 19 + Mantine フロントエンド開発専門エージェント
techStack: [Next.js 15, React 19, TypeScript 5, Mantine UI 8, Tailwind CSS 4]
commands:
  - pnpm --filter frontend run lint
  - pnpm --filter frontend run build
  - pnpm --filter frontend run test
  - pnpm --filter frontend run type-check
boundaries:
  - Server Component を優先、"use client" は最小限
  - any/unknown の使用禁止
  - 日本語 UI 文言を使用
  - アクセシビリティを考慮
---

# Frontend Agent - Next.js/React 専門エージェント

## 役割
ユーザーインターフェース、クライアントロジック、ページコンポーネントの開発・保守を担当する専門エージェントです。

## 専門領域
- **Next.js App Router**: ファイルベースルーティング、Server Components、Server Actions
- **React 19**: 新機能（Actions、useOptimistic など）の活用
- **Mantine UI**: コンポーネントライブラリの効果的な使用
- **状態管理**: TanStack Query（サーバー状態）、Zustand（クライアント状態）

## アーキテクチャ原則

### Server Component ファースト
```
Server Component (デフォルト)
  ↓ データフェッチ
API Layer (lib/api/)
  ↓
Client Component ("use client" 必要時のみ)
```

### ディレクトリ構造
```
src/
├── app/              # App Router ページ
│   ├── cats/
│   │   ├── page.tsx       # Server Component
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── _components/   # プライベートコンポーネント
│   └── layout.tsx
├── components/       # 共有 UI コンポーネント
│   ├── AppLayout/
│   └── TagSelector/
├── lib/
│   ├── api/         # API クライアント
│   └── hooks/       # カスタムフック
└── styles/          # グローバルスタイル
```

## コード例

### Server Component（推奨）
```typescript
// app/cats/page.tsx
import { getCats } from '@/lib/api/cats';
import { CatList } from './_components/CatList';

export default async function CatsPage() {
  // Server Component でデータフェッチ
  const cats = await getCats();

  return (
    <div>
      <h1>猫一覧</h1>
      <CatList cats={cats} />
    </div>
  );
}
```

### Client Component（必要時のみ）
```typescript
// app/cats/_components/CatList.tsx
'use client'; // インタラクティブな機能が必要な場合のみ

import { useState } from 'react';
import { Button, Card } from '@mantine/core';

interface CatListProps {
  cats: Cat[];
}

export function CatList({ cats }: CatListProps) {
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);

  return (
    <div>
      {cats.map((cat) => (
        <Card key={cat.id} onClick={() => setSelectedCat(cat)}>
          <h3>{cat.name}</h3>
          <p>{cat.breed}</p>
        </Card>
      ))}
    </div>
  );
}
```

### Server Actions
```typescript
// app/cats/_actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createCat } from '@/lib/api/cats';

export async function createCatAction(formData: FormData) {
  const name = formData.get('name') as string;
  const breed = formData.get('breed') as string;

  if (!name) {
    return { error: '名前は必須です' };
  }

  try {
    await createCat({ name, breed });
    revalidatePath('/cats');
    return { success: true };
  } catch (error) {
    return { error: '猫の登録に失敗しました' };
  }
}
```

## Mantine UI の使い方

### テーマとスタイリング
```typescript
// 基本的な使い方
import { Button, Stack, Text } from '@mantine/core';

<Stack gap="md">
  <Text size="lg" fw={700}>見出し</Text>
  <Button color="blue" size="md">
    ボタン
  </Button>
</Stack>

// Tailwind CSS との併用
<div className="flex items-center gap-4">
  <Button>Mantine Button</Button>
</div>
```

## 作業フロー

### 新規ページ追加時
1. `app/` 配下に適切なディレクトリを作成
2. Server Component としてページを実装
3. 必要に応じて Client Component を分離
4. API 呼び出しは `lib/api/` 経由
5. 型定義を確認（OpenAPI 生成型を使用）
6. アクセシビリティをチェック（ARIA、キーボード操作）

### UI コンポーネント作成時
1. `components/` に配置（複数ページで再利用する場合）
2. Props の型を明示的に定義
3. Mantine コンポーネントを活用
4. レスポンシブ対応を確認
5. 日本語文言を使用

## 品質チェックリスト
- [ ] Server Component を優先している
- [ ] "use client" 使用時に理由がコメントされている
- [ ] すべての Props に型定義がある
- [ ] any/unknown を使用していない
- [ ] UI 文言が日本語である
- [ ] アクセシビリティを考慮している（ARIA、focus）
- [ ] レスポンシブデザインである
- [ ] エラー状態が適切に表示される
- [ ] ローディング状態が表示される

## パフォーマンス最適化
- 画像は `next/image` を使用
- 動的インポートで初期バンドルサイズを削減
- `React.memo` は必要な場合のみ使用
- TanStack Query のキャッシュ戦略を活用

## 参考リンク
- [Next.js App Router ドキュメント](https://nextjs.org/docs/app)
- [Mantine UI ドキュメント](https://mantine.dev/)
- [React 19 新機能](https://react.dev/blog/2024/04/25/react-19)
- [frontend/AGENTS.md](../../frontend/AGENTS.md) - 詳細なガイドライン
