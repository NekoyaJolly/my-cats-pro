'use client';

import { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
} from '@mantine/core';

export interface SaleInfo {
  buyer: string;
  price: number;
  saleDate: string;
}

interface SaleInfoModalProps {
  opened: boolean;
  kittenName: string;
  onClose: () => void;
  onConfirm: (saleInfo: SaleInfo) => void;
  loading?: boolean;
}

export function SaleInfoModal({
  opened,
  kittenName,
  onClose,
  onConfirm,
  loading = false,
}: SaleInfoModalProps) {
  const [buyer, setBuyer] = useState('');
  const [price, setPrice] = useState<number>(0);
  const today = new Date().toISOString().split('T')[0];
  const [saleDate, setSaleDate] = useState<string | null>(today);

  const handleConfirm = () => {
    onConfirm({
      buyer,
      price,
      saleDate: saleDate ?? today,
    });
    setBuyer('');
    setPrice(0);
    setSaleDate(today);
  };

  const isValid = buyer.trim().length > 0 && price > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${kittenName}の販売情報`}
      centered
    >
      <Stack gap="md">
        <TextInput
          label="購入者名"
          placeholder="購入者の氏名を入力"
          value={buyer}
          onChange={(e) => setBuyer(e.currentTarget.value)}
          required
        />
        <NumberInput
          label="販売金額（円）"
          placeholder="販売金額を入力"
          value={price}
          onChange={(val) => setPrice(typeof val === 'number' ? val : 0)}
          min={0}
          step={10000}
          thousandSeparator=","
          required
        />
        <TextInput
          label="販売日"
          type="date"
          value={saleDate ?? ''}
          onChange={(e) => setSaleDate(e.currentTarget.value || null)}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={!isValid}
          >
            登録
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
