'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Title,
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
  Menu,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiClient, type ApiResponse } from '../../lib/api/client';
import {
  useCreatePedigree,
  useUpdatePedigree,
  useGetPedigreeByNumber,
  type PedigreeRecord,
  type UpdatePedigreeRequest,
} from '../../lib/api/hooks/use-pedigrees';
import { 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconDna,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconChevronDown,
} from '@tabler/icons-react';
import { InputWithFloatingLabel } from '../ui/InputWithFloatingLabel';

// API レスポンスの型定義
type BreedsResponse = Breed[];

type CoatColorsResponse = CoatColor[];

type GendersResponse = Gender[];

// 型安全なAPIヘルパー関数（マスタデータ取得用）
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

const getNextPedigreeId = async (): Promise<ApiResponse<{ nextId: string }>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return apiClient.get('/pedigrees/next-id');
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [pedigreeIdInput, setPedigreeIdInput] = useState('');
  
  const createMutation = useCreatePedigree();
  const updateMutationHook = useUpdatePedigree(originalId || '');

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
  
  // 血統書番号入力時に既存レコードを取得
  const { data: existingPedigree, isLoading: isLoadingExisting } = useGetPedigreeByNumber(
    pedigreeIdInput,
    { enabled: pedigreeIdInput.length >= 5 }
  );

  // 既存レコードが見つかった場合、全フィールドをセット
  useEffect(() => {
    if (existingPedigree && pedigreeIdInput) {
      const record = existingPedigree as PedigreeRecord;
      setFormData({
        pedigreeId: record.pedigreeId || pedigreeIdInput,
        title: record.title || undefined,
        catName: record.catName || undefined,
        catName2: (record as PedigreeFormData).catName2 || undefined,
        breedCode: record.breedCode || undefined,
        genderCode: record.genderCode || undefined,
        eyeColor: record.eyeColor || undefined,
        coatColorCode: record.coatColorCode || undefined,
        birthDate: record.birthDate || undefined,
        breederName: record.breederName || undefined,
        ownerName: record.ownerName || undefined,
        registrationDate: record.registrationDate || undefined,
        brotherCount: (record as PedigreeFormData).brotherCount || undefined,
        sisterCount: (record as PedigreeFormData).sisterCount || undefined,
        notes: (record as PedigreeFormData).notes || undefined,
        notes2: (record as PedigreeFormData).notes2 || undefined,
        otherNo: (record as PedigreeFormData).otherNo || undefined,
        // 血統情報62項目も全てセット
        fatherTitle: (record as PedigreeFormData).fatherTitle || undefined,
        fatherCatName: (record as PedigreeFormData).fatherCatName || undefined,
        fatherCatName2: (record as PedigreeFormData).fatherCatName2 || undefined,
        fatherCoatColor: (record as PedigreeFormData).fatherCoatColor || undefined,
        fatherEyeColor: (record as PedigreeFormData).fatherEyeColor || undefined,
        fatherJCU: (record as PedigreeFormData).fatherJCU || undefined,
        fatherOtherCode: (record as PedigreeFormData).fatherOtherCode || undefined,
        motherTitle: (record as PedigreeFormData).motherTitle || undefined,
        motherCatName: (record as PedigreeFormData).motherCatName || undefined,
        motherCatName2: (record as PedigreeFormData).motherCatName2 || undefined,
        motherCoatColor: (record as PedigreeFormData).motherCoatColor || undefined,
        motherEyeColor: (record as PedigreeFormData).motherEyeColor || undefined,
        motherJCU: (record as PedigreeFormData).motherJCU || undefined,
        motherOtherCode: (record as PedigreeFormData).motherOtherCode || undefined,
        // 祖父母16項目
        ffTitle: (record as PedigreeFormData).ffTitle || undefined,
        ffCatName: (record as PedigreeFormData).ffCatName || undefined,
        ffCatColor: (record as PedigreeFormData).ffCatColor || undefined,
        ffjcu: (record as PedigreeFormData).ffjcu || undefined,
        fmTitle: (record as PedigreeFormData).fmTitle || undefined,
        fmCatName: (record as PedigreeFormData).fmCatName || undefined,
        fmCatColor: (record as PedigreeFormData).fmCatColor || undefined,
        fmjcu: (record as PedigreeFormData).fmjcu || undefined,
        mfTitle: (record as PedigreeFormData).mfTitle || undefined,
        mfCatName: (record as PedigreeFormData).mfCatName || undefined,
        mfCatColor: (record as PedigreeFormData).mfCatColor || undefined,
        mfjcu: (record as PedigreeFormData).mfjcu || undefined,
        mmTitle: (record as PedigreeFormData).mmTitle || undefined,
        mmCatName: (record as PedigreeFormData).mmCatName || undefined,
        mmCatColor: (record as PedigreeFormData).mmCatColor || undefined,
        mmjcu: (record as PedigreeFormData).mmjcu || undefined,
        // 曾祖父母32項目
        fffTitle: (record as PedigreeFormData).fffTitle || undefined,
        fffCatName: (record as PedigreeFormData).fffCatName || undefined,
        fffCatColor: (record as PedigreeFormData).fffCatColor || undefined,
        fffjcu: (record as PedigreeFormData).fffjcu || undefined,
        ffmTitle: (record as PedigreeFormData).ffmTitle || undefined,
        ffmCatName: (record as PedigreeFormData).ffmCatName || undefined,
        ffmCatColor: (record as PedigreeFormData).ffmCatColor || undefined,
        ffmjcu: (record as PedigreeFormData).ffmjcu || undefined,
        fmfTitle: (record as PedigreeFormData).fmfTitle || undefined,
        fmfCatName: (record as PedigreeFormData).fmfCatName || undefined,
        fmfCatColor: (record as PedigreeFormData).fmfCatColor || undefined,
        fmfjcu: (record as PedigreeFormData).fmfjcu || undefined,
        fmmTitle: (record as PedigreeFormData).fmmTitle || undefined,
        fmmCatName: (record as PedigreeFormData).fmmCatName || undefined,
        fmmCatColor: (record as PedigreeFormData).fmmCatColor || undefined,
        fmmjcu: (record as PedigreeFormData).fmmjcu || undefined,
        mffTitle: (record as PedigreeFormData).mffTitle || undefined,
        mffCatName: (record as PedigreeFormData).mffCatName || undefined,
        mffCatColor: (record as PedigreeFormData).mffCatColor || undefined,
        mffjcu: (record as PedigreeFormData).mffjcu || undefined,
        mfmTitle: (record as PedigreeFormData).mfmTitle || undefined,
        mfmCatName: (record as PedigreeFormData).mfmCatName || undefined,
        mfmCatColor: (record as PedigreeFormData).mfmCatColor || undefined,
        mfmjcu: (record as PedigreeFormData).mfmjcu || undefined,
        mmfTitle: (record as PedigreeFormData).mmfTitle || undefined,
        mmfCatName: (record as PedigreeFormData).mmfCatName || undefined,
        mmfCatColor: (record as PedigreeFormData).mmfCatColor || undefined,
        mmfjcu: (record as PedigreeFormData).mmfjcu || undefined,
        mmmTitle: (record as PedigreeFormData).mmmTitle || undefined,
        mmmCatName: (record as PedigreeFormData).mmmCatName || undefined,
        mmmCatColor: (record as PedigreeFormData).mmmCatColor || undefined,
        mmmjcu: (record as PedigreeFormData).mmmjcu || undefined,
        oldCode: (record as PedigreeFormData).oldCode || undefined,
      });
      setIsEditMode(true);
      setOriginalId(record.id);
      notifications.show({
        title: '既存レコードを読み込みました',
        message: `血統書番号 ${record.pedigreeId} のデータを編集できます`,
        color: 'blue',
      });
    }
  }, [existingPedigree, pedigreeIdInput]);

  // +ボタンクリック時に最新血統書番号+1を取得
  const handleGetNextId = async () => {
    try {
      const response = await getNextPedigreeId();
      if (response.success && response.data?.nextId) {
        const nextId = response.data.nextId;
        setPedigreeIdInput(nextId);
        setFormData(prev => ({ ...prev, pedigreeId: nextId }));
        notifications.show({
          title: '最新血統書番号を取得しました',
          message: `次の番号: ${nextId}`,
          color: 'teal',
        });
      }
    } catch (error: unknown) {
      console.error('最新血統書番号の取得に失敗:', error);
      notifications.show({
        title: 'エラー',
        message: '最新血統書番号の取得に失敗しました',
        color: 'red',
      });
    }
  };

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

  // Call ID: 血統書番号から血統情報を取得（デバウンス付き）
  const handleBothParentsCall = async (pedigreeNumber: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(async () => {
      if (!pedigreeNumber.trim() || pedigreeNumber.length < 5) return;
      
      try {
        const response = await apiClient.get('/pedigrees/pedigree-id/{pedigreeId}', {
          pathParams: { pedigreeId: pedigreeNumber },
        });
        
        if (response.success && response.data) {
          const data = response.data as PedigreeRecord;
          
          // 父親情報を設定（7項目）
          updateFormData('fatherTitle', (data as PedigreeFormData).fatherTitle);
          updateFormData('fatherCatName', (data as PedigreeFormData).fatherCatName);
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
      } catch (error) {
        console.error('両親血統情報の取得に失敗:', error);
        notifications.show({
          title: 'エラー',
          message: '血統情報の取得に失敗しました',
          color: 'red',
        });
      }
    }, 800);

    setSearchTimeout(timeout);
  };

  // Call ID: 父猫IDから取得（父+祖父母16項目）
  const handleFatherCall = async (pedigreeNumber: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(async () => {
      if (!pedigreeNumber.trim() || pedigreeNumber.length < 5) return;
      
      try {
        const response = await apiClient.get('/pedigrees/pedigree-id/{pedigreeId}', {
          pathParams: { pedigreeId: pedigreeNumber },
        });
        
        if (response.success && response.data) {
          const data = response.data as PedigreeRecord;
          
          // 父親情報（7項目）
          updateFormData('fatherTitle', data.title);
          updateFormData('fatherCatName', data.catName);
          updateFormData('fatherCatName2', data.catName2);
          updateFormData('fatherCoatColor', data.coatColorCode?.toString());
          updateFormData('fatherEyeColor', data.eyeColor);
          updateFormData('fatherJCU', data.pedigreeId);
          updateFormData('fatherOtherCode', data.otherNo);

          // 父方祖父母（8項目）
          updateFormData('ffTitle', (data as PedigreeFormData).fatherTitle);
          updateFormData('ffCatName', (data as PedigreeFormData).fatherCatName);
          updateFormData('ffCatColor', (data as PedigreeFormData).fatherCoatColor);
          updateFormData('ffjcu', (data as PedigreeFormData).fatherJCU);

          updateFormData('fmTitle', (data as PedigreeFormData).motherTitle);
          updateFormData('fmCatName', (data as PedigreeFormData).motherCatName);
          updateFormData('fmCatColor', (data as PedigreeFormData).motherCoatColor);
          updateFormData('fmjcu', (data as PedigreeFormData).motherJCU);

          notifications.show({
            title: '父猫血統情報取得',
            message: `${data.catName}の血統情報を取得しました`,
            color: 'blue',
          });
        }
      } catch (error) {
        console.error('父猫血統情報の取得に失敗:', error);
      }
    }, 800);

    setSearchTimeout(timeout);
  };

  // Call ID: 母猫IDから取得（母+祖父母16項目）
  const handleMotherCall = async (pedigreeNumber: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(async () => {
      if (!pedigreeNumber.trim() || pedigreeNumber.length < 5) return;
      
      try {
        const response = await apiClient.get('/pedigrees/pedigree-id/{pedigreeId}', {
          pathParams: { pedigreeId: pedigreeNumber },
        });
        
        if (response.success && response.data) {
          const data = response.data as PedigreeRecord;
          
          // 母親情報（7項目）
          updateFormData('motherTitle', data.title);
          updateFormData('motherCatName', data.catName);
          updateFormData('motherCatName2', data.catName2);
          updateFormData('motherCoatColor', data.coatColorCode?.toString());
          updateFormData('motherEyeColor', data.eyeColor);
          updateFormData('motherJCU', data.pedigreeId);
          updateFormData('motherOtherCode', data.otherNo);

          // 母方祖父母（8項目）
          updateFormData('mfTitle', (data as PedigreeFormData).fatherTitle);
          updateFormData('mfCatName', (data as PedigreeFormData).fatherCatName);
          updateFormData('mfCatColor', (data as PedigreeFormData).fatherCoatColor);
          updateFormData('mfjcu', (data as PedigreeFormData).fatherJCU);

          updateFormData('mmTitle', (data as PedigreeFormData).motherTitle);
          updateFormData('mmCatName', (data as PedigreeFormData).motherCatName);
          updateFormData('mmCatColor', (data as PedigreeFormData).motherCoatColor);
          updateFormData('mmjcu', (data as PedigreeFormData).motherJCU);

          notifications.show({
            title: '母猫血統情報取得',
            message: `${data.catName}の血統情報を取得しました`,
            color: 'pink',
          });
        }
      } catch (error) {
        console.error('母猫血統情報の取得に失敗:', error);
      }
    }, 800);

    setSearchTimeout(timeout);
  };

  // フォーム送信（新規登録）
  const handleCreate = async () => {
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

      // 新規登録
      await createMutation.mutateAsync(formData as Parameters<typeof createMutation.mutateAsync>[0]);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/pedigrees?tab=list');
      }
    } catch (error) {
      console.error('登録エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // フォーム送信（更新）
  const handleUpdate = async () => {
    setLoading(true);

    try {
      if (!originalId) {
        notifications.show({
          title: 'エラー',
          message: '更新対象のIDが見つかりません',
          color: 'red',
        });
        setLoading(false);
        return;
      }

      // UpdatePedigreeRequestは血統書番号を除く全フィールド
      const { pedigreeId: _pedigreeId, ...updateData } = formData;
      await updateMutationHook.mutateAsync(updateData as UpdatePedigreeRequest);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/pedigrees?tab=list');
      }
    } catch (error: unknown) {
      console.error('更新エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // フォームクリア
  const handleClear = () => {
    setFormData({ pedigreeId: '' });
    setPedigreeIdInput('');
    setIsEditMode(false);
    setOriginalId(null);
    setCallId({ both: '', father: '', mother: '' });
    setInputValues({ breedName: '', genderName: '', coatColorName: '' });
    notifications.show({
      title: 'フォームをクリアしました',
      message: '新規登録モードに戻りました',
      color: 'blue',
    });
  };

  // フォーム送信（旧実装との互換性維持）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      await handleUpdate();
    } else {
      await handleCreate();
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
            <Grid gutter={10}>
              {/* Row 1: +ボタン, 血統書番号（2列） */}
              <Grid.Col span={12}>
                <Group wrap="nowrap" gap="xs">
                  <Tooltip label="次の血統書番号を自動取得">
                    <ActionIcon variant="filled" color="blue" size="lg" onClick={handleGetNextId} style={{ height: 36 }}>
                      <IconPlus size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <InputWithFloatingLabel
                    label="血統書番号"
                    required
                    value={pedigreeIdInput}
                    onChange={(e) => {
                      setPedigreeIdInput(e.target.value);
                      updateFormData('pedigreeId', e.target.value);
                    }}
                    rightSection={isLoadingExisting ? <Text size="xs">読込中...</Text> : undefined}
                    style={{ flex: 1 }}
                  />
                </Group>
              </Grid.Col>

              {/* Row 2: キャッテリー名, 猫の名前（2列） */}
              <Grid.Col span={{ base: 6, md: 4 }}>
                <InputWithFloatingLabel
                  label="キャッテリー名"
                  value={formData.catName2}
                  onChange={(e) => updateFormData('catName2', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 4 }}>
                <InputWithFloatingLabel
                  label="猫の名前"
                  value={formData.catName}
                  onChange={(e) => updateFormData('catName', e.target.value)}
                />
              </Grid.Col>

              {/* Row 3: 品種コード, 品種名（2列） */}
              <Grid.Col span={{ base: 3, md: 1 }}>
                <InputWithFloatingLabel
                  label="品種コード"
                  value={formData.breedCode?.toString()}
                  onChange={(e) => handleCodeChange('breed', e.target.value)}
                  styles={{ input: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 9, md: 3 }}>
                <InputWithFloatingLabel
                  label="品種名"
                  value={inputValues.breedName}
                  onChange={(e) => handleNameChange('breed', e.target.value)}
                />
              </Grid.Col>

              {/* Row 4: 毛色コード, 毛色名称（2列） */}
              <Grid.Col span={{ base: 3, md: 1 }}>
                <InputWithFloatingLabel
                  label="毛色コード"
                  value={formData.coatColorCode?.toString()}
                  onChange={(e) => handleCodeChange('coatColor', e.target.value)}
                  styles={{ input: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 9, md: 3 }}>
                <InputWithFloatingLabel
                  label="毛色"
                  value={inputValues.coatColorName}
                  onChange={(e) => handleNameChange('coatColor', e.target.value)}
                />
              </Grid.Col>

              {/* Row 5: 性別コード, 性別名称（2列） */}
              <Grid.Col span={{ base: 3, md: 1 }}>
                <InputWithFloatingLabel
                  label="性別コード"
                  value={formData.genderCode?.toString()}
                  onChange={(e) => handleCodeChange('gender', e.target.value)}
                  styles={{ input: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 9, md: 3 }}>
                <InputWithFloatingLabel
                  label="性別"
                  value={inputValues.genderName}
                  onChange={(e) => handleNameChange('gender', e.target.value)}
                />
              </Grid.Col>

              {/* Row 6: 目の色, 生年月日, 登録年月日（3列均等） */}
              <Grid.Col span={{ base: 4, md: 3 }}>
                <InputWithFloatingLabel
                  label="目の色"
                  value={formData.eyeColor}
                  onChange={(e) => updateFormData('eyeColor', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 3 }}>
                <InputWithFloatingLabel
                  label="生年月日"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData('birthDate', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 4, md: 3 }}>
                <InputWithFloatingLabel
                  label="登録年月日"
                  value={formData.registrationDate}
                  onChange={(e) => updateFormData('registrationDate', e.target.value)}
                />
              </Grid.Col>

              {/* Row 7: ブリーダー名, オーナー名（2列） */}
              <Grid.Col span={{ base: 6, md: 4 }}>
                <InputWithFloatingLabel
                  label="ブリーダー名"
                  value={formData.breederName}
                  onChange={(e) => updateFormData('breederName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 4 }}>
                <InputWithFloatingLabel
                  label="オーナー名"
                  value={formData.ownerName}
                  onChange={(e) => updateFormData('ownerName', e.target.value)}
                />
              </Grid.Col>

              {/* Row 8: 兄弟, 姉妹, タイトル, 他団体No（4列） */}
              <Grid.Col span={{ base: 3, md: 1 }}>
                <InputWithFloatingLabel
                  label="兄弟"
                  type="number"
                  value={formData.brotherCount?.toString()}
                  onChange={(e) => updateFormData('brotherCount', parseInt(e.target.value) || undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 3, md: 1 }}>
                <InputWithFloatingLabel
                  label="姉妹"
                  type="number"
                  value={formData.sisterCount?.toString()}
                  onChange={(e) => updateFormData('sisterCount', parseInt(e.target.value) || undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 3, md: 3 }}>
                <InputWithFloatingLabel
                  label="タイトル"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 3, md: 4 }}>
                <InputWithFloatingLabel
                  label="他団体No"
                  value={formData.otherNo}
                  onChange={(e) => updateFormData('otherNo', e.target.value)}
                />
              </Grid.Col>

              {/* Row 9: 備考, 備考2（2列） */}
              <Grid.Col span={{ base: 6, md: 5 }}>
                <InputWithFloatingLabel
                  label="備考"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 5 }}>
                <InputWithFloatingLabel
                  label="備考２"
                  value={formData.notes2}
                  onChange={(e) => updateFormData('notes2', e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Call ID */}
          <Paper p="lg" withBorder>
            <Grid gutter={10}>
              <Grid.Col span={12}><Divider label="Call ID" /></Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <InputWithFloatingLabel
                  label="両親ID"
                  value={callId.both}
                  onChange={(e) => {
                    setCallId(prev => ({ ...prev, both: e.target.value }));
                    handleBothParentsCall(e.target.value);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <InputWithFloatingLabel
                  label="父猫ID"
                  value={callId.father}
                  onChange={(e) => {
                    setCallId(prev => ({ ...prev, father: e.target.value }));
                    handleFatherCall(e.target.value);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <InputWithFloatingLabel
                  label="母猫ID"
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
                  <Grid gutter={10}>
                    <Grid.Col span={12}><Divider label="父親（7項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="父親タイトル" value={formData.fatherTitle} onChange={(e) => updateFormData('fatherTitle', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="父親名" value={formData.fatherCatName} onChange={(e) => updateFormData('fatherCatName', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="父親キャッテリー名" value={formData.fatherCatName2} onChange={(e) => updateFormData('fatherCatName2', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="父親毛色" value={formData.fatherCoatColor} onChange={(e) => updateFormData('fatherCoatColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="父親目の色" value={formData.fatherEyeColor} onChange={(e) => updateFormData('fatherEyeColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="父親JCU" value={formData.fatherJCU} onChange={(e) => updateFormData('fatherJCU', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="父親他団体コード" value={formData.fatherOtherCode} onChange={(e) => updateFormData('fatherOtherCode', e.target.value)} />
                    </Grid.Col>

                    <Grid.Col span={12}><Divider label="母親（7項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="母親タイトル" value={formData.motherTitle} onChange={(e) => updateFormData('motherTitle', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="母親名" value={formData.motherCatName} onChange={(e) => updateFormData('motherCatName', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="母親キャッテリー名" value={formData.motherCatName2} onChange={(e) => updateFormData('motherCatName2', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="母親毛色" value={formData.motherCoatColor} onChange={(e) => updateFormData('motherCoatColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="母親目の色" value={formData.motherEyeColor} onChange={(e) => updateFormData('motherEyeColor', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="母親JCU" value={formData.motherJCU} onChange={(e) => updateFormData('motherJCU', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <InputWithFloatingLabel label="母親他団体コード" value={formData.motherOtherCode} onChange={(e) => updateFormData('motherOtherCode', e.target.value)} />
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
                  <Grid gutter={10}>
                    <Grid.Col span={12}><Divider label="父方祖父（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.ffTitle} onChange={(e) => updateFormData('ffTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.ffCatName} onChange={(e) => updateFormData('ffCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.ffCatColor} onChange={(e) => updateFormData('ffCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.ffjcu} onChange={(e) => updateFormData('ffjcu', e.target.value)} /></Grid.Col>

                    <Grid.Col span={12}><Divider label="父方祖母（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.fmTitle} onChange={(e) => updateFormData('fmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.fmCatName} onChange={(e) => updateFormData('fmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.fmCatColor} onChange={(e) => updateFormData('fmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.fmjcu} onChange={(e) => updateFormData('fmjcu', e.target.value)} /></Grid.Col>

                    <Grid.Col span={12}><Divider label="母方祖父（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.mfTitle} onChange={(e) => updateFormData('mfTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.mfCatName} onChange={(e) => updateFormData('mfCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.mfCatColor} onChange={(e) => updateFormData('mfCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.mfjcu} onChange={(e) => updateFormData('mfjcu', e.target.value)} /></Grid.Col>

                    <Grid.Col span={12}><Divider label="母方祖母（4項目）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.mmTitle} onChange={(e) => updateFormData('mmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.mmCatName} onChange={(e) => updateFormData('mmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.mmCatColor} onChange={(e) => updateFormData('mmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.mmjcu} onChange={(e) => updateFormData('mmjcu', e.target.value)} /></Grid.Col>
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>

              {/* 第3世代: 曾祖父母（32項目）*/}
              <Accordion.Item value="gen3">
                <Accordion.Control>
                  <Text fw={500}>第3世代: 曾祖父母（32項目）</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Grid gutter={10}>
                    {/* FFF */}
                    <Grid.Col span={12}><Divider label="父父父（FFF）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.fffTitle} onChange={(e) => updateFormData('fffTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.fffCatName} onChange={(e) => updateFormData('fffCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.fffCatColor} onChange={(e) => updateFormData('fffCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.fffjcu} onChange={(e) => updateFormData('fffjcu', e.target.value)} /></Grid.Col>

                    {/* FFM */}
                    <Grid.Col span={12}><Divider label="父父母（FFM）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.ffmTitle} onChange={(e) => updateFormData('ffmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.ffmCatName} onChange={(e) => updateFormData('ffmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.ffmCatColor} onChange={(e) => updateFormData('ffmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.ffmjcu} onChange={(e) => updateFormData('ffmjcu', e.target.value)} /></Grid.Col>

                    {/* FMF */}
                    <Grid.Col span={12}><Divider label="父母父（FMF）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.fmfTitle} onChange={(e) => updateFormData('fmfTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.fmfCatName} onChange={(e) => updateFormData('fmfCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.fmfCatColor} onChange={(e) => updateFormData('fmfCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.fmfjcu} onChange={(e) => updateFormData('fmfjcu', e.target.value)} /></Grid.Col>

                    {/* FMM */}
                    <Grid.Col span={12}><Divider label="父母母（FMM）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.fmmTitle} onChange={(e) => updateFormData('fmmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.fmmCatName} onChange={(e) => updateFormData('fmmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.fmmCatColor} onChange={(e) => updateFormData('fmmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.fmmjcu} onChange={(e) => updateFormData('fmmjcu', e.target.value)} /></Grid.Col>

                    {/* MFF */}
                    <Grid.Col span={12}><Divider label="母父父（MFF）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.mffTitle} onChange={(e) => updateFormData('mffTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.mffCatName} onChange={(e) => updateFormData('mffCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.mffCatColor} onChange={(e) => updateFormData('mffCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.mffjcu} onChange={(e) => updateFormData('mffjcu', e.target.value)} /></Grid.Col>

                    {/* MFM */}
                    <Grid.Col span={12}><Divider label="母父母（MFM）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.mfmTitle} onChange={(e) => updateFormData('mfmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.mfmCatName} onChange={(e) => updateFormData('mfmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.mfmCatColor} onChange={(e) => updateFormData('mfmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.mfmjcu} onChange={(e) => updateFormData('mfmjcu', e.target.value)} /></Grid.Col>

                    {/* MMF */}
                    <Grid.Col span={12}><Divider label="母母父（MMF）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.mmfTitle} onChange={(e) => updateFormData('mmfTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.mmfCatName} onChange={(e) => updateFormData('mmfCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.mmfCatColor} onChange={(e) => updateFormData('mmfCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.mmfjcu} onChange={(e) => updateFormData('mmfjcu', e.target.value)} /></Grid.Col>

                    {/* MMM */}
                    <Grid.Col span={12}><Divider label="母母母（MMM）" /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="タイトル" value={formData.mmmTitle} onChange={(e) => updateFormData('mmmTitle', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="名前" value={formData.mmmCatName} onChange={(e) => updateFormData('mmmCatName', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="毛色" value={formData.mmmCatColor} onChange={(e) => updateFormData('mmmCatColor', e.target.value)} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="JCU" value={formData.mmmjcu} onChange={(e) => updateFormData('mmmjcu', e.target.value)} /></Grid.Col>
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
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button 
                  loading={loading} 
                  leftSection={<IconDeviceFloppy size={16} />} 
                  rightSection={<IconChevronDown size={16} />}
                  size="lg"
                >
                  {isEditMode ? '血統書を更新' : '血統書を登録'}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleCreate}
                  disabled={loading}
                >
                  新規登録
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconRefresh size={16} />}
                  onClick={handleUpdate}
                  disabled={loading || !isEditMode}
                >
                  更新
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={handleClear}
                  disabled={loading}
                >
                  クリア
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
