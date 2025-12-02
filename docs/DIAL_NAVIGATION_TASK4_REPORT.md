# タスク4実装完了レポート

## 変更概要

DialNavigation コンポーネントに **ユーザーごとの表示/非表示＆順序編集機能** を追加しました。ドラッグ&ドロップで項目の順序を変更し、スイッチで表示/非表示を切り替えることができます。

---

## 主な変更点

### 1. DialMenuItemConfig 型の定義

**新規インターフェース:**
```typescript
export interface DialMenuItemConfig {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  href: string;
  badge?: string | number;
  subActions?: {
    id: string;
    title: string;
    icon: ReactNode;
    href: string;
  }[];
  visible: boolean;  // 表示/非表示
  order: number;     // 表示順序
}
```

**DialItem との関係:**
- `DialItem` の全プロパティを含む
- `visible` と `order` を追加
- 設定データの管理用

### 2. DialMenuSettings コンポーネント

**新規ファイル:**
- `frontend/src/components/dashboard/DialMenuSettings.tsx`

**主要機能:**

#### ドラッグ＆ドロップ
```typescript
// dnd-kit を使用
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
```

**特徴:**
- 8px 以上のドラッグで反応
- キーボード操作対応
- ドラッグ中は透明度50%＋大きめの影

#### 表示/非表示スイッチ
```typescript
<Switch
  checked={item.visible}
  onChange={() => onToggle(item.id)}
  size="md"
  color={item.color}
  onLabel={<IconEye size={14} />}
  offLabel={<IconEyeOff size={14} />}
/>
```

#### 六角形プレビュー
```typescript
<Box
  style={{
    width: 48,
    height: 48,
    clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
    backgroundColor: item.visible ? item.color : '#E9ECEF',
    color: item.visible ? '#FFFFFF' : '#868E96',
  }}
>
  {item.icon}
</Box>
```

### 3. DialNavigation への統合

**新しいプロパティ:**
```typescript
interface DialNavigationProps {
  items: DialItem[];
  onNavigate: (href: string) => void;
  centerLogo?: ReactNode;
  onSettingsClick?: () => void;  // 新規追加
}
```

**設定ボタンの追加:**
```typescript
{onSettingsClick && (
  <Tooltip label="メニューを編集" position="left">
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      onClick={onSettingsClick}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 100,
      }}
    >
      <IconSettings size={20} />
    </ActionIcon>
  </Tooltip>
)}
```

---

## UI 構成

### DialMenuSettings モーダル

```
┌────────────────────────────────┐
│ ダイヤルメニューの編集         │  ← タイトル
├────────────────────────────────┤
│ 🎯 メニュー項目をカスタマイズ  │  ← 説明カード
│ • スイッチで表示/非表示        │
│ • ハンドルをドラッグ           │
│ • 最大16項目まで対応           │
├────────────────────────────────┤
│ 表示中: 8 / 10 件              │  ← カウント表示
│                    未保存の変更 │  ← 変更検出
├────────────────────────────────┤
│ ┌──────────────────────────┐   │
│ │ ≡ ⬡ 在舎猫一覧    [ON]  │   │  ← ドラッグ可能項目
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ≡ ⬡ 退舎猫      [OFF]   │   │
│ └──────────────────────────┘   │
│ ┌──────────────────────────┐   │
│ │ ≡ ⬡ 子猫一覧    [ON]    │   │
│ └──────────────────────────┘   │
│         ...                    │
├────────────────────────────────┤
│ [リセット] [キャンセル] [保存] │  ← アクションボタン
└────────────────────────────────┘
```

### 項目カード

```
┌──────────────────────────────┐
│ ≡  ⬡  タイトル        [ON]  │
│    │   サブアクション: 3件    │
│    └→ 六角形プレビュー        │
└──────────────────────────────┘
 ↑   ↑           ↑         ↑
ドラッグ アイコン  情報  スイッチ
```

---

## 使用方法

### 基本的な統合

```typescript
'use client';

import { useState } from 'react';
import { DialNavigation } from '@/components/dashboard/DialNavigation';
import { DialMenuSettings, DialMenuItemConfig } from '@/components/dashboard/DialMenuSettings';
import { IconCat, IconUsers, IconCalendar } from '@tabler/icons-react';

export default function DashboardPage() {
  // メニュー項目の設定
  const [menuConfig, setMenuConfig] = useState<DialMenuItemConfig[]>([
    {
      id: '1',
      title: '在舎猫一覧',
      icon: <IconCat size={24} />,
      color: '#2563EB',
      href: '/cats',
      badge: 12,
      visible: true,
      order: 0,
    },
    {
      id: '2',
      title: '退舎猫',
      icon: <IconUsers size={24} />,
      color: '#22C55E',
      href: '/cats/retired',
      visible: false,
      order: 1,
    },
    {
      id: '3',
      title: '子猫一覧',
      icon: <IconCalendar size={24} />,
      color: '#F97316',
      href: '/kittens',
      badge: 5,
      visible: true,
      order: 2,
    },
    // ...
  ]);

  // 設定モーダルの表示状態
  const [settingsOpened, setSettingsOpened] = useState(false);

  // visible なアイテムのみを order でソート
  const visibleItems = menuConfig
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);

  // ナビゲーション処理
  const handleNavigate = (href: string) => {
    console.log('Navigate to:', href);
    // ルーター遷移など
  };

  // 設定保存
  const handleSaveSettings = (updatedItems: DialMenuItemConfig[]) => {
    setMenuConfig(updatedItems);
    
    // localStorage に保存
    localStorage.setItem('dialMenuConfig', JSON.stringify(updatedItems));
    
    // または API に保存
    // await fetch('/api/settings/dial-menu', {
    //   method: 'POST',
    //   body: JSON.stringify(updatedItems),
    // });
  };

  return (
    <div>
      <DialNavigation
        items={visibleItems}
        onNavigate={handleNavigate}
        onSettingsClick={() => setSettingsOpened(true)}
      />

      <DialMenuSettings
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        items={menuConfig}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
```

### localStorage からの読み込み

```typescript
const [menuConfig, setMenuConfig] = useState<DialMenuItemConfig[]>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dialMenuConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }
  }
  return defaultMenuConfig;
});
```

---

## 技術的詳細

### dnd-kit の設定

**センサー設定:**
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,  // 8px 以上のドラッグで反応
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

**ドラッグ終了処理:**
```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    setLocalItems((currentItems) => {
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(currentItems, oldIndex, newIndex);
      
      // 順序を更新
      return newItems.map((item, index) => ({
        ...item,
        order: index,
      }));
    });
  }
};
```

### 変更検出

```typescript
const hasChanges = JSON.stringify(localItems) !== 
                  JSON.stringify([...items].sort((a, b) => a.order - b.order));
```

**利点:**
- 深い比較で変更を正確に検出
- order の自動再計算にも対応

### バリデーション

```typescript
// 保存ボタンは以下の条件で無効化
disabled={!hasChanges || visibleCount === 0}
```

**条件:**
1. 変更がない場合
2. 表示項目が0件の場合（少なくとも1つは表示が必要）

---

## スタイリング

### ドラッグ中のスタイル

```typescript
const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
};

// ...
shadow={isDragging ? 'lg' : 'xs'}
```

### 六角形の色

**選択時:**
- 背景: `item.color`
- アイコン: `#FFFFFF`

**非選択時:**
- 背景: `#E9ECEF`（グレー）
- アイコン: `#868E96`（暗いグレー）

---

## アクセシビリティ

### キーボード操作

- **Space / Enter:** アイテムを選択
- **矢印キー:** アイテムを移動
- **Escape:** ドラッグをキャンセル

### スクリーンリーダー

- ドラッグハンドルに `aria-label` 設定済み
- 表示/非表示スイッチにアイコンラベル

### フォーカス管理

- タブキーで要素間を移動可能
- フォーカスリングが明確に表示

---

## パフォーマンス

### メモ化

コンポーネント内で state を局所的に管理：
```typescript
const [localItems, setLocalItems] = useState<DialMenuItemConfig[]>(
  [...items].sort((a, b) => a.order - b.order)
);
```

**利点:**
- 親コンポーネントの再レンダリングを防ぐ
- モーダルを閉じるまで変更を保持

### 最適化ポイント

1. **リスト仮想化不要:**
   - 最大16項目なので全てレンダリング可能

2. **ドラッグ最適化:**
   - `transform` と `opacity` のみ変更
   - レイアウトの再計算を最小化

---

## 今後の拡張性

### データ永続化

#### localStorage（フロントエンド）

```typescript
const handleSaveSettings = (updatedItems: DialMenuItemConfig[]) => {
  localStorage.setItem('dialMenuConfig', JSON.stringify(updatedItems));
  setMenuConfig(updatedItems);
};
```

#### API（バックエンド）

```typescript
const handleSaveSettings = async (updatedItems: DialMenuItemConfig[]) => {
  await fetch('/api/user/dial-menu-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedItems),
  });
  setMenuConfig(updatedItems);
};
```

### 追加機能案

1. **グループ化:**
   ```typescript
   interface DialMenuGroup {
     id: string;
     name: string;
     items: DialMenuItemConfig[];
   }
   ```

2. **検索/フィルター:**
   ```typescript
   const [searchTerm, setSearchTerm] = useState('');
   const filteredItems = items.filter(item => 
     item.title.includes(searchTerm)
   );
   ```

3. **一括操作:**
   ```typescript
   const showAll = () => {
     setLocalItems(items.map(item => ({ ...item, visible: true })));
   };
   ```

---

## 品質確認

### 実行したチェック

| チェック項目 | 結果 |
|------------|------|
| 型チェック | ✅ PASS |
| Lint | ✅ PASS |
| ビルド | ✅ PASS |
| テスト | ✅ 9/9 PASS |

### 既存機能の確認

- ✅ ドラッグ操作での回転
- ✅ ホイール操作での回転
- ✅ アイテムクリック選択
- ✅ サブアクション展開
- ✅ すべてのアニメーション
- ✅ バッジ表示
- ✅ 下側中央の選択基準（タスク1）
- ✅ ∞軌道レイアウト（タスク2）
- ✅ 六角形アイコン（タスク3）

---

## 変更ファイル一覧

### 新規作成
- `frontend/src/components/dashboard/DialMenuSettings.tsx` - 設定モーダルコンポーネント

### 変更
- `frontend/src/components/dashboard/DialNavigation.tsx` - 設定ボタン追加

---

## まとめ

✅ **目標達成**
- ユーザーごとの表示/非表示設定機能
- ドラッグ&ドロップでの順序変更機能
- DashboardCardSettings と統一されたUX

✅ **品質保証**
- すべての品質チェックをパス
- 既存機能をすべて維持

✅ **拡張性**
- データ永続化の準備完了
- 追加機能の実装が容易

---

**🎉 タスク4は問題なく完了しました！**

すべてのタスク（1-4）が完了し、DialNavigation の機能拡張が完成しました。

---

*作成日: 2025-12-02*
*作成者: GitHub Copilot Coding Agent*
