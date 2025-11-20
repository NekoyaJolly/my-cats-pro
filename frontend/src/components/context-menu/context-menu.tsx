'use client';

import { useState, useRef, useEffect, ReactNode, cloneElement, isValidElement, createContext, useContext } from 'react';
import { Menu, Portal } from '@mantine/core';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconCopy,
  IconDownload,
  IconPrinter,
  IconShare,
  IconPlus,
  IconDots,
} from '@tabler/icons-react';

// グローバルメニュー管理用のContext
interface ContextMenuContextType {
  currentMenuId: string | null;
  setCurrentMenuId: (id: string | null) => void;
}

const ContextMenuContext = createContext<ContextMenuContextType>({
  currentMenuId: null,
  setCurrentMenuId: () => {},
});

export function ContextMenuManager({ children }: { children: ReactNode }) {
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  
  return (
    <ContextMenuContext.Provider value={{ currentMenuId, setCurrentMenuId }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export type ContextAction = 
  | 'view'
  | 'edit'
  | 'delete'
  | 'duplicate'
  | 'export'
  | 'print'
  | 'share'
  | 'create';

export interface CustomAction {
  id: string;
  label: string;
  icon?: ReactNode;
  color?: string;
  divider?: boolean;
}

export interface ContextMenuAction {
  action: ContextAction | string;
  label?: string;
  icon?: ReactNode;
  color?: string;
  disabled?: boolean;
  hidden?: boolean;
}

interface ContextMenuProviderProps<T = unknown> {
  children: ReactNode;
  entity?: T;
  entityType?: string;
  actions?: (ContextAction | string)[];
  customActions?: CustomAction[];
  onAction?: (action: string, entity?: T) => void;
  disabled?: boolean;
  enableDoubleClick?: boolean;
  doubleClickAction?: ContextAction | string;
}

const defaultIcons: Record<ContextAction, ReactNode> = {
  view: <IconEye size={16} />,
  edit: <IconEdit size={16} />,
  delete: <IconTrash size={16} />,
  duplicate: <IconCopy size={16} />,
  export: <IconDownload size={16} />,
  print: <IconPrinter size={16} />,
  share: <IconShare size={16} />,
  create: <IconPlus size={16} />,
};

const defaultLabels: Record<ContextAction, string> = {
  view: '詳細を見る',
  edit: '編集',
  delete: '削除',
  duplicate: '複製',
  export: 'エクスポート',
  print: '印刷',
  share: '共有',
  create: '新規作成',
};

const defaultColors: Partial<Record<ContextAction, string>> = {
  delete: 'red',
};

export function ContextMenuProvider<T = unknown>({
  children,
  entity,
  entityType,
  actions = ['view', 'edit', 'delete'],
  customActions = [],
  onAction,
  disabled = false,
  enableDoubleClick = true,
  doubleClickAction = 'edit',
}: ContextMenuProviderProps<T>) {
  const [opened, setOpened] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const menuIdRef = useRef<string>(Math.random().toString(36).substring(7));
  
  // グローバルメニュー管理
  const { currentMenuId, setCurrentMenuId } = useContext(ContextMenuContext);
  
  // 他のメニューが開いたら自分を閉じる
  useEffect(() => {
    if (currentMenuId !== null && currentMenuId !== menuIdRef.current) {
      setOpened(false);
    }
  }, [currentMenuId]);

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!opened) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Menu.Dropdown要素とその子孫かチェック
      const dropdown = document.querySelector('[data-menu-dropdown]');
      if (dropdown && !dropdown.contains(target)) {
        setOpened(false);
        setCurrentMenuId(null);
      }
    };

    // 少し遅延させてから追加（右クリックイベントの後に実行されるように）
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [opened, setCurrentMenuId]);

  // 右クリックハンドラー
  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // グローバルに現在のメニューIDを設定（他のメニューを閉じる）
    setCurrentMenuId(menuIdRef.current);
    setPosition({ x: e.clientX, y: e.clientY });
    setOpened(true);
  };

  // ダブルクリックハンドラー
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (disabled || !enableDoubleClick) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (onAction && doubleClickAction) {
      onAction(doubleClickAction, entity);
    }
  };

  // モバイル向けダブルタップハンドラー
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // ダブルタップ検知
      e.preventDefault();
      if (onAction && doubleClickAction && enableDoubleClick) {
        onAction(doubleClickAction, entity);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  // 長押しでコンテキストメニュー（モバイル）
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    const timer = setTimeout(() => {
      setPosition({ x: touch.clientX, y: touch.clientY });
      setOpened(true);
    }, 500); // 500msの長押し

    setLongPressTimer(timer);
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  // アクション実行
  const handleActionClick = (action: string) => {
    setOpened(false);
    setCurrentMenuId(null);
    if (onAction) {
      onAction(action, entity);
    }
  };

  // アクション設定を構築
  const buildActionConfig = (action: ContextAction | string): ContextMenuAction => {
    if (typeof action === 'string' && action in defaultIcons) {
      const contextAction = action as ContextAction;
      return {
        action: contextAction,
        label: defaultLabels[contextAction],
        icon: defaultIcons[contextAction],
        color: defaultColors[contextAction],
      };
    }

    // カスタムアクション
    const customAction = customActions.find((a) => a.id === action);
    if (customAction) {
      return {
        action: customAction.id,
        label: customAction.label,
        icon: customAction.icon || <IconDots size={16} />,
        color: customAction.color,
      };
    }

    return {
      action,
      label: action,
      icon: <IconDots size={16} />,
    };
  };

  const actionConfigs = actions.map(buildActionConfig);

  // 子要素にイベントハンドラーを追加
  const childWithHandlers = isValidElement(children)
    ? cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<any> }>, {
        ref: containerRef,
        onContextMenu: handleContextMenu,
        onDoubleClick: handleDoubleClick,
        onTouchEnd: handleTouchEnd,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchCancel: handleTouchCancel,
        style: {
          ...((children as React.ReactElement<{ style?: React.CSSProperties }>).props.style || {}),
          cursor: disabled ? 'default' : 'context-menu',
          userSelect: 'none',
        },
      })
    : children;

  return (
    <>
      {childWithHandlers}

      {opened && (
        <Portal>
          <Menu
            opened={opened}
            onClose={() => {
              setOpened(false);
              setCurrentMenuId(null);
            }}
            position="right-start"
            withArrow
            shadow="md"
          >
            <Menu.Target>
              <div
                ref={menuRef}
                style={{
                  position: 'fixed',
                  left: position.x,
                  top: position.y,
                  width: 1,
                  height: 1,
                  pointerEvents: 'none',
                }}
              />
            </Menu.Target>
            <Menu.Dropdown data-menu-dropdown>
              <Menu.Label>
                {entityType ? `${entityType}の操作` : '操作'}
              </Menu.Label>

              {actionConfigs.map((config, index) => {
                const customAction = customActions.find((a) => a.id === config.action);
                
                return (
                  <div key={config.action}>
                    {customAction?.divider && index > 0 && <Menu.Divider />}
                    <Menu.Item
                      leftSection={config.icon}
                      color={config.color}
                      disabled={config.disabled}
                      onClick={() => handleActionClick(config.action)}
                    >
                      {config.label}
                    </Menu.Item>
                  </div>
                );
              })}

              {customActions.length > 0 && actions.length > 0 && (
                <Menu.Divider />
              )}

              {customActions
                .filter((action) => !actions.includes(action.id))
                .map((action, index) => (
                  <div key={action.id}>
                    {action.divider && index > 0 && <Menu.Divider />}
                    <Menu.Item
                      leftSection={action.icon || <IconDots size={16} />}
                      color={action.color}
                      onClick={() => handleActionClick(action.id)}
                    >
                      {action.label}
                    </Menu.Item>
                  </div>
                ))}
            </Menu.Dropdown>
          </Menu>
        </Portal>
      )}
    </>
  );
}
