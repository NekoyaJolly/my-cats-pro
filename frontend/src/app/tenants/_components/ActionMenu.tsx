'use client';

import { Menu, Button } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

interface ActionMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
}

export function ActionMenu({ items, buttonLabel = 'アクション', buttonIcon }: ActionMenuProps) {
  if (items.length === 0) return null;

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button leftSection={buttonIcon} rightSection={<IconChevronDown size={16} />}>
          {buttonLabel}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {items.map((item) => (
          <Menu.Item key={item.id} leftSection={item.icon} onClick={item.onClick}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
