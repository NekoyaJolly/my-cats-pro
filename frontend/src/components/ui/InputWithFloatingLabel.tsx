'use client';

import { useState } from 'react';
import { TextInput, type TextInputProps } from '@mantine/core';
import classes from './InputWithFloatingLabel.module.css';

/**
 * PedigreeRegistrationForm の基本項目入力スタイルを共通化したテキスト入力コンポーネント。
 * このプロジェクトにおける標準的な1行テキスト入力として使用します。
 *
 * - 入力値がある場合、またはフォーカス時にラベルが浮き上がる（`data-floating` 属性で制御）
 * - `value` が `null` や `undefined` の場合は空文字として扱う
 *
 * @example
 * ```tsx
 * const [name, setName] = useState('');
 * <InputWithFloatingLabel
 *   label="猫の名前"
 *   value={name}
 *   onChange={(e) => setName(e.currentTarget.value)}
 * />
 * ```
 */
type InputWithFloatingLabelProps = Omit<TextInputProps, 'value'> & {
  /** 入力値（null/undefined の場合は空文字として扱う） */
  value?: string | null;
};

export function InputWithFloatingLabel(props: InputWithFloatingLabelProps) {
  const {
    value,
    onFocus,
    onBlur,
    classNames,
    labelProps,
    autoComplete = 'off',
    ...rest
  } = props;

  const [focused, setFocused] = useState(false);
  // null/undefined を空文字として扱う
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
    <TextInput
      {...rest}
      value={normalizedValue}
      classNames={{
        root: classes.root,
        input: classes.input,
        label: classes.label,
        ...classNames,
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete={autoComplete}
      data-floating={floating}
      labelProps={{ 'data-floating': floating, ...labelProps }}
    />
  );
}
