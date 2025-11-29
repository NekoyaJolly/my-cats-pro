'use client';

import { useState } from 'react';
import { TextInput, type TextInputProps } from '@mantine/core';
import classes from './InputWithFloatingLabel.module.css';

type InputWithFloatingLabelProps = TextInputProps & {
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
  const floating = value.trim().length !== 0 || focused || undefined;

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
      value={value}
      classNames={{ ...classes, ...classNames }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      autoComplete={autoComplete}
      data-floating={floating}
      labelProps={{ 'data-floating': floating, ...labelProps }}
    />
  );
}
