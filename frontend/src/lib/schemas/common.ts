import { z } from 'zod';

/**
 * 空文字列を undefined に正規化するオプション文字列
 */
export const optionalTrimmedString = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });
