'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Container,
  Group,
  Stack,
  Switch,
  Alert,
  LoadingOverlay,
  Tabs,
} from '@mantine/core';
import { InputWithFloatingLabel } from '@/components/ui/InputWithFloatingLabel';
import { TextareaWithFloatingLabel } from '@/components/ui/TextareaWithFloatingLabel';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useCreateCat, type CreateCatRequest } from '@/lib/api/hooks/use-cats';
import { useGetBreeds } from '@/lib/api/hooks/use-breeds';
import { useGetCoatColors } from '@/lib/api/hooks/use-coat-colors';
import { useBreedMasterData, useCoatColorMasterData } from '@/lib/api/hooks/use-master-data';
import { ActionButton } from '@/components/ActionButton';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import TagSelector from '@/components/TagSelector';
import { ALPHANUM_SPACE_HYPHEN_PATTERN, MasterDataCombobox } from '@/components/forms/MasterDataCombobox';
import { useSelectionHistory } from '@/lib/hooks/use-selection-history';
import { buildMasterOptions, createDisplayNameMap } from '@/lib/master-data/master-options';
import { catFormSchema, type CatFormSchema as CatFormValues } from '@/lib/schemas';
import { SelectWithFloatingLabel } from '@/components/ui/SelectWithFloatingLabel';

export default function CatRegistrationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>('register');
  const { setPageHeader } = usePageHeader();
  const createCat = useCreateCat();
  const breedListQuery = useMemo(() => ({ limit: 500, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const coatColorListQuery = useMemo(() => ({ limit: 500, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const { data: breedsData, isLoading: isBreedsLoading } = useGetBreeds(breedListQuery);
  const { data: coatColorsData, isLoading: isCoatColorsLoading } = useGetCoatColors(coatColorListQuery);
  const { data: breedMasterData, isLoading: isBreedMasterLoading } = useBreedMasterData();
  const { data: coatMasterData, isLoading: isCoatMasterLoading } = useCoatColorMasterData();
  const { history: breedHistory, recordSelection: recordBreedSelection } = useSelectionHistory('breed');
  const { history: coatHistory, recordSelection: recordCoatSelection } = useSelectionHistory('coat-color');
  const breedDisplayMap = useMemo(() => createDisplayNameMap(breedMasterData?.data), [breedMasterData]);
  const coatDisplayMap = useMemo(() => createDisplayNameMap(coatMasterData?.data), [coatMasterData]);
  const breedOptions = useMemo(
    () => buildMasterOptions(breedsData?.data, breedDisplayMap),
    [breedsData, breedDisplayMap],
  );
  const coatColorOptions = useMemo(
    () => buildMasterOptions(coatColorsData?.data, coatDisplayMap),
    [coatColorsData, coatDisplayMap],
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CatFormValues>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      birthDate: '',
      breedId: undefined,
      coatColorId: undefined,
      microchipNumber: undefined,
      registrationId: undefined,
      description: undefined,
      isInHouse: true,
      tagIds: [],
    },
  });

  const onSubmit = async (values: CatFormValues) => {
    const payload: CreateCatRequest = {
      name: values.name,
      gender: values.gender,
      birthDate: values.birthDate,
      breedId: values.breedId ?? null,
      coatColorId: values.coatColorId ?? null,
      microchipNumber: values.microchipNumber,
      registrationNumber: values.registrationId,
      description: values.description,
      isInHouse: values.isInHouse,
      tagIds: values.tagIds.length > 0 ? values.tagIds : undefined,
    };

    try {
      await createCat.mutateAsync(payload);
      reset();
      // 登録成功後に一覧ページに遷移（タイムスタンプを追加してキャッシュをバイパス）
      router.replace(`/cats?t=${Date.now()}`);
    } catch {
      // エラーハンドリングは useCreateCat 内で通知を表示
    }
  };

  const isSubmitting = createCat.isPending;

  // グローバルヘッダーにページタイトルとアクションボタンを設定
  useEffect(() => {
    setPageHeader(
      '在舎猫登録',
      <ActionButton
        action="create"
        onClick={handleSubmit(onSubmit)}
        loading={isSubmitting}
      >
        登録する
      </ActionButton>
    );

    return () => {
      setPageHeader(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting]);

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isSubmitting} zIndex={1000} overlayProps={{ blur: 2 }} />

      {/* タブコンポーネント */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="register" leftSection={<IconPlus size={16} />}>
            新規登録
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="register" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={10}>
                {/* 1行目: 猫の名前、性別 */}
                <Group grow gap={10}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="猫の名前"
                        required
                        error={errors.name?.message}
                        {...field}
                        value={field.value}
                      />
                    )}
                  />

                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <SelectWithFloatingLabel
                        label="性別"
                        data={[
                          { value: 'MALE', label: 'Male (オス)' },
                          { value: 'FEMALE', label: 'Female (メス)' },
                          { value: 'NEUTER', label: 'Neuter (去勢オス)' },
                          { value: 'SPAY', label: 'Spay (避妊メス)' },
                        ]}
                        required
                        error={errors.gender?.message}
                        value={field.value ?? null}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Group>

                {/* 2行目: 猫種コンボ、色柄コンボ */}
                <Group grow gap={10}>
                  <Controller
                    name="breedId"
                    control={control}
                    render={({ field }) => (
                      <MasterDataCombobox
                        label=""
                        placeholder="猫種コードや名称を入力"
                        description=""
                        value={field.value ?? undefined}
                        onChange={(next) => field.onChange(next ?? undefined)}
                        options={breedOptions}
                        historyItems={breedHistory}
                        error={errors.breedId?.message}
                        disabled={isSubmitting}
                        loading={isBreedsLoading || isBreedMasterLoading}
                        historyLabel="最近の品種"
                        onOptionSelected={recordBreedSelection}
                      />
                    )}
                  />

                  <Controller
                    name="coatColorId"
                    control={control}
                    render={({ field }) => (
                      <MasterDataCombobox
                        label=""
                        placeholder="色柄コードや名称を入力"
                        description=""
                        value={field.value ?? undefined}
                        onChange={(next) => field.onChange(next ?? undefined)}
                        options={coatColorOptions}
                        historyItems={coatHistory}
                        error={errors.coatColorId?.message}
                        disabled={isSubmitting}
                        loading={isCoatColorsLoading || isCoatMasterLoading}
                        historyLabel="最近の色柄"
                        onOptionSelected={recordCoatSelection}
                        sanitizePattern={ALPHANUM_SPACE_HYPHEN_PATTERN}
                      />
                    )}
                  />
                </Group>

                {/* 3行目: 生年月日、マイクロチップ番号、登録番号 */}
                <Group grow gap={10}>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="生年月日"
                        error={errors.birthDate?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="microchipNumber"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="マイクロチップ番号"
                        error={errors.microchipNumber?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="registrationId"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="登録番号"
                        error={errors.registrationId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </Group>

                {/* 4行目: 備考 */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextareaWithFloatingLabel
                      label="備考"
                      placeholder="特徴や性格などを記入してください"
                      minRows={3}
                      error={errors.description?.message}
                      {...field}
                      value={field.value ?? ''}
                    />
                  )}
                />

                {/* 5行目: タグ */}
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <TagSelector
                      selectedTags={field.value ?? []}
                      onChange={field.onChange}
                      label="タグ"
                      placeholder="猫の特徴タグを選択"
                      disabled={isSubmitting}
                    />
                  )}
                />

                {/* 6行目: 在舎スイッチ */}
                <Controller
                  name="isInHouse"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      label="施設内に在舎している猫です"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.currentTarget.checked)}
                    />
                  )}
                />

                {createCat.isError && (
                  <Alert color="red" title="登録に失敗しました">
                    {(createCat.error as Error)?.message ?? '時間をおいて再度お試しください。'}
                  </Alert>
                )}

                {/* フォーム下部の登録ボタン */}
                <Group justify="flex-end" mt="md">
                  <ActionButton
                    action="create"
                    onClick={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    isSectionAction
                  >
                    登録する
                  </ActionButton>
                </Group>
              </Stack>
            </form>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
