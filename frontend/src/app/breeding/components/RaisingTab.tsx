'use client';

import React from 'react';
import {
  Card,
  Text,
  Group,
  Table,
  Badge,
  Button,
  ActionIcon,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { TagDisplay } from '@/components/TagSelector';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { TagCategoryView } from '@/lib/api/hooks/use-tags';
import { calculateAgeInMonths } from '../utils';

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
      
      // 生後3ヶ月以内の子猫がいる母猫を抽出
      const hasYoungKittens = allCats.some((kitten) => {
        if (kitten.motherId !== cat.id) return false;
        
        const birthDate = new Date(kitten.birthDate);
        const now = new Date();
        const ageInMonths = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        return ageInMonths <= 3;
      });
      
      return hasYoungKittens;
    })
    .map((mother) => {
      // この母猫の子猫を取得
      const kittens = allCats.filter((kitten) => {
        if (kitten.motherId !== mother.id) return false;
        
        const birthDate = new Date(kitten.birthDate);
        const now = new Date();
        const ageInMonths = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        return ageInMonths <= 3;
      });
      
      return { mother, kittens };
    });

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
            <Table.Th>処遇完了</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mothersWithKittens.map(({ mother, kittens }) => {
            const isExpanded = expandedRaisingCats.has(mother.id);
            const oldestKitten = kittens.length > 0 ? kittens.reduce((oldest, k) => 
              new Date(k.birthDate) < new Date(oldest.birthDate) ? k : oldest
            ) : null;
            
            const ageInMonths = oldestKitten 
              ? calculateAgeInMonths(oldestKitten.birthDate)
              : 0;

            // この母猫のBirthPlanを取得して出産数と死亡数を計算
            const birthPlan = birthPlans.find(
              (bp) => bp.motherId === mother.id && bp.status === 'BORN'
            );
            const totalBorn = birthPlan?.actualKittens || kittens.length;
            const alive = kittens.length;
            const dead = totalBorn - alive;

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
                    {mother.fatherId 
                      ? allCats.find((c) => c.id === mother.fatherId)?.name || '不明'
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
                    {ageInMonths}ヶ月
                  </Table.Td>
                  <Table.Td>
                    {alive}頭（{totalBorn}-{dead}）
                  </Table.Td>
                  <Table.Td>
                    {birthPlan && !birthPlan.completedAt ? (
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete(birthPlan);
                        }}
                      >
                        完了
                      </Button>
                    ) : birthPlan?.completedAt ? (
                      <Badge color="green" size="sm">完了済</Badge>
                    ) : (
                      <Text size="sm" c="dimmed">-</Text>
                    )}
                  </Table.Td>
                </Table.Tr>

                {/* 子猫の詳細行 */}
                {isExpanded && kittens.map((kitten) => (
                  <Table.Tr key={kitten.id} style={{ backgroundColor: '#f8f9fa' }}>
                    <Table.Td></Table.Td>
                    <Table.Td colSpan={1}>
                      <Text size="sm" pl="md">{kitten.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{kitten.gender === 'MALE' ? 'オス' : 'メス'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{kitten.coatColor?.name || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{calculateAgeInMonths(kitten.birthDate)}ヶ月</Text>
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
                      <Group gap={4}>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenManagementModal(mother.id);
                          }}
                          title="処遇管理"
                        >
                          🎓
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="green"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenManagementModal(mother.id);
                          }}
                          title="処遇管理"
                        >
                          💰
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenManagementModal(mother.id);
                          }}
                          title="処遇管理"
                        >
                          🌈
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </React.Fragment>
            );
          })}
        </Table.Tbody>
      </Table>
    </Card>
  );
}

