'use client';

import {
  Box,
  Card,
  Text,
  Button,
  Group,
  Flex,
  Badge,
  Table,
  Select,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ActionButton } from '@/components/ActionButton';
import { ContextMenuProvider } from '@/components/context-menu';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { BreedingScheduleEntry } from '../types';
import { generateMonthDates } from '../utils';

export interface BreedingScheduleTabProps {
  // 状態
  isFullscreen: boolean;
  selectedYear: number;
  selectedMonth: number;
  activeMales: Cat[];
  breedingSchedule: Record<string, BreedingScheduleEntry>;
  selectedMaleForEdit: string | null;
  
  // アクション
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onOpenMaleModal: () => void;
  onMaleSelect: (maleId: string, date: string) => void;
  onMaleNameClick: (maleId: string) => void;
  onRemoveMale: (maleId: string) => void;
  onSaveMaleEdit: () => void;
  onMatingCheck: (maleId: string, femaleId: string, date: string) => void;
  onMatingResult: (maleId: string, femaleId: string, femaleName: string, date: string, result: 'success' | 'failure') => void;
  onScheduleContextAction: (action: string, entity: BreedingScheduleEntry) => void;
  onClearData: () => void;
  
  // ヘルパー
  getMatingCheckCount: (maleId: string, femaleId: string, date: string) => number;
}

export function BreedingScheduleTab({
  isFullscreen,
  selectedYear,
  selectedMonth,
  activeMales,
  breedingSchedule,
  selectedMaleForEdit,
  onYearChange,
  onMonthChange,
  onOpenMaleModal,
  onMaleSelect,
  onMaleNameClick,
  onRemoveMale,
  onSaveMaleEdit,
  onMatingCheck,
  onMatingResult,
  onScheduleContextAction,
  onClearData,
  getMatingCheckCount,
}: BreedingScheduleTabProps) {
  const monthDates = generateMonthDates(selectedYear, selectedMonth);

  const handleClearData = () => {
    if (window.confirm('交配管理表のデータをクリアしますか？\n（妊娠確認中・出産予定などのデータは削除されません）')) {
      onClearData();
      notifications.show({
        title: 'クリア完了',
        message: '交配管理表のデータをクリアしました',
        color: 'teal',
      });
    }
  };

  return (
    <Card 
      shadow="sm" 
      padding={isFullscreen ? "xs" : "md"} 
      radius="md" 
      withBorder 
      mb="md"
      style={{ height: isFullscreen ? 'calc(100vh - 180px)' : 'auto' }}
    >
      <Group gap="xs" mb="md" align="flex-end">
        <Select
          value={selectedYear.toString()}
          onChange={(value) => onYearChange(parseInt(value || '2024'))}
          data={['2024', '2025', '2026'].map(year => ({ value: year, label: year }))}
          size={isFullscreen ? "xs" : "sm"}
          styles={{ input: { width: '80px' } }}
        />
        <Text size="sm" pb={isFullscreen ? 4 : 8}>年</Text>
        <Select
          value={selectedMonth.toString()}
          onChange={(value) => onMonthChange(parseInt(value || '8'))}
          data={Array.from({ length: 12 }, (_, i) => ({
            value: (i + 1).toString(),
            label: String(i + 1).padStart(2, '0')
          }))}
          size={isFullscreen ? "xs" : "sm"}
          styles={{ input: { width: '70px' } }}
        />
        <Text size="sm" pb={isFullscreen ? 4 : 8}>月</Text>
        <ActionButton
          action="create"
          onClick={onOpenMaleModal}
          isSectionAction
        >
          オス追加
        </ActionButton>
        <ActionButton
          action="cancel"
          onClick={handleClearData}
          isSectionAction
          title="localStorageに保存された交配管理表のデータをクリア"
        >
          データクリア
        </ActionButton>
      </Group>
      
      <ScrollArea 
        style={{ 
          height: isFullscreen ? 'calc(100% - 80px)' : '600px',
          width: '100%'
        }}
      >
        <Table
          style={{ 
            fontSize: isFullscreen ? '11px' : '14px',
            minWidth: isFullscreen ? '1200px' : '800px',
            position: 'relative'
          }}
        >
          <Table.Thead 
            style={{ 
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--surface)',
              zIndex: 10,
              borderBottom: '2px solid var(--border-subtle)'
            }}
          >
            <Table.Tr>
              <Table.Th 
                style={{ 
                  width: isFullscreen ? 60 : 80,
                  minWidth: isFullscreen ? 60 : 80,
                  maxWidth: isFullscreen ? 60 : 80,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--surface)',
                  zIndex: 11,
                  borderRight: '2px solid var(--border-subtle)'
                }}
              >
                <Flex align="center" gap={4} justify="center">
                  <Text size={isFullscreen ? "xs" : "sm"} fw={600}>
                    日付
                  </Text>
                </Flex>
              </Table.Th>
              {activeMales.map((male) => (
                <Table.Th 
                  key={male.id} 
                  style={{ 
                    minWidth: isFullscreen ? 100 : 120,
                    borderRight: '1px solid var(--border-subtle)'
                  }}
                >
                  <Box
                    onClick={() => onMaleNameClick(male.id)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <Text fw={600} size={isFullscreen ? "xs" : "sm"} ta="center">
                      {male.name}
                    </Text>
                  </Box>
                  {selectedMaleForEdit === male.id && (
                    <Group gap="xs" justify="center" mt="xs">
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => onRemoveMale(male.id)}
                      >
                        削除
                      </Button>
                      <Button
                        size="xs"
                        onClick={onSaveMaleEdit}
                      >
                        保存
                      </Button>
                    </Group>
                  )}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {monthDates.map(({ date, dateString, dayOfWeek }) => (
              <Table.Tr key={date}>
                <Table.Td
                  style={{
                    width: isFullscreen ? 60 : 80,
                    minWidth: isFullscreen ? 60 : 80,
                    maxWidth: isFullscreen ? 60 : 80,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'var(--surface)',
                    zIndex: 5,
                    borderRight: '1px solid var(--border-subtle)'
                  }}
                >
                  <Flex align="center" gap={4} justify="center">
                    <Text 
                      size={isFullscreen ? "xs" : "sm"} 
                      fw={dayOfWeek === 0 || dayOfWeek === 6 ? 600 : 400}
                      c={dayOfWeek === 0 ? 'red' : dayOfWeek === 6 ? 'blue' : undefined}
                    >
                      {date}日
                    </Text>
                    <Text 
                      size={isFullscreen ? "8px" : "xs"} 
                      c={dayOfWeek === 0 ? 'red' : dayOfWeek === 6 ? 'blue' : 'dimmed'}
                    >
                      ({['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]})
                    </Text>
                  </Flex>
                </Table.Td>
                {activeMales.map((male) => {
                  const scheduleKey = `${male.id}-${dateString}`;
                  const schedule = breedingSchedule[scheduleKey];
                  
                  // 次の日も同じ交配期間かチェック
                  const nextDate = new Date(selectedYear, selectedMonth, date + 1);
                  const nextDateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
                  const nextScheduleKey = `${male.id}-${nextDateString}`;
                  const nextSchedule = breedingSchedule[nextScheduleKey];
                  const hasNextSameMating = schedule && nextSchedule && 
                    schedule.femaleName === nextSchedule.femaleName && 
                    !schedule.isHistory && !nextSchedule.isHistory;
                  
                  return (
                    <Table.Td 
                      key={male.id} 
                      style={{ 
                        textAlign: 'center',
                        borderRight: hasNextSameMating ? 'none' : '1px solid var(--border-subtle)',
                        backgroundColor: schedule && !schedule.isHistory ? '#fffacd' : 'transparent'
                      }}
                    >
                      {schedule ? (
                        <ScheduleCell
                          schedule={schedule}
                          maleId={male.id}
                          dateString={dateString}
                          isFullscreen={isFullscreen}
                          getMatingCheckCount={getMatingCheckCount}
                          onMatingCheck={onMatingCheck}
                          onMatingResult={onMatingResult}
                          onScheduleContextAction={onScheduleContextAction}
                        />
                      ) : (
                        <Button
                          variant="subtle"
                          size={isFullscreen ? "xs" : "sm"}
                          onClick={() => onMaleSelect(male.id, dateString)}
                          style={{ 
                            width: '100%',
                            height: isFullscreen ? '24px' : '32px'
                          }}
                        >
                          +
                        </Button>
                      )}
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

// スケジュールセル内部コンポーネント
interface ScheduleCellProps {
  schedule: BreedingScheduleEntry;
  maleId: string;
  dateString: string;
  isFullscreen: boolean;
  getMatingCheckCount: (maleId: string, femaleId: string, date: string) => number;
  onMatingCheck: (maleId: string, femaleId: string, date: string) => void;
  onMatingResult: (maleId: string, femaleId: string, femaleName: string, date: string, result: 'success' | 'failure') => void;
  onScheduleContextAction: (action: string, entity: BreedingScheduleEntry) => void;
}

function ScheduleCell({
  schedule,
  maleId,
  dateString,
  isFullscreen,
  getMatingCheckCount,
  onMatingCheck,
  onMatingResult,
  onScheduleContextAction,
}: ScheduleCellProps) {
  const checkCount = getMatingCheckCount(maleId, schedule.femaleId, dateString);

  if (schedule.isHistory) {
    // 履歴：名前とチェックマークを一行表示
    return (
      <ContextMenuProvider
        entity={schedule}
        actions={['edit', 'delete']}
        onAction={(action) => onScheduleContextAction(action, schedule)}
      >
        <Box 
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            minHeight: isFullscreen ? '28px' : '32px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            opacity: 0.6, 
            cursor: 'pointer' 
          }}
          title="ダブルクリックまたは右クリックで操作"
        >
          <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
            {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
              <Badge size={isFullscreen ? "xs" : "sm"} color="gray" variant="light">
                {schedule.femaleName}
              </Badge>
            )}
            <Box
              style={{
                flex: 1,
                minHeight: isFullscreen ? '20px' : '24px',
                padding: '2px 4px',
                borderRadius: '3px',
                border: '1px dashed #d3d3d3',
                backgroundColor: checkCount > 0 ? '#f8f8f8' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {checkCount > 0 ? (
                <Text size={isFullscreen ? "8px" : "xs"} c="dimmed" ta="center" lh={1}>
                  {'✓'.repeat(checkCount)}
                </Text>
              ) : (
                <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.3 }} lh={1}>
                  -
                </Text>
              )}
            </Box>
          </Flex>
        </Box>
      </ContextMenuProvider>
    );
  }

  // 現在のスケジュール
  return (
    <ContextMenuProvider
      entity={schedule}
      actions={['edit', 'delete']}
      onAction={(action) => onScheduleContextAction(action, schedule)}
    >
      <Box 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%', 
          minHeight: isFullscreen ? '28px' : '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          cursor: 'pointer' 
        }}
        title="ダブルクリックまたは右クリックで操作"
      >
        <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
          {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
            <Badge size={isFullscreen ? "xs" : "sm"} color="pink">
              {schedule.femaleName}
            </Badge>
          )}
          
          {schedule.dayIndex === schedule.duration - 1 ? (
            <Group gap={2}>
              <ActionIcon
                size={isFullscreen ? "xs" : "sm"}
                variant="light"
                color="green"
                onClick={(e) => {
                  e.stopPropagation();
                  onMatingResult(maleId, schedule.femaleId, schedule.femaleName, schedule.date, 'success');
                }}
                title="交配成功"
              >
                ○
              </ActionIcon>
              <ActionIcon
                size={isFullscreen ? "xs" : "sm"}
                variant="light"
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onMatingResult(maleId, schedule.femaleId, schedule.femaleName, schedule.date, 'failure');
                }}
                title="交配失敗"
              >
                ×
              </ActionIcon>
            </Group>
          ) : (
            <Box
              style={{
                flex: 1,
                minHeight: isFullscreen ? '16px' : '18px',
                cursor: 'pointer',
                padding: '1px 4px',
                borderRadius: '3px',
                border: '1px dashed var(--border-subtle)',
                backgroundColor: checkCount > 0 ? '#f0f9f0' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMatingCheck(maleId, schedule.femaleId, dateString);
              }}
              title="クリックして交配記録を追加"
            >
              {checkCount > 0 ? (
                <Text size={isFullscreen ? "8px" : "xs"} c="green" ta="center" lh={1}>
                  {'✓'.repeat(checkCount)}
                </Text>
              ) : (
                <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.5 }} lh={1}>
                  +
                </Text>
              )}
            </Box>
          )}
        </Flex>
      </Box>
    </ContextMenuProvider>
  );
}









