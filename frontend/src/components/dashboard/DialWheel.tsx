'use client';

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
  type PanInfo,
} from 'framer-motion';
import { Box, Text, ThemeIcon, Badge } from '@mantine/core';
import { IconCat } from '@tabler/icons-react';
import classes from './DialWheel.module.css';

/** リング上のメニュー項目 */
export interface DialWheelItem {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  href: string;
  badge?: string | number;
  /** サブアクション（選択時に扇状展開） */
  subActions?: {
    id: string;
    title: string;
    icon: ReactNode;
    href: string;
  }[];
}

interface DialWheelProps {
  /** メニュー項目 */
  items: DialWheelItem[];
  /** アイテムクリック時 */
  onNavigate: (href: string) => void;
  /** 中央のロゴ/アイコン */
  centerLogo?: ReactNode;
}

/**
 * iPodホイール風ダイヤルUI
 * - 中央: ロゴ or 選択中アイコン
 * - リング: 回転するアイコン群
 * - サブリング: 選択時に扇状展開
 */
export function DialWheel({ items, onNavigate, centerLogo }: DialWheelProps) {
  // 回転角度（degree）
  const rotation = useMotionValue(0);
  // スプリングで滑らかに
  const smoothRotation = useSpring(rotation, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });
  // アイコン逆回転用
  const inverseRotation = useTransform(smoothRotation, (r) => -r);
  
  // 選択中インデックス
  const [selectedIndex, setSelectedIndex] = useState(0);
  // サブアクション展開中か
  const [isSubExpanded, setIsSubExpanded] = useState(false);
  // ドラッグ中か
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const anglePerItem = 360 / items.length;

  // 回転角度から選択インデックスを計算
  const updateSelectedIndex = useCallback(() => {
    const currentRotation = rotation.get();
    // 正規化（0-360）
    const normalized = ((currentRotation % 360) + 360) % 360;
    // 上部（0度）に最も近いアイテム
    const rawIndex = Math.round(normalized / anglePerItem);
    // 回転方向を反転（時計回りで次へ）
    const index = (items.length - (rawIndex % items.length)) % items.length;
    setSelectedIndex(index);
  }, [rotation, anglePerItem, items.length]);

  // 回転値の変更を監視
  useEffect(() => {
    const unsubscribe = rotation.on('change', updateSelectedIndex);
    return () => unsubscribe();
  }, [rotation, updateSelectedIndex]);

  // スナップ先の角度を計算
  const getSnapAngle = useCallback(
    (currentRotation: number): number => {
      const normalized = ((currentRotation % 360) + 360) % 360;
      const nearestIndex = Math.round(normalized / anglePerItem);
      const snapAngle = nearestIndex * anglePerItem;
      // 完全な回転数を維持
      const fullRotations = Math.floor(currentRotation / 360) * 360;
      return fullRotations + snapAngle;
    },
    [anglePerItem]
  );

  // 中心座標を取得
  const getCenter = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  // 座標から角度を計算
  const getAngleFromPoint = useCallback(
    (x: number, y: number) => {
      const center = getCenter();
      const dx = x - center.x;
      const dy = y - center.y;
      // 上を0度、時計回りを正
      return Math.atan2(dx, -dy) * (180 / Math.PI);
    },
    [getCenter]
  );

  // ドラッグ開始時の角度
  const dragStartAngle = useRef(0);
  const dragStartRotation = useRef(0);

  // パンハンドラー
  const handlePanStart = useCallback(
    (event: PointerEvent) => {
      setIsDragging(true);
      setIsSubExpanded(false);
      dragStartAngle.current = getAngleFromPoint(event.clientX, event.clientY);
      dragStartRotation.current = rotation.get();
    },
    [getAngleFromPoint, rotation]
  );

  const handlePan = useCallback(
    (event: PointerEvent, _info: PanInfo) => {
      const currentAngle = getAngleFromPoint(event.clientX, event.clientY);
      const deltaAngle = currentAngle - dragStartAngle.current;
      rotation.set(dragStartRotation.current + deltaAngle);
    },
    [getAngleFromPoint, rotation]
  );

  const handlePanEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      
      // 速度から慣性を計算
      const velocity = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);
      const currentRotation = rotation.get();
      
      if (velocity > 100) {
        // 慣性: 速度に応じて追加回転
        const center = getCenter();
        const dx = event.clientX - center.x;
        const dy = event.clientY - center.y;
        // 接線方向の速度成分
        const tangentialVelocity =
          (info.velocity.x * (-dy) + info.velocity.y * dx) /
          Math.sqrt(dx * dx + dy * dy);
        
        const inertiaRotation = tangentialVelocity * 0.3;
        const targetRotation = currentRotation + inertiaRotation;
        const snapAngle = getSnapAngle(targetRotation);
        
        rotation.set(snapAngle);
      } else {
        // スナップのみ
        rotation.set(getSnapAngle(currentRotation));
      }
    },
    [rotation, getCenter, getSnapAngle]
  );

  // ホイールでも回転
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      setIsSubExpanded(false);
      
      const delta = event.deltaY > 0 ? anglePerItem : -anglePerItem;
      const currentRotation = rotation.get();
      rotation.set(getSnapAngle(currentRotation + delta));
    },
    [rotation, anglePerItem, getSnapAngle]
  );

  // アイテムクリック
  const handleItemClick = useCallback(
    (index: number) => {
      if (index === selectedIndex) {
        // 選択中のアイテム → サブ展開 or 遷移
        const item = items[selectedIndex];
        if (item.subActions && item.subActions.length > 0) {
          setIsSubExpanded((prev) => !prev);
        } else {
          onNavigate(item.href);
        }
      } else {
        // 別のアイテム → そこまで回転
        setIsSubExpanded(false);
        const currentNormalized = ((rotation.get() % 360) + 360) % 360;
        const targetIndex = (items.length - index) % items.length;
        const targetAngle = targetIndex * anglePerItem;
        
        let delta = targetAngle - currentNormalized;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        
        rotation.set(rotation.get() + delta);
      }
    },
    [selectedIndex, items, rotation, anglePerItem, onNavigate]
  );

  // サブアクションクリック
  const handleSubActionClick = useCallback(
    (href: string) => {
      setIsSubExpanded(false);
      onNavigate(href);
    },
    [onNavigate]
  );

  // 中央クリック
  const handleCenterClick = useCallback(() => {
    const item = items[selectedIndex];
    if (isSubExpanded) {
      // サブ展開中 → メインに遷移
      onNavigate(item.href);
    } else if (item.subActions && item.subActions.length > 0) {
      // サブあり → 展開
      setIsSubExpanded(true);
    } else {
      // サブなし → 遷移
      onNavigate(item.href);
    }
  }, [items, selectedIndex, isSubExpanded, onNavigate]);

  const selectedItem = items[selectedIndex];

  return (
    <Box className={classes.container}>
      {/* メインダイヤル */}
      <motion.div
        ref={containerRef}
        className={classes.dial}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        onWheel={handleWheel}
      >
        {/* 外枠グロー効果 */}
        <div className={classes.dialGlow} />

        {/* 回転リング */}
        <motion.div
          className={classes.ring}
          style={{ rotate: smoothRotation }}
        >
          {items.map((item, index) => {
            // 上を0度として時計回りに配置
            const itemAngle = (index / items.length) * 360 - 90;
            const radius = 100;
            const x = Math.cos((itemAngle * Math.PI) / 180) * radius;
            const y = Math.sin((itemAngle * Math.PI) / 180) * radius;
            const isSelected = index === selectedIndex;

            return (
              <motion.div
                key={item.id}
                className={classes.ringItem}
                style={{
                  // 座標ベースで配置（回転による位置ズレを防ぐ）
                  x,
                  y,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(index);
                }}
              >
                {/* アイコンは逆回転で正位置 */}
                <motion.div
                  className={classes.ringItemInner}
                  style={{ rotate: inverseRotation }}
                  animate={{
                    scale: isSelected ? 1.25 : 1,
                    opacity: isSelected ? 1 : 0.7,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <ThemeIcon
                    size={isSelected ? 56 : 44}
                    radius="50%"
                    variant={isSelected ? 'filled' : 'light'}
                    color={item.color}
                    className={`${classes.ringIcon} ${isSelected ? classes.ringIconSelected : ''}`}
                  >
                    {item.icon}
                  </ThemeIcon>

                  {/* バッジ */}
                  {item.badge !== undefined && item.badge !== 0 && item.badge !== '' && (
                    <Badge
                      variant="filled"
                      color="red"
                      size="sm"
                      circle
                      className={classes.badge}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 中央エリア */}
        <motion.div
          className={classes.center}
          onClick={handleCenterClick}
          animate={{
            scale: isSubExpanded ? 0.9 : 1,
            backgroundColor: isSubExpanded
              ? `var(--mantine-color-${selectedItem?.color}-1)`
              : 'var(--mantine-color-white)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <AnimatePresence mode="wait">
            {isSubExpanded ? (
              <motion.div
                key="selected-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <ThemeIcon
                  size={60}
                  radius="50%"
                  variant="filled"
                  color={selectedItem?.color}
                  className={classes.centerIcon}
                >
                  {selectedItem?.icon}
                </ThemeIcon>
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={classes.centerLogo}
              >
                {centerLogo ?? (
                  <ThemeIcon size={50} radius="50%" variant="light" color="gray">
                    <IconCat size={28} />
                  </ThemeIcon>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* サブアクションリング（扇状展開） */}
        <AnimatePresence>
          {isSubExpanded && selectedItem?.subActions && (
            <motion.div
              className={classes.subRing}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {selectedItem.subActions.map((subAction, index) => {
                const subCount = selectedItem.subActions?.length ?? 0;
                // 扇状に配置（上半分に広がる）
                const spreadAngle = Math.min(180, subCount * 45);
                const startAngle = -90 - spreadAngle / 2;
                const subAngle = startAngle + (index / (subCount - 1 || 1)) * spreadAngle;
                const radius = 70;

                return (
                  <motion.div
                    key={subAction.id}
                    className={classes.subItem}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: 1,
                      x: Math.cos((subAngle * Math.PI) / 180) * radius,
                      y: Math.sin((subAngle * Math.PI) / 180) * radius,
                    }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      delay: index * 0.05,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubActionClick(subAction.href);
                    }}
                    title={subAction.title}
                  >
                    <ThemeIcon
                      size={40}
                      radius="50%"
                      variant="light"
                      color={selectedItem.color}
                      className={classes.subIcon}
                    >
                      {subAction.icon}
                    </ThemeIcon>
                    <Text size="xs" className={classes.subLabel}>
                      {subAction.title}
                    </Text>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 上部インジケーター */}
        <div className={classes.indicator} />
      </motion.div>

      {/* 選択中のラベル */}
      <motion.div
        className={classes.labelContainer}
        initial={false}
        animate={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedItem?.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Text size="xl" fw={700} ta="center" className={classes.selectedTitle}>
              {selectedItem?.title}
            </Text>
          </motion.div>
        </AnimatePresence>
        <Text size="sm" c="dimmed" ta="center">
          {isSubExpanded ? 'タップで機能を選択' : '回して選択 • タップで決定'}
        </Text>
      </motion.div>
    </Box>
  );
}
