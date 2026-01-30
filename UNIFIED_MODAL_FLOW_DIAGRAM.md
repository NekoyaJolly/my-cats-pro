# UnifiedModal セクション機能 - 動作フロー図

## コンポーネント構造

```
UnifiedModal
│
├─ Modal (Mantine)
│  │
│  ├─ Header
│  │  └─ Title
│  │
│  └─ Body
│     │
│     └─ renderContent()
│        │
│        ├─ sections が渡された場合
│        │  │
│        │  └─ Stack
│        │     │
│        │     └─ sections.map((section, index) => {
│        │        │
│        │        ├─ index === 0 && section.label
│        │        │  └─ Divider (label: section.label)
│        │        │
│        │        ├─ index > 0
│        │        │  └─ Divider (label: section.label)
│        │        │
│        │        └─ section.content
│        │        })
│        │
│        └─ children が渡された場合 (従来の動作)
│           │
│           ├─ addContentPadding === true
│           │  └─ Stack > children
│           │
│           └─ addContentPadding === false
│              └─ children
```

---

## セクション処理フロー

```
[sections 配列を受け取る]
         │
         ▼
[Stack でラップ]
         │
         ▼
[各セクションをループ処理]
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
    [index = 0]       [index = 1]      [index = 2]
         │                 │                 │
         ▼                 ▼                 ▼
    [label あり?]     [常に Divider]   [常に Divider]
         │                 │                 │
    ┌────┴────┐           │                 │
   YES       NO           │                 │
    │         │           │                 │
    ▼         ▼           ▼                 ▼
[Divider]  [なし]    [Divider]        [Divider]
    │         │           │                 │
    └────┬────┘           │                 │
         │                │                 │
         ▼                ▼                 ▼
    [content]        [content]         [content]
```

---

## 実際のレンダリング例

### 入力

```typescript
sections = [
  { label: '基本情報', content: <A /> },
  { label: '詳細', content: <B /> },
  { content: <C /> },
]
```

### 出力 (DOM構造)

```html
<Modal>
  <Modal.Header>
    <Modal.Title>モーダルタイトル</Modal.Title>
  </Modal.Header>
  
  <Modal.Body>
    <Stack gap="md">
      
      <!-- Section 0 (label あり) -->
      <div>
        <Divider label="基本情報" labelPosition="center" mb="md" />
        <A />
      </div>
      
      <!-- Section 1 -->
      <div>
        <Divider label="詳細" labelPosition="center" mb="md" />
        <B />
      </div>
      
      <!-- Section 2 (label なし) -->
      <div>
        <Divider labelPosition="center" mb="md" />
        <C />
      </div>
      
    </Stack>
  </Modal.Body>
</Modal>
```

---

## 型チェックフロー

```
UnifiedModal に props を渡す
         │
         ▼
    型チェック
         │
    ┌────┴────┐
    │         │
children    sections
    │         │
    ▼         ▼
sections   children
= never    = never
    │         │
    └────┬────┘
         │
         ▼
    どちらか一方のみ
    使用可能と判定
         │
         ▼
    ✅ 型チェック合格
```

### 型エラーの例

```typescript
// ❌ エラー: 両方は使えない
<UnifiedModal sections={...} children={...} />
// Type error: 'sections' and 'children' cannot be used together

// ✅ OK: どちらか一方
<UnifiedModal sections={...} />
<UnifiedModal children={...} />
<UnifiedModal>{...}</UnifiedModal>
```

---

## Divider 挿入ロジック詳細

```javascript
if (sections) {
  return (
    <Stack gap="md">
      {sections.map((section, index) => (
        <div key={index}>
          {/* 2番目以降は常に Divider */}
          {index > 0 && (
            <Divider
              label={section.label}
              labelPosition="center"
              mb="md"
            />
          )}
          
          {/* 最初のセクション: ラベルありの場合のみ Divider */}
          {index === 0 && section.label && (
            <Divider
              label={section.label}
              labelPosition="center"
              mb="md"
            />
          )}
          
          {/* コンテンツは常に表示 */}
          {section.content}
        </div>
      ))}
    </Stack>
  );
}
```

---

## ケース別レンダリング

### ケース 1: 全セクションにラベル

```
Input:  [{ label: 'A', content: <X> }]
        [{ label: 'B', content: <Y> }]
        [{ label: 'C', content: <Z> }]

Output: ─────── A ───────
        <X>
        
        ─────── B ───────
        <Y>
        
        ─────── C ───────
        <Z>
```

### ケース 2: ラベルなしセクション混在

```
Input:  [{ content: <X> }]              // ラベルなし
        [{ label: 'B', content: <Y> }]  // ラベルあり
        [{ content: <Z> }]              // ラベルなし

Output: <X>                              // Divider なし
        
        ─────── B ───────
        <Y>
        
        ──────────────────              // ラベルなし Divider
        <Z>
```

### ケース 3: 単一セクション

```
Input:  [{ label: 'Only', content: <X> }]

Output: ─────── Only ───────
        <X>
```

---

## パフォーマンス考察

### レンダリング回数

- 各セクションは独立した `<div>` でラップ
- `key` はセクションごとに安定した値（例: `section.key` や `section.label`）を使用することを推奨
- セクション順が固定された静的リストでは `key={index}` の使用も可能だが、動的に追加・削除・並び替えが発生するセクションでは使用しない
- セクション内容の変更時、適切な `key` 設定により、React は該当セクションのみを再レンダリング

### メモリ使用

- セクション配列は参照を保持
- `renderContent()` は毎レンダリング時に呼ばれるが、条件分岐で早期リターン
- Divider は軽量コンポーネント（パフォーマンス影響小）

---

## エッジケース処理

### 空配列

```typescript
sections = []
// → 何も表示されない（Stack のみ）
```

### undefined/null content

```typescript
sections = [{ label: 'Test', content: null }]
// → Divider のみ表示、content は表示されない
```

### 動的セクション

```typescript
const sections = useMemo(
  () =>
    [
      condition && { label: 'A', content: <X /> },
      { label: 'B', content: <Y /> },
    ].filter((section): section is ModalSection => Boolean(section)),
  [condition],
);
// → 条件に応じてセクション数が変動
```

---

このフロー図により、コンポーネントの内部動作を完全に理解できます。
