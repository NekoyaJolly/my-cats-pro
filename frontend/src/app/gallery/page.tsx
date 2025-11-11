'use client';

import React, { useState } from 'react';
import {
  Container,
  Stack,
  Text,
  Button,
  Card,
  Group,
  Badge,
  Skeleton,
  Alert,
  Modal,
  Table,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconTrophy, IconTrash } from '@tabler/icons-react';
import { useGetGraduations, useGetGraduationDetail, useCancelGraduation } from '@/lib/api/hooks/use-graduation';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { GenderBadge } from '@/components/GenderBadge';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

// 日付フォーマット関数
function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  try {
    const date = new Date(value);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return '-';
  }
}

export default function GalleryPage() {
  const { setPageHeader } = usePageHeader();
  const [selectedGraduationId, setSelectedGraduationId] = useState<string | null>(null);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);

  // ページヘッダー設定
  React.useEffect(() => {
    setPageHeader('ギャラリー（卒業猫）');
  }, [setPageHeader]);

  // 卒業猫（isGraduated=true）
  const { data: graduations, isLoading: graduationsLoading, error: graduationsError } = useGetGraduations(1, 100);

  // 卒業猫詳細モーダル
  const { data: graduationDetail, isLoading: detailLoading } = useGetGraduationDetail(selectedGraduationId);

  // 卒業取り消し
  const { mutate: cancelGraduation, isPending: isCancelling } = useCancelGraduation();

  const handleViewGraduationDetail = (graduationId: string) => {
    setSelectedGraduationId(graduationId);
    openDetailModal();
  };

  const handleCloseDetailModal = () => {
    closeDetailModal();
    setSelectedGraduationId(null);
  };

  const handleCancelGraduation = (graduationId: string, catName: string) => {
    modals.openConfirmModal({
      title: '卒業記録の取り消し',
      children: (
        <Text size="sm">
          {catName}の卒業記録を取り消しますか？
          <br />
          この猫は再び在舎猫一覧に表示されます。
        </Text>
      ),
      labels: { confirm: '取り消す', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        cancelGraduation(graduationId, {
          onSuccess: () => {
            notifications.show({
              title: '取り消し完了',
              message: `${catName}の卒業記録を取り消しました`,
              color: 'green',
            });
            if (detailModalOpened) {
              handleCloseDetailModal();
            }
          },
          onError: (error: any) => {
            notifications.show({
              title: '取り消し失敗',
              message: error.message || '卒業記録の取り消しに失敗しました',
              color: 'red',
            });
          },
        });
      },
    });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconTrophy size={28} />
            <Title order={2}>卒業猫一覧</Title>
          </Group>
          <Badge size="lg" variant="light" color="blue">
            {graduations?.data?.length || 0}匹
          </Badge>
        </Group>

        {graduationsLoading && <Skeleton height={400} />}
        
        {graduationsError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            卒業猫データの取得に失敗しました
          </Alert>
        )}
        
        {graduations?.data && graduations.data.length === 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            まだ卒業猫はいません
          </Alert>
        )}
        
        {graduations?.data && graduations.data.length > 0 && (
          <Card shadow="sm" p="lg">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>猫名</Table.Th>
                  <Table.Th>性別</Table.Th>
                  <Table.Th>譲渡日</Table.Th>
                  <Table.Th>譲渡先</Table.Th>
                  <Table.Th>備考</Table.Th>
                  <Table.Th>操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {graduations.data.map((grad) => (
                  <Table.Tr key={grad.id}>
                    <Table.Td>
                      <Text fw={500}>{grad.cat?.name || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      {grad.cat?.gender && <GenderBadge gender={grad.cat.gender as 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY'} />}
                    </Table.Td>
                    <Table.Td>{formatDate(grad.transferDate)}</Table.Td>
                    <Table.Td>{grad.destination}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" lineClamp={1}>
                        {grad.notes || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => handleViewGraduationDetail(grad.id)}
                        >
                          詳細
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => handleCancelGraduation(grad.id, grad.cat?.name || '不明')}
                          loading={isCancelling}
                        >
                          取消
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Stack>

      {/* 卒業猫詳細モーダル */}
      <Modal
        opened={detailModalOpened}
        onClose={handleCloseDetailModal}
        title="卒業猫詳細"
        size="lg"
      >
        {detailLoading && <Skeleton height={300} />}
        {graduationDetail?.data && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={700}>譲渡情報</Text>
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() =>
                  handleCancelGraduation(
                    graduationDetail.data.id,
                    graduationDetail.data.catSnapshot.name || '不明'
                  )
                }
                loading={isCancelling}
              >
                卒業記録を取り消す
              </Button>
            </Group>
            <Card withBorder>
              <Stack gap="sm">
                <Group>
                  <Text fw={500}>譲渡日:</Text>
                  <Text>{formatDate(graduationDetail.data.transferDate)}</Text>
                </Group>
                <Group>
                  <Text fw={500}>譲渡先:</Text>
                  <Text>{graduationDetail.data.destination}</Text>
                </Group>
                {graduationDetail.data.notes && (
                  <Group>
                    <Text fw={500}>備考:</Text>
                    <Text>{graduationDetail.data.notes}</Text>
                  </Group>
                )}
              </Stack>
            </Card>

            <Group justify="space-between">
              <Text fw={700}>譲渡時点の猫データ</Text>
            </Group>
            <Card withBorder>
              <Stack gap="sm">
                <Group>
                  <Text fw={500}>名前:</Text>
                  <Text>{graduationDetail.data.catSnapshot.name}</Text>
                </Group>
                <Group>
                  <Text fw={500}>性別:</Text>
                  <GenderBadge gender={graduationDetail.data.catSnapshot.gender} />
                </Group>
                <Group>
                  <Text fw={500}>生年月日:</Text>
                  <Text>
                    {graduationDetail.data.catSnapshot.birthDate
                      ? formatDate(graduationDetail.data.catSnapshot.birthDate)
                      : '-'}
                  </Text>
                </Group>
                <Group>
                  <Text fw={500}>品種:</Text>
                  <Text>{graduationDetail.data.catSnapshot.breed?.name || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={500}>毛色:</Text>
                  <Text>{graduationDetail.data.catSnapshot.coatColor?.name || '-'}</Text>
                </Group>
                {graduationDetail.data.catSnapshot.tags && graduationDetail.data.catSnapshot.tags.length > 0 && (
                  <Group>
                    <Text fw={500}>タグ:</Text>
                    <Group gap="xs">
                      {graduationDetail.data.catSnapshot.tags.map((tagRelation: any) => (
                        <Badge key={tagRelation.tag.id} size="sm">
                          {tagRelation.tag.name}
                        </Badge>
                      ))}
                    </Group>
                  </Group>
                )}
              </Stack>
            </Card>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
