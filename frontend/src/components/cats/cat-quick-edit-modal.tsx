'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  TextInput,
  Divider,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { UnifiedModal } from '@/components/common';

interface CatQuickEditModalProps {
  opened: boolean;
  onClose: () => void;
  catId: string;
  catName: string;
  birthDate: string;
  onSave: (catId: string, updates: { name?: string; birthDate?: string }) => Promise<void>;
}

export function CatQuickEditModal({
  opened,
  onClose,
  catId,
  catName,
  birthDate,
  onSave,
}: CatQuickEditModalProps) {
  const [name, setName] = useState(catName);
  const [date, setDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setName(catName);
      setDate(new Date(birthDate));
      setError(null);
    }
  }, [opened, catName, birthDate]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('名前は必須です');
      return;
    }

    if (!date) {
      setError('誕生日は必須です');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updates: { name?: string; birthDate?: string } = {};
      
      if (name !== catName) {
        updates.name = name;
      }
      
      const newBirthDate = date.toISOString().split('T')[0];
      if (newBirthDate !== birthDate) {
        updates.birthDate = newBirthDate;
      }

      if (Object.keys(updates).length > 0) {
        await onSave(catId, updates);
        notifications.show({
          title: '更新成功',
          message: '猫の情報を更新しました',
          color: 'green',
        });
      }
      
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存に失敗しました';
      setError(message);
      notifications.show({
        title: '更新失敗',
        message,
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="猫情報の編集"
      size="md"
      centered
    >
      <TextInput
        label="名前"
        placeholder="猫の名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        error={error && error.includes('名前') ? error : undefined}
        autoFocus
      />

      <DateInput
        label="誕生日"
        placeholder="誕生日を選択"
        value={date}
        onChange={(value) => {
          if (typeof value === 'string') {
            setDate(new Date(value));
          } else {
            setDate(value);
          }
        }}
        required
        error={error && error.includes('誕生日') ? error : undefined}
        valueFormat="YYYY/MM/DD"
      />

      {error && !error.includes('名前') && !error.includes('誕生日') && (
        <TextInput
          error={error}
          styles={{ input: { display: 'none' } }}
        />
      )}

      <Divider />

      <Group justify="flex-end" gap="sm">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          キャンセル
        </Button>
        <Button onClick={handleSave} loading={isSaving}>
          保存
        </Button>
      </Group>
    </UnifiedModal>
  );
}
