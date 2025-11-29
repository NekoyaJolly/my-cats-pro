'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Text,
  Group,
  Stack,
  Button,
  Paper,
  Card,
  Avatar,
  Modal,
  TextInput,
  ColorInput,
  ScrollArea,
  LoadingOverlay,
  Alert,
  Badge,
  ActionIcon,
  Menu,
  Checkbox,
  NumberInput,
  Textarea,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconUser,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconDeviceFloppy,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable, EventReceiveArg } from '@fullcalendar/interaction';
import type { EventDropArg, EventClickArg } from '@fullcalendar/core';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { apiClient, ApiError } from '@/lib/api/typesafe-client';
import type {
  StaffResponseDto,
  CreateStaffRequest,
  UpdateStaffRequest,
  CalendarShiftEvent,
  Weekday,
  WorkTimeTemplate,
} from '@/types/api.types';

/**
 * 共通バリデーション関数
 */
const validateName = (value: string | undefined): string | null => {
  return !value ? '名前は必須です' : null;
};

const validateColor = (value: string | undefined): string | null => {
  if (!value) return 'カラーは必須です';
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return 'カラーコードは#000000形式で指定してください';
  }
  return null;
};

const validateWorkingDays = (value: Weekday[] | undefined): string | null => {
  return !value || value.length === 0 ? '少なくとも1つの出勤曜日を選択してください' : null;
};

const validateWorkTimeTemplate = (value: WorkTimeTemplate | undefined): string | null => {
  if (!value) return null;
  const { startHour, endHour } = value;
  // NumberInput は 0 を含む数値または NaN を返す可能性があるため、型チェックで検証
  if (
    typeof startHour !== 'number' ||
    typeof endHour !== 'number' ||
    Number.isNaN(startHour) ||
    Number.isNaN(endHour)
  ) {
    return '開始／終了時間を入力してください';
  }
  if (startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24) {
    return '開始時間は0〜23、終了時間は1〜24の範囲で指定してください';
  }
  if (endHour <= startHour) {
    return '終了時間は開始時間より後にしてください';
  }
  return null;
};

export default function StaffShiftsPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const { setPageHeader } = usePageHeader();
  useRouter();

  // State管理
  const [staffList, setStaffList] = useState<StaffResponseDto[]>([]);
  const [shifts, setShifts] = useState<CalendarShiftEvent[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル制御
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // スタッフ作成フォーム
  // フォームでは workingDays と workTimeTemplate を必須として扱う
  // APIへ送信時はそのまま CreateStaffRequest として使用可能（オプショナルフィールドのため）
  const createForm = useForm<
    Omit<CreateStaffRequest, 'workingDays' | 'workTimeTemplate'> & {
      workingDays: Weekday[];
      workTimeTemplate: WorkTimeTemplate;
    }
  >({
    initialValues: {
      name: '',
      email: null,
      role: 'スタッフ',
      color: '#4dabf7',
      workingDays: [],
      workTimeTemplate: { startHour: 9, endHour: 18 },
    },
    validate: {
      name: validateName,
      color: validateColor,
      workingDays: validateWorkingDays,
      workTimeTemplate: validateWorkTimeTemplate,
    },
  });

  // スタッフ編集フォーム
  // フォームでは workingDays と workTimeTemplate を必須として扱う
  // APIへ送信時はそのまま UpdateStaffRequest として使用可能（オプショナルフィールドのため）
  const editForm = useForm<
    Omit<UpdateStaffRequest, 'workingDays' | 'workTimeTemplate'> & {
      workingDays: Weekday[];
      workTimeTemplate: WorkTimeTemplate;
    }
  >({
    initialValues: {
      name: '',
      email: null,
      role: 'スタッフ',
      color: '#4dabf7',
      workingDays: [],
      workTimeTemplate: { startHour: 9, endHour: 18 },
    },
    validate: {
      name: validateName,
      color: validateColor,
      workingDays: validateWorkingDays,
      workTimeTemplate: validateWorkTimeTemplate,
    },
  });

  // ページヘッダー設定
  useEffect(() => {
    setPageHeader(
      'スタッフシフト管理',
      <Group gap="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          variant="filled"
          color="blue"
          onClick={openCreate}
        >
          スタッフ追加
        </Button>
      </Group>
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初期データ取得
  useEffect(() => {
    fetchInitialData();
  }, []);

  // ドラッグ可能な要素の初期化
  useEffect(() => {
    let draggable: Draggable | null = null;

    const staffListElement = document.getElementById('staff-list');
    if (staffListElement && staffList.length > 0) {
      draggable = new Draggable(staffListElement, {
        itemSelector: '.draggable-staff',
        eventData: function (eventEl: HTMLElement) {
          const staffId = eventEl.getAttribute('data-staff-id') || '';
          const staffName = eventEl.getAttribute('data-staff-name') || '';
          const staffColor = eventEl.getAttribute('data-staff-color') || '#4c6ef5';
          return {
            title: staffName,
            backgroundColor: staffColor,
            borderColor: staffColor,
            extendedProps: {
              staffId: staffId,
              staffName: staffName,
            },
          };
        },
      });
    }

    return () => {
      if (draggable) {
        draggable.destroy();
      }
    };
  }, [staffList]);

  /**
   * 初期データ取得
   */
  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // スタッフ一覧を取得
      const staffData = await apiClient.getStaffList();
      setStaffList(staffData.staffList);

      // 今月のシフトデータを取得
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      const shiftsData = await apiClient.getCalendarShifts({ startDate, endDate });
      setShifts(shiftsData);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'データの取得に失敗しました';
      setError(errorMessage);
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * スタッフ作成
   */
  const handleCreateStaff = async (values: CreateStaffRequest) => {
    setOperationLoading(true);

    try {
      const newStaff = await apiClient.createStaff(values);
      setStaffList((prev) => [...prev, newStaff]);

      notifications.show({
        title: 'スタッフ作成成功',
        message: `${newStaff.name}を追加しました`,
        color: 'green',
      });

      closeCreate();
      createForm.reset();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'スタッフの作成に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * スタッフ編集
   */
  const handleEditStaff = async (values: UpdateStaffRequest) => {
    if (!selectedStaff) return;

    setOperationLoading(true);

    try {
      const updatedStaff = await apiClient.updateStaff(selectedStaff.id, values);
      setStaffList((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));

      notifications.show({
        title: 'スタッフ更新成功',
        message: `${updatedStaff.name}の情報を更新しました`,
        color: 'green',
      });

      closeEdit();
      setSelectedStaff(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'スタッフの更新に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * スタッフ削除
   */
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    setOperationLoading(true);

    try {
      await apiClient.deleteStaff(selectedStaff.id);
      setStaffList((prev) => prev.filter((s) => s.id !== selectedStaff.id));

      notifications.show({
        title: 'スタッフ削除成功',
        message: `${selectedStaff.name}を削除しました`,
        color: 'blue',
      });

      closeDelete();
      setSelectedStaff(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'スタッフの削除に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * 編集モーダルを開く
   */
  const openEditModal = (staff: StaffResponseDto) => {
    setSelectedStaff(staff);
    editForm.setValues({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      color: staff.color,
      workingDays: staff.workingDays ?? [],
      workTimeTemplate: staff.workTimeTemplate ?? { startHour: 9, endHour: 18 },
    });
    openEdit();
  };

  /**
   * 削除モーダルを開く
   */
  const openDeleteModal = (staff: StaffResponseDto) => {
    setSelectedStaff(staff);
    openDelete();
  };

  /**
   * カレンダーへのドロップイベント
   */
  const handleEventReceive = async (info: EventReceiveArg) => {
    const staffId = info.event.extendedProps.staffId;
    const shiftDate = info.event.startStr.split('T')[0]; // YYYY-MM-DD

    try {
      const newShift = await apiClient.createShift({
        staffId,
        shiftDate,
      });

      // カレンダーイベントを更新
      info.event.setExtendedProp('shiftId', newShift.id);

      // シフトリストを更新
      await refreshShifts();

      notifications.show({
        title: 'シフト作成成功',
        message: `${info.event.title}のシフトを追加しました`,
        color: 'green',
      });
    } catch (err) {
      info.revert(); // ドロップを元に戻す
      const errorMessage = err instanceof ApiError ? err.message : 'シフトの作成に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  /**
   * カレンダーイベントの移動
   */
  const handleEventDrop = async (info: EventDropArg) => {
    const shiftId = info.event.extendedProps.shiftId;
    if (!shiftId) {
      info.revert();
      return;
    }

    const newShiftDate = info.event.startStr.split('T')[0]; // YYYY-MM-DD

    try {
      await apiClient.updateShift(shiftId, { shiftDate: newShiftDate });

      notifications.show({
        title: 'シフト変更成功',
        message: `${info.event.title}のシフトを変更しました`,
        color: 'blue',
      });
    } catch (err) {
      info.revert(); // 移動を元に戻す
      const errorMessage = err instanceof ApiError ? err.message : 'シフトの変更に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  /**
   * カレンダーイベントのクリック（削除）
   */
  const handleEventClick = async (info: EventClickArg) => {
    const shiftId = info.event.extendedProps.shiftId;
    if (!shiftId) return;

    if (confirm(`${info.event.title}のシフトを削除しますか?`)) {
      try {
        await apiClient.deleteShift(shiftId);
        info.event.remove();

        notifications.show({
          title: 'シフト削除成功',
          message: `${info.event.title}のシフトを削除しました`,
          color: 'blue',
        });
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'シフトの削除に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    }
  };

  /**
   * シフトデータを再取得
   */
  const refreshShifts = async () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    const view = calendarApi.view;
    const startDate = view.activeStart.toISOString().split('T')[0];
    const endDate = view.activeEnd.toISOString().split('T')[0];

    try {
      const shiftsData = await apiClient.getCalendarShifts({ startDate, endDate });
      setShifts(shiftsData);
    } catch (err) {
      console.error('シフトの再取得に失敗:', err);
    }
  };

  /**
   * シフトテキスト生成
   */
  const weekdayLabelJa = ['日', '月', '火', '水', '木', '金', '土'];

  /**
   * シフトイベントからスタッフ名を取得
   * FullCalendar イベントでは title にスタッフ名が設定されるが、
   * フォールバックとして extendedProps.staffName も確認する
   */
  const getStaffNameFromShift = (shift: CalendarShiftEvent): string => {
    return shift.title ?? shift.extendedProps?.staffName ?? '';
  };

  /**
   * Date オブジェクトをタイムゾーンに依存しない YYYY-MM-DD 形式に変換
   * toISOString() は UTC に変換されるため、ローカル日付を正しく取得するために
   * 年月日を個別に取得して文字列化する
   */
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateShiftText = (): string => {
    if (!shifts || shifts.length === 0) return '';

    const map = new Map<string, string[]>();

    shifts.forEach((shift) => {
      const start = shift.start;
      if (!start) return;

      const date = new Date(start);
      if (Number.isNaN(date.getTime())) return;

      const dateKey = formatDateKey(date);
      const staffName = getStaffNameFromShift(shift);
      if (!staffName) return;

      const list = map.get(dateKey) ?? [];
      list.push(staffName);
      map.set(dateKey, list);
    });

    const sortedKeys = Array.from(map.keys()).sort();

    const lines = sortedKeys
      .map((dateKey) => {
        const date = new Date(dateKey);
        // 不正な日付をスキップ
        if (Number.isNaN(date.getTime())) return null;
        const day = date.getDate();
        const weekday = weekdayLabelJa[date.getDay()];
        const staffNames = map.get(dateKey) ?? [];
        return `${day}日(${weekday}) ${staffNames.join(' ')}`;
      })
      .filter((line): line is string => line !== null);

    return lines.join('\n');
  };

  if (error && !loading) {
    return (
      <Container size="xl" py="md">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="エラー"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <LoadingOverlay visible={loading} />

      <Alert
        icon={<IconAlertCircle size="1rem" />}
        title="シフトの自動保存について"
        color="blue"
        variant="light"
        mb="md"
      >
        カレンダーへのドラッグ・移動・削除の操作は、すべて自動的に保存されます。そのため、別途「保存」ボタンを押す必要はありません。
      </Alert>

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
              label="メールアドレス（任意）"
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

            <Checkbox.Group
              label="出勤曜日"
              description="通常出勤する曜日を選択してください"
              {...createForm.getInputProps('workingDays')}
            >
              <Group mt="xs">
                <Checkbox value="mon" label="月" />
                <Checkbox value="tue" label="火" />
                <Checkbox value="wed" label="水" />
                <Checkbox value="thu" label="木" />
                <Checkbox value="fri" label="金" />
                <Checkbox value="sat" label="土" />
                <Checkbox value="sun" label="日" />
              </Group>
            </Checkbox.Group>

            <Group grow>
              <NumberInput
                label="出勤開始時刻（テンプレート）"
                description="0〜23の範囲で入力（例: 9）"
                min={0}
                max={23}
                step={1}
                suffix=" 時"
                {...createForm.getInputProps('workTimeTemplate.startHour')}
              />
              <NumberInput
                label="出勤終了時刻（テンプレート）"
                description="1〜24の範囲で入力（例: 18）"
                min={1}
                max={24}
                step={1}
                suffix=" 時"
                {...createForm.getInputProps('workTimeTemplate.endHour')}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={closeCreate}
                disabled={operationLoading}
                leftSection={<IconX size={16} />}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                loading={operationLoading}
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
              label="メールアドレス（任意）"
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

            <Checkbox.Group
              label="出勤曜日"
              description="通常出勤する曜日を選択してください"
              {...editForm.getInputProps('workingDays')}
            >
              <Group mt="xs">
                <Checkbox value="mon" label="月" />
                <Checkbox value="tue" label="火" />
                <Checkbox value="wed" label="水" />
                <Checkbox value="thu" label="木" />
                <Checkbox value="fri" label="金" />
                <Checkbox value="sat" label="土" />
                <Checkbox value="sun" label="日" />
              </Group>
            </Checkbox.Group>

            <Group grow>
              <NumberInput
                label="出勤開始時刻（テンプレート）"
                description="0〜23の範囲で入力（例: 9）"
                min={0}
                max={23}
                step={1}
                suffix=" 時"
                {...editForm.getInputProps('workTimeTemplate.startHour')}
              />
              <NumberInput
                label="出勤終了時刻（テンプレート）"
                description="1〜24の範囲で入力（例: 18）"
                min={1}
                max={24}
                step={1}
                suffix=" 時"
                {...editForm.getInputProps('workTimeTemplate.endHour')}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={closeEdit}
                disabled={operationLoading}
                leftSection={<IconX size={16} />}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                loading={operationLoading}
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
      <Modal opened={deleteOpened} onClose={closeDelete} title="スタッフ削除" size="sm">
        <Stack gap="md">
          <Text>{selectedStaff?.name} を削除してもよろしいですか?</Text>
          <Text size="sm" c="dimmed">
            この操作は取り消せません。
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={closeDelete}
              disabled={operationLoading}
              leftSection={<IconX size={16} />}
            >
              キャンセル
              </Button>
            <Button
              onClick={handleDeleteStaff}
              loading={operationLoading}
              variant="filled"
              color="red"
              leftSection={<IconTrash size={16} />}
            >
              削除
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* メインコンテンツ: カンバンビューレイアウト */}
      <Group align="flex-start" gap="md" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 左サイドバー: スタッフ一覧 */}
        <Paper
          withBorder
          p="md"
          style={{
            width: 280,
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
            <Badge size="sm" variant="light">
              {staffList.length}人
            </Badge>
          </Group>

          <Text size="xs" c="dimmed" mb="md">
            スタッフをカレンダーにドラッグ
          </Text>

          <ScrollArea style={{ flex: 1 }} id="staff-list">
            <Stack gap="xs">
              {staffList.map((staff) => (
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
                            openEditModal(staff);
                          }}
                        >
                          編集
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={16} />}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(staff);
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

        {/* 右サイド: カレンダーとテキストエクスポート */}
        <Stack style={{ flex: 1, height: '100%' }} gap="md">
          {/* テキストエクスポート */}
          <Paper withBorder p="md">
            <Group justify="space-between" align="flex-start" mb="xs">
              <Text fw={600} size="sm">
                テキスト形式シフト一覧
              </Text>
              <CopyButton value={generateShiftText()} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'コピーしました' : 'コピー'}>
                    <Button
                      size="xs"
                      variant="light"
                      color={copied ? 'teal' : 'blue'}
                      onClick={copy}
                    >
                      {copied ? 'コピー済み' : 'コピー'}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              value={generateShiftText()}
              readOnly
              autosize
              minRows={3}
              maxRows={10}
              placeholder="カレンダーに登録されたシフトが、ここにテキストとして表示されます。"
            />
          </Paper>

          {/* カレンダー */}
          <Paper
            withBorder
            p="md"
            style={{
              flex: 1,
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
              events={shifts}
              eventReceive={handleEventReceive}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
            />
          </Paper>
        </Stack>
      </Group>
    </Container>
  );
}
