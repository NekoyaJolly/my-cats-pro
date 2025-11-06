# 共通コンポーネント

## GenderBadge

性別バッジを統一されたデザインで表示するコンポーネント。

### 使用方法

```tsx
import { GenderBadge } from '@/components/GenderBadge';

// 基本的な使用
<GenderBadge gender={cat.gender} />

// サイズ指定
<GenderBadge gender="MALE" size="xs" />
<GenderBadge gender="FEMALE" size="sm" />
<GenderBadge gender="NEUTER" size="md" />

// バリアント指定
<GenderBadge gender={cat.gender} variant="filled" />
<GenderBadge gender={cat.gender} variant="light" />
```

### Props

- `gender`: `'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY' | 'オス' | 'メス'`
- `size`: `MantineSize` (デフォルト: `'sm'`)
- `variant`: `'filled' | 'light' | 'outline' | 'dot' | 'default'` (デフォルト: `'light'`)

### ユーティリティ関数

```tsx
import { getGenderLabel, getGenderColor } from '@/components/GenderBadge';

// 性別をテキストに変換
const label = getGenderLabel('MALE'); // "オス"

// 性別の色を取得
const color = getGenderColor('FEMALE'); // "pink"
```

### 色の対応

- **オス (MALE)**: 青 (blue)
- **メス (FEMALE)**: ピンク (pink)
- **去勢 (NEUTER)**: グレー (gray)
- **避妊 (SPAY)**: グレー (gray)

---

## TagDisplay

タグを統一されたデザインで表示するコンポーネント。

### 使用方法

```tsx
import { TagDisplay } from '@/components/TagSelector';

<TagDisplay 
  tagIds={cat.tags.map(t => t.tag.id)} 
  size="sm" 
  categories={tagCategories} 
/>
```

### Props

- `tagIds`: タグIDの配列
- `categories`: タグカテゴリの配列（オプション）
- `filters`: タグカテゴリフィルター（オプション）
- `size`: `'xs' | 'sm' | 'md' | 'lg'` (デフォルト: `'sm'`)

---

## 使用例

### 猫一覧ページ

```tsx
<Table.Td>
  <GenderBadge gender={cat.gender} size="sm" />
</Table.Td>
```

### 子猫管理ページ

```tsx
<Group gap="md">
  <Text fw={500}>{kitten.name}</Text>
  <GenderBadge gender={kitten.gender} size="sm" />
  <TagDisplay 
    tagIds={kitten.tags} 
    size="xs" 
    categories={categories} 
  />
</Group>
```

### カードビュー

```tsx
<Card>
  <Group>
    <Text>{cat.name}</Text>
    <GenderBadge gender={cat.gender} size="xs" variant="filled" />
  </Group>
  <TagDisplay tagIds={cat.tags} size="xs" categories={categories} />
</Card>
```
