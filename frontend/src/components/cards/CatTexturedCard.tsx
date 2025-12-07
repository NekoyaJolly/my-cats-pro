'use client';

/**
 * 質感ベースの猫カードコンポーネント
 * ベース質感 + ホログラム加工オーバーレイのレイヤー構造
 */

import { Card, Text, Badge, Group, Stack } from '@mantine/core';
import type { Cat } from '@/lib/api/hooks/use-cats';
import styles from './CatTexturedCard.module.css';

/** 質感タイプ（9種類） */
export type TextureType = 
  | 'matte' 
  | 'glossy' 
  | 'embossed' 
  | 'linen' 
  | 'washi' 
  | 'metallic' 
  | 'metallicGold' 
  | 'leather' 
  | 'wood';

/** ホログラム加工タイプ（4種類 + none） */
export type HoloPatternType = 'none' | 'stripe' | 'dot' | 'prism' | 'stardust';

/** レアリティタイプ（6段階） */
export type RarityType = 'common' | 'uncommon' | 'rare' | 'superRare' | 'ultraRare' | 'legendary';

/** レアリティ別プリセット設定 */
interface RarityPreset {
  texture: TextureType;
  holoPattern: HoloPatternType;
  rainbowBorder: boolean;
}

const RARITY_PRESETS: Record<RarityType, RarityPreset> = {
  common: {
    texture: 'matte',
    holoPattern: 'none',
    rainbowBorder: false,
  },
  uncommon: {
    texture: 'linen',
    holoPattern: 'none',
    rainbowBorder: false,
  },
  rare: {
    texture: 'glossy',
    holoPattern: 'none',
    rainbowBorder: false,
  },
  superRare: {
    texture: 'metallic',
    holoPattern: 'stripe',  // メタリック + ストライプホロ
    rainbowBorder: false,
  },
  ultraRare: {
    texture: 'metallicGold',
    holoPattern: 'prism',   // ゴールド + プリズムホロ
    rainbowBorder: false,
  },
  legendary: {
    texture: 'embossed',
    holoPattern: 'stardust', // エンボス + スターダストホロ
    rainbowBorder: true,
  },
};

/** レアリティの日本語表示と色設定 */
const RARITY_DISPLAY: Record<RarityType, { label: string; color: string }> = {
  common: { label: 'コモン', color: 'gray' },
  uncommon: { label: 'アンコモン', color: 'green' },
  rare: { label: 'レア', color: 'blue' },
  superRare: { label: 'スーパーレア', color: 'violet' },
  ultraRare: { label: 'ウルトラレア', color: 'orange' },
  legendary: { label: 'レジェンダリー', color: 'yellow' },
};

/** 質感の日本語表示 */
const TEXTURE_DISPLAY: Record<TextureType, string> = {
  matte: 'マット',
  glossy: 'グロッシー',
  embossed: 'エンボス',
  linen: 'リネン',
  washi: '和紙',
  metallic: 'メタリック',
  metallicGold: 'ゴールド',
  leather: 'レザー',
  wood: '木目',
};

/** ホログラム加工の日本語表示 */
const HOLO_DISPLAY: Record<HoloPatternType, string> = {
  none: 'なし',
  stripe: 'ストライプ',
  dot: 'ドット',
  prism: 'プリズム',
  stardust: 'スターダスト',
};

/** デモ用のダミー猫データ */
export interface DemoCat {
  id: string;
  name: string;
  gender?: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
  birthDate?: string;
  breed?: { id: string; name: string };
  coatColor?: { id: string; name: string };
  registrationNumber?: string | null;
}

export interface CatTexturedCardProps {
  /** 猫データ（実際のCat型またはデモ用データ） */
  cat: Cat | DemoCat;
  /** ベース質感タイプ */
  texture?: TextureType;
  /** ホログラム加工パターン */
  holoPattern?: HoloPatternType;
  /** レアリティ（指定すると texture + holoPattern を自動決定） */
  rarity?: RarityType;
  /** ホバー時の軽い演出を有効化（デフォルト: true） */
  enableHoverEffect?: boolean;
  /** レインボーボーダー */
  rainbowBorder?: boolean;
  /** クリックハンドラ */
  onClick?: () => void;
}

/**
 * ホログラム加工パターン名をCSSクラス名に変換
 */
function getHoloClassName(pattern: HoloPatternType): string {
  if (pattern === 'none') return '';
  // stripe -> holoStripe, dot -> holoDot, etc.
  return `holo${pattern.charAt(0).toUpperCase()}${pattern.slice(1)}`;
}

/**
 * 質感ベースの猫カードコンポーネント
 * 
 * @example
 * // ベース質感のみ
 * <CatTexturedCard cat={cat} texture="metallic" />
 * 
 * // ベース質感 + ホログラム加工
 * <CatTexturedCard cat={cat} texture="metallicGold" holoPattern="prism" />
 * 
 * // レアリティで自動決定
 * <CatTexturedCard cat={cat} rarity="legendary" />
 * 
 * // フルカスタマイズ
 * <CatTexturedCard 
 *   cat={cat} 
 *   texture="metallic" 
 *   holoPattern="stardust" 
 *   rainbowBorder 
 *   enableHoverEffect={false}
 * />
 */
export function CatTexturedCard({
  cat,
  texture,
  holoPattern,
  rarity,
  enableHoverEffect = true,
  rainbowBorder,
  onClick,
}: CatTexturedCardProps) {
  // レアリティ指定時はプリセットを適用
  const preset = rarity ? RARITY_PRESETS[rarity] : null;
  const finalTexture = texture ?? preset?.texture ?? 'matte';
  const finalHolo = holoPattern ?? preset?.holoPattern ?? 'none';
  const finalRainbow = rainbowBorder ?? preset?.rainbowBorder ?? false;

  // CSSクラスを組み立て
  const cardClasses = [
    styles.card,
    styles[finalTexture],
    finalRainbow ? styles.rainbowBorder : '',
    enableHoverEffect ? styles.hoverEnabled : '',
  ].filter(Boolean).join(' ');

  // ホログラムオーバーレイのクラス
  const holoClassName = getHoloClassName(finalHolo);

  // 性別表示
  const genderDisplay = cat.gender 
    ? { MALE: '♂', FEMALE: '♀', NEUTER: '♂（去勢）', SPAY: '♀（避妊）' }[cat.gender]
    : null;

  // シマー演出対象判定（glossy, metallic系, ホログラム有りの場合）
  const hasShimmer = enableHoverEffect && (
    finalTexture === 'glossy' || 
    finalTexture === 'metallic' || 
    finalTexture === 'metallicGold' ||
    finalHolo !== 'none'
  );

  return (
    <div 
      className={cardClasses}
      role="article"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* ホログラム加工オーバーレイ */}
      {finalHolo !== 'none' && (
        <div 
          className={`${styles.holoOverlay} ${styles[holoClassName]}`} 
          aria-hidden="true" 
        />
      )}

      {/* シマー演出用オーバーレイ */}
      {hasShimmer && (
        <div className={styles.shimmerOverlay} aria-hidden="true" />
      )}

      <Card.Section className={styles.imageSection}>
        <div className={styles.imagePlaceholder}>
          <Text size="3rem" style={{ lineHeight: 1 }}>🐱</Text>
        </div>
      </Card.Section>

      <Stack gap="xs" className={styles.content}>
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="md" className={styles.catName}>
            {cat.name}
          </Text>
          {genderDisplay && (
            <Text size="sm" c="dimmed">
              {genderDisplay}
            </Text>
          )}
        </Group>

        {cat.breed && (
          <Text size="xs" c="dimmed">
            {cat.breed.name}
          </Text>
        )}

        <Group gap="xs" mt="auto" wrap="wrap">
          {rarity && (
            <Badge 
              color={RARITY_DISPLAY[rarity].color} 
              variant="light" 
              size="sm"
            >
              {RARITY_DISPLAY[rarity].label}
            </Badge>
          )}
          <Badge variant="outline" size="xs" color="gray">
            {TEXTURE_DISPLAY[finalTexture]}
          </Badge>
          {finalHolo !== 'none' && (
            <Badge variant="dot" size="xs" color="cyan">
              {HOLO_DISPLAY[finalHolo]}
            </Badge>
          )}
        </Group>
      </Stack>
    </div>
  );
}

export default CatTexturedCard;
