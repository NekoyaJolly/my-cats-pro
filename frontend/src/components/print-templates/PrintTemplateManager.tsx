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
  FileInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconPrinter,
  IconSettings,
  IconEye,
  IconCheck,
  IconAlertCircle,
  IconGripVertical,
  IconPhoto,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { getPublicApiBaseUrl } from '@/lib/api/public-api-base-url';

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildPrintHtml(params: {
  template: PrintTemplate;
  showSampleData: boolean;
  sampleData?: Record<string, string>;
}): string {
  const { template, showSampleData, sampleData } = params;

  const safeTitle = escapeHtml(template.name);
  const pageWidthMm = template.paperWidth;
  const pageHeightMm = template.paperHeight;

  const fieldHtml = Object.entries(template.positions)
    .map(([fieldName, pos]) => {
      const text = showSampleData
        ? (sampleData?.[fieldName] ?? FIELD_LABELS[fieldName] ?? fieldName)
        : (FIELD_LABELS[fieldName] ?? fieldName);

      const align: 'left' | 'center' | 'right' = pos.align ?? 'left';
      const fontWeight: 'normal' | 'bold' = pos.fontWeight ?? 'normal';
      const fontSizePx = pos.fontSize ?? 12;
      const color = showSampleData ? (pos.color ?? '#333') : '#333';
      const widthMm = pos.width ?? 50;
      const heightMm = pos.height ?? 15;

      return `
        <div
          class="field"
          style="
            left: ${pos.x}mm;
            top: ${pos.y}mm;
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            font-size: ${fontSizePx}px;
            text-align: ${align};
            font-weight: ${fontWeight};
            color: ${escapeHtml(color)};
          "
        >${escapeHtml(text)}</div>
      `.trim();
    })
    .join('\n');

  const backgroundImageStyle = template.backgroundUrl
    ? `background-image: url(${escapeHtml(template.backgroundUrl)});`
    : '';
  const showOverlay = !!template.backgroundUrl && template.backgroundOpacity < 100;
  const overlayAlpha = (100 - template.backgroundOpacity) / 100;

  return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle} - 印刷</title>
    <style>
      @page { size: ${pageWidthMm}mm ${pageHeightMm}mm; margin: 0; }
      html, body { margin: 0; padding: 0; width: ${pageWidthMm}mm; height: ${pageHeightMm}mm; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .paper {
        position: relative;
        width: ${pageWidthMm}mm;
        height: ${pageHeightMm}mm;
        background-color: #fff;
        background-size: cover;
        background-position: center;
        ${backgroundImageStyle}
        overflow: hidden;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, ${overlayAlpha});
        pointer-events: none;
      }
      .field {
        position: absolute;
        white-space: pre-wrap;
        overflow: hidden;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div class="paper">
      ${showOverlay ? '<div class="overlay"></div>' : ''}
      ${fieldHtml}
    </div>
  </body>
</html>
  `.trim();
}

// 型定義
interface Position {
  x: number;
  y: number;
  width?: number;  // テキストボックスの幅（mm）
  height?: number; // テキストボックスの高さ（mm）
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

interface TenantOption {
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
  { label: 'レター 縦', width: 216, height: 279 },
  { label: 'レター 横', width: 279, height: 216 },
  { label: 'カスタム', width: 0, height: 0, isCustom: true },
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

// カテゴリ別サンプルデータ
const SAMPLE_DATA: Record<string, Record<string, string>> = {
  PEDIGREE: {
    catName: 'ミケちゃん',
    pedigreeId: 'TICA-2024-12345',
    breed: 'メインクーン',
    birthDate: '2023年5月15日',
    gender: 'メス',
    eyeColor: 'ゴールド',
    coatColor: 'ブラウンタビー',
    breederName: '田中 花子',
    ownerName: '山田 太郎',
  },
  KITTEN_TRANSFER: {
    kittenName: 'チビちゃん',
    breed: 'スコティッシュフォールド',
    birthDate: '2024年10月1日',
    gender: 'オス',
    microchipNo: '123456789012345',
    breederName: '佐藤 キャッテリー',
    buyerName: '鈴木 一郎',
    transferDate: '2024年12月10日',
    price: '¥350,000',
  },
  HEALTH_CERTIFICATE: {
    catName: 'タマ',
    breed: 'ブリティッシュショートヘア',
    birthDate: '2022年3月20日',
    ownerName: '高橋 美咲',
    checkDate: '2024年12月1日',
    weight: '4.5kg',
    veterinarian: '山本 獣医師',
    clinicName: 'さくら動物病院',
  },
  VACCINATION_RECORD: {
    catName: 'クロ',
    breed: 'ミックス',
    birthDate: '2021年7月10日',
    vaccineName: '3種混合ワクチン',
    vaccinationDate: '2024年11月15日',
    nextDueDate: '2025年11月15日',
    veterinarian: '田村 獣医師',
  },
  BREEDING_RECORD: {
    maleName: 'キング',
    femaleName: 'クイーン',
    matingDate: '2024年9月1日',
    expectedDueDate: '2024年11月3日',
    actualBirthDate: '2024年11月5日',
    numberOfKittens: '5',
  },
  CONTRACT: {
    title: '猫譲渡契約書',
    date: '2024年12月13日',
    partyA: '株式会社ネコハウス',
    partyB: '山田 太郎',
    content: '譲渡条件の詳細...',
    signature1: '（甲の署名）',
    signature2: '（乙の署名）',
  },
  INVOICE: {
    invoiceNo: 'INV-2024-0001',
    date: '2024年12月13日',
    customerName: '田中 花子 様',
    items: '子猫代金 / ワクチン代',
    subtotal: '¥300,000',
    tax: '¥30,000',
    total: '¥330,000',
  },
  CUSTOM: {
    field1: 'カスタムデータ1',
    field2: 'カスタムデータ2',
    field3: 'カスタムデータ3',
  },
};

export function PrintTemplateManager() {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [printModalOpened, { open: openPrintModal, close: closePrintModal }] = useDisclosure(false);
  const [printTarget, setPrintTarget] = useState<PrintTemplate | null>(null);
  const [printUseSampleData, setPrintUseSampleData] = useState(false);
  const [printHtml, setPrintHtml] = useState<string | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const hasRequestedPrintRef = useRef(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<string | null>(null);
  const [newTemplateTenant, setNewTemplateTenant] = useState<string | null>(null);
  const [selectedPaperPreset, setSelectedPaperPreset] = useState<string | null>(null);
  const [customPaperWidth, setCustomPaperWidth] = useState<number>(210);
  const [customPaperHeight, setCustomPaperHeight] = useState<number>(297);
  const [showSampleData, setShowSampleData] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  const apiBaseUrl = getPublicApiBaseUrl();

  // カテゴリ一覧を取得
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/print-templates/categories`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('カテゴリの取得に失敗しました');
      const json = await response.json();
      setCategories(json.data || []);
    } catch (err) {
      console.error('カテゴリ取得エラー:', err);
    }
  }, [apiBaseUrl]);

  // テナント一覧を取得
  const fetchTenants = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/tenants`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('テナントの取得に失敗しました');
      const json = await response.json();
      const tenantData = json.data || json || [];
      const options = tenantData.map((t: { id: string; name: string }) => ({
        value: t.id,
        label: t.name,
      }));
      setTenants([{ value: '', label: '全テナント共通（グローバル）' }, ...options]);
    } catch (err) {
      console.error('テナント取得エラー:', err);
      // テナント取得に失敗してもグローバルオプションは表示
      setTenants([{ value: '', label: '全テナント共通（グローバル）' }]);
    }
  }, [apiBaseUrl]);

  // テンプレート一覧を取得
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTenantFilter) params.append('tenantId', selectedTenantFilter);
      params.append('includeGlobal', 'true');

      const response = await fetch(`${apiBaseUrl}/print-templates?${params}`, {
        credentials: 'include',
      });
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
  }, [apiBaseUrl, selectedCategory, selectedTenantFilter]);

  useEffect(() => {
    fetchCategories();
    fetchTenants();
  }, [fetchCategories, fetchTenants]);

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

    const preset = PAPER_PRESETS.find(p => p.label === selectedPaperPreset);
    const isCustomSize = !preset || preset.isCustom;
    const paperWidth = isCustomSize ? customPaperWidth : preset.width;
    const paperHeight = isCustomSize ? customPaperHeight : preset.height;
    
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
      const response = await fetch(`${apiBaseUrl}/print-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newTemplateName,
          category: newTemplateCategory,
          tenantId: newTemplateTenant || null,
          paperWidth,
          paperHeight,
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
      setNewTemplateTenant(null);
      setSelectedPaperPreset(null);
      setCustomPaperWidth(210);
      setCustomPaperHeight(297);
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
      const response = await fetch(`${apiBaseUrl}/print-templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const response = await fetch(`${apiBaseUrl}/print-templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const response = await fetch(`${apiBaseUrl}/print-templates/${template.id}`, {
        method: 'DELETE',
        credentials: 'include',
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

  const handleOpenPrint = (template: PrintTemplate) => {
    setPrintTarget(template);
    setPrintUseSampleData(showSampleData);
    openPrintModal();
  };

  const handlePrint = () => {
    if (!printTarget) return;

    const html = buildPrintHtml({
      template: printTarget,
      showSampleData: printUseSampleData,
      sampleData: SAMPLE_DATA[printTarget.category],
    });

    hasRequestedPrintRef.current = false;
    setPrintHtml(html);
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
          <Select
            placeholder="テナントでフィルター"
            data={tenants}
            value={selectedTenantFilter}
            onChange={setSelectedTenantFilter}
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
                        {!template.tenantId && (
                          <Badge size="xs" color="gray" variant="outline">共通</Badge>
                        )}
                      </Group>
                      <Group gap={4}>
                        <Badge size="xs" variant="light">
                          {CATEGORY_LABELS[template.category] || template.category}
                        </Badge>
                        {template.tenantId && (
                          <Badge size="xs" color="blue" variant="dot">
                            {tenants.find(t => t.value === template.tenantId)?.label || 'テナント専用'}
                          </Badge>
                        )}
                      </Group>
                    </Stack>
                    <Group gap={4}>
                      <Tooltip label="印刷">
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPrint(template);
                          }}
                        >
                          <IconPrinter size={14} />
                        </ActionIcon>
                      </Tooltip>
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

                <Tabs defaultValue="settings" variant="outline" radius="0">
                  <Tabs.List grow>
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

                      {/* テナント情報表示（読み取り専用） */}
                      <Card withBorder p="sm" bg="gray.0">
                        <Group>
                          <Text size="sm" fw={500}>適用範囲:</Text>
                          {selectedTemplate.tenantId ? (
                            <Badge color="blue">
                              {tenants.find(t => t.value === selectedTemplate.tenantId)?.label || 'テナント専用'}
                            </Badge>
                          ) : (
                            <Badge color="gray" variant="outline">全テナント共通（グローバル）</Badge>
                          )}
                        </Group>
                      </Card>

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
                        data={PAPER_PRESETS.map(p => ({ 
                          value: p.label, 
                          label: p.isCustom ? '📐 カスタムサイズ' : `${p.label} (${p.width}×${p.height}mm)` 
                        }))}
                        placeholder="プリセットから選択"
                        clearable
                        onChange={(val) => {
                          const preset = PAPER_PRESETS.find(p => p.label === val);
                          if (preset && !preset.isCustom) {
                            setSelectedTemplate({
                              ...selectedTemplate,
                              paperWidth: preset.width,
                              paperHeight: preset.height,
                            });
                            setHasChanges(true);
                          }
                          // カスタムの場合は何もしない（手動で幅・高さを入力）
                        }}
                      />

                      <TextInput
                        label="背景画像URL"
                        placeholder="https://... または下のファイル選択でアップロード"
                        value={selectedTemplate.backgroundUrl || ''}
                        onChange={(e) => {
                          setSelectedTemplate({ ...selectedTemplate, backgroundUrl: e.target.value || null });
                          setHasChanges(true);
                        }}
                        leftSection={<IconPhoto size={16} />}
                        rightSection={
                          selectedTemplate.backgroundUrl ? (
                            <ActionIcon 
                              variant="subtle" 
                              color="gray" 
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate({ ...selectedTemplate, backgroundUrl: null });
                                setHasChanges(true);
                              }}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          ) : null
                        }
                      />

                      <FileInput
                        label="背景画像をアップロード"
                        placeholder={uploadingBackground ? '読み込み中...' : '画像ファイルを選択...'}
                        accept="image/png,image/jpeg,image/webp"
                        leftSection={<IconUpload size={16} />}
                        disabled={uploadingBackground}
                        onChange={async (file) => {
                          if (!file) return;
                          
                          // ファイルサイズチェック（2MB上限）
                          if (file.size > 2 * 1024 * 1024) {
                            notifications.show({
                              title: 'エラー',
                              message: 'ファイルサイズは2MB以下にしてください',
                              color: 'red',
                            });
                            return;
                          }

                          setUploadingBackground(true);
                          try {
                            // Base64エンコード（プレビュー用）
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              setSelectedTemplate({ 
                                ...selectedTemplate, 
                                backgroundUrl: base64 
                              });
                              setHasChanges(true);
                              notifications.show({
                                title: '画像を読み込みました',
                                message: '保存ボタンを押して変更を反映してください',
                                color: 'blue',
                              });
                            };
                            reader.readAsDataURL(file);
                          } catch {
                            notifications.show({
                              title: 'エラー',
                              message: '画像の読み込みに失敗しました',
                              color: 'red',
                            });
                          } finally {
                            setUploadingBackground(false);
                          }
                        }}
                        description="PNG/JPEG/WebP形式、最大2MB"
                      />

                      {selectedTemplate.backgroundUrl && (
                        <Card withBorder p="sm">
                          <Text size="xs" c="dimmed" mb="xs">背景プレビュー</Text>
                          <div style={{ 
                            width: '100%', 
                            height: 100, 
                            backgroundImage: `url(${selectedTemplate.backgroundUrl})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            borderRadius: 4,
                            border: '1px solid #eee',
                          }} />
                        </Card>
                      )}

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
                                    label="幅 (mm)"
                                    value={pos.width || 50}
                                    onChange={(val) => updateFieldPosition(fieldName, { width: Number(val) || 50 })}
                                    min={10}
                                    max={selectedTemplate.paperWidth}
                                  />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                  <NumberInput
                                    size="xs"
                                    label="高さ (mm)"
                                    value={pos.height || 15}
                                    onChange={(val) => updateFieldPosition(fieldName, { height: Number(val) || 15 })}
                                    min={5}
                                    max={selectedTemplate.paperHeight}
                                  />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                  <NumberInput
                                    size="xs"
                                    label="文字サイズ"
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
                    <Stack gap="md">
                      <Group justify="flex-end">
                        <Switch
                          label="サンプルデータで表示"
                          checked={showSampleData}
                          onChange={(e) => setShowSampleData(e.currentTarget.checked)}
                        />
                      </Group>
                      <TemplatePreview 
                        template={selectedTemplate}
                        onUpdatePosition={(fieldName, x, y) => {
                          updateFieldPosition(fieldName, { x, y });
                        }}
                        onUpdateSize={(fieldName, width, height) => {
                          updateFieldPosition(fieldName, { width, height });
                        }}
                        sampleData={SAMPLE_DATA[selectedTemplate.category]}
                        showSampleData={showSampleData}
                      />
                    </Stack>
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

      {/* 印刷モーダル */}
      <Modal
        opened={printModalOpened}
        onClose={closePrintModal}
        title="印刷"
        size="xl"
      >
        {printTarget ? (
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={600} size="sm" lineClamp={2}>
                  {printTarget.name}
                </Text>
                <Text size="xs" c="dimmed">
                  用紙サイズ: {printTarget.paperWidth}mm × {printTarget.paperHeight}mm
                </Text>
              </Stack>
              <Badge size="sm" variant="light">
                {CATEGORY_LABELS[printTarget.category] || printTarget.category}
              </Badge>
            </Group>

            <Switch
              label="サンプルデータで印刷"
              checked={printUseSampleData}
              onChange={(e) => setPrintUseSampleData(e.currentTarget.checked)}
            />

            <TemplatePreview
              template={printTarget}
              sampleData={SAMPLE_DATA[printTarget.category]}
              showSampleData={printUseSampleData}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={closePrintModal}>
                キャンセル
              </Button>
              <Button
                leftSection={<IconPrinter size={16} />}
                onClick={() => {
                  handlePrint();
                  closePrintModal();
                }}
              >
                印刷する
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text c="dimmed">テンプレートが選択されていません</Text>
        )}
      </Modal>

      {/* 印刷用（非表示）iframe: srcDoc 経由でOS/ブラウザの印刷ダイアログを開く */}
      <iframe
        ref={printFrameRef}
        title="print-frame"
        style={{ display: 'none' }}
        srcDoc={printHtml ?? ''}
        onLoad={() => {
          if (!printHtml) return;
          if (hasRequestedPrintRef.current) return;

          const printWindow = printFrameRef.current?.contentWindow;
          if (!printWindow) {
            notifications.show({
              title: '印刷できません',
              message: '印刷用フレームを初期化できませんでした。再度お試しください。',
              color: 'red',
            });
            setPrintHtml(null);
            return;
          }

          hasRequestedPrintRef.current = true;

          const cleanup = () => {
            setPrintHtml(null);
            hasRequestedPrintRef.current = false;
          };

          try {
            printWindow.addEventListener('afterprint', cleanup, { once: true });
          } catch {
            // 一部ブラウザで addEventListener が制限される場合のフォールバック
          }

          // afterprint が来ない環境向けフォールバック
          window.setTimeout(cleanup, 5_000);

          // 印刷実行（ユーザー操作起点）
          printWindow.focus();
          printWindow.print();
        }}
      />

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
            label="適用範囲"
            description="特定のテナント専用にするか、全テナント共通にするか選択"
            data={tenants}
            value={newTemplateTenant}
            onChange={setNewTemplateTenant}
            placeholder="全テナント共通（グローバル）"
            clearable
          />

          <Select
            label="用紙サイズ"
            data={PAPER_PRESETS.map(p => ({ 
              value: p.label, 
              label: p.isCustom ? '📐 カスタムサイズ' : `${p.label} (${p.width}×${p.height}mm)` 
            }))}
            value={selectedPaperPreset}
            onChange={setSelectedPaperPreset}
            placeholder="A4 縦"
          />

          {selectedPaperPreset === 'カスタム' && (
            <Group grow>
              <NumberInput
                label="幅 (mm)"
                value={customPaperWidth}
                onChange={(val) => setCustomPaperWidth(Number(val) || 210)}
                min={50}
                max={1000}
                placeholder="例: 210"
              />
              <NumberInput
                label="高さ (mm)"
                value={customPaperHeight}
                onChange={(val) => setCustomPaperHeight(Number(val) || 297)}
                min={50}
                max={1000}
                placeholder="例: 297"
              />
            </Group>
          )}

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

// プレビューコンポーネント（ドラッグ＆ドロップ対応）
interface TemplatePreviewProps {
  template: PrintTemplate;
  onUpdatePosition?: (fieldName: string, x: number, y: number) => void;
  onUpdateSize?: (fieldName: string, width: number, height: number) => void;
  sampleData?: Record<string, string>;
  showSampleData?: boolean;
}

// リサイズハンドルの方向
type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw';

function TemplatePreview({ template, onUpdatePosition, onUpdateSize, sampleData, showSampleData }: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  // 実寸表示（96dpi基準）をベースに、userScaleでズーム調整
  const scale = 1; // baseScaleは常に1.0（実寸）
  const [userScale, setUserScale] = useState(1); // ユーザー指定の倍率（0.2〜2.0）
  const displayScale = scale * userScale; // 表示用スケール
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{ field: string; direction: ResizeDirection } | null>(null);
  // ドラッグ開始時のマウス位置と要素の初期位置を保持
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elementX: 0, elementY: 0 });
  // リサイズ開始時の情報を保持
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0, x: 0, y: 0 });

  // mm → px 変換（96dpi基準、25.4mm = 1inch）
  const mmToPx = useCallback((mm: number) => (mm * 96) / 25.4 * displayScale, [displayScale]);
  
  // px → mm 変換（useEffect内で直接計算するため、ここでは未使用）
  // const pxToMm = useCallback((px: number) => (px * 25.4) / 96 / displayScale, [displayScale]);

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent, fieldName: string) => {
    if (!onUpdatePosition) return;
    e.preventDefault();
    e.stopPropagation();
    
    // 現在の要素位置（mm単位）を取得
    const currentPos = template.positions[fieldName];
    if (!currentPos) return;
    
    // 重要: refを先に設定してからstateを更新する
    // （useEffectがトリガーされる前にrefの値が設定されている必要がある）
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elementX: currentPos.x,
      elementY: currentPos.y,
    };
    
    console.log('ドラッグ開始:', {
      field: fieldName,
      mouseX: e.clientX,
      mouseY: e.clientY,
      elementX: currentPos.x,
      elementY: currentPos.y,
    });
    
    setSelectedField(fieldName);
    setDragging(fieldName);
  };

  // リサイズ開始
  const handleResizeStart = (e: React.MouseEvent, fieldName: string, direction: ResizeDirection) => {
    if (!onUpdateSize) return;
    e.preventDefault();
    e.stopPropagation();
    
    const currentPos = template.positions[fieldName];
    if (!currentPos) return;
    
    // 重要: refを先に設定してからstateを更新する
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: currentPos.width || 50,
      height: currentPos.height || 15,
      x: currentPos.x,
      y: currentPos.y,
    };
    
    console.log('リサイズ開始:', {
      field: fieldName,
      direction,
      ...resizeStartRef.current,
    });
    
    setSelectedField(fieldName);
    setResizing({ field: fieldName, direction });
  };

  // ドラッグ用グローバルイベントリスナー
  useEffect(() => {
    console.log('useEffect triggered, dragging:', dragging);
    if (!dragging) return;
    
    // useEffect内で直接px→mm変換を行う（クロージャ問題を回避）
    const pxToMmDirect = (px: number) => (px * 25.4) / 96 / displayScale;
    
    console.log('Adding event listeners for drag, displayScale:', displayScale);
    
    const handleMove = (e: MouseEvent) => {
      if (!paperRef.current || !onUpdatePosition) return;
      
      // refから開始時の値を取得
      const { mouseX, mouseY, elementX, elementY } = dragStartRef.current;
      
      console.log('handleMove called, ref values:', { mouseX, mouseY, elementX, elementY });
      
      // マウス移動量をピクセルで計算
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      
      // ピクセル移動量をmm単位に変換して、開始位置に加算
      const newX = elementX + pxToMmDirect(deltaX);
      const newY = elementY + pxToMmDirect(deltaY);
      
      // 用紙範囲内に制限
      const clampedX = Math.max(0, Math.min(newX, template.paperWidth - 20));
      const clampedY = Math.max(0, Math.min(newY, template.paperHeight - 10));
      
      console.log('ドラッグ中:', {
        displayScale,
        currentMouse: { x: e.clientX, y: e.clientY },
        startMouse: { x: mouseX, y: mouseY },
        delta: { x: deltaX, y: deltaY },
        startElement: { x: elementX, y: elementY },
        newPos: { x: newX, y: newY },
        clamped: { x: clampedX, y: clampedY },
      });
      
      onUpdatePosition(dragging, Math.round(clampedX), Math.round(clampedY));
    };
    
    const handleUp = () => {
      console.log('handleUp called, stopping drag');
      setDragging(null);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    
    return () => {
      console.log('Cleanup: removing event listeners');
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, displayScale, template.paperWidth, template.paperHeight, onUpdatePosition]);

  // リサイズ用グローバルイベントリスナー
  useEffect(() => {
    if (!resizing) return;
    
    // useEffect内で直接px→mm変換を行う（クロージャ問題を回避）
    const pxToMmDirect = (px: number) => (px * 25.4) / 96 / displayScale;
    
    const handleMove = (e: MouseEvent) => {
      if (!onUpdateSize || !onUpdatePosition) return;
      
      const { mouseX, mouseY, width, height, x, y } = resizeStartRef.current;
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      const deltaMmX = pxToMmDirect(deltaX);
      const deltaMmY = pxToMmDirect(deltaY);
      
      let newWidth = width;
      let newHeight = height;
      let newX = x;
      let newY = y;
      
      const { direction, field } = resizing;
      
      // 方向に応じてサイズと位置を計算
      if (direction.includes('e')) {
        newWidth = Math.max(10, width + deltaMmX);
      }
      if (direction.includes('w')) {
        newWidth = Math.max(10, width - deltaMmX);
        newX = x + deltaMmX;
      }
      if (direction.includes('s')) {
        newHeight = Math.max(5, height + deltaMmY);
      }
      if (direction.includes('n')) {
        newHeight = Math.max(5, height - deltaMmY);
        newY = y + deltaMmY;
      }
      
      // 用紙範囲内に制限
      newX = Math.max(0, Math.min(newX, template.paperWidth - 10));
      newY = Math.max(0, Math.min(newY, template.paperHeight - 5));
      newWidth = Math.min(newWidth, template.paperWidth - newX);
      newHeight = Math.min(newHeight, template.paperHeight - newY);
      
      // 位置が変わった場合は位置も更新
      if (direction.includes('w') || direction.includes('n')) {
        onUpdatePosition(field, Math.round(newX), Math.round(newY));
      }
      onUpdateSize(field, Math.round(newWidth), Math.round(newHeight));
    };
    
    const handleUp = () => {
      setResizing(null);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [resizing, displayScale, template.paperWidth, template.paperHeight, onUpdateSize, onUpdatePosition]);

  // フィールドの表示値を取得
  const getFieldDisplayValue = (fieldName: string): string => {
    if (showSampleData && sampleData && sampleData[fieldName]) {
      return sampleData[fieldName];
    }
    return FIELD_LABELS[fieldName] || fieldName;
  };

  const isEditable = !!onUpdatePosition;

  // スライダーのマーク
  const sliderMarks = [
    { value: 0.2, label: '20%' },
    { value: 0.5, label: '50%' },
    { value: 1, label: '100%' },
    { value: 1.5, label: '150%' },
    { value: 2, label: '200%' },
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            用紙サイズ: {template.paperWidth}mm × {template.paperHeight}mm
          </Text>
          {isEditable && (
            <Text size="sm" c="blue">
              💡 フィールドをドラッグして位置を調整できます
            </Text>
          )}
        </Stack>
        <Stack gap="xs" style={{ minWidth: 200 }}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">表示倍率</Text>
            <Text size="sm" fw={500}>{Math.round(displayScale * 100)}%</Text>
          </Group>
          <Slider
            value={userScale}
            onChange={setUserScale}
            min={0.2}
            max={2}
            step={0.1}
            marks={sliderMarks}
            label={(value) => `${Math.round(value * 100)}%`}
            size="sm"
            styles={{
              markLabel: { fontSize: 10 },
            }}
          />
        </Stack>
      </Group>

      <div
        ref={containerRef}
        style={{
          padding: 20,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          overflow: 'auto',
          maxHeight: 600,
          minHeight: 400,
          cursor: dragging ? 'grabbing' : 'default',
        }}
      >
        {/* 用紙を中央配置するためのラッパー（スクロール時は左上基準） */}
        <div
          style={{
            display: 'inline-block',
            minWidth: '100%',
            minHeight: '100%',
            textAlign: 'center',
          }}
        >
          <div
            ref={paperRef}
            style={{
              display: 'inline-block',
              width: mmToPx(template.paperWidth),
              height: mmToPx(template.paperHeight),
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              position: 'relative',
              backgroundImage: template.backgroundUrl ? `url(${template.backgroundUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              textAlign: 'left',
            }}
            onClick={() => setSelectedField(null)}
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
                pointerEvents: 'none',
              }}
            />
          )}

          {/* グリッドライン（編集モード時） */}
          {isEditable && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.3,
              }}
            >
              {/* 10mm間隔のグリッド */}
              {Array.from({ length: Math.floor(template.paperWidth / 10) + 1 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={mmToPx(i * 10)}
                  y1={0}
                  x2={mmToPx(i * 10)}
                  y2={mmToPx(template.paperHeight)}
                  stroke="#ccc"
                  strokeWidth={i % 5 === 0 ? 1 : 0.5}
                />
              ))}
              {Array.from({ length: Math.floor(template.paperHeight / 10) + 1 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={mmToPx(i * 10)}
                  x2={mmToPx(template.paperWidth)}
                  y2={mmToPx(i * 10)}
                  stroke="#ccc"
                  strokeWidth={i % 5 === 0 ? 1 : 0.5}
                />
              ))}
            </svg>
          )}

          {/* フィールド表示 */}
          {Object.entries(template.positions).map(([fieldName, pos]) => {
            const isSelected = selectedField === fieldName;
            const isDraggingThis = dragging === fieldName;
            const isResizingThis = resizing?.field === fieldName;
            const hasSize = pos.width && pos.height;
            const canResize = isEditable && onUpdateSize;
            
            // デフォルトサイズ（設定がない場合）
            const fieldWidth = pos.width || 50;
            const fieldHeight = pos.height || 15;
            
            return (
              <div
                key={fieldName}
                onMouseDown={(e) => handleMouseDown(e, fieldName)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedField(fieldName);
                }}
                style={{
                  position: 'absolute',
                  left: mmToPx(pos.x),
                  top: mmToPx(pos.y),
                  width: hasSize ? mmToPx(fieldWidth) : 'auto',
                  height: hasSize ? mmToPx(fieldHeight) : 'auto',
                  minWidth: hasSize ? undefined : mmToPx(20),
                  fontSize: (pos.fontSize || 12) * displayScale,
                  textAlign: pos.align || 'left',
                  color: showSampleData ? (pos.color || '#333') : '#333',
                  fontWeight: pos.fontWeight || 'normal',
                  whiteSpace: hasSize ? 'normal' : 'nowrap',
                  overflow: hasSize ? 'hidden' : 'visible',
                  border: isSelected ? '2px solid #228be6' : '1px dashed #aaa',
                  padding: '2px 4px',
                  backgroundColor: showSampleData 
                    ? 'transparent' 
                    : isSelected 
                      ? 'rgba(34, 139, 230, 0.15)' 
                      : 'rgba(255, 255, 200, 0.8)',
                  cursor: isEditable ? (isDraggingThis || isResizingThis ? 'grabbing' : 'grab') : 'default',
                  userSelect: 'none',
                  boxShadow: isSelected ? '0 0 0 2px rgba(34, 139, 230, 0.3)' : undefined,
                  zIndex: isSelected || isDraggingThis || isResizingThis ? 100 : 1,
                  transition: isDraggingThis || isResizingThis ? 'none' : 'box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
              >
                {getFieldDisplayValue(fieldName)}
                
                {/* 座標・サイズ情報ラベル */}
                {isEditable && isSelected && !showSampleData && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -20,
                      left: 0,
                      fontSize: 10 * scale,
                      backgroundColor: '#228be6',
                      color: 'white',
                      padding: '1px 4px',
                      borderRadius: 2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    X:{pos.x} Y:{pos.y} {hasSize && `W:${fieldWidth} H:${fieldHeight}`}
                  </div>
                )}
                
                {/* リサイズハンドル（選択中かつ編集可能な場合のみ表示） */}
                {canResize && isSelected && !showSampleData && (
                  <>
                    {/* 四隅のハンドル */}
                    {(['nw', 'ne', 'sw', 'se'] as ResizeDirection[]).map((dir) => (
                      <div
                        key={dir}
                        onMouseDown={(e) => handleResizeStart(e, fieldName, dir)}
                        style={{
                          position: 'absolute',
                          width: 8,
                          height: 8,
                          backgroundColor: '#228be6',
                          border: '1px solid white',
                          borderRadius: 2,
                          cursor: `${dir}-resize`,
                          ...(dir === 'nw' && { top: -4, left: -4 }),
                          ...(dir === 'ne' && { top: -4, right: -4 }),
                          ...(dir === 'sw' && { bottom: -4, left: -4 }),
                          ...(dir === 'se' && { bottom: -4, right: -4 }),
                          zIndex: 101,
                        }}
                      />
                    ))}
                    {/* 辺のハンドル */}
                    {(['n', 's', 'e', 'w'] as ResizeDirection[]).map((dir) => (
                      <div
                        key={dir}
                        onMouseDown={(e) => handleResizeStart(e, fieldName, dir)}
                        style={{
                          position: 'absolute',
                          backgroundColor: '#228be6',
                          border: '1px solid white',
                          borderRadius: 1,
                          ...(dir === 'n' && { 
                            top: -3, left: '50%', transform: 'translateX(-50%)',
                            width: 16, height: 6, cursor: 'n-resize' 
                          }),
                          ...(dir === 's' && { 
                            bottom: -3, left: '50%', transform: 'translateX(-50%)',
                            width: 16, height: 6, cursor: 's-resize' 
                          }),
                          ...(dir === 'e' && { 
                            right: -3, top: '50%', transform: 'translateY(-50%)',
                            width: 6, height: 16, cursor: 'e-resize' 
                          }),
                          ...(dir === 'w' && { 
                            left: -3, top: '50%', transform: 'translateY(-50%)',
                            width: 6, height: 16, cursor: 'w-resize' 
                          }),
                          zIndex: 101,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {!showSampleData && (
        <Alert color="blue" icon={<IconAlertCircle size={16} />}>
          {isEditable 
            ? 'フィールドをドラッグして位置を調整、選択後に四隅/辺のハンドルでサイズを調整できます。'
            : 'プレビューでは各フィールドの配置位置を確認できます。実際の印刷時にはデータが差し込まれます。'
          }
        </Alert>
      )}
    </Stack>
  );
}
