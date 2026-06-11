import type { UserRole } from "@prisma/client";
export type { UserRole };

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role?: UserRole;
  tenantId?: string; // マルチテナント対応
  /** 機能ドメイン単位の個別権限（auth/permissions.ts の Permission 値） */
  permissions?: string[];
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  userId: string;
  email?: string;
  role?: UserRole;
  tenantId?: string; // マルチテナント対応
  /** 機能ドメイン単位の個別権限（auth/permissions.ts の Permission 値） */
  permissions?: string[];
  firstName?: string;
  lastName?: string;
}
