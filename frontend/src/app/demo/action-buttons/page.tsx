'use client';

/**
 * ActionButtonの使用例デモページ
 * 統一されたCRUD操作ボタンのデザインガイド
 */

import { Container, Title, Text, Stack, Group, Card, Divider, Code, Paper, SimpleGrid, Center, Badge } from '@mantine/core';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import {
  IconPaw,
  IconCat,
  IconDog,
  IconBone,
  IconHeart,
  IconHeartFilled,
  IconBabyCarriage,
  IconUsers,
  IconCalendar,
  IconClock,
  IconPill,
  IconVaccine,
  IconStethoscope,
  IconPrescription,
  IconReportMedical,
  IconActivity,
  IconEye,
  IconEyeOff,
  IconGenderMale,
  IconGenderFemale,
  IconMoodHappy,
  IconMoodSad,
  IconStar,
  IconStarFilled,
  IconCertificate,
  IconBriefcase,
  IconHome,
  IconBuildingStore,
  IconScale,
  IconRuler,
  IconTemperature,
} from '@tabler/icons-react';
import { CatTexturedCard, CardSpreadDemo, type TextureType, type HoloPatternType, type RarityType, type DemoCat } from '@/components/cards';

// サンプル猫データ（レアリティ別）
const SAMPLE_CATS: Record<string, DemoCat> = {
  common: { 
    id: '1', 
    name: 'ミケ', 
    gender: 'FEMALE', 
    breed: { id: '1', name: '雑種' }, 
    coatColor: { id: '1', name: '三毛' } 
  },
  uncommon: { 
    id: '2', 
    name: 'タマ', 
    gender: 'MALE', 
    breed: { id: '2', name: 'アメショー' }, 
    coatColor: { id: '2', name: 'シルバータビー' } 
  },
  rare: { 
    id: '3', 
    name: 'ソラ', 
    gender: 'MALE', 
    breed: { id: '3', name: 'スコティッシュ' }, 
    coatColor: { id: '3', name: 'ブルー' } 
  },
  superRare: { 
    id: '4', 
    name: 'ルナ', 
    gender: 'FEMALE', 
    breed: { id: '4', name: 'ペルシャ' }, 
    coatColor: { id: '4', name: 'チンチラシルバー' }, 
    registrationNumber: 'ABC-12345' 
  },
  ultraRare: { 
    id: '5', 
    name: 'レオ', 
    gender: 'MALE', 
    breed: { id: '5', name: 'ベンガル' }, 
    coatColor: { id: '5', name: 'ブラウンスポテッド' }, 
    registrationNumber: 'XYZ-67890' 
  },
  legendary: { 
    id: '6', 
    name: 'キング', 
    gender: 'MALE', 
    breed: { id: '6', name: 'メインクーン' }, 
    coatColor: { id: '6', name: 'ブラウンタビー' }, 
    registrationNumber: 'LEGEND-001'
  },
};

// 質感一覧（9種類）
const TEXTURE_TYPES: TextureType[] = ['matte', 'glossy', 'embossed', 'linen', 'washi', 'metallic', 'metallicGold', 'leather', 'wood'];

// ホログラム加工一覧（4種類）
const HOLO_PATTERNS: HoloPatternType[] = ['stripe', 'dot', 'prism', 'stardust'];

// レアリティ一覧（6段階）
const RARITY_TYPES: RarityType[] = ['common', 'uncommon', 'rare', 'superRare', 'ultraRare', 'legendary'];

export default function ActionButtonDemoPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            統一アクションボタンガイド
          </Title>
          <Text c="dimmed">
            プロジェクト全体で統一されたCRUD操作ボタンのデザインシステム
          </Text>
        </div>

        <Divider />

        {/* 基本的な使い方 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            基本的な使い方
          </Title>
          <Stack gap="lg">
            <div>
              <Text size="sm" fw={500} mb="xs">
                作成・追加アクション
              </Text>
              <Group>
                <ActionButton action="create">新規登録</ActionButton>
                <ActionButton action="create" size="sm">
                  追加
                </ActionButton>
                <ActionButton action="create" size="xs">
                  小さいボタン
                </ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="create">新規登録</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                編集アクション
              </Text>
              <Group>
                <ActionButton action="edit">編集</ActionButton>
                <ActionButton action="edit" size="sm">
                  編集
                </ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="edit">編集</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                削除アクション
              </Text>
              <Group>
                <ActionButton action="delete">削除</ActionButton>
                <ActionButton action="delete" size="sm">
                  削除
                </ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="delete">削除</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                表示・詳細アクション
              </Text>
              <Group>
                <ActionButton action="view">詳細</ActionButton>
                <ActionButton action="view" size="sm">
                  表示
                </ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="view">詳細</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                保存・確認アクション
              </Text>
              <Group>
                <ActionButton action="save">保存</ActionButton>
                <ActionButton action="confirm">確認</ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="save">保存</ActionButton>
<ActionButton action="confirm">確認</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                キャンセル・戻るアクション
              </Text>
              <Group>
                <ActionButton action="cancel">キャンセル</ActionButton>
                <ActionButton action="back">戻る</ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="cancel">キャンセル</ActionButton>
<ActionButton action="back">戻る</ActionButton>`}
                </Code>
              </Paper>
            </div>
          </Stack>
        </Card>

        {/* モーダルでの使用例 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            モーダルでの使用例
          </Title>
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} mb="xs">
                作成モーダルのフッター
              </Text>
              <Group justify="flex-end">
                <ActionButton action="cancel">キャンセル</ActionButton>
                <ActionButton action="create">登録</ActionButton>
              </Group>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                編集モーダルのフッター
              </Text>
              <Group justify="flex-end">
                <ActionButton action="cancel">キャンセル</ActionButton>
                <ActionButton action="save">保存</ActionButton>
              </Group>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                削除確認モーダルのフッター
              </Text>
              <Group justify="flex-end">
                <ActionButton action="cancel">キャンセル</ActionButton>
                <ActionButton action="delete">削除</ActionButton>
              </Group>
            </div>
          </Stack>
        </Card>

        {/* テーブルでの使用例 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            テーブル行アクションでの使用例
          </Title>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              テーブルの各行に表示する小さなアクションボタン
            </Text>
            <Group>
              <ActionIconButton action="view" />
              <ActionIconButton action="edit" />
              <ActionIconButton action="delete" />
            </Group>
            <Paper bg="gray.0" p="xs">
              <Code block>
                {`<ActionIconButton action="view" />
<ActionIconButton action="edit" />
<ActionIconButton action="delete" />`}
              </Code>
            </Paper>
          </Stack>
        </Card>

        {/* カスタマイズ例 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            カスタマイズ例
          </Title>
          <Stack gap="lg">
            <div>
              <Text size="sm" fw={500} mb="xs">
                アイコンを非表示
              </Text>
              <Group>
                <ActionButton action="create" hideIcon>
                  新規登録
                </ActionButton>
                <ActionButton action="edit" hideIcon>
                  編集
                </ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="create" hideIcon>新規登録</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                フルワイドボタン
              </Text>
              <ActionButton action="create" fullWidth>
                フルワイドボタン
              </ActionButton>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="create" fullWidth>フルワイドボタン</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                ローディング状態
              </Text>
              <Group>
                <ActionButton action="save" loading>
                  保存中...
                </ActionButton>
                <ActionButton action="delete" loading>
                  削除中...
                </ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="save" loading>保存中...</ActionButton>`}
                </Code>
              </Paper>
            </div>

            <div>
              <Text size="sm" fw={500} mb="xs">
                無効化状態
              </Text>
              <Group>
                <ActionButton action="create" disabled>
                  新規登録
                </ActionButton>
                <ActionButton action="edit" disabled>
                  編集
                </ActionButton>
              </Group>
              <Paper bg="gray.0" p="xs" mt="xs">
                <Code block>
                  {`<ActionButton action="create" disabled>新規登録</ActionButton>`}
                </Code>
              </Paper>
            </div>
          </Stack>
        </Card>

        {/* デザインガイドライン */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            デザインガイドライン
          </Title>
          <Stack gap="md">
            <div>
              <Text fw={500} mb="xs">
                📘 作成・追加アクション（青・outline）
              </Text>
              <Text size="sm" c="dimmed">
                新しいデータを作成する際に使用。視認性が高く、主要なアクションとして目立つ。
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                ✏️ 編集アクション（黄・outline）
              </Text>
              <Text size="sm" c="dimmed">
                既存データを編集する際に使用。警告色ではないが注目を集める黄色。
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                🗑️ 削除アクション（赤・outline）
              </Text>
              <Text size="sm" c="dimmed">
                データを削除する際に使用。危険な操作であることを示す赤色。
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                👁️ 表示・詳細アクション（グレー・outline）
              </Text>
              <Text size="sm" c="dimmed">
                データを閲覧するだけの安全な操作。控えめなグレー。
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                💾 保存・確認アクション（青・outline）
              </Text>
              <Text size="sm" c="dimmed">
                フォーム送信などの最終確認。作成アクション同様に青を基調として統一。
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">
                ❌ キャンセル・戻るアクション（グレー・subtle）
              </Text>
              <Text size="sm" c="dimmed">
                操作を中止する場合に使用。最も控えめなデザイン。
              </Text>
            </div>
          </Stack>
        </Card>

        {/* 猫関連アイコン一覧 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            🐱 猫・動物関連アイコン一覧
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            プロジェクトで使用可能な猫や動物に関連するアイコンです。Tabler Iconsと絵文字の2種類があります。
          </Text>

          {/* 絵文字セクション */}
          <Card withBorder padding="md" mb="lg" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Stack gap="md">
              <div>
                <Group gap="xs" mb="xs">
                  <Title order={4}>🎨 絵文字アイコン</Title>
                  <Badge color="blue" variant="light">推奨</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  iPhone/Androidで表示される絵文字です。コードは不要で、そのまま貼り付けるだけで使えます。
                </Text>
              </div>

              <div>
                <Text fw={500} mb="sm" size="sm">猫の絵文字</Text>
                <SimpleGrid cols={{ base: 4, sm: 6, md: 8 }} spacing="md">
                  {[
                    { emoji: '🐱', name: '猫の顔' },
                    { emoji: '🐈', name: '猫' },
                    { emoji: '🐈‍⬛', name: '黒猫' },
                    { emoji: '😺', name: '笑顔の猫' },
                    { emoji: '😸', name: 'にやける猫' },
                    { emoji: '😹', name: '笑う猫' },
                    { emoji: '😻', name: 'ハートの目の猫' },
                    { emoji: '😼', name: 'にやりとする猫' },
                    { emoji: '😽', name: 'キスする猫' },
                    { emoji: '🙀', name: 'びっくりした猫' },
                    { emoji: '😿', name: '泣く猫' },
                    { emoji: '😾', name: '怒った猫' },
                    { emoji: '🐾', name: '肉球' },
                  ].map(({ emoji, name }) => (
                    <Card key={name} withBorder padding="xs" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(emoji)}>
                      <Center>
                        <Text size="2rem" style={{ lineHeight: 1 }}>{emoji}</Text>
                      </Center>
                      <Text size="9px" ta="center" c="dimmed" mt={4} style={{ lineHeight: 1.2 }}>
                        {name}
                      </Text>
                    </Card>
                  ))}
                </SimpleGrid>
                <Text size="xs" c="dimmed" mt="xs">💡 クリックでコピーできます</Text>
              </div>

              <div>
                <Text fw={500} mb="sm" size="sm">その他の動物絵文字</Text>
                <SimpleGrid cols={{ base: 4, sm: 6, md: 8 }} spacing="md">
                  {[
                    { emoji: '🐕', name: '犬' },
                    { emoji: '🐶', name: '犬の顔' },
                    { emoji: '🐩', name: 'プードル' },
                    { emoji: '🦮', name: '盲導犬' },
                    { emoji: '🐕‍🦺', name: '介助犬' },
                    { emoji: '🐰', name: 'うさぎ' },
                    { emoji: '🐹', name: 'ハムスター' },
                    { emoji: '🐭', name: 'ネズミ' },
                    { emoji: '🦊', name: 'キツネ' },
                    { emoji: '🐻', name: 'クマ' },
                    { emoji: '🐼', name: 'パンダ' },
                    { emoji: '🦁', name: 'ライオン' },
                    { emoji: '🐯', name: 'トラ' },
                  ].map(({ emoji, name }) => (
                    <Card key={name} withBorder padding="xs" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(emoji)}>
                      <Center>
                        <Text size="2rem" style={{ lineHeight: 1 }}>{emoji}</Text>
                      </Center>
                      <Text size="9px" ta="center" c="dimmed" mt={4} style={{ lineHeight: 1.2 }}>
                        {name}
                      </Text>
                    </Card>
                  ))}
                </SimpleGrid>
              </div>

              <div>
                <Text fw={500} mb="sm" size="sm">関連絵文字</Text>
                <SimpleGrid cols={{ base: 4, sm: 6, md: 8 }} spacing="md">
                  {[
                    { emoji: '❤️', name: 'ハート' },
                    { emoji: '💙', name: '青ハート' },
                    { emoji: '💚', name: '緑ハート' },
                    { emoji: '🩷', name: 'ピンクハート' },
                    { emoji: '🍼', name: '哺乳瓶' },
                    { emoji: '👶', name: '赤ちゃん' },
                    { emoji: '🏠', name: '家' },
                    { emoji: '🏥', name: '病院' },
                    { emoji: '💊', name: '薬' },
                    { emoji: '💉', name: '注射' },
                    { emoji: '📅', name: 'カレンダー' },
                    { emoji: '⏰', name: '時計' },
                    { emoji: '📝', name: 'メモ' },
                    { emoji: '⭐', name: '星' },
                    { emoji: '✨', name: 'きらきら' },
                  ].map(({ emoji, name }) => (
                    <Card key={name} withBorder padding="xs" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(emoji)}>
                      <Center>
                        <Text size="2rem" style={{ lineHeight: 1 }}>{emoji}</Text>
                      </Center>
                      <Text size="9px" ta="center" c="dimmed" mt={4} style={{ lineHeight: 1.2 }}>
                        {name}
                      </Text>
                    </Card>
                  ))}
                </SimpleGrid>
              </div>

              <Paper bg="white" p="sm" withBorder>
                <Text fw={500} size="sm" mb="xs">使用方法</Text>
                <Code block>
{`// そのまま文字列として使用
<Text>🐱 猫の情報</Text>
<Button>🐾 肉球を押す</Button>

// アプリタイトルのように
<Text fw={700}>
  <span style={{ fontSize: '1.4rem' }}>🐈</span> MyCats
</Text>

// バッジやアイコンとして
<Badge leftSection="🐱">猫</Badge>
<Avatar>🐈</Avatar>`}
                </Code>
              </Paper>
            </Stack>
          </Card>

          {/* Tabler Iconsセクション */}
          <div>
            <Group gap="xs" mb="sm">
              <Title order={4}>🎨 Tabler Icons</Title>
              <Badge color="gray" variant="light">SVGアイコン</Badge>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              プログラマブルなSVGアイコンライブラリです。サイズや色を自由に調整できます。
            </Text>
          </div>
          
          <Stack gap="lg">
            <div>
              <Text fw={500} mb="sm">基本的な猫・動物アイコン</Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconPaw size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconPaw</Text>
                  <Text size="xs" ta="center" c="dimmed">肉球</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconCat size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconCat</Text>
                  <Text size="xs" ta="center" c="dimmed">猫</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconDog size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconDog</Text>
                  <Text size="xs" ta="center" c="dimmed">犬</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconBone size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconBone</Text>
                  <Text size="xs" ta="center" c="dimmed">骨</Text>
                </Card>
              </SimpleGrid>
            </div>

            <div>
              <Text fw={500} mb="sm">繁殖・家族関連</Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconHeart size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconHeart</Text>
                  <Text size="xs" ta="center" c="dimmed">ハート（線）</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconHeartFilled size={32} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconHeartFilled</Text>
                  <Text size="xs" ta="center" c="dimmed">ハート（塗）</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconBabyCarriage size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconBabyCarriage</Text>
                  <Text size="xs" ta="center" c="dimmed">ベビーカー</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconUsers size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconUsers</Text>
                  <Text size="xs" ta="center" c="dimmed">複数ユーザー</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconGenderMale size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconGenderMale</Text>
                  <Text size="xs" ta="center" c="dimmed">オス</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconGenderFemale size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconGenderFemale</Text>
                  <Text size="xs" ta="center" c="dimmed">メス</Text>
                </Card>
              </SimpleGrid>
            </div>

            <div>
              <Text fw={500} mb="sm">健康・医療関連</Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconPill size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconPill</Text>
                  <Text size="xs" ta="center" c="dimmed">薬</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconVaccine size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconVaccine</Text>
                  <Text size="xs" ta="center" c="dimmed">ワクチン</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconStethoscope size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconStethoscope</Text>
                  <Text size="xs" ta="center" c="dimmed">聴診器</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconPrescription size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconPrescription</Text>
                  <Text size="xs" ta="center" c="dimmed">処方箋</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconReportMedical size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconReportMedical</Text>
                  <Text size="xs" ta="center" c="dimmed">医療記録</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconActivity size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconActivity</Text>
                  <Text size="xs" ta="center" c="dimmed">活動量</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconTemperature size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconTemperature</Text>
                  <Text size="xs" ta="center" c="dimmed">体温</Text>
                </Card>
              </SimpleGrid>
            </div>

            <div>
              <Text fw={500} mb="sm">スケジュール・記録関連</Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconCalendar size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconCalendar</Text>
                  <Text size="xs" ta="center" c="dimmed">カレンダー</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconClock size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconClock</Text>
                  <Text size="xs" ta="center" c="dimmed">時計</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconCertificate size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconCertificate</Text>
                  <Text size="xs" ta="center" c="dimmed">証明書</Text>
                </Card>
              </SimpleGrid>
            </div>

            <div>
              <Text fw={500} mb="sm">状態・評価関連</Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconEye size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconEye</Text>
                  <Text size="xs" ta="center" c="dimmed">表示</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconEyeOff size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconEyeOff</Text>
                  <Text size="xs" ta="center" c="dimmed">非表示</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconMoodHappy size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconMoodHappy</Text>
                  <Text size="xs" ta="center" c="dimmed">良好</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconMoodSad size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconMoodSad</Text>
                  <Text size="xs" ta="center" c="dimmed">不調</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconStar size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconStar</Text>
                  <Text size="xs" ta="center" c="dimmed">星（線）</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconStarFilled size={32} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconStarFilled</Text>
                  <Text size="xs" ta="center" c="dimmed">星（塗）</Text>
                </Card>
              </SimpleGrid>
            </div>

            <div>
              <Text fw={500} mb="sm">場所・施設関連</Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconHome size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconHome</Text>
                  <Text size="xs" ta="center" c="dimmed">家</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconBuildingStore size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconBuildingStore</Text>
                  <Text size="xs" ta="center" c="dimmed">店舗</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconBriefcase size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconBriefcase</Text>
                  <Text size="xs" ta="center" c="dimmed">ケース</Text>
                </Card>
              </SimpleGrid>
            </div>

            <div>
              <Text fw={500} mb="sm">測定・計測関連</Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconScale size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconScale</Text>
                  <Text size="xs" ta="center" c="dimmed">体重計</Text>
                </Card>
                <Card withBorder padding="sm">
                  <Center mb="xs">
                    <IconRuler size={32} stroke={1.5} />
                  </Center>
                  <Text size="xs" ta="center" fw={500}>IconRuler</Text>
                  <Text size="xs" ta="center" c="dimmed">定規</Text>
                </Card>
              </SimpleGrid>
            </div>
          </Stack>

          <Divider my="lg" />

          <Stack gap="sm">
            <Text fw={500}>使用方法</Text>
            <Paper bg="gray.0" p="sm">
              <Code block>
{`import { IconPaw, IconCat } from '@tabler/icons-react';

// ボタンに使用
<Button leftSection={<IconPaw size={16} />}>
  猫一覧
</Button>

// 単独で使用
<IconCat size={32} stroke={1.5} color="blue" />

// サイズ調整
size: 数値（ピクセル）
stroke: 線の太さ（1.5が標準）
color: 色指定`}
              </Code>
            </Paper>
            <Text size="sm" c="dimmed">
              その他のアイコンは <a href="https://tabler.io/icons" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mantine-color-blue-6)' }}>Tabler Icons公式サイト</a> で検索できます。
            </Text>
          </Stack>
        </Card>

        {/* カードUIデザインセクション */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            🎴 カードUI デザインシステム
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            ベース質感 + ホログラム加工のレイヤー構造カード。ホバーで演出が確認できます。
          </Text>
          
          <Stack gap="xl">
            {/* ベース質感一覧 */}
            <div>
              <Title order={4} mb="md">ベース質感（9種類）</Title>
              <Text size="sm" c="dimmed" mb="md">
                カードの基本となる質感スタイル。ホバーすると軽いシマー演出が確認できます。
              </Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                {TEXTURE_TYPES.map((texture, index) => (
                  <CatTexturedCard
                    key={texture}
                    cat={Object.values(SAMPLE_CATS)[index % Object.values(SAMPLE_CATS).length]}
                    texture={texture}
                    holoPattern="none"
                  />
                ))}
              </SimpleGrid>
            </div>
            
            <Divider />
            
            {/* ホログラム加工一覧 */}
            <div>
              <Title order={4} mb="md">ホログラム加工（メタリックベース）</Title>
              <Text size="sm" c="dimmed" mb="md">
                4種類のホログラム加工パターン。ベース質感の上にオーバーレイとして重なります。
              </Text>
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                {HOLO_PATTERNS.map((holo) => (
                  <CatTexturedCard
                    key={holo}
                    cat={SAMPLE_CATS.superRare}
                    texture="metallic"
                    holoPattern={holo}
                  />
                ))}
              </SimpleGrid>
            </div>
            
            <Divider />
            
            {/* レアリティ別カード */}
            <div>
              <Title order={4} mb="md">レアリティ別カード（6段階）</Title>
              <Text size="sm" c="dimmed" mb="md">
                レアリティに応じて質感・ホログラム加工・レインボーボーダーが自動決定されます。
              </Text>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
                {RARITY_TYPES.map((rarity) => (
                  <Stack key={rarity} gap="xs" align="center">
                    <CatTexturedCard
                      cat={SAMPLE_CATS[rarity]}
                      rarity={rarity}
                    />
                  </Stack>
                ))}
              </SimpleGrid>
            </div>
            
            <Divider />

            {/* カスタム組み合わせ例 */}
            <div>
              <Title order={4} mb="md">カスタム組み合わせ例</Title>
              <Text size="sm" c="dimmed" mb="md">
                ベース質感とホログラム加工を自由に組み合わせて独自のカードを作成できます。
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                <Stack gap="xs" align="center">
                  <CatTexturedCard 
                    cat={SAMPLE_CATS.legendary} 
                    texture="metallicGold" 
                    holoPattern="stardust" 
                    rainbowBorder 
                  />
                  <Text size="xs" c="dimmed">ゴールド + スターダスト + レインボー枠</Text>
                </Stack>
                <Stack gap="xs" align="center">
                  <CatTexturedCard 
                    cat={SAMPLE_CATS.rare} 
                    texture="glossy" 
                    holoPattern="dot" 
                  />
                  <Text size="xs" c="dimmed">グロッシー + ドットホロ</Text>
                </Stack>
                <Stack gap="xs" align="center">
                  <CatTexturedCard 
                    cat={SAMPLE_CATS.ultraRare} 
                    texture="leather" 
                    holoPattern="prism" 
                  />
                  <Text size="xs" c="dimmed">レザー + プリズムホロ</Text>
                </Stack>
              </SimpleGrid>
            </div>
            
            <Divider />
            
            {/* 使用方法 */}
            <div>
              <Title order={4} mb="md">使用方法</Title>
              <Paper bg="gray.0" p="sm">
                <Code block>
{`import { CatTexturedCard } from '@/components/cards';

// ベース質感のみ
<CatTexturedCard cat={cat} texture="metallic" />

// ベース質感 + ホログラム加工
<CatTexturedCard cat={cat} texture="metallicGold" holoPattern="prism" />

// レアリティで自動決定
<CatTexturedCard cat={cat} rarity="legendary" />

// フルカスタマイズ
<CatTexturedCard 
  cat={cat} 
  texture="metallic" 
  holoPattern="stardust" 
  rainbowBorder 
  enableHoverEffect={false}  // ギャラリー等で大量表示時
/>`}
                </Code>
              </Paper>
            </div>

            {/* レアリティプリセット設定表 */}
            <div>
              <Title order={4} mb="md">レアリティプリセット設定</Title>
              <Paper bg="gray.0" p="sm">
                <Code block>
{`const RARITY_PRESETS = {
  common:    { texture: 'matte',       holoPattern: 'none',     rainbowBorder: false },
  uncommon:  { texture: 'linen',       holoPattern: 'none',     rainbowBorder: false },
  rare:      { texture: 'glossy',      holoPattern: 'none',     rainbowBorder: false },
  superRare: { texture: 'metallic',    holoPattern: 'stripe',   rainbowBorder: false },
  ultraRare: { texture: 'metallicGold',holoPattern: 'prism',    rainbowBorder: false },
  legendary: { texture: 'embossed',    holoPattern: 'stardust', rainbowBorder: true  },
};`}
                </Code>
              </Paper>
            </div>
          </Stack>
        </Card>

        {/* カード展開デモ */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">
            🃏 カード展開デモ
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            カジノディーラー風のカード展開アニメーション。ファン・リボン・カスケードの3パターンを確認できます。
          </Text>
          
          <CardSpreadDemo />
          
          <Divider my="lg" />
          
          <div>
            <Title order={4} mb="md">使用方法</Title>
            <Paper bg="gray.0" p="sm">
              <Code block>
{`import { CardSpreadDemo } from '@/components/cards';

// デモコンポーネントをそのまま配置
<CardSpreadDemo />

// カスタムの猫データを渡す場合（将来拡張用）
<CardSpreadDemo cats={myCats} />`}
              </Code>
            </Paper>
          </div>
          
          <Stack gap="xs" mt="md">
            <Text size="sm" fw={500}>展開パターン</Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Paper p="sm" withBorder>
                <Group gap="xs" mb="xs">
                  <Text size="lg">🌀</Text>
                  <Text fw={500}>ファン</Text>
                </Group>
                <Text size="xs" c="dimmed">扇状に広げる。トランプの手札表示風。</Text>
              </Paper>
              <Paper p="sm" withBorder>
                <Group gap="xs" mb="xs">
                  <Text size="lg">➡️</Text>
                  <Text fw={500}>リボン</Text>
                </Group>
                <Text size="xs" c="dimmed">横一列に広げる。カード一覧表示風。</Text>
              </Paper>
              <Paper p="sm" withBorder>
                <Group gap="xs" mb="xs">
                  <Text size="lg">📐</Text>
                  <Text fw={500}>カスケード</Text>
                </Group>
                <Text size="xs" c="dimmed">階段状に重ねる。ソリティア風。</Text>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
