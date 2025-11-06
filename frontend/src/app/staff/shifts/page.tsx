'use client';

import { useState, useEffect } from 'react';
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
  Modal,
  TextInput,
  ColorInput,
  Menu,
  Container,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconPlus, 
  IconClock, 
  IconUser, 
  IconEdit, 
  IconTrash,
  IconDotsVertical,
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';
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
import { useRef } from 'react';
import type { EventDropArg, EventClickArg } from '@fullcalendar/core';
import { usePageHeader } from '@/lib/contexts/page-header-context';

// スタッフデータ型定義
interface Staff {
  id: string;
  name: string;
  email?: string;
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
const initialMockStaff: Staff[] = [
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
  const { setPageHeader } = usePageHeader();
  
  // スタッフデータの状態管理
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // モーダル表示制御
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  
  // 作成フォーム設定
  const createForm = useForm({
    initialValues: {
      name: '',
      email: '',
      role: 'スタッフ',
      color: '#4dabf7',
    },
    validate: {
      name: (value) => (!value ? '名前は必須です' : null),
    },
  });

  // 編集フォーム設定
  const editForm = useForm({
    initialValues: {
      name: '',
      email: '',
      role: 'スタッフ',
      color: '#4dabf7',
    },
    validate: {
      name: (value) => (!value ? '名前は必須です' : null),
    },
  });

  // ドラッグセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // スタッフ作成処理
  const handleCreateStaff = async (values: typeof createForm.values) => {
    setLoading(true);
    
    try {
      // 空文字のフィールドを除外
      const payload: {
        name: string;
        role: string;
        color: string;
        email?: string;
      } = {
        name: values.name,
        role: values.role,
        color: values.color,
      };
      
      // メールアドレスが入力されている場合のみ追加
      if (values.email && values.email.trim()) {
        payload.email = values.email;
      }
      
      const response = await fetch('http://localhost:3004/api/v1/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'サーバーエラー' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `スタッフの作成に失敗しました (${response.status})`);
      }

      const result = await response.json();
      const newStaff = result.data || result;
      
      // スタッフリストに追加
      setStaff((prev) => [...prev, newStaff]);
      
      // 成功通知
      notifications.show({
        title: 'スタッフ作成成功',
        message: `${newStaff.name}を追加しました`,
        color: 'green',
      });
      
      // モーダルを閉じてフォームをリセット
      closeCreate();
      createForm.reset();
    } catch (error) {
      console.error('スタッフ作成エラー:', error);
      notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : 'スタッフの作成に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // スタッフ編集処理
  const handleEditStaff = async (values: typeof editForm.values) => {
    if (!selectedStaff) return;
    
    setLoading(true);
    
    try {
      // 空文字のフィールドを除外
      const payload: {
        name: string;
        role: string;
        color: string;
        email?: string;
      } = {
        name: values.name,
        role: values.role,
        color: values.color,
      };
      
      // メールアドレスが入力されている場合のみ追加
      if (values.email && values.email.trim()) {
        payload.email = values.email;
      }
      
      const response = await fetch(`http://localhost:3004/api/v1/staff/${selectedStaff.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'スタッフの更新に失敗しました');
      }

      const result = await response.json();
      const updatedStaff = result.data || result;
      
      // スタッフリストを更新
      setStaff((prev) =>
        prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
      );
      
      // 成功通知
      notifications.show({
        title: 'スタッフ更新成功',
        message: `${updatedStaff.name}の情報を更新しました`,
        color: 'green',
      });
      
      // モーダルを閉じる
      closeEdit();
      setSelectedStaff(null);
    } catch (error) {
      console.error('スタッフ更新エラー:', error);
      notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : 'スタッフの更新に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // スタッフ削除処理
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3004/api/v1/staff/${selectedStaff.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'スタッフの削除に失敗しました');
      }
      
      // スタッフリストから削除
      setStaff((prev) => prev.filter((s) => s.id !== selectedStaff.id));
      
      // 成功通知
      notifications.show({
        title: 'スタッフ削除成功',
        message: `${selectedStaff.name}を削除しました`,
        color: 'blue',
      });
      
      // モーダルを閉じる
      closeDelete();
      setSelectedStaff(null);
    } catch (error) {
      console.error('スタッフ削除エラー:', error);
      notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : 'スタッフの削除に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // 編集モーダルを開く
  const openEditModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    editForm.setValues({
      name: staffMember.name,
      email: staffMember.email || '',
      role: staffMember.role,
      color: staffMember.color,
    });
    openEdit();
  };

  // 削除モーダルを開く
  const openDeleteModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    openDelete();
  };

  // 初期データ取得
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('http://localhost:3004/api/v1/staff');
        if (!response.ok) {
          throw new Error('スタッフデータの取得に失敗しました');
        }
        const result = await response.json();
        const staffData = result.data || result;
        
        // バックエンドのスタッフデータをフロントエンドの形式に変換
        const formattedStaff: Staff[] = staffData.map((s: {
          id: string;
          name: string;
          email: string | null;
          role: string;
          color: string;
        }) => ({
          id: s.id,
          name: s.name,
          email: s.email || undefined,
          role: s.role,
          color: s.color,
        }));
        
        setStaff(formattedStaff);
      } catch (error) {
        console.error('スタッフデータ取得エラー:', error);
        notifications.show({
          title: 'エラー',
          message: 'スタッフデータの取得に失敗しました',
          color: 'red',
        });
        // エラー時はモックデータを使用
        setStaff(initialMockStaff);
      }
    };

    fetchStaff();
  }, []);

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      'スタッフシフト管理',
      <Group gap="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          variant="outline"
          color="blue"
          onClick={openCreate}
        >
          スタッフ追加
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="filled"
          color="blue"
        >
          シフト保存
        </Button>
      </Group>
    );

    // クリーンアップ
    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [staff]); // staffが変更されたら再初期化

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
    <Container size="xl" py="md">
      <Stack gap="md">
        {/* 説明文 */}
        <Text size="sm" c="dimmed">
          スタッフとシフトテンプレートをカレンダーにドラッグ&ドロップしてシフトを作成
        </Text>

        {/* スタッフ作成モーダル */}
        <Modal opened={createOpened} onClose={closeCreate} title="スタッフ追加" size="md">
          <form onSubmit={createForm.onSubmit(handleCreateStaff)}>
            <Stack gap="md">
              <TextInput
                label="名前"
                placeholder="田中 太郎"
                required
                {...createForm.getInputProps('name')}
              />
              
              <TextInput
                label="メールアドレス"
                placeholder="tanaka@example.com"
                type="email"
                {...createForm.getInputProps('email')}
              />
              
              <TextInput
                label="役職"
                placeholder="スタッフ"
                {...createForm.getInputProps('role')}
              />
              
              <ColorInput
                label="表示カラー"
                placeholder="カラーを選択"
                format="hex"
                swatches={[
                  '#4c6ef5',
                  '#f06595',
                  '#20c997',
                  '#fd7e14',
                  '#fab005',
                  '#51cf66',
                  '#4dabf7',
                  '#845ef7',
                  '#ff6b6b',
                  '#74c0fc',
                ]}
                {...createForm.getInputProps('color')}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={closeCreate}
                  disabled={loading}
                  leftSection={<IconX size={16} />}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  variant="filled"
                  color="blue"
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  作成
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* スタッフ編集モーダル */}
        <Modal opened={editOpened} onClose={closeEdit} title="スタッフ編集" size="md">
          <form onSubmit={editForm.onSubmit(handleEditStaff)}>
            <Stack gap="md">
              <TextInput
                label="名前"
                placeholder="田中 太郎"
                required
                {...editForm.getInputProps('name')}
              />
              
              <TextInput
                label="メールアドレス"
                placeholder="tanaka@example.com"
                type="email"
                {...editForm.getInputProps('email')}
              />
              
              <TextInput
                label="役職"
                placeholder="スタッフ"
                {...editForm.getInputProps('role')}
              />
              
              <ColorInput
                label="表示カラー"
                placeholder="カラーを選択"
                format="hex"
                swatches={[
                  '#4c6ef5',
                  '#f06595',
                  '#20c997',
                  '#fd7e14',
                  '#fab005',
                  '#51cf66',
                  '#4dabf7',
                  '#845ef7',
                  '#ff6b6b',
                  '#74c0fc',
                ]}
                {...editForm.getInputProps('color')}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={closeEdit}
                  disabled={loading}
                  leftSection={<IconX size={16} />}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  variant="filled"
                  color="blue"
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  保存
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* スタッフ削除確認モーダル */}
        <Modal
          opened={deleteOpened}
          onClose={closeDelete}
          title="スタッフ削除"
          size="sm"
        >
          <Stack gap="md">
            <Text>
              {selectedStaff?.name} を削除してもよろしいですか?
            </Text>
            <Text size="sm" c="dimmed">
              この操作は取り消せません。
            </Text>

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={closeDelete}
                disabled={loading}
                leftSection={<IconX size={16} />}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDeleteStaff}
                loading={loading}
                variant="filled"
                color="red"
                leftSection={<IconTrash size={16} />}
              >
                削除
              </Button>
            </Group>
          </Stack>
        </Modal>

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
              <ActionIcon size="sm" variant="light" color="blue" onClick={openCreate}>
                <IconPlus size={14} />
              </ActionIcon>
            </Group>

            <ScrollArea style={{ flex: 1 }} id="staff-list">
              <Stack gap="xs">
                {staff.map((staffMember) => (
                  <Card
                    key={staffMember.id}
                    className="draggable-staff"
                    data-staff-id={staffMember.id}
                    data-staff-name={staffMember.name}
                    data-staff-color={staffMember.color}
                    p="sm"
                    withBorder
                    style={{
                      cursor: 'grab',
                      transition: 'all 0.2s',
                      borderColor: staffMember.color,
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
                      <Avatar color={staffMember.color} radius="xl" size="sm">
                        {staffMember.name.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>
                          {staffMember.name}
                        </Text>
                        <Badge size="xs" variant="light" color={staffMember.color}>
                          {staffMember.role}
                        </Badge>
                      </div>
                      <Menu shadow="md" width={160}>
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(staffMember);
                            }}
                          >
                            編集
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(staffMember);
                            }}
                          >
                            削除
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
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
                    {staff.length}
                  </Badge>
                </Group>
              </Stack>
            </Box>
          </Paper>
        </Group>
      </Stack>
    </Container>
  );
}
