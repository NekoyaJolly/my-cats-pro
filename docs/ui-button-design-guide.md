# ボタンデザイン統一ガイド

## 概要

プロジェクト全体でCRUD操作ボタンのデザインを統一し、可読性と操作性を向上させるためのガイドラインです。

## デザインポリシー

### 基本方針

1. **可読性重視**: アウトラインベースで背景を塗りつぶさないことで、テキストの可読性を向上
2. **色による直感的な理解**: 操作の種類を色で識別できるようにする
3. **一貫性**: プロジェクト全体で同じ操作には同じデザインを適用
4. **アクセシビリティ**: 色だけでなくアイコンも併用して情報を伝達

## ボタンスタイル定義

### 1. 作成・追加アクション（Create/Add）

**用途**: 新しいデータの作成、要素の追加

```tsx
<Button variant="outline" color="blue" leftSection={<IconPlus size={16} />}>
  新規登録
</Button>
```

- **variant**: `outline`
- **color**: `blue`
- **icon**: `IconPlus`
- **使用例**: 新規猫登録、ケア予定追加、タグ作成

### 2. 編集アクション（Edit/Update）

**用途**: 既存データの編集・更新

```tsx
<Button variant="outline" color="yellow" leftSection={<IconEdit size={16} />}>
  編集
</Button>
```

- **variant**: `outline`
- **color**: `yellow`
- **icon**: `IconEdit`
- **使用例**: 猫情報編集、ケア予定編集、設定変更

### 3. 削除アクション（Delete）

**用途**: データの削除（危険な操作）

```tsx
<Button variant="outline" color="red" leftSection={<IconTrash size={16} />}>
  削除
</Button>
```

- **variant**: `outline`（確認モーダル内では`filled`）
- **color**: `red`
- **icon**: `IconTrash`
- **使用例**: 猫データ削除、ケア予定削除、タグ削除
- **注意**: 削除確認モーダル内の最終決定ボタンは`variant="filled"`で強調

### 4. 表示・詳細アクション（View/Detail）

**用途**: 詳細情報の閲覧、安全な参照操作

```tsx
<Button variant="outline" color="gray" leftSection={<IconEye size={16} />}>
  詳細
</Button>
```

- **variant**: `outline`
- **color**: `gray`
- **icon**: `IconEye`
- **使用例**: ケア詳細表示、血統表表示、詳細情報モーダル

### 5. 保存・確認アクション（Save/Confirm）

**用途**: フォーム送信、最終確認（ポジティブアクション）

```tsx
<Button variant="filled" color="blue" leftSection={<IconDeviceFloppy size={16} />}>
  保存
</Button>

<Button variant="filled" color="blue" leftSection={<IconCheck size={16} />}>
  確認
</Button>
```

- **variant**: `filled`（背景塗りつぶし）
- **color**: `blue`
- **icon**: `IconDeviceFloppy` または `IconCheck`
- **使用例**: フォーム保存、登録確認、設定適用
- **注意**: 重要な決定操作のため、唯一`filled`を使用

### 6. キャンセル・戻るアクション（Cancel/Back）

**用途**: 操作の中止、前画面への遷移

```tsx
<Button variant="subtle" color="gray" leftSection={<IconX size={16} />}>
  キャンセル
</Button>

<Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />}>
  戻る
</Button>
```

- **variant**: `subtle`
- **color**: `gray`
- **icon**: `IconX` または `IconArrowLeft`
- **使用例**: モーダルキャンセル、一覧へ戻る

### 7. 更新・リフレッシュアクション（Refresh）

**用途**: データの再読み込み

```tsx
<Button variant="subtle" leftSection={<IconRefresh size={16} />}>
  更新
</Button>
```

- **variant**: `subtle`
- **icon**: `IconRefresh`
- **使用例**: データリフレッシュ、再取得

## テーブル行アクション

テーブル内の各行に配置する小さなアクションボタンには`ActionIcon`を使用：

```tsx
<Group gap="xs" justify="center">
  {/* 表示 */}
  <ActionIcon variant="light" color="gray" size="sm">
    <IconEye size={16} />
  </ActionIcon>
  
  {/* 編集 */}
  <ActionIcon variant="light" color="yellow" size="sm">
    <IconEdit size={16} />
  </ActionIcon>
  
  {/* 削除 */}
  <ActionIcon variant="light" color="red" size="sm">
    <IconTrash size={16} />
  </ActionIcon>
</Group>
```

## モーダルフッターのレイアウト

モーダルのボタン配置は以下のパターンに統一：

### 作成モーダル

```tsx
<Group justify="flex-end">
  <Button variant="subtle" color="gray">キャンセル</Button>
  <Button variant="filled" color="blue">登録</Button>
</Group>
```

### 編集モーダル

```tsx
<Group justify="flex-end">
  <Button variant="subtle" color="gray">キャンセル</Button>
  <Button variant="filled" color="blue">保存</Button>
</Group>
```

### 削除確認モーダル

```tsx
<Group justify="flex-end">
  <Button variant="subtle" color="gray">キャンセル</Button>
  <Button variant="filled" color="red">削除</Button>
</Group>
```

## ActionButtonコンポーネントの使用

共通コンポーネント`ActionButton`を使用することで、より簡潔に記述できます：

```tsx
import { ActionButton } from '@/components/ActionButton';

// 自動的にスタイルとアイコンが適用される
<ActionButton action="create">新規登録</ActionButton>
<ActionButton action="edit">編集</ActionButton>
<ActionButton action="delete">削除</ActionButton>
<ActionButton action="view">詳細</ActionButton>
<ActionButton action="save">保存</ActionButton>
<ActionButton action="cancel">キャンセル</ActionButton>
```

## カラーパレット

| アクション | カラー | 用途 |
|-----------|-------|------|
| 作成・追加 | `blue` | ポジティブな新規操作 |
| 編集 | `yellow` | 注意を引く変更操作 |
| 削除 | `red` | 危険な操作 |
| 表示・詳細 | `gray` | 安全な閲覧操作 |
| 保存・確認 | `blue` | 重要な決定 |
| キャンセル・戻る | `gray` | 中立的な操作 |

## 実装時の注意点

1. **一貫性を保つ**: 同じ操作には必ず同じスタイルを適用
2. **アイコンを使用**: テキストだけでなくアイコンで視覚的に識別可能に
3. **色の意味を尊重**: 赤は削除など危険な操作のみに使用
4. **適切なvariantを選択**: 
   - 主要アクション: `outline`
   - 決定操作: `filled`
   - 控えめな操作: `subtle`
5. **ローディング状態を考慮**: `loading`プロパティを適切に使用

## 移行手順

既存のボタンを段階的に移行する際の手順：

1. **優先度の高いページから着手**: ユーザー接触頻度の高いページ（猫一覧、ケア管理など）
2. **ページ単位で完全に移行**: 部分的な移行は避け、1ページ内は完全に統一
3. **テストを実施**: 各アクションが正しく動作するか確認
4. **UIレビュー**: 可読性と操作性が向上しているか確認

## デモページ

統一ボタンのデモは以下のURLで確認できます：

```
http://localhost:3000/demo/action-buttons
```

すべてのボタンスタイルとその使用例を一覧できます。

## まとめ

このガイドラインに従うことで：

- ✅ **可読性向上**: アウトラインベースで背景がクリーン
- ✅ **操作性向上**: 色とアイコンで直感的に操作を識別
- ✅ **統一感**: プロジェクト全体で一貫したUI
- ✅ **保守性**: 共通コンポーネントで管理が容易
- ✅ **アクセシビリティ**: 色覚に依存しないアイコン表示

## 参考リンク

- [Mantine Button Documentation](https://mantine.dev/core/button/)
- [Mantine ActionIcon Documentation](https://mantine.dev/core/action-icon/)
- [Tabler Icons](https://tabler.io/icons)
