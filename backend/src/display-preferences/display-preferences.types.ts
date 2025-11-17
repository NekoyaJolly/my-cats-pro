import type { DisplayNameMode } from "@prisma/client";

export type LabelOverrideMap = Record<number, string>;

export interface DisplayPreferenceView {
  userId: string;
  breedNameMode: DisplayNameMode;
  coatColorNameMode: DisplayNameMode;
  breedLabelOverrides: LabelOverrideMap;
  coatColorLabelOverrides: LabelOverrideMap;
  updatedAt: Date;
  createdAt?: Date;
}

export interface PersonalizedMasterRecord {
  code: number;
  canonicalName: string;
  displayName: string;
  displayNameMode: DisplayNameMode;
  isOverridden: boolean;
}
