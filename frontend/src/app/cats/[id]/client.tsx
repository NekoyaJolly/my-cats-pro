'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Tabs,
  Flex,
  Badge,
  Loader,
  Center,
  Alert,
  Accordion,
  Divider,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconEdit, IconUser, IconAlertCircle, IconChevronDown } from '@tabler/icons-react';
import { useGetCat, useGetCats } from '@/lib/api/hooks/use-cats';
import { useGetBirthPlans } from '@/lib/api/hooks/use-breeding';
import { useGetCareSchedules, useGetMedicalRecords } from '@/lib/api/hooks/use-care';
import { useTransferCat } from '@/lib/api/hooks/use-graduation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { KittenManagementModal } from '@/components/kittens/KittenManagementModal';
import { notifications } from '@mantine/notifications';

type Props = {
  catId: string;
};

// Gender labels (English for consistency with registration forms)
const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  NEUTER: 'Neutered Male',
  SPAY: 'Spayed Female',
};

export default function CatDetailClient({ catId }: Props) {
  const router = useRouter();
  const { data: cat, isLoading, error } = useGetCat(catId);
  const { data: catsResponse } = useGetCats();
  const { data: birthPlansResponse } = useGetBirthPlans();
  const { data: careSchedulesResponse } = useGetCareSchedules({ catId } as any);
  const { data: medicalRecordsResponse } = useGetMedicalRecords({ catId } as any);
  const [managementModalOpened, { open: openManagementModal, close: closeManagementModal }] = useDisclosure(false);
  const [selectedBirthPlanId, setSelectedBirthPlanId] = useState<string | undefined>();
  
  // 譲渡機能
  const { mutate: transferCat, isPending: isTransferring } = useTransferCat();
  
  // 譲渡情報のステート
  const [transferDestination, setTransferDestination] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !cat) {
    return (
      <Container size="lg" style={{ paddingTop: '2rem' }}>
        <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
          猫の情報を読み込めませんでした。
        </Alert>
        <Button
          mt="md"
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/cats')}
        >
          一覧へ戻る
        </Button>
      </Container>
    );
  }

  const catData = cat.data;
  
  if (!catData) {
    return null;
  }

  // 譲渡処理
  const handleTransfer = () => {
    if (!transferDestination || !transferDate) {
      notifications.show({
        title: '入力エラー',
        message: '譲渡先と譲渡日は必須項目です',
        color: 'red',
      });
      return;
    }

    transferCat(
      {
        catId: catData.id,
        data: {
          transferDate: new Date(transferDate).toISOString(),
          destination: transferDestination,
          notes: transferNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: '譲渡完了',
            message: `${catData.name}の譲渡記録を作成しました`,
            color: 'green',
          });
          // ギャラリーページへリダイレクト
          router.push('/gallery');
        },
        onError: (error: any) => {
          notifications.show({
            title: '譲渡失敗',
            message: error.message || '譲渡処理に失敗しました',
            color: 'red',
          });
        },
      }
    );
  };

  return (
  <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* ヘッダー */}
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/cats')}
            >
              一覧へ戻る
            </Button>
            <Group gap="sm">
              <Button
                variant="outline"
                color="yellow"
                leftSection={<IconEdit size={16} />}
                onClick={() => router.push(`/cats/${catData.id}/edit`)}
              >
                編集
              </Button>
              <Button
                variant="outline"
                color="gray"
                leftSection={<IconUser size={16} />}
                onClick={() => router.push(`/cats/${catData.id}/pedigree`)}
              >
                血統表を見る
              </Button>
            </Group>
          </Flex>
        </Container>
      </Box>

      <Container size="lg" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* タブで詳細情報 */}
        <Tabs defaultValue="basic" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="basic">基本情報</Tabs.Tab>
            <Tabs.Tab value="family">家族</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                {/* 名前とステータス */}
                <div>
                  <Title order={2} mb="xs">{catData.name}</Title>
                  <Group gap="xs">
                    <Badge color={catData.isInHouse ? 'green' : 'gray'}>
                      {catData.isInHouse ? '在舎' : '不在'}
                    </Badge>
                    {catData.tags && catData.tags.length > 0 && (
                      <>
                        {catData.tags.map((catTag: any) => (
                          <Badge
                            key={catTag.tag.id}
                            color={catTag.tag.color || 'blue'}
                            variant="light"
                          >
                            {catTag.tag.name}
                          </Badge>
                        ))}
                      </>
                    )}
                  </Group>
                </div>

                <Divider />

                {/* 基本情報 */}
                <Stack gap="md">
                  <Group>
                    <Text fw={600} w={150}>品種:</Text>
                    <Text>{catData.breed?.name || '未登録'}</Text>
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>性別:</Text>
                    <Text>{GENDER_LABELS[catData.gender] || catData.gender}</Text>
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>生年月日:</Text>
                    <Text>{format(new Date(catData.birthDate), 'yyyy年MM月dd日', { locale: ja })}</Text>
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>色柄:</Text>
                    <Text>{catData.coatColor?.name || '未登録'}</Text>
                  </Group>
                  {catData.microchipNumber && (
                    <Group>
                      <Text fw={600} w={150}>マイクロチップ:</Text>
                      <Text>{catData.microchipNumber}</Text>
                    </Group>
                  )}
                  {catData.registrationNumber && (
                    <Group>
                      <Text fw={600} w={150}>登録番号:</Text>
                      <Text>{catData.registrationNumber}</Text>
                    </Group>
                  )}
                  {catData.description && (
                    <Box>
                      <Text fw={600} mb="xs">説明:</Text>
                      <Text>{catData.description}</Text>
                    </Box>
                  )}
                </Stack>

                <Divider />

                {/* 親情報 */}
                <Stack gap="md">
                  <Text fw={600} size="lg">親情報</Text>
                  <Group>
                    <Text fw={600} w={150}>父:</Text>
                    {catData.father ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => catData.father && router.push(`/cats/${catData.father.id}`)}
                      >
                        {catData.father.name}
                      </Button>
                    ) : (
                      <Text c="dimmed">未登録</Text>
                    )}
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>母:</Text>
                    {catData.mother ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => catData.mother && router.push(`/cats/${catData.mother.id}`)}
                      >
                        {catData.mother.name}
                      </Button>
                    ) : (
                      <Text c="dimmed">未登録</Text>
                    )}
                  </Group>
                </Stack>

                <Divider />

                {/* アコーディオンセクション */}
                <Accordion variant="contained">
                  {/* 出産記録（メスの場合のみ） */}
                  {(catData.gender === 'FEMALE' || catData.gender === 'SPAY') && (
                    <Accordion.Item value="births">
                      <Accordion.Control icon={<IconChevronDown size={16} />}>
                        出産記録
                      </Accordion.Control>
                      <Accordion.Panel>
                        {(() => {
                          const completedBirthPlans = (birthPlansResponse?.data || []).filter(
                            (bp: any) => bp.motherId === catData.id && bp.status === 'BORN'
                          );

                          if (completedBirthPlans.length === 0) {
                            return (
                              <Text c="dimmed" size="sm">
                                出産記録はまだありません
                              </Text>
                            );
                          }

                          // 全子猫データを取得
                          const allKittens = catsResponse?.data || [];

                          return (
                            <Stack gap="md">
                              {completedBirthPlans.map((bp: any) => {
                                // 処遇登録されている子猫を基準にする
                                const dispositions = bp.kittenDispositions || [];
                                
                                // 同じ子猫に対して複数の処遇がある場合、最新のものを使用
                                const latestDispositions = dispositions.reduce((acc: any[], d: any) => {
                                  const existing = acc.find((item: any) => item.kittenId === d.kittenId);
                                  if (!existing) {
                                    acc.push(d);
                                  } else {
                                    // createdAtが新しい方を使用
                                    if (new Date(d.createdAt) > new Date(existing.createdAt)) {
                                      acc[acc.indexOf(existing)] = d;
                                    }
                                  }
                                  return acc;
                                }, []);
                                
                                // 処遇ごとの集計（最新の処遇のみで集計）
                                const trainingCount = latestDispositions.filter((d: any) => d.disposition === 'TRAINING').length;
                                const saleCount = latestDispositions.filter((d: any) => d.disposition === 'SALE').length;
                                const deceasedCount = latestDispositions.filter((d: any) => d.disposition === 'DECEASED').length;
                                
                                // 出産頭数は処遇登録されたユニークな子猫の数
                                const totalKittens = latestDispositions.length;
                                
                                // 詳細表示用に子猫の完全な情報を取得
                                const kittens = latestDispositions
                                  .map((d: any) => {
                                    const kitten = allKittens.find((k: any) => k.id === d.kittenId);
                                    return kitten ? { ...kitten, disposition: d.disposition } : null;
                                  })
                                  .filter((k: any) => k !== null);

                                return (
                                  <Card key={bp.id} withBorder padding="md">
                                    <Stack gap="sm">
                                      {/* 概要行 */}
                                      <Group justify="space-between" wrap="nowrap">
                                        <Group gap="md" wrap="wrap">
                                          <Text size="sm" fw={600}>
                                            父: {bp.father?.name || '不明'}
                                          </Text>
                                          <Text size="sm">
                                            出産日: {bp.matingDate ? format(new Date(bp.matingDate), 'yyyy/MM/dd', { locale: ja }) : '不明'}
                                          </Text>
                                          <Text size="sm">
                                            出産: {totalKittens}頭
                                          </Text>
                                          <Text size="sm" c="red">
                                            死亡: {deceasedCount}頭
                                          </Text>
                                          <Text size="sm" c="green">
                                            出荷: {saleCount}頭
                                          </Text>
                                          <Text size="sm" c="blue">
                                            養成: {trainingCount}頭
                                          </Text>
                                        </Group>
                                        <Button
                                          size="xs"
                                          variant="light"
                                          onClick={() => {
                                            setSelectedBirthPlanId(bp.id);
                                            openManagementModal();
                                          }}
                                        >
                                          修正
                                        </Button>
                                      </Group>

                                      {/* 子猫詳細（アコーディオン） */}
                                      {kittens.length > 0 && (
                                        <Accordion variant="separated">
                                          <Accordion.Item value="kittens">
                                            <Accordion.Control>
                                              <Text size="sm">子猫情報 ({kittens.length}頭)</Text>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                              <Stack gap="xs">
                                                {kittens.map((kitten: any) => {
                                                  // kittens配列に既に処遇情報が含まれている
                                                  const dispositionIcon = 
                                                    kitten.disposition === 'TRAINING' ? '🎓' :
                                                    kitten.disposition === 'SALE' ? '💰' :
                                                    kitten.disposition === 'DECEASED' ? '🌈' : '';

                                                  return (
                                                    <Group key={kitten.id} justify="space-between" wrap="nowrap">
                                                      <Group gap="md" wrap="wrap">
                                                        <Text size="sm" fw={500} style={{ minWidth: '80px' }}>
                                                          {kitten.name}
                                                        </Text>
                                                        <Badge size="sm" color={kitten.gender === 'MALE' ? 'blue' : 'pink'}>
                                                          {kitten.gender === 'MALE' ? 'オス' : 'メス'}
                                                        </Badge>
                                                        <Text size="sm" c="dimmed">
                                                          {kitten.coatColor?.name || '色柄未登録'}
                                                        </Text>
                                                        {dispositionIcon && (
                                                          <Badge size="sm" variant="light">
                                                            {dispositionIcon} {
                                                              kitten.disposition === 'TRAINING' ? '養成中' :
                                                              kitten.disposition === 'SALE' ? '出荷済' :
                                                              '死亡'
                                                            }
                                                          </Badge>
                                                        )}
                                                      </Group>
                                                    </Group>
                                                  );
                                                })}
                                              </Stack>
                                            </Accordion.Panel>
                                          </Accordion.Item>
                                        </Accordion>
                                      )}
                                    </Stack>
                                  </Card>
                                );
                              })}
                            </Stack>
                          );
                        })()}
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}

                  {/* ケアノート */}
                  <Accordion.Item value="care">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      ケアノート
                    </Accordion.Control>
                    <Accordion.Panel>
                      {(() => {
                        const careSchedules = careSchedulesResponse?.data || [];
                        const catCareSchedules = careSchedules.filter(
                          (schedule: any) => 
                            schedule.cat?.id === catData.id || 
                            schedule.cats?.some((c: any) => c.id === catData.id)
                        );

                        if (catCareSchedules.length === 0) {
                          return (
                            <Text c="dimmed" size="sm">
                              ケアスケジュールの記録はまだありません
                            </Text>
                          );
                        }

                        return (
                          <Stack gap="xs">
                            {catCareSchedules.map((schedule: any) => (
                              <Group key={schedule.id} gap="md" wrap="nowrap">
                                <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                                  {schedule.name || schedule.title}
                                </Text>
                                <Text size="sm" c="dimmed">
                                  {format(new Date(schedule.scheduleDate), 'yyyy/MM/dd', { locale: ja })}
                                </Text>
                                <Text size="sm" style={{ flex: 1 }}>
                                  {schedule.description || 'メモなし'}
                                </Text>
                              </Group>
                            ))}
                          </Stack>
                        );
                      })()}
                    </Accordion.Panel>
                  </Accordion.Item>

                  {/* 医療記録 */}
                  <Accordion.Item value="medical">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      医療記録
                    </Accordion.Control>
                    <Accordion.Panel>
                      {(() => {
                        const medicalRecords = medicalRecordsResponse?.data || [];
                        const catMedicalRecords = medicalRecords.filter(
                          (record: any) => record.cat?.id === catData.id
                        );

                        if (catMedicalRecords.length === 0) {
                          return (
                            <Text c="dimmed" size="sm">
                              医療記録はまだありません
                            </Text>
                          );
                        }

                        return (
                          <Stack gap="xs">
                            {catMedicalRecords.map((record: any) => (
                              <Card key={record.id} withBorder padding="sm">
                                <Group gap="md" wrap="wrap">
                                  <Text size="sm" fw={500}>
                                    {format(new Date(record.visitDate), 'yyyy/MM/dd', { locale: ja })}
                                  </Text>
                                  <Text size="sm">
                                    症状: {record.symptom || '記載なし'}
                                  </Text>
                                  <Text size="sm">
                                    治療結果: {record.diagnosis || '記載なし'}
                                  </Text>
                                  <Badge size="sm" color={record.status === 'COMPLETED' ? 'green' : 'orange'}>
                                    {record.status === 'COMPLETED' ? '完了' : '治療中'}
                                  </Badge>
                                </Group>
                              </Card>
                            ))}
                          </Stack>
                        );
                      })()}
                    </Accordion.Panel>
                  </Accordion.Item>

                  {/* 譲渡情報 */}
                  <Accordion.Item value="transfer">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      譲渡情報
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="md">
                        <Group align="flex-end" wrap="nowrap">
                          <TextInput
                            label="譲渡先"
                            placeholder="譲渡先を入力"
                            value={transferDestination}
                            onChange={(e) => setTransferDestination(e.currentTarget.value)}
                            style={{ flex: 1 }}
                          />
                          <TextInput
                            label="譲渡日"
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.currentTarget.value)}
                            style={{ width: '180px' }}
                          />
                          <TextInput
                            label="備考"
                            placeholder="備考を入力"
                            value={transferNotes}
                            onChange={(e) => setTransferNotes(e.currentTarget.value)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            onClick={handleTransfer}
                            disabled={!transferDestination || !transferDate}
                            loading={isTransferring}
                          >
                            登録
                          </Button>
                        </Group>
                        <Text c="dimmed" size="xs">
                          ※ 登録後、この猫はギャラリーページへ移動されます
                        </Text>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="family" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text c="dimmed" size="sm">
                家族情報は基本情報タブの出産記録をご覧ください
              </Text>
            </Card>
          </Tabs.Panel>
        </Tabs>

        {/* 子猫管理モーダル */}
        {(catData.gender === 'FEMALE' || catData.gender === 'SPAY') && (
          <KittenManagementModal
            opened={managementModalOpened}
            onClose={closeManagementModal}
            motherId={catData.id}
            onSuccess={() => {
              // データ再取得
              if (catsResponse) {
                window.location.reload();
              }
            }}
          />
        )}
      </Container>
    </Box>
  );
}
