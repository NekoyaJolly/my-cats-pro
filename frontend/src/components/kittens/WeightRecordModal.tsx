'use client';

import React, { useEffect } from 'react';
import {
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Box,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconScale, IconCalendar, IconNotes } from '@tabler/icons-react';
import {
  useCreateWeightRecord,
  useUpdateWeightRecord,
  type WeightRecord,
  type CreateWeightRecordRequest,
} from '@/lib/api/hooks/use-weight-records';
import { UnifiedModal, type ModalSection } from '@/components/common';

interface WeightRecordModalProps {
  opened: boolean;
  onClose: () => void;
  catId: string;
  catName: string;
  /** 編集モードの場合に既存の記録を渡す */
  existingRecord?: WeightRecord | null;
  onSuccess?: () => void;
}

interface FormValues {
  weight: number | '';
  recordedAt: Date | null;
  notes: string;
}

/**
 * 体重記録入力モーダル
 * 新規作成と編集の両方に対応
 */
export function WeightRecordModal({
  opened,
  onClose,
  catId,
  catName,
  existingRecord,
  onSuccess,
}: WeightRecordModalProps) {
  const isEditMode = !!existingRecord;

  const createMutation = useCreateWeightRecord(catId);
  const updateMutation = useUpdateWeightRecord(catId);

  const form = useForm<FormValues>({
    initialValues: {
      weight: '',
      recordedAt: new Date(),
      notes: '',
    },
    validate: {
      weight: (value) => {
        if (value === '' || value === undefined || value === null) {
          return '体重を入力してください';
        }
        if (typeof value === 'number' && (value < 1 || value > 50000)) {
          return '体重は1g〜50000gの範囲で入力してください';
        }
        return null;
      },
      recordedAt: (value) => {
        if (!value) {
          return '記録日時を選択してください';
        }
        if (value > new Date()) {
          return '未来の日時は指定できません';
        }
        return null;
      },
    },
  });

  // 編集モード時に既存データをフォームに反映
  useEffect(() => {
    if (opened) {
      if (existingRecord) {
        form.setValues({
          weight: existingRecord.weight,
          recordedAt: new Date(existingRecord.recordedAt),
          notes: existingRecord.notes ?? '',
        });
      } else {
        form.reset();
        form.setFieldValue('recordedAt', new Date());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, existingRecord]);

  const handleSubmit = (values: FormValues) => {
    const data: CreateWeightRecordRequest = {
      weight: values.weight as number,
      recordedAt: values.recordedAt?.toISOString(),
      notes: values.notes || undefined,
    };

    if (isEditMode && existingRecord) {
      updateMutation.mutate(
        { recordId: existingRecord.id, data },
        {
          onSuccess: () => {
            form.reset();
            onClose();
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          form.reset();
          onClose();
          onSuccess?.();
        },
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const sections: ModalSection[] = [
    {
      content: (
        <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" p="md">
            {/* 対象の猫名 */}
            <TextInput
              label="対象"
              value={catName}
              disabled
              styles={{
                input: {
                  backgroundColor: 'var(--mantine-color-gray-1)',
                },
              }}
            />

            {/* 体重入力 */}
            <NumberInput
              label="体重"
              description="グラム単位で入力してください"
              placeholder="350"
              min={1}
              max={50000}
              step={5}
              suffix=" g"
              leftSection={<IconScale size={16} />}
              required
              {...form.getInputProps('weight')}
            />

            {/* 記録日時 */}
            <DateTimePicker
              label="記録日時"
              placeholder="記録日時を選択"
              leftSection={<IconCalendar size={16} />}
              maxDate={new Date()}
              required
              valueFormat="YYYY/MM/DD HH:mm"
              {...form.getInputProps('recordedAt')}
            />

            {/* メモ */}
            <Textarea
              label="メモ"
              placeholder="例: ミルクをよく飲んでいる、元気がある など"
              leftSection={<IconNotes size={16} />}
              autosize
              minRows={2}
              maxRows={4}
              {...form.getInputProps('notes')}
            />
          </Stack>
        </Box>
      ),
    },
    {
      content: (
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            キャンセル
          </Button>
          <Button 
            loading={isLoading} 
            onClick={() => {
              form.validate();
              if (form.isValid()) {
                void handleSubmit(form.values);
              }
            }}
          >
            {isEditMode ? '更新' : '記録'}
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconScale size={20} />
          <Text fw={600}>
            {isEditMode ? '体重記録を編集' : '体重を記録'}
          </Text>
        </Group>
      }
      size="md"
      addContentPadding={false}
      sections={sections}
    />
  );
}

export default WeightRecordModal;

