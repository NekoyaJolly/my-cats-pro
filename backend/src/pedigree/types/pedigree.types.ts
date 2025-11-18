import { Prisma } from "@prisma/client";

// Prisma の正規 where 型をそのまま利用し、柔軟なフィルタに対応
export type PedigreeWhereInput = Prisma.PedigreeWhereInput;

// Type for query building without any
export interface QueryFilterInput {
  [key: string]: string | undefined;
}

// Type for safe field mapping
export interface FieldMapping {
  [dtoField: string]: string; // Maps DTO field to database field
}

export const pedigreeWithRelationsInclude = Prisma.validator<Prisma.PedigreeInclude>()({
  breed: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  coatColor: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  gender: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
});

// Pedigree with relationships for responses
export type PedigreeWithRelations = Prisma.PedigreeGetPayload<{
  include: typeof pedigreeWithRelationsInclude;
}>;

// API Response types
export interface PedigreeCreateResponse {
  success: true;
  data: PedigreeWithRelations;
}

export interface PedigreeListResponse {
  success: true;
  data: PedigreeWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Type for family tree structure
// Pedigreeモデルは血統情報を文字列フィールドとして保持しているため、
// リレーションではなくフラットな構造
export type PedigreeTreeNode = Prisma.PedigreeGetPayload<{
  include: typeof pedigreeWithRelationsInclude;
}>;

export interface PedigreeSuccessResponse {
  success: true;
}