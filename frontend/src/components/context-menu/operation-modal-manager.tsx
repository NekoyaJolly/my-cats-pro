'use client';

import { ReactNode, useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { UnifiedModal } from '@/components/common';

export type OperationType = 'view' | 'edit' | 'create' | 'delete' | 'duplicate' | 'custom';

interface OperationModalManagerProps<T = unknown> {
  operationType: OperationType | null;
  entity?: T;
  entityType?: string;
  onClose: () => void;
  onConfirm?: (entity?: T) => void | Promise<void>;
  children?: ReactNode;
  customContent?: ReactNode;
}

export function OperationModalManager<T = unknown>({
  operationType,
  entity,
  entityType = 'アイテム',
  onClose,
  onConfirm,
  children,
  customContent,
}: OperationModalManagerProps<T>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(entity);
      
      // 成功通知
      const messages: Record<OperationType, string> = {
        view: '',
        edit: `${entityType}を更新しました`,
        create: `${entityType}を作成しました`,
        delete: `${entityType}を削除しました`,
        duplicate: `${entityType}を複製しました`,
        custom: '操作が完了しました',
      };

      if (operationType && messages[operationType]) {
        notifications.show({
          title: '成功',
          message: messages[operationType],
          color: 'green',
        });
      }

      onClose();
    } catch (error) {
      notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : '操作に失敗しました',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!operationType) return null;

  // 削除確認モーダル
  if (operationType === 'delete') {
    return (
      <UnifiedModal
        opened={true}
        onClose={onClose}
        title={`${entityType}の削除`}
        centered
        size="sm"
      >
        <Text>この{entityType}を削除してもよろしいですか？</Text>
        <Text size="sm" c="dimmed">
          この操作は取り消せません。
        </Text>

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            キャンセル
          </Button>
          <Button color="red" onClick={handleConfirm} loading={isLoading}>
            削除
          </Button>
        </Group>
      </UnifiedModal>
    );
  }

  // 詳細表示モーダル
  if (operationType === 'view') {
    return (
      <UnifiedModal
        opened={true}
        onClose={onClose}
        title={`${entityType}の詳細`}
        centered
        size="lg"
      >
        {customContent || children}
        
        <Group justify="flex-end" gap="sm" mt="md">
          <Button onClick={onClose}>閉じる</Button>
        </Group>
      </UnifiedModal>
    );
  }

  // 編集・作成・複製・カスタムモーダル
  const titles: Partial<Record<OperationType, string>> = {
    view: `${entityType}の詳細`,
    edit: `${entityType}の編集`,
    create: `${entityType}の新規作成`,
    duplicate: `${entityType}の複製`,
    delete: `${entityType}の削除`,
    custom: `${entityType}の操作`,
  };

  return (
    <UnifiedModal
      opened={true}
      onClose={onClose}
      title={titles[operationType] || `${entityType}の操作`}
      centered
      size="lg"
    >
      {customContent || children}
      
      <Group justify="flex-end" gap="sm" mt="md">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          キャンセル
        </Button>
        <Button onClick={handleConfirm} loading={isLoading}>
          {operationType === 'create' ? '作成' : operationType === 'duplicate' ? '複製' : '保存'}
        </Button>
      </Group>
    </UnifiedModal>
  );
}
