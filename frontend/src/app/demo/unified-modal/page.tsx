'use client';

import { Container, Title, Text, Stack, Button, Paper, Code, Group } from '@mantine/core';
import { UnifiedModalSectionsDemo } from '@/components/common/UnifiedModalSectionsDemo';

/**
 * UnifiedModal セクション機能のデモページ
 * 
 * セクション分割されたモーダルの使用例とビジュアルデモ
 */
export default function UnifiedModalDemoPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">UnifiedModal セクション機能デモ</Title>
          <Text c="dimmed" size="lg">
            モーダルをセクションで分割し、自動的にラベル付きDividerを挿入する機能のデモ
          </Text>
        </div>

        <Paper shadow="sm" p="xl" withBorder>
          <Stack gap="lg">
            <div>
              <Title order={2} size="h3" mb="sm">機能概要</Title>
              <Text>
                UnifiedModalコンポーネントに<Code>sections</Code>プロパティを追加しました。
                これにより、モーダル内のコンテンツを複数のセクションに分割し、各セクション間に
                自動的にラベル付きDividerを挿入できます。
              </Text>
            </div>

            <div>
              <Title order={3} size="h4" mb="xs">主な利点</Title>
              <Stack gap="xs" ml="md">
                <Text>• <strong>境界の明確化</strong>: セクション間にラベル付きDividerが自動挿入され、どこまでが1つのセクションか明確</Text>
                <Text>• <strong>統一性</strong>: すべてのモーダルで一貫したセクション区切りスタイル</Text>
                <Text>• <strong>保守性向上</strong>: セクション構造を配列で管理できるため、追加・削除・並び替えが容易</Text>
                <Text>• <strong>可読性</strong>: セクションごとに論理的にコードを分割でき、コードの可読性が向上</Text>
              </Stack>
            </div>

            <div>
              <Title order={3} size="h4" mb="xs">デモ</Title>
              <Text mb="md">
                以下のボタンをクリックして、セクション分割されたモーダルの動作を確認できます。
              </Text>
              <UnifiedModalSectionsDemo />
            </div>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="xl" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">基本的な使い方</Title>
            
            <div>
              <Title order={3} size="h4" mb="xs">1. 型をインポート</Title>
              <Code block>
{`import { UnifiedModal, type ModalSection } from '@/components/common';`}
              </Code>
            </div>

            <div>
              <Title order={3} size="h4" mb="xs">2. セクション配列を定義</Title>
              <Code block>
{`const sections: ModalSection[] = [
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
    // ラベルなしのセクションも可能
    content: (
      <Group justify="flex-end">
        <Button>保存</Button>
      </Group>
    ),
  },
];`}
              </Code>
            </div>

            <div>
              <Title order={3} size="h4" mb="xs">3. モーダルに渡す</Title>
              <Code block>
{`<UnifiedModal 
  opened={opened} 
  onClose={onClose} 
  title="編集"
  sections={sections}
/>`}
              </Code>
            </div>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="xl" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">型定義</Title>
            
            <Code block>
{`interface ModalSection {
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
);`}
            </Code>

            <Text mt="md" c="dimmed">
              <Code>children</Code>と<Code>sections</Code>は相互排他的です。
              TypeScriptが型レベルで両方を同時に使用することを防ぎます。
            </Text>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="xl" withBorder>
          <Stack gap="md">
            <Title order={2} size="h3">後方互換性</Title>
            
            <Text>
              既存のモーダルは<Code>children</Code>プロパティを使い続けることができます。
              変更は不要で、後方互換性が完全に保たれています。
            </Text>

            <Code block>
{`// 従来の方法（引き続き動作）
<UnifiedModal opened={opened} onClose={onClose} title="編集">
  <TextInput label="名前" />
  <Button>保存</Button>
</UnifiedModal>`}
            </Code>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="xl" withBorder bg="blue.0">
          <Stack gap="sm">
            <Title order={2} size="h3">参考資料</Title>
            <Group gap="md">
              <Button
                component="a"
                href="https://github.com/NekoyaJolly/my-cats-pro"
                target="_blank"
                variant="light"
              >
                GitHub リポジトリ
              </Button>
              <Text c="dimmed">
                詳細な実装例とテストは
                <Code>frontend/src/components/common/UNIFIED_MODAL_SECTIONS.md</Code>
                を参照してください。
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
