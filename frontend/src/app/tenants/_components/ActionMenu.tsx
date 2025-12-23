'use client';

import { Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { ActionButton, ActionType } from '@/components/ActionButton';

interface ActionMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  buttonLabel?: string;
  /** アイコンコンポーネント（例: IconPlus）または undefined */
  buttonIcon?: React.ComponentType<{ size?: number | string }>;
  action?: ActionType;
  isSectionAction?: boolean;
}

export function ActionMenu({ 
  items, 
  buttonLabel = 'アクション', 
  buttonIcon,
  action = 'view',
  isSectionAction = false // Change default to false, as it's often used in headers
}: ActionMenuProps) {
  if (items.length === 0) return null;

  return (
    <Menu shadow="md" width={200} radius="md" position="bottom-end" transitionProps={{ transition: 'pop', duration: 150 }}>
      <Menu.Target>
        <ActionButton 
          action={action}
          rightSection={<IconChevronDown size={16} />}
          customIcon={buttonIcon}
          isSectionAction={isSectionAction}
        >
          {buttonLabel}
        </ActionButton>
      </Menu.Target>
      <Menu.Dropdown 
        className="glass-effect" 
        style={{ 
          border: '1px solid var(--glass-border)',
          backgroundColor: 'var(--glass-bg, #fff)',
          backdropFilter: 'blur(var(--glass-blur, 0px))',
        }}
      >
        {items.map((item) => (
          <Menu.Item 
            key={item.id} 
            leftSection={item.icon} 
            onClick={item.onClick}
            style={{ 
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-base, 8px) * 0.5)',
            }}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
