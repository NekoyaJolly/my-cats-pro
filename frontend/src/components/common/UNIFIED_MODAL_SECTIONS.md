# UnifiedModal セクション機能の使用例

## 概要

`UnifiedModal` コンポーネントに `sections` プロパティが追加されました。これにより、モーダル内のコンテンツを複数のセクションに分割し、各セクション間に自動的にラベル付きDividerを挿入できます。

## 基本的な使い方

### 従来の方法（後方互換性あり）

```tsx
import { UnifiedModal } from '@/components/common';

<UnifiedModal opened={opened} onClose={onClose} title="編集">
  <TextInput label="名前" />
  <TextInput label="メール" />
  <Button>保存</Button>
</UnifiedModal>
```

### 新しいセクション機能を使う方法

```tsx
import { UnifiedModal, type ModalSection } from '@/components/common';

const sections: ModalSection[] = [
  {
    label: '基本情報',
    content: (
      <>
        <TextInput label="名前" />
        <TextInput label="メール" />
      </>
    ),
  },
  {
    label: '詳細設定',
    content: (
      <>
        <Select label="種別" data={[...]} />
        <Textarea label="備考" />
      </>
    ),
  },
  {
    label: '操作',
    content: (
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>キャンセル</Button>
        <Button onClick={onSubmit}>保存</Button>
      </Group>
    ),
  },
];

<UnifiedModal 
  opened={opened} 
  onClose={onClose} 
  title="猫の情報編集"
  sections={sections}
/>
```

## 実際の例

### 猫の編集モーダルをセクションで分割

```tsx
'use client';

import { useState } from 'react';
import { TextInput, Select, Textarea, Button, Group, Grid } from '@mantine/core';
import { UnifiedModal, type ModalSection } from '@/components/common';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';

export function CatEditModalWithSections({
  opened,
  onClose,
  catId,
  onSuccess,
}: CatEditModalProps) {
  const [form, setForm] = useState({
    name: '',
    gender: 'MALE',
    breedId: '',
    coatColorId: '',
    birthDate: '',
    microchipNumber: '',
    registrationNumber: '',
    description: '',
    tagIds: [],
  });

  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <Grid gutter="md">
          <Grid.Col span={6}>
            <TextInput
              label="名前"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="性別"
              value={form.gender}
              onChange={(value) => setForm(prev => ({ ...prev, gender: value || '' }))}
              data={GENDER_OPTIONS}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="生年月日"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm(prev => ({ ...prev, birthDate: e.target.value }))}
              required
            />
          </Grid.Col>
        </Grid>
      ),
    },
    {
      label: '詳細情報',
      content: (
        <Grid gutter="md">
          <Grid.Col span={6}>
            <Select label="品種" {...} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select label="色柄" {...} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="マイクロチップ番号" {...} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="登録番号" {...} />
          </Grid.Col>
        </Grid>
      ),
    },
    {
      label: 'その他',
      content: (
        <>
          <Textarea
            label="詳細説明"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <TagSelector {...} />
        </>
      ),
    },
    {
      // ラベルなしのセクションも可能
      content: (
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            leftSection={<IconX size={16} />}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            leftSection={<IconDeviceFloppy size={16} />}
          >
            保存
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="猫の情報編集"
      size="lg"
      sections={sections}
    />
  );
}
```

## セクション機能の利点

1. **境界の明確化**: 各セクション間にラベル付きDividerが自動挿入され、どこまでが1つのセクションか明確
2. **統一性**: すべてのモーダルで一貫したセクション区切りスタイル
3. **保守性向上**: セクション構造を配列で管理できるため、追加・削除・並び替えが容易
4. **可読性**: セクションごとに論理的にコードを分割でき、コードの可読性が向上

## 型定義

```typescript
interface ModalSection {
  /** セクションのラベル（Dividerに表示）。省略可能 */
  label?: string;
  /** セクションのコンテンツ */
  content: ReactNode;
}

type UnifiedModalProps = Omit<ModalProps, 'children'> & {
  addContentPadding?: boolean;
} & (
  | {
      children: ReactNode;
      sections?: never;
    }
  | {
      children?: never;
      sections: ModalSection[];
    }
);
```

## 注意事項

- `children` と `sections` は相互排他的です。どちらか一方のみを使用してください。
- TypeScriptが型チェックで両方を同時に使用することを防ぎます。
- 既存のモーダルは `children` を使い続けることができ、後方互換性が保たれています。
- セクションの `label` は省略可能です。ラベルがない場合、Dividerは表示されません（最初のセクション以外）。
