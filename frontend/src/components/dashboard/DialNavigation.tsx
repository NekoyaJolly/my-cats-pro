'use client';

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Box, Text, Badge } from '@mantine/core';
import { IconCat } from '@tabler/icons-react';

// ============================================
// 型定義
// ============================================

/** メニュー項目 */
export interface DialItem {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  href: string;
  badge?: string | number;
  subActions?: {
    id: string;
    title: string;
    icon: ReactNode;
    href: string;
  }[];
}

interface DialNavigationProps {
  items: DialItem[];
  onNavigate: (href: string) => void;
  centerLogo?: ReactNode;
}

// ============================================
// カラーパレット（統一）
// ============================================

const COLORS = {
  primary: '#2563EB',        // メインブルー
  primaryLight: 'rgba(37, 99, 235, 0.10)',
  primaryMedium: 'rgba(37, 99, 235, 0.15)',
  secondary: '#22C55E',      // グリーン
  accent: '#F97316',         // オレンジ
  text: '#111827',           // メインテキスト
  textMuted: '#6B7280',      // サブテキスト
  background: '#FFFFFF',
  backgroundGradientStart: '#F5F7FA',
  backgroundGradientEnd: '#F3F6FB',
  border: '#E5E7EB',
  shadow: 'rgba(15, 23, 42, 0.12)',
};

// ============================================
// 定数
// ============================================

const DIAL_SIZE = 260;           // ダイヤル全体のサイズ（少し小さく）
const CENTER_SIZE = 76;          // 中央の穴のサイズ（90→76に縮小）
const ICON_BUTTON_SIZE = 48;     // アイコンボタンサイズ（統一）
const SUB_RADIUS = 55;           // サブアクション配置の半径

// ∞軌道レイアウト用の定数
const INFINITY_CIRCLE_RADIUS = 55;     // 左右の円の半径
const INFINITY_CIRCLE_OFFSET = 45;     // 中心から左右の円の中心までの距離

// ============================================
// ユーティリティ
// ============================================

/** ∞軌道パスのオプション */
interface InfinityPathOptions {
  cxLeft: number;   // 左の円の中心X座標
  cxRight: number;  // 右の円の中心X座標
  cy: number;       // 両円の中心Y座標
  r: number;        // 円の半径
}

/**
 * 疑似∞軌道上の座標を計算
 * パラメータ t (0-1) に対して、2つの円をつないだ∞字型の軌道上の座標を返す
 * - 0 ≦ t < 0.5: 右の円を1周
 * - 0.5 ≦ t < 1: 左の円を1周
 */
const infinityPath = (t: number, opts: InfinityPathOptions): { x: number; y: number } => {
  const { cxLeft, cxRight, cy, r } = opts;
  // tを0-1の範囲に正規化
  const tt = ((t % 1) + 1) % 1;

  if (tt < 0.5) {
    // 右の円（0 ≦ tt < 0.5）
    const localT = tt / 0.5;             // 0-1に正規化
    const angle = localT * 2 * Math.PI;  // 0-2πに変換
    return {
      x: cxRight + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  } else {
    // 左の円（0.5 ≦ tt < 1）
    const localT = (tt - 0.5) / 0.5;     // 0-1に正規化
    const angle = localT * 2 * Math.PI;  // 0-2πに変換
    return {
      x: cxLeft + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }
};

/** 角度を0-360に正規化 */
const normalizeAngle = (angle: number): number => {
  return ((angle % 360) + 360) % 360;
};

/** 最も近いスナップ角度を計算 */
const getSnapAngle = (currentAngle: number, itemCount: number): number => {
  const step = 360 / itemCount;
  const normalized = normalizeAngle(currentAngle);
  const snappedNormalized = Math.round(normalized / step) * step;
  const fullRotations = Math.floor(currentAngle / 360) * 360;
  return fullRotations + snappedNormalized;
};

/** 
 * 角度からインデックスを計算（下=6時位置が選択位置）
 * 180度オフセットを加えることで、下方向を基準にする
 */
const angleToIndex = (angle: number, itemCount: number): number => {
  const step = 360 / itemCount;
  // 下側（6時方向）を基準にするため、180度オフセットを追加
  const normalized = normalizeAngle(-angle + 180);
  const rawIndex = Math.round(normalized / step) % itemCount;
  return rawIndex;
};

// ============================================
// DialNavigation: メインコンポーネント
// ============================================

export function DialNavigation({ items, onNavigate, centerLogo }: DialNavigationProps) {
  // 回転角度（生の値）
  const rotationValue = useMotionValue(0);
  // スプリングで滑らかに（バウンス効果のためdamping低め）
  const smoothRotation = useSpring(rotationValue, {
    stiffness: 120,
    damping: 18,  // 低めでバウンス効果
    mass: 0.5,
  });
  
  // 表示用の回転角度
  const [displayRotation, setDisplayRotation] = useState(0);
  // 選択中インデックス
  const [selectedIndex, setSelectedIndex] = useState(0);
  // サブアクション展開状態
  const [isSubExpanded, setIsSubExpanded] = useState(false);
  // ドラッグ状態
  const [isDragging, setIsDragging] = useState(false);
  // ホバー状態
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ angle: 0, rotation: 0 });
  const velocityRef = useRef(0);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);

  const anglePerItem = 360 / items.length;
  const radius = DIAL_SIZE / 2;

  // smoothRotation の変更を監視
  useEffect(() => {
    const unsubscribe = smoothRotation.on('change', (value) => {
      setDisplayRotation(value);
      setSelectedIndex(angleToIndex(value, items.length));
    });
    return unsubscribe;
  }, [smoothRotation, items.length]);

  // 中心座標を取得
  const getCenter = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  // 座標から角度を計算（上=0度、時計回り正）
  const getAngleFromPoint = useCallback((clientX: number, clientY: number) => {
    const center = getCenter();
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    return Math.atan2(dx, -dy) * (180 / Math.PI);
  }, [getCenter]);

  // ドラッグ開始
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-center]') || target.closest('[data-sub-item]')) {
      return;
    }

    setIsDragging(true);
    setIsSubExpanded(false);
    
    const angle = getAngleFromPoint(e.clientX, e.clientY);
    dragStartRef.current = { angle, rotation: rotationValue.get() };
    lastAngleRef.current = angle;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;

    target.setPointerCapture(e.pointerId);
  }, [getAngleFromPoint, rotationValue]);

  // ドラッグ中
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const currentAngle = getAngleFromPoint(e.clientX, e.clientY);
    const deltaAngle = currentAngle - dragStartRef.current.angle;
    const newRotation = dragStartRef.current.rotation + deltaAngle;

    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (currentAngle - lastAngleRef.current) / dt * 16;
    }
    lastAngleRef.current = currentAngle;
    lastTimeRef.current = now;

    rotationValue.set(newRotation);
  }, [isDragging, getAngleFromPoint, rotationValue]);

  // ドラッグ終了
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const currentRotation = rotationValue.get();
    const velocity = velocityRef.current;
    const inertiaRotation = velocity * 8;
    const targetRotation = currentRotation + inertiaRotation;
    const snapAngle = getSnapAngle(targetRotation, items.length);

    rotationValue.set(snapAngle);
  }, [isDragging, rotationValue, items.length]);

  // ホイール操作
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setIsSubExpanded(false);

    const direction = e.deltaY > 0 ? 1 : -1;
    const currentRotation = rotationValue.get();
    const targetRotation = currentRotation + direction * anglePerItem;
    const snapAngle = getSnapAngle(targetRotation, items.length);

    rotationValue.set(snapAngle);
  }, [rotationValue, anglePerItem, items.length]);

  // アイテムクリック
  const handleItemClick = useCallback((index: number) => {
    if (index === selectedIndex) {
      const item = items[selectedIndex];
      if (item.subActions && item.subActions.length > 0) {
        setIsSubExpanded((prev) => !prev);
      } else {
        onNavigate(item.href);
      }
    } else {
      setIsSubExpanded(false);
      const currentNormalized = normalizeAngle(rotationValue.get());
      const targetNormalizedIndex = (items.length - index) % items.length;
      const targetAngle = targetNormalizedIndex * anglePerItem;
      
      let delta = targetAngle - currentNormalized;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      rotationValue.set(rotationValue.get() + delta);
    }
  }, [selectedIndex, items, rotationValue, anglePerItem, onNavigate]);

  // 中央クリック
  const handleCenterClick = useCallback(() => {
    const item = items[selectedIndex];
    if (isSubExpanded) {
      onNavigate(item.href);
    } else if (item.subActions && item.subActions.length > 0) {
      setIsSubExpanded(true);
    } else {
      onNavigate(item.href);
    }
  }, [items, selectedIndex, isSubExpanded, onNavigate]);

  // サブアクションクリック
  const handleSubActionClick = useCallback((href: string) => {
    setIsSubExpanded(false);
    onNavigate(href);
  }, [onNavigate]);

  const selectedItem = items[selectedIndex];
  const subActions = selectedItem?.subActions ?? [];
  const subCount = subActions.length;
  const spreadAngle = Math.min(160, subCount * 50);
  const subStartAngle = -90 - spreadAngle / 2;

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        gap: 16,
        // 背景グラデーション
        background: `linear-gradient(180deg, ${COLORS.backgroundGradientStart} 0%, ${COLORS.backgroundGradientEnd} 100%)`,
        minHeight: 400,
        borderRadius: 16,
      }}
    >
      {/* ラベル（上部に配置） */}
      <div style={{ textAlign: 'center', minHeight: 46 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedItem?.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: COLORS.text,
                marginBottom: 2,
              }}
              ta="center"
            >
              {selectedItem?.title}
            </Text>
          </motion.div>
        </AnimatePresence>
        <Text
          style={{
            fontSize: 12,
            color: COLORS.textMuted,
          }}
          ta="center"
        >
          {isSubExpanded ? 'タップで機能を選択' : '回転で選択／タップで決定'}
        </Text>
      </div>

      {/* ダイヤル本体 */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: DIAL_SIZE,
          height: DIAL_SIZE,
          touchAction: 'none',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* 背景の円（真っ白、影を軽く） */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: COLORS.background,
            boxShadow: `0 12px 30px ${COLORS.shadow}`,
          }}
        />

        {/* 下部ハイライトセクター（選択位置インジケーター） */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 28,
            background: `linear-gradient(0deg, rgba(37, 99, 235, 0.20) 0%, transparent 100%)`,
            borderRadius: '30px 30px 0 0',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        />
        {/* 選択位置のドットインジケーター（下部） */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: COLORS.primary,
            boxShadow: `0 0 8px ${COLORS.primary}`,
            zIndex: 16,
          }}
        />

        {/* アイコンリング - 疑似∞軌道に配置 */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            transformOrigin: '50% 50%',
          }}
          animate={{ rotate: displayRotation }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          {(() => {
            // ∞軌道のパラメータ設定（すべてのアイテムで共通）
            const infinityOpts: InfinityPathOptions = {
              cxLeft: radius - INFINITY_CIRCLE_OFFSET,   // 左の円の中心
              cxRight: radius + INFINITY_CIRCLE_OFFSET,  // 右の円の中心
              cy: radius,                                 // Y軸中心
              r: INFINITY_CIRCLE_RADIUS,                  // 円の半径
            };

            // 回転角度を0-1の範囲に正規化（すべてのアイテムで共通）
            const rotationNormalized = ((displayRotation % 360) + 360) % 360;
            const tBase = rotationNormalized / 360;  // 1周で0→1
            
            // 下側中央を選択位置にするための位相調整
            const phaseShift = 0.75;

            return items.map((item, index) => {
              // 各アイテムの位置をインデックスに応じてオフセット
              const itemT = tBase + (index / items.length);
              const wrappedT = itemT + phaseShift;

              // ∞軌道上の座標を取得
              const pos = infinityPath(wrappedT, infinityOpts);
              
              const isSelected = index === selectedIndex;
              const isHovered = index === hoveredIndex;

              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 2 : 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(index);
                  }}
                  onPointerEnter={() => setHoveredIndex(index)}
                  onPointerLeave={() => setHoveredIndex(null)}
                >
                {/* アイコンボタン（回転を打ち消す） */}
                <motion.div
                  style={{ transformOrigin: '50% 50%' }}
                  animate={{
                    rotate: -displayRotation,
                    scale: isHovered && !isSelected ? 1.06 : 1,
                    y: isSelected ? -4 : 0,
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 30,
                    scale: { duration: 0.15, ease: 'easeOut' },
                  }}
                >
                  <div
                    style={{
                      width: ICON_BUTTON_SIZE,
                      height: ICON_BUTTON_SIZE,
                      borderRadius: '50%',
                      background: isSelected 
                        ? COLORS.primary 
                        : isHovered 
                          ? COLORS.primaryLight 
                          : COLORS.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected
                        ? `0 4px 12px rgba(37, 99, 235, 0.35)`
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      transition: 'background 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        color: isSelected ? COLORS.background : COLORS.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                  </div>

                  {item.badge !== undefined && item.badge !== 0 && item.badge !== '' && (
                    <Badge
                      variant="filled"
                      color="red"
                      size="sm"
                      circle
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        minWidth: 16,
                        height: 16,
                        fontSize: 9,
                        padding: 0,
                        border: `2px solid ${COLORS.background}`,
                      }}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </motion.div>
              </div>
            );
          });
          })()}
        </motion.div>

        {/* サブアクションリング */}
        <AnimatePresence>
          {isSubExpanded && subActions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 0,
                height: 0,
                zIndex: 5,
              }}
            >
              {subActions.map((sub, index) => {
                const angle = subCount === 1
                  ? -90
                  : subStartAngle + (index / (subCount - 1)) * spreadAngle;
                const x = Math.cos((angle * Math.PI) / 180) * SUB_RADIUS;
                const y = Math.sin((angle * Math.PI) / 180) * SUB_RADIUS;

                return (
                  <motion.div
                    key={sub.id}
                    data-sub-item
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                    }}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{ scale: 1, x, y, opacity: 1 }}
                    exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                      delay: index * 0.04,
                    }}
                    whileHover={{ scale: 1.08 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubActionClick(sub.href);
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: COLORS.background,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.10)',
                        color: COLORS.primary,
                      }}
                    >
                      {sub.icon}
                    </div>
                    <Text
                      size="xs"
                      fw={500}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        padding: '2px 6px',
                        background: COLORS.background,
                        borderRadius: 4,
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                        color: COLORS.text,
                        fontSize: 10,
                      }}
                    >
                      {sub.title}
                    </Text>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* 中央の穴 */}
        <div
          style={{
            position: 'absolute',
            left: (DIAL_SIZE - CENTER_SIZE) / 2,
            top: (DIAL_SIZE - CENTER_SIZE) / 2,
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            borderRadius: '50%',
            // 薄いグラデーション背景
            background: 'radial-gradient(circle, #ffffff 0%, #E8F0FE 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          data-center
          onClick={handleCenterClick}
        >
          <motion.div
            style={{ transformOrigin: '50% 50%' }}
            animate={{ scale: isSubExpanded ? 0.9 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <AnimatePresence mode="wait">
              {isSubExpanded && selectedItem ? (
                <motion.div
                  key="expanded"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: COLORS.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
                      color: COLORS.background,
                    }}
                  >
                    {selectedItem.icon}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {centerLogo ?? (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: COLORS.primaryLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: COLORS.primary,
                      }}
                    >
                      <IconCat size={26} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Box>
  );
}
