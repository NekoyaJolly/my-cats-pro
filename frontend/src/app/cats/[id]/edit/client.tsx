"use client";

import { useRouter } from "next/navigation";
import { Container, Title, Paper, Group, Button, Stack, TextInput, Textarea, Select, Loader, Center, Alert } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy, IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useGetCat, useUpdateCat, useDeleteCat } from "@/lib/api/hooks/use-cats";
import { useGetBreeds } from "@/lib/api/hooks/use-breeds";
import { useGetCoatColors } from "@/lib/api/hooks/use-coat-colors";
import { format } from "date-fns";

type Props = {
  catId: string;
};

// Gender options
const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NEUTER", label: "Neutered Male" },
  { value: "SPAY", label: "Spayed Female" },
];

export default function CatEditClient({ catId }: Props) {
  const router = useRouter();
  const { data: cat, isLoading: isCatLoading, error: catError } = useGetCat(catId);
  const { data: breedsData, isLoading: isBreedsLoading } = useGetBreeds({ limit: 1000 });
  const { data: coatColorsData, isLoading: isCoatColorsLoading } = useGetCoatColors({ limit: 1000 });
  const updateCat = useUpdateCat(catId);
  const deleteCat = useDeleteCat();

  const [form, setForm] = useState<{
    name: string;
    gender: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
    breedId: string;
    coatColorId: string;
    birthDate: string;
    microchipNumber: string;
    registrationNumber: string;
    description: string;
  }>({
    name: "",
    gender: "MALE",
    breedId: "",
    coatColorId: "",
    birthDate: "",
    microchipNumber: "",
    registrationNumber: "",
    description: "",
  });

  // データ取得後にフォームを初期化
  useEffect(() => {
    if (cat?.data) {
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
      });
    }
  }, [cat]);

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
      });

      router.push(`/cats/${catId}`);
    } catch (error) {
      console.error("更新エラー:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) {
      return;
    }

    try {
      await deleteCat.mutateAsync(catId);
      router.push("/cats");
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  // ローディング中
  if (isCatLoading || isBreedsLoading || isCoatColorsLoading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  // エラー
  if (catError || !cat) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
          猫の情報を読み込めませんでした。
        </Alert>
        <Button
          mt="md"
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push("/cats")}
        >
          一覧へ戻る
        </Button>
      </Container>
    );
  }

  // 品種とカラーのオプションを作成
  const breedOptions = breedsData?.data?.data?.map((breed: any) => ({
    value: breed.id,
    label: breed.name,
  })) || [];

  const coatColorOptions = coatColorsData?.data?.data?.map((color: any) => ({
    value: color.id,
    label: color.name,
  })) || [];

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>猫の情報編集</Title>
        <Button
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push(`/cats/${catId}`)}
        >
          詳細へ戻る
        </Button>
      </Group>

      <Paper shadow="sm" p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="名前"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <Select
              label="性別"
              value={form.gender}
              onChange={(value) => handleChange("gender", value || "")}
              data={GENDER_OPTIONS}
              required
            />

            <Select
              label="品種"
              value={form.breedId}
              onChange={(value) => handleChange("breedId", value || "")}
              data={breedOptions}
              placeholder="品種を選択"
              searchable
              clearable
            />

            <Select
              label="色柄"
              value={form.coatColorId}
              onChange={(value) => handleChange("coatColorId", value || "")}
              data={coatColorOptions}
              placeholder="色柄を選択"
              searchable
              clearable
            />

            <TextInput
              label="生年月日"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              required
            />

            <TextInput
              label="マイクロチップ番号"
              value={form.microchipNumber}
              onChange={(e) => handleChange("microchipNumber", e.target.value)}
              placeholder="15桁の番号"
            />

            <TextInput
              label="登録番号"
              value={form.registrationNumber}
              onChange={(e) => handleChange("registrationNumber", e.target.value)}
              placeholder="血統書登録番号"
            />

            <Textarea
              label="詳細説明"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              placeholder="特記事項や性格など"
            />

            <Group justify="flex-end" gap="md" pt="md">
              <Button 
                variant="outline" 
                color="red" 
                onClick={handleDelete}
                loading={deleteCat.isPending}
              >
                削除
              </Button>
              <Button 
                type="submit" 
                leftSection={<IconDeviceFloppy size={16} />}
                loading={updateCat.isPending}
              >
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}