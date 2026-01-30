'use client';

import { useState } from 'react';
import { Button, TextInput, Select, Textarea, Group, Grid } from '@mantine/core';
import { UnifiedModal, type ModalSection } from './UnifiedModal';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';

/**
 * UnifiedModalのセクション機能のデモコンポーネント
 * 
 * 使用例:
 * ```tsx
 * import { UnifiedModalSectionsDemo } from '@/components/common/UnifiedModalSectionsDemo';
 * 
 * <UnifiedModalSectionsDemo />
 * ```
 */
export function UnifiedModalSectionsDemo() {
  const [opened, setOpened] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    priority: '',
    description: '',
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setOpened(false);
  };

  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <Grid gutter="md">
          <Grid.Col span={6}>
            <TextInput
              label="名前"
              placeholder="山田太郎"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="メールアドレス"
              type="email"
              placeholder="example@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </Grid.Col>
        </Grid>
      ),
    },
    {
      label: '分類設定',
      content: (
        <Grid gutter="md">
          <Grid.Col span={6}>
            <Select
              label="カテゴリ"
              placeholder="選択してください"
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value || '' }))}
              data={[
                { value: 'general', label: '一般' },
                { value: 'important', label: '重要' },
                { value: 'urgent', label: '緊急' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="優先度"
              placeholder="選択してください"
              value={formData.priority}
              onChange={(value) => setFormData(prev => ({ ...prev, priority: value || '' }))}
              data={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
              ]}
            />
          </Grid.Col>
        </Grid>
      ),
    },
    {
      label: '詳細情報',
      content: (
        <Textarea
          label="説明"
          placeholder="詳細な説明を入力してください"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
        />
      ),
    },
    {
      // ラベルなしのセクション（ボタングループ）
      content: (
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => setOpened(false)}
            leftSection={<IconX size={16} />}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            leftSection={<IconDeviceFloppy size={16} />}
          >
            保存
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Button onClick={() => setOpened(true)}>
        セクション付きモーダルを開く（デモ）
      </Button>

      <UnifiedModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="セクション機能デモ"
        size="lg"
        sections={sections}
      />
    </>
  );
}
