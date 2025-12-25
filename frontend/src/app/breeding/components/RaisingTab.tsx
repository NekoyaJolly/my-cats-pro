'use client';

import React from 'react';
import {
  Card,
  Text,
  Group,
  Table,
  Badge,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconHomePlus,
  IconHeartHandshake,
  IconCloud,
} from '@tabler/icons-react';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import { TagDisplay } from '@/components/TagSelector';
import type { BirthPlan, KittenDisposition } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { TagCategoryView } from '@/lib/api/hooks/use-tags';
import { calculateAgeInDays } from '../utils';

export interface RaisingTabProps {
  allCats: Cat[];
  birthPlans: BirthPlan[];
  tagCategories: TagCategoryView[];
  expandedRaisingCats: Set<string>;
  isLoading: boolean;
  onToggleExpand: (motherId: string) => void;
  onComplete: (birthPlan: BirthPlan) => void;
  onOpenManagementModal: (motherId: string) => void;
}

interface MotherWithKittens {
  mother: Cat;
  kittens: Cat[];
  birthPlan: BirthPlan | undefined;
}

export function RaisingTab({
  allCats,
  birthPlans,
  tagCategories,
  expandedRaisingCats,
  isLoading,
  onToggleExpand,
  onComplete,
  onOpenManagementModal,
}: RaisingTabProps) {
  if (isLoading) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Text ta="center" c="dimmed" py="xl">読み込み中...</Text>
      </Card>
    );
  }

  // 子猫を持つ母猫をフィルタリング（完了していない出産記録のみ）
  const mothersWithKittens: MotherWithKittens[] = allCats
    .filter((cat) => {
      // この母猫の未完了の出産記録を確認
      const activeBirthPlan = birthPlans.find(
        (bp) => bp.motherId === cat.id && bp.status === 'BORN' && !bp.completedAt
      );
      
      if (!activeBirthPlan) return false;
      
      // 生後90日以内の子猫がいる母猫を抽出
      const hasYoungKittens = allCats.some((kitten) => {
        if (kitten.motherId !== cat.id) return false;
        
        const ageInDays = calculateAgeInDays(kitten.birthDate);
        
        return ageInDays <= 90;
      });
      
      return hasYoungKittens;
    })
    .map((mother) => {
      // この母猫の子猫を取得
      const kittens = allCats.filter((kitten) => {
        if (kitten.motherId !== mother.id) return false;
        
        const ageInDays = calculateAgeInDays(kitten.birthDate);
        
        return ageInDays <= 90;
      });

      // この母猫のBirthPlanを取得
      const birthPlan = birthPlans.find(
        (bp) => bp.motherId === mother.id && bp.status === 'BORN' && !bp.completedAt
      );
      
      return { mother, kittens, birthPlan };
    });

  /**
   * 子猫の行先情報を取得
   */
  const getKittenDisposition = (kittenId: string, birthPlan: BirthPlan | undefined): KittenDisposition | undefined => {
    return birthPlan?.kittenDispositions?.find((d) => d.kittenId === kittenId);
  };

  /**
   * 行先アイコンを表示
   */
  const renderDispositionIcon = (disposition: KittenDisposition) => {
    switch (disposition.disposition) {
      case 'TRAINING':
        return (
          <Tooltip label="養成">
            <Box component="span">
              <IconHomePlus size={16} color="var(--mantine-color-blue-6)" />
            </Box>
          </Tooltip>
        );
      case 'SALE':
        return (
          <Tooltip label="出荷">
            <Box component="span">
              <IconHeartHandshake size={16} color="var(--mantine-color-green-6)" />
            </Box>
          </Tooltip>
        );
      case 'DECEASED':
        return (
          <Tooltip label="死亡">
            <Box component="span">
              <IconCloud size={16} color="var(--mantine-color-gray-5)" />
            </Box>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  if (mothersWithKittens.length === 0) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Text ta="center" c="dimmed" py="xl">
          現在子育て中の母猫はいません
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '40px' }}></Table.Th>
            <Table.Th>母猫名</Table.Th>
            <Table.Th>父猫名</Table.Th>
            <Table.Th>出産日</Table.Th>
            <Table.Th>生後</Table.Th>
            <Table.Th>子猫数</Table.Th>
            <Table.Th>行先完了</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mothersWithKittens.map(({ mother, kittens, birthPlan }) => {
            const isExpanded = expandedRaisingCats.has(mother.id);
            const oldestKitten = kittens.length > 0 ? kittens.reduce((oldest, k) => 
              new Date(k.birthDate) < new Date(oldest.birthDate) ? k : oldest
            ) : null;
            
            const ageInDays = oldestKitten 
              ? calculateAgeInDays(oldestKitten.birthDate)
              : 0;

            // 出産数と死亡数を計算
            const totalBorn = birthPlan?.actualKittens || kittens.length;
            const alive = kittens.length;
            const dead = totalBorn - alive;

            // 行先確定済みの子猫数を計算
            const disposedCount = kittens.filter(
              (k) => getKittenDisposition(k.id, birthPlan)
            ).length;
            const allDisposed = disposedCount === kittens.length && kittens.length > 0;

            return (
              <React.Fragment key={mother.id}>
                {/* 母猫の行 */}
                <Table.Tr
                  style={{ cursor: 'pointer', backgroundColor: isExpanded ? '#f8f9fa' : undefined }}
                  onClick={() => onToggleExpand(mother.id)}
                >
                  <Table.Td>
                    {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>{mother.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    {birthPlan?.fatherId
                      ? allCats.find((c) => c.id === birthPlan.fatherId)?.name || '不明'
                      : '不明'
                    }
                  </Table.Td>
                  <Table.Td>
                    {oldestKitten 
                      ? new Date(oldestKitten.birthDate).toLocaleDateString('ja-JP')
                      : '-'
                    }
                  </Table.Td>
                  <Table.Td>
                    {ageInDays}日
                  </Table.Td>
                  <Table.Td>
                    {alive}頭（{totalBorn}-{dead}）
                    {disposedCount > 0 && (
                      <Text size="xs" c="dimmed" component="span" ml={4}>
                        行先{disposedCount}/{kittens.length}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {birthPlan && !birthPlan.completedAt ? (
                      allDisposed ? (
                        <ActionButton
                          action="confirm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onComplete(birthPlan);
                          }}
                        >
                          完了
                        </ActionButton>
                      ) : (
                        <Text size="xs" c="dimmed">行先未確定</Text>
                      )
                    ) : birthPlan?.completedAt ? (
                      <Badge color="green" size="sm">完了済</Badge>
                    ) : (
                      <Text size="sm" c="dimmed">-</Text>
                    )}
                  </Table.Td>
                </Table.Tr>

                {/* 子猫の詳細行 */}
                {isExpanded && kittens.map((kitten) => {
                  const disposition = getKittenDisposition(kitten.id, birthPlan);
                  const hasDisposition = !!disposition;

                  return (
                    <Table.Tr
                      key={kitten.id}
                      style={{
                        backgroundColor: hasDisposition ? 'var(--mantine-color-gray-2)' : '#f8f9fa',
                        opacity: hasDisposition ? 0.6 : 1,
                      }}
                    >
                      <Table.Td></Table.Td>
                      <Table.Td colSpan={1}>
                        <Group gap="xs">
                          <Text
                            size="sm"
                            pl="md"
                            c={hasDisposition ? 'dimmed' : undefined}
                            td={hasDisposition ? 'line-through' : undefined}
                          >
                            {kitten.name}
                          </Text>
                          {disposition && renderDispositionIcon(disposition)}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={hasDisposition ? 'dimmed' : undefined}>
                          {kitten.gender === 'MALE' ? 'オス' : 'メス'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={hasDisposition ? 'dimmed' : undefined}>
                          {kitten.coatColor?.name || '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={hasDisposition ? 'dimmed' : undefined}>
                          {calculateAgeInDays(kitten.birthDate)}日
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {kitten.tags && kitten.tags.length > 0 && (
                            <TagDisplay 
                              tagIds={kitten.tags.map(t => t.tag.id)} 
                              size="xs" 
                              categories={tagCategories}
                              tagMetadata={Object.fromEntries(
                                kitten.tags.map(t => [t.tag.id, t.tag.metadata || {}])
                              )}
                            />
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {!hasDisposition && (
                          <ActionIconButton
                            action="edit"
                            customIcon={<IconHomePlus size={18} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenManagementModal(mother.id);
                            }}
                            title="行先管理"
                            aria-label="行先管理"
                          />
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </Table.Tbody>
      </Table>
    </Card>
  );
}

