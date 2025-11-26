import type { UserRole } from "@prisma/client";
export type { UserRole };

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  role?: UserRole;
  tenantId?: string; // マルチテナント対応
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  userId: string;
  email?: string;
  role?: UserRole;
  tenantId?: string; // マルチテナント対応
  firstName?: string;
  lastName?: string;
}
