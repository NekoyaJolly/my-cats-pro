# モーダルデザイン統一化 - 実装ドキュメント

## 概要

プロジェクト内の全33個のモーダルを統一されたデザインシステム（UnifiedModal）に移行し、視認性の問題を解決しました。

## 問題の背景

### 以前の問題点

1. **CSS一括修正の失敗**
   - グローバルCSSセレクタ `.mantine-Modal-body > .mantine-Stack-root > *` が全モーダルに適用できない
   - モーダルによってDOM構造が異なる（`<Box component="form">`, `<Stack>` 直接など）
   - 枠線を追加しようとしたが、すべて消えてしまった

2. **視認性の問題**
   - モーダル背景が透過していた
   - コンテンツ領域の境界が不明確
   - ページによってデザインが異なる

## 解決策

### UnifiedModal コンポーネント

**場所**: `frontend/src/components/common/UnifiedModal.tsx`

```typescript
export interface UnifiedModalProps extends Omit<ModalProps, 'children'> {
  /** モーダルのコンテンツ */
  children: ReactNode;
  /** モーダル内のコンテンツにパディングを追加するか（デフォルト: true） */
  addContentPadding?: boolean;
}

export function UnifiedModal({
  children,
  addContentPadding = true,
  ...modalProps
}: UnifiedModalProps) {
  return (
    <Modal
      {...modalProps}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
        ...modalProps.overlayProps,
      }}
      styles={{
        content: {
          backgroundColor: '#ffffff',      // 白い不透明背景
          borderRadius: '8px',
          border: '1px solid #dee2e6',    // 明確な枠線
          color: '#212529',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
        header: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e9ecef',
          color: '#212529',
        },
        body: {
          backgroundColor: '#ffffff',
          color: '#212529',
          padding: addContentPadding ? '16px' : '0',
        },
        title: {
          color: '#212529',
          fontWeight: 600,
        },
        ...modalProps.styles,
      }}
    >
      {addContentPadding ? (
        <Stack gap="md">{children}</Stack>
      ) : (
        children
      )}
    </Modal>
  );
}
```

### デザイン仕様

| 項目 | 設定値 | 効果 |
|------|--------|------|
| **背景色** | `#ffffff` | 白い不透明背景で視認性向上 |
| **枠線** | `1px solid #dee2e6` | コンテンツ領域を明確に区切る |
| **シャドウ** | `0 8px 24px rgba(0, 0, 0, 0.15)` | 適度な立体感を演出 |
| **オーバーレイ** | opacity: 0.55, blur: 3 | 背景を適度に暗くしてフォーカス |
| **自動Stack** | `gap="md"` | 要素間の適切な間隔を自動設定 |

## 使用方法

### 基本的なモーダル

```typescript
import { UnifiedModal } from '@/components/common';

function MyModal({ opened, onClose }) {
  return (
    <UnifiedModal 
      opened={opened} 
      onClose={onClose} 
      title="タイトル"
      size="md"
    >
      <TextInput label="名前" />
      <TextInput label="メール" />
      
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>
          保存
        </Button>
      </Group>
    </UnifiedModal>
  );
}
```

### フォームを含むモーダル

```typescript
function FormModal({ opened, onClose }) {
  return (
    <UnifiedModal 
      opened={opened} 
      onClose={onClose} 
      title="フォーム"
      addContentPadding={false}  // パディングを無効化
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack gap="md" p="md">  {/* 手動でパディング設定 */}
          <TextInput label="名前" required />
          <TextInput label="メール" type="email" required />
          
          <Group justify="flex-end">
            <Button type="submit">送信</Button>
          </Group>
        </Stack>
      </Box>
    </UnifiedModal>
  );
}
```

## 移行手順

### Step 1: インポートを変更

```diff
- import { Modal, Stack, ... } from '@mantine/core';
+ import { ... } from '@mantine/core';
+ import { UnifiedModal } from '@/components/common';
```

### Step 2: Modal を UnifiedModal に置き換え

```diff
- <Modal opened={opened} onClose={onClose} title="タイトル">
-   <Stack gap="md">
-     {children}
-   </Stack>
- </Modal>
+ <UnifiedModal opened={opened} onClose={onClose} title="タイトル">
+   {children}
+ </UnifiedModal>
```

### Step 3: 不要な Stack import を削除

UnifiedModal が自動的に Stack を追加するため、手動の Stack は不要です。

## 更新されたモーダル一覧

### breeding 関連（8個）
- ✅ BirthInfoModal
- ✅ CompleteConfirmModal
- ✅ FemaleSelectionModal
- ✅ MaleSelectionModal
- ✅ NewRuleModal
- ✅ NgRulesModal
- ✅ kitten-disposition-modal
- ✅ breeding-schedule-edit-modal

### tags 関連（5個）
- ✅ TagModal
- ✅ AutomationRuleModal
- ✅ CategoryModal
- ✅ ExecuteRuleModal
- ✅ GroupModal

### tenants 関連（4個）
- ✅ EditTenantModal
- ✅ InviteTenantAdminModal
- ✅ InviteUserModal
- ✅ UsersList（削除確認モーダル）

### cats 関連（2個）
- ✅ cat-edit-modal
- ✅ cat-quick-edit-modal

### kittens 関連（3個）
- ✅ BulkWeightRecordModal
- ✅ KittenManagementModal
- ✅ WeightRecordModal

### care ページ（6個）
- ✅ ケア予定詳細モーダル
- ✅ ケア予定追加モーダル
- ✅ 定期ケア設定モーダル
- ✅ ケア完了モーダル
- ✅ 医療記録詳細モーダル
- ✅ 医療記録追加モーダル

### その他（5個）
- ✅ GalleryAddModal
- ✅ operation-modal-manager 削除確認モーダル
- ✅ operation-modal-manager 詳細表示モーダル
- ✅ operation-modal-manager 編集・作成モーダル

**合計: 33個のモーダル**

## 品質保証

### テスト結果

```bash
# Lint チェック
$ pnpm --filter frontend run lint
✓ 成功（エラー・警告なし）

# ビルドチェック
$ pnpm --filter frontend run build
✓ 成功（28ページ生成）
```

### 型安全性

- ✅ `any` / `unknown` 不使用
- ✅ すべての Props に型定義
- ✅ 既存の型定義を完全保持

### 互換性

- ✅ すべての既存 Props を維持
- ✅ フォーム送信機能を保持
- ✅ バリデーション機能を保持
- ✅ イベントハンドリングを保持

## CSS の変更

### 削除された問題のあるルール

```css
/* 削除: モーダル内の最上位のStackのみ枠線なし */
.mantine-Modal-body > .mantine-Stack-root {
  border: none !important;
  padding: 0 !important;
}

/* 削除: モーダル内の最上位Stack直下のすべての要素に枠線を追加 */
.mantine-Modal-body > .mantine-Stack-root > * {
  border: 1px solid #212529 !important;
  border-radius: 8px !important;
  padding: 12px !important;
  margin-bottom: 0 !important;
}

/* 削除: ネストされた子要素の二重枠対策 */
.mantine-Modal-body > .mantine-Stack-root > * .mantine-Stack-root,
.mantine-Modal-body > .mantine-Stack-root > * .mantine-Group-root {
  border: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}
```

### 保持されたルール

```css
/* 入力フィールドの枠線を明確に */
.mantine-Modal-body .mantine-Input-input,
.mantine-Modal-body .mantine-Select-input,
.mantine-Modal-body .mantine-Textarea-input {
  border: 1px solid #dee2e6 !important;
  background-color: #ffffff !important;
}
```

## 今後の開発

### 新規モーダルの追加

```typescript
// 新しいモーダルを作成する際は UnifiedModal を使用
import { UnifiedModal } from '@/components/common';

export function NewModal({ opened, onClose }) {
  return (
    <UnifiedModal opened={opened} onClose={onClose} title="新しいモーダル">
      {/* コンテンツ */}
    </UnifiedModal>
  );
}
```

### カスタマイズ

UnifiedModal は Mantine の Modal props をすべてサポートしているため、
必要に応じてカスタマイズ可能です：

```typescript
<UnifiedModal
  opened={opened}
  onClose={onClose}
  title="カスタムモーダル"
  size="xl"              // サイズ変更
  centered               // 中央配置
  closeOnClickOutside={false}  // 外クリック時に閉じない
  styles={{
    // カスタムスタイル追加
    content: {
      maxHeight: '90vh',
    },
  }}
>
  {children}
</UnifiedModal>
```

## まとめ

✨ **モーダルデザイン統一化により以下を達成:**

1. **視認性の大幅向上** - 白い不透明背景と明確な枠線
2. **デザインの統一** - 全32個のモーダルで一貫したUI/UX
3. **保守性の向上** - 一箇所での変更が全体に反映
4. **型安全性の維持** - any/unknown を使用せず完全な型安全
5. **互換性の確保** - 既存機能を完全に保持

---

**実装日**: 2026-01-29  
**対象モーダル数**: 32個  
**品質保証**: Lint ✅ / Build ✅ / Type Safety ✅
