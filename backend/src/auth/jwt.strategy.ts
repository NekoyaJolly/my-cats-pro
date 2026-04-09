import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

import { ACCESS_COOKIE_NAME } from "./auth.constants";
import type { JwtPayload, RequestUser } from "./auth.types";

function extractFromCookie(req: Request): string | null {
  const cookies = req?.cookies as Record<string, unknown> | undefined;
  if (!cookies) return null;
  const token = cookies[ACCESS_COOKIE_NAME];
  return typeof token === "string" ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET environment variable is required. Please set it in your .env file.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    // payload 例: { sub: userId, email, role, tenantId }
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
