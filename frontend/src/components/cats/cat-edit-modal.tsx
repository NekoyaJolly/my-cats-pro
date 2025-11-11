"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Loader,
  Center,
  Divider,
  Grid,
} from "@mantine/core";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { useGetCat, useUpdateCat } from "@/lib/api/hooks/use-cats";
import { useGetBreeds } from "@/lib/api/hooks/use-breeds";
import { useGetCoatColors } from "@/lib/api/hooks/use-coat-colors";
import TagSelector from "@/components/TagSelector";
import { format } from "date-fns";

interface CatEditModalProps {
  opened: boolean;
  onClose: () => void;
  catId: string;
  onSuccess?: () => void;
}

// Gender options
const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NEUTER", label: "Neutered Male" },
  { value: "SPAY", label: "Spayed Female" },
];

export function CatEditModal({
  opened,
  onClose,
  catId,
  onSuccess,
}: CatEditModalProps) {
  const { data: cat, isLoading: isCatLoading } = useGetCat(catId);
  const { data: breedsData, isLoading: isBreedsLoading } = useGetBreeds({ limit: 1000 });
  const { data: coatColorsData, isLoading: isCoatColorsLoading } = useGetCoatColors({ limit: 1000 });
  const updateCat = useUpdateCat(catId);

  const [form, setForm] = useState<{
    name: string;
    gender: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
    breedId: string;
    coatColorId: string;
    birthDate: string;
    microchipNumber: string;
    registrationNumber: string;
    description: string;
    tagIds: string[];
  }>({
    name: "",
    gender: "MALE",
    breedId: "",
    coatColorId: "",
    birthDate: "",
    microchipNumber: "",
    registrationNumber: "",
    description: "",
    tagIds: [],
  });

  // データ取得後にフォームを初期化
  useEffect(() => {
    if (cat?.data && opened) {
      const catData = cat.data;
      setForm({
        name: catData.name || "",
        gender: catData.gender || "MALE",
        breedId: catData.breedId || "",
        coatColorId: catData.coatColorId || "",
        birthDate: catData.birthDate ? format(new Date(catData.birthDate), "yyyy-MM-dd") : "",
        microchipNumber: catData.microchipNumber || "",
        registrationNumber: catData.registrationNumber || "",
        description: catData.description || "",
        tagIds: catData.tags?.map((catTag: any) => catTag.tag.id) || [],
      });
    }
  }, [cat, opened]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCat.mutateAsync({
        name: form.name,
        gender: form.gender,
        breedId: form.breedId || null,
        coatColorId: form.coatColorId || null,
        birthDate: form.birthDate,
        microchipNumber: form.microchipNumber || null,
        registrationNumber: form.registrationNumber || null,
        description: form.description || null,
        tagIds: form.tagIds,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("更新エラー:", error);
    }
  };

  const handleClose = () => {
    if (!updateCat.isPending) {
      onClose();
    }
  };

  // 品種とカラーのオプションを作成
  const breedOptions = breedsData?.data?.data?.map((breed: any) => ({
    value: breed.id,
    label: breed.name,
  })) || [];

  const coatColorOptions = coatColorsData?.data?.data?.map((color: any) => ({
    value: color.id,
    label: color.name,
  })) || [];

  const isLoading = isCatLoading || isBreedsLoading || isCoatColorsLoading;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="猫の情報編集"
      size="lg"
      closeOnClickOutside={!updateCat.isPending}
      closeOnEscape={!updateCat.isPending}
    >
      {isLoading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="名前"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label="性別"
                  value={form.gender}
                  onChange={(value) => handleChange("gender", value || "")}
                  data={GENDER_OPTIONS}
                  required
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label="品種"
                  value={form.breedId}
                  onChange={(value) => handleChange("breedId", value || "")}
                  data={breedOptions}
                  placeholder="品種を選択"
                  searchable
                  clearable
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label="色柄"
                  value={form.coatColorId}
                  onChange={(value) => handleChange("coatColorId", value || "")}
                  data={coatColorOptions}
                  placeholder="色柄を選択"
                  searchable
                  clearable
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="生年月日"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  required
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="マイクロチップ番号"
                  value={form.microchipNumber}
                  onChange={(e) => handleChange("microchipNumber", e.target.value)}
                  placeholder="15桁の番号"
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="登録番号"
                  value={form.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  placeholder="血統書登録番号"
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Textarea
                  label="詳細説明"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  placeholder="特記事項や性格など"
                  disabled={updateCat.isPending}
                />
              </Grid.Col>
            </Grid>

            <Divider my="xs" />

            <TagSelector
              selectedTags={form.tagIds}
              onChange={(tagIds) => setForm(prev => ({ ...prev, tagIds }))}
              placeholder="タグを選択"
              label="タグ"
              disabled={updateCat.isPending}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={handleClose}
                disabled={updateCat.isPending}
                leftSection={<IconX size={16} />}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                loading={updateCat.isPending}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
