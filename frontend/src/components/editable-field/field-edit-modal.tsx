'use client';

import { useState, useEffect } from 'react';

import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  NumberInput,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

interface FieldEditModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  fieldLabel: string;
  fieldType: FieldType;
  currentValue: string | number | Date | null | undefined;
  onSave: (value: string | number | Date | null) => void | Promise<void>;
  selectOptions?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  rows?: number;
}

export function FieldEditModal({
  opened,
  onClose,
  title,
  fieldLabel,
  fieldType,
  currentValue,
  onSave,
  selectOptions = [],
  placeholder,
  required = false,
  minValue,
  maxValue,
  rows = 3,
}: FieldEditModalProps) {
  const [value, setValue] = useState<string | number | Date | null>(currentValue ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // モーダルが開いたときに現在値をセット
  useEffect(() => {
    if (opened) {
      setValue(currentValue ?? null);
      setError(null);
    }
  }, [opened, currentValue]);

  const handleSave = async () => {
    // バリデーション
    if (required && (value === null || value === '')) {
      setError('この項目は必須です');
      return;
    }

    if (fieldType === 'number' && typeof value === 'number') {
      if (minValue !== undefined && value < minValue) {
        setError(`${minValue}以上の値を入力してください`);
        return;
      }
      if (maxValue !== undefined && value > maxValue) {
        setError(`${maxValue}以下の値を入力してください`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(value);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = () => {
    switch (fieldType) {
      case 'text':
        return (
          <TextInput
            label={fieldLabel}
            placeholder={placeholder}
            value={(value as string) || ''}
            onChange={(e) => setValue(e.target.value)}
            required={required}
            error={error}
            autoFocus
          />
        );

      case 'textarea':
        return (
          <Textarea
            label={fieldLabel}
            placeholder={placeholder}
            value={(value as string) || ''}
            onChange={(e) => setValue(e.target.value)}
            required={required}
            error={error}
            rows={rows}
            autoFocus
          />
        );

      case 'number':
        return (
          <NumberInput
            label={fieldLabel}
            placeholder={placeholder}
            value={value as number | ''}
            onChange={(val) => setValue(val as number)}
            required={required}
            error={error}
            min={minValue}
            max={maxValue}
            autoFocus
          />
        );

      case 'date':
        return (
          <DateInput
            label={fieldLabel}
            placeholder={placeholder}
            value={value ? new Date(value) : null}
            onChange={(date) => setValue(date)}
            required={required}
            error={error}
            valueFormat="YYYY/MM/DD"
            autoFocus
          />
        );

      case 'select':
        return (
          <Select
            label={fieldLabel}
            placeholder={placeholder}
            value={value as string | null}
            onChange={(val) => setValue(val)}
            data={selectOptions}
            required={required}
            error={error}
            searchable
            autoFocus
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="md"
      centered
    >
      <Stack gap="md">
        {renderInput()}

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            保存
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
