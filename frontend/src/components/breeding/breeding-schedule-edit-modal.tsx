'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  Text,
  NumberInput,
  Badge,
  Select,
  Divider,
} from '@mantine/core';
import { UnifiedModal } from '@/components/common';

interface Cat {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
  birthDate: string;
  breed?: { id: string; name: string } | null;
  tags?: Array<{ tag: { id: string; name: string; color: string } }>;
}

interface BreedingScheduleEntry {
  maleId: string;
  maleName: string;
  femaleId: string;
  femaleName: string;
  date: string;
  duration: number;
  dayIndex: number;
  isHistory: boolean;
  result?: string;
}

interface BreedingScheduleEditModalProps {
  opened: boolean;
  onClose: () => void;
  schedule: BreedingScheduleEntry | null;
  availableFemales: Cat[];
  onSave: (newDuration: number, newFemaleId?: string) => void;
  onDelete?: () => void;
}

export function BreedingScheduleEditModal({
  opened,
  onClose,
  schedule,
  availableFemales,
  onSave,
  onDelete,
}: BreedingScheduleEditModalProps) {
  const [duration, setDuration] = useState<number>(1);
  const [femaleId, setFemaleId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (opened && schedule) {
      setDuration(schedule.duration);
      setFemaleId(schedule.femaleId);
    }
  }, [opened, schedule]);

  const handleSave = async () => {
    if (!schedule) return;

    setIsSaving(true);
    try {
      // メス猫が変更された場合のみ新しいIDを渡す
      const newFemaleId = femaleId !== schedule.femaleId ? femaleId : undefined;
      onSave(duration, newFemaleId);
      onClose();
    } catch (err) {
      console.error('Failed to update breeding schedule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule || !onDelete) return;

    const confirmed = window.confirm(
      `${schedule.maleName} × ${schedule.femaleName} のスケジュールを削除しますか？`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      onDelete();
      onClose();
    } catch (err) {
      console.error('Failed to delete breeding schedule:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!schedule) return null;

  // 開始日を計算
  const startDate = new Date(schedule.date);
  startDate.setDate(startDate.getDate() - schedule.dayIndex);
  const startDateStr = startDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });

  // メス猫の選択肢を作成
  const femaleOptions = availableFemales.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title={schedule.isHistory ? '過去の交配スケジュールの編集' : '交配スケジュールの編集'}
      size="md"
      centered
    >
      <Group gap="xs" wrap="wrap">
        <Badge color="blue">{schedule.maleName}</Badge>
        <Text size="sm">×</Text>
        <Badge color="pink">{schedule.femaleName}</Badge>
        {schedule.isHistory && (
          <Badge color="gray" variant="light">過去</Badge>
        )}
      </Group>

      <Text size="sm" c="dimmed">
        開始日: {startDateStr}
      </Text>

      <Divider label="スケジュール設定" labelPosition="center" />

      <Select
        label="メス猫"
        description="交配相手のメス猫を変更できます"
        value={femaleId}
        onChange={(value) => setFemaleId(value || '')}
        data={femaleOptions}
        searchable
      />

      <NumberInput
        label="交配期間"
        description="交配を行う日数を設定してください"
        value={duration}
        onChange={(value) => setDuration(typeof value === 'number' ? value : 1)}
        min={1}
        max={7}
        suffix="日間"
      />

      {!schedule.isHistory && (
        <Text size="xs" c="dimmed">
          ※ 期間を短縮すると、最終日以降のスケジュールが削除されます
        </Text>
      )}

      <Divider />

      <Group justify="space-between" gap="sm">
        <Group gap="xs">
          {onDelete && (
            <Button 
              variant="outline" 
              color="red" 
              onClick={handleDelete}
              loading={isDeleting}
            >
              削除
            </Button>
          )}
        </Group>
        <Group gap="xs">
          <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>
            キャンセル
          </Button>
          <Button onClick={handleSave} loading={isSaving} disabled={isDeleting}>
            保存
          </Button>
        </Group>
      </Group>
    </UnifiedModal>
  );
}
