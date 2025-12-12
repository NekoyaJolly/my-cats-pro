'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Select,
  Button,
  NumberInput,
  TextInput,
  Tabs,
  ActionIcon,
  Badge,
  Card,
  Grid,
  Tooltip,
  LoadingOverlay,
  Alert,
  Modal,
  ScrollArea,
  Slider,
  Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconSettings,
  IconEye,
  IconCheck,
  IconAlertCircle,
  IconGripVertical,
  IconPhoto,
} from '@tabler/icons-react';

// 型定義
interface Position {
  x: number;
  y: number;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontWeight?: 'normal' | 'bold';
}

interface PrintTemplate {
  id: string;
  tenantId: string | null;
  name: string;
  description: string | null;
  category: string;
  paperWidth: number;
  paperHeight: number;
  backgroundUrl: string | null;
  backgroundOpacity: number;
  positions: Record<string, Position>;
  fontSizes: Record<string, number> | null;
  isActive: boolean;
  isDefault: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

// カテゴリラベル
const CATEGORY_LABELS: Record<string, string> = {
  PEDIGREE: '血統書',
  KITTEN_TRANSFER: '子猫譲渡証明書',
  HEALTH_CERTIFICATE: '健康診断書',
  VACCINATION_RECORD: 'ワクチン接種記録',
  BREEDING_RECORD: '繁殖記録',
  CONTRACT: '契約書',
  INVOICE: '請求書/領収書',
  CUSTOM: 'カスタム書類',
};

// プリセット用紙サイズ（mm）
const PAPER_PRESETS = [
  { label: 'A4 縦', width: 210, height: 297 },
  { label: 'A4 横', width: 297, height: 210 },
  { label: 'A5 縦', width: 148, height: 210 },
  { label: 'A5 横', width: 210, height: 148 },
  { label: 'B5 縦', width: 182, height: 257 },
  { label: 'B5 横', width: 257, height: 182 },
  { label: 'はがき 縦', width: 100, height: 148 },
  { label: 'はがき 横', width: 148, height: 100 },
];

// カテゴリごとのデフォルトフィールド
const DEFAULT_FIELDS: Record<string, string[]> = {
  PEDIGREE: ['catName', 'pedigreeId', 'breed', 'birthDate', 'gender', 'eyeColor', 'coatColor', 'breederName', 'ownerName'],
  KITTEN_TRANSFER: ['kittenName', 'breed', 'birthDate', 'gender', 'microchipNo', 'breederName', 'buyerName', 'transferDate', 'price'],
  HEALTH_CERTIFICATE: ['catName', 'breed', 'birthDate', 'ownerName', 'checkDate', 'weight', 'veterinarian', 'clinicName'],
  VACCINATION_RECORD: ['catName', 'breed', 'birthDate', 'vaccineName', 'vaccinationDate', 'nextDueDate', 'veterinarian'],
  BREEDING_RECORD: ['maleName', 'femaleName', 'matingDate', 'expectedDueDate', 'actualBirthDate', 'numberOfKittens'],
  CONTRACT: ['title', 'date', 'partyA', 'partyB', 'content', 'signature1', 'signature2'],
  INVOICE: ['invoiceNo', 'date', 'customerName', 'items', 'subtotal', 'tax', 'total'],
  CUSTOM: ['field1', 'field2', 'field3'],
};

// フィールドの日本語ラベル
const FIELD_LABELS: Record<string, string> = {
  catName: '猫名',
  pedigreeId: '血統書番号',
  breed: '品種',
  birthDate: '生年月日',
  gender: '性別',
  eyeColor: '目の色',
  coatColor: '毛色',
  breederName: '繁殖者',
  ownerName: '所有者',
  kittenName: '子猫名',
  microchipNo: 'マイクロチップ番号',
  buyerName: '購入者',
  transferDate: '譲渡日',
  price: '価格',
  checkDate: '検査日',
  weight: '体重',
  veterinarian: '獣医師',
  clinicName: '病院名',
  vaccineName: 'ワクチン名',
  vaccinationDate: '接種日',
  nextDueDate: '次回接種予定日',
  maleName: '父猫名',
  femaleName: '母猫名',
  matingDate: '交配日',
  expectedDueDate: '出産予定日',
  actualBirthDate: '実際の出産日',
  numberOfKittens: '子猫数',
  title: 'タイトル',
  date: '日付',
  partyA: '甲',
  partyB: '乙',
  content: '内容',
  signature1: '署名1',
  signature2: '署名2',
  invoiceNo: '請求書番号',
  customerName: '顧客名',
  items: '明細',
  subtotal: '小計',
  tax: '消費税',
  total: '合計',
  field1: 'フィールド1',
  field2: 'フィールド2',
  field3: 'フィールド3',
};

export function PrintTemplateManager() {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<string | null>(null);
  const [selectedPaperPreset, setSelectedPaperPreset] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

  // カテゴリ一覧を取得
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/print-templates/categories`);
      if (!response.ok) throw new Error('カテゴリの取得に失敗しました');
      const json = await response.json();
      setCategories(json.data || []);
    } catch (err) {
      console.error('カテゴリ取得エラー:', err);
    }
  }, [apiUrl]);

  // テンプレート一覧を取得
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('includeGlobal', 'true');

      const response = await fetch(`${apiUrl}/api/v1/print-templates?${params}`);
      if (!response.ok) throw new Error('テンプレートの取得に失敗しました');
      const json = await response.json();
      setTemplates(json.data || []);
    } catch (err) {
      console.error('テンプレート取得エラー:', err);
      notifications.show({
        title: 'エラー',
        message: 'テンプレートの取得に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [apiUrl, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // テンプレートを選択
  const handleSelectTemplate = (template: PrintTemplate) => {
    if (hasChanges) {
      if (!confirm('変更が保存されていません。破棄しますか？')) {
        return;
      }
    }
    setSelectedTemplate(template);
    setHasChanges(false);
  };

  // 新規テンプレートを作成
  const handleCreateTemplate = async () => {
    if (!newTemplateName || !newTemplateCategory) {
      notifications.show({
        title: 'エラー',
        message: 'テンプレート名とカテゴリを入力してください',
        color: 'red',
      });
      return;
    }

    const preset = PAPER_PRESETS.find(p => p.label === selectedPaperPreset) || PAPER_PRESETS[0];
    const defaultFields = DEFAULT_FIELDS[newTemplateCategory] || DEFAULT_FIELDS.CUSTOM;
    const positions: Record<string, Position> = {};
    
    // デフォルトフィールドの初期位置を設定
    defaultFields.forEach((field, index) => {
      positions[field] = {
        x: 20,
        y: 20 + (index * 15),
        fontSize: 12,
        align: 'left',
      };
    });

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/print-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName,
          category: newTemplateCategory,
          paperWidth: preset.width,
          paperHeight: preset.height,
          positions,
          fontSizes: {},
        }),
      });

      if (!response.ok) throw new Error('テンプレートの作成に失敗しました');

      const json = await response.json();
      notifications.show({
        title: '作成完了',
        message: 'テンプレートを作成しました',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      closeCreateModal();
      setNewTemplateName('');
      setNewTemplateCategory(null);
      setSelectedPaperPreset(null);
      fetchTemplates();
      setSelectedTemplate(json.data);
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: err instanceof Error ? err.message : '作成に失敗しました',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // テンプレートを保存
  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/print-templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          paperWidth: selectedTemplate.paperWidth,
          paperHeight: selectedTemplate.paperHeight,
          backgroundUrl: selectedTemplate.backgroundUrl,
          backgroundOpacity: selectedTemplate.backgroundOpacity,
          positions: selectedTemplate.positions,
          fontSizes: selectedTemplate.fontSizes,
          isDefault: selectedTemplate.isDefault,
        }),
      });

      if (!response.ok) throw new Error('保存に失敗しました');

      notifications.show({
        title: '保存完了',
        message: 'テンプレートを保存しました',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      setHasChanges(false);
      fetchTemplates();
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: err instanceof Error ? err.message : '保存に失敗しました',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // テンプレートを複製
  const handleDuplicateTemplate = async (template: PrintTemplate) => {
    const newName = prompt('新しいテンプレート名を入力してください:', `${template.name} (コピー)`);
    if (!newName) return;

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/print-templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('複製に失敗しました');

      notifications.show({
        title: '複製完了',
        message: 'テンプレートを複製しました',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      fetchTemplates();
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: err instanceof Error ? err.message : '複製に失敗しました',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // テンプレートを削除
  const handleDeleteTemplate = async (template: PrintTemplate) => {
    if (!confirm(`「${template.name}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/print-templates/${template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('削除に失敗しました');

      notifications.show({
        title: '削除完了',
        message: 'テンプレートを削除しました',
        color: 'blue',
      });

      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
      fetchTemplates();
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: err instanceof Error ? err.message : '削除に失敗しました',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // フィールド位置を更新
  const updateFieldPosition = (fieldName: string, updates: Partial<Position>) => {
    if (!selectedTemplate) return;
    
    const newPositions = {
      ...selectedTemplate.positions,
      [fieldName]: {
        ...selectedTemplate.positions[fieldName],
        ...updates,
      },
    };
    
    setSelectedTemplate({
      ...selectedTemplate,
      positions: newPositions,
    });
    setHasChanges(true);
  };

  // フィールドを追加
  const addField = () => {
    if (!selectedTemplate) return;
    const fieldName = prompt('フィールド名を入力してください（英数字）:');
    if (!fieldName || !fieldName.match(/^[a-zA-Z][a-zA-Z0-9]*$/)) {
      notifications.show({
        title: 'エラー',
        message: 'フィールド名は英字で始まる英数字で入力してください',
        color: 'red',
      });
      return;
    }

    if (selectedTemplate.positions[fieldName]) {
      notifications.show({
        title: 'エラー',
        message: 'このフィールド名は既に存在します',
        color: 'red',
      });
      return;
    }

    const newPositions = {
      ...selectedTemplate.positions,
      [fieldName]: { x: 50, y: 50, fontSize: 12, align: 'left' as const },
    };

    setSelectedTemplate({
      ...selectedTemplate,
      positions: newPositions,
    });
    setHasChanges(true);
  };

  // フィールドを削除
  const removeField = (fieldName: string) => {
    if (!selectedTemplate) return;
    if (!confirm(`「${FIELD_LABELS[fieldName] || fieldName}」を削除しますか？`)) return;

    const newPositions = { ...selectedTemplate.positions };
    delete newPositions[fieldName];

    setSelectedTemplate({
      ...selectedTemplate,
      positions: newPositions,
    });
    setHasChanges(true);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <Select
            placeholder="カテゴリでフィルター"
            data={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            clearable
            w={200}
          />
          <Badge size="lg" color="blue">
            {templates.length}件
          </Badge>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          新規テンプレート
        </Button>
      </Group>

      <Grid>
        {/* テンプレート一覧（左側） */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="md" shadow="sm" style={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
            <LoadingOverlay visible={loading} />
            <Stack gap="xs">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  p="sm"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedTemplate?.id === template.id ? 'var(--mantine-color-blue-5)' : undefined,
                    backgroundColor: selectedTemplate?.id === template.id ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={4}>
                      <Group gap="xs">
                        <Text fw={500} size="sm" lineClamp={1}>
                          {template.name}
                        </Text>
                        {template.isDefault && (
                          <Badge size="xs" color="green">デフォルト</Badge>
                        )}
                      </Group>
                      <Badge size="xs" variant="light">
                        {CATEGORY_LABELS[template.category] || template.category}
                      </Badge>
                    </Stack>
                    <Group gap={4}>
                      <Tooltip label="複製">
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTemplate(template);
                          }}
                        >
                          <IconCopy size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="削除">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template);
                          }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Card>
              ))}

              {templates.length === 0 && !loading && (
                <Text c="dimmed" ta="center" py="xl">
                  テンプレートがありません
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* エディタ（右側） */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {selectedTemplate ? (
            <Paper p="md" shadow="sm" style={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={600} size="lg">{selectedTemplate.name}</Text>
                  <Group>
                    {hasChanges && (
                      <Badge color="orange">未保存の変更</Badge>
                    )}
                    <Button
                      leftSection={<IconCheck size={16} />}
                      onClick={handleSaveTemplate}
                      loading={saving}
                      disabled={!hasChanges}
                    >
                      保存
                    </Button>
                  </Group>
                </Group>

                <Tabs defaultValue="settings">
                  <Tabs.List>
                    <Tabs.Tab value="settings" leftSection={<IconSettings size={14} />}>
                      基本設定
                    </Tabs.Tab>
                    <Tabs.Tab value="fields" leftSection={<IconGripVertical size={14} />}>
                      フィールド
                    </Tabs.Tab>
                    <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
                      プレビュー
                    </Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="settings" pt="md">
                    <Stack gap="md">
                      <TextInput
                        label="テンプレート名"
                        value={selectedTemplate.name}
                        onChange={(e) => {
                          setSelectedTemplate({ ...selectedTemplate, name: e.target.value });
                          setHasChanges(true);
                        }}
                      />

                      <TextInput
                        label="説明"
                        value={selectedTemplate.description || ''}
                        onChange={(e) => {
                          setSelectedTemplate({ ...selectedTemplate, description: e.target.value || null });
                          setHasChanges(true);
                        }}
                      />

                      <Group grow>
                        <NumberInput
                          label="用紙幅 (mm)"
                          value={selectedTemplate.paperWidth}
                          onChange={(val) => {
                            setSelectedTemplate({ ...selectedTemplate, paperWidth: Number(val) || 210 });
                            setHasChanges(true);
                          }}
                          min={50}
                          max={500}
                        />
                        <NumberInput
                          label="用紙高さ (mm)"
                          value={selectedTemplate.paperHeight}
                          onChange={(val) => {
                            setSelectedTemplate({ ...selectedTemplate, paperHeight: Number(val) || 297 });
                            setHasChanges(true);
                          }}
                          min={50}
                          max={500}
                        />
                      </Group>

                      <Select
                        label="用紙プリセット"
                        data={PAPER_PRESETS.map(p => ({ value: p.label, label: `${p.label} (${p.width}×${p.height}mm)` }))}
                        placeholder="プリセットから選択"
                        clearable
                        onChange={(val) => {
                          const preset = PAPER_PRESETS.find(p => p.label === val);
                          if (preset) {
                            setSelectedTemplate({
                              ...selectedTemplate,
                              paperWidth: preset.width,
                              paperHeight: preset.height,
                            });
                            setHasChanges(true);
                          }
                        }}
                      />

                      <TextInput
                        label="背景画像URL"
                        placeholder="https://..."
                        value={selectedTemplate.backgroundUrl || ''}
                        onChange={(e) => {
                          setSelectedTemplate({ ...selectedTemplate, backgroundUrl: e.target.value || null });
                          setHasChanges(true);
                        }}
                        leftSection={<IconPhoto size={16} />}
                      />

                      <Stack gap={4}>
                        <Text size="sm" fw={500}>背景透明度: {selectedTemplate.backgroundOpacity}%</Text>
                        <Slider
                          value={selectedTemplate.backgroundOpacity}
                          onChange={(val) => {
                            setSelectedTemplate({ ...selectedTemplate, backgroundOpacity: val });
                            setHasChanges(true);
                          }}
                          min={0}
                          max={100}
                          marks={[
                            { value: 0, label: '0%' },
                            { value: 50, label: '50%' },
                            { value: 100, label: '100%' },
                          ]}
                        />
                      </Stack>

                      <Switch
                        label="デフォルトテンプレートに設定"
                        checked={selectedTemplate.isDefault}
                        onChange={(e) => {
                          setSelectedTemplate({ ...selectedTemplate, isDefault: e.currentTarget.checked });
                          setHasChanges(true);
                        }}
                      />
                    </Stack>
                  </Tabs.Panel>

                  <Tabs.Panel value="fields" pt="md">
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text fw={500}>フィールド一覧</Text>
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconPlus size={14} />}
                          onClick={addField}
                        >
                          フィールド追加
                        </Button>
                      </Group>

                      <ScrollArea h={400}>
                        <Stack gap="sm">
                          {Object.entries(selectedTemplate.positions).map(([fieldName, pos]) => (
                            <Card key={fieldName} p="sm" withBorder>
                              <Group justify="space-between" mb="xs">
                                <Text fw={500} size="sm">
                                  {FIELD_LABELS[fieldName] || fieldName}
                                </Text>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size="sm"
                                  onClick={() => removeField(fieldName)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                              <Grid gutter="xs">
                                <Grid.Col span={3}>
                                  <NumberInput
                                    size="xs"
                                    label="X (mm)"
                                    value={pos.x}
                                    onChange={(val) => updateFieldPosition(fieldName, { x: Number(val) || 0 })}
                                    min={0}
                                    max={selectedTemplate.paperWidth}
                                  />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                  <NumberInput
                                    size="xs"
                                    label="Y (mm)"
                                    value={pos.y}
                                    onChange={(val) => updateFieldPosition(fieldName, { y: Number(val) || 0 })}
                                    min={0}
                                    max={selectedTemplate.paperHeight}
                                  />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                  <NumberInput
                                    size="xs"
                                    label="サイズ"
                                    value={pos.fontSize || 12}
                                    onChange={(val) => updateFieldPosition(fieldName, { fontSize: Number(val) || 12 })}
                                    min={6}
                                    max={72}
                                  />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                  <Select
                                    size="xs"
                                    label="揃え"
                                    value={pos.align || 'left'}
                                    onChange={(val) => updateFieldPosition(fieldName, { align: (val as 'left' | 'center' | 'right') || 'left' })}
                                    data={[
                                      { value: 'left', label: '左' },
                                      { value: 'center', label: '中央' },
                                      { value: 'right', label: '右' },
                                    ]}
                                  />
                                </Grid.Col>
                              </Grid>
                            </Card>
                          ))}
                        </Stack>
                      </ScrollArea>
                    </Stack>
                  </Tabs.Panel>

                  <Tabs.Panel value="preview" pt="md">
                    <TemplatePreview template={selectedTemplate} />
                  </Tabs.Panel>
                </Tabs>
              </Stack>
            </Paper>
          ) : (
            <Paper p="xl" shadow="sm" style={{ height: 'calc(100vh - 250px)' }}>
              <Stack align="center" justify="center" h="100%">
                <IconSettings size={48} color="gray" />
                <Text c="dimmed">左のリストからテンプレートを選択してください</Text>
              </Stack>
            </Paper>
          )}
        </Grid.Col>
      </Grid>

      {/* 新規作成モーダル */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="新規テンプレート作成"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="テンプレート名"
            placeholder="例: 血統書テンプレート"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            required
          />

          <Select
            label="カテゴリ"
            data={categories}
            value={newTemplateCategory}
            onChange={setNewTemplateCategory}
            required
          />

          <Select
            label="用紙サイズ"
            data={PAPER_PRESETS.map(p => ({ value: p.label, label: `${p.label} (${p.width}×${p.height}mm)` }))}
            value={selectedPaperPreset}
            onChange={setSelectedPaperPreset}
            placeholder="A4 縦"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeCreateModal}>
              キャンセル
            </Button>
            <Button onClick={handleCreateTemplate} loading={saving}>
              作成
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

// プレビューコンポーネント
function TemplatePreview({ template }: { template: PrintTemplate }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // コンテナサイズに合わせてスケールを計算
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 40;
    const containerHeight = 500;
    
    const scaleX = containerWidth / template.paperWidth;
    const scaleY = containerHeight / template.paperHeight;
    setScale(Math.min(scaleX, scaleY, 2)); // 最大2倍まで
  }, [template.paperWidth, template.paperHeight]);

  // mm → px 変換（96dpi基準、25.4mm = 1inch）
  const mmToPx = (mm: number) => (mm * 96) / 25.4 * scale;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          用紙サイズ: {template.paperWidth}mm × {template.paperHeight}mm
        </Text>
        <Text size="sm" c="dimmed">
          表示倍率: {Math.round(scale * 100)}%
        </Text>
      </Group>

      <div
        ref={containerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 20,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            width: mmToPx(template.paperWidth),
            height: mmToPx(template.paperHeight),
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            position: 'relative',
            backgroundImage: template.backgroundUrl ? `url(${template.backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* 背景オーバーレイ（透明度調整用） */}
          {template.backgroundUrl && template.backgroundOpacity < 100 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: `rgba(255,255,255,${(100 - template.backgroundOpacity) / 100})`,
              }}
            />
          )}

          {/* フィールド表示 */}
          {Object.entries(template.positions).map(([fieldName, pos]) => (
            <div
              key={fieldName}
              style={{
                position: 'absolute',
                left: mmToPx(pos.x),
                top: mmToPx(pos.y),
                fontSize: (pos.fontSize || 12) * scale,
                textAlign: pos.align || 'left',
                color: pos.color || '#333',
                fontWeight: pos.fontWeight || 'normal',
                whiteSpace: 'nowrap',
                border: '1px dashed #aaa',
                padding: '2px 4px',
                backgroundColor: 'rgba(255, 255, 200, 0.8)',
              }}
            >
              {FIELD_LABELS[fieldName] || fieldName}
            </div>
          ))}
        </div>
      </div>

      <Alert color="blue" icon={<IconAlertCircle size={16} />}>
        プレビューでは各フィールドの配置位置を確認できます。
        実際の印刷時にはデータが差し込まれます。
      </Alert>
    </Stack>
  );
}
