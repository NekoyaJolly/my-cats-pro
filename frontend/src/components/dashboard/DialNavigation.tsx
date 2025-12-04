'use client';

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Box, Text, ActionIcon, Tooltip, Button, ScrollArea, SegmentedControl } from '@mantine/core';
import { IconCat, IconSettings, IconCheck, IconX, IconPlus } from '@tabler/icons-react';
import { HexIconButton } from './HexIconButton';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type DialSizePreset,
  DIAL_SIZE_PRESETS,
  DIAL_SIZE_PRESET_LABELS,
} from '@/lib/storage/dashboard-settings';

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

/** 編集可能なダイアル項目（表示/非表示情報付き） */
export interface EditableDialItem extends DialItem {
  visible: boolean;
  order: number;
}

interface DialNavigationProps {
  items: DialItem[];
  onNavigate: (href: string) => void;
  centerLogo?: ReactNode;
  onSettingsClick?: () => void;
  /** 編集モード用: 全アイテム（非表示含む） */
  allItems?: EditableDialItem[];
  /** 編集モード用: アイテム変更時のコールバック */
  onItemsChange?: (items: EditableDialItem[]) => void;
  /** サイズプリセット */
  sizePreset?: DialSizePreset;
  /** サイズプリセット変更時のコールバック */
  onSizePresetChange?: (preset: DialSizePreset) => void;
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
  backgroundGradientStart: '#F8FAFC',
  backgroundGradientEnd: '#F1F5F9',
  border: '#E5E7EB',
  shadow: 'rgba(15, 23, 42, 0.12)',
  // リング用のカラー
  ringTrack: 'rgba(37, 99, 235, 0.06)',  // リングの軌道
  ringBorder: 'rgba(37, 99, 235, 0.15)', // リング境界線
};

// ============================================
// 編集モード用の固定サイズ（mediumプリセット）
// ============================================

const EDIT_MODE_ICON_SIZE = 48;  // 編集モードでのアイコンサイズ

// ============================================
// ユーティリティ
// ============================================

/**
 * 円軌道上の座標を計算
 * @param index アイテムのインデックス
 * @param totalItems 全アイテム数
 * @param centerX 中心X座標
 * @param centerY 中心Y座標
 * @param radius 軌道半径
 * @returns {x, y} 座標
 */
const getCirclePosition = (
  index: number,
  totalItems: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number } => {
  // 下（6時方向）を0番目の基準位置にする
  // これにより、初期状態でindex=0が6時位置に来る
  const angleOffset = Math.PI / 2; // +90度オフセット（下を基準）
  const angle = (index / totalItems) * 2 * Math.PI + angleOffset;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
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
 * 
 * 配置: index=0が6時位置、時計回りにindexが増える
 * 回転: displayRotationが正の時、リングが時計回りに回転
 * 
 * つまり:
 * - rotation=0: index=0が6時位置
 * - rotation=+step: リングが時計回りに回転、index=0は右下へ、
 *                   index=(n-1)が6時位置に来る
 */
const angleToIndex = (angle: number, itemCount: number): number => {
  const step = 360 / itemCount;
  const normalized = normalizeAngle(-angle); // 負にすることで回転方向を反転
  const rawIndex = Math.round(normalized / step) % itemCount;
  return rawIndex;
};

// ============================================
// 編集モード用サブコンポーネント
// ============================================

/** フッターのドラッグ可能なアイコン */
function DraggableFooterIcon({ item }: { item: EditableDialItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `footer-${item.id}`,
    data: { type: 'footer', item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: 8,
          cursor: 'grab',
        }}
      >
        <HexIconButton
          size={40}
          selected={false}
          hovered={false}
          color={item.color}
        >
          {item.icon}
        </HexIconButton>
        <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 56 }}>
          {item.title}
        </Text>
      </div>
    </div>
  );
}

/** ダイアル上のドラッグ可能なアイコン */
function SortableDialIcon({ 
  item, 
  position,
  rotation,
  isSelected,
  onRemove,
}: { 
  item: DialItem; 
  position: { x: number; y: number };
  rotation: number;
  isSelected: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `dial-${item.id}`,
    data: { type: 'dial', item },
  });

  const style = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    transform: `translate(-50%, -50%) ${CSS.Transform.toString(transform) || ''}`,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : isSelected ? 2 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', position: 'relative' }}
      >
        <motion.div
          style={{ transformOrigin: '50% 50%' }}
          animate={{ rotate: -rotation }}
        >
          <HexIconButton
            size={EDIT_MODE_ICON_SIZE}
            selected={isSelected}
            hovered={false}
            color={item.color}
            badge={item.badge}
          >
            {item.icon}
          </HexIconButton>
        </motion.div>
        {/* 削除ボタン */}
        <ActionIcon
          size="xs"
          color="red"
          variant="filled"
          radius="xl"
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            zIndex: 10,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <IconX size={10} />
        </ActionIcon>
      </div>
    </div>
  );
}

// ============================================
// DialNavigation: メインコンポーネント
// ============================================

export function DialNavigation({ 
  items, 
  onNavigate, 
  centerLogo, 
  onSettingsClick,
  allItems,
  onItemsChange,
  sizePreset = 'medium',
  onSizePresetChange,
}: DialNavigationProps) {
  // サイズ設定を取得
  const sizeConfig = DIAL_SIZE_PRESETS[sizePreset];
  const {
    dialSize: DIAL_SIZE,
    centerSize: CENTER_SIZE,
    iconButtonSize: ICON_BUTTON_SIZE,
    iconOrbitRadius: ICON_ORBIT_RADIUS,
    subRadius: SUB_RADIUS,
  } = sizeConfig;

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
  // ドラッグ状態（ダイアル回転用）
  const [isDragging, setIsDragging] = useState(false);
  // ホバー状態
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // 編集モード state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItems, setEditItems] = useState<EditableDialItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<EditableDialItem | null>(null);
  
  // dnd-kit センサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
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
  // 選択中のアイテムをタップ → 即座に遷移（サブメニューは中央から展開）
  // 非選択のアイテムをタップ → そのアイテムを6時位置に移動
  const handleItemClick = useCallback((index: number) => {
    if (index === selectedIndex) {
      // 選択中のアイテムをタップしたら即座に遷移
      const item = items[selectedIndex];
      setIsSubExpanded(false);
      onNavigate(item.href);
    } else {
      setIsSubExpanded(false);
      // index番目のアイテムを6時位置に持ってくる
      // 回転は負の方向（反時計回り）でindexが増える方向
      const targetRotation = -index * anglePerItem;
      
      // 最短経路で回転
      const currentRotation = rotationValue.get();
      const currentNormalized = normalizeAngle(currentRotation);
      const targetNormalized = normalizeAngle(targetRotation);
      
      let delta = targetNormalized - currentNormalized;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      rotationValue.set(currentRotation + delta);
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
  const spreadAngle = Math.min(120, subCount * 40); // 展開角度を狭く
  const subStartAngle = 90 - spreadAngle / 2; // 下向き（90度）を基準に展開

  // ============================================
  // 編集モード関連のハンドラー
  // ============================================

  // 編集モード開始
  const handleStartEdit = useCallback(() => {
    if (allItems) {
      setEditItems([...allItems]);
      setIsEditMode(true);
    }
  }, [allItems]);

  // 編集モード終了（保存）
  const handleSaveEdit = useCallback(() => {
    if (onItemsChange) {
      onItemsChange(editItems);
    }
    setIsEditMode(false);
  }, [editItems, onItemsChange]);

  // 編集モードキャンセル
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditItems([]);
  }, []);

  // ダイアルに表示中のアイテム（編集モード用）
  const visibleEditItems = editItems.filter((item) => item.visible);
  // フッターに表示するアイテム（非表示のもの）
  const hiddenEditItems = editItems.filter((item) => !item.visible);

  // dnd-kit: ドラッグ開始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const itemId = String(active.id).replace(/^(footer-|dial-)/, '');
    const item = editItems.find((i) => i.id === itemId);
    if (item) {
      setDraggedItem(item);
    }
  }, [editItems]);

  // dnd-kit: ドラッグ終了
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeType = activeId.startsWith('footer-') ? 'footer' : 'dial';
    const overType = overId.startsWith('footer-') ? 'footer' : overId === 'dial-drop-zone' ? 'dial-zone' : 'dial';

    const activeItemId = activeId.replace(/^(footer-|dial-)/, '');
    const overItemId = overId.replace(/^(footer-|dial-)/, '');

    setEditItems((current) => {
      const newItems = [...current];
      const activeIndex = newItems.findIndex((i) => i.id === activeItemId);

      if (activeIndex === -1) return current;

      // フッター→ダイアルゾーン: 表示に切り替え
      if (activeType === 'footer' && (overType === 'dial-zone' || overType === 'dial')) {
        newItems[activeIndex] = { ...newItems[activeIndex], visible: true };
        // 順序を更新
        const visibleItems = newItems.filter((i) => i.visible);
        visibleItems.forEach((item, idx) => {
          const itemIndex = newItems.findIndex((i) => i.id === item.id);
          if (itemIndex !== -1) {
            newItems[itemIndex] = { ...newItems[itemIndex], order: idx };
          }
        });
        return newItems;
      }

      // ダイアル内の並べ替え
      if (activeType === 'dial' && overType === 'dial' && activeId !== overId) {
        const overIndex = newItems.findIndex((i) => i.id === overItemId);
        if (overIndex === -1) return current;

        const result = arrayMove(newItems, activeIndex, overIndex);
        // 順序を更新
        result.forEach((item, idx) => {
          result[idx] = { ...item, order: idx };
        });
        return result;
      }

      return current;
    });
  }, []);

  // アイテムをダイアルから削除（フッターへ移動）
  const handleRemoveFromDial = useCallback((itemId: string) => {
    setEditItems((current) => {
      const newItems = current.map((item) =>
        item.id === itemId ? { ...item, visible: false } : item
      );
      // 順序を更新
      const visibleItems = newItems.filter((i) => i.visible);
      visibleItems.forEach((item, idx) => {
        const itemIndex = newItems.findIndex((i) => i.id === item.id);
        if (itemIndex !== -1) {
          newItems[itemIndex] = { ...newItems[itemIndex], order: idx };
        }
      });
      return newItems;
    });
  }, []);

  // ============================================
  // レンダリング
  // ============================================

  // 編集モードのレンダリング
  if (isEditMode) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 20,
            gap: 16,
            background: `linear-gradient(180deg, ${COLORS.backgroundGradientStart} 0%, ${COLORS.backgroundGradientEnd} 100%)`,
            minHeight: 400,
            borderRadius: 16,
            position: 'relative',
          }}
        >
          {/* 編集モードヘッダー */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%',
            paddingBottom: 8,
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            <Text fw={600} size="sm">メニューを編集</Text>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={<IconX size={14} />}
                onClick={handleCancelEdit}
              >
                キャンセル
              </Button>
              <Button
                size="xs"
                leftSection={<IconCheck size={14} />}
                onClick={handleSaveEdit}
              >
                保存
              </Button>
            </div>
          </div>

          {/* サイズプリセット選択 */}
          {onSizePresetChange && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              width: '100%',
            }}>
              <Text size="sm" c="dimmed">サイズ:</Text>
              <SegmentedControl
                size="xs"
                value={sizePreset}
                onChange={(value) => onSizePresetChange(value as DialSizePreset)}
                data={[
                  { label: DIAL_SIZE_PRESET_LABELS.small, value: 'small' },
                  { label: DIAL_SIZE_PRESET_LABELS.medium, value: 'medium' },
                  { label: DIAL_SIZE_PRESET_LABELS.large, value: 'large' },
                ]}
              />
            </div>
          )}

          {/* ダイアル編集エリア */}
          <div
            id="dial-drop-zone"
            style={{
              width: DIAL_SIZE,
              height: DIAL_SIZE,
              borderRadius: '50%',
              position: 'relative',
              background: COLORS.background,
              boxShadow: `0 4px 20px ${COLORS.shadow}`,
              border: `2px dashed ${COLORS.primary}`,
            }}
          >
            {/* リングのトラック（軌道） - 編集モードでも表示 */}
            <div
              style={{
                position: 'absolute',
                left: radius - ICON_ORBIT_RADIUS - ICON_BUTTON_SIZE / 2 - 4,
                top: radius - ICON_ORBIT_RADIUS - ICON_BUTTON_SIZE / 2 - 4,
                width: (ICON_ORBIT_RADIUS + ICON_BUTTON_SIZE / 2 + 4) * 2,
                height: (ICON_ORBIT_RADIUS + ICON_BUTTON_SIZE / 2 + 4) * 2,
                borderRadius: '50%',
                background: COLORS.ringTrack,
                border: `1.5px solid ${COLORS.ringBorder}`,
                pointerEvents: 'none',
              }}
            />
            <SortableContext
              items={visibleEditItems.map((item) => `dial-${item.id}`)}
              strategy={rectSortingStrategy}
            >
              {visibleEditItems.map((item, index) => {
                const pos = getCirclePosition(
                  index,
                  visibleEditItems.length,
                  radius,
                  radius,
                  ICON_ORBIT_RADIUS
                );
                return (
                  <SortableDialIcon
                    key={item.id}
                    item={item}
                    position={pos}
                    rotation={0}
                    isSelected={false}
                    onRemove={() => handleRemoveFromDial(item.id)}
                  />
                );
              })}
            </SortableContext>

            {/* 中央のプラスアイコン（空の場合） */}
            {visibleEditItems.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: COLORS.textMuted,
                  textAlign: 'center',
                }}
              >
                <IconPlus size={32} />
                <Text size="xs" c="dimmed">
                  下からドラッグして追加
                </Text>
              </div>
            )}
          </div>

          {/* フッター: 非表示アイコン一覧 */}
          <div
            style={{
              width: '100%',
              background: COLORS.background,
              borderRadius: 12,
              padding: 12,
              boxShadow: `0 2px 8px ${COLORS.shadow}`,
            }}
          >
            <Text size="xs" c="dimmed" mb={8}>
              利用可能なメニュー（ドラッグして追加）
            </Text>
            <ScrollArea type="auto" offsetScrollbars>
              <SortableContext
                items={hiddenEditItems.map((item) => `footer-${item.id}`)}
                strategy={rectSortingStrategy}
              >
                <div style={{ display: 'flex', gap: 8, minHeight: 80 }}>
                  {hiddenEditItems.length === 0 ? (
                    <Text size="xs" c="dimmed" style={{ padding: 20 }}>
                      すべてのメニューが表示中です
                    </Text>
                  ) : (
                    hiddenEditItems.map((item) => (
                      <DraggableFooterIcon key={item.id} item={item} />
                    ))
                  )}
                </div>
              </SortableContext>
            </ScrollArea>
          </div>
        </Box>

        {/* ドラッグオーバーレイ */}
        <DragOverlay>
          {draggedItem && (
            <HexIconButton
              size={ICON_BUTTON_SIZE}
              selected={false}
              hovered={false}
              color={draggedItem.color}
            >
              {draggedItem.icon}
            </HexIconButton>
          )}
        </DragOverlay>
      </DndContext>
    );
  }

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
        position: 'relative',
      }}
    >
      {/* 設定ボタン（右上） */}
      {(onSettingsClick || allItems) && (
        <Tooltip label="メニューを編集" position="left">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={allItems ? handleStartEdit : onSettingsClick}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 100,
            }}
          >
            <IconSettings size={20} />
          </ActionIcon>
        </Tooltip>
      )}

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

        {/* リングのトラック（軌道） - アイコンが配置される円を可視化 */}
        <div
          style={{
            position: 'absolute',
            left: radius - ICON_ORBIT_RADIUS - ICON_BUTTON_SIZE / 2 - 4,
            top: radius - ICON_ORBIT_RADIUS - ICON_BUTTON_SIZE / 2 - 4,
            width: (ICON_ORBIT_RADIUS + ICON_BUTTON_SIZE / 2 + 4) * 2,
            height: (ICON_ORBIT_RADIUS + ICON_BUTTON_SIZE / 2 + 4) * 2,
            borderRadius: '50%',
            background: COLORS.ringTrack,
            border: `1.5px solid ${COLORS.ringBorder}`,
            pointerEvents: 'none',
          }}
        />

        {/* 下部ハイライトセクター（選択位置インジケーター） */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 70,
            height: 35,
            background: `linear-gradient(0deg, rgba(37, 99, 235, 0.25) 0%, transparent 100%)`,
            borderRadius: '35px 35px 0 0',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        />
        {/* 選択位置のドットインジケーター（下部） */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: COLORS.primary,
            boxShadow: `0 0 10px ${COLORS.primary}`,
            zIndex: 16,
          }}
        />

        {/* アイコンリング - 円形軌道に配置 */}
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
          {items.map((item, index) => {
            // 円軌道上の座標を取得
            const pos = getCirclePosition(
              index,
              items.length,
              radius,  // centerX
              radius,  // centerY
              ICON_ORBIT_RADIUS
            );
            
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
                {/* アイコンボタン（回転を打ち消す） - 六角形 */}
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
                  <HexIconButton
                    size={ICON_BUTTON_SIZE}
                    selected={isSelected}
                    hovered={isHovered}
                    color={item.color || COLORS.primary}
                    badge={item.badge}
                  >
                    {item.icon}
                  </HexIconButton>
                </motion.div>
              </div>
            );
          })}
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
                zIndex: 20, // リングより上に表示
              }}
            >
              {subActions.map((sub, index) => {
                // 下向き（90度）を中心に扇状に展開
                const angle = subCount === 1
                  ? 90 // 1つの場合は真下
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
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: COLORS.background,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.15)',
                        color: COLORS.primary,
                        border: `2px solid ${COLORS.primary}20`,
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
                        marginTop: 4,
                        whiteSpace: 'nowrap',
                        padding: '3px 8px',
                        background: COLORS.background,
                        borderRadius: 6,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                        color: COLORS.text,
                        fontSize: 11,
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
