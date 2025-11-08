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
  ThemeIcon,
  Card,
  ActionIcon,
  Paper,
} from '@mantine/core';
import { IconGripVertical, IconEye, IconEyeOff } from '@tabler/icons-react';
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

export interface DashboardCardConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  badge?: string | number;
  stats?: string;
  visible: boolean;
  order: number;
}

interface DashboardCardSettingsProps {
  opened: boolean;
  onClose: () => void;
  cards: DashboardCardConfig[];
  onSave: (cards: DashboardCardConfig[]) => void;
}

interface SortableCardItemProps {
  card: DashboardCardConfig;
  onToggle: (id: string) => void;
}

function SortableCardItem({ card, onToggle }: SortableCardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

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

        {/* アイコン */}
        <ThemeIcon
          size={48}
          radius="md"
          variant="light"
          color={card.color}
        >
          {card.icon}
        </ThemeIcon>

        {/* カード情報 */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm" lineClamp={1}>
            {card.title}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {card.description}
          </Text>
        </Box>

        {/* 表示/非表示スイッチ */}
        <Switch
          checked={card.visible}
          onChange={() => onToggle(card.id)}
          size="md"
          color={card.color}
          onLabel={<IconEye size={14} />}
          offLabel={<IconEyeOff size={14} />}
        />
      </Group>
    </Paper>
  );
}

export function DashboardCardSettings({
  opened,
  onClose,
  cards,
  onSave,
}: DashboardCardSettingsProps) {
  const [localCards, setLocalCards] = useState<DashboardCardConfig[]>(
    [...cards].sort((a, b) => a.order - b.order)
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
      setLocalCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 順序を更新
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  const handleToggle = (id: string) => {
    setLocalCards((items) =>
      items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleSave = () => {
    onSave(localCards);
    onClose();
  };

  const handleReset = () => {
    setLocalCards([...cards].sort((a, b) => a.order - b.order));
  };

  const visibleCount = localCards.filter((card) => card.visible).length;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="ホーム画面のカスタマイズ"
      size="lg"
      centered
    >
      <Stack gap="lg">
        {/* 説明 */}
        <Card p="md" withBorder bg="blue.0">
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              📱 カードの表示をカスタマイズ
            </Text>
            <Text size="xs" c="dimmed">
              • スイッチでカードの表示/非表示を切り替え
            </Text>
            <Text size="xs" c="dimmed">
              • ハンドルをドラッグして並び順を変更
            </Text>
            <Text size="xs" c="dimmed">
              • 設定は自動的に保存されます
            </Text>
          </Stack>
        </Card>

        {/* 表示カード数 */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            表示中: <Text span fw={600} c="blue">{visibleCount}</Text> / {localCards.length} 件
          </Text>
        </Group>

        {/* カードリスト */}
        <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localCards.map((card) => card.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap="sm">
                {localCards.map((card) => (
                  <SortableCardItem
                    key={card.id}
                    card={card}
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
            onClick={handleReset}
          >
            リセット
          </Button>
          <Group gap="sm">
            <Button
              variant="light"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
            >
              保存
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
