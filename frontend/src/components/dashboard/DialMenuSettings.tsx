'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Switch,
  Button,
  Box,
  Card,
  ActionIcon,
  Paper,
} from '@mantine/core';
import { IconGripVertical, IconEye, IconEyeOff, IconRefresh } from '@tabler/icons-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

/**
 * ダイヤルメニュー項目の設定型
 */
export interface DialMenuItemConfig {
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
  visible: boolean;
  order: number;
}

interface DialMenuSettingsProps {
  opened: boolean;
  onClose: () => void;
  items: DialMenuItemConfig[];
  onSave: (items: DialMenuItemConfig[]) => void;
}

interface SortableMenuItemProps {
  item: DialMenuItemConfig;
  onToggle: (id: string) => void;
}

/**
 * ソート可能なメニュー項目
 */
function SortableMenuItem({ item, onToggle }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      p="md"
      withBorder
      radius="md"
      shadow={isDragging ? 'lg' : 'xs'}
    >
      <Group wrap="nowrap" gap="md">
        {/* ドラッグハンドル */}
        <ActionIcon
          {...attributes}
          {...listeners}
          variant="subtle"
          color="gray"
          style={{ cursor: 'grab', touchAction: 'none' }}
          size="lg"
        >
          <IconGripVertical size={20} />
        </ActionIcon>

        {/* アイコンと六角形の背景 */}
        <Box
          style={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: item.visible ? item.color : '#E9ECEF',
            clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
            color: item.visible ? '#FFFFFF' : '#868E96',
          }}
        >
          {item.icon}
        </Box>

        {/* メニュー項目情報 */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm" lineClamp={1}>
            {item.title}
          </Text>
          {item.subActions && item.subActions.length > 0 && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              サブアクション: {item.subActions.length}件
            </Text>
          )}
        </Box>

        {/* 表示/非表示スイッチ */}
        <Switch
          checked={item.visible}
          onChange={() => onToggle(item.id)}
          size="md"
          color={item.color}
          onLabel={<IconEye size={14} />}
          offLabel={<IconEyeOff size={14} />}
        />
      </Group>
    </Paper>
  );
}

/**
 * ダイヤルメニュー設定モーダル
 */
export function DialMenuSettings({
  opened,
  onClose,
  items,
  onSave,
}: DialMenuSettingsProps) {
  const [localItems, setLocalItems] = useState<DialMenuItemConfig[]>(
    [...items].sort((a, b) => a.order - b.order)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(currentItems, oldIndex, newIndex);
        
        // 順序を更新
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  const handleToggle = (id: string) => {
    setLocalItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleSave = () => {
    onSave(localItems);
    onClose();
  };

  const handleReset = () => {
    setLocalItems([...items].sort((a, b) => a.order - b.order));
  };

  const visibleCount = localItems.filter((item) => item.visible).length;
  const hasChanges = JSON.stringify(localItems) !== JSON.stringify([...items].sort((a, b) => a.order - b.order));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="ダイヤルメニューの編集"
      size="lg"
      centered
    >
      <Stack gap="lg">
        {/* 説明 */}
        <Card p="md" withBorder bg="blue.0">
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              🎯 メニュー項目をカスタマイズ
            </Text>
            <Text size="xs" c="dimmed">
              • スイッチで項目の表示/非表示を切り替え
            </Text>
            <Text size="xs" c="dimmed">
              • ハンドルをドラッグして並び順を変更
            </Text>
            <Text size="xs" c="dimmed">
              • 最大16項目まで対応しています
            </Text>
          </Stack>
        </Card>

        {/* 表示項目数 */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            表示中: <Text span fw={600} c="blue">{visibleCount}</Text> / {localItems.length} 件
          </Text>
          {hasChanges && (
            <Text size="xs" c="orange" fw={600}>
              未保存の変更があります
            </Text>
          )}
        </Group>

        {/* メニュー項目リスト */}
        <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap="sm">
                {localItems.map((item) => (
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </Box>

        {/* アクション */}
        <Group justify="space-between">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            リセット
          </Button>
          <Group gap="sm">
            <Button
              variant="default"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || visibleCount === 0}
            >
              保存
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
