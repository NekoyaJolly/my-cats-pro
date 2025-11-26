---
applyTo: "frontend/**"
excludeAgent: ""
---

# Frontend パス固有の指示

このファイルは `frontend/` ディレクトリに対する Copilot の動作を制御します。

## 適用範囲
- `frontend/src/**/*.tsx`
- `frontend/src/**/*.ts`

## 必須ルール

### React/Next.js
- Server Component をデフォルトとする
- `"use client"` は必要な場合のみ使用し、理由をコメント
- App Router の規約に従う（page.tsx, layout.tsx など）

### 型安全
- `any` / `unknown` の使用禁止
- すべての Props に型定義
- API レスポンスは生成型を使用

### UI/UX
- 日本語文言を使用
- アクセシビリティを考慮（ARIA、キーボード操作）
- レスポンシブデザイン
- ローディング・エラー状態を表示

### スタイリング
- Mantine UI コンポーネントを優先
- Tailwind CSS で補完
- インラインスタイルは避ける

## ビルド・テストコマンド

```bash
# Lint
pnpm --filter frontend run lint

# 型チェック
pnpm --filter frontend run type-check

# ビルド
pnpm --filter frontend run build

# テスト
pnpm --filter frontend run test

# 開発サーバー
pnpm --filter frontend run dev
```

## 変更してはいけないファイル
- `node_modules/**`
- `.next/**` - ビルド成果物
- `src/lib/api/generated/**` - OpenAPI 生成ファイル

## ディレクトリ構造

```
src/
├── app/              # App Router ページ
│   ├── page.tsx      # トップページ
│   ├── layout.tsx    # レイアウト
│   └── cats/
│       ├── page.tsx
│       └── _components/  # プライベートコンポーネント
├── components/       # 共有 UI コンポーネント
├── lib/
│   ├── api/         # API クライアント
│   └── hooks/       # カスタムフック
└── styles/          # グローバルスタイル
```

## コード例

### Server Component
```typescript
// app/example/page.tsx
import { getItems } from '@/lib/api/items';

export default async function ExamplePage() {
  const items = await getItems();

  return (
    <div>
      <h1>サンプルページ</h1>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Client Component
```typescript
// app/example/_components/InteractiveList.tsx
'use client'; // インタラクティブな機能が必要なため

import { useState } from 'react';
import { Button } from '@mantine/core';

interface Props {
  items: Item[];
}

export function InteractiveList({ items }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      {items.map((item) => (
        <Button key={item.id} onClick={() => setSelected(item.id)}>
          {item.name}
        </Button>
      ))}
    </div>
  );
}
```

### Server Actions
```typescript
// app/example/_actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createItemAction(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) {
    return { error: '名前は必須です' };
  }

  try {
    // API 呼び出し
    await createItem({ name });
    revalidatePath('/example');
    return { success: true };
  } catch (error) {
    return { error: '作成に失敗しました' };
  }
}
```

## Mantine UI の使用

```typescript
import { Button, Stack, Text, Card } from '@mantine/core';

<Stack gap="md">
  <Text size="lg" fw={700}>見出し</Text>
  <Card shadow="sm" padding="lg">
    <Text>カードの内容</Text>
  </Card>
  <Button color="blue">ボタン</Button>
</Stack>
```

## 品質ゲート
変更後、必ず以下を実行してください:
1. `pnpm --filter frontend run lint`
2. `pnpm --filter frontend run type-check`
3. `pnpm --filter frontend run build`

UI 変更の場合:
- レスポンシブを確認
- アクセシビリティをチェック
- エラー・ローディング状態を確認

## 参考ドキュメント
- [frontend/AGENTS.md](../frontend/AGENTS.md) - 詳細なガイドライン
- [Next.js App Router](https://nextjs.org/docs/app)
- [Mantine UI](https://mantine.dev/)
- [React 19](https://react.dev/)
