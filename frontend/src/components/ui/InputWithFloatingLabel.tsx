'use client';

import { useState } from 'react';
import { TextInput, type TextInputProps } from '@mantine/core';
import classes from './InputWithFloatingLabel.module.css';

/**
 * Mantine公式「Input with floating label」パターンに準拠したテキスト入力コンポーネント。
 * フォーカスまたは値がある場合にラベルが浮き上がるアニメーションを提供します。
 *
 * @example
 * ```tsx
 * const [value, setValue] = useState('');
 * <InputWithFloatingLabel
 *   label="名前"
 *   value={value}
 *   onChange={(e) => setValue(e.currentTarget.value)}
 *   required
 * />
 * ```
 */
type InputWithFloatingLabelProps = TextInputProps & {
  /** 入力値（制御コンポーネントとして使用） */
  value: string;
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
  // Mantine公式サンプルと同じロジック：
  // - 値がある、またはフォーカス中の場合は true を返す
  // - それ以外は undefined を返し、data-floating 属性が付与されない
  const floating = value.trim().length !== 0 || focused || undefined;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  // デフォルトのclassesにユーザー指定のclassNamesをマージ
  // ユーザー指定のスタイルが優先される
  const mergedClassNames = classNames
    ? { ...classes, ...classNames }
    : classes;

  return (
    <TextInput
      {...rest}
      value={value}
      classNames={mergedClassNames}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete={autoComplete}
      data-floating={floating}
      labelProps={{ 'data-floating': floating, ...labelProps }}
    />
  );
}
