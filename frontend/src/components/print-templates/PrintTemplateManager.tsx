'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Stack, Group, Text, Button, Tabs, Card, ActionIcon, Badge,
  TextInput, Select, NumberInput, Loader, Center, Modal, Switch,
  useMantineTheme, Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconTrash, IconCopy, IconPrinter, IconSettings,
  IconLayoutList, IconEye, IconCategory, IconRefresh,
} from '@tabler/icons-react';

import { apiRequest } from '@/lib/api/client';

import type {
  PrintTemplate, PrintDocCategory, DataSourceInfo,
  FieldConfig,
} from './types';
import { PAPER_PRESETS, buildPrintHtml } from './types';
import { TemplatePreview } from './TemplatePreview';
import { FieldsPanel } from './FieldsPanel';
import { CategoryManager } from './CategoryManager';

// ==========================================
// API ヘルパー
// ==========================================
const API_PREFIX = '/api/v1/print-templates';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await apiRequest<T>(`${API_PREFIX}${path}`);
  if (!res.success || !res.data) {
    throw new Error('APIエラー');
  }
  return res.data;
}

async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await apiRequest<T>(`${API_PREFIX}${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.success || !res.data) {
    throw new Error('APIエラー');
  }
  return res.data;
}

async function apiPatch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await apiRequest<T>(`${API_PREFIX}${path}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.success || !res.data) {
    throw new Error('APIエラー');
  }
  return res.data;
}

async function apiDelete(path: string): Promise<void> {
  await apiRequest(`${API_PREFIX}${path}`, { method: 'DELETE' });
}

// ==========================================
// メインコンポーネント
// ==========================================
export function PrintTemplateManager() {
  const theme = useMantineTheme();

  // === データ状態 ===
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [categories, setCategories] = useState<PrintDocCategory[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // === 選択・編集状態 ===
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('settings');
  const [hasChanges, setHasChanges] = useState(false);

  // === フィルタ ===
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // === モーダル ===
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [printOpened, { open: openPrint, close: closePrint }] = useDisclosure(false);
  const [printValues, setPrintValues] = useState<Record<string, string>>({});

  // === 新規テンプレート ===
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'CUSTOM',
    categoryId: '',
    paperWidth: 210,
    paperHeight: 297,
    description: '',
  });

  // ==========================================
  // 初期データ読み込み
  // ==========================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tpls, cats, ds] = await Promise.all([
        apiFetch<PrintTemplate[]>(''),
        apiFetch<PrintDocCategory[]>('/categories'),
        apiFetch<DataSourceInfo[]>('/data-sources'),
      ]);
      setTemplates(tpls);
      setCategories(cats);
      setDataSources(ds);


    } catch (error) {
      const message = error instanceof Error ? error.message : 'データ読み込みに失敗しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // テンプレート選択
  // ==========================================
  const handleSelectTemplate = useCallback((template: PrintTemplate) => {
    if (hasChanges && !confirm('未保存の変更があります。破棄しますか？')) return;
    setSelectedId(template.id);
    setEditingTemplate(structuredClone(template));
    setHasChanges(false);
  }, [hasChanges]);

  // ==========================================
  // テンプレート作成
  // ==========================================
  const handleCreateTemplate = useCallback(async () => {
    if (!newTemplate.name.trim()) return;

    // カテゴリのデフォルトフィールドを初期 positions に展開
    const cat = categories.find((c) => c.slug === newTemplate.category);
    const defaultPositions: Record<string, FieldConfig> = {};

    if (cat?.defaultFields) {
      cat.defaultFields.forEach((df, idx) => {
        defaultPositions[df.key] = {
          x: 10,
          y: 10 + idx * 20,
          width: 60,
          height: 15,
          fontSize: 12,
          align: 'left',
          fontWeight: 'normal',
          color: '#333333',
          label: df.label,
          dataSource: df.dataSourceType ? {
            type: df.dataSourceType as FieldConfig['dataSource'] extends infer DS ? DS extends { type: infer T } ? T : never : never,
            field: df.dataSourceField,
          } : undefined,
        };
      });
    }

    try {
      const created = await apiPost<PrintTemplate>('', {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim() || null,
        category: newTemplate.category,
        categoryId: cat?.id ?? null,
        paperWidth: newTemplate.paperWidth,
        paperHeight: newTemplate.paperHeight,
        positions: defaultPositions,
      });

      setTemplates((prev) => [...prev, created]);
      setSelectedId(created.id);
      setEditingTemplate(structuredClone(created));
      setHasChanges(false);
      closeCreate();
      notifications.show({ title: '作成完了', message: `「${created.name}」を作成しました`, color: 'green' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '作成に失敗しました';
      notifications.show({ title: 'エラー', message, color: 'red' });
    }
  }, [newTemplate, categories, closeCreate]);

  // ==========================================
  // テンプレート保存
  // ==========================================
  const handleSave = useCallback(async () => {
    if (!editingTemplate) return;
    try {
      const updated = await apiPatch<PrintTemplate>(`/${editingTemplate.id}`, {
        name: editingTemplate.name,
        description: editingTemplate.description,
        category: editingTemplate.category,
        categoryId: editingTemplate.categoryId,
        paperWidth: editingTemplate.paperWidth,
        paperHeight: editingTemplate.paperHeight,
        backgroundUrl: editingTemplate.backgroundUrl,
        backgroundOpacity: editingTemplate.backgroundOpacity,
        positions: editingTemplate.positions,
        fontSizes: editingTemplate.fontSizes,
        isActive: editingTemplate.isActive,
        isDefault: editingTemplate.isDefault,
        displayOrder: editingTemplate.displayOrder,
      });

      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTemplate(structuredClone(updated));
      setHasChanges(false);
      notifications.show({ title: '保存完了', message: `「${updated.name}」を保存しました`, color: 'green' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存に失敗しました';
      notifications.show({ title: 'エラー', message, color: 'red' });
    }
  }, [editingTemplate]);

  // ==========================================
  // テンプレート複製
  // ==========================================
  const handleDuplicate = useCallback(async (id: string) => {
    const original = templates.find((t) => t.id === id);
    if (!original) return;
    try {
      const dup = await apiPost<PrintTemplate>(`/${id}/duplicate`, {
        name: `${original.name} (コピー)`,
      });
      setTemplates((prev) => [...prev, dup]);
      notifications.show({ title: '複製完了', message: `「${dup.name}」を作成しました`, color: 'green' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '複製に失敗しました';
      notifications.show({ title: 'エラー', message, color: 'red' });
    }
  }, [templates]);

  // ==========================================
  // テンプレート削除
  // ==========================================
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return;
    try {
      await apiDelete(`/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setEditingTemplate(null);
      }
      notifications.show({ title: '削除完了', message: 'テンプレートを削除しました', color: 'green' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '削除に失敗しました';
      notifications.show({ title: 'エラー', message, color: 'red' });
    }
  }, [selectedId]);

  // ==========================================
  // 編集操作（テンプレートのフィールド変更等）
  // ==========================================
  const updateEditing = useCallback(<K extends keyof PrintTemplate>(key: K, value: PrintTemplate[K]) => {
    setEditingTemplate((prev) => prev ? { ...prev, [key]: value } : prev);
    setHasChanges(true);
  }, []);

  // フィールド位置更新
  const handleUpdateFieldPosition = useCallback((fieldName: string, x: number, y: number) => {
    setEditingTemplate((prev) => {
      if (!prev) return prev;
      const pos = prev.positions[fieldName];
      if (!pos) return prev;
      return {
        ...prev,
        positions: { ...prev.positions, [fieldName]: { ...pos, x, y } },
      };
    });
    setHasChanges(true);
  }, []);

  // フィールドサイズ更新
  const handleUpdateFieldSize = useCallback((fieldName: string, width: number, height: number) => {
    setEditingTemplate((prev) => {
      if (!prev) return prev;
      const pos = prev.positions[fieldName];
      if (!pos) return prev;
      return {
        ...prev,
        positions: { ...prev.positions, [fieldName]: { ...pos, width, height } },
      };
    });
    setHasChanges(true);
  }, []);

  // フィールド追加
  const handleAddField = useCallback((fieldName: string, config: FieldConfig) => {
    setEditingTemplate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        positions: { ...prev.positions, [fieldName]: config },
      };
    });
    setHasChanges(true);
  }, []);

  // フィールド編集
  const handleUpdateFieldConfig = useCallback((fieldName: string, config: Partial<FieldConfig>) => {
    setEditingTemplate((prev) => {
      if (!prev) return prev;
      const pos = prev.positions[fieldName];
      if (!pos) return prev;
      return {
        ...prev,
        positions: { ...prev.positions, [fieldName]: { ...pos, ...config } },
      };
    });
    setHasChanges(true);
  }, []);

  // フィールド削除
  const handleRemoveField = useCallback((fieldName: string) => {
    if (!confirm(`フィールド "${fieldName}" を削除しますか？`)) return;
    setEditingTemplate((prev) => {
      if (!prev) return prev;
      const newPositions = { ...prev.positions };
      delete newPositions[fieldName];
      return { ...prev, positions: newPositions };
    });
    setHasChanges(true);
  }, []);

  // ==========================================
  // カテゴリCRUD
  // ==========================================
  const handleSaveCategory = useCallback(async (data: Partial<PrintDocCategory> & { name: string; slug: string }) => {
    const created = await apiPost<PrintDocCategory>('/categories', {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      displayOrder: data.displayOrder ?? 0,
    });
    setCategories((prev) => [...prev, created]);
    notifications.show({ title: 'カテゴリ作成完了', message: `「${created.name}」を作成しました`, color: 'green' });
  }, []);

  const handleUpdateCategory = useCallback(async (id: string, data: Partial<PrintDocCategory>) => {
    const updated = await apiPatch<PrintDocCategory>(`/categories/${id}`, {
      name: data.name,
      description: data.description,
      displayOrder: data.displayOrder,
    });
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    notifications.show({ title: 'カテゴリ更新完了', message: `「${updated.name}」を更新しました`, color: 'green' });
  }, []);

  const handleDeleteCategory = useCallback(async (id: string) => {
    await apiDelete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    notifications.show({ title: 'カテゴリ削除完了', message: 'カテゴリを削除しました', color: 'green' });
  }, []);

  // ==========================================
  // 印刷
  // ==========================================
  const handleOpenPrint = useCallback(() => {
    if (!editingTemplate) return;
    const values: Record<string, string> = {};
    for (const [key, pos] of Object.entries(editingTemplate.positions)) {
      values[key] = pos.label || key;
    }
    setPrintValues(values);
    openPrint();
  }, [editingTemplate, openPrint]);

  const handlePrint = useCallback(() => {
    if (!editingTemplate) return;
    const html = buildPrintHtml({ template: editingTemplate, fieldValues: printValues });
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
    closePrint();
  }, [editingTemplate, printValues, closePrint]);

  // ==========================================
  // フィルタされたテンプレート
  // ==========================================
  const filteredTemplates = useMemo(() => {
    if (!filterCategory) return templates;
    return templates.filter((t) => t.category === filterCategory);
  }, [templates, filterCategory]);

  // カテゴリ別選択肢
  const categorySelectData = useMemo(() => {
    return [
      { value: '', label: '全カテゴリ' },
      ...categories.map((c) => ({ value: c.slug, label: c.name })),
    ];
  }, [categories]);

  // ==========================================
  // ローディング
  // ==========================================
  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
        <Text ml="md" c="dimmed">テンプレートを読み込み中...</Text>
      </Center>
    );
  }

  // ==========================================
  // レンダリング
  // ==========================================
  return (
    <Stack gap="md">
      {/* ヘッダ */}
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="xl" fw={700}>🖨️ 印刷テンプレート管理</Text>
          <Text size="sm" c="dimmed">
            書類のテンプレートを管理し、フィールドの位置やデータソースを設定します
          </Text>
        </Stack>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={loadData} title="データを再読み込み">
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            新規テンプレート
          </Button>
        </Group>
      </Group>

      {/* メインレイアウト: 左サイドバー + 右エディタ */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', minHeight: 600 }}>
        {/* === 左サイドバー: テンプレートリスト === */}
        <Card withBorder style={{ width: 320, flexShrink: 0, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          <Stack gap="sm">
            <Select
              placeholder="カテゴリで絞り込み"
              data={categorySelectData}
              value={filterCategory ?? ''}
              onChange={(v) => setFilterCategory(v || null)}
              size="sm"
              clearable
            />

            {filteredTemplates.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl" size="sm">
                テンプレートがありません
              </Text>
            ) : (
              <Stack gap="xs">
                {filteredTemplates.map((t) => (
                  <Card
                    key={t.id}
                    withBorder
                    padding="xs"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedId === t.id ? theme.colors.blue[0] : undefined,
                      borderColor: selectedId === t.id ? theme.colors.blue[4] : undefined,
                    }}
                    onClick={() => handleSelectTemplate(t)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Stack gap={2} style={{ flex: 1, overflow: 'hidden' }}>
                        <Text size="sm" fw={500} lineClamp={1}>{t.name}</Text>
                        <Group gap={4}>
                          <Badge size="xs" variant="light">
                            {categories.find((c) => c.slug === t.category)?.name ?? t.category}
                          </Badge>
                          {t.isDefault && <Badge size="xs" color="green" variant="light">デフォルト</Badge>}
                          {!t.isActive && <Badge size="xs" color="gray" variant="light">無効</Badge>}
                        </Group>
                      </Stack>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon
                          size="sm" variant="subtle" color="blue"
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(t.id); }}
                          title="複製"
                        >
                          <IconCopy size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm" variant="subtle" color="red"
                          onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                          title="削除"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* === 右エディタ === */}
        <Card withBorder style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {!editingTemplate ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed">テンプレートを選択してください</Text>
                <Text size="sm" c="dimmed">左のリストからテンプレートを選択するか、新規作成してください</Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="md">
              {/* テンプレートヘッダ + 操作ボタン */}
              <Group justify="space-between" wrap="nowrap">
                <Text fw={700} size="lg" lineClamp={1}>{editingTemplate.name}</Text>
                <Group gap="xs" wrap="nowrap">
                  <Button
                    variant="subtle"
                    leftSection={<IconPrinter size={16} />}
                    size="compact-sm"
                    onClick={handleOpenPrint}
                  >
                    印刷
                  </Button>
                  <Button
                    size="compact-sm"
                    onClick={handleSave}
                    disabled={!hasChanges}
                    color={hasChanges ? 'blue' : 'gray'}
                  >
                    保存
                  </Button>
                </Group>
              </Group>

              {/* タブ */}
              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="settings" leftSection={<IconSettings size={14} />}>
                    設定
                  </Tabs.Tab>
                  <Tabs.Tab value="fields" leftSection={<IconLayoutList size={14} />}>
                    フィールド ({Object.keys(editingTemplate.positions).length})
                  </Tabs.Tab>
                  <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
                    プレビュー
                  </Tabs.Tab>
                  <Tabs.Tab value="categories" leftSection={<IconCategory size={14} />}>
                    カテゴリ管理
                  </Tabs.Tab>
                </Tabs.List>

                {/* 設定タブ */}
                <Tabs.Panel value="settings" pt="md">
                  <Stack gap="md">
                    <TextInput
                      label="テンプレート名"
                      value={editingTemplate.name}
                      onChange={(e) => updateEditing('name', e.currentTarget.value)}
                    />
                    <Textarea
                      label="説明"
                      value={editingTemplate.description ?? ''}
                      onChange={(e) => updateEditing('description', e.currentTarget.value || null)}
                      autosize
                      minRows={2}
                    />
                    <Select
                      label="カテゴリ"
                      data={categories.map((c) => ({ value: c.slug, label: c.name }))}
                      value={editingTemplate.category}
                      onChange={(v) => {
                        if (!v) return;
                        updateEditing('category', v);
                        const cat = categories.find((c) => c.slug === v);
                        updateEditing('categoryId', cat?.id ?? null);
                      }}
                    />

                    {/* 用紙サイズ */}
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>用紙サイズ</Text>
                      <Group grow>
                        <Select
                          label="プリセット"
                          data={PAPER_PRESETS.map((p) => ({ value: `${p.width}x${p.height}`, label: p.label }))}
                          value={`${editingTemplate.paperWidth}x${editingTemplate.paperHeight}`}
                          onChange={(v) => {
                            if (!v) return;
                            const [w, h] = v.split('x').map(Number);
                            if (w && h) {
                              updateEditing('paperWidth', w);
                              updateEditing('paperHeight', h);
                            }
                          }}
                        />
                        <NumberInput
                          label="幅 (mm)"
                          value={editingTemplate.paperWidth}
                          onChange={(v) => updateEditing('paperWidth', Number(v) || 210)}
                          min={50} max={500}
                        />
                        <NumberInput
                          label="高さ (mm)"
                          value={editingTemplate.paperHeight}
                          onChange={(v) => updateEditing('paperHeight', Number(v) || 297)}
                          min={50} max={500}
                        />
                      </Group>
                    </Stack>

                    {/* 背景画像 */}
                    <TextInput
                      label="背景画像URL"
                      value={editingTemplate.backgroundUrl ?? ''}
                      onChange={(e) => updateEditing('backgroundUrl', e.currentTarget.value || null)}
                      placeholder="https://..."
                    />
                    <NumberInput
                      label="背景透過度 (%)"
                      value={editingTemplate.backgroundOpacity}
                      onChange={(v) => updateEditing('backgroundOpacity', Number(v) || 100)}
                      min={0} max={100}
                    />

                    {/* フラグ */}
                    <Group>
                      <Switch
                        label="有効"
                        checked={editingTemplate.isActive}
                        onChange={(e) => updateEditing('isActive', e.currentTarget.checked)}
                      />
                      <Switch
                        label="デフォルト"
                        checked={editingTemplate.isDefault}
                        onChange={(e) => updateEditing('isDefault', e.currentTarget.checked)}
                      />
                    </Group>
                  </Stack>
                </Tabs.Panel>

                {/* フィールドタブ */}
                <Tabs.Panel value="fields" pt="md">
                  <FieldsPanel
                    positions={editingTemplate.positions}
                    dataSources={dataSources}
                    onAddField={handleAddField}
                    onUpdateField={handleUpdateFieldConfig}
                    onRemoveField={handleRemoveField}
                  />
                </Tabs.Panel>

                {/* プレビュータブ */}
                <Tabs.Panel value="preview" pt="md">
                  <TemplatePreview
                    template={editingTemplate}
                    onUpdatePosition={handleUpdateFieldPosition}
                    onUpdateSize={handleUpdateFieldSize}
                  />
                </Tabs.Panel>

                {/* カテゴリ管理タブ */}
                <Tabs.Panel value="categories" pt="md">
                  <CategoryManager
                    categories={categories}
                    onSave={handleSaveCategory}
                    onUpdate={handleUpdateCategory}
                    onDelete={handleDeleteCategory}
                  />
                </Tabs.Panel>
              </Tabs>
            </Stack>
          )}
        </Card>
      </div>

      {/* === 新規テンプレート作成モーダル === */}
      <Modal opened={createOpened} onClose={closeCreate} title="新規テンプレート作成" size="md">
        <Stack gap="md">
          <TextInput
            label="テンプレート名"
            placeholder="例: 血統書テンプレート"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate((p) => ({ ...p, name: e.currentTarget.value }))}
            required
          />
          <Textarea
            label="説明 (任意)"
            placeholder="テンプレートの説明"
            value={newTemplate.description}
            onChange={(e) => setNewTemplate((p) => ({ ...p, description: e.currentTarget.value }))}
            autosize
            minRows={2}
          />
          <Select
            label="カテゴリ"
            data={categories.map((c) => ({ value: c.slug, label: c.name }))}
            value={newTemplate.category}
            onChange={(v) => {
              if (!v) return;
              const cat = categories.find((c) => c.slug === v);
              setNewTemplate((p) => ({
                ...p,
                category: v,
                categoryId: cat?.id ?? '',
              }));
            }}
          />
          <Select
            label="用紙サイズ"
            data={PAPER_PRESETS.map((p) => ({ value: `${p.width}x${p.height}`, label: p.label }))}
            value={`${newTemplate.paperWidth}x${newTemplate.paperHeight}`}
            onChange={(v) => {
              if (!v) return;
              const [w, h] = v.split('x').map(Number);
              if (w && h) {
                setNewTemplate((p) => ({ ...p, paperWidth: w, paperHeight: h }));
              }
            }}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeCreate}>キャンセル</Button>
            <Button onClick={handleCreateTemplate} disabled={!newTemplate.name.trim()}>
              作成
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* === 印刷モーダル === */}
      <Modal opened={printOpened} onClose={closePrint} title="印刷プレビュー" size="lg">
        {editingTemplate && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              各フィールドの値を入力してください。データソースが設定されているフィールドは、実際のデータに置き換わります。
            </Text>
            {Object.entries(editingTemplate.positions).map(([key, pos]) => (
              <TextInput
                key={key}
                label={pos.label || key}
                description={
                  pos.dataSource
                    ? `データソース: ${dataSources.find((ds) => ds.type === pos.dataSource?.type)?.label ?? pos.dataSource.type}${pos.dataSource.field ? ` → ${pos.dataSource.field}` : ''}`
                    : undefined
                }
                value={printValues[key] ?? ''}
                onChange={(e) =>
                  setPrintValues((prev) => ({ ...prev, [key]: e.currentTarget.value }))
                }
              />
            ))}
            <Group justify="flex-end">
              <Button variant="subtle" onClick={closePrint}>キャンセル</Button>
              <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
                印刷
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
