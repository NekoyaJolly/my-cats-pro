'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Button,
  Group,
  Stack,
  Grid,
  Text,
  Box,
  Paper,
  Accordion,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiClient, type ApiResponse } from '../../../lib/api/client';

// API レスポンスの型定義
interface BreedsResponse {
  data: Breed[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

interface CoatColorsResponse {
  data: CoatColor[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

interface GendersResponse {
  data: Gender[];
}

interface PedigreeResponse {
  data: PedigreeFormData;
}

// 型安全なAPIヘルパー関数
// Note: OpenAPI型定義を生成すると完全な型安全性が得られます
// 生成コマンド: pnpm run generate:api-types
const getBreeds = async (params?: { limit?: string }): Promise<ApiResponse<BreedsResponse>> => {
  // OpenAPI型定義が未生成のため一時的に型チェックをスキップ
  // 型定義生成後は @ts-expect-error を削除できます
  // @ts-expect-error - OpenAPI type definition not yet generated
  return await apiClient.get('/breeds', params ? { query: params } : undefined);
};

const getCoatColors = async (params?: { limit?: string }): Promise<ApiResponse<CoatColorsResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return await apiClient.get('/coat-colors', params ? { query: params } : undefined);
};

const getGenders = async (): Promise<ApiResponse<GendersResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return await apiClient.get('/master/genders');
};

const getPedigreeByNumber = async (pedigreeNumber: string): Promise<ApiResponse<PedigreeResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return await apiClient.get(`/pedigrees/pedigree-id/${pedigreeNumber}`);
};

const createPedigree = async (data: PedigreeFormData): Promise<ApiResponse<PedigreeResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return await apiClient.post('/pedigrees', { body: data });
};
import { 
  IconDeviceFloppy, 
  IconArrowLeft, 
  IconDna,
  IconPaw,
} from '@tabler/icons-react';

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

export default function NewPedigreePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [coatColors, setCoatColors] = useState<CoatColor[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [formData, setFormData] = useState<PedigreeFormData>({
    pedigreeId: '',
  });

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
      const breedsRes = await getBreeds({ limit: '200' });
      if (breedsRes.success && breedsRes.data) {
        setBreeds(breedsRes.data.data || []);
      }

      // 毛色
      const colorsRes = await getCoatColors({ limit: '200' });
      if (colorsRes.success && colorsRes.data) {
        setCoatColors(colorsRes.data.data || []);
      }

      // 性別
      const gendersRes = await getGenders();
      if (gendersRes.success && gendersRes.data) {
        setGenders(gendersRes.data.data || []);
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
      } catch (error) {
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
        router.push('/pedigrees');
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

  if (!mounted) return null;

  return (
    <Container size="xl" py="md">
      <Box mb="lg">
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="subtle" size="lg" onClick={() => router.back()}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>血統書新規登録（Access設計準拠）</Title>
          </Group>
        </Group>
        <Text size="sm" c="dimmed" mt="xs">
          基本情報17項目 + Call IDで血統情報62項目を自動取得
        </Text>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* 基本情報（17項目）*/}
          <Paper p="lg" withBorder>
            <Group mb="md">
              <IconPaw size={20} />
              <Title order={3}>基本情報（17項目）</Title>
            </Group>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="血統書番号"
                  placeholder="例: 700545"
                  required
                  value={formData.pedigreeId}
                  onChange={(e) => updateFormData('pedigreeId', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="タイトル"
                  placeholder="例: Champion"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="猫の名前"
                  placeholder="例: Jolly Tokuichi"
                  value={formData.catName || ''}
                  onChange={(e) => updateFormData('catName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="キャッテリー名"
                  placeholder="例: Jolly Tokuichi"
                  value={formData.catName2 || ''}
                  onChange={(e) => updateFormData('catName2', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="品種コード"
                  placeholder="選択"
                  searchable
                  data={breeds.map(b => ({ value: b.code.toString(), label: `${b.code} - ${b.name}` }))}
                  value={formData.breedCode?.toString() || ''}
                  onChange={(v) => updateFormData('breedCode', v ? parseInt(v) : undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="性別コード"
                  placeholder="選択"
                  data={genders.map(g => ({ value: g.code.toString(), label: `${g.code} - ${g.name}` }))}
                  value={formData.genderCode?.toString() || ''}
                  onChange={(v) => updateFormData('genderCode', v ? parseInt(v) : undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="目の色"
                  placeholder="例: Gold"
                  value={formData.eyeColor || ''}
                  onChange={(e) => updateFormData('eyeColor', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="毛色コード"
                  placeholder="選択"
                  searchable
                  data={coatColors.map(c => ({ value: c.code.toString(), label: `${c.code} - ${c.name}` }))}
                  value={formData.coatColorCode?.toString() || ''}
                  onChange={(v) => updateFormData('coatColorCode', v ? parseInt(v) : undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="生年月日"
                  placeholder="YYYY-MM-DD"
                  value={formData.birthDate || ''}
                  onChange={(e) => updateFormData('birthDate', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="登録年月日"
                  placeholder="YYYY-MM-DD"
                  value={formData.registrationDate || ''}
                  onChange={(e) => updateFormData('registrationDate', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="ブリーダー名"
                  placeholder="例: Hayato Inami"
                  value={formData.breederName || ''}
                  onChange={(e) => updateFormData('breederName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="オーナー名"
                  placeholder="例: Hayato Inami"
                  value={formData.ownerName || ''}
                  onChange={(e) => updateFormData('ownerName', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="兄弟の人数"
                  placeholder="0"
                  min={0}
                  value={formData.brotherCount || ''}
                  onChange={(v) => updateFormData('brotherCount', v || undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="姉妹の人数"
                  placeholder="0"
                  min={0}
                  value={formData.sisterCount || ''}
                  onChange={(v) => updateFormData('sisterCount', v || undefined)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="他団体No"
                  placeholder="例: 921901-700545"
                  value={formData.otherNo || ''}
                  onChange={(e) => updateFormData('otherNo', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="備考"
                  placeholder="追加情報"
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="備考２"
                  placeholder="追加情報"
                  rows={2}
                  value={formData.notes2 || ''}
                  onChange={(e) => updateFormData('notes2', e.target.value)}
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
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
              戻る
            </Button>
            <Button type="submit" loading={loading} leftSection={<IconDeviceFloppy size={16} />} size="lg">
              血統書を登録
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
