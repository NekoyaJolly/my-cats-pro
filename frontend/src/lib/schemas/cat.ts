import { z } from 'zod';
import { optionalTrimmedString } from './common';

const genderErrorMap = () => ({ message: '性別を選択してください' });

export const catFormSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  gender: z.enum(['MALE', 'FEMALE', 'NEUTER', 'SPAY'], {
    errorMap: genderErrorMap,
  }),
  birthDate: z
    .string()
    .min(1, '生年月日を入力してください')
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, '生年月日はYYYY-MM-DD形式で入力してください'),
  breedId: optionalTrimmedString,
  coatColorId: optionalTrimmedString,
  microchipNumber: optionalTrimmedString,
  registrationId: optionalTrimmedString,
  description: optionalTrimmedString,
  isInHouse: z.boolean().default(true),
  tagIds: z.array(z.string()).default([]),
});

export type CatFormSchema = z.infer<typeof catFormSchema>;
