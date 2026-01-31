'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Text,
  Group,
  Stack,
  Button,
  Paper,
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
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useMediaQuery, useLocalStorage } from '@mantine/hooks';
import {
  IconPlus,
  IconUser,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconDeviceFloppy,
  IconX,
  IconAlertCircle,
  IconGripVertical,
  IconChevronDown,
  IconCalendarPlus,
  IconUsers,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ActionMenu } from '@/app/tenants/_components/ActionMenu';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable, EventReceiveArg } from '@fullcalendar/interaction';
import type { EventDropArg, EventClickArg, EventContentArg, DayCellContentArg } from '@fullcalendar/core';
import { UnifiedModal } from '@/components/common';
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

  // レスポンシブ判定（タブレット以下: 768px未満）
  const isMobile = useMediaQuery('(max-width: 768px)');

  // リサイズ可能なセクション幅/高さ（localStorageに保存）
  const [staffListWidth, setStaffListWidth] = useLocalStorage<number>({
    key: 'shift-staff-list-width',
    defaultValue: 200,
  });
  const [textShiftHeight, setTextShiftHeight] = useLocalStorage<number>({
    key: 'shift-text-shift-height',
    defaultValue: 200,
  });

  // リサイズ状態管理
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  // 横幅リサイズ開始
  const handleWidthResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingWidth(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: staffListWidth,
      startHeight: textShiftHeight,
    };
  }, [staffListWidth, textShiftHeight]);

  // 高さリサイズ開始
  const handleHeightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingHeight(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: staffListWidth,
      startHeight: textShiftHeight,
    };
  }, [staffListWidth, textShiftHeight]);

  // リサイズ中の処理
  useEffect(() => {
    if (!isResizingWidth && !isResizingHeight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;

      if (isResizingWidth) {
        const diff = e.clientX - resizeRef.current.startX;
        const newWidth = Math.max(150, Math.min(400, resizeRef.current.startWidth + diff));
        setStaffListWidth(newWidth);
      }

      if (isResizingHeight) {
        const diff = resizeRef.current.startY - e.clientY;
        const newHeight = Math.max(100, Math.min(400, resizeRef.current.startHeight + diff));
        setTextShiftHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
      setIsResizingHeight(false);
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingWidth, isResizingHeight, setStaffListWidth, setTextShiftHeight]);

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
  const [selectStaffOpened, { open: openSelectStaff, close: closeSelectStaff }] = useDisclosure(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // テンプレート入力用スタッフ選択
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // スタッフ作成フォーム
  // フォームでは workingDays と workTimeTemplate を必須として扱う
  // APIへ送信時はそのまま CreateStaffRequest として使用可能（オプショナルフィールドのため）
  const createForm = useForm<
    Omit<CreateStaffRequest, 'workingDays' | 'workTimeTemplate' | 'email'> & {
      workingDays: Weekday[];
      workTimeTemplate: WorkTimeTemplate;
      email: string;
    }
  >({
    initialValues: {
      name: '',
      email: '',
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
    Omit<UpdateStaffRequest, 'workingDays' | 'workTimeTemplate' | 'email'> & {
      workingDays: Weekday[];
      workTimeTemplate: WorkTimeTemplate;
      email: string;
    }
  >({
    initialValues: {
      name: '',
      email: '',
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
      <ActionMenu
        buttonLabel="操作"
        buttonIcon={IconPlus}
        action="create"
        items={[
          {
            id: 'add-staff',
            label: 'スタッフ追加',
            icon: <IconPlus size={16} />,
            onClick: openCreate,
          },
          {
            id: 'bulk-input',
            label: '全員一括入力',
            icon: <IconCalendarPlus size={16} />,
            onClick: handleBulkTemplateInput,
          },
          {
            id: 'select-input',
            label: '選択入力...',
            icon: <IconUsers size={16} />,
            onClick: openSelectStaff,
          }
        ]}
      />
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

    // isMobile が undefined の間（SSR / 初期レンダリング）はスキップ
    if (isMobile === undefined) return;

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
  }, [staffList, isMobile]);

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
  const handleCreateStaff = async (values: CreateStaffRequest & { workingDays: Weekday[]; workTimeTemplate: WorkTimeTemplate }) => {
    setOperationLoading(true);

    try {
      // 空文字列のフィールドをundefinedに変換（バリデーションエラー回避）
      const sanitizedValues = {
        ...values,
        email: values.email === '' ? undefined : values.email,
      };
      const newStaff = await apiClient.createStaff(sanitizedValues);
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
  const handleEditStaff = async (values: UpdateStaffRequest & { workingDays: Weekday[]; workTimeTemplate: WorkTimeTemplate }) => {
    if (!selectedStaff) return;

    setOperationLoading(true);

    try {
      // 空文字列のフィールドをundefinedに変換（バリデーションエラー回避）
      const sanitizedValues = {
        ...values,
        email: values.email === '' ? undefined : values.email,
      };
      const updatedStaff = await apiClient.updateStaff(selectedStaff.id, sanitizedValues);
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
      email: staff.email ?? '',
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
   * 曜日コードから日本の曜日インデックスへ変換
   * JavaScript の getDay(): 0=日, 1=月, 2=火, ... 6=土
   */
  const weekdayToJsDay: Record<Weekday, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  /**
   * テンプレート基準でシフトを一括入力（指定スタッフ）
   */
  const handleTemplateInput = async (targetStaffList: StaffResponseDto[]) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) {
      notifications.show({
        title: 'エラー',
        message: 'カレンダーが初期化されていません',
        color: 'red',
      });
      return;
    }

    // テンプレートが設定されていないスタッフをフィルタ
    const staffWithTemplate = targetStaffList.filter(
      (staff) => staff.workingDays && staff.workingDays.length > 0
    );

    if (staffWithTemplate.length === 0) {
      notifications.show({
        title: '警告',
        message: '出勤曜日が設定されているスタッフがいません',
        color: 'yellow',
      });
      return;
    }

    setOperationLoading(true);

    try {
      const view = calendarApi.view;
      const startDate = view.activeStart;
      const endDate = view.activeEnd;

      // 既存シフトの日付とスタッフIDのセットを作成（重複防止）
      const existingShiftKeys = new Set(
        shifts.map((shift) => {
          const shiftDate = shift.start ? formatDateKey(new Date(shift.start)) : '';
          const staffId = shift.extendedProps?.staffId ?? '';
          return `${shiftDate}_${staffId}`;
        })
      );

      // 生成するシフトのリスト
      const shiftsToCreate: { staffId: string; shiftDate: string; displayName: string | null }[] = [];

      // 表示範囲内の各日を走査
      const currentDate = new Date(startDate);
      while (currentDate < endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateKey = formatDateKey(currentDate);

        // 各スタッフについてチェック
        for (const staff of staffWithTemplate) {
          // このスタッフの出勤曜日に該当するか
          const workingDays = staff.workingDays ?? [];
          const isWorkingDay = workingDays.some(
            (wd) => weekdayToJsDay[wd as Weekday] === dayOfWeek
          );

          if (isWorkingDay) {
            const key = `${dateKey}_${staff.id}`;
            // 既存シフトがなければ追加対象
            if (!existingShiftKeys.has(key)) {
              // displayName: 時間テンプレートがあれば「9〜18」形式
              const displayName = staff.workTimeTemplate
                ? `${staff.workTimeTemplate.startHour}〜${staff.workTimeTemplate.endHour}`
                : null;

              shiftsToCreate.push({
                staffId: staff.id,
                shiftDate: dateKey,
                displayName,
              });
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (shiftsToCreate.length === 0) {
        notifications.show({
          title: '情報',
          message: '追加するシフトはありません（既に入力済み、または対象日がありません）',
          color: 'blue',
        });
        return;
      }

      // 並列でシフト作成（バッチ処理）
      const results = await Promise.allSettled(
        shiftsToCreate.map((shiftData) => apiClient.createShift(shiftData))
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failCount = results.filter((r) => r.status === 'rejected').length;

      // シフトデータを再取得
      await refreshShifts();

      if (failCount === 0) {
        notifications.show({
          title: 'シフト一括入力完了',
          message: `${successCount}件のシフトを追加しました`,
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'シフト一括入力完了（一部エラー）',
          message: `成功: ${successCount}件 / 失敗: ${failCount}件`,
          color: 'yellow',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'シフトの一括入力に失敗しました';
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
   * 全スタッフ一括入力
   */
  const handleBulkTemplateInput = () => {
    handleTemplateInput(staffList);
  };

  /**
   * 選択スタッフ入力
   */
  const handleSelectedTemplateInput = () => {
    const targetStaff = staffList.filter((s) => selectedStaffIds.includes(s.id));
    handleTemplateInput(targetStaff);
    closeSelectStaff();
    setSelectedStaffIds([]);
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
      <Container size="xl">
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
    <Container size="xl">
      <LoadingOverlay visible={loading} />

      {/* スタッフ作成モーダル */}
      <UnifiedModal
        opened={createOpened}
        onClose={closeCreate}
        title="スタッフ追加"
        size="md"
        sections={[
          {
            label: '基本情報',
            content: (
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
              </Stack>
            ),
          },
          {
            label: '出勤設定',
            content: (
              <>
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
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
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
                  onClick={() => {
                    createForm.validate();
                    if (createForm.isValid()) {
                      void handleCreateStaff(createForm.values);
                    }
                  }}
                  loading={operationLoading}
                  variant="filled"
                  color="blue"
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  作成
                </Button>
              </Group>
            ),
          },
        ]}
      />

      {/* スタッフ編集モーダル */}
      <UnifiedModal
        opened={editOpened}
        onClose={closeEdit}
        title="スタッフ編集"
        size="md"
        sections={[
          {
            label: '基本情報',
            content: (
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
              </Stack>
            ),
          },
          {
            label: '出勤設定',
            content: (
              <>
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
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
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
                  onClick={() => {
                    editForm.validate();
                    if (editForm.isValid()) {
                      void handleEditStaff(editForm.values);
                    }
                  }}
                  loading={operationLoading}
                  variant="filled"
                  color="blue"
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  保存
                </Button>
              </Group>
            ),
          },
        ]}
      />

      {/* スタッフ削除確認モーダル */}
      <UnifiedModal
        opened={deleteOpened}
        onClose={closeDelete}
        title="スタッフ削除"
        size="sm"
        sections={[
          {
            content: (
              <>
                <Text>{selectedStaff?.name} を削除してもよろしいですか?</Text>
                <Text size="sm" c="dimmed">
                  この操作は取り消せません。
                </Text>
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
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
            ),
          },
        ]}
      />

      {/* スタッフ選択モーダル（テンプレート入力用） */}
      <UnifiedModal
        opened={selectStaffOpened}
        onClose={() => {
          closeSelectStaff();
          setSelectedStaffIds([]);
        }}
        title="スタッフ選択"
        size="md"
        sections={[
          {
            content: (
              <>
                <Text size="sm" c="dimmed">
                  テンプレート入力するスタッフを選択してください。
                  出勤曜日が設定されているスタッフのみが対象です。
                </Text>

                <Checkbox.Group
                  value={selectedStaffIds}
                  onChange={setSelectedStaffIds}
                >
                  <Stack gap="xs">
                    {staffList.map((staff) => {
                      const hasTemplate = staff.workingDays && staff.workingDays.length > 0;
                      const timeLabel = staff.workTimeTemplate
                        ? `${staff.workTimeTemplate.startHour}〜${staff.workTimeTemplate.endHour}`
                        : '';
                      const daysLabel = staff.workingDays
                        ? staff.workingDays.map((d) => {
                            const dayMap: Record<string, string> = {
                              mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日'
                            };
                            return dayMap[d] ?? d;
                          }).join('・')
                        : '';

                      return (
                        <Checkbox
                          key={staff.id}
                          value={staff.id}
                          disabled={!hasTemplate}
                          label={
                            <Group gap="xs">
                              <Box
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  backgroundColor: staff.color,
                                }}
                              />
                              <Text size="sm" fw={500}>
                                {staff.name}
                              </Text>
                              {hasTemplate ? (
                                <Text size="xs" c="dimmed">
                                  ({daysLabel}{timeLabel && ` ${timeLabel}`})
                                </Text>
                              ) : (
                                <Text size="xs" c="red">
                                  ※曜日未設定
                                </Text>
                              )}
                            </Group>
                          }
                        />
                      );
                    })}
                  </Stack>
                </Checkbox.Group>
              </>
            ),
          },
          {
            content: (
              <Group justify="space-between">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    const selectableIds = staffList
                      .filter((s) => s.workingDays && s.workingDays.length > 0)
                      .map((s) => s.id);
                    setSelectedStaffIds(selectableIds);
                  }}
                >
                  全選択
                </Button>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      closeSelectStaff();
                      setSelectedStaffIds([]);
                    }}
                    leftSection={<IconX size={16} />}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleSelectedTemplateInput}
                    loading={operationLoading}
                    variant="filled"
                    color="blue"
                    leftSection={<IconCalendarEvent size={16} />}
                    disabled={selectedStaffIds.length === 0}
                  >
                    入力実行
                  </Button>
                </Group>
              </Group>
            ),
          },
        ]}
      />

      {/* メインコンテンツ: レスポンシブレイアウト */}
      {/* モバイル: 左にスタッフバッジ、右にカレンダー、下にテキストシフト */}
      {/* デスクトップ: 左にスタッフ一覧、右にテキストシフト＋カレンダー */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: isMobile ? 8 : 16,
          height: 'calc(100vh - 200px)',
          minHeight: 400,
        }}
      >
        {/* 左サイドバー: スタッフ一覧 / モバイルではバッジのみ */}
        {isMobile ? (
          /* モバイル: バッジ形式スタッフ一覧（全角3文字幅） */
          <ScrollArea
            id="staff-list"
            style={{
              width: 56, // 全角3文字幅 + padding
              flexShrink: 0,
            }}
          >
            <Stack gap={6}>
              {staffList.map((staff) => (
                <Tooltip
                  key={staff.id}
                  label={staff.name}
                  position="right"
                  withArrow
                >
                  <Badge
                    className="draggable-staff"
                    data-staff-id={staff.id}
                    data-staff-name={staff.name}
                    data-staff-color={staff.color}
                    color={staff.color}
                    variant="filled"
                    size="lg"
                    radius="sm"
                    style={{
                      cursor: 'grab',
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    {/* 名前の先頭3文字（全角換算） */}
                    {staff.name.slice(0, 3)}
                  </Badge>
                </Tooltip>
              ))}
            </Stack>
          </ScrollArea>
        ) : (
          /* デスクトップ: 1行形式スタッフ一覧（リサイズ可能） */
          <Box style={{ display: 'flex', flexShrink: 0 }}>
            <Paper
              withBorder
              p="md"
              style={{
                width: staffListWidth,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Group justify="space-between" mb="sm">
                <Text fw={600} size="sm">
                  <IconUser size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  スタッフ一覧
                </Text>
                <Group gap="xs">
                  <Badge size="sm" variant="light">
                    {staffList.length}人
                  </Badge>
                  <Menu shadow="md" width={180} position="bottom-end">
                    <Menu.Target>
                      <Button
                        variant="light"
                        size="xs"
                        rightSection={<IconChevronDown size={14} />}
                        loading={operationLoading}
                      >
                        操作
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconPlus size={16} />}
                        onClick={openCreate}
                      >
                        スタッフ追加
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Label>テンプレート入力</Menu.Label>
                      <Menu.Item
                        leftSection={<IconCalendarPlus size={16} />}
                        onClick={handleBulkTemplateInput}
                        disabled={staffList.length === 0}
                      >
                        全員一括入力
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconUsers size={16} />}
                        onClick={openSelectStaff}
                        disabled={staffList.length === 0}
                      >
                        選択入力...
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>

              <ScrollArea style={{ flex: 1 }} id="staff-list">
                <Stack gap={4}>
                  {staffList.map((staff) => {
                    // 勤務時間テンプレートを表示用に整形
                    const timeLabel = staff.workTimeTemplate
                      ? `${staff.workTimeTemplate.startHour}〜${staff.workTimeTemplate.endHour}`
                      : '';

                    return (
                      <Box
                        key={staff.id}
                        className="draggable-staff"
                        data-staff-id={staff.id}
                        data-staff-name={staff.name}
                        data-staff-color={staff.color}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 4,
                          border: `2px solid ${staff.color}`,
                          cursor: 'grab',
                          backgroundColor: 'var(--mantine-color-body)',
                          transition: 'all 0.15s',
                          minHeight: 32,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {/* カラーインジケーター */}
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: staff.color,
                            flexShrink: 0,
                          }}
                        />
                        {/* 名前 + 時間 */}
                        <Text size="sm" fw={500} style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {staff.name}
                          {timeLabel && (
                            <Text component="span" size="xs" c="dimmed" ml={6}>
                              {timeLabel}
                            </Text>
                          )}
                        </Text>
                        {/* CRUDメニュー */}
                        <Menu shadow="md" width={140}>
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              style={{ cursor: 'pointer', flexShrink: 0 }}
                            >
                              <IconDotsVertical size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(staff);
                              }}
                            >
                              編集
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
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
                      </Box>
                    );
                  })}
                </Stack>
              </ScrollArea>
            </Paper>

            {/* 横幅リサイズハンドル */}
            <Box
              onMouseDown={handleWidthResizeStart}
              style={{
                width: 8,
                cursor: 'col-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isResizingWidth ? 'var(--mantine-color-blue-1)' : 'transparent',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isResizingWidth) {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isResizingWidth) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <IconGripVertical size={12} style={{ opacity: 0.5 }} />
            </Box>
          </Box>
        )}

        {/* 右サイド: カレンダーとテキストエクスポート */}
        <Stack style={{ flex: 1, height: '100%', minWidth: 0 }} gap="md">
          {/* カレンダー（モバイルでは先に表示） */}
          <Paper
            withBorder
            p={isMobile ? 'xs' : 'md'}
            style={{
              flex: 1,
              overflow: 'hidden',
              minHeight: 300,
            }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ja"
              headerToolbar={
                isMobile
                  ? {
                      left: 'prev,next',
                      center: 'title',
                      right: '',
                    }
                  : {
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,dayGridWeek',
                    }
              }
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
              dayCellContent={(arg: DayCellContentArg) => {
                const dayOfWeek = arg.date.getDay();
                let color = 'inherit';
                if (dayOfWeek === 0) color = '#e03131'; // 日曜: 赤
                if (dayOfWeek === 6) color = '#1971c2'; // 土曜: 青
                return (
                  <span style={{ color, fontWeight: dayOfWeek === 0 || dayOfWeek === 6 ? 600 : 400 }}>
                    {arg.dayNumberText}
                  </span>
                );
              }}
              eventContent={(arg: EventContentArg) => {
                const staffName = arg.event.title;
                const displayName = arg.event.extendedProps?.displayName as string | null;
                const dotColor = arg.event.extendedProps?.staffColor ?? arg.event.backgroundColor ?? '#4dabf7';

                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 4px',
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#333',
                      }}
                    >
                      {staffName}
                      {displayName && (
                        <span style={{ marginLeft: 4, color: '#666' }}>{displayName}</span>
                      )}
                    </span>
                  </div>
                );
              }}
              eventDisplay="list-item"
            />
          </Paper>

          {/* テキストエクスポート（カレンダーの下、リサイズ可能） */}
          {!isMobile && (
            <Box
              onMouseDown={handleHeightResizeStart}
              style={{
                height: 6,
                cursor: 'row-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isResizingHeight ? 'var(--mantine-color-blue-1)' : 'transparent',
                transition: 'background-color 0.15s',
                borderRadius: 3,
              }}
              onMouseEnter={(e) => {
                if (!isResizingHeight) {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isResizingHeight) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Box style={{ width: 40, height: 3, backgroundColor: 'var(--mantine-color-gray-4)', borderRadius: 2 }} />
            </Box>
          )}
          <Paper 
            withBorder 
            p={isMobile ? 'xs' : 'md'}
            style={!isMobile ? { height: textShiftHeight, flexShrink: 0 } : undefined}
          >
            <Group justify="space-between" align="flex-start" mb="xs">
              {!isMobile && (
                <Text fw={600} size="sm">
                  テキスト形式シフト一覧
                </Text>
              )}
              <CopyButton value={generateShiftText()} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'コピーしました' : 'コピー'}>
                    <Button
                      size="xs"
                      variant="light"
                      color={copied ? 'teal' : 'blue'}
                      onClick={copy}
                      style={isMobile ? { marginLeft: 'auto' } : undefined}
                    >
                      {copied ? 'コピー済み' : 'シフトをコピー'}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              value={generateShiftText()}
              readOnly
              autosize
              minRows={isMobile ? 2 : 3}
              maxRows={isMobile ? 5 : 10}
              placeholder="カレンダーに登録されたシフトがここに表示されます"
              styles={{
                input: {
                  fontSize: isMobile ? 12 : 14,
                },
              }}
            />
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
