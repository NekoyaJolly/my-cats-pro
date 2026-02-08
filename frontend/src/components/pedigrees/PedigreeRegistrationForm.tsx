'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Group,
  Stack,
  Grid,
  Text,
  Box,
  Paper,
  Divider,
  ActionIcon,
  Tooltip,
  Menu,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  useCreatePedigree,
  useUpdatePedigree,
  useGetPedigree,
  useGetPedigreeByNumber,
  type PedigreeRecord,
  type UpdatePedigreeRequest,
} from '@/lib/api/hooks/use-pedigrees';
import {
  IconDeviceFloppy,
  IconArrowLeft,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconChevronDown,
  IconPrinter,
} from '@tabler/icons-react';
import { InputWithFloatingLabel } from '../ui/InputWithFloatingLabel';
import { SelectWithFloatingLabel } from '../ui/SelectWithFloatingLabel';
import { apiClient, type ApiResponse } from '@/lib/api/client';
import { getPublicApiBaseUrl } from '@/lib/api/public-api-base-url';

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

function mapPedigreeRecordToFormData(record: PedigreeRecord, fallbackPedigreeId: string): PedigreeFormData {
  return {
    pedigreeId: record.pedigreeId || fallbackPedigreeId,
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
  };
}

export function PedigreeRegistrationForm({ onSuccess, onCancel }: PedigreeRegistrationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiBaseUrl = getPublicApiBaseUrl();
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

  const copyFromId = searchParams.get('copyFromId') || '';

  const normalizedPedigreeIdInput = pedigreeIdInput.trim();

  const createMutation = useCreatePedigree();
  const updateMutationHook = useUpdatePedigree(originalId || '');

  const { data: copySourcePedigree } = useGetPedigree(copyFromId, {
    enabled: !!copyFromId,
  });

  // 名称入力用のローカルステート (Select化により直接参照はしないが、状態管理用に保持)
  const [_inputValues, setInputValues] = useState({
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
    normalizedPedigreeIdInput,
    { enabled: normalizedPedigreeIdInput.length >= 5 }
  );

  // 既存レコードが見つかった場合、全フィールドをセット
  useEffect(() => {
    if (existingPedigree && pedigreeIdInput) {
      const record = existingPedigree as PedigreeRecord;
      setFormData(mapPedigreeRecordToFormData(record, pedigreeIdInput));
      setIsEditMode(true);
      setOriginalId(record.id);
      notifications.show({
        title: '既存レコードを読み込みました',
        message: `血統書番号 ${record.pedigreeId} のデータを編集できます`,
        color: 'blue',
      });
    }
  }, [existingPedigree, pedigreeIdInput]);

  // 一覧から「新規登録にコピー」された場合、血統書番号と猫名以外をコピーして新規登録モードにする
  useEffect(() => {
    if (!copyFromId) return;
    if (!copySourcePedigree) return;

    const record = copySourcePedigree as PedigreeRecord;
    const copied = mapPedigreeRecordToFormData(record, '');

    setFormData({
      ...copied,
      pedigreeId: '',
      catName: undefined,
      catName2: undefined,
    });

    setPedigreeIdInput('');
    setIsEditMode(false);
    setOriginalId(null);
    setCallId({ both: '', father: '', mother: '' });
    setInputValues({ breedName: '', genderName: '', coatColorName: '' });

    notifications.show({
      title: '新規登録にコピーしました',
      message: '血統書番号と猫名以外の項目をコピーしました。血統書番号と猫名を入力して登録してください。',
      color: 'teal',
    });
  }, [copyFromId, copySourcePedigree]);

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

  // 毛色コード/文字列から毛色名を取得するヘルパー
  const getCoatColorName = (codeOrName: number | string | undefined | null): string => {
    if (codeOrName === undefined || codeOrName === null || codeOrName === '') return '';

    // 数値または数値の文字列の場合、コードとして検索
    const code = Number(codeOrName);
    if (!isNaN(code)) {
      const found = coatColors.find(c => c.code === code);
      return found ? found.name : codeOrName.toString();
    }

    // 既に名前の場合はそのまま返す
    return codeOrName.toString();
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

          // 取得したデータをPedigreeFormDataとしてキャスト
          const source = data as unknown as PedigreeFormData;

          setFormData(prev => ({
            ...prev,
            // 父親情報（7項目） <- 本人情報
            fatherTitle: source.title,
            fatherCatName: source.catName,
            fatherCoatColor: getCoatColorName(source.coatColorCode),
            fatherEyeColor: source.eyeColor,
            fatherJCU: source.pedigreeId,
            fatherOtherCode: source.otherNo, // PedigreeRecordにはないかもしれないがFormDataにはある可能性

            // 父方祖父（FF） <- 本人の父
            ffTitle: source.fatherTitle,
            ffCatName: source.fatherCatName,
            ffCatColor: getCoatColorName(source.fatherCoatColor),
            ffjcu: source.fatherJCU,

            // 父方祖母（FM） <- 本人の母
            fmTitle: source.motherTitle,
            fmCatName: source.motherCatName,
            fmCatColor: getCoatColorName(source.motherCoatColor),
            fmjcu: source.motherJCU,

            // 父方曾祖父（FFF） <- 本人の父方祖父
            fffTitle: source.ffTitle,
            fffCatName: source.ffCatName,
            fffCatColor: getCoatColorName(source.ffCatColor),
            fffjcu: source.ffjcu,

            // 父方曾祖母（FFM） <- 本人の父方祖母
            ffmTitle: source.fmTitle,
            ffmCatName: source.fmCatName,
            ffmCatColor: getCoatColorName(source.fmCatColor),
            ffmjcu: source.fmjcu,

            // 父方母方祖父（FMF） <- 本人の母方祖父
            fmfTitle: source.mfTitle,
            fmfCatName: source.mfCatName,
            fmfCatColor: getCoatColorName(source.mfCatColor),
            fmfjcu: source.mfjcu,

            // 父方母方祖母（FMM） <- 本人の母方祖母
            fmmTitle: source.mmTitle,
            fmmCatName: source.mmCatName,
            fmmCatColor: getCoatColorName(source.mmCatColor),
            fmmjcu: source.mmjcu,
          }));

          notifications.show({
            title: '父猫血統情報取得',
            message: `${data.catName}の血統情報を取得し、父方家系図に反映しました`,
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

          // 取得したデータをPedigreeFormDataとしてキャスト
          const source = data as unknown as PedigreeFormData;

          setFormData(prev => ({
            ...prev,
            // 母親情報（7項目） <- 本人情報
            motherTitle: source.title,
            motherCatName: source.catName,
            motherCoatColor: getCoatColorName(source.coatColorCode),
            motherEyeColor: source.eyeColor,
            motherJCU: source.pedigreeId,
            motherOtherCode: source.otherNo, // PedigreeRecordにはないかもしれないがFormDataにはある可能性

            // 母方祖父（MF） <- 本人の父
            mfTitle: source.fatherTitle,
            mfCatName: source.fatherCatName,
            mfCatColor: getCoatColorName(source.fatherCoatColor),
            mfjcu: source.fatherJCU,

            // 母方祖母（MM） <- 本人の母
            mmTitle: source.motherTitle,
            mmCatName: source.motherCatName,
            mmCatColor: getCoatColorName(source.motherCoatColor),
            mmjcu: source.motherJCU,

            // 母方曾祖父（MFF） <- 本人の父方祖父
            mffTitle: source.ffTitle,
            mffCatName: source.ffCatName,
            mffCatColor: getCoatColorName(source.ffCatColor),
            mffjcu: source.ffjcu,

            // 母方曾祖母（MFM） <- 本人の父方祖母
            mfmTitle: source.fmTitle,
            mfmCatName: source.fmCatName,
            mfmCatColor: getCoatColorName(source.fmCatColor),
            mfmjcu: source.fmjcu,

            // 母方母方祖父（MMF） <- 本人の母方祖父
            mmfTitle: source.mfTitle,
            mmfCatName: source.mfCatName,
            mmfCatColor: getCoatColorName(source.mfCatColor),
            mmfjcu: source.mfjcu,

            // 母方母方祖母（MMM） <- 本人の母方祖母
            mmmTitle: source.mmTitle,
            mmmCatName: source.mmCatName,
            mmmCatColor: getCoatColorName(source.mmCatColor),
            mmmjcu: source.mmjcu,
          }));

          notifications.show({
            title: '母猫血統情報取得',
            message: `${data.catName}の血統情報を取得し、母方家系図に反映しました`,
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

  // JCUナンバーの重複チェック
  const duplicateJcus = useMemo(() => {
    const jcuFields = [
      formData.fatherJCU, formData.motherJCU,
      formData.ffjcu, formData.fmjcu, formData.mfjcu, formData.mmjcu,
      formData.fffjcu, formData.ffmjcu, formData.fmfjcu, formData.fmmjcu,
      formData.mffjcu, formData.mfmjcu, formData.mmfjcu, formData.mmmjcu
    ];

    // 空文字・undefined・nullを除外して正規化
    const normalizedJcus = jcuFields
      .map(jcu => jcu?.trim())
      .filter((jcu): jcu is string => !!jcu && jcu.length > 0);

    const counts: Record<string, number> = {};
    normalizedJcus.forEach(jcu => {
      counts[jcu] = (counts[jcu] || 0) + 1;
    });

    const duplicates = new Set<string>();
    Object.entries(counts).forEach(([jcu, count]) => {
      if (count > 1) duplicates.add(jcu);
    });

    return duplicates;
  }, [
    formData.fatherJCU, formData.motherJCU,
    formData.ffjcu, formData.fmjcu, formData.mfjcu, formData.mmjcu,
    formData.fffjcu, formData.ffmjcu, formData.fmfjcu, formData.fmmjcu,
    formData.mffjcu, formData.mfmjcu, formData.mmfjcu, formData.mmmjcu
  ]);

  // 重複時のスタイル定義
  const duplicateStyle = { input: { color: '#00BFFF', fontWeight: 'bold' } };

  // フィールドが重複しているか判定するヘルパー
  const isDuplicate = (value: string | undefined) => {
    return value && duplicateJcus.has(value.trim());
  };

  const openPedigreePdf = (pedigreeId: string) => {
    const pdfUrl = `${apiBaseUrl}/pedigrees/pedigree-id/${encodeURIComponent(pedigreeId)}/pdf`;
    const newTab = window.open(pdfUrl, '_blank');
    if (!newTab) {
      window.location.assign(pdfUrl);
    }
  };

  // コードと名称の同期ロジック (Select化により不要になったため削除済み)

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
                  <Tooltip label={isEditMode ? '血統書PDFを印刷' : '登録済みデータを読み込むと印刷できます'}>
                    <ActionIcon
                      variant="light"
                      color="orange"
                      size="lg"
                      disabled={!isEditMode || !formData.pedigreeId.trim()}
                      onClick={() => {
                        if (!isEditMode) return;
                        const id = formData.pedigreeId.trim();
                        if (!id) return;
                        openPedigreePdf(id);
                      }}
                      style={{ height: 36 }}
                    >
                      <IconPrinter size={18} />
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
                  label="キャッテリー"
                  value={formData.catName2}
                  onChange={(e) => updateFormData('catName2', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 4 }}>
                <InputWithFloatingLabel
                  label="本猫名"
                  value={formData.catName}
                  onChange={(e) => updateFormData('catName', e.target.value)}
                />
              </Grid.Col>

              {/* Row 3: 品種（コード+名前統合）、毛色（コード+名前統合） - 2カラムレスポンシブ */}
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <SelectWithFloatingLabel
                  label="品種を選択"
                  data={breeds.map(b => ({ value: b.code.toString(), label: `${b.code} - ${b.name}` }))}
                  value={formData.breedCode?.toString() || null}
                  onChange={(value) => {
                    if (value) {
                      const code = parseInt(value, 10);
                      updateFormData('breedCode', code);
                      const found = breeds.find(b => b.code === code);
                      setInputValues(prev => ({ ...prev, breedName: found?.name || '' }));
                    } else {
                      updateFormData('breedCode', undefined);
                      setInputValues(prev => ({ ...prev, breedName: '' }));
                    }
                  }}
                  searchable
                  clearable
                  nothingFoundMessage="該当する品種がありません"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <SelectWithFloatingLabel
                  label="毛色を選択"
                  data={coatColors.map(c => ({ value: c.code.toString(), label: `${c.code} - ${c.name}` }))}
                  value={formData.coatColorCode?.toString() || null}
                  onChange={(value) => {
                    if (value) {
                      const code = parseInt(value, 10);
                      updateFormData('coatColorCode', code);
                      const found = coatColors.find(c => c.code === code);
                      setInputValues(prev => ({ ...prev, coatColorName: found?.name || '' }));
                    } else {
                      updateFormData('coatColorCode', undefined);
                      setInputValues(prev => ({ ...prev, coatColorName: '' }));
                    }
                  }}
                  searchable
                  clearable
                  nothingFoundMessage="該当する毛色がありません"
                />
              </Grid.Col>

              {/* Row 4: 性別（コード+名前統合）、目の色 - 2カラムレスポンシブ */}
              <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
                <SelectWithFloatingLabel
                  label="性別を選択"
                  data={genders.map(g => ({ value: g.code.toString(), label: `${g.code} - ${g.name}` }))}
                  value={formData.genderCode?.toString() || null}
                  onChange={(value) => {
                    if (value) {
                      const code = parseInt(value, 10);
                      updateFormData('genderCode', code);
                      const found = genders.find(g => g.code === code);
                      setInputValues(prev => ({ ...prev, genderName: found?.name || '' }));
                    } else {
                      updateFormData('genderCode', undefined);
                      setInputValues(prev => ({ ...prev, genderName: '' }));
                    }
                  }}
                  clearable
                  nothingFoundMessage="該当する性別がありません"
                />
              </Grid.Col>

              {/* Row 6: 目の色, 生年月日, 登録年月日（3列均等） */}
              <Grid.Col span={{ base: 4, md: 3 }}>
                <InputWithFloatingLabel
                  label="目色"
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
                  label="ブリーダー"
                  value={formData.breederName}
                  onChange={(e) => updateFormData('breederName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 4 }}>
                <InputWithFloatingLabel
                  label="オーナー"
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
                  label="他No"
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
            <Stack gap="lg">
              {/* 第1世代: 両親（14項目）*/}
              <Box>
                <Divider label="第1世代: 両親（14項目）" mb="md" />
                <Grid gutter={10}>
                  <Grid.Col span={12}><Divider label="父親（7項目）" /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel label="父親タイトル" value={formData.fatherTitle} onChange={(e) => updateFormData('fatherTitle', e.target.value)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel label="父親名" value={formData.fatherCatName} onChange={(e) => updateFormData('fatherCatName', e.target.value)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel label="父親毛色" value={formData.fatherCoatColor} onChange={(e) => updateFormData('fatherCoatColor', e.target.value)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel label="父親目の色" value={formData.fatherEyeColor} onChange={(e) => updateFormData('fatherEyeColor', e.target.value)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel
                      label="父親JCU"
                      value={formData.fatherJCU}
                      onChange={(e) => updateFormData('fatherJCU', e.target.value)}
                      styles={isDuplicate(formData.fatherJCU) ? duplicateStyle : undefined}
                    />
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
                    <InputWithFloatingLabel label="母親毛色" value={formData.motherCoatColor} onChange={(e) => updateFormData('motherCoatColor', e.target.value)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel label="母親目の色" value={formData.motherEyeColor} onChange={(e) => updateFormData('motherEyeColor', e.target.value)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel
                      label="母親JCU"
                      value={formData.motherJCU}
                      onChange={(e) => updateFormData('motherJCU', e.target.value)}
                      styles={isDuplicate(formData.motherJCU) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel label="母親他団体コード" value={formData.motherOtherCode} onChange={(e) => updateFormData('motherOtherCode', e.target.value)} />
                  </Grid.Col>
                </Grid>
              </Box>

              {/* 第2世代: 祖父母（16項目）*/}
              <Box>
                <Divider label="第2世代: 祖父母（16項目）" mb="md" />
                <Grid gutter={10}>
                  {/* FF */}
                  <Grid.Col span={12}><Divider label="父方祖父（4項目）" /></Grid.Col>

                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="FFタイトル" value={formData.ffTitle} onChange={(e) => updateFormData('ffTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="FF名前" value={formData.ffCatName} onChange={(e) => updateFormData('ffCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="FF色柄" value={formData.ffCatColor} onChange={(e) => updateFormData('ffCatColor', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel
                      label="FFナンバー"
                      value={formData.ffjcu}
                      onChange={(e) => updateFormData('ffjcu', e.target.value)}
                      styles={isDuplicate(formData.ffjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  <Grid.Col span={12}><Divider label="父方祖母（4項目）" /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="FMタイトル" value={formData.fmTitle} onChange={(e) => updateFormData('fmTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="FM名前" value={formData.fmCatName} onChange={(e) => updateFormData('fmCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="FM色柄" value={formData.fmCatColor} onChange={(e) => updateFormData('fmCatColor', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel
                      label="FMナンバー"
                      value={formData.fmjcu}
                      onChange={(e) => updateFormData('fmjcu', e.target.value)}
                      styles={isDuplicate(formData.fmjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* MF */}
                  <Grid.Col span={12}><Divider label="母方祖父（4項目）" /></Grid.Col>

                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="MFタイトル" value={formData.mfTitle} onChange={(e) => updateFormData('mfTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="MF名前" value={formData.mfCatName} onChange={(e) => updateFormData('mfCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="MF色柄" value={formData.mfCatColor} onChange={(e) => updateFormData('mfCatColor', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel
                      label="MFナンバー"
                      value={formData.mfjcu}
                      onChange={(e) => updateFormData('mfjcu', e.target.value)}
                      styles={isDuplicate(formData.mfjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  <Grid.Col span={12}><Divider label="母方祖母（4項目）" /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="MMタイトル" value={formData.mmTitle} onChange={(e) => updateFormData('mmTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="MM名前" value={formData.mmCatName} onChange={(e) => updateFormData('mmCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}><InputWithFloatingLabel label="MM色柄" value={formData.mmCatColor} onChange={(e) => updateFormData('mmCatColor', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <InputWithFloatingLabel
                      label="MMナンバー"
                      value={formData.mmjcu}
                      onChange={(e) => updateFormData('mmjcu', e.target.value)}
                      styles={isDuplicate(formData.mmjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>
                </Grid>
              </Box>

              {/* 第3世代: 曾祖父母（32項目）*/}
              <Box>
                <Divider label="第3世代: 曾祖父母（32項目）" mb="md" />
                <Grid gutter={10}>
                  {/* FFF */}
                  <Grid.Col span={12}><Divider label="父父父（FFF）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="FFFタイトル" value={formData.fffTitle} onChange={(e) => updateFormData('fffTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="FFF名前" value={formData.fffCatName} onChange={(e) => updateFormData('fffCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="FFFナンバー"
                      value={formData.fffjcu}
                      onChange={(e) => updateFormData('fffjcu', e.target.value)}
                      styles={isDuplicate(formData.fffjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* FFM */}
                  <Grid.Col span={12}><Divider label="父父母（FFM）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="FFMタイトル" value={formData.ffmTitle} onChange={(e) => updateFormData('ffmTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="FFM名前" value={formData.ffmCatName} onChange={(e) => updateFormData('ffmCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="FFMナンバー"
                      value={formData.ffmjcu}
                      onChange={(e) => updateFormData('ffmjcu', e.target.value)}
                      styles={isDuplicate(formData.ffmjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* FMF */}
                  <Grid.Col span={12}><Divider label="父母父（FMF）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="FMFタイトル" value={formData.fmfTitle} onChange={(e) => updateFormData('fmfTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="FMF名前" value={formData.fmfCatName} onChange={(e) => updateFormData('fmfCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="FMFナンバー"
                      value={formData.fmfjcu}
                      onChange={(e) => updateFormData('fmfjcu', e.target.value)}
                      styles={isDuplicate(formData.fmfjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* FMM */}
                  <Grid.Col span={12}><Divider label="父母母（FMM）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="FMMタイトル" value={formData.fmmTitle} onChange={(e) => updateFormData('fmmTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="FMM名前" value={formData.fmmCatName} onChange={(e) => updateFormData('fmmCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="FMMナンバー"
                      value={formData.fmmjcu}
                      onChange={(e) => updateFormData('fmmjcu', e.target.value)}
                      styles={isDuplicate(formData.fmmjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* MFF */}
                  <Grid.Col span={12}><Divider label="母父父（MFF）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="MFFタイトル" value={formData.mffTitle} onChange={(e) => updateFormData('mffTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="MFF名前" value={formData.mffCatName} onChange={(e) => updateFormData('mffCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="MFFナンバー"
                      value={formData.mffjcu}
                      onChange={(e) => updateFormData('mffjcu', e.target.value)}
                      styles={isDuplicate(formData.mffjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* MFM */}
                  <Grid.Col span={12}><Divider label="母父母（MFM）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="MFMタイトル" value={formData.mfmTitle} onChange={(e) => updateFormData('mfmTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="MFM名前" value={formData.mfmCatName} onChange={(e) => updateFormData('mfmCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="MFMナンバー"
                      value={formData.mfmjcu}
                      onChange={(e) => updateFormData('mfmjcu', e.target.value)}
                      styles={isDuplicate(formData.mfmjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* MMF */}
                  <Grid.Col span={12}><Divider label="母母父（MMF）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="MMFタイトル" value={formData.mmfTitle} onChange={(e) => updateFormData('mmfTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="MMF名前" value={formData.mmfCatName} onChange={(e) => updateFormData('mmfCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="MMFナンバー"
                      value={formData.mmfjcu}
                      onChange={(e) => updateFormData('mmfjcu', e.target.value)}
                      styles={isDuplicate(formData.mmfjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>

                  {/* MMM */}
                  <Grid.Col span={12}><Divider label="母母母（MMM）" /></Grid.Col>
                  <Grid.Col span={{ base: 3, sm: 2 }}><InputWithFloatingLabel label="MMMタイトル" value={formData.mmmTitle} onChange={(e) => updateFormData('mmmTitle', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 9, sm: 5 }}><InputWithFloatingLabel label="MMM名前" value={formData.mmmCatName} onChange={(e) => updateFormData('mmmCatName', e.target.value)} /></Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <InputWithFloatingLabel
                      label="MMMナンバー"
                      value={formData.mmmjcu}
                      onChange={(e) => updateFormData('mmmjcu', e.target.value)}
                      styles={isDuplicate(formData.mmmjcu) ? duplicateStyle : undefined}
                    />
                  </Grid.Col>
                </Grid>
              </Box>
            </Stack>
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
