'use client';

import { useState, useCallback } from 'react';

import { OperationType } from './operation-modal-manager';

export interface UseContextMenuReturn<T = unknown> {
  currentOperation: OperationType | null;
  currentEntity: T | null;
  openOperation: (operation: OperationType, entity?: T) => void;
  closeOperation: () => void;
  handleAction: (action: string, entity?: T) => void;
}

export function useContextMenu<T = unknown>(
  customHandlers?: Partial<Record<string, (entity?: T) => void | Promise<void>>>
): UseContextMenuReturn<T> {
  const [currentOperation, setCurrentOperation] = useState<OperationType | null>(null);
  const [currentEntity, setCurrentEntity] = useState<T | null>(null);

  const openOperation = useCallback((operation: OperationType, entity?: T) => {
    setCurrentOperation(operation);
    setCurrentEntity(entity || null);
  }, []);

  const closeOperation = useCallback(() => {
    setCurrentOperation(null);
    setCurrentEntity(null);
  }, []);

  const handleAction = useCallback((action: string, entity?: T) => {
    // カスタムハンドラーがあれば実行
    if (customHandlers && action in customHandlers) {
      const handler = customHandlers[action];
      if (handler) {
        handler(entity);
        return;
      }
    }

    // デフォルトの操作マッピング
    const operationMap: Record<string, OperationType> = {
      view: 'view',
      edit: 'edit',
      delete: 'delete',
      duplicate: 'duplicate',
      create: 'create',
    };

    const operation = operationMap[action];
    if (operation) {
      openOperation(operation, entity);
    } else {
      // カスタム操作
      openOperation('custom', entity);
    }
  }, [customHandlers, openOperation]);

  return {
    currentOperation,
    currentEntity,
    openOperation,
    closeOperation,
    handleAction,
  };
}
