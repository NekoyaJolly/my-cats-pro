'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionIcon,
  Combobox,
  Group,
  InputBase,
  Loader,
  ScrollArea,
  Text,
  useCombobox,
} from '@mantine/core';
import { IconHistory, IconSelector, IconX } from '@tabler/icons-react';
import { FormField } from '@/components/forms/FormField';
import type { MasterOption } from '@/lib/master-data/master-options';

const DEFAULT_INPUT_SANITIZE_REGEX = /[^0-9a-zA-Z]/g;
export const ALPHANUM_SPACE_HYPHEN_PATTERN = /[^0-9a-zA-Z -]/g;
const MAX_VISIBLE_OPTIONS = 50;

export interface MasterDataComboboxProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  options: MasterOption[];
  historyItems?: MasterOption[];
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  historyLabel?: string;
  nothingFoundLabel?: string;
  onOptionSelected?: (option: MasterOption | undefined) => void;
  sanitizePattern?: RegExp;
}

function sanitizeInput(value: string, pattern: RegExp) {
  return value.replace(pattern, '');
}

function formatOptionLabel(option?: MasterOption | null) {
  if (!option) {
    return '';
  }

  if (option.code === undefined) {
    return option.label;
  }

  return `${option.label}:${option.code}`;
}

function computeMatchPriority(option: MasterOption, keyword: string): number | null {
  if (!keyword) {
    return 0;
  }

  const label = option.label.toLowerCase();
  const value = option.value.toLowerCase();
  const code = option.code !== undefined ? option.code.toString() : '';

  if (label === keyword || value === keyword || code === keyword) {
    return 0;
  }

  if (label.startsWith(keyword) || value.startsWith(keyword) || code.startsWith(keyword)) {
    return 1;
  }

  if (label.includes(keyword) || value.includes(keyword) || code.includes(keyword)) {
    return 2;
  }

  return null;
}

function findOptionByValue(value: string | undefined, options: MasterOption[], history?: MasterOption[]) {
  if (!value) {
    return undefined;
  }
  return options.find((item) => item.value === value) ?? history?.find((item) => item.value === value);
}

export function MasterDataCombobox({
  label,
  placeholder = 'コードまたは名称を入力',
  value,
  onChange,
  options,
  historyItems,
  required,
  error,
  description = '半角英数字のみ入力できます。入力すると候補が絞り込まれます。',
  disabled,
  loading,
  historyLabel = '最近の選択',
  nothingFoundLabel = '一致する候補がありません',
  onOptionSelected,
  sanitizePattern,
}: MasterDataComboboxProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [inputValue, setInputValue] = useState('');
  const prevValueRef = useRef<string | undefined>(undefined);
  const effectiveSanitizePattern = sanitizePattern ?? DEFAULT_INPUT_SANITIZE_REGEX;

  useEffect(() => {
    if (prevValueRef.current === value) {
      return;
    }
    const option = findOptionByValue(value, options, historyItems);
    setInputValue(formatOptionLabel(option));
    prevValueRef.current = value;
  }, [value, options, historyItems]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) {
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }
    const keyword = inputValue.trim().toLowerCase();
    if (!keyword) {
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }

    const matches = options
      .map((option) => ({ option, priority: computeMatchPriority(option, keyword) }))
      .filter((entry): entry is { option: MasterOption; priority: number } => entry.priority !== null)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.option.label.localeCompare(b.option.label, 'ja');
      })
      .slice(0, MAX_VISIBLE_OPTIONS)
      .map((entry) => entry.option);

    return matches;
  }, [inputValue, options]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(event.currentTarget.value, effectiveSanitizePattern);
    setInputValue(sanitized);
    combobox.openDropdown();
  }, [combobox, effectiveSanitizePattern]);

  const handleOptionSubmit = useCallback((optionValue: string) => {
    const option = findOptionByValue(optionValue, options, historyItems);
    onChange(option?.value);
    onOptionSelected?.(option);
    setInputValue(formatOptionLabel(option));
    combobox.closeDropdown();
  }, [historyItems, onChange, onOptionSelected, options, combobox]);

  const handleClear = useCallback(() => {
    onChange(undefined);
    onOptionSelected?.(undefined);
    setInputValue('');
    combobox.openDropdown();
  }, [combobox, onChange, onOptionSelected]);

  const nothingFound = loading ? (
    <Group gap="xs" px="xs">
      <Loader size="xs" />
      <Text size="sm">読み込み中...</Text>
    </Group>
  ) : (
    <Text size="sm" c="dimmed" px="xs">
      {nothingFoundLabel}
    </Text>
  );

  const showHistory = (historyItems?.length ?? 0) > 0;

  return (
    <FormField label={label} description={description} error={error} required={required}>
      <Combobox store={combobox} onOptionSubmit={handleOptionSubmit} disabled={disabled} withinPortal={false}>
        <Combobox.Target>
          <InputBase
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => combobox.openDropdown()}
            onClick={() => combobox.openDropdown()}
            placeholder={placeholder}
            disabled={disabled}
            rightSection={(
              <Group gap={4} wrap="nowrap">
                {value && !disabled && (
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={handleClear}
                    aria-label={`${label}をクリア`}
                  >
                    <IconX size={14} stroke={1.5} />
                  </ActionIcon>
                )}
                {loading ? <Loader size="xs" /> : <IconSelector size={16} stroke={1.5} />}
              </Group>
            )}
            rightSectionPointerEvents="auto"
            data-autofocus={false}
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <ScrollArea.Autosize mah={280} type="always">
            <Combobox.Options>
              {showHistory && (
                <Combobox.Group label={historyLabel}>
                  {historyItems?.map((item) => (
                    <Combobox.Option value={item.value} key={`history-${item.value}`}>
                      <Group gap="xs">
                        <IconHistory size={14} />
                        <Text size="sm" fw={500}>
                          {formatOptionLabel(item)}
                        </Text>
                      </Group>
                    </Combobox.Option>
                  ))}
                </Combobox.Group>
              )}

              {filteredOptions.length > 0 ? (
                <Combobox.Group label="候補">
                  {filteredOptions.map((item) => (
                    <Combobox.Option value={item.value} key={item.value}>
                      <Text size="sm" fw={500}>
                        {formatOptionLabel(item)}
                      </Text>
                    </Combobox.Option>
                  ))}
                </Combobox.Group>
              ) : (
                <Combobox.Empty>{nothingFound}</Combobox.Empty>
              )}
            </Combobox.Options>
          </ScrollArea.Autosize>
        </Combobox.Dropdown>
      </Combobox>
    </FormField>
  );
}
