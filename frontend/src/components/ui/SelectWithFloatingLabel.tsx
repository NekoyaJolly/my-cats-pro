'use client';

import { useState } from 'react';
import { Select, type SelectProps } from '@mantine/core';
import classes from './InputWithFloatingLabel.module.css';

/**
 * InputWithFloatingLabel と同じフローティングラベルスタイルを適用したセレクトコンポーネント。
 * ドロップダウン選択に使用します。
 *
 * - 値が選択されている場合、またはフォーカス時にラベルが浮き上がる（`data-floating` 属性で制御）
 * - `value` が `null` や `undefined` の場合は空文字として扱う
 *
 * @example
 * ```tsx
 * const [gender, setGender] = useState('');
 * <SelectWithFloatingLabel
 *   label="性別"
 *   placeholder="性別を選択"
 *   data={[
 *     { value: 'MALE', label: 'Male (オス)' },
 *     { value: 'FEMALE', label: 'Female (メス)' },
 *   ]}
 *   value={gender}
 *   onChange={(value) => setGender(value ?? '')}
 * />
 * ```
 */
type SelectWithFloatingLabelProps = Omit<SelectProps, 'value'> & {
  /** 選択値（null/undefined の場合は空文字として扱う） */
  value?: string | null;
};

export function SelectWithFloatingLabel(props: SelectWithFloatingLabelProps) {
  const {
    value,
    onFocus,
    onBlur,
    classNames,
    labelProps,
    ...rest
  } = props;

  const [focused, setFocused] = useState(false);
  const normalizedValue = value ?? '';
  const floating = normalizedValue.length > 0 || focused || undefined;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <Select
      {...rest}
      value={normalizedValue || null}
      classNames={{
        root: classes.root,
        input: classes.input,
        label: classes.label,
        ...classNames,
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-floating={floating}
      labelProps={{ 'data-floating': floating, ...labelProps }}
    />
  );
}
