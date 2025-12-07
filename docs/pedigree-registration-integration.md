# Pedigree Registration Form - 二重実装の統合

## 📋 目的と目標（Objective）

**達成したいこと:**
血統書登録フォームの二重実装を解消し、単一の実装に統合する

**期待される成果物:**
- `/pedigrees/page.tsx` のタブUIに統合された単一の登録フォーム
- 旧実装（`/pedigrees/new/page.tsx`）の安全な削除
- リダイレクト設定によるURL互換性の維持

**対象ユーザー/利用シーン:**
- 血統書登録を行うブリーダー・オーナー
- 既存URL（`/pedigrees/new`）からアクセスするユーザー

---

## 🎯 コンテキスト情報（Context）

**プロジェクトタイプ:** 
Webアプリケーション（猫の血統書管理システム）

**技術スタック:**
- 言語: TypeScript
- フレームワーク: Next.js 14 (App Router), React 18
- UI: Mantine UI v7
- 状態管理: React Query (TanStack Query)
- データベース: PostgreSQL + Prisma ORM
- 認証: JWT

**現在のアーキテクチャ:**

```
frontend/src/app/pedigrees/
├── page.tsx              # タブUI（登録・一覧・家系図）
├── new/
│   ├── page.tsx          # 旧実装（Access設計準拠フォーム）← 削除対象
│   └── README.md
└── _id_disabled/         # 静的エクスポート制約により封印中
```

**関連ファイル/ディレクトリ:**
- `frontend/src/components/pedigrees/PedigreeRegistrationForm.tsx`（新実装）
- `frontend/src/app/pedigrees/new/page.tsx`（旧実装）
- `frontend/src/lib/api/hooks/usePedigrees.ts`（API Hooks）

**現状の問題:**
1. 同じ機能が2箇所に実装されている
2. Call ID機能の実装が異なる（デバウンス方式）
3. 型定義が `PedigreeFormData` と `CreatePedigreeDto` で分散
4. ユーザーがどちらを使うべきか混乱する

---

## 🔧 詳細な指示（Instructions）

### Step 1: 現状の機能差分を分析

1. `/pedigrees/new/page.tsx` の以下の機能を確認:
   - Call ID（両親ID・父親ID・母親ID）
   - デバウンス実装（800ms）
   - 79フィールド（基本17 + 血統62）
   - マスタデータ取得（品種・毛色・性別）
   - バリデーション（重複チェック）

2. `PedigreeRegistrationForm.tsx` の現在の実装を確認

3. 不足機能をリストアップ

### Step 2: `PedigreeRegistrationForm.tsx` に機能を統合

#### 2-1. Call ID機能を追加

```typescript
// React Queryベースのデバウンス実装
import { useDebounce } from '@/hooks/useDebounce';

const debouncedCallId = useDebounce(callIdInput, 800);

const { data: parentData } = useQuery({
  queryKey: ['pedigree-call-id', debouncedCallId],
  queryFn: () => apiClient.get(`/pedigrees/pedigree-id/${debouncedCallId}`),
  enabled: !!debouncedCallId && debouncedCallId.length >= 5,
});
```

#### 2-2. 79フィールド対応（Accordionで階層化）

- 基本情報（17項目）
- 第1世代: 両親（14項目）
- 第2世代: 祖父母（16項目）
- 第3世代: 曾祖父母（32項目）

#### 2-3. 型定義を統一

```typescript
// hooks/usePedigrees.ts から型をimport
import type { CreatePedigreeDto } from '@/lib/api/hooks/usePedigrees';
```

### Step 3: 旧実装の削除とリダイレクト設定

#### 3-1. ファイル削除

```bash
rm -rf frontend/src/app/pedigrees/new/
```

#### 3-2. リダイレクト設定（互換性維持）

**方法A: ページコンポーネントでリダイレクト**

```typescript
// frontend/src/app/pedigrees/new/page.tsx（新規作成）
import { redirect } from 'next/navigation';

export default function NewPedigreeRedirect() {
  redirect('/pedigrees?tab=register');
}
```

**方法B: next.config.js で設定**

```javascript
module.exports = {
  async redirects() {
    return [
      {
        source: '/pedigrees/new',
        destination: '/pedigrees?tab=register',
        permanent: true,
      },
    ];
  },
};
```

### Step 4: タブの初期値を動的に制御

```typescript
// frontend/src/app/pedigrees/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function PedigreesPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'register';
  
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  // ...
}
```

---

## 📐 技術的制約

- Next.js App Routerのクライアントコンポーネント規約に従う
- React Query v5のAPIを使用
- Mantine UI v7のコンポーネント設計に準拠
- 既存のAPI Hooksを最大限活用

---

## 📝 コーディング規約

- ESLint + Prettier設定に従う
- TypeScript strictモード
- コンポーネントは関数宣言で定義
- プロップスは必ず型定義

---

## 🧪 テスト要件

- Call ID機能のデバウンステスト（Jest + React Testing Library）
- フォーム送信のE2Eテスト（Playwright）※推奨

---

## 📖 ドキュメント要件

- `PedigreeRegistrationForm.tsx` にJSDocコメント追加
- `README.md` を更新（旧実装の削除を明記）

---

## 📂 出力形式と制約（Format & Constraints）

### コードスタイル

- TypeScript strict mode
- ESLint（Airbnb設定ベース）
- Prettier（シングルクォート、セミコロンあり）

### ファイル構成

```
frontend/src/
├── components/pedigrees/
│   └── PedigreeRegistrationForm.tsx  # 統合後のフォーム
├── app/pedigrees/
│   ├── page.tsx                      # タブUI（修正）
│   └── new/
│       └── page.tsx                  # リダイレクト用（新規）
├── hooks/
│   └── useDebounce.ts                # デバウンスフック（新規）
└── lib/api/hooks/
    └── usePedigrees.ts               # 既存API Hooks
```

### コンポーネントドキュメンテーション

```typescript
/**
 * 血統書登録フォームコンポーネント
 * 
 * @description
 * Access設計準拠の79フィールド（基本17 + 血統62）に対応。
 * Call ID機能により既存血統書から親情報を自動取得可能。
 * 
 * @example
 * ```tsx
 * <PedigreeRegistrationForm onSuccess={() => router.push('/pedigrees')} />
 * ```
 * 
 * @param {function} onSuccess - 登録成功時のコールバック
 */
export function PedigreeRegistrationForm({ onSuccess }: Props) {
  // ...
}
```

### パフォーマンス要件

- Call IDのデバウンス: 800ms
- フォーム入力のラグなし（<100ms）
- React Query自動キャッシング活用

### セキュリティ考慮事項

- XSS対策（Mantineが自動エスケープ）
- CSRF対策（JWT認証）
- 入力値のサニタイゼーション

---

## 📚 具体例（Examples）

### Call ID機能の実装例

#### useDebounce フック

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### PedigreeRegistrationForm での使用例

```typescript
// components/pedigrees/PedigreeRegistrationForm.tsx
const [callIdBoth, setCallIdBoth] = useState('');
const debouncedCallId = useDebounce(callIdBoth, 800);

const { data: parentData, isLoading: isLoadingParent } = useQuery({
  queryKey: ['pedigree-call-id', debouncedCallId],
  queryFn: async () => {
    const res = await apiClient.get(`/pedigrees/pedigree-id/${debouncedCallId}`);
    return res.data;
  },
  enabled: !!debouncedCallId && debouncedCallId.length >= 5,
});

useEffect(() => {
  if (parentData) {
    // 両親情報を一括設定（62フィールド）
    form.setValues({
      fatherTitle: parentData.fatherTitle,
      fatherCatName: parentData.fatherCatName,
      // ... 残り60フィールド
    });
    
    notifications.show({
      title: '両親血統情報取得',
      message: `${parentData.catName}の血統情報を取得しました（62項目）`,
      color: 'green',
    });
  }
}, [parentData]);
```

### リダイレクトの実装例

```typescript
// app/pedigrees/new/page.tsx
import { redirect } from 'next/navigation';

export default function NewPedigreeRedirect() {
  redirect('/pedigrees?tab=register');
}
```

---

## ✅ 完了条件チェックリスト

- [ ] `PedigreeRegistrationForm.tsx` に79フィールド対応を追加
- [ ] Call ID機能（デバウンス800ms）を実装
- [ ] 型定義を `CreatePedigreeDto` に統一
- [ ] 旧実装 `/pedigrees/new/page.tsx` を削除
- [ ] リダイレクト設定を追加
- [ ] タブの初期値を `?tab=` パラメータで制御
- [ ] JSDocコメントを追加
- [ ] README.md を更新
- [ ] デバウンステストを作成
