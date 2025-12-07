'use client';

/**
 * カード展開デモコンポーネント
 * カジノディーラー風のカード展開アニメーション
 * ファン・リボン・カスケードの3パターン対応
 */

import { useState, useMemo } from 'react';
import { Button, Group, Stack, SegmentedControl, Slider, Text, Badge } from '@mantine/core';
import { CatTexturedCard, type RarityType, type DemoCat } from './CatTexturedCard';
import styles from './CardSpreadDemo.module.css';

/** 展開パターン */
export type SpreadPattern = 'fan' | 'ribbon' | 'cascade';

/** 展開パターンの設定 */
const SPREAD_CONFIG: Record<SpreadPattern, { label: string; icon: string }> = {
  fan: { label: 'ファン', icon: '🌀' },
  ribbon: { label: 'リボン', icon: '➡️' },
  cascade: { label: 'カスケード', icon: '📐' },
};

/** デモ用のサンプル猫データ */
const SAMPLE_CATS: DemoCat[] = [
  { id: '1', name: 'ミケ', gender: 'FEMALE', breed: { id: '1', name: '雑種' } },
  { id: '2', name: 'タマ', gender: 'MALE', breed: { id: '2', name: 'アメショー' } },
  { id: '3', name: 'ソラ', gender: 'MALE', breed: { id: '3', name: 'スコティッシュ' } },
  { id: '4', name: 'ルナ', gender: 'FEMALE', breed: { id: '4', name: 'ペルシャ' } },
  { id: '5', name: 'レオ', gender: 'MALE', breed: { id: '5', name: 'ベンガル' } },
  { id: '6', name: 'キング', gender: 'MALE', breed: { id: '6', name: 'メインクーン' } },
  { id: '7', name: 'ハナ', gender: 'FEMALE', breed: { id: '7', name: 'ラグドール' } },
  { id: '8', name: 'コタロウ', gender: 'NEUTER', breed: { id: '8', name: 'ブリティッシュ' } },
];

/** レアリティをカード位置に応じて割り当て */
const RARITY_ORDER: RarityType[] = ['common', 'common', 'uncommon', 'uncommon', 'rare', 'superRare', 'ultraRare', 'legendary'];

export interface CardSpreadDemoProps {
  /** カスタム猫データ（省略時はサンプルデータを使用） */
  cats?: DemoCat[];
}

/**
 * カード展開デモコンポーネント
 */
export function CardSpreadDemo({ cats }: CardSpreadDemoProps) {
  const [pattern, setPattern] = useState<SpreadPattern>('fan');
  const [cardCount, setCardCount] = useState(5);
  const [isSpread, setIsSpread] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 使用する猫データ
  const catData = cats ?? SAMPLE_CATS;

  // 表示するカード
  const visibleCards = useMemo(() => {
    return Array.from({ length: cardCount }, (_, i) => ({
      cat: catData[i % catData.length],
      rarity: RARITY_ORDER[i % RARITY_ORDER.length],
    }));
  }, [cardCount, catData]);

  // カード位置のスタイルを計算
  const getCardStyle = (index: number, total: number): React.CSSProperties => {
    if (!isSpread) {
      // 収束状態: 少しずつずらして重ねる
      return {
        transform: `translateX(${index * 3}px) translateY(${index * 2}px)`,
        zIndex: index,
      };
    }

    switch (pattern) {
      case 'fan': {
        // ファン展開: 扇状に広げる
        const totalAngle = Math.min(60, total * 8); // 最大60度
        const startAngle = -totalAngle / 2;
        const angleStep = total > 1 ? totalAngle / (total - 1) : 0;
        const angle = startAngle + index * angleStep;
        const radius = 120;
        return {
          transform: `rotate(${angle}deg) translateY(-${radius}px)`,
          transformOrigin: 'bottom center',
          zIndex: index,
        };
      }
      case 'ribbon': {
        // リボン展開: 横一列に広げる
        const spacing = Math.min(180, 800 / total);
        const totalWidth = spacing * (total - 1);
        const startX = -totalWidth / 2;
        return {
          transform: `translateX(${startX + index * spacing}px)`,
          zIndex: index,
        };
      }
      case 'cascade': {
        // カスケード展開: 階段状に重ねる
        const offsetX = index * 35;
        const offsetY = index * 25;
        return {
          transform: `translateX(${offsetX}px) translateY(${offsetY}px)`,
          zIndex: index,
        };
      }
      default:
        return { zIndex: index };
    }
  };

  const handleCardClick = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  return (
    <Stack gap="lg">
      {/* コントロールパネル */}
      <Group justify="center" gap="lg" wrap="wrap">
        <div>
          <Text size="sm" fw={500} mb="xs">展開パターン</Text>
          <SegmentedControl
            value={pattern}
            onChange={(value) => setPattern(value as SpreadPattern)}
            data={Object.entries(SPREAD_CONFIG).map(([value, { label, icon }]) => ({
              value,
              label: `${icon} ${label}`,
            }))}
          />
        </div>

        <div style={{ width: 200 }}>
          <Text size="sm" fw={500} mb="xs">カード枚数: {cardCount}</Text>
          <Slider
            value={cardCount}
            onChange={setCardCount}
            min={3}
            max={Math.min(52, catData.length * 6)}
            step={1}
            marks={[
              { value: 3, label: '3' },
              { value: 13, label: '13' },
              { value: 26, label: '26' },
            ]}
          />
        </div>

        <Button
          onClick={() => setIsSpread(!isSpread)}
          variant={isSpread ? 'filled' : 'outline'}
          color={isSpread ? 'blue' : 'gray'}
        >
          {isSpread ? '🎴 収束' : '🃏 展開'}
        </Button>
      </Group>

      {/* 選択中のカード情報 */}
      {selectedIndex !== null && (
        <Group justify="center">
          <Badge size="lg" variant="light" color="blue">
            選択中: {visibleCards[selectedIndex].cat.name}（{selectedIndex + 1}枚目）
          </Badge>
        </Group>
      )}

      {/* カード展開エリア */}
      <div className={styles.spreadArea}>
        <div className={`${styles.cardContainer} ${styles[pattern]}`}>
          {visibleCards.map((card, index) => (
            <div
              key={`${card.cat.id}-${index}`}
              className={`${styles.cardWrapper} ${selectedIndex === index ? styles.selected : ''}`}
              style={getCardStyle(index, visibleCards.length)}
              onClick={() => handleCardClick(index)}
            >
              <CatTexturedCard
                cat={card.cat}
                rarity={card.rarity}
                enableHoverEffect={false}
              />
            </div>
          ))}
        </div>
      </div>
    </Stack>
  );
}

export default CardSpreadDemo;
