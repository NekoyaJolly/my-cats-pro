'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Title,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Grid,
  Text,
  Box,
  Paper,
  Accordion,
  Divider,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiClient, type ApiResponse } from '../../lib/api/client';
import { 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconDna,
  IconPlus,
} from '@tabler/icons-react';
import classes from './PedigreeRegistrationForm.module.css';

// API レスポンスの型定義
type BreedsResponse = Breed[];

type CoatColorsResponse = CoatColor[];

type GendersResponse = Gender[];

interface PedigreeResponse {
  data: PedigreeFormData;
}

// 型安全なAPIヘルパー関数
const getBreeds = async (params?: { limit?: string }): Promise<ApiResponse<BreedsResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return apiClient.get('/breeds', params ? { query: params } : undefined);
};

const getCoatColors = async (params?: { limit?: string }): Promise<ApiResponse<CoatColorsResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return apiClient.get('/coat-colors', params ? { query: params } : undefined);
};

const getGenders = async (): Promise<ApiResponse<GendersResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return apiClient.get('/master/genders');
};

const getPedigreeByNumber = async (pedigreeNumber: string): Promise<ApiResponse<PedigreeResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return apiClient.get(`/pedigrees/pedigree-id/${pedigreeNumber}`);
};

const getNextPedigreeId = async (): Promise<ApiResponse<{ nextId: string }>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return apiClient.get('/pedigrees/next-id');
};

const createPedigree = async (data: PedigreeFormData): Promise<ApiResponse<PedigreeResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return apiClient.post('/pedigrees', { body: data });
};

interface Breed {
  id: string;
  code: number;
  name: string;
}

interface CoatColor {
  id: string;
  code: number;
  name: string;
}

interface Gender {
  id: string;
  code: number;
  name: string;
}

// Access設計準拠: 基本情報17項目 + 血統情報62項目
interface PedigreeFormData {
  // ========== 基本情報（17項目）==========
  pedigreeId: string;
  title?: string;
  catName?: string;
  catName2?: string;
  breedCode?: number;
  genderCode?: number;
  eyeColor?: string;
  coatColorCode?: number;
  birthDate?: string;
  breederName?: string;
  ownerName?: string;
  registrationDate?: string;
  brotherCount?: number;
  sisterCount?: number;
  notes?: string;
  notes2?: string;
  otherNo?: string;

  // ========== 血統情報（62項目）==========
  // 第1世代: 父親（7項目）
  fatherTitle?: string;
  fatherCatName?: string;
  fatherCatName2?: string;
  fatherCoatColor?: string;
  fatherEyeColor?: string;
  fatherJCU?: string;
  fatherOtherCode?: string;

  // 第1世代: 母親（7項目）
  motherTitle?: string;
  motherCatName?: string;
  motherCatName2?: string;
  motherCoatColor?: string;
  motherEyeColor?: string;
  motherJCU?: string;
  motherOtherCode?: string;

  // 第2世代: 祖父母（16項目 = 4名 × 4項目）
  ffTitle?: string;
  ffCatName?: string;
  ffCatColor?: string;
  ffjcu?: string;

  fmTitle?: string;
  fmCatName?: string;
  fmCatColor?: string;
  fmjcu?: string;

  mfTitle?: string;
  mfCatName?: string;
  mfCatColor?: string;
  mfjcu?: string;

  mmTitle?: string;
  mmCatName?: string;
  mmCatColor?: string;
  mmjcu?: string;

  // 第3世代: 曾祖父母（32項目 = 8名 × 4項目）
  fffTitle?: string;
  fffCatName?: string;
  fffCatColor?: string;
  fffjcu?: string;

  ffmTitle?: string;
  ffmCatName?: string;
  ffmCatColor?: string;
  ffmjcu?: string;

  fmfTitle?: string;
  fmfCatName?: string;
  fmfCatColor?: string;
  fmfjcu?: string;

  fmmTitle?: string;
  fmmCatName?: string;
  fmmCatColor?: string;
  fmmjcu?: string;

  mffTitle?: string;
  mffCatName?: string;
  mffCatColor?: string;
  mffjcu?: string;

  mfmTitle?: string;
  mfmCatName?: string;
  mfmCatColor?: string;
  mfmjcu?: string;

  mmfTitle?: string;
  mmfCatName?: string;
  mmfCatColor?: string;
  mmfjcu?: string;

  mmmTitle?: string;
  mmmCatName?: string;
  mmmCatColor?: string;
  mmmjcu?: string;

  oldCode?: string;
}

interface PedigreeRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PedigreeRegistrationForm({ onSuccess, onCancel }: PedigreeRegistrationFormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [coatColors, setCoatColors] = useState<CoatColor[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [formData, setFormData] = useState<PedigreeFormData>({
    pedigreeId: '',
  });
  const [focused, setFocused] = useState<string | null>(null);

  // 名称入力用のローカルステート
  const [inputValues, setInputValues] = useState({
    breedName: '',
    genderName: '',
    coatColorName: '',
  });

  // コード変更時に名称を同期
  useEffect(() => {
    if (formData.breedCode !== undefined) {
      const found = breeds.find(b => b.code === formData.breedCode);
      if (found) setInputValues(prev => ({ ...prev, breedName: found.name }));
    }
    if (formData.genderCode !== undefined) {
      const found = genders.find(g => g.code === formData.genderCode);
      if (found) setInputValues(prev => ({ ...prev, genderName: found.name }));
    }
    if (formData.coatColorCode !== undefined) {
      const found = coatColors.find(c => c.code === formData.coatColorCode);
      if (found) setInputValues(prev => ({ ...prev, coatColorName: found.name }));
    }
  }, [formData.breedCode, formData.genderCode, formData.coatColorCode, breeds, genders, coatColors]);

  // Call ID用の状態
  const [callId, setCallId] = useState({
    both: '',
    father: '',
    mother: '',
  });

  // デバウンス用タイムアウト
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      // 品種
      const breedsRes = await getBreeds({ limit: '1000' });
      if (breedsRes.success && breedsRes.data) {
        setBreeds(breedsRes.data || []);
      }

      // 毛色
      const colorsRes = await getCoatColors({ limit: '1000' });
      if (colorsRes.success && colorsRes.data) {
        setCoatColors(colorsRes.data || []);
      }

      // 性別
      const gendersRes = await getGenders();
      if (gendersRes.success && gendersRes.data) {
        setGenders(gendersRes.data || []);
      }
    } catch (error) {
      console.error('マスターデータの取得に失敗:', error);
    }
  };

  // Call ID: 血統書番号から血統情報を取得
  const fetchPedigreeByNumber = async (pedigreeNumber: string): Promise<PedigreeFormData | null> => {
    if (!pedigreeNumber.trim()) return null;
    
    try {
      const response = await getPedigreeByNumber(pedigreeNumber);
      if (response.success && response.data) {
        return response.data.data;
      }
    } catch (error) {
      console.error('血統書データの取得に失敗:', error);
    }
    return null;
  };

  // Call ID: 両親IDから一括取得
  const handleBothParentsCall = async (pedigreeNumber: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(async () => {
      const data = await fetchPedigreeByNumber(pedigreeNumber);
      if (data) {
        // 父親情報を設定（7項目）
        updateFormData('fatherTitle', data.fatherTitle);
        updateFormData('fatherCatName', data.fatherCatName);
        updateFormData('fatherCatName2', data.fatherCatName2);
        updateFormData('fatherCoatColor', data.fatherCoatColor);
        updateFormData('fatherEyeColor', data.fatherEyeColor);
        updateFormData('fatherJCU', data.fatherJCU);
        updateFormData('fatherOtherCode', data.fatherOtherCode);

        // 母親情報を設定（7項目）
        updateFormData('motherTitle', data.motherTitle);
        updateFormData('motherCatName', data.motherCatName);
        updateFormData('motherCatName2', data.motherCatName2);
        updateFormData('motherCoatColor', data.motherCoatColor);
        updateFormData('motherEyeColor', data.motherEyeColor);
        updateFormData('motherJCU', data.motherJCU);
        updateFormData('motherOtherCode', data.motherOtherCode);

        // 祖父母情報を設定（16項目）
        updateFormData('ffTitle', data.ffTitle);
        updateFormData('ffCatName', data.ffCatName);
        updateFormData('ffCatColor', data.ffCatColor);
        updateFormData('ffjcu', data.ffjcu);

        updateFormData('fmTitle', data.fmTitle);
        updateFormData('fmCatName', data.fmCatName);
        updateFormData('fmCatColor', data.fmCatColor);
        updateFormData('fmjcu', data.fmjcu);

        updateFormData('mfTitle', data.mfTitle);
        updateFormData('mfCatName', data.mfCatName);
        updateFormData('mfCatColor', data.mfCatColor);
        updateFormData('mfjcu', data.mfjcu);

        updateFormData('mmTitle', data.mmTitle);
        updateFormData('mmCatName', data.mmCatName);
        updateFormData('mmCatColor', data.mmCatColor);
        updateFormData('mmjcu', data.mmjcu);

        // 曾祖父母情報を設定（32項目）
        updateFormData('fffTitle', data.fffTitle);
        updateFormData('fffCatName', data.fffCatName);
        updateFormData('fffCatColor', data.fffCatColor);
        updateFormData('fffjcu', data.fffjcu);

        updateFormData('ffmTitle', data.ffmTitle);
        updateFormData('ffmCatName', data.ffmCatName);
        updateFormData('ffmCatColor', data.ffmCatColor);
        updateFormData('ffmjcu', data.ffmjcu);

        updateFormData('fmfTitle', data.fmfTitle);
        updateFormData('fmfCatName', data.fmfCatName);
        updateFormData('fmfCatColor', data.fmfCatColor);
        updateFormData('fmfjcu', data.fmfjcu);

        updateFormData('fmmTitle', data.fmmTitle);
        updateFormData('fmmCatName', data.fmmCatName);
        updateFormData('fmmCatColor', data.fmmCatColor);
        updateFormData('fmmjcu', data.fmmjcu);

        updateFormData('mffTitle', data.mffTitle);
        updateFormData('mffCatName', data.mffCatName);
        updateFormData('mffCatColor', data.mffCatColor);
        updateFormData('mffjcu', data.mffjcu);

        updateFormData('mfmTitle', data.mfmTitle);
        updateFormData('mfmCatName', data.mfmCatName);
        updateFormData('mfmCatColor', data.mfmCatColor);
        updateFormData('mfmjcu', data.mfmjcu);

        updateFormData('mmfTitle', data.mmfTitle);
        updateFormData('mmfCatName', data.mmfCatName);
        updateFormData('mmfCatColor', data.mmfCatColor);
        updateFormData('mmfjcu', data.mmfjcu);

        updateFormData('mmmTitle', data.mmmTitle);
        updateFormData('mmmCatName', data.mmmCatName);
        updateFormData('mmmCatColor', data.mmmCatColor);
        updateFormData('mmmjcu', data.mmmjcu);

        notifications.show({
          title: '両親血統情報取得',
          message: `${data.catName}の血統情報を一括取得しました（62項目）`,
          color: 'green',
        });
      } else {
        notifications.show({
          title: '検索結果なし',
          message: `血統書番号 ${pedigreeNumber} が見つかりませんでした`,
          color: 'yellow',
        });
      }
    }, 800);

    setSearchTimeout(timeout);
  };

  // Call ID: 父猫IDから取得（父+祖父母16項目）
  const handleFatherCall = async (pedigreeNumber: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(async () => {
      const data = await fetchPedigreeByNumber(pedigreeNumber);
      if (data) {
        // 父親情報（7項目）
        updateFormData('fatherTitle', data.title);
        updateFormData('fatherCatName', data.catName);
        updateFormData('fatherCatName2', data.catName2);
        updateFormData('fatherCoatColor', data.coatColorCode?.toString());
        updateFormData('fatherEyeColor', data.eyeColor);
        updateFormData('fatherJCU', data.pedigreeId);
        updateFormData('fatherOtherCode', data.otherNo);

        // 父方祖父母（8項目）
        updateFormData('ffTitle', data.fatherTitle);
        updateFormData('ffCatName', data.fatherCatName);
        updateFormData('ffCatColor', data.fatherCoatColor);
        updateFormData('ffjcu', data.fatherJCU);

        updateFormData('fmTitle', data.motherTitle);
        updateFormData('fmCatName', data.motherCatName);
        updateFormData('fmCatColor', data.motherCoatColor);
        updateFormData('fmjcu', data.motherJCU);

        notifications.show({
          title: '父猫血統情報取得',
          message: `${data.catName}の血統情報を取得しました`,
          color: 'blue',
        });
      }
    }, 800);

    setSearchTimeout(timeout);
  };

  // Call ID: 母猫IDから取得（母+祖父母16項目）
  const handleMotherCall = async (pedigreeNumber: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(async () => {
      const data = await fetchPedigreeByNumber(pedigreeNumber);
      if (data) {
        // 母親情報（7項目）
        updateFormData('motherTitle', data.title);
        updateFormData('motherCatName', data.catName);
        updateFormData('motherCatName2', data.catName2);
        updateFormData('motherCoatColor', data.coatColorCode?.toString());
        updateFormData('motherEyeColor', data.eyeColor);
        updateFormData('motherJCU', data.pedigreeId);
        updateFormData('motherOtherCode', data.otherNo);

        // 母方祖父母（8項目）
        updateFormData('mfTitle', data.fatherTitle);
        updateFormData('mfCatName', data.fatherCatName);
        updateFormData('mfCatColor', data.fatherCoatColor);
        updateFormData('mfjcu', data.fatherJCU);

        updateFormData('mmTitle', data.motherTitle);
        updateFormData('mmCatName', data.motherCatName);
        updateFormData('mmCatColor', data.motherCoatColor);
        updateFormData('mmjcu', data.motherJCU);

        notifications.show({
          title: '母猫血統情報取得',
          message: `${data.catName}の血統情報を取得しました`,
          color: 'pink',
        });
      }
    }, 800);

    setSearchTimeout(timeout);
  };

  // 次の血統書番号を取得
  const handleGetNextId = async () => {
    try {
      const response = await getNextPedigreeId();
      if (response.success && response.data) {
        updateFormData('pedigreeId', response.data.nextId);
        notifications.show({
          title: '自動採番',
          message: `次の血統書番号 ${response.data.nextId} を設定しました`,
          color: 'blue',
        });
      }
    } catch (error) {
      console.error('自動採番エラー:', error);
      notifications.show({
        title: 'エラー',
        message: '次の番号の取得に失敗しました',
        color: 'red',
      });
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 必須チェック
      if (!formData.pedigreeId.trim()) {
        notifications.show({
          title: 'バリデーションエラー',
          message: '血統書番号は必須です',
          color: 'red',
        });
        setLoading(false);
        return;
      }

      // 重複チェック
      try {
        const checkRes = await getPedigreeByNumber(formData.pedigreeId);
        if (checkRes.success && checkRes.data) {
          notifications.show({
            title: '重複エラー',
            message: `血統書番号 ${formData.pedigreeId} は既に登録されています`,
            color: 'red',
          });
          setLoading(false);
          return;
        }
      } catch {
        // 404の場合は存在しないので登録可能
      }

      // 送信
      const response = await createPedigree(formData);

      if (response.success) {
        notifications.show({
          title: '登録完了',
          message: '血統書が正常に登録されました',
          color: 'green',
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/pedigrees');
        }
      } else {
        throw new Error(response.error || response.message || '登録に失敗しました');
      }
    } catch (error) {
      console.error('登録エラー:', error);
      notifications.show({
        title: '登録エラー',
        message: error instanceof Error ? error.message : '血統書の登録に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof PedigreeFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // コードと名称の同期ロジック
  const handleCodeChange = (type: 'breed' | 'gender' | 'coatColor', codeStr: string) => {
    const code = parseInt(codeStr);
    
    if (type === 'breed') {
      if (isNaN(code)) {
        updateFormData('breedCode', undefined);
        setInputValues(prev => ({ ...prev, breedName: '' }));
      } else {
        updateFormData('breedCode', code);
        const found = breeds.find(b => b.code === code);
        if (found) setInputValues(prev => ({ ...prev, breedName: found.name }));
      }
    } else if (type === 'gender') {
      if (isNaN(code)) {
        updateFormData('genderCode', undefined);
        setInputValues(prev => ({ ...prev, genderName: '' }));
      } else {
        updateFormData('genderCode', code);
        const found = genders.find(g => g.code === code);
        if (found) setInputValues(prev => ({ ...prev, genderName: found.name }));
      }
    } else if (type === 'coatColor') {
      if (isNaN(code)) {
        updateFormData('coatColorCode', undefined);
        setInputValues(prev => ({ ...prev, coatColorName: '' }));
      } else {
        updateFormData('coatColorCode', code);
        const found = coatColors.find(c => c.code === code);
        if (found) setInputValues(prev => ({ ...prev, coatColorName: found.name }));
      }
    }
  };

  const handleNameChange = (type: 'breed' | 'gender' | 'coatColor', name: string) => {
    const normalizedName = name.trim().toLowerCase();
    
    if (type === 'breed') {
      setInputValues(prev => ({ ...prev, breedName: name }));
      const found = breeds.find(b => b.name.toLowerCase() === normalizedName);
      if (found) updateFormData('breedCode', found.code);
    } else if (type === 'gender') {
      setInputValues(prev => ({ ...prev, genderName: name }));
      const found = genders.find(g => g.name.toLowerCase() === normalizedName);
      if (found) updateFormData('genderCode', found.code);
    } else if (type === 'coatColor') {
      setInputValues(prev => ({ ...prev, coatColorName: name }));
      const found = coatColors.find(c => c.name.toLowerCase() === normalizedName);
      if (found) updateFormData('coatColorCode', found.code);
    }
  };

  // 名称解決ヘルパー (削除予定だが、他の箇所で使われている可能性があるため確認)
  // const getBreedName = ... 
  // 今回の改修で inputValues に置き換わったため削除します。

  if (!mounted) return null;

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* 基本情報（17項目）*/}
          <Paper p="lg" withBorder>
            <Grid gutter="xs">
              {/* Row A: 血統書番号, キャッテリー名, 猫の名前 */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="血統書番号"
                  required
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'pedigreeId' || formData.pedigreeId.trim().length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'pedigreeId' || formData.pedigreeId.trim().length > 0 || undefined }}
                  value={formData.pedigreeId}
                  onChange={(e) => updateFormData('pedigreeId', e.target.value)}
                  onFocus={() => setFocused('pedigreeId')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                  leftSection={
                    <Tooltip label="次の番号を自動入力">
                      <ActionIcon variant="subtle" color="blue" onClick={handleGetNextId}>
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  }
                  styles={{
                    input: { paddingLeft: '2.9rem' },
                    section: { marginLeft: 0 },
                    label: { left: '2.9rem' }
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="キャッテリー名"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'catName2' || (formData.catName2 || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'catName2' || (formData.catName2 || '').length > 0 || undefined }}
                  value={formData.catName2 || ''}
                  onChange={(e) => updateFormData('catName2', e.target.value)}
                  onFocus={() => setFocused('catName2')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="猫の名前"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'catName' || (formData.catName || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'catName' || (formData.catName || '').length > 0 || undefined }}
                  value={formData.catName || ''}
                  onChange={(e) => updateFormData('catName', e.target.value)}
                  onFocus={() => setFocused('catName')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>

              {/* Row B: 品種, 毛色, 性別 */}
              {/* 品種 */}
              <Grid.Col span={{ base: 3, md: 1 }}>
                <TextInput
                  label="品種コード"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'breedCode' || (formData.breedCode?.toString() || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'breedCode' || (formData.breedCode?.toString() || '').length > 0 || undefined }}
                  value={formData.breedCode?.toString() || ''}
                  onChange={(e) => handleCodeChange('breed', e.target.value)}
                  onFocus={() => setFocused('breedCode')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 9, md: 3 }}>
                <TextInput
                  label="品種名"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'breedName' || inputValues.breedName.length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'breedName' || inputValues.breedName.length > 0 || undefined }}
                  value={inputValues.breedName}
                  onChange={(e) => handleNameChange('breed', e.target.value)}
                  onFocus={() => setFocused('breedName')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              {/* 毛色 */}
              <Grid.Col span={{ base: 3, md: 1 }}>
                <TextInput
                  label="毛色コード"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'coatColorCode' || (formData.coatColorCode?.toString() || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'coatColorCode' || (formData.coatColorCode?.toString() || '').length > 0 || undefined }}
                  value={formData.coatColorCode?.toString() || ''}
                  onChange={(e) => handleCodeChange('coatColor', e.target.value)}
                  onFocus={() => setFocused('coatColorCode')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 9, md: 3 }}>
                <TextInput
                  label="毛色"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'coatColorName' || inputValues.coatColorName.length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'coatColorName' || inputValues.coatColorName.length > 0 || undefined }}
                  value={inputValues.coatColorName}
                  onChange={(e) => handleNameChange('coatColor', e.target.value)}
                  onFocus={() => setFocused('coatColorName')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              {/* 性別 */}
              <Grid.Col span={{ base: 3, md: 1 }}>
                <TextInput
                  label="性別コード"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'genderCode' || (formData.genderCode?.toString() || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'genderCode' || (formData.genderCode?.toString() || '').length > 0 || undefined }}
                  value={formData.genderCode?.toString() || ''}
                  onChange={(e) => handleCodeChange('gender', e.target.value)}
                  onFocus={() => setFocused('genderCode')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 9, md: 3 }}>
                <TextInput
                  label="性別"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'genderName' || inputValues.genderName.length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'genderName' || inputValues.genderName.length > 0 || undefined }}
                  value={inputValues.genderName}
                  onChange={(e) => handleNameChange('gender', e.target.value)}
                  onFocus={() => setFocused('genderName')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>

              {/* Row C: タイトル, 目の色, 生年月日, 登録年月日 */}
              <Grid.Col span={{ base: 6, md: 3 }}>
                <TextInput
                  label="タイトル"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'title' || (formData.title || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'title' || (formData.title || '').length > 0 || undefined }}
                  value={formData.title || ''}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  onFocus={() => setFocused('title')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <TextInput
                  label="目の色"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'eyeColor' || (formData.eyeColor || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'eyeColor' || (formData.eyeColor || '').length > 0 || undefined }}
                  value={formData.eyeColor || ''}
                  onChange={(e) => updateFormData('eyeColor', e.target.value)}
                  onFocus={() => setFocused('eyeColor')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <TextInput
                  label="生年月日"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'birthDate' || (formData.birthDate || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'birthDate' || (formData.birthDate || '').length > 0 || undefined }}
                  value={formData.birthDate || ''}
                  onChange={(e) => updateFormData('birthDate', e.target.value)}
                  onFocus={() => setFocused('birthDate')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <TextInput
                  label="登録年月日"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'registrationDate' || (formData.registrationDate || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'registrationDate' || (formData.registrationDate || '').length > 0 || undefined }}
                  value={formData.registrationDate || ''}
                  onChange={(e) => updateFormData('registrationDate', e.target.value)}
                  onFocus={() => setFocused('registrationDate')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>

              {/* Row D: ブリーダー名, オーナー名, 他団体No */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="ブリーダー名"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'breederName' || (formData.breederName || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'breederName' || (formData.breederName || '').length > 0 || undefined }}
                  value={formData.breederName || ''}
                  onChange={(e) => updateFormData('breederName', e.target.value)}
                  onFocus={() => setFocused('breederName')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="オーナー名"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'ownerName' || (formData.ownerName || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'ownerName' || (formData.ownerName || '').length > 0 || undefined }}
                  value={formData.ownerName || ''}
                  onChange={(e) => updateFormData('ownerName', e.target.value)}
                  onFocus={() => setFocused('ownerName')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="他団体No"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'otherNo' || (formData.otherNo || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'otherNo' || (formData.otherNo || '').length > 0 || undefined }}
                  value={formData.otherNo || ''}
                  onChange={(e) => updateFormData('otherNo', e.target.value)}
                  onFocus={() => setFocused('otherNo')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>

              {/* Row E: 兄弟, 姉妹, 備考, 備考2 */}
              <Grid.Col span={{ base: 6, md: 1 }}>
                <TextInput
                  label="兄弟"
                  type="number"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'brotherCount' || (formData.brotherCount !== undefined && formData.brotherCount !== null) || undefined}
                  labelProps={{ 'data-floating': focused === 'brotherCount' || (formData.brotherCount !== undefined && formData.brotherCount !== null) || undefined }}
                  value={formData.brotherCount || ''}
                  onChange={(e) => updateFormData('brotherCount', parseInt(e.target.value) || undefined)}
                  onFocus={() => setFocused('brotherCount')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 1 }}>
                <TextInput
                  label="姉妹"
                  type="number"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'sisterCount' || (formData.sisterCount !== undefined && formData.sisterCount !== null) || undefined}
                  labelProps={{ 'data-floating': focused === 'sisterCount' || (formData.sisterCount !== undefined && formData.sisterCount !== null) || undefined }}
                  value={formData.sisterCount || ''}
                  onChange={(e) => updateFormData('sisterCount', parseInt(e.target.value) || undefined)}
                  onFocus={() => setFocused('sisterCount')}
                  onBlur={() => setFocused(null)}
                  autoComplete="off"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Textarea
                  label="備考"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'notes' || (formData.notes || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'notes' || (formData.notes || '').length > 0 || undefined }}
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  onFocus={() => setFocused('notes')}
                  onBlur={() => setFocused(null)}
                  rows={1}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Textarea
                  label="備考２"
                  classNames={{ root: classes.root, input: classes.input, label: classes.label }}
                  data-floating={focused === 'notes2' || (formData.notes2 || '').length > 0 || undefined}
                  labelProps={{ 'data-floating': focused === 'notes2' || (formData.notes2 || '').length > 0 || undefined }}
                  value={formData.notes2 || ''}
                  onChange={(e) => updateFormData('notes2', e.target.value)}
                  onFocus={() => setFocused('notes2')}
                  onBlur={() => setFocused(null)}
                  rows={1}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Call ID */}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconDna size={20} />
              <Title order={3}>Call ID（血統呼び出し）</Title>
            </Group>
            
            <Text size="sm" c="dimmed" mb="md">
              既存の血統書番号を入力すると、関連する血統情報62項目が自動的に設定されます
            </Text>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="両親ID"
                  placeholder="例: 700545"
                  description="両親の血統情報を一括取得（62項目）"
                  value={callId.both}
                  onChange={(e) => {
                    setCallId(prev => ({ ...prev, both: e.target.value }));
                    handleBothParentsCall(e.target.value);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="父猫ID"
                  placeholder="例: 700545"
                  description="父猫と父方祖父母を取得"
                  value={callId.father}
                  onChange={(e) => {
                    setCallId(prev => ({ ...prev, father: e.target.value }));
                    handleFatherCall(e.target.value);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="母猫ID"
                  placeholder="例: 141831"
                  description="母猫と母方祖父母を取得"
                  value={callId.mother}
                  onChange={(e) => {
                    setCallId(prev => ({ ...prev, mother: e.target.value }));
                    handleMotherCall(e.target.value);
                  }}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* 血統情報（62項目）*/}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconDna size={20} />
              <Title order={3}>血統情報（62項目）</Title>
              <Text size="sm" c="dimmed">Call IDで自動入力 または 手動入力</Text>
            </Group>

            <Accordion variant="separated">
              {/* 第1世代: 両親（14項目）*/}
              <Accordion.Item value="gen1">
                <Accordion.Control>
                  <Text fw={500}>第1世代: 両親（14項目）</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Grid>
                    <Grid.Col span={12}><Divider label="父親（7項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput label="父親タイトル" value={formData.fatherTitle || ''} onChange={(e) => updateFormData('fatherTitle', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput label="父親名" value={formData.fatherCatName || ''} onChange={(e) => updateFormData('fatherCatName', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput label="父親キャッテリー名" value={formData.fatherCatName2 || ''} onChange={(e) => updateFormData('fatherCatName2', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="父親毛色" value={formData.fatherCoatColor || ''} onChange={(e) => updateFormData('fatherCoatColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="父親目の色" value={formData.fatherEyeColor || ''} onChange={(e) => updateFormData('fatherEyeColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="父親JCU" value={formData.fatherJCU || ''} onChange={(e) => updateFormData('fatherJCU', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="父親他団体コード" value={formData.fatherOtherCode || ''} onChange={(e) => updateFormData('fatherOtherCode', e.target.value)} />
                    </Grid.Col>

                    <Grid.Col span={12}><Divider label="母親（7項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput label="母親タイトル" value={formData.motherTitle || ''} onChange={(e) => updateFormData('motherTitle', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput label="母親名" value={formData.motherCatName || ''} onChange={(e) => updateFormData('motherCatName', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput label="母親キャッテリー名" value={formData.motherCatName2 || ''} onChange={(e) => updateFormData('motherCatName2', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="母親毛色" value={formData.motherCoatColor || ''} onChange={(e) => updateFormData('motherCoatColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="母親目の色" value={formData.motherEyeColor || ''} onChange={(e) => updateFormData('motherEyeColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="母親JCU" value={formData.motherJCU || ''} onChange={(e) => updateFormData('motherJCU', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput label="母親他団体コード" value={formData.motherOtherCode || ''} onChange={(e) => updateFormData('motherOtherCode', e.target.value)} />
                    </Grid.Col>
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>

              {/* 第2世代: 祖父母（16項目）*/}
              <Accordion.Item value="gen2">
                <Accordion.Control>
                  <Text fw={500}>第2世代: 祖父母（16項目）</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Grid>
                    <Grid.Col span={12}><Divider label="父方祖父（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="タイトル" value={formData.ffTitle || ''} onChange={(e) => updateFormData('ffTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="名前" value={formData.ffCatName || ''} onChange={(e) => updateFormData('ffCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="毛色" value={formData.ffCatColor || ''} onChange={(e) => updateFormData('ffCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="JCU" value={formData.ffjcu || ''} onChange={(e) => updateFormData('ffjcu', e.target.value)} /></Grid.Col>

                    <Grid.Col span={12}><Divider label="父方祖母（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="タイトル" value={formData.fmTitle || ''} onChange={(e) => updateFormData('fmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="名前" value={formData.fmCatName || ''} onChange={(e) => updateFormData('fmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="毛色" value={formData.fmCatColor || ''} onChange={(e) => updateFormData('fmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="JCU" value={formData.fmjcu || ''} onChange={(e) => updateFormData('fmjcu', e.target.value)} /></Grid.Col>

                    <Grid.Col span={12}><Divider label="母方祖父（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="タイトル" value={formData.mfTitle || ''} onChange={(e) => updateFormData('mfTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="名前" value={formData.mfCatName || ''} onChange={(e) => updateFormData('mfCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="毛色" value={formData.mfCatColor || ''} onChange={(e) => updateFormData('mfCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="JCU" value={formData.mfjcu || ''} onChange={(e) => updateFormData('mfjcu', e.target.value)} /></Grid.Col>

                    <Grid.Col span={12}><Divider label="母方祖母（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="タイトル" value={formData.mmTitle || ''} onChange={(e) => updateFormData('mmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="名前" value={formData.mmCatName || ''} onChange={(e) => updateFormData('mmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="毛色" value={formData.mmCatColor || ''} onChange={(e) => updateFormData('mmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}><TextInput label="JCU" value={formData.mmjcu || ''} onChange={(e) => updateFormData('mmjcu', e.target.value)} /></Grid.Col>
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>

              {/* 第3世代: 曾祖父母（32項目）*/}
              <Accordion.Item value="gen3">
                <Accordion.Control>
                  <Text fw={500}>第3世代: 曾祖父母（32項目）</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Grid>
                    {/* FFF */}
                    <Grid.Col span={12}><Divider label="父父父（FFF）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.fffTitle || ''} onChange={(e) => updateFormData('fffTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.fffCatName || ''} onChange={(e) => updateFormData('fffCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.fffCatColor || ''} onChange={(e) => updateFormData('fffCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.fffjcu || ''} onChange={(e) => updateFormData('fffjcu', e.target.value)} /></Grid.Col>

                    {/* FFM */}
                    <Grid.Col span={12}><Divider label="父父母（FFM）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.ffmTitle || ''} onChange={(e) => updateFormData('ffmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.ffmCatName || ''} onChange={(e) => updateFormData('ffmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.ffmCatColor || ''} onChange={(e) => updateFormData('ffmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.ffmjcu || ''} onChange={(e) => updateFormData('ffmjcu', e.target.value)} /></Grid.Col>

                    {/* FMF */}
                    <Grid.Col span={12}><Divider label="父母父（FMF）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.fmfTitle || ''} onChange={(e) => updateFormData('fmfTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.fmfCatName || ''} onChange={(e) => updateFormData('fmfCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.fmfCatColor || ''} onChange={(e) => updateFormData('fmfCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.fmfjcu || ''} onChange={(e) => updateFormData('fmfjcu', e.target.value)} /></Grid.Col>

                    {/* FMM */}
                    <Grid.Col span={12}><Divider label="父母母（FMM）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.fmmTitle || ''} onChange={(e) => updateFormData('fmmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.fmmCatName || ''} onChange={(e) => updateFormData('fmmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.fmmCatColor || ''} onChange={(e) => updateFormData('fmmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.fmmjcu || ''} onChange={(e) => updateFormData('fmmjcu', e.target.value)} /></Grid.Col>

                    {/* MFF */}
                    <Grid.Col span={12}><Divider label="母父父（MFF）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.mffTitle || ''} onChange={(e) => updateFormData('mffTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.mffCatName || ''} onChange={(e) => updateFormData('mffCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.mffCatColor || ''} onChange={(e) => updateFormData('mffCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.mffjcu || ''} onChange={(e) => updateFormData('mffjcu', e.target.value)} /></Grid.Col>

                    {/* MFM */}
                    <Grid.Col span={12}><Divider label="母父母（MFM）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.mfmTitle || ''} onChange={(e) => updateFormData('mfmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.mfmCatName || ''} onChange={(e) => updateFormData('mfmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.mfmCatColor || ''} onChange={(e) => updateFormData('mfmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.mfmjcu || ''} onChange={(e) => updateFormData('mfmjcu', e.target.value)} /></Grid.Col>

                    {/* MMF */}
                    <Grid.Col span={12}><Divider label="母母父（MMF）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.mmfTitle || ''} onChange={(e) => updateFormData('mmfTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.mmfCatName || ''} onChange={(e) => updateFormData('mmfCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.mmfCatColor || ''} onChange={(e) => updateFormData('mmfCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.mmfjcu || ''} onChange={(e) => updateFormData('mmfjcu', e.target.value)} /></Grid.Col>

                    {/* MMM */}
                    <Grid.Col span={12}><Divider label="母母母（MMM）" /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="タイトル" value={formData.mmmTitle || ''} onChange={(e) => updateFormData('mmmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="名前" value={formData.mmmCatName || ''} onChange={(e) => updateFormData('mmmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="毛色" value={formData.mmmCatColor || ''} onChange={(e) => updateFormData('mmmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={3}><TextInput label="JCU" value={formData.mmmjcu || ''} onChange={(e) => updateFormData('mmmjcu', e.target.value)} /></Grid.Col>
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Paper>

          {/* 送信ボタン */}
          <Group justify="space-between" pt="md">
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => onCancel ? onCancel() : router.back()}>
              キャンセル
            </Button>
            <Button type="submit" loading={loading} leftSection={<IconDeviceFloppy size={16} />} size="lg">
              血統書を登録
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
