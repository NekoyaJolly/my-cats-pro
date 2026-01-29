'use client';

import { Stack, TextInput, Select, NumberInput, Textarea, Button, Group } from '@mantine/core';
import { useState, useEffect } from 'react';
import { UnifiedModal } from '@/components/common';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { DispositionType, SaleInfo } from '@/lib/api/hooks/use-breeding';

interface KittenDispositionModalProps {
  opened: boolean;
  onClose: () => void;
  kitten: Cat | null;
  birthRecordId?: string;
  dispositionType?: DispositionType;
  onSuccess?: () => void;
  onSubmit?: (data: {
    disposition: DispositionType;
    trainingStartDate?: string;
    saleInfo?: SaleInfo;
    deathDate?: string;
    deathReason?: string;
    notes?: string;
  }) => void;
  loading?: boolean;
}

export function KittenDispositionModal({
  opened,
  onClose,
  kitten,
  birthRecordId: _birthRecordId,
  dispositionType,
  onSuccess,
  onSubmit,
  loading,
}: KittenDispositionModalProps) {
  const [disposition, setDisposition] = useState<DispositionType>('TRAINING');
  const [trainingStartDate, setTrainingStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyer, setBuyer] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleNotes, setSaleNotes] = useState('');
  const [deathDate, setDeathDate] = useState(new Date().toISOString().split('T')[0]);
  const [deathReason, setDeathReason] = useState('');
  const [notes, setNotes] = useState('');

  // dispositionTypeが変更されたら更新
  useEffect(() => {
    if (dispositionType) {
      setDisposition(dispositionType);
    }
  }, [dispositionType]);

  const handleSubmit = () => {
    if (!onSubmit) return;
    
    const data = {
      disposition,
      notes,
    } as {
      disposition: DispositionType;
      trainingStartDate?: string;
      saleInfo?: SaleInfo;
      deathDate?: string;
      deathReason?: string;
      notes?: string;
    };

    if (disposition === 'TRAINING') {
      data.trainingStartDate = trainingStartDate;
    } else if (disposition === 'SALE') {
      data.saleInfo = {
        buyer,
        price,
        saleDate,
        notes: saleNotes,
      };
    } else if (disposition === 'DECEASED') {
      data.deathDate = deathDate;
      data.deathReason = deathReason;
    }

    onSubmit(data);
    if (onSuccess) onSuccess();
  };

  const resetForm = () => {
    setDisposition('TRAINING');
    setTrainingStartDate(new Date().toISOString().split('T')[0]);
    setBuyer('');
    setPrice(0);
    setSaleDate(new Date().toISOString().split('T')[0]);
    setSaleNotes('');
    setDeathDate(new Date().toISOString().split('T')[0]);
    setDeathReason('');
    setNotes('');
  };

  return (
    <UnifiedModal
      opened={opened}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={`子猫処遇登録: ${kitten?.name || ''}`}
      size="md"
    >
      {!kitten ? (
        <div>子猫情報がありません</div>
      ) : (
        <>
          <TextInput
            label="子猫名"
            value={kitten.name}
            readOnly
          />

        <Select
          label="処遇"
          value={disposition}
          onChange={(value) => setDisposition(value as DispositionType)}
          data={[
            { value: 'TRAINING', label: '養成' },
            { value: 'SALE', label: '出荷' },
            { value: 'DECEASED', label: '死亡' },
          ]}
          required
        />

        {disposition === 'TRAINING' && (
          <TextInput
            label="養成開始日"
            type="date"
            value={trainingStartDate}
            onChange={(e) => setTrainingStartDate(e.target.value)}
            required
          />
        )}

        {disposition === 'SALE' && (
          <>
            <TextInput
              label="譲渡先"
              placeholder="個人名または業者名"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              required
            />
            <NumberInput
              label="譲渡金額（円）"
              value={price}
              onChange={(value) => setPrice(typeof value === 'number' ? value : 0)}
              min={0}
              thousandSeparator=","
              required
            />
            <TextInput
              label="譲渡日"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              required
            />
            <Textarea
              label="譲渡メモ"
              placeholder="譲渡に関する詳細"
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
            />
          </>
        )}

        {disposition === 'DECEASED' && (
          <>
            <TextInput
              label="死亡日"
              type="date"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
              required
            />
            <Textarea
              label="死亡理由"
              placeholder="死亡理由を記入"
              value={deathReason}
              onChange={(e) => setDeathReason(e.target.value)}
            />
          </>
        )}

        <Textarea
          label="メモ"
          placeholder="その他のメモ"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
          >
            登録
          </Button>
        </Group>
        </>
      )}
    </UnifiedModal>
  );
}
