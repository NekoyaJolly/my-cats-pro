'use client';

import React, { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import WeightRecordTable from '@/components/kittens/WeightRecordTable';
import { WeightRecordModal } from '@/components/kittens/WeightRecordModal';
import BulkWeightRecordModal from '@/components/kittens/BulkWeightRecordModal';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';

interface MotherWithKittens {
  id: string;
  name: string;
  fatherName: string;
  kittens: {
    id: string;
    name: string;
    color: string;
    gender: 'オス' | 'メス';
  }[];
  deliveryDate: string;
  monthsOld: number;
}

export interface WeightTabProps {
  /**
   * 登録されているすべての猫一覧（母猫・父猫・子猫を含む）
   */
  allCats: Cat[];
  /**
   * 出産予定および出産済みの計画一覧（母猫や子猫の情報を含む）
   */
  birthPlans: BirthPlan[];
  /**
   * 体重記録や関連データを読み込み中かどうか
   */
  isLoading: boolean;
  /**
   * 体重記録の登録・更新後にデータを再取得するためのコールバック
   */
  onRefetch: () => void;
}

/**
 * 体重管理タブコンポーネント
 * 子猫の体重記録を管理する
 */
export function WeightTab({
  allCats,
  birthPlans,
  isLoading,
  onRefetch,
}: WeightTabProps) {
  // 体重記録モーダル
  const [weightModalOpened, { open: openWeightModal, close: closeWeightModal }] = useDisclosure(false);
  const [selectedKittenForWeight, setSelectedKittenForWeight] = useState<{ id: string; name: string } | null>(null);

  // 一括体重記録モーダル
  const [bulkWeightModalOpened, { open: openBulkWeightModal, close: closeBulkWeightModal }] = useDisclosure(false);

  // 子猫を持つ母猫をフィルタリング
  const mothersWithKittens: MotherWithKittens[] = allCats
    .filter((cat) => {
      // 未完了の出産記録を持つ母猫を確認
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

      // 父猫を取得
      const birthPlan = birthPlans.find(
        (bp) => bp.motherId === mother.id && bp.status === 'BORN'
      );
      const father = birthPlan?.fatherId
        ? allCats.find((c) => c.id === birthPlan.fatherId)
        : null;

      // 出産日を取得
      const oldestKitten = kittens.length > 0
        ? kittens.reduce((oldest, k) =>
            new Date(k.birthDate) < new Date(oldest.birthDate) ? k : oldest
          )
        : null;

      const deliveryDate = oldestKitten
        ? new Date(oldestKitten.birthDate).toLocaleDateString('ja-JP')
        : '';

      const monthsOld = oldestKitten
        ? Math.floor((new Date().getTime() - new Date(oldestKitten.birthDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: mother.id,
        name: mother.name,
        fatherName: father?.name ?? '不明',
        kittens: kittens.map((k) => ({
          id: k.id,
          name: k.name,
          color: k.coatColor?.name ?? '未確認',
          gender: k.gender === 'MALE' ? 'オス' as const : 'メス' as const,
        })),
        deliveryDate,
        monthsOld,
      };
    });

  const handleRecordWeight = (kitten: { id: string; name: string }) => {
    setSelectedKittenForWeight(kitten);
    openWeightModal();
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <WeightRecordTable
        motherCats={mothersWithKittens}
        onRecordWeight={handleRecordWeight}
        onBulkRecord={openBulkWeightModal}
      />

      {/* 体重記録モーダル */}
      {selectedKittenForWeight && (
        <WeightRecordModal
          opened={weightModalOpened}
          onClose={closeWeightModal}
          catId={selectedKittenForWeight.id}
          catName={selectedKittenForWeight.name}
          onSuccess={onRefetch}
        />
      )}

      {/* 一括体重記録モーダル */}
      <BulkWeightRecordModal
        opened={bulkWeightModalOpened}
        onClose={closeBulkWeightModal}
        motherGroups={mothersWithKittens.map((mother) => ({
          motherId: mother.id,
          motherName: mother.name,
          fatherName: mother.fatherName,
          deliveryDate: mother.deliveryDate,
          kittens: mother.kittens.map((k) => ({
            id: k.id,
            name: k.name,
            gender: k.gender,
            color: k.color,
          })),
        }))}
        onSuccess={onRefetch}
      />
    </>
  );
}

