import { randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

interface CsrfJwtPayload {
  purpose: 'csrf';
  jti: string;
}

@Injectable()
export class CsrfTokenService {
  private readonly secret: string;
  private readonly ttlSeconds: number;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    // Require CSRF_TOKEN_SECRET in production, fallback to JWT_SECRET in development only
    const csrfSecret = this.configService.get<string>('CSRF_TOKEN_SECRET');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    
    if (process.env.NODE_ENV === 'production' && !csrfSecret) {
      throw new Error('CSRF_TOKEN_SECRET must be set in production environment');
    }
    
    this.secret = csrfSecret || jwtSecret || '';
    
    if (!this.secret) {
      throw new Error('CSRF_TOKEN_SECRET or JWT_SECRET must be configured');
    }

    const ttlFromEnv = Number(this.configService.get<string>('CSRF_TOKEN_TTL_SECONDS') ?? '600');
    this.ttlSeconds = Number.isFinite(ttlFromEnv) && ttlFromEnv > 0 ? ttlFromEnv : 600;

    this.issuer = this.configService.get<string>('CSRF_TOKEN_ISSUER') || 'mycats-pro-backend';
    this.audience = this.configService.get<string>('CSRF_TOKEN_AUDIENCE') || 'csrf';
  }

  createToken(): string {
    const payload: CsrfJwtPayload = {
      purpose: 'csrf',
      jti: randomBytes(24).toString('hex'),
    };

    const options: JwtSignOptions = {
      expiresIn: this.ttlSeconds,
      issuer: this.issuer,
      audience: this.audience,
      secret: this.secret,
    };

    return this.jwtService.sign(payload, options);
  }

  validateToken(token: string): boolean {
    try {
      const verifyOptions: JwtVerifyOptions = {
        issuer: this.issuer,
        audience: this.audience,
        secret: this.secret,
      };

      const decoded = this.jwtService.verify<CsrfJwtPayload>(token, verifyOptions);

      if (decoded.purpose !== 'csrf' || !decoded.jti) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

}
