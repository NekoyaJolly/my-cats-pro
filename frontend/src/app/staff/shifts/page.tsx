'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  ScrollArea,
  Card,
  Avatar,
  ActionIcon,
} from '@mantine/core';
import { IconPlus, IconClock, IconUser } from '@tabler/icons-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { notifications } from '@mantine/notifications';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable, EventReceiveArg } from '@fullcalendar/interaction';
import { useEffect, useRef } from 'react';
import type { EventDropArg, EventClickArg } from '@fullcalendar/core';

// スタッフデータ型定義
interface Staff {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar?: string;
}

// シフトテンプレート型定義
interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  description: string;
}

// カレンダーイベント型定義
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  extendedProps: {
    staffId: string;
    templateId: string;
  };
}

// サンプルデータ
const mockStaff: Staff[] = [
  { id: 'staff-1', name: '田中 花子', role: 'ブリーダー', color: '#4c6ef5' },
  { id: 'staff-2', name: '佐藤 太郎', role: 'アシスタント', color: '#f06595' },
  { id: 'staff-3', name: '鈴木 次郎', role: 'ケアスタッフ', color: '#20c997' },
  { id: 'staff-4', name: '山田 美咲', role: 'ブリーダー', color: '#fd7e14' },
];

const shiftTemplates: ShiftTemplate[] = [
  {
    id: 'template-1',
    name: '午前シフト',
    startTime: '09:00',
    endTime: '13:00',
    color: '#4dabf7',
    description: '9:00 - 13:00',
  },
  {
    id: 'template-2',
    name: '午後シフト',
    startTime: '13:00',
    endTime: '18:00',
    color: '#fab005',
    description: '13:00 - 18:00',
  },
  {
    id: 'template-3',
    name: '終日シフト',
    startTime: '09:00',
    endTime: '18:00',
    color: '#51cf66',
    description: '9:00 - 18:00',
  },
  {
    id: 'template-4',
    name: '夜間シフト',
    startTime: '18:00',
    endTime: '22:00',
    color: '#845ef7',
    description: '18:00 - 22:00',
  },
];

export default function StaffShiftsPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [eventCount, setEventCount] = useState(0);
  const processingEventRef = useRef<Set<string>>(new Set());

  // ドラッグセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // FullCalendarの外部ドラッグ初期化
  useEffect(() => {
    let staffDraggable: Draggable | null = null;
    let templateDraggable: Draggable | null = null;

    // スタッフカードのドラッグ初期化
    const staffListElement = document.getElementById('staff-list');
    const staffElements = document.querySelectorAll('.draggable-staff');
    if (staffListElement && staffElements.length > 0) {
      staffDraggable = new Draggable(staffListElement, {
        itemSelector: '.draggable-staff',
        eventData: function (eventEl: HTMLElement) {
          const staffId = eventEl.getAttribute('data-staff-id') || '';
          const staffName = eventEl.getAttribute('data-staff-name') || '';
          const staffColor = eventEl.getAttribute('data-staff-color') || '#4c6ef5';
          return {
            title: staffName,
            backgroundColor: staffColor,
            extendedProps: {
              staffId: staffId,
              templateId: 'template-3', // デフォルトで終日シフト
            },
          };
        },
      });
    }

    // シフトテンプレートのドラッグ初期化
    const templateListElement = document.getElementById('template-list');
    const templateElements = document.querySelectorAll('.draggable-template');
    if (templateListElement && templateElements.length > 0) {
      templateDraggable = new Draggable(templateListElement, {
        itemSelector: '.draggable-template',
        eventData: function (eventEl: HTMLElement) {
          const templateId = eventEl.getAttribute('data-template-id') || '';
          const template = shiftTemplates.find((t) => t.id === templateId);
          return {
            title: template?.name || '',
            backgroundColor: template?.color,
            duration: { hours: 4 }, // デフォルト期間
            extendedProps: {
              templateId: templateId,
            },
          };
        },
      });
    }

    // クリーンアップ関数
    return () => {
      if (staffDraggable) {
        staffDraggable.destroy();
      }
      if (templateDraggable) {
        templateDraggable.destroy();
      }
    };
  }, []);

  // カレンダーへのイベント追加
  const handleEventReceive = (info: EventReceiveArg) => {
    // イベントの一意なキーを生成
    const eventKey = `${info.event.title}-${info.event.startStr}`;
    
    // 既に処理中の場合はスキップ
    if (processingEventRef.current.has(eventKey)) {
      info.revert();
      return;
    }
    
    // 処理中としてマーク
    processingEventRef.current.add(eventKey);
    
    // 500ms後にマークをクリア（同じイベントの再ドロップを許可）
    setTimeout(() => {
      processingEventRef.current.delete(eventKey);
    }, 500);
    
    // FullCalendarが既にイベントを追加しているので、通知のみ表示
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setEventCount(calendarApi.getEvents().length);
    }
    
    notifications.show({
      title: 'シフト追加',
      message: `${info.event.title}のシフトを追加しました`,
      color: 'green',
    });
  };

  // イベント削除
  const handleEventClick = (info: EventClickArg) => {
    if (confirm(`${info.event.title}のシフトを削除しますか?`)) {
      info.event.remove();
      
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        setEventCount(calendarApi.getEvents().length);
      }
      
      notifications.show({
        title: 'シフト削除',
        message: `${info.event.title}のシフトを削除しました`,
        color: 'blue',
      });
    }
  };

  // イベント移動
  const handleEventDrop = (info: EventDropArg) => {
    notifications.show({
      title: 'シフト変更',
      message: `${info.event.title}のシフトを変更しました`,
      color: 'blue',
    });
  };

  return (
    <Box p="md">
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between">
          <div>
            <Title order={2}>スタッフシフト管理</Title>
            <Text size="sm" c="dimmed" mt={4}>
              スタッフとシフトテンプレートをカレンダーにドラッグ&ドロップしてシフトを作成
            </Text>
          </div>
          <Group>
            <Button leftSection={<IconPlus size={16} />} variant="light">
              スタッフ追加
            </Button>
            <Button leftSection={<IconPlus size={16} />}>シフト保存</Button>
          </Group>
        </Group>

        {/* メインコンテンツ: 3カラムレイアウト */}
        <Group align="flex-start" gap="md" style={{ height: 'calc(100vh - 200px)' }}>
          {/* 左サイドバー: スタッフリスト */}
          <Paper
            withBorder
            p="md"
            style={{
              width: 250,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">
                <IconUser size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                スタッフ一覧
              </Text>
              <ActionIcon size="sm" variant="light">
                <IconPlus size={14} />
              </ActionIcon>
            </Group>

            <ScrollArea style={{ flex: 1 }} id="staff-list">
              <Stack gap="xs">
                {mockStaff.map((staff) => (
                  <Card
                    key={staff.id}
                    className="draggable-staff"
                    data-staff-id={staff.id}
                    data-staff-name={staff.name}
                    data-staff-color={staff.color}
                    p="sm"
                    withBorder
                    style={{
                      cursor: 'grab',
                      transition: 'all 0.2s',
                      borderColor: staff.color,
                      borderWidth: 2,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-2px)',
                        },
                      },
                    }}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color={staff.color} radius="xl" size="sm">
                        {staff.name.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>
                          {staff.name}
                        </Text>
                        <Badge size="xs" variant="light" color={staff.color}>
                          {staff.role}
                        </Badge>
                      </div>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>

          {/* 中央: カレンダー */}
          <Paper
            withBorder
            p="md"
            style={{
              flex: 1,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ja"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek',
              }}
              buttonText={{
                today: '今日',
                month: '月',
                week: '週',
              }}
              height="100%"
              editable={true}
              droppable={true}
              eventReceive={handleEventReceive}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
            />
          </Paper>

          {/* 右サイドバー: シフトテンプレート */}
          <Paper
            withBorder
            p="md"
            style={{
              width: 250,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">
                <IconClock size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                シフトテンプレート
              </Text>
              <ActionIcon size="sm" variant="light">
                <IconPlus size={14} />
              </ActionIcon>
            </Group>

            <ScrollArea style={{ flex: 1 }} id="template-list">
              <Stack gap="xs">
                {shiftTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="draggable-template"
                    data-template-id={template.id}
                    p="sm"
                    withBorder
                    style={{
                      cursor: 'grab',
                      transition: 'all 0.2s',
                      borderColor: template.color,
                      borderWidth: 2,
                      backgroundColor: `${template.color}10`,
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-2px)',
                        },
                      },
                    }}
                  >
                    <Stack gap={4}>
                      <Text size="sm" fw={600} c={template.color}>
                        {template.name}
                      </Text>
                      <Group gap="xs">
                        <IconClock size={14} color={template.color} />
                        <Text size="xs" c="dimmed">
                          {template.description}
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>

            {/* 統計情報 */}
            <Box mt="md" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
              <Text size="xs" fw={600} mb="xs" c="dimmed">
                今月の統計
              </Text>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="xs">登録シフト数</Text>
                  <Badge size="sm" variant="light">
                    {eventCount}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="xs">スタッフ数</Text>
                  <Badge size="sm" variant="light">
                    {mockStaff.length}
                  </Badge>
                </Group>
              </Stack>
            </Box>
          </Paper>
        </Group>
      </Stack>
    </Box>
  );
}
