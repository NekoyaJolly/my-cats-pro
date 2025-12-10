'use client';

import { useState } from 'react';
import { Textarea, type TextareaProps } from '@mantine/core';
import classes from './InputWithFloatingLabel.module.css';

/**
 * InputWithFloatingLabel と同じフローティングラベルスタイルを適用したテキストエリアコンポーネント。
 * 複数行のテキスト入力に使用します。
 *
 * - 入力値がある場合、またはフォーカス時にラベルが浮き上がる（`data-floating` 属性で制御）
 * - `value` が `null` や `undefined` の場合は空文字として扱う
 *
 * @example
 * ```tsx
 * const [description, setDescription] = useState('');
 * <TextareaWithFloatingLabel
 *   label="備考"
 *   value={description}
 *   onChange={(e) => setDescription(e.currentTarget.value)}
 *   minRows={3}
 * />
 * ```
 */
type TextareaWithFloatingLabelProps = Omit<TextareaProps, 'value'> & {
  /** 入力値（null/undefined の場合は空文字として扱う） */
  value?: string | null;
};

export function TextareaWithFloatingLabel(props: TextareaWithFloatingLabelProps) {
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

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <Textarea
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
