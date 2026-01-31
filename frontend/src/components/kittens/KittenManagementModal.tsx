'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Select,
  Group,
  Button,
  TextInput,
  Checkbox,
  NumberInput,
  Card,
  Text,
  Badge,
  ActionIcon,
  Flex,
  Box,
} from '@mantine/core';
import { IconTrash, IconPlus, IconDeviceFloppy, IconX, IconList, IconClipboard } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { TabsSection } from '@/components/TabsSection';
import { useGetCats, useCreateCat, useUpdateCat, type Cat } from '@/lib/api/hooks/use-cats';
import { useGetCoatColors, type CoatColor } from '@/lib/api/hooks/use-coat-colors';
import { useGetBirthPlans, useCreateKittenDisposition, type BirthPlan } from '@/lib/api/hooks/use-breeding';
import { UnifiedModal, type ModalSection } from '@/components/common';

interface KittenData {
  id?: string; // 既存の子猫の場合はID、新規の場合はundefined
  tempId?: string; // 一時的なID（新規登録用）
  name: string;
  gender: 'MALE' | 'FEMALE';
  coatColorId: string;
  birthDate: string;
  isSelected: boolean;
  disposition?: {
    type: 'TRAINING' | 'SALE' | 'DECEASED';
    trainingStartDate?: string;
    saleInfo?: { buyer: string; price: number; saleDate: string; notes?: string };
    deathDate?: string;
    deathReason?: string;
  };
}

interface Props {
  opened: boolean;
  onClose: () => void;
  motherId?: string; // 母猫IDを指定した場合、その母猫の子猫を編集
  onSuccess?: () => void;
}

export function KittenManagementModal({ opened, onClose, motherId, onSuccess }: Props) {
  const [selectedMotherId, setSelectedMotherId] = useState<string>(motherId || '');
  const [kittens, setKittens] = useState<KittenData[]>([]);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('list');
  
  // 処遇の詳細情報
  const [dispositionDetails, setDispositionDetails] = useState<{
    type?: 'TRAINING' | 'SALE' | 'DECEASED';
    trainingStartDate?: string;
    buyer?: string;
    price?: number;
    saleDate?: string;
    deathDate?: string;
    deathReason?: string;
  }>({});

  // API hooks
  const catsQuery = useGetCats({ limit: 1000 });
  const coatColorsQuery = useGetCoatColors();
  const birthPlansQuery = useGetBirthPlans();
  const createCatMutation = useCreateCat();
  const updateCatMutation = useUpdateCat(''); // IDは後で設定
  const createKittenDispositionMutation = useCreateKittenDisposition();

  // 母猫リストを取得（在舎中のメス猫のみ）
  const motherCats = (catsQuery.data?.data || []).filter(
    (cat: Cat) => cat.gender === 'FEMALE' && cat.isInHouse
  );

  // 色柄リスト（データがない場合は空配列）
  const coatColors = coatColorsQuery.data?.data?.data || [];
  const hasCoatColors = coatColors.length > 0;

  // 選択された母猫の既存子猫を読み込む
  useEffect(() => {
    // モーダルが開いていない場合は何もしない
    if (!opened) return;
    if (!selectedMotherId || !catsQuery.data?.data) return;

    // この母猫の子猫を取得（生後6ヶ月未満）
    const existingKittens = (catsQuery.data.data || [])
      .filter((cat: Cat) => {
        if (cat.motherId !== selectedMotherId) return false;
        
        // 生後6ヶ月未満かチェック
        const birthDate = new Date(cat.birthDate);
        const now = new Date();
        const monthsDiff = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        return monthsDiff < 6;
      })
      .map((cat: Cat) => ({
        id: cat.id,
        name: cat.name,
        gender: cat.gender as 'MALE' | 'FEMALE',
        coatColorId: cat.coatColorId || '',
        birthDate: cat.birthDate.split('T')[0], // YYYY-MM-DD形式に変換
        isSelected: false,
      }));

    setKittens(existingKittens);
    setMaleCount(0);
    setFemaleCount(0);
  }, [opened, selectedMotherId, catsQuery.data]);

  // motherIdが外部から指定された場合
  useEffect(() => {
    if (motherId) {
      setSelectedMotherId(motherId);
    }
  }, [motherId]);

  // 頭数を変更したときに一時的な子猫データを生成
  const handleCountChange = (type: 'male' | 'female', count: number) => {
    if (type === 'male') {
      setMaleCount(count);
    } else {
      setFemaleCount(count);
    }

    // 既存の子猫数を取得
    const existingKittens = kittens.filter(k => k.id);
    const existingCount = existingKittens.length;

    // 新規子猫の開始番号
    let kittenNumber = existingCount + 1;

    // 母猫名を取得
    const mother = motherCats.find(cat => cat.id === selectedMotherId);
    const motherName = mother?.name || '子猫';

    // 一時的な子猫データを生成
    const newKittens: KittenData[] = [];

    // オスの子猫
    const newMaleCount = type === 'male' ? count : maleCount;
    for (let i = 0; i < newMaleCount; i++) {
      newKittens.push({
        tempId: `temp-male-${i}`,
        name: `${motherName}${kittenNumber++}号`,
        gender: 'MALE',
        coatColorId: '',
        birthDate: new Date().toISOString().split('T')[0],
        isSelected: false,
      });
    }

    // メスの子猫
    const newFemaleCount = type === 'female' ? count : femaleCount;
    for (let i = 0; i < newFemaleCount; i++) {
      newKittens.push({
        tempId: `temp-female-${i}`,
        name: `${motherName}${kittenNumber++}号`,
        gender: 'FEMALE',
        coatColorId: '',
        birthDate: new Date().toISOString().split('T')[0],
        isSelected: false,
      });
    }

    setKittens([...existingKittens, ...newKittens]);
  };

  // 子猫データを更新
  const updateKitten = <Field extends keyof KittenData>(index: number, field: Field, value: KittenData[Field]) => {
    setKittens(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 子猫を削除
  const removeKitten = (index: number) => {
    setKittens(prev => prev.filter((_, i) => i !== index));
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    const allSelected = kittens.every(k => k.isSelected);
    setKittens(prev => prev.map(k => ({ ...k, isSelected: !allSelected })));
  };

  // 選択された子猫に一括で処遇を設定
  const applyDispositionToSelected = (dispositionType: 'TRAINING' | 'SALE' | 'DECEASED') => {
    const selectedKittens = kittens.filter(k => k.isSelected);
    if (selectedKittens.length === 0) {
      notifications.show({
        title: '選択エラー',
        message: '子猫を選択してください',
        color: 'yellow',
      });
      return;
    }

    // 処遇設定時に詳細情報を使用
    const disposition = {
      type: dispositionType,
      trainingStartDate: dispositionType === 'TRAINING' ? (dispositionDetails.trainingStartDate || new Date().toISOString().split('T')[0]) : undefined,
      saleInfo: dispositionType === 'SALE' ? { 
        buyer: dispositionDetails.buyer || '', 
        price: dispositionDetails.price || 0, 
        saleDate: dispositionDetails.saleDate || new Date().toISOString().split('T')[0],
        notes: ''
      } : undefined,
      deathDate: dispositionType === 'DECEASED' ? (dispositionDetails.deathDate || new Date().toISOString().split('T')[0]) : undefined,
      deathReason: dispositionType === 'DECEASED' ? dispositionDetails.deathReason : undefined,
    };

    setKittens(prev => prev.map(k => 
      k.isSelected ? { ...k, disposition } : k
    ));

    notifications.show({
      title: '処遇設定',
      message: `${selectedKittens.length}頭の子猫に処遇を設定しました`,
      color: 'blue',
    });
  };

  // 保存処理
  const handleSave = async () => {
    if (!selectedMotherId) {
      notifications.show({
        title: '入力エラー',
        message: '母猫を選択してください',
        color: 'red',
      });
      return;
    }

    if (kittens.length === 0) {
      notifications.show({
        title: '入力エラー',
        message: '子猫を登録してください',
        color: 'red',
      });
      return;
    }

    try {
      // 新規子猫を登録
      const newKittens = kittens.filter(k => !k.id);
      const createdKittenIds: { [key: string]: string } = {}; // tempId -> 実際のID
      
      for (const kitten of newKittens) {
        const result = await createCatMutation.mutateAsync({
          name: kitten.name,
          gender: kitten.gender,
          birthDate: kitten.birthDate,
          motherId: selectedMotherId,
          coatColorId: kitten.coatColorId || undefined,
          isInHouse: true,
        });
        if (kitten.tempId && result.data) {
          createdKittenIds[kitten.tempId] = result.data.id;
        }
      }

      // 既存子猫を更新
      const existingKittens = kittens.filter(k => k.id);
      await Promise.all(
        existingKittens.map((kitten) =>
          updateCatMutation.mutateAsync({
            id: kitten.id,
            name: kitten.name,
            gender: kitten.gender,
            birthDate: kitten.birthDate,
            coatColorId: kitten.coatColorId || null,
            motherId: selectedMotherId,
            isInHouse: true,
          })
        )
      );

      // 処遇情報を登録
      const kittensWithDisposition = kittens.filter(k => k.disposition);
      if (kittensWithDisposition.length > 0) {
        // この母猫のBirthPlanを取得（出産済みのもの）
        const birthPlans = birthPlansQuery.data?.data || [];
        const relevantPlan = birthPlans.find((plan: BirthPlan) => 
          plan.motherId === selectedMotherId && 
          plan.status === 'BORN'
        );

        if (relevantPlan) {
          for (const kitten of kittensWithDisposition) {
            const kittenId = kitten.id || (kitten.tempId ? createdKittenIds[kitten.tempId] : undefined);
            const disposition = kitten.disposition;
            if (!disposition) {
              continue;
            }

            await createKittenDispositionMutation.mutateAsync({
              birthRecordId: relevantPlan.id,
              kittenId,
              name: kitten.name,
              gender: kitten.gender,
              disposition: disposition.type,
              trainingStartDate: disposition.trainingStartDate,
              saleInfo: disposition.saleInfo,
              deathDate: disposition.deathDate,
              deathReason: disposition.type === 'DECEASED' ? disposition.deathReason : undefined,
            });
          }
        }
      }

      notifications.show({
        title: '保存成功',
        message: '子猫情報を保存しました',
        color: 'green',
      });

      if (onSuccess) {
        onSuccess();
      }

      // データ再取得が完了してからモーダルを閉じる
      setTimeout(() => {
        handleClose();
      }, 100);
    } catch (error) {
      console.error('Save error:', error);
      notifications.show({
        title: '保存失敗',
        message: error instanceof Error ? error.message : '不明なエラー',
        color: 'red',
      });
    }
  };

  // モーダルを閉じる
  const handleClose = () => {
    setSelectedMotherId(motherId || '');
    setKittens([]);
    setMaleCount(0);
    setFemaleCount(0);
    setActiveTab('list');
    setDispositionDetails({}); // 処遇詳細もリセット
    onClose();
  };

  const sections: ModalSection[] = [
    {
      content: (
        <Select
          label="母猫選択"
          placeholder="母猫を選択してください"
          value={selectedMotherId}
          onChange={(value) => setSelectedMotherId(value || '')}
          data={motherCats.map((cat: Cat) => ({
            value: cat.id,
            label: `${cat.name} (${cat.birthDate})`,
          }))}
          disabled={!!motherId}
          searchable
        />
      ),
    },
    {
      content: (
        <TabsSection
        value={activeTab}
        onChange={(value) => setActiveTab(value || 'list')}
        tabs={[
          {
            value: 'list',
            label: '子猫リスト',
            icon: <IconList size={14} />,
            count: kittens.length,
          },
          {
            value: 'disposition',
            label: '処遇設定',
            icon: <IconClipboard size={14} />,
          },
        ]}
      >
        {/* 子猫リストタブ */}
        {activeTab === 'list' && (
          <Box pt="md">
          <Stack gap="md">
            {/* 頭数登録（既存子猫がいない場合） */}
            {kittens.filter(k => k.id).length === 0 && (
              <Card padding="sm" withBorder>
                <Text size="sm" fw={500} mb="xs">新規子猫登録</Text>
                <Group grow>
                  <NumberInput
                    label="オス頭数"
                    value={maleCount}
                    onChange={(value) => handleCountChange('male', Number(value) || 0)}
                    min={0}
                    max={10}
                  />
                  <NumberInput
                    label="メス頭数"
                    value={femaleCount}
                    onChange={(value) => handleCountChange('female', Number(value) || 0)}
                    min={0}
                    max={10}
                  />
                </Group>
              </Card>
            )}

            {/* 全選択ボタン */}
            {kittens.length > 0 && (
              <Group justify="space-between">
                <Checkbox
                  label={`全選択 (${kittens.filter(k => k.isSelected).length}/${kittens.length}頭)`}
                  checked={kittens.length > 0 && kittens.every(k => k.isSelected)}
                  indeterminate={kittens.some(k => k.isSelected) && !kittens.every(k => k.isSelected)}
                  onChange={toggleSelectAll}
                />
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => {
                      const mother = motherCats.find(cat => cat.id === selectedMotherId);
                      const motherName = mother?.name || '子猫';
                      const kittenNumber = kittens.length + 1;
                      
                      setKittens(prev => [...prev, {
                        tempId: `temp-${Date.now()}`,
                        name: `${motherName}${kittenNumber}号`,
                        gender: 'MALE',
                        coatColorId: '',
                        birthDate: new Date().toISOString().split('T')[0],
                        isSelected: false,
                      }]);
                    }}
                    disabled={!selectedMotherId}
                  >
                    子猫追加
                  </Button>
                </Group>
              </Group>
            )}

            {/* 子猫リスト */}
            {kittens.map((kitten, index) => (
              <Card key={kitten.id || kitten.tempId} padding="sm" withBorder>
                <Flex gap="sm" align="flex-start">
                  <Checkbox
                    checked={kitten.isSelected}
                    onChange={(e) => updateKitten(index, 'isSelected', e.currentTarget.checked)}
                    mt="md"
                  />
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group grow>
                      <TextInput
                        label="名前"
                        value={kitten.name}
                        onChange={(e) => updateKitten(index, 'name', e.target.value)}
                        required
                      />
                      <Select
                        label="性別"
                        value={kitten.gender}
                        onChange={(value) => updateKitten(index, 'gender', value as 'MALE' | 'FEMALE')}
                        data={[
                          { value: 'MALE', label: 'オス' },
                          { value: 'FEMALE', label: 'メス' },
                        ]}
                        required
                      />
                    </Group>
                    <Group grow>
                      <Select
                        label="色柄"
                        value={kitten.coatColorId}
                        onChange={(value) => updateKitten(index, 'coatColorId', value || '')}
                        data={coatColors.map((color: CoatColor) => ({
                          value: color.id,
                          label: color.name,
                        }))}
                        placeholder={hasCoatColors ? "選択してください" : "※データ未登録"}
                        searchable
                        clearable
                        disabled={!hasCoatColors}
                        description={!hasCoatColors ? "色柄マスタデータが未登録です" : undefined}
                      />
                      <TextInput
                        label="生年月日"
                        type="date"
                        value={kitten.birthDate}
                        onChange={(e) => updateKitten(index, 'birthDate', e.target.value)}
                        required
                      />
                    </Group>
                    {kitten.disposition && (
                      <Badge
                        size="sm"
                        color={
                          kitten.disposition.type === 'TRAINING' ? 'blue' :
                          kitten.disposition.type === 'SALE' ? 'green' :
                          'gray'
                        }
                      >
                        {kitten.disposition.type === 'TRAINING' ? '🎓 養成中' :
                         kitten.disposition.type === 'SALE' ? '💰 出荷済' :
                         '🌈 死亡'}
                      </Badge>
                    )}
                  </Stack>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeKitten(index)}
                    mt="md"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Flex>
              </Card>
            ))}

            {kittens.length === 0 && (
              <Text ta="center" c="dimmed" py="xl">
                子猫がいません。頭数を入力して登録してください。
              </Text>
            )}
          </Stack>
        </Box>
        )}

        {/* 処遇設定タブ */}
        {activeTab === 'disposition' && (
          <Box pt="md">
            <Stack gap="md">
            <Text size="sm" c="dimmed">
              選択した子猫に処遇を一括設定できます
            </Text>
            <Text size="xs" c="dimmed">
              選択中: {kittens.filter(k => k.isSelected).length}頭
            </Text>

            {/* 処遇タイプ選択 */}
            <Select
              label="処遇を選択してください"
              placeholder="処遇を選択"
              value={dispositionDetails.type || ''}
              onChange={(value) => setDispositionDetails({ type: value as 'TRAINING' | 'SALE' | 'DECEASED' })}
              data={[
                { value: 'TRAINING', label: '🎓 養成中' },
                { value: 'SALE', label: '💰 出荷済' },
                { value: 'DECEASED', label: '🌈 死亡' },
              ]}
            />

            {/* 養成中の入力フィールド */}
            {dispositionDetails.type === 'TRAINING' && (
              <Stack gap="sm">
                <TextInput
                  label="養成開始日"
                  type="date"
                  value={dispositionDetails.trainingStartDate || ''}
                  onChange={(e) => setDispositionDetails(prev => ({ ...prev, trainingStartDate: e.target.value }))}
                  required
                />
              </Stack>
            )}

            {/* 出荷済の入力フィールド */}
            {dispositionDetails.type === 'SALE' && (
              <Stack gap="sm">
                <TextInput
                  label="出荷先"
                  placeholder="出荷先名を入力"
                  value={dispositionDetails.buyer || ''}
                  onChange={(e) => setDispositionDetails(prev => ({ ...prev, buyer: e.target.value }))}
                  required
                />
                <NumberInput
                  label="価格"
                  placeholder="価格を入力"
                  value={dispositionDetails.price || 0}
                  onChange={(value) => setDispositionDetails(prev => ({ ...prev, price: Number(value) }))}
                  min={0}
                  required
                />
                <TextInput
                  label="出荷日"
                  type="date"
                  value={dispositionDetails.saleDate || ''}
                  onChange={(e) => setDispositionDetails(prev => ({ ...prev, saleDate: e.target.value }))}
                  required
                />
              </Stack>
            )}

            {/* 死亡の入力フィールド */}
            {dispositionDetails.type === 'DECEASED' && (
              <Stack gap="sm">
                <TextInput
                  label="死亡日"
                  type="date"
                  value={dispositionDetails.deathDate || ''}
                  onChange={(e) => setDispositionDetails(prev => ({ ...prev, deathDate: e.target.value }))}
                  required
                />
                <TextInput
                  label="死亡理由"
                  placeholder="死亡理由を入力"
                  value={dispositionDetails.deathReason || ''}
                  onChange={(e) => setDispositionDetails(prev => ({ ...prev, deathReason: e.target.value }))}
                />
              </Stack>
            )}

            {/* 適用ボタン */}
            <Button
              fullWidth
              onClick={() => dispositionDetails.type && applyDispositionToSelected(dispositionDetails.type)}
              disabled={!dispositionDetails.type || kittens.filter(k => k.isSelected).length === 0}
            >
              選択した子猫に適用
            </Button>
          </Stack>
        </Box>
        )}
        </TabsSection>
      ),
    },
    {
      content: (
        <Group justify="flex-end">
          <Button
            variant="outline"
            leftSection={<IconX size={16} />}
            onClick={handleClose}
          >
            キャンセル
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            loading={createCatMutation.isPending || updateCatMutation.isPending}
            disabled={!selectedMotherId || kittens.length === 0}
          >
            保存
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={handleClose}
      title="子猫管理"
      size="xl"
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' },
      }}
      sections={sections}
    />
  );
}
