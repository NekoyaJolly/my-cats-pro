This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: backend/prisma/schema.prisma, backend/src/tags/**, backend/src/tenants/**, backend/src/users/**, backend/src/auth/**, backend/src/shift/**, backend/src/staff/**, frontend/src/app/tags/**, frontend/src/app/tenants/**, frontend/src/app/settings/**, frontend/src/app/staff/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
backend/
  prisma/
    schema.prisma
  src/
    auth/
      dto/
        change-password.dto.ts
        login.dto.ts
        password-reset.dto.ts
        refresh-token.dto.ts
        request-password-reset.dto.ts
        reset-password.dto.ts
      auth.constants.spec.ts
      auth.constants.ts
      auth.controller.ts
      auth.module.ts
      auth.service.spec.ts
      auth.service.ts
      auth.types.ts
      get-user.decorator.ts
      jwt-auth.guard.ts
      jwt.strategy.ts
      login-attempt.service.ts
      password.service.ts
      role.guard.spec.ts
      role.guard.ts
      roles.decorator.ts
    shift/
      dto/
        create-shift-template.dto.ts
        create-shift.dto.ts
        get-shifts-query.dto.ts
        update-shift.dto.ts
      shift.controller.spec.ts
      shift.controller.ts
      shift.module.ts
      shift.service.spec.ts
      shift.service.ts
    staff/
      dto/
        create-staff.dto.ts
        update-staff.dto.ts
      staff.controller.spec.ts
      staff.controller.ts
      staff.module.ts
      staff.service.spec.ts
      staff.service.ts
    tags/
      dto/
        assign-tag.dto.ts
        create-tag-automation-rule.dto.ts
        create-tag-category.dto.ts
        create-tag-group.dto.ts
        create-tag.dto.ts
        index.ts
        reorder-tag-category.dto.ts
        reorder-tag-group.dto.ts
        reorder-tag.dto.ts
        update-tag-automation-rule.dto.ts
        update-tag-category.dto.ts
        update-tag-group.dto.ts
        update-tag.dto.ts
      events/
        tag-automation.events.ts
      age-threshold-checker.service.ts
      tag-automation-execution.service.ts
      tag-automation.controller.ts
      tag-automation.service.spec.ts
      tag-automation.service.ts
      tag-categories.controller.ts
      tag-categories.service.ts
      tag-groups.controller.ts
      tag-groups.service.ts
      tags.controller.ts
      tags.module.ts
      tags.service.ts
    tenants/
      dto/
        create-tenant.dto.ts
        invitation.dto.ts
        update-tenant.dto.ts
      tenants.controller.ts
      tenants.module.ts
      tenants.service.spec.ts
      tenants.service.ts
    users/
      dto/
        invite-user.dto.ts
        update-profile.dto.ts
        update-user-role.dto.ts
      users.controller.ts
      users.module.ts
      users.service.spec.ts
      users.service.ts
frontend/
  src/
    app/
      settings/
        page.tsx
      staff/
        shifts/
          page.tsx
      tags/
        components/
          AutomationIndicator.tsx
          AutomationRuleModal.tsx
          AutomationTab.tsx
          CategoriesTab.tsx
          CategoryModal.tsx
          ExecuteRuleModal.tsx
          GroupModal.tsx
          index.ts
          SortableCategoryCard.tsx
          SortableGroupCard.tsx
          SortableTagItem.tsx
          TagModal.tsx
          TagsListTab.tsx
        hooks/
          index.ts
          useAutomationRulesData.ts
          useTagPageData.ts
        constants.ts
        page.tsx
        types.ts
        utils.ts
      tenants/
        _components/
          ActionMenu.tsx
          BottomNavSettings.tsx
          EditTenantModal.tsx
          InviteTenantAdminModal.tsx
          InviteUserModal.tsx
          TenantsList.tsx
          TenantsManagement.tsx
          UserProfileForm.tsx
          UsersList.tsx
        page.tsx
```

# Files

## File: backend/src/auth/dto/change-password.dto.ts
```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    description: "現在のパスワード",
    example: "oldPassword123!",
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description:
      "新しいパスワード（8文字以上、大文字・小文字・数字・特殊文字を含む）",
    example: "NewSecurePassword123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "パスワードは8文字以上である必要があります" })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "パスワードには大文字、小文字、数字、特殊文字を含める必要があります",
    },
  )
  newPassword: string;
}
```

## File: backend/src/auth/dto/login.dto.ts
```typescript
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "ログインに使用するメールアドレス",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "有効なメールアドレスを入力してください" })
  @Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({
    description: "パスワード (8文字以上推奨)",
    example: "SecurePassword123!",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "パスワードは6文字以上である必要があります" })
  password: string;
}
```

## File: backend/src/auth/dto/password-reset.dto.ts
```typescript
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class PasswordResetDto {
  @ApiProperty({
    description: "パスワードリセットを行うメールアドレス",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "有効なメールアドレスを入力してください" })
  @Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  email: string;
}
```

## File: backend/src/auth/dto/refresh-token.dto.ts
```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'リフレッシュトークン (Cookie利用時は省略可)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsOptional()
  @IsString({ message: 'リフレッシュトークンは文字列である必要があります' })
  refreshToken?: string;
}
```

## File: backend/src/auth/dto/request-password-reset.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'メールアドレス',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;
}
```

## File: backend/src/auth/dto/reset-password.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'パスワードリセットトークン',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString({ message: 'トークンは文字列である必要があります' })
  @IsNotEmpty({ message: 'トークンは必須です' })
  token: string;

  @ApiProperty({
    description: '新しいパスワード',
    example: 'NewSecurePassword123!',
  })
  @IsString({ message: 'パスワードは文字列である必要があります' })
  @MinLength(8, { message: 'パスワードは8文字以上である必要があります' })
  @IsNotEmpty({ message: 'パスワードは必須です' })
  newPassword: string;
}
```

## File: backend/src/auth/auth.constants.spec.ts
```typescript
import { isSecureEnv, getRefreshCookieSameSite } from './auth.constants';

describe('Auth Constants', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore original NODE_ENV after each test
    process.env.NODE_ENV = originalEnv;
  });

  describe('isSecureEnv', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(isSecureEnv()).toBe(true);
    });

    it('should return false when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      expect(isSecureEnv()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      expect(isSecureEnv()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(isSecureEnv()).toBe(false);
    });
  });

  describe('getRefreshCookieSameSite', () => {
    it('should return "none" when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(getRefreshCookieSameSite()).toBe('none');
    });

    it('should return "lax" when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      expect(getRefreshCookieSameSite()).toBe('lax');
    });

    it('should return "lax" when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      expect(getRefreshCookieSameSite()).toBe('lax');
    });

    it('should return "lax" when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(getRefreshCookieSameSite()).toBe('lax');
    });
  });
});
```

## File: backend/src/auth/auth.constants.ts
```typescript
// Authentication related constants (cookie names, lifetimes, etc.)
export const REFRESH_COOKIE_NAME = 'rt';
export const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * 本番環境かどうかを判定
 */
export function isSecureEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Cookie の SameSite 設定を取得
 * 本番環境では 'none' を使用（異なるサブドメイン間での通信に必要）
 * 開発環境では 'lax' を使用（HTTP でも動作する）
 */
export function getRefreshCookieSameSite(): 'lax' | 'none' {
  return isSecureEnv() ? 'none' : 'lax';
}
```

## File: backend/src/auth/auth.controller.ts
```typescript
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Ip,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";

import { RateLimitConfig } from "../common/config/rate-limit.config";
import { RateLimit } from "../common/decorators/rate-limit.decorator";

function toUserRole(val: string): RequestUser["role"] {
  // UserRole enumに定義されているロールのみ認識する
  if (val === "SUPER_ADMIN" || val === "TENANT_ADMIN" || val === "ADMIN" || val === "USER") {
    return val as RequestUser["role"];
  }
  return "USER";
}


import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_MAX_AGE_MS, getRefreshCookieSameSite, isSecureEnv } from './auth.constants';
import { AuthService } from "./auth.service";
import type { RequestUser } from "./auth.types";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { GetUser } from "./get-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
  ) {}

  @Post("login")
  @RateLimit(RateLimitConfig.auth.login)
  @ApiOperation({ summary: "ログイン（JWT発行）" })
  @ApiResponse({ status: HttpStatus.OK })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ success: boolean; data: { access_token: string; user: RequestUser } }> {
    let userAgent: string = "";
    const ua = req.headers["user-agent"];
    if (typeof ua === "string") {
      userAgent = ua;
    } else if (Array.isArray(ua)) {
      userAgent = (ua as string[]).join(",");
    }
    const result = await this.auth.login(dto.email, dto.password, ip, userAgent);
    const userRaw = result.data.user;
    const requestUser: RequestUser = {
      userId: userRaw.id,
      email: userRaw.email,
      role: toUserRole(userRaw.role),
      firstName: userRaw.firstName ?? undefined,
      lastName: userRaw.lastName ?? undefined,
    };
    const storedRefreshToken = await this.auth.getStoredRefreshToken(userRaw.id);
    if (storedRefreshToken) {
      this.setRefreshCookie(res, storedRefreshToken);
    }
    return { success: result.success, data: { access_token: result.data.access_token, user: requestUser } };
  }

  @Post("register")
  @RateLimit(RateLimitConfig.auth.register)
  @ApiOperation({ summary: "ユーザー登録（メール＋パスワード）" })
  @ApiResponse({ status: HttpStatus.OK })
  async register(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto.email, dto.password);
    if (result.data.refresh_token) {
      this.setRefreshCookie(res, result.data.refresh_token);
    }
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("set-password")
  @ApiOperation({ summary: "パスワード設定/変更（要JWT）" })
  @ApiResponse({ status: HttpStatus.OK })
  setPassword(@GetUser() user: RequestUser | undefined, @Body() dto: LoginDto) {
    return this.auth.setPassword(user!.userId, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @ApiOperation({ summary: "パスワード変更（現在のパスワード確認必要）" })
  @ApiResponse({ status: HttpStatus.OK })
  changePassword(
    @GetUser() user: RequestUser | undefined,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(
      user!.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post("request-password-reset")
  @RateLimit(RateLimitConfig.auth.requestReset)
  @ApiOperation({ summary: "パスワードリセット要求" })
  @ApiResponse({ status: HttpStatus.OK, description: 'リセット手順をメールで送信' })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Post("reset-password")
  @RateLimit(RateLimitConfig.auth.resetPassword)
  @ApiOperation({ summary: "パスワードリセット実行" })
  @ApiResponse({ status: HttpStatus.OK, description: 'パスワードがリセットされました' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '無効または期限切れのトークン' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }

  @Post("refresh")
  @RateLimit(RateLimitConfig.auth.refresh)
  @ApiOperation({ summary: "リフレッシュトークンでアクセストークン再取得" })
  @ApiResponse({ status: HttpStatus.OK })
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response): Promise<{ success: boolean; data: { access_token: string; user: RequestUser } }> {
    // DTO 互換モード: body に入っていれば利用、無ければ Cookie 参照（将来的には完全Cookie化）
    const cookieToken = this.getCookieValue(res, REFRESH_COOKIE_NAME);
    const token = dto?.refreshToken ?? cookieToken;
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.auth.refreshUsingToken(token);
    const user = result.user;
    const requestUser: RequestUser = {
      userId: user.id,
      email: user.email,
      role: toUserRole(user.role),
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    };
    this.setRefreshCookie(res, result.refresh_token);
    return { success: true, data: { access_token: result.access_token, user: requestUser } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiOperation({ summary: "ログアウト（リフレッシュトークン削除）" })
  @ApiResponse({ status: HttpStatus.OK })
  logout(@GetUser() user: RequestUser | undefined, @Res({ passthrough: true }) res: Response) {
    // Cookie 無効化
    res.cookie(REFRESH_COOKIE_NAME, '', { httpOnly: true, secure: isSecureEnv(), sameSite: getRefreshCookieSameSite(), path: '/', maxAge: 0 });
    return this.auth.logout(user!.userId);
  }

  private getCookieValue(res: Response, key: string): string | undefined {
    const reqLike = res.req as unknown;
    if (!reqLike || typeof reqLike !== 'object') {
      return undefined;
    }

    const cookies = (reqLike as { cookies?: unknown }).cookies;
    if (!cookies || typeof cookies !== 'object') {
      return undefined;
    }

    const value = (cookies as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecureEnv(),
      sameSite: getRefreshCookieSameSite(),
      path: '/',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

}
```

## File: backend/src/auth/auth.module.ts
```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { PrismaModule } from "../prisma/prisma.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { LoginAttemptService } from "./login-attempt.service";
import { PasswordService } from "./password.service";

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error(
            'JWT_SECRET environment variable is required. Please set it in your .env file.',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>("JWT_EXPIRES_IN") || "7d",
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, PasswordService, LoginAttemptService, JwtAuthGuard],
  exports: [JwtModule, PassportModule, PasswordService, LoginAttemptService, JwtAuthGuard],
})
export class AuthModule {}
```

## File: backend/src/auth/auth.service.spec.ts
```typescript
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { AuthService } from './auth.service';
import { LoginAttemptService } from './login-attempt.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'fake-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                ARGON2_MEMORY_COST: '65536',
                ARGON2_TIME_COST: '3',
                ARGON2_PARALLELISM: '4',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(() => Promise.resolve('hashed-password')),
            verify: jest.fn(() => Promise.resolve(true)),
          },
        },
        {
          provide: LoginAttemptService,
          useValue: {
            checkAndRecordAttempt: jest.fn(() => Promise.resolve({ allowed: true })),
            clearFailedAttempts: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## File: backend/src/auth/auth.service.ts
```typescript
import { randomUUID, randomBytes } from "crypto";

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole, User } from "@prisma/client";
import * as bcrypt from "bcryptjs";

import { PrismaService } from "../prisma/prisma.service";

import { LoginAttemptService, LoginAttemptData } from "./login-attempt.service";
import { PasswordService } from "./password.service";

type ValidatedUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  passwordHash: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
};

export interface AuthUserView {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
}

export interface LoginResult {
  success: true;
  data: {
    access_token: string;
    user: AuthUserView;
  };
}

export interface RegisterResult {
  success: true;
  data: {
    id: string;
    email: string;
    access_token: string;
    refresh_token: string;
    user: AuthUserView;
  };
}

export interface RefreshTokenResult {
  access_token: string;
  refresh_token: string;
  user: AuthUserView;
}


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly loginAttemptService: LoginAttemptService,
  ) {}

  async validateUser(email: string, password: string): Promise<ValidatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user || !user.passwordHash) return null;

    // パスワード検証（Argon2またはbcrypt）
    let isValidPassword = false;
    const isArgon2 = this.passwordService.isArgon2Hash(user.passwordHash);
    
    if (isArgon2) {
      isValidPassword = await this.passwordService.verifyPassword(
        password,
        user.passwordHash,
      );
    } else if (this.passwordService.needsMigration(user.passwordHash)) {
      // bcryptからの移行
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (isValidPassword) {
        // パスワードが正しい場合、Argon2にアップグレード
        const newHash = await this.passwordService.hashPassword(password);
        await this.setPassword(user.id, newHash, true);
      }
    }

    if (!isValidPassword) return null;
    return user;
  }

  /**
   * ログイン: ユーザ検証→Access/Refreshトークン発行→RefreshトークンをDB保存（CookieセットはController側）
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    email = email.trim().toLowerCase();
    // アカウントロック状態をチェック
    const isLocked = await this.loginAttemptService.isAccountLocked(email);
    if (isLocked) {
      const remainingMinutes =
        await this.loginAttemptService.getLockoutRemainingMinutes(email);

      // 失敗試行を記録
      await this.loginAttemptService.recordLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: "Account locked",
      });

      throw new HttpException(
        `アカウントがロックされています。${remainingMinutes}分後に再試行してください。`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // ユーザー認証
    const user = await this.validateUser(email, password);

    const loginAttemptData: LoginAttemptData = {
      email,
      ipAddress,
      userAgent,
      success: !!user,
      reason: user ? undefined : "Invalid credentials",
    };

    // ログイン試行を記録
    await this.loginAttemptService.recordLoginAttempt(loginAttemptData);

    if (!user) {
      this.logger.warn({
        message: 'Login failed: Invalid credentials',
        email,
        ipAddress,
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedException("認証情報が正しくありません");
    }

    // generateTokens にフルユーザー型が必要なため再取得
    const fullUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser) {
      this.logger.error(`User ${user.id} disappeared during login flow`);
      throw new UnauthorizedException("ユーザーが見つかりません");
    }
    const tokens = await this.generateTokens(fullUser);

    // ログイン成功ログ
    this.logger.log({
      message: 'Login successful',
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        access_token: tokens.access_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  async setPassword(
    userId: string,
    password: string,
    isHashed: boolean = false,
  ): Promise<{ success: true }> {
    let hash: string;

    if (isHashed) {
      // すでにハッシュ化されている（内部からの呼び出し）
      hash = password;
    } else {
      // パスワード強度チェック
      const validation =
        this.passwordService.validatePasswordStrength(password);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: "パスワードが要件を満たしていません",
          errors: validation.errors,
        });
      }

      // Argon2でハッシュ化
      hash = await this.passwordService.hashPassword(password);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
    return { success: true };
  }

  async register(email: string, password: string): Promise<RegisterResult> {
    // email の正規化（前後スペース除去＋小文字化）
    email = email.trim().toLowerCase();
    // unique 制約に従い findUnique を使用
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new BadRequestException("このメールアドレスは既に登録されています");

    // パスワード強度チェック
    const validation = this.passwordService.validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: "パスワードが要件を満たしていません",
        errors: validation.errors,
      });
    }
    // 事前にパスワードをハッシュ化し、作成時に同時保存（UPDATEを回避）
    const passwordHash = await this.passwordService.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        role: UserRole.USER,
        isActive: true,
        // clerkId は nullable、必要時のみ設定
        clerkId: `local_${randomUUID()}`,
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
      },
    });

    const tokens = await this.generateTokens(user);

    // ユーザー登録成功ログ
    this.logger.log({
      message: 'User registered successfully',
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  async requestPasswordReset(email: string): Promise<{
    success: true;
    message: string;
    token?: string;
  }> {
    // email の正規化
    email = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // セキュリティのため、存在しないメールでも成功レスポンスを返す
      return {
        success: true,
        message: "パスワードリセット手順をメールで送信しました",
      };
    }

  // パスワードリセットトークンの生成（32バイトのランダム文字列）
  const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = await this.passwordService.hashPassword(resetToken);
    
    // トークンの有効期限（1時間）
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    // トークンをデータベースに保存
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires,
      },
    });

    // パスワードリセットリクエストログ
    this.logger.log({
      message: 'Password reset requested',
      email,
      userExists: !!user,
      timestamp: new Date().toISOString(),
    });

    // TODO: メール送信実装
    // 開発環境ではコンソールにトークンを出力
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Password reset token for ${email}: ${resetToken}`);
      this.logger.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);
    }

    // 本番環境では、ここでメール送信サービスを呼び出す
    // await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      success: true,
      message: "パスワードリセット手順をメールで送信しました",
      // 開発環境のみトークンを返す
      ...(process.env.NODE_ENV !== 'production' && { token: resetToken }),
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: true; message: string }> {
    const candidates = await this.prisma.user.findMany({
      where: {
        resetPasswordToken: { not: null },
        resetPasswordExpires: { gte: new Date() },
      },
      select: {
        id: true,
        email: true,
        resetPasswordToken: true,
      },
    });

    if (!candidates.length) {
      throw new BadRequestException('無効または期限切れのトークンです');
    }

    let matchedUser: { id: string; email: string } | null = null;

    // Timing attack prevention: always check all candidates
    // to ensure constant-time operation regardless of token position
    for (const user of candidates) {
      if (!user.resetPasswordToken) continue;
      const isValidToken = await this.passwordService.verifyPassword(
        token,
        user.resetPasswordToken,
      );
      if (isValidToken && !matchedUser) {
        matchedUser = { id: user.id, email: user.email };
        // Continue checking remaining users to prevent timing attacks
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('無効または期限切れのトークンです');
    }

    // 新しいパスワードをハッシュ化
    const newPasswordHash = await this.passwordService.hashPassword(newPassword);

    // パスワードを更新し、トークンをクリア
    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        passwordHash: newPasswordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    this.logger.log(`Password reset successful for user: ${matchedUser.email}`);

    // パスワードリセット成功詳細ログ
    this.logger.log({
      message: 'Password reset completed',
      userId: matchedUser.id,
      email: matchedUser.email,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'パスワードが正常にリセットされました',
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: true; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException("ユーザーが見つかりません");
    }

    // 現在のパスワードを確認
    let isCurrentPasswordValid = false;
    if (this.passwordService.isArgon2Hash(user.passwordHash)) {
      isCurrentPasswordValid = await this.passwordService.verifyPassword(
        currentPassword,
        user.passwordHash,
      );
    } else if (this.passwordService.needsMigration(user.passwordHash)) {
      isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );
    }

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("現在のパスワードが正しくありません");
    }

    // 新しいパスワードを設定
    await this.setPassword(userId, newPassword);
    return { success: true, message: "パスワードが正常に変更されました" };
  }

  /**
   * Cookie などで受け取った refreshToken を用いてアクセストークンを再発行
   * 成功時は refreshToken をローテーション（新しいものを返す）
   */
  async refreshUsingToken(refreshToken: string): Promise<RefreshTokenResult> {
    if (!refreshToken) {
      this.logger.warn('Refresh attempt without token');
      throw new UnauthorizedException('Missing refresh token');
    }
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      }) as { sub: string };

      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, refreshToken: refreshToken },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          refreshToken: true,
        },
      });
      if (!user) {
        this.logger.warn(`Refresh token mismatch or user not found (sub=${payload.sub})`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      // generateTokens のために完全ユーザーが必要 => id で再取得
      const fullUser = await this.prisma.user.findUnique({ where: { id: user.id } });
      if (!fullUser) {
        this.logger.warn(`User ${user.id} missing during refresh flow`);
        throw new UnauthorizedException('Invalid refresh token');
      }
      const tokens = await this.generateTokens(fullUser); // ローテーション
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (e) {
      this.logger.warn(`Refresh verification failed: ${e instanceof Error ? e.message : e}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User): Promise<{ access_token: string; refresh_token: string }> {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId, // マルチテナント対応
      jti: randomUUID(),
    };
    const access_token = await this.jwt.signAsync(accessPayload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
    const refresh_token = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh', jti: randomUUID() },
      {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refresh_token },
    });
    return { access_token, refresh_token };
  }

  async logout(userId: string): Promise<{ success: true; message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { success: true, message: 'ログアウトしました' };
  }

  async getStoredRefreshToken(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { refreshToken: true },
    });
    return user?.refreshToken ?? null;
  }
}
```

## File: backend/src/auth/auth.types.ts
```typescript
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
```

## File: backend/src/auth/get-user.decorator.ts
```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { RequestUser } from "./auth.types";

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest() as { user?: RequestUser };
  return request.user;
  },
);
```

## File: backend/src/auth/jwt-auth.guard.ts
```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";

import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // AUTH_DISABLED=1 の場合は認証をスキップ（開発環境専用）
    const authDisabled = this.configService.get<number>('AUTH_DISABLED', 0);
    if (authDisabled === 1) {
      return true;
    }

    // OPTIONS リクエスト（CORS プリフライト）は認証をスキップ
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method === 'OPTIONS') {
      return true;
    }

    // @Public() デコレータがある場合は認証をスキップ
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

## File: backend/src/auth/jwt.strategy.ts
```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { JwtPayload, RequestUser } from "./auth.types";

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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
```

## File: backend/src/auth/login-attempt.service.ts
```typescript
import { randomUUID } from "crypto";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../prisma/prisma.service";

export interface LoginAttemptData {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}

@Injectable()
export class LoginAttemptService {
  private readonly logger = new Logger(LoginAttemptService.name);
  private readonly maxAttempts: number;
  private readonly lockoutDurationMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.maxAttempts = this.configService.get<number>("MAX_LOGIN_ATTEMPTS", 5);
    this.lockoutDurationMinutes = this.configService.get<number>(
      "LOGIN_LOCKOUT_DURATION_MINUTES",
      15,
    );

    this.logger.log(
      `LoginAttemptService initialized - Max attempts: ${this.maxAttempts}, Lockout: ${this.lockoutDurationMinutes}min`,
    );
  }

  /**
   * ログイン試行を記録
   */
  async recordLoginAttempt(data: LoginAttemptData): Promise<void> {
    try {
      // ユーザーを検索（存在する場合のみユーザーIDを設定）
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      // ログイン試行を記録（rawクエリ使用）
      const id = randomUUID();
      await this.prisma.loginAttempt.create({
        data: {
          id,
          userId: user?.id ?? null,
          email: data.email,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          success: data.success,
          reason: data.reason ?? null,
          // createdAt defaults to now()
        },
      });

      // 失敗の場合、ユーザーの失敗カウントを更新
      if (!data.success && user) {
        await this.updateFailedLoginCount(user.id, data.email);
      }

      // 成功の場合、ユーザーの失敗カウントをリセット
      if (data.success && user) {
        await this.resetFailedLoginCount(user.id);
      }

      this.logger.debug(
        `Login attempt recorded: ${data.email} - ${data.success ? "SUCCESS" : "FAILED"}`,
      );
    } catch (error) {
      this.logger.error("Failed to record login attempt:", error);
      // ログイン試行の記録失敗はログイン処理を妨げない
    }
  }

  /**
   * アカウントがロックされているかチェック
   */
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      const result = await this.prisma.user.findMany({
        where: { email },
        select: { id: true, failedLoginAttempts: true, lockedUntil: true },
        take: 1,
      });

      if (!result || result.length === 0) {
        return false; // ユーザーが存在しない場合はロックされていない
      }

      const user = result[0];

      // ロック期限が設定されており、まだ有効な場合
  if (user.lockedUntil && user.lockedUntil > new Date()) {
        return true;
      }

      // ロック期限が過ぎている場合、ロックを解除
      if (user.lockedUntil && user.lockedUntil <= new Date()) {
        await this.resetFailedLoginCount(user.id);
        return false;
      }

      // 最大試行回数に達している場合
  return user.failedLoginAttempts >= this.maxAttempts;
    } catch (error) {
      this.logger.error("Failed to check account lock status:", error);
      return false; // エラーの場合はロックされていないとみなす
    }
  }

  /**
   * ロック解除までの残り時間（分）を取得
   */
  async getLockoutRemainingMinutes(email: string): Promise<number> {
    try {
      const result = await this.prisma.user.findMany({
        where: { email },
        select: { lockedUntil: true },
        take: 1,
      });

  if (!result || result.length === 0 || !result[0].lockedUntil) {
        return 0;
      }

      const now = new Date();
  const lockoutEnd = result[0].lockedUntil;

      if (lockoutEnd <= now) {
        return 0;
      }

      return Math.ceil((lockoutEnd.getTime() - now.getTime()) / (1000 * 60));
    } catch (error) {
      this.logger.error("Failed to get lockout remaining time:", error);
      return 0;
    }
  }

  /**
   * 失敗ログインカウントを更新
   */
  private async updateFailedLoginCount(
    userId: string,
    email: string,
  ): Promise<void> {
    try {
      const result = await this.prisma.user.findMany({
        where: { id: userId },
        select: { failedLoginAttempts: true },
        take: 1,
      });

      if (!result || result.length === 0) return;

  const newFailedAttempts = (result[0].failedLoginAttempts || 0) + 1;
      const shouldLock = newFailedAttempts >= this.maxAttempts;

      if (shouldLock) {
        const lockoutEnd = new Date();
        lockoutEnd.setMinutes(
          lockoutEnd.getMinutes() + this.lockoutDurationMinutes,
        );

        await this.prisma.user.update({
          where: { id: userId },
          data: { failedLoginAttempts: newFailedAttempts, lockedUntil: lockoutEnd },
        });

        this.logger.warn(
          `Account locked: ${email} - ${newFailedAttempts} failed attempts. Locked until: ${lockoutEnd.toISOString()}`,
        );
      } else {
        await this.prisma.user.update({
          where: { id: userId },
          data: { failedLoginAttempts: newFailedAttempts },
        });
      }
    } catch (error) {
      this.logger.error("Failed to update failed login count:", error);
    }
  }

  /**
   * 失敗ログインカウントをリセット
   */
  private async resetFailedLoginCount(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
      });
    } catch (error) {
      this.logger.error("Failed to reset failed login count:", error);
    }
  }

  /**
   * ログイン試行履歴を取得（管理者用）
   */
  async getLoginAttemptHistory(
    email?: string,
    limit: number = 50,
  ): Promise<Array<{
    id: string;
    userId?: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    reason?: string;
    createdAt: Date;
    user_id?: string;
    user_email?: string;
    firstName?: string;
    lastName?: string;
  }>> {
    try {
      if (email) {
        const items = await this.prisma.loginAttempt.findMany({
          where: { email },
          orderBy: { createdAt: "desc" },
          take: limit,
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        });
        return items.map((la) => ({
          id: la.id,
          userId: la.userId ?? undefined,
          email: la.email,
          ipAddress: la.ipAddress ?? undefined,
          userAgent: la.userAgent ?? undefined,
          success: la.success,
          reason: la.reason ?? undefined,
          createdAt: la.createdAt,
          user_id: la.user?.id,
          user_email: la.user?.email,
          firstName: la.user?.firstName ?? undefined,
          lastName: la.user?.lastName ?? undefined,
        }));
      } else {
        const items = await this.prisma.loginAttempt.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        });
        return items.map((la) => ({
          id: la.id,
          userId: la.userId ?? undefined,
          email: la.email,
          ipAddress: la.ipAddress ?? undefined,
          userAgent: la.userAgent ?? undefined,
          success: la.success,
          reason: la.reason ?? undefined,
          createdAt: la.createdAt,
          user_id: la.user?.id,
          user_email: la.user?.email,
          firstName: la.user?.firstName ?? undefined,
          lastName: la.user?.lastName ?? undefined,
        }));
      }
    } catch (error) {
      this.logger.error("Failed to get login attempt history:", error);
      return [];
    }
  }

  /**
   * 古いログイン試行記録を削除（定期実行用）
   */
  async cleanupOldLoginAttempts(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await this.prisma.loginAttempt.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      this.logger.log(
        `Cleaned up old login attempt records (older than ${daysToKeep} days)`,
      );
      return 0; // rawクエリでは正確な削除数を取得できないため0を返す
    } catch (error) {
      this.logger.error("Failed to cleanup old login attempts:", error);
      return 0;
    }
  }
}
```

## File: backend/src/auth/password.service.ts
```typescript
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";

export interface Argon2Config {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
  hashLength: number;
  saltLength: number;
}

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly argon2Config: Argon2Config;

  constructor(private readonly configService: ConfigService) {
    this.argon2Config = {
      memoryCost: this.configService.get<number>("ARGON2_MEMORY_COST", 65536),
      timeCost: this.configService.get<number>("ARGON2_TIME_COST", 3),
      parallelism: this.configService.get<number>("ARGON2_PARALLELISM", 4),
      hashLength: this.configService.get<number>("ARGON2_HASH_LENGTH", 64),
      saltLength: this.configService.get<number>("ARGON2_SALT_LENGTH", 32),
    };

    this.logger.log("PasswordService initialized with Argon2id configuration");
  }

  /**
   * パスワードをArgon2idでハッシュ化
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: this.argon2Config.memoryCost,
        timeCost: this.argon2Config.timeCost,
        parallelism: this.argon2Config.parallelism,
        hashLength: this.argon2Config.hashLength,
      });

      this.logger.debug("Password successfully hashed with Argon2id");
      return hash;
    } catch (error) {
      this.logger.error("Failed to hash password:", error);
      throw new Error("Password hashing failed");
    }
  }

  /**
   * パスワードを検証
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await argon2.verify(hash, password);
      this.logger.debug(
        `Password verification: ${isValid ? "success" : "failed"}`,
      );
      return isValid;
    } catch (error) {
      this.logger.error("Failed to verify password:", error);
      return false;
    }
  }

  /**
   * パスワード強度チェック
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const minLength = this.configService.get<number>("PASSWORD_MIN_LENGTH", 8);

    if (password.length < minLength) {
      errors.push(`パスワードは${minLength}文字以上である必要があります`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push("パスワードには小文字を含める必要があります");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("パスワードには大文字を含める必要があります");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("パスワードには数字を含める必要があります");
    }

    // 特殊文字チェックは削除（要件を緩和）
    // if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    //   errors.push("パスワードには特殊文字を含める必要があります");
    // }

    // 連続する文字チェック
    if (/(.)\1{2,}/.test(password)) {
      errors.push(
        "パスワードに同じ文字を3回以上連続で使用することはできません",
      );
    }

    // よくある弱いパスワードパターンをチェック（開発用に緩和）
    // const weakPatterns = [/123456/, /password/i, /qwerty/i, /admin/i, /guest/i];

    // if (weakPatterns.some((pattern) => pattern.test(password))) {
    //   errors.push("よく使われるパスワードパターンは使用できません");
    // }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * ハッシュがArgon2かどうかチェック
   */
  isArgon2Hash(hash: string): boolean {
    return hash.startsWith("$argon2");
  }

  /**
   * bcryptハッシュからArgon2への移行チェック
   */
  needsMigration(hash: string): boolean {
    return (
      hash.startsWith("$2a$") ||
      hash.startsWith("$2b$") ||
      hash.startsWith("$2y$")
    );
  }
}
```

## File: backend/src/auth/role.guard.spec.ts
```typescript
import { ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;
  let loggerWarnSpy: jest.SpyInstance;
  let originalAuthDisabled: string | undefined;

  beforeEach(async () => {
    originalAuthDisabled = process.env.AUTH_DISABLED;
    delete process.env.AUTH_DISABLED;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get<Reflector>(Reflector);

    // Logger の warn メソッドをモック
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    if (typeof originalAuthDisabled === 'string') {
      process.env.AUTH_DISABLED = originalAuthDisabled;
    } else {
      delete process.env.AUTH_DISABLED;
    }

    jest.restoreAllMocks();
  });

  const createMockExecutionContext = (
    user?: { userId: string; email?: string; role?: UserRole },
  ): ExecutionContext => {
    const context: Partial<ExecutionContext> = {
      switchToHttp: () => ({
        getRequest: <T = { user?: { userId: string; email?: string; role?: UserRole } }>() =>
          ({ user }) as T,
        getResponse: <T = Record<string, never>>() => ({}) as T,
        getNext: <T = Record<string, never>>() => ({}) as T,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    };

    return context as ExecutionContext;
  };

  it('定義されていること', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('ロールが要求されていない場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(undefined);

      const context = createMockExecutionContext();
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ユーザーが存在しない場合は false を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext(undefined);
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('ユーザーが ADMIN ロールを持っていて ADMIN が要求されている場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ユーザーが SUPER_ADMIN ロールを持っていて ADMIN または SUPER_ADMIN が要求されている場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-2',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ユーザーが USER ロールを持っていて ADMIN が要求されている場合は false を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-3',
        email: 'user@example.com',
        role: UserRole.USER,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('ユーザーにロールが設定されていない場合は false を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-4',
        email: 'noRole@example.com',
        role: undefined,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('TENANT_ADMIN ロールが要求され、ユーザーが TENANT_ADMIN を持っている場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.TENANT_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-5',
        email: 'tenantadmin@example.com',
        role: UserRole.TENANT_ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('ログ出力', () => {
    it('ユーザーが存在しない場合にログを出力する', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext(undefined);
      guard.canActivate(context);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'アクセス拒否: ユーザー情報がありません',
          reason: 'user_not_found',
        }),
      );
    });

    it('ロールが不足している場合にログを出力する', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-6',
        email: 'user@example.com',
        role: UserRole.USER,
      });
      guard.canActivate(context);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'アクセス拒否: ロールが不足しています',
          userId: 'user-6',
          userRole: UserRole.USER,
          reason: 'role_mismatch',
        }),
      );
    });

    it('アクセスが許可された場合はログを出力しない', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-7',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
      guard.canActivate(context);

      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });
});
```

## File: backend/src/auth/role.guard.ts
```typescript
import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";

import type { UserRole, RequestUser } from "./auth.types";

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 認証不要ルートではロールチェックもしない（開発用の@Public()想定）
    if (isPublic) {
      return true;
    }

    const authDisabled =
      process.env.AUTH_DISABLED === 'YES' ||
      process.env.AUTH_DISABLED === 'true' ||
      process.env.AUTH_DISABLED === '1';

    // AUTH_DISABLED の開発環境ではロールチェックをスキップ
    if (authDisabled) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    
    if (!user) {
      this.logger.warn({
        message: 'アクセス拒否: ユーザー情報がありません',
        requiredRoles,
        reason: 'user_not_found',
      });
      return false;
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);

    if (!hasRole) {
      this.logger.warn({
        message: 'アクセス拒否: ロールが不足しています',
        userId: user.userId,
        userRole: user.role,
        requiredRoles,
        reason: 'role_mismatch',
      });
      return false;
    }

    return true;
  }
}
```

## File: backend/src/auth/roles.decorator.ts
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

## File: backend/src/shift/dto/create-shift-template.dto.ts
```typescript
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateShiftTemplateDto {
  @IsString()
  name: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsInt()
  duration: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  breakTime?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
```

## File: backend/src/shift/dto/create-shift.dto.ts
```typescript
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

/**
 * シフト作成DTO（最小実装）
 * ドラッグ&ドロップでスタッフをカレンダーに配置する際に使用
 */
export class CreateShiftDto {
  /**
   * スタッフID（必須）
   */
  @IsUUID('4', { message: '有効なスタッフIDを指定してください' })
  @IsNotEmpty({ message: 'スタッフIDは必須です' })
  staffId: string;

  /**
   * シフト日付（必須、YYYY-MM-DD形式）
   */
  @IsString()
  @IsNotEmpty({ message: 'シフト日付は必須です' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'シフト日付はYYYY-MM-DD形式で指定してください',
  })
  shiftDate: string;

  /**
   * 表示名（任意、指定しない場合はスタッフ名を使用）
   */
  @IsOptional()
  @IsString()
  displayName?: string | null;

  /**
   * 備考（任意）
   */
  @IsOptional()
  @IsString()
  notes?: string | null;
}
```

## File: backend/src/shift/dto/get-shifts-query.dto.ts
```typescript
import { IsString, IsOptional, IsUUID, Matches } from 'class-validator';

/**
 * シフト一覧取得用クエリDTO
 */
export class GetShiftsQueryDto {
  /**
   * 開始日（YYYY-MM-DD形式）
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '開始日はYYYY-MM-DD形式で指定してください',
  })
  startDate?: string;

  /**
   * 終了日（YYYY-MM-DD形式）
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '終了日はYYYY-MM-DD形式で指定してください',
  })
  endDate?: string;

  /**
   * スタッフIDでフィルタ（任意）
   */
  @IsOptional()
  @IsUUID('4', { message: '有効なスタッフIDを指定してください' })
  staffId?: string;
}
```

## File: backend/src/shift/dto/update-shift.dto.ts
```typescript
import { ShiftStatus } from '@prisma/client';
import {
  IsString,
  IsUUID,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';

/**
 * シフト更新DTO
 */
export class UpdateShiftDto {
  /**
   * スタッフID（変更する場合）
   */
  @IsOptional()
  @IsUUID('4', { message: '有効なスタッフIDを指定してください' })
  staffId?: string;

  /**
   * シフト日付（変更する場合、YYYY-MM-DD形式）
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'シフト日付はYYYY-MM-DD形式で指定してください',
  })
  shiftDate?: string;

  /**
   * 表示名
   */
  @IsOptional()
  @IsString()
  displayName?: string | null;

  /**
   * 備考
   */
  @IsOptional()
  @IsString()
  notes?: string | null;

  /**
   * シフトステータス
   */
  @IsOptional()
  @IsEnum(ShiftStatus, { message: '有効なシフトステータスを指定してください' })
  status?: ShiftStatus;
}
```

## File: backend/src/shift/shift.controller.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

describe('ShiftController', () => {
  let controller: ShiftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [ShiftController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: ShiftService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getCalendarShifts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShiftController>(ShiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## File: backend/src/shift/shift.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { ApiResponse } from '../common/dto/api-response.dto';
import { ShiftResponseDto, CalendarShiftEvent } from '../common/types/shift.types';

import { CreateShiftDto } from './dto/create-shift.dto';
import { GetShiftsQueryDto } from './dto/get-shifts-query.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftService } from './shift.service';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  /**
   * シフトを新規作成
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createShiftDto: CreateShiftDto): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftService.create(createShiftDto);
    return ApiResponse.success(shift);
  }

  /**
   * シフト一覧を取得
   */
  @Get()
  async findAll(@Query() query: GetShiftsQueryDto): Promise<ApiResponse<ShiftResponseDto[]>> {
    const shifts = await this.shiftService.findAll(query);
    return ApiResponse.success(shifts);
  }

  /**
   * カレンダー表示用のシフトデータを取得
   */
  @Get('calendar')
  async getCalendarData(
    @Query() query: GetShiftsQueryDto,
  ): Promise<ApiResponse<CalendarShiftEvent[]>> {
    const events = await this.shiftService.getCalendarData(query);
    return ApiResponse.success(events);
  }

  /**
   * 指定IDのシフトを取得
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftService.findOne(id);
    return ApiResponse.success(shift);
  }

  /**
   * シフト情報を更新
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftService.update(id, updateShiftDto);
    return ApiResponse.success(shift);
  }

  /**
   * シフトを削除
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<{ id: string }>> {
    await this.shiftService.remove(id);
    return ApiResponse.success({ id });
  }
}
```

## File: backend/src/shift/shift.module.ts
```typescript
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

@Module({
  imports: [PrismaModule],
  providers: [ShiftService],
  controllers: [ShiftController],
  exports: [ShiftService],
})
export class ShiftModule {}
```

## File: backend/src/shift/shift.service.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { ShiftService } from './shift.service';

describe('ShiftService', () => {
  let service: ShiftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftService,
        {
          provide: PrismaService,
          useValue: {
            shift: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            staff: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ShiftService>(ShiftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## File: backend/src/shift/shift.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Shift, Staff, Prisma } from '@prisma/client';

import {
  ShiftResponseDto,
  CalendarShiftEvent,
  // ShiftEntity, // Unused - keeping import for future use
} from '../common/types/shift.types';
import { PrismaService } from '../prisma/prisma.service';

import { CreateShiftDto } from './dto/create-shift.dto';
import { GetShiftsQueryDto } from './dto/get-shifts-query.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  /**
   * 日付文字列（YYYY-MM-DD）をDateオブジェクトに変換
   * 不正な日付の場合はエラーをスロー
   */
  private parseDate(dateString: string): Date {
    const date = new Date(dateString + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }
    return date;
  }

  /**
   * Shiftエンティティを ShiftResponseDto に変換
   */
  private toResponseDto(shift: Shift & { staff: Staff }): ShiftResponseDto {
    return {
      id: shift.id,
      staffId: shift.staffId,
      staffName: shift.staff.name,
      staffColor: shift.staff.color,
      shiftDate: shift.shiftDate.toISOString().split('T')[0], // YYYY-MM-DD
      displayName: shift.displayName,
      status: shift.status,
      notes: shift.notes,
      createdAt: shift.createdAt.toISOString(),
      updatedAt: shift.updatedAt.toISOString(),
    };
  }

  /**
   * Shiftエンティティを CalendarShiftEvent に変換
   */
  private toCalendarEvent(shift: Shift & { staff: Staff }): CalendarShiftEvent {
    const shiftDate = shift.shiftDate.toISOString().split('T')[0];

    return {
      id: shift.id,
      title: shift.staff.name,
      start: shiftDate,
      end: shiftDate,
      backgroundColor: shift.staff.color,
      borderColor: shift.staff.color,
      extendedProps: {
        shiftId: shift.id,
        staffId: shift.staffId,
        staffName: shift.staff.name,
        displayName: shift.displayName,
        notes: shift.notes,
      },
    };
  }

  /**
   * シフトを新規作成
   */
  async create(createShiftDto: CreateShiftDto): Promise<ShiftResponseDto> {
    // スタッフの存在確認
    const staff = await this.prisma.staff.findUnique({
      where: { id: createShiftDto.staffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${createShiftDto.staffId} not found`);
    }

    if (!staff.isActive) {
      throw new BadRequestException(`Staff with ID ${createShiftDto.staffId} is not active`);
    }

    // 日付をパース
    const shiftDate = this.parseDate(createShiftDto.shiftDate);

    // シフトを作成
    const shift = await this.prisma.shift.create({
      data: {
        staffId: createShiftDto.staffId,
        shiftDate: shiftDate,
        displayName: createShiftDto.displayName || null,
        notes: createShiftDto.notes || null,
        status: 'SCHEDULED', // デフォルト値
        mode: 'SIMPLE', // 最小実装では簡易モード
      },
      include: {
        staff: true,
      },
    });

    return this.toResponseDto(shift);
  }

  /**
   * シフト一覧を取得
   */
  async findAll(query: GetShiftsQueryDto): Promise<ShiftResponseDto[]> {
    const where: Prisma.ShiftWhereInput = {};

    // 日付範囲でフィルタ
    if (query.startDate && query.endDate) {
      where.shiftDate = {
        gte: this.parseDate(query.startDate),
        lte: this.parseDate(query.endDate),
      };
    } else if (query.startDate) {
      where.shiftDate = {
        gte: this.parseDate(query.startDate),
      };
    } else if (query.endDate) {
      where.shiftDate = {
        lte: this.parseDate(query.endDate),
      };
    }

    // スタッフIDでフィルタ
    if (query.staffId) {
      where.staffId = query.staffId;
    }

    const shifts = await this.prisma.shift.findMany({
      where,
      include: {
        staff: true,
      },
      orderBy: { shiftDate: 'asc' },
    });

    return shifts.map((shift) => this.toResponseDto(shift));
  }

  /**
   * カレンダー表示用のシフトデータを取得
   */
  async getCalendarData(query: GetShiftsQueryDto): Promise<CalendarShiftEvent[]> {
    const shifts = await this.prisma.shift.findMany({
      where: {
        ...(query.startDate &&
          query.endDate && {
            shiftDate: {
              gte: this.parseDate(query.startDate),
              lte: this.parseDate(query.endDate),
            },
          }),
        ...(query.staffId && { staffId: query.staffId }),
      },
      include: {
        staff: true,
      },
      orderBy: { shiftDate: 'asc' },
    });

    return shifts.map((shift) => this.toCalendarEvent(shift));
  }

  /**
   * 指定IDのシフトを取得
   */
  async findOne(id: string): Promise<ShiftResponseDto> {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        staff: true,
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return this.toResponseDto(shift);
  }

  /**
   * シフト情報を更新
   */
  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<ShiftResponseDto> {
    // 既存シフトの存在確認
    await this.findOne(id);

    // スタッフIDが変更される場合、スタッフの存在確認
    if (updateShiftDto.staffId) {
      const staff = await this.prisma.staff.findUnique({
        where: { id: updateShiftDto.staffId },
      });

      if (!staff || !staff.isActive) {
        throw new BadRequestException(`Staff with ID ${updateShiftDto.staffId} is not available`);
      }
    }

    // 更新データを構築
    const updateData: Partial<Prisma.ShiftUncheckedUpdateInput> = {};

    if (updateShiftDto.staffId !== undefined) {
      updateData.staffId = updateShiftDto.staffId;
    }

    if (updateShiftDto.shiftDate !== undefined) {
      updateData.shiftDate = this.parseDate(updateShiftDto.shiftDate);
    }

    if (updateShiftDto.displayName !== undefined) {
      updateData.displayName = updateShiftDto.displayName;
    }

    if (updateShiftDto.notes !== undefined) {
      updateData.notes = updateShiftDto.notes;
    }

    if (updateShiftDto.status !== undefined) {
      updateData.status = updateShiftDto.status;
    }

    // シフトを更新
    const shift = await this.prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        staff: true,
      },
    });

    return this.toResponseDto(shift);
  }

  /**
   * シフトを削除
   */
  async remove(id: string): Promise<void> {
    // 存在確認
    await this.findOne(id);

    // 物理削除
    await this.prisma.shift.delete({
      where: { id },
    });
  }
}
```

## File: backend/src/staff/dto/create-staff.dto.ts
```typescript
import { Type } from 'class-transformer';
import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID, IsNotEmpty, Matches, IsArray, IsIn, ValidateNested, IsInt, Min, Max } from 'class-validator';

/**
 * 勤務時間テンプレートDTO
 */
export class WorkTimeTemplateDto {
  @IsInt({ message: '開始時間は整数で指定してください' })
  @Min(0, { message: '開始時間は0以上で指定してください' })
  @Max(23, { message: '開始時間は23以下で指定してください' })
  startHour: number;

  @IsInt({ message: '終了時間は整数で指定してください' })
  @Min(1, { message: '終了時間は1以上で指定してください' })
  @Max(24, { message: '終了時間は24以下で指定してください' })
  endHour: number;
}

/**
 * スタッフ作成DTO
 * 最小実装: 名前のみ必須、Emailは不要
 */
export class CreateStaffDto {
  /**
   * スタッフ名（必須）
   */
  @IsString()
  @IsNotEmpty({ message: '名前は必須です' })
  name: string;

  /**
   * メールアドレス（任意、設定する場合は有効なメールアドレス）
   */
  @IsOptional()
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email?: string | null;

  /**
   * 役職（任意、デフォルト: "スタッフ"）
   */
  @IsOptional()
  @IsString()
  role?: string;

  /**
   * カレンダー表示色（任意、デフォルト: "#4dabf7"）
   * 16進数カラーコード形式
   */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'カラーコードは#000000形式で指定してください',
  })
  color?: string;

  /**
   * ユーザーID（システム内部用、通常は使用しない）
   */
  @IsOptional()
  @IsUUID()
  userId?: string;

  /**
   * 有効フラグ（任意、デフォルト: true）
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * 出勤曜日（任意）
   * ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] の配列
   */
  @IsOptional()
  @IsArray()
  @IsIn(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], { each: true })
  workingDays?: string[] | null;

  /**
   * 勤務時間テンプレート（任意）
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkTimeTemplateDto)
  workTimeTemplate?: WorkTimeTemplateDto | null;
}
```

## File: backend/src/staff/dto/update-staff.dto.ts
```typescript
import { PartialType } from '@nestjs/mapped-types';

import { CreateStaffDto } from './create-staff.dto';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
```

## File: backend/src/staff/staff.controller.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

describe('StaffController', () => {
  let controller: StaffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [StaffController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: StaffService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StaffController>(StaffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

## File: backend/src/staff/staff.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { ApiResponse } from '../common/dto/api-response.dto';
import { StaffResponseDto, StaffListResponseDto } from '../common/types/staff.types';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * スタッフを新規作成
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStaffDto: CreateStaffDto): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.create(createStaffDto);
    return ApiResponse.success(staff);
  }

  /**
   * スタッフ一覧を取得
   */
  @Get()
  async findAll(): Promise<ApiResponse<StaffListResponseDto>> {
    const result = await this.staffService.findAll();
    return ApiResponse.success(result);
  }

  /**
   * 指定IDのスタッフを取得
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.findOne(id);
    return ApiResponse.success(staff);
  }

  /**
   * スタッフ情報を更新
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.update(id, updateStaffDto);
    return ApiResponse.success(staff);
  }

  /**
   * スタッフを削除（論理削除）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.remove(id);
    return ApiResponse.success(staff);
  }

  /**
   * 削除したスタッフを復元
   */
  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.restore(id);
    return ApiResponse.success(staff);
  }
}
```

## File: backend/src/staff/staff.module.ts
```typescript
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [PrismaModule],
  providers: [StaffService],
  controllers: [StaffController],
  exports: [StaffService],
})
export class StaffModule {}
```

## File: backend/src/staff/staff.service.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { StaffService } from './staff.service';

describe('StaffService', () => {
  let service: StaffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: PrismaService,
          useValue: {
            staff: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## File: backend/src/staff/staff.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { Staff, Prisma } from '@prisma/client';

import { StaffResponseDto, StaffListResponseDto, Weekday, WorkTimeTemplate } from '../common/types/staff.types';
import { PrismaService } from '../prisma/prisma.service';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  /**
   * JSONフィールドをWeekday[]に変換
   */
  private parseWorkingDays(json: Prisma.JsonValue | null): Weekday[] | null {
    if (!json || !Array.isArray(json)) return null;
    const validDays: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return json.filter((day): day is Weekday => validDays.includes(day as Weekday));
  }

  /**
   * JSONフィールドをWorkTimeTemplateに変換
   */
  private parseWorkTimeTemplate(json: Prisma.JsonValue | null): WorkTimeTemplate | null {
    if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
    const obj = json as Record<string, unknown>;
    if (typeof obj.startHour === 'number' && typeof obj.endHour === 'number') {
      return { startHour: obj.startHour, endHour: obj.endHour };
    }
    return null;
  }

  /**
   * Staffエンティティを StaffResponseDto に変換
   */
  private toResponseDto(staff: Staff): StaffResponseDto {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      color: staff.color,
      isActive: staff.isActive,
      workingDays: this.parseWorkingDays(staff.workingDays),
      workTimeTemplate: this.parseWorkTimeTemplate(staff.workTimeTemplate),
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
    };
  }

  /**
   * スタッフを新規作成
   */
  async create(createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.create({
      data: {
        name: createStaffDto.name,
        email: createStaffDto.email || null,
        role: createStaffDto.role || 'スタッフ',
        color: createStaffDto.color || '#4dabf7',
        userId: createStaffDto.userId || null,
        isActive: createStaffDto.isActive !== undefined ? createStaffDto.isActive : true,
        workingDays: createStaffDto.workingDays 
          ? (createStaffDto.workingDays as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        workTimeTemplate: createStaffDto.workTimeTemplate 
          ? (createStaffDto.workTimeTemplate as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    return this.toResponseDto(staff);
  }

  /**
   * スタッフ一覧を取得（有効なスタッフのみ）
   */
  async findAll(): Promise<StaffListResponseDto> {
    const staffList = await this.prisma.staff.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      staffList: staffList.map((staff) => this.toResponseDto(staff)),
      total: staffList.length,
    };
  }

  /**
   * 指定IDのスタッフを取得
   */
  async findOne(id: string): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return this.toResponseDto(staff);
  }

  /**
   * スタッフ情報を更新
   */
  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<StaffResponseDto> {
    await this.findOne(id); // 存在チェック

    const staff = await this.prisma.staff.update({
      where: { id },
      data: {
        ...(updateStaffDto.name !== undefined && { name: updateStaffDto.name }),
        ...(updateStaffDto.email !== undefined && { email: updateStaffDto.email }),
        ...(updateStaffDto.role !== undefined && { role: updateStaffDto.role }),
        ...(updateStaffDto.color !== undefined && { color: updateStaffDto.color }),
        ...(updateStaffDto.isActive !== undefined && { isActive: updateStaffDto.isActive }),
        ...(updateStaffDto.workingDays !== undefined && { 
          workingDays: updateStaffDto.workingDays 
            ? (updateStaffDto.workingDays as Prisma.InputJsonValue)
            : Prisma.JsonNull
        }),
        ...(updateStaffDto.workTimeTemplate !== undefined && { 
          workTimeTemplate: updateStaffDto.workTimeTemplate 
            ? (updateStaffDto.workTimeTemplate as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull
        }),
      },
    });

    return this.toResponseDto(staff);
  }

  /**
   * スタッフを削除（論理削除）
   */
  async remove(id: string): Promise<StaffResponseDto> {
    await this.findOne(id); // 存在チェック

    const staff = await this.prisma.staff.update({
      where: { id },
      data: { isActive: false },
    });

    return this.toResponseDto(staff);
  }

  /**
   * 削除したスタッフを復元
   */
  async restore(id: string): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    const restoredStaff = await this.prisma.staff.update({
      where: { id },
      data: { isActive: true },
    });

    return this.toResponseDto(restoredStaff);
  }
}
```

## File: backend/src/tags/dto/assign-tag.dto.ts
```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AssignTagDto {
  @ApiProperty({
    description: "タグID",
    example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  })
  @IsUUID()
  tagId: string; // Updated example
}
```

## File: backend/src/tags/dto/create-tag-automation-rule.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TagAutomationEventType, TagAutomationTriggerType } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateTagAutomationRuleDto {
  @ApiPropertyOptional({ description: "ルールの一意なキー（自動生成可能）" })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({ description: "ルール名（未入力時は自動生成）" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "ルールの説明" })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    enum: TagAutomationTriggerType,
    description: "トリガータイプ",
    example: "EVENT",
  })
  @IsEnum(TagAutomationTriggerType)
  triggerType!: TagAutomationTriggerType;

  @ApiPropertyOptional({
    enum: TagAutomationEventType,
    description: "イベントタイプ",
    example: "PAGE_ACTION",
  })
  @IsOptional()
  @IsEnum(TagAutomationEventType)
  eventType?: TagAutomationEventType;

  @ApiPropertyOptional({ description: "適用範囲（スコープ）", example: "breeding" })
  @IsOptional()
  @IsString()
  scope?: string | null;

  @ApiPropertyOptional({ description: "ルールが有効かどうか", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "優先度（-100から100、大きいほど優先）",
    minimum: -100,
    maximum: 100,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({
    description: "ルール設定（JSON）",
    example: { tagIds: ["tag-id-1", "tag-id-2"], actionType: "ASSIGN" },
  })
  @IsOptional()
  config?: Record<string, unknown> | null;
}
```

## File: backend/src/tags/dto/create-tag-category.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateTagCategoryDto {
  @ApiPropertyOptional({ description: "ユニークキー (未指定時は名前から生成)", example: "cats_status" })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({ description: "カテゴリ名", example: "猫ステータス" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ description: "カテゴリの説明" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "カテゴリの代表カラー", example: "#6366F1" })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: "カテゴリに使用するテキストカラー", example: "#111827" })
  @IsOptional()
  @IsHexColor()
  textColor?: string;

  @ApiPropertyOptional({ description: "表示順" })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: "利用するスコープ一覧", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional({ description: "アクティブかどうか", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

## File: backend/src/tags/dto/create-tag-group.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsHexColor, IsNumber, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateTagGroupDto {
  @ApiProperty({ description: "所属カテゴリID", example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: "グループ名", example: "屋内管理" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ description: "グループの説明" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "表示順", example: 10 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: "アクティブかどうか", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "グループ表示用のカラー", example: "#3B82F6" })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: "グループタイトルのテキストカラー", example: "#111827" })
  @IsOptional()
  @IsHexColor()
  textColor?: string;
}
```

## File: backend/src/tags/dto/create-tag.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsHexColor,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class CreateTagDto {
  @ApiProperty({ description: "タグ名", example: "Indoor" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: "タググループID", example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" })
  @IsUUID()
  groupId: string;

  @ApiPropertyOptional({ description: "カラーコード", example: "#3B82F6" })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: "テキストカラーコード", example: "#FFFFFF" })
  @IsOptional()
  @IsHexColor()
  textColor?: string;

  @ApiPropertyOptional({ description: "説明", example: "室内飼いタグ" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "手動操作で利用可能か", example: true })
  @IsOptional()
  @IsBoolean()
  allowsManual?: boolean;

  @ApiPropertyOptional({ description: "自動ルールで利用可能か", example: true })
  @IsOptional()
  @IsBoolean()
  allowsAutomation?: boolean;

  @ApiPropertyOptional({ description: "表示順", example: 10 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: "任意のメタデータ", type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "アクティブかどうか", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

## File: backend/src/tags/dto/index.ts
```typescript
export * from "./assign-tag.dto";
export * from "./create-tag.dto";
export * from "./update-tag.dto";
export * from "./create-tag-category.dto";
export * from "./update-tag-category.dto";
export * from "./reorder-tag-category.dto";
export * from "./reorder-tag.dto";
export * from "./create-tag-group.dto";
export * from "./update-tag-group.dto";
export * from "./reorder-tag-group.dto";
export * from "./create-tag-automation-rule.dto";
export * from "./update-tag-automation-rule.dto";
```

## File: backend/src/tags/dto/reorder-tag-category.dto.ts
```typescript
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsUUID, ValidateNested } from "class-validator";

class TagCategoryOrderItemDto {
  @ApiProperty({ description: "カテゴリID", format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: "表示順", example: 10 })
  @IsInt()
  displayOrder!: number;
}

export class ReorderTagCategoriesDto {
  @ApiProperty({ type: [TagCategoryOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TagCategoryOrderItemDto)
  items!: TagCategoryOrderItemDto[];
}
```

## File: backend/src/tags/dto/reorder-tag-group.dto.ts
```typescript
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsUUID, ValidateNested } from "class-validator";

class TagGroupOrderItemDto {
  @ApiProperty({ description: "グループID", format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: "表示順", example: 10 })
  @IsInt()
  displayOrder!: number;

  @ApiProperty({ description: "移動先カテゴリID", format: "uuid", required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class ReorderTagGroupDto {
  @ApiProperty({ type: [TagGroupOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TagGroupOrderItemDto)
  items!: TagGroupOrderItemDto[];
}
```

## File: backend/src/tags/dto/reorder-tag.dto.ts
```typescript
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsUUID, ValidateNested } from "class-validator";

class TagOrderItemDto {
  @ApiProperty({ description: "タグID", format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: "表示順", example: 12 })
  @IsInt()
  displayOrder!: number;

  @ApiProperty({ description: "所属タググループID", format: "uuid", required: false })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}

export class ReorderTagsDto {
  @ApiProperty({ type: [TagOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TagOrderItemDto)
  items!: TagOrderItemDto[];
}
```

## File: backend/src/tags/dto/update-tag-automation-rule.dto.ts
```typescript
import { PartialType } from "@nestjs/swagger";

import { CreateTagAutomationRuleDto } from "./create-tag-automation-rule.dto";

export class UpdateTagAutomationRuleDto extends PartialType(CreateTagAutomationRuleDto) {}
```

## File: backend/src/tags/dto/update-tag-category.dto.ts
```typescript
import { PartialType } from "@nestjs/swagger";

import { CreateTagCategoryDto } from "./create-tag-category.dto";

export class UpdateTagCategoryDto extends PartialType(CreateTagCategoryDto) {}
```

## File: backend/src/tags/dto/update-tag-group.dto.ts
```typescript
import { PartialType } from "@nestjs/swagger";

import { CreateTagGroupDto } from "./create-tag-group.dto";

export class UpdateTagGroupDto extends PartialType(CreateTagGroupDto) {}
```

## File: backend/src/tags/dto/update-tag.dto.ts
```typescript
import { PartialType } from "@nestjs/swagger";

import { CreateTagDto } from "./create-tag.dto";

export class UpdateTagDto extends PartialType(CreateTagDto) {}
```

## File: backend/src/tags/events/tag-automation.events.ts
```typescript
import { TagAutomationEventType } from "@prisma/client";

/**
 * 基底イベントペイロード
 */
export interface BaseAutomationEvent {
  eventType: TagAutomationEventType;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 交配予定イベント
 */
export interface BreedingPlannedEvent extends BaseAutomationEvent {
  eventType: 'BREEDING_PLANNED';
  breedingId: string;
  maleId: string;
  femaleId: string;
  plannedDate: Date;
}

/**
 * 交配確認イベント
 */
export interface BreedingConfirmedEvent extends BaseAutomationEvent {
  eventType: 'BREEDING_CONFIRMED';
  breedingId: string;
  maleId: string;
  femaleId: string;
  confirmedDate: Date;
}

/**
 * 妊娠確認イベント
 */
export interface PregnancyConfirmedEvent extends BaseAutomationEvent {
  eventType: 'PREGNANCY_CONFIRMED';
  pregnancyCheckId: string;
  femaleId: string;
  maleId?: string;
  confirmedDate: Date;
}

/**
 * 子猫登録イベント
 */
export interface KittenRegisteredEvent extends BaseAutomationEvent {
  eventType: 'KITTEN_REGISTERED';
  kittenId: string;
  motherId?: string;
  fatherId?: string;
  birthDate?: Date;
}

/**
 * 年齢閾値イベント
 */
export interface AgeThresholdEvent extends BaseAutomationEvent {
  eventType: 'AGE_THRESHOLD';
  catId: string;
  ageInMonths: number;
  thresholdMonths: number;
}

/**
 * ページ・アクション駆動イベント
 * 任意のページで任意のアクションが発生した際のイベント
 */
export interface PageActionEvent extends BaseAutomationEvent {
  eventType: 'PAGE_ACTION';
  page: string; // 'cats', 'breeding', 'health', 'care', 'pedigree' など
  action: string; // 'create', 'update', 'delete', 'status_change' など
  targetId: string; // 対象のリソースID（猫ID、交配記録IDなど）
  targetType?: string; // 'cat', 'breeding', 'health_record' など
  additionalData?: Record<string, unknown>; // アクション固有の追加データ
}

/**
 * カスタムイベント
 */
export interface CustomEvent extends BaseAutomationEvent {
  eventType: 'CUSTOM';
  customEventType: string;
  targetId: string;
  data: Record<string, unknown>;
}

/**
 * 全イベント型の統合
 */
export type TagAutomationEvent =
  | BreedingPlannedEvent
  | BreedingConfirmedEvent
  | PregnancyConfirmedEvent
  | KittenRegisteredEvent
  | AgeThresholdEvent
  | PageActionEvent
  | CustomEvent;

/**
 * イベント名の定数
 */
export const TAG_AUTOMATION_EVENTS = {
  BREEDING_PLANNED: 'tag.automation.breeding.planned',
  BREEDING_CONFIRMED: 'tag.automation.breeding.confirmed',
  PREGNANCY_CONFIRMED: 'tag.automation.pregnancy.confirmed',
  KITTEN_REGISTERED: 'tag.automation.kitten.registered',
  AGE_THRESHOLD: 'tag.automation.age.threshold',
  PAGE_ACTION: 'tag.automation.page.action',
  CUSTOM: 'tag.automation.custom',
} as const;
```

## File: backend/src/tags/age-threshold-checker.service.ts
```typescript
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";

import { PrismaService } from "../prisma/prisma.service";

import { TAG_AUTOMATION_EVENTS } from "./events/tag-automation.events";

/**
 * 年齢閾値チェックサービス
 * 
 * 定期的に猫の年齢をチェックし、閾値に達したらイベントを発火
 */
@Injectable()
export class AgeThresholdCheckerService {
  private readonly logger = new Logger(AgeThresholdCheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 毎日午前0時に年齢閾値をチェック
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAgeThresholds() {
    this.logger.log("年齢閾値チェック開始");

    try {
      // アクティブな年齢閾値ルールを取得
      const rules = await this.prisma.tagAutomationRule.findMany({
        where: {
          isActive: true,
          eventType: "AGE_THRESHOLD",
        },
      });

      if (rules.length === 0) {
        this.logger.log("アクティブな年齢閾値ルールがありません");
        return;
      }

      // すべての在舎猫を取得
      const cats = await this.prisma.cat.findMany({
        where: {
          isInHouse: true,
        },
        select: {
          id: true,
          birthDate: true,
          motherId: true,
        },
      });

      this.logger.log(`${cats.length}匹の猫をチェックします`);

      const today = new Date();
      let eventsEmitted = 0;

      for (const cat of cats) {
        const birthDate = new Date(cat.birthDate);
        const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        const ageInMonths = this.calculateAgeInMonths(birthDate, today);

        for (const rule of rules) {
          if (this.shouldTriggerRule(rule, ageInDays, ageInMonths, cat.motherId)) {
            this.logger.log(`猫ID ${cat.id} がルール "${rule.name}" の閾値に到達`);
            
            // イベントを発火
            this.eventEmitter.emit(TAG_AUTOMATION_EVENTS.AGE_THRESHOLD, {
              eventType: "AGE_THRESHOLD" as const,
              catId: cat.id,
              ageInDays,
              ageInMonths,
              ruleId: rule.id,
            });

            eventsEmitted++;
          }
        }
      }

      this.logger.log(`年齢閾値チェック完了: ${eventsEmitted}件のイベント発火`);
    } catch (error) {
      this.logger.error("年齢閾値チェック中にエラーが発生", error);
    }
  }

  /**
   * 年齢を月単位で計算
   */
  private calculateAgeInMonths(birthDate: Date, currentDate: Date): number {
    let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    months += currentDate.getMonth() - birthDate.getMonth();
    
    // 日付を考慮
    if (currentDate.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  }

  /**
   * ルールが発火すべきかを判定
   */
  private shouldTriggerRule(
    rule: { config: unknown },
    ageInDays: number,
    ageInMonths: number,
    motherId: string | null,
  ): boolean {
    const config = rule.config as Record<string, unknown> | null;
    if (!config) return false;

    // 子猫用の日数チェック（母猫IDがある場合）
    if (motherId && config.kitten) {
      const kittenConfig = config.kitten as Record<string, unknown>;
      const minDays = kittenConfig.minDays as number | undefined;
      const maxDays = kittenConfig.maxDays as number | undefined;

      if (minDays !== undefined && ageInDays < minDays) return false;
      if (maxDays !== undefined && ageInDays >= maxDays) return false;

      return true;
    }

    // 成猫用の月数チェック
    if (config.adult) {
      const adultConfig = config.adult as Record<string, unknown>;
      const minMonths = adultConfig.minMonths as number | undefined;
      const maxMonths = adultConfig.maxMonths as number | undefined;

      if (minMonths !== undefined && ageInMonths < minMonths) return false;
      if (maxMonths !== undefined && ageInMonths >= maxMonths) return false;

      return true;
    }

    return false;
  }

  /**
   * 手動で年齢チェックを実行（テスト用）
   */
  async manualCheck() {
    this.logger.log("手動年齢閾値チェックを実行");
    await this.checkAgeThresholds();
  }
}
```

## File: backend/src/tags/tag-automation-execution.service.ts
```typescript
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import type { Prisma } from "@prisma/client";
import {
  // TagAutomationEventType, // Unused - keeping import for future use
  // TagAutomationRunStatus, // Unused - keeping import for future use
  TagAssignmentAction,
  TagAssignmentSource,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  TAG_AUTOMATION_EVENTS,
  type TagAutomationEvent,
  type BreedingPlannedEvent,
  type BreedingConfirmedEvent,
  type PregnancyConfirmedEvent,
  type KittenRegisteredEvent,
  type AgeThresholdEvent,
  type PageActionEvent,
  type CustomEvent,
} from "./events/tag-automation.events";
import { TagAutomationService } from "./tag-automation.service";

interface RuleExecutionResult {
  ruleId: string;
  ruleName: string;
  success: boolean;
  tagsAssigned: number;
  error?: string;
}

@Injectable()
export class TagAutomationExecutionService {
  private readonly logger = new Logger(TagAutomationExecutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly automationService: TagAutomationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * イベントに基づいてルールを実行
   */
  async executeRulesForEvent(event: TagAutomationEvent): Promise<RuleExecutionResult[]> {
    this.logger.log(`Executing rules for event: ${event.eventType}`);

    try {
      // アクティブなルールを取得（イベントタイプでフィルタ、優先度順）
      const rulesResponse = await this.automationService.findRules({
        isActive: true,
        eventTypes: [event.eventType],
        includeRuns: false,
      });

      const rules = rulesResponse.data;

      if (rules.length === 0) {
        this.logger.debug(`No active rules found for event type: ${event.eventType}`);
        return [];
      }

      this.logger.log(`Found ${rules.length} active rules for event type: ${event.eventType}`);

      // 優先度順にルールを実行（既にソート済み）
      const results: RuleExecutionResult[] = [];

      for (const rule of rules) {
        try {
          const result = await this.executeRule(rule.id, event);
          results.push(result);
        } catch (error) {
          this.logger.error(
            `Failed to execute rule ${rule.id} (${rule.name}):`,
            error instanceof Error ? error.message : String(error),
          );
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            tagsAssigned: 0,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Error executing rules for event ${event.eventType}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * 個別ルールの実行
   */
  private async executeRule(
    ruleId: string,
    event: TagAutomationEvent,
  ): Promise<RuleExecutionResult> {
    // ルール詳細を取得
    const ruleResponse = await this.automationService.findRuleById(ruleId);
    const rule = ruleResponse.data;

    this.logger.debug(`Executing rule: ${rule.name} (${ruleId})`);

    // 実行記録を作成
    const runResponse = await this.automationService.createRun(
      ruleId,
      event as unknown as Record<string, unknown>,
    );
    const run = runResponse.data;

    try {
      // 対象猫を取得
      const targetCatIds = await this.getTargetCats(rule, event);

      if (targetCatIds.length === 0) {
        this.logger.debug(`No target cats found for rule: ${rule.name}`);
        await this.automationService.markRunCompleted(run.id);
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          success: true,
          tagsAssigned: 0,
        };
      }

      // 付与するタグを取得
      const tagIds = await this.getTagsToAssign(rule);

      if (tagIds.length === 0) {
        this.logger.warn(`No tags configured for rule: ${rule.name}`);
        await this.automationService.markRunCompleted(run.id);
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          success: true,
          tagsAssigned: 0,
        };
      }

      // タグを付与
      let assignedCount = 0;
      for (const catId of targetCatIds) {
        for (const tagId of tagIds) {
          try {
            await this.assignTag(catId, tagId, rule.id, run.id);
            assignedCount++;
          } catch (error) {
            this.logger.warn(
              `Failed to assign tag ${tagId} to cat ${catId}:`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      }

      // 実行完了を記録
      await this.automationService.markRunCompleted(run.id);

      this.logger.log(`Rule ${rule.name} executed successfully. Assigned ${assignedCount} tags.`);

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        success: true,
        tagsAssigned: assignedCount,
      };
    } catch (error) {
      // 実行失敗を記録
      await this.automationService.markRunFailed(
        run.id,
        error instanceof Error ? error.message : String(error),
      );

      throw error;
    }
  }

  /**
   * 対象となる猫のIDを取得
   */
  private async getTargetCats(
    rule: { config?: Prisma.JsonValue },
    event: TagAutomationEvent,
  ): Promise<string[]> {
    const catIds: string[] = [];

    // イベントタイプに応じて対象猫を特定
    switch (event.eventType) {
      case 'BREEDING_PLANNED':
      case 'BREEDING_CONFIRMED':
        catIds.push((event as BreedingPlannedEvent).maleId, (event as BreedingPlannedEvent).femaleId);
        break;

      case 'PREGNANCY_CONFIRMED':
        catIds.push((event as PregnancyConfirmedEvent).femaleId);
        if ((event as PregnancyConfirmedEvent).maleId) {
          catIds.push((event as PregnancyConfirmedEvent).maleId!);
        }
        break;

      case 'KITTEN_REGISTERED':
        catIds.push((event as KittenRegisteredEvent).kittenId);
        if ((event as KittenRegisteredEvent).motherId) {
          catIds.push((event as KittenRegisteredEvent).motherId!);
        }
        if ((event as KittenRegisteredEvent).fatherId) {
          catIds.push((event as KittenRegisteredEvent).fatherId!);
        }
        break;

      case 'AGE_THRESHOLD':
        catIds.push((event as AgeThresholdEvent).catId);
        break;

      case 'PAGE_ACTION': {
        // PAGE_ACTIONイベントの処理
        const pageEvent = event as PageActionEvent;
        
        // configから対象猫の選択方法を取得
        const config = rule.config as Record<string, unknown> | null;
        const targetSelection = config?.['targetSelection'] as string | undefined;
        
        if (targetSelection === 'event_target' && pageEvent.targetType === 'cat') {
          // イベントで指定された猫を対象とする
          catIds.push(pageEvent.targetId);
        } else if (targetSelection === 'specific_cats' && config?.['specificCatIds']) {
          // 特定の猫リストを対象とする
          const specificCats = config['specificCatIds'] as string[];
          catIds.push(...specificCats);
        } else if (targetSelection === 'all_cats') {
          // 全猫を対象とする（スコープやフィルタを適用可能）
          const filters = config?.['filters'] as Record<string, unknown> | undefined;
          const allCats = await this.getAllCatsMatchingFilters(filters);
          catIds.push(...allCats.map(cat => cat.id));
        } else {
          // デフォルト: イベントターゲットが猫の場合はそれを使用
          if (pageEvent.targetType === 'cat') {
            catIds.push(pageEvent.targetId);
          }
        }
        break;
      }

      case 'CUSTOM':
        catIds.push((event as CustomEvent).targetId);
        break;
    }

    // configに基づいて対象をフィルタリング（将来的な拡張用）
    if (rule.config && typeof rule.config === 'object') {
      // 例: { "targetRole": "mother_only" } などの条件でフィルタ
      // 今はシンプルにすべての対象を返す
    }

    return [...new Set(catIds)]; // 重複を削除
  }

  /**
   * 付与するタグのIDを取得
   */
  private async getTagsToAssign(rule: {
    config?: Prisma.JsonValue;
  }): Promise<string[]> {
    // configからタグIDを取得
    if (!rule.config || typeof rule.config !== 'object') {
      return [];
    }

    const config = rule.config as { tagIds?: string[] };
    return config.tagIds ?? [];
  }

  /**
   * タグを猫に付与
   */
  private async assignTag(
    catId: string,
    tagId: string,
    ruleId: string,
    automationRunId: string,
  ): Promise<void> {
    // 既に付与されているかチェック
    const existing = await this.prisma.catTag.findUnique({
      where: {
        catId_tagId: {
          catId,
          tagId,
        },
      },
    });

    if (existing) {
      this.logger.debug(`Tag ${tagId} already assigned to cat ${catId}`);
      return;
    }

    // タグを付与
    await this.prisma.catTag.create({
      data: {
        catId,
        tagId,
      },
    });

    // 履歴を記録
    await this.automationService.recordAssignment({
      catId,
      tagId,
      action: TagAssignmentAction.ASSIGNED,
      source: TagAssignmentSource.AUTOMATION,
      ruleId,
      automationRunId,
      applyTagMutation: false, // 既に付与済み
    });

    this.logger.debug(`Assigned tag ${tagId} to cat ${catId} via rule ${ruleId}`);
  }

  /**
   * フィルタに一致する全猫を取得
   */
  private async getAllCatsMatchingFilters(
    filters?: Record<string, unknown>,
  ): Promise<Array<{ id: string }>> {
    const where: Prisma.CatWhereInput = {};

    if (filters) {
      // フィルタ条件を適用
      if (filters['breedId']) {
        where.breedId = filters['breedId'] as string;
      }
      if (filters['gender']) {
        where.gender = filters['gender'] as string;
      }
      // 他のフィルタ条件も必要に応じて追加
    }

    const cats = await this.prisma.cat.findMany({
      where,
      select: { id: true },
    });

    return cats;
  }

  /**
   * イベントリスナー: 交配予定
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.BREEDING_PLANNED)
  async handleBreedingPlanned(event: BreedingPlannedEvent) {
    this.logger.log(`Handling BREEDING_PLANNED event: ${event.breedingId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 交配確認
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.BREEDING_CONFIRMED)
  async handleBreedingConfirmed(event: BreedingConfirmedEvent) {
    this.logger.log(`Handling BREEDING_CONFIRMED event: ${event.breedingId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 妊娠確認
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.PREGNANCY_CONFIRMED)
  async handlePregnancyConfirmed(event: PregnancyConfirmedEvent) {
    this.logger.log(`Handling PREGNANCY_CONFIRMED event: ${event.pregnancyCheckId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 子猫登録
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.KITTEN_REGISTERED)
  async handleKittenRegistered(event: KittenRegisteredEvent) {
    this.logger.log(`Handling KITTEN_REGISTERED event: ${event.kittenId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: 年齢閾値
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.AGE_THRESHOLD)
  async handleAgeThreshold(event: AgeThresholdEvent) {
    this.logger.log(`Handling AGE_THRESHOLD event for cat: ${event.catId}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: ページ・アクション
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.PAGE_ACTION)
  async handlePageAction(event: PageActionEvent) {
    this.logger.log(`Handling PAGE_ACTION event: ${event.page}.${event.action}`);
    await this.executeRulesForEvent(event);
  }

  /**
   * イベントリスナー: カスタム
   */
  @OnEvent(TAG_AUTOMATION_EVENTS.CUSTOM)
  async handleCustomEvent(event: CustomEvent) {
    this.logger.log(`Handling CUSTOM event: ${event.customEventType}`);
    await this.executeRulesForEvent(event);
  }
}
```

## File: backend/src/tags/tag-automation.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { TagAutomationEventType, TagAutomationRunStatus, TagAutomationTriggerType } from "@prisma/client";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CreateTagAutomationRuleDto, UpdateTagAutomationRuleDto } from "./dto";
import { TAG_AUTOMATION_EVENTS } from "./events/tag-automation.events";
import { TagAutomationService } from "./tag-automation.service";

@ApiTags("Tag Automation")
@Controller("tags/automation")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagAutomationController {
  constructor(
    private readonly tagAutomationService: TagAutomationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get("rules")
  @ApiOperation({ summary: "自動化ルール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "ルール一覧を返却" })
  @ApiQuery({
    name: "active",
    required: false,
    description: "アクティブなルールのみ取得",
    type: Boolean,
  })
  @ApiQuery({
    name: "scope",
    required: false,
    description: "スコープでフィルタ",
    type: String,
  })
  @ApiQuery({
    name: "triggerType",
    required: false,
    description: "トリガータイプでフィルタ",
    type: String,
  })
  @ApiQuery({
    name: "eventType",
    required: false,
    description: "イベントタイプでフィルタ",
    type: String,
  })
  async findRules(
    @Query("active") active?: string,
    @Query("scope") scope?: string,
    @Query("triggerType") triggerType?: string,
    @Query("eventType") eventType?: string,
  ) {
    const activeFlag = active === "true" ? true : active === "false" ? false : undefined;

    return this.tagAutomationService.findRules({
      isActive: activeFlag,
      scope: scope || undefined,
      triggerTypes: triggerType ? [triggerType as TagAutomationTriggerType] : undefined,
      eventTypes: eventType ? [eventType as TagAutomationEventType] : undefined,
    });
  }

  @Get("rules/:id")
  @ApiOperation({ summary: "自動化ルール詳細の取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "ルール詳細を返却" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "ルールが見つかりません" })
  @ApiParam({ name: "id", description: "ルールID" })
  @ApiQuery({
    name: "includeRuns",
    required: false,
    description: "実行履歴を含める",
    type: Boolean,
  })
  @ApiQuery({
    name: "includeHistoryCount",
    required: false,
    description: "付与履歴件数を含める",
    type: Boolean,
  })
  async findRuleById(
    @Param("id") id: string,
    @Query("includeRuns") includeRuns?: string,
    @Query("includeHistoryCount") includeHistoryCount?: string,
  ) {
    const includeRunsFlag = includeRuns === "true";
    const includeHistoryCountFlag = includeHistoryCount === "true";

    return this.tagAutomationService.findRuleById(id, {
      includeRuns: includeRunsFlag,
      includeHistoryCount: includeHistoryCountFlag,
    });
  }

  @Post("rules")
  @ApiOperation({ summary: "自動化ルールの作成" })
  @ApiResponse({ status: HttpStatus.CREATED, description: "ルールを作成しました" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "入力エラー" })
  async createRule(@Body() dto: CreateTagAutomationRuleDto) {
    return this.tagAutomationService.createRule(dto);
  }

  @Patch("rules/:id")
  @ApiOperation({ summary: "自動化ルールの更新" })
  @ApiResponse({ status: HttpStatus.OK, description: "ルールを更新しました" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "ルールが見つかりません" })
  @ApiParam({ name: "id", description: "ルールID" })
  async updateRule(@Param("id") id: string, @Body() dto: UpdateTagAutomationRuleDto) {
    return this.tagAutomationService.updateRule(id, dto);
  }

  @Delete("rules/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "自動化ルールの削除" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "ルールを削除しました" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "ルールが見つかりません" })
  @ApiParam({ name: "id", description: "ルールID" })
  async deleteRule(@Param("id") id: string) {
    await this.tagAutomationService.deleteRule(id);
  }

  @Get("runs")
  @ApiOperation({ summary: "ルール実行履歴の取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "実行履歴一覧を返却" })
  @ApiQuery({
    name: "ruleId",
    required: false,
    description: "ルールIDでフィルタ",
    type: String,
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "ステータスでフィルタ (PENDING, COMPLETED, FAILED)",
    type: String,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "取得件数の上限",
    type: Number,
  })
  async findRuns(
    @Query("ruleId") ruleId?: string,
    @Query("status") status?: string,
    @Query("limit") limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const statuses = status ? [status as TagAutomationRunStatus] : undefined;

    return this.tagAutomationService.findRuns({
      ruleId: ruleId || undefined,
      statuses,
      take: limitNum,
    });
  }

    @Post("rules/:id/execute")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "ルールを手動実行（テスト用）" })
  @ApiParam({ name: "id", description: "ルールID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "ルール実行成功",
  })
  async executeRule(@Param("id") id: string, @Body() testPayload?: Record<string, unknown>) {
    // ルールを取得
    const ruleResponse = await this.tagAutomationService.findRuleById(id);
    const rule = ruleResponse.data;

    // テストイベントを発行
    let eventName: string;
    let eventPayload: Record<string, unknown>;

    switch (rule.eventType) {
      case "BREEDING_PLANNED":
        eventName = TAG_AUTOMATION_EVENTS.BREEDING_PLANNED;
        eventPayload = {
          eventType: "BREEDING_PLANNED" as const,
          breedingId: testPayload?.breedingId || "test-breeding-id",
          maleId: testPayload?.maleId || "test-male-id",
          femaleId: testPayload?.femaleId || "test-female-id",
        };
        break;

      case "BREEDING_CONFIRMED":
        eventName = TAG_AUTOMATION_EVENTS.BREEDING_CONFIRMED;
        eventPayload = {
          eventType: "BREEDING_CONFIRMED" as const,
          breedingId: testPayload?.breedingId || "test-breeding-id",
          maleId: testPayload?.maleId || "test-male-id",
          femaleId: testPayload?.femaleId || "test-female-id",
        };
        break;

      case "PREGNANCY_CONFIRMED":
        eventName = TAG_AUTOMATION_EVENTS.PREGNANCY_CONFIRMED;
        eventPayload = {
          eventType: "PREGNANCY_CONFIRMED" as const,
          pregnancyCheckId: testPayload?.pregnancyCheckId || "test-pregnancy-id",
          femaleId: testPayload?.femaleId || "test-female-id",
          maleId: testPayload?.maleId as string | undefined,
        };
        break;

      case "KITTEN_REGISTERED":
        eventName = TAG_AUTOMATION_EVENTS.KITTEN_REGISTERED;
        eventPayload = {
          eventType: "KITTEN_REGISTERED" as const,
          kittenId: testPayload?.kittenId || "test-kitten-id",
          motherId: testPayload?.motherId as string | undefined,
          fatherId: testPayload?.fatherId as string | undefined,
        };
        break;

      case "AGE_THRESHOLD":
        eventName = TAG_AUTOMATION_EVENTS.AGE_THRESHOLD;
        eventPayload = {
          eventType: "AGE_THRESHOLD" as const,
          catId: testPayload?.catId || "test-cat-id",
          ageInMonths: testPayload?.ageInMonths || 12,
        };
        break;

      case "PAGE_ACTION":
        eventName = TAG_AUTOMATION_EVENTS.PAGE_ACTION;
        eventPayload = {
          eventType: "PAGE_ACTION" as const,
          page: testPayload?.page || (typeof rule.config === 'object' && rule.config !== null && 'page' in rule.config ? rule.config['page'] as string : "cats"),
          action: testPayload?.action || (typeof rule.config === 'object' && rule.config !== null && 'action' in rule.config ? rule.config['action'] as string : "create"),
          targetId: testPayload?.targetId || "test-target-id",
          targetType: testPayload?.targetType as string | undefined,
          additionalData: testPayload?.additionalData as Record<string, unknown> | undefined,
        };
        break;

      case "CUSTOM":
        eventName = TAG_AUTOMATION_EVENTS.CUSTOM;
        eventPayload = {
          eventType: "CUSTOM" as const,
          customEventType: testPayload?.customEventType || "test",
          targetId: testPayload?.targetId || "test-target-id",
          metadata: testPayload?.metadata as Record<string, unknown> | undefined,
        };
        break;

      default:
        return {
          success: false,
          message: `Unsupported event type: ${rule.eventType}`,
        };
    }

    // イベント発行
    this.eventEmitter.emit(eventName, eventPayload);

    return {
      success: true,
      message: `Test event emitted for rule: ${rule.name}`,
      eventType: rule.eventType,
      eventName,
      payload: eventPayload,
    };
  }
}
```

## File: backend/src/tags/tag-automation.service.spec.ts
```typescript
import { BadRequestException } from "@nestjs/common";
import {
  Prisma,
  TagAssignmentAction,
  TagAssignmentSource,
  TagAutomationEventType,
  TagAutomationTriggerType,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { TagAutomationService } from "./tag-automation.service";

describe("TagAutomationService", () => {
  let service: TagAutomationService;
  let prismaMock: {
    tagAutomationRule: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    tagAutomationRun: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    tagAssignmentHistory: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    catTag: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      tagAutomationRule: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      tagAutomationRun: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      tagAssignmentHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      catTag: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((operations: Array<Promise<unknown>>) => Promise.all(operations)),
    };

    service = new TagAutomationService(prismaMock as unknown as PrismaService);
  });

  describe("createRule", () => {
    it("normalizes key when not provided", async () => {
      const rule = {
        id: "rule-1",
        key: "auto-tag-test-rule",
        name: "Auto Tag Test Rule",
        description: null,
        triggerType: TagAutomationTriggerType.EVENT,
        eventType: TagAutomationEventType.CUSTOM,
        scope: null,
        isActive: true,
        priority: 0,
        config: Prisma.JsonNull,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.tagAutomationRule.create.mockResolvedValue(rule);

      const result = await service.createRule({
        name: "Auto Tag Test Rule",
        triggerType: TagAutomationTriggerType.EVENT,
        eventType: TagAutomationEventType.CUSTOM,
      });

      expect(prismaMock.tagAutomationRule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          key: expect.stringMatching(/^custom-\d+$/), // タイムスタンプベースのキー生成に対応
          name: "Auto Tag Test Rule",
          priority: 0,
        }),
      });
      expect(result.data).toEqual(rule);
    });

    it("throws BadRequestException on unique key violation", async () => {
      const error = new Prisma.PrismaClientKnownRequestError("Unique violation", {
        code: "P2002",
        clientVersion: "6.16.2",
      });
      prismaMock.tagAutomationRule.create.mockRejectedValue(error);

      await expect(
        service.createRule({
          key: "duplicate",
          name: "Duplicate",
          triggerType: TagAutomationTriggerType.EVENT,
          eventType: TagAutomationEventType.CUSTOM,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("recordAssignment", () => {
    it("records history and upserts cat tag when assigning", async () => {
      const historyRecord = {
        id: "history-1",
        catId: "cat-1",
        tagId: "tag-1",
        ruleId: null,
        automationRunId: null,
        action: TagAssignmentAction.ASSIGNED,
        source: TagAssignmentSource.AUTOMATION,
        reason: null,
        metadata: Prisma.JsonNull,
        createdAt: new Date(),
      };
      prismaMock.catTag.upsert.mockResolvedValue({});
      prismaMock.tagAssignmentHistory.create.mockReturnValue(Promise.resolve(historyRecord));

      const result = await service.recordAssignment({
        catId: "cat-1",
        tagId: "tag-1",
        action: TagAssignmentAction.ASSIGNED,
        applyTagMutation: true,
      });

      expect(prismaMock.catTag.upsert).toHaveBeenCalledWith({
        where: { catId_tagId: { catId: "cat-1", tagId: "tag-1" } },
        update: {},
        create: { catId: "cat-1", tagId: "tag-1" },
      });
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result.data).toEqual(historyRecord);
    });
  });
});
```

## File: backend/src/tags/tag-automation.service.ts
```typescript
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  TagAutomationEventType,
  TagAutomationRunStatus,
  TagAutomationTriggerType,
  TagAssignmentAction,
  TagAssignmentSource,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  CreateTagAutomationRuleDto,
  UpdateTagAutomationRuleDto,
} from "./dto";

export interface FindAutomationRuleOptions {
  isActive?: boolean;
  triggerTypes?: TagAutomationTriggerType[];
  eventTypes?: TagAutomationEventType[];
  scope?: string | null;
  includeRuns?: boolean;
  runsLimit?: number;
  includeHistoryCount?: boolean;
}

export interface FindAutomationRunOptions {
  ruleId?: string;
  statuses?: TagAutomationRunStatus[];
  take?: number;
}

// Config型定義 - 型安全性のため
interface BaseConfig {
  actionType?: 'ADD' | 'REMOVE';
}

interface PageActionConfig extends BaseConfig {
  page?: string;
  action?: string;
}

interface AgeThresholdConfig extends BaseConfig {
  ageType?: 'months' | 'days';
  threshold?: number;
}

// TAG_ASSIGNEDイベント用の設定（BaseConfig のみ使用）
type TagAssignedConfig = BaseConfig;

type AutomationConfig = PageActionConfig | AgeThresholdConfig | TagAssignedConfig | Record<string, unknown>;

export interface RecordAssignmentOptions {
  catId: string;
  tagId: string;
  action: TagAssignmentAction;
  source?: TagAssignmentSource;
  ruleId?: string;
  automationRunId?: string;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  applyTagMutation?: boolean;
}

@Injectable()
export class TagAutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async findRules(options: FindAutomationRuleOptions = {}) {
    const {
      isActive,
      triggerTypes,
      eventTypes,
      scope,
      includeRuns = false,
      runsLimit,
      includeHistoryCount = false,
    } = options;

    const where: Prisma.TagAutomationRuleWhereInput = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(triggerTypes && triggerTypes.length ? { triggerType: { in: triggerTypes } } : {}),
      ...(eventTypes && eventTypes.length ? { eventType: { in: eventTypes } } : {}),
      ...(scope === null
        ? { scope: null }
        : scope
          ? { OR: [{ scope }, { scope: null }] }
          : {}),
    };

    const include: Prisma.TagAutomationRuleInclude = {};

    if (includeRuns) {
      include.runs = {
        orderBy: { createdAt: "desc" },
        ...(runsLimit ? { take: runsLimit } : {}),
      };
    }

    if (includeHistoryCount) {
      include._count = { select: { history: true } };
    }

    const data = await this.prisma.tagAutomationRule.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
      include: Object.keys(include).length ? include : undefined,
    });

    return { success: true, data };
  }

  async findRuleById(id: string, options: Omit<FindAutomationRuleOptions, "isActive"> = {}) {
    const { includeRuns = false, runsLimit, includeHistoryCount = false } = options;

    const include: Prisma.TagAutomationRuleInclude = {};

    if (includeRuns) {
      include.runs = {
        orderBy: { createdAt: "desc" },
        ...(runsLimit ? { take: runsLimit } : {}),
      };
    }

    if (includeHistoryCount) {
      include._count = { select: { history: true } };
    }

    const rule = await this.prisma.tagAutomationRule.findUnique({
      where: { id },
      include: Object.keys(include).length ? include : undefined,
    });

    if (!rule) {
      throw new NotFoundException("タグ自動化ルールが見つかりません");
    }

    return { success: true, data: rule };
  }

  async createRule(dto: CreateTagAutomationRuleDto) {
    // キーの自動生成（未指定の場合）
    const timestamp = Date.now();
    const eventTypeStr = dto.eventType || 'unknown';
    const key = dto.key 
      ? this.normalizeKey(dto.key) 
      : this.normalizeKey(`${eventTypeStr}-${timestamp}`);

    // 名前の自動生成（未指定の場合）
    const name = dto.name || this.generateRuleName(dto);

    try {
      const rule = await this.prisma.tagAutomationRule.create({
        data: {
          key,
          name,
          description: dto.description ?? undefined,
          triggerType: dto.triggerType,
          eventType: dto.eventType ?? 'PAGE_ACTION', // デフォルトはPAGE_ACTION
          scope: dto.scope ?? undefined,
          isActive: dto.isActive ?? true,
          priority: 0, // 優先度は固定値（複数マッチ時は全て適用）
          ...(dto.config !== undefined
            ? { config: this.toJson(dto.config) ?? Prisma.JsonNull }
            : {}),
        },
      });

      return { success: true, data: rule };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じキーを持つ自動化ルールが既に存在します");
      }
      throw error;
    }
  }

  /**
   * ルール名の自動生成
   */
  private generateRuleName(dto: CreateTagAutomationRuleDto): string {
    const config = (dto.config ?? {}) as AutomationConfig;
    
    // 型ガードを使用して安全にプロパティにアクセス
    const isPageActionConfig = (c: AutomationConfig): c is PageActionConfig => {
      return 'page' in c || 'action' in c;
    };
    
    const isAgeThresholdConfig = (c: AutomationConfig): c is AgeThresholdConfig => {
      return 'ageType' in c || 'threshold' in c;
    };
    
    const actionType = config.actionType === 'REMOVE' ? 'タグ削除' : 'タグ付与';
    
    switch (dto.eventType) {
      case 'PAGE_ACTION': {
        if (isPageActionConfig(config)) {
          const page = config.page ?? '不明';
          const action = config.action ?? '不明';
          return `${page} - ${action}時 → ${actionType}`;
        }
        return `ページアクション → ${actionType}`;
      }
      case 'AGE_THRESHOLD': {
        if (isAgeThresholdConfig(config)) {
          const ageType = config.ageType === 'months' ? 'ヶ月' : '日';
          const threshold = config.threshold ?? 0;
          return `生後${threshold}${ageType}達成時 → ${actionType}`;
        }
        return `年齢閾値 → ${actionType}`;
      }
      case 'TAG_ASSIGNED': {
        return `タグ付与時 → ${actionType}`;
      }
      default:
        return `自動化ルール - ${actionType}`;
    }
  }

  async updateRule(id: string, dto: UpdateTagAutomationRuleDto) {
    const updateData: Prisma.TagAutomationRuleUpdateInput = {
      ...(dto.key ? { key: this.normalizeKey(dto.key) } : {}),
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.triggerType !== undefined ? { triggerType: dto.triggerType } : {}),
      ...(dto.eventType !== undefined ? { eventType: dto.eventType } : {}),
      ...(dto.scope !== undefined ? { scope: dto.scope } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.config !== undefined
        ? { config: this.toJson(dto.config) ?? Prisma.JsonNull }
        : {}),
    };

    try {
      const rule = await this.prisma.tagAutomationRule.update({
        where: { id },
        data: updateData,
      });
      return { success: true, data: rule };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じキーを持つ自動化ルールが既に存在します");
      }
      throw error;
    }
  }

  async setRuleActive(id: string, isActive: boolean) {
    const rule = await this.prisma.tagAutomationRule.update({
      where: { id },
      data: { isActive },
    });

    return { success: true, data: rule };
  }

  async deleteRule(id: string) {
    await this.prisma.tagAutomationRule.delete({ where: { id } });
    return { success: true };
  }

  async createRun(ruleId: string, eventPayload?: Record<string, unknown> | null) {
    const run = await this.prisma.tagAutomationRun.create({
      data: {
        ruleId,
        ...(eventPayload !== undefined
          ? { eventPayload: this.toJson(eventPayload) ?? Prisma.JsonNull }
          : {}),
        status: TagAutomationRunStatus.PENDING,
        startedAt: new Date(),
      },
    });

    return { success: true, data: run };
  }

  async markRunCompleted(runId: string, metadata?: { eventPayload?: Record<string, unknown> | null }) {
    const data: Prisma.TagAutomationRunUpdateInput = {
      status: TagAutomationRunStatus.COMPLETED,
      completedAt: new Date(),
      errorMessage: null,
    };

    if (metadata?.eventPayload !== undefined) {
      data.eventPayload = this.toJson(metadata.eventPayload) ?? Prisma.JsonNull;
    }

    const run = await this.prisma.tagAutomationRun.update({
      where: { id: runId },
      data,
    });

    return { success: true, data: run };
  }

  async markRunFailed(runId: string, errorMessage: string, options?: { eventPayload?: Record<string, unknown> | null }) {
    const data: Prisma.TagAutomationRunUpdateInput = {
      status: TagAutomationRunStatus.FAILED,
      completedAt: new Date(),
      errorMessage,
    };

    if (options?.eventPayload !== undefined) {
      data.eventPayload = this.toJson(options.eventPayload) ?? Prisma.JsonNull;
    }

    const run = await this.prisma.tagAutomationRun.update({
      where: { id: runId },
      data,
    });

    return { success: true, data: run };
  }

  async findRuns(options: FindAutomationRunOptions = {}) {
    const { ruleId, statuses, take } = options;

    const where: Prisma.TagAutomationRunWhereInput = {
      ...(ruleId ? { ruleId } : {}),
      ...(statuses && statuses.length ? { status: { in: statuses } } : {}),
    };

    const runs = await this.prisma.tagAutomationRun.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
    });

    return { success: true, data: runs };
  }

  async recordAssignment(options: RecordAssignmentOptions) {
    const {
      catId,
      tagId,
      action,
      source = TagAssignmentSource.AUTOMATION,
      ruleId,
      automationRunId,
      reason,
      metadata,
      applyTagMutation = false,
    } = options;

    const historyCreate = this.prisma.tagAssignmentHistory.create({
      data: {
        catId,
        tagId,
        action,
        source,
        reason: reason ?? undefined,
        ...(metadata !== undefined
          ? { metadata: this.toJson(metadata) ?? Prisma.JsonNull }
          : {}),
        ruleId: ruleId ?? undefined,
        automationRunId: automationRunId ?? undefined,
      },
    });

    if (!applyTagMutation) {
      const history = await historyCreate;
      return { success: true, data: history };
    }

    const operations: Prisma.PrismaPromise<unknown>[] = [];

    if (action === TagAssignmentAction.ASSIGNED) {
      operations.push(
        this.prisma.catTag.upsert({
          where: { catId_tagId: { catId, tagId } },
          update: {},
          create: { catId, tagId },
        }),
      );
    } else {
      operations.push(
        this.prisma.catTag.deleteMany({
          where: { catId, tagId },
        }),
      );
    }

    operations.push(historyCreate);

    const results = await this.prisma.$transaction(operations);
    const history = results[results.length - 1] as Awaited<typeof historyCreate>;

    return { success: true, data: history };
  }

  async getHistoryForCat(catId: string, options: { take?: number; tagId?: string } = {}) {
    const { take, tagId } = options;

    const history = await this.prisma.tagAssignmentHistory.findMany({
      where: {
        catId,
        ...(tagId ? { tagId } : {}),
      },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
      include: {
        tag: true,
        rule: true,
        automationRun: true,
      },
    });

    return { success: true, data: history };
  }

  private normalizeKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  private toJson(value?: Record<string, unknown> | null): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    return value as Prisma.InputJsonValue;
  }

  private isUniqueConstraintViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }
}
```

## File: backend/src/tags/tag-categories.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CreateTagCategoryDto } from "./dto/create-tag-category.dto";
import { ReorderTagCategoriesDto } from "./dto/reorder-tag-category.dto";
import { UpdateTagCategoryDto } from "./dto/update-tag-category.dto";
import { TagCategoriesService } from "./tag-categories.service";
import { TagsService } from "./tags.service";

@ApiTags("Tags")
@Controller("tags/categories")
export class TagCategoriesController {
  constructor(
    private readonly tagCategoriesService: TagCategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "タグカテゴリ一覧の取得" })
  @ApiQuery({ name: "scope", required: false, description: "対象スコープ", type: [String] })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    description: "非アクティブカテゴリを含める",
    type: Boolean,
  })
  findAll(
    @Query("scope") scope?: string | string[],
    @Query("includeInactive") includeInactive?: string,
  ) {
    const scopes = Array.isArray(scope) ? scope : scope ? [scope] : undefined;
    const includeInactiveFlag = includeInactive === "true";
    return this.tagsService.findAll({ scopes, includeInactive: includeInactiveFlag });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "タグカテゴリの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: CreateTagCategoryDto) {
    return this.tagCategoriesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("reorder")
  @ApiOperation({ summary: "タグカテゴリの並び替え" })
  @ApiResponse({ status: HttpStatus.OK })
  reorder(@Body() dto: ReorderTagCategoriesDto) {
    return this.tagCategoriesService.reorder(dto.items);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "タグカテゴリの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdateTagCategoryDto) {
    return this.tagCategoriesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "タグカテゴリの削除" })
  @ApiParam({ name: "id" })
  async remove(@Param("id") id: string) {
    await this.tagCategoriesService.remove(id);
    return { success: true };
  }
}
```

## File: backend/src/tags/tag-categories.service.ts
```typescript
import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, TagCategory } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateTagCategoryDto } from "./dto/create-tag-category.dto";
import { UpdateTagCategoryDto } from "./dto/update-tag-category.dto";

interface FindManyOptions {
  scopes?: string[];
  includeGroups?: boolean;
  includeInactive?: boolean;
}

type TagCategoryWithGroups = Prisma.TagCategoryGetPayload<{
  include: {
    groups: {
      include: {
        tags: {
          include: {
            cats: {
              select: { catId: true };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class TagCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(options: FindManyOptions & { includeGroups: true }): Promise<TagCategoryWithGroups[]>;
  async findMany(options?: FindManyOptions): Promise<TagCategory[]>;
  async findMany(options: FindManyOptions = {}) {
    const { scopes, includeGroups = false, includeInactive = false } = options;

    const whereClause: Prisma.TagCategoryWhereInput = {
      ...(includeInactive ? {} : { isActive: true }),
      ...((scopes && scopes.length > 0)
        ? {
            OR: [
              { scopes: { hasSome: scopes } },
              { scopes: { equals: [] as string[] } },
            ],
          }
        : {}),
    };

    const args: Prisma.TagCategoryFindManyArgs = {
      where: whereClause,
      orderBy: [
        { displayOrder: "asc" },
        { name: "asc" },
      ],
      include: includeGroups
        ? {
            groups: {
              where: includeInactive ? {} : { isActive: true },
              include: {
                tags: {
                  where: includeInactive ? {} : { isActive: true },
                  include: {
                    cats: {
                      select: { catId: true },
                    },
                  },
                  orderBy: [
                    { displayOrder: "asc" },
                    { name: "asc" },
                  ],
                },
              },
              orderBy: [
                { displayOrder: "asc" },
                { name: "asc" },
              ],
            },
          }
        : undefined,
    };

    if (includeGroups) {
      return this.prisma.tagCategory.findMany(args) as Promise<TagCategoryWithGroups[]>;
    }

    return this.prisma.tagCategory.findMany(args);
  }

  async create(dto: CreateTagCategoryDto) {
    const key = this.normalizeKey(dto.key ?? dto.name);
    const displayOrder = dto.displayOrder ?? (await this.getNextDisplayOrder());

    try {
      const data = await this.prisma.tagCategory.create({
        data: {
          key,
          name: dto.name,
          description: dto.description ?? undefined,
          color: dto.color ?? undefined,
          textColor: dto.textColor ?? undefined,
          displayOrder,
          scopes: dto.scopes ?? [],
          isActive: dto.isActive ?? true,
        },
      });
      return { success: true, data };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じキーを持つカテゴリが既に存在します");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTagCategoryDto) {
    const data = await this.prisma.tagCategory.update({
      where: { id },
      data: {
        ...(dto.key ? { key: this.normalizeKey(dto.key) } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.textColor !== undefined ? { textColor: dto.textColor } : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.scopes !== undefined ? { scopes: dto.scopes } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.tagCategory.delete({ where: { id } });
    return { success: true };
  }

  async reorder(items: Array<{ id: string; displayOrder: number }>) {
    if (!items.length) {
      return { success: true };
    }

    await this.prisma.$transaction(
      items.map(({ id, displayOrder }) =>
        this.prisma.tagCategory.update({ where: { id }, data: { displayOrder } }),
      ),
    );

    return { success: true };
  }

  private normalizeKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  private isUniqueConstraintViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  private async getNextDisplayOrder(): Promise<number> {
    const result = await this.prisma.tagCategory.aggregate({
      _max: { displayOrder: true },
    });
    return (result._max.displayOrder ?? -1) + 1;
  }
}
```

## File: backend/src/tags/tag-groups.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CreateTagGroupDto, ReorderTagGroupDto, UpdateTagGroupDto } from "./dto";
import { TagGroupsService } from "./tag-groups.service";

@ApiTags("Tags")
@Controller("tags/groups")
export class TagGroupsController {
  constructor(private readonly tagGroupsService: TagGroupsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "タググループの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: CreateTagGroupDto) {
    return this.tagGroupsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("reorder")
  @ApiOperation({ summary: "タググループの並び替え" })
  @ApiResponse({ status: HttpStatus.OK })
  reorder(@Body() dto: ReorderTagGroupDto) {
    return this.tagGroupsService.reorder(dto.items);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "タググループの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdateTagGroupDto) {
    return this.tagGroupsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "タググループの削除" })
  @ApiParam({ name: "id" })
  async remove(@Param("id") id: string) {
    await this.tagGroupsService.remove(id);
    return { success: true };
  }
}
```

## File: backend/src/tags/tag-groups.service.ts
```typescript
import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateTagGroupDto } from "./dto/create-tag-group.dto";
import { UpdateTagGroupDto } from "./dto/update-tag-group.dto";

@Injectable()
export class TagGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTagGroupDto) {
    const displayOrder = dto.displayOrder ?? (await this.getNextDisplayOrder(dto.categoryId));

    try {
      const data = await this.prisma.tagGroup.create({
        data: {
          category: { connect: { id: dto.categoryId } },
          name: dto.name,
          description: dto.description ?? undefined,
          color: dto.color ?? undefined,
          textColor: dto.textColor ?? undefined,
          displayOrder,
          isActive: dto.isActive ?? true,
        },
      });
      return { success: true, data };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じ名称のグループが既に存在します");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTagGroupDto) {
    try {
      const data = await this.prisma.tagGroup.update({
        where: { id },
        data: {
          ...(dto.categoryId ? { category: { connect: { id: dto.categoryId } } } : {}),
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
          ...(dto.textColor !== undefined ? { textColor: dto.textColor } : {}),
          ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
      return { success: true, data };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じ名称のグループが既に存在します");
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.prisma.tagGroup.delete({ where: { id } });
    return { success: true };
  }

  async reorder(items: Array<{ id: string; displayOrder: number; categoryId?: string }>) {
    if (!items.length) {
      return { success: true };
    }

    await this.prisma.$transaction(
      items.map(({ id, displayOrder, categoryId }) =>
        this.prisma.tagGroup.update({
          where: { id },
          data: {
            displayOrder,
            ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          },
        }),
      ),
    );

    return { success: true };
  }

  private async getNextDisplayOrder(categoryId: string): Promise<number> {
    const result = await this.prisma.tagGroup.aggregate({
      _max: { displayOrder: true },
      where: { categoryId },
    });
    return (result._max.displayOrder ?? -1) + 1;
  }

  private isUniqueConstraintViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
```

## File: backend/src/tags/tags.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { AssignTagDto, CreateTagDto, ReorderTagsDto, UpdateTagDto } from "./dto";
import { TagsService } from "./tags.service";

@ApiTags("Tags")
@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: "タグ一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiQuery({ name: "scope", required: false, description: "対象スコープ", type: [String] })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    description: "非アクティブなタグを含めるか",
    type: Boolean,
  })
  findAll(
    @Query("scope") scope?: string | string[],
    @Query("includeInactive") includeInactive?: string,
  ) {
    const scopes = Array.isArray(scope) ? scope : scope ? [scope] : undefined;
    const includeInactiveFlag = includeInactive === "true";
    return this.tagsService.findAll({ scopes, includeInactive: includeInactiveFlag });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "タグの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("reorder")
  @ApiOperation({ summary: "タグの並び替え" })
  @ApiResponse({ status: HttpStatus.OK })
  reorder(@Body() dto: ReorderTagsDto) {
    return this.tagsService.reorder(dto.items);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "タグの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiOperation({ summary: "タグの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string) {
    return this.tagsService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("/cats/:id/tags")
  @ApiOperation({ summary: "猫にタグを付与" })
  @ApiResponse({ status: HttpStatus.OK, description: "付与成功（重複時もOK）" })
  @ApiParam({ name: "id" })
  @HttpCode(HttpStatus.OK)
  assign(@Param("id") catId: string, @Body() dto: AssignTagDto) {
    return this.tagsService.assignToCat(catId, dto.tagId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("/cats/:id/tags/:tagId")
  @ApiOperation({ summary: "猫からタグを剥奪" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  @ApiParam({ name: "tagId" })
  unassign(@Param("id") catId: string, @Param("tagId") tagId: string) {
    return this.tagsService.unassignFromCat(catId, tagId);
  }
}
```

## File: backend/src/tags/tags.module.ts
```typescript
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { PrismaModule } from "../prisma/prisma.module";

import { AgeThresholdCheckerService } from "./age-threshold-checker.service";
import { TagAutomationExecutionService } from "./tag-automation-execution.service";
import { TagAutomationController } from "./tag-automation.controller";
import { TagAutomationService } from "./tag-automation.service";
import { TagCategoriesController } from "./tag-categories.controller";
import { TagCategoriesService } from "./tag-categories.service";
import { TagGroupsController } from "./tag-groups.controller";
import { TagGroupsService } from "./tag-groups.service";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [
    TagsController,
    TagCategoriesController,
    TagGroupsController,
    TagAutomationController,
  ],
  providers: [
    TagsService,
    TagCategoriesService,
    TagGroupsService,
    TagAutomationService,
    TagAutomationExecutionService,
    AgeThresholdCheckerService,
  ],
  exports: [
    TagsService,
    TagCategoriesService,
    TagGroupsService,
    TagAutomationService,
    TagAutomationExecutionService,
    AgeThresholdCheckerService,
  ],
})
export class TagsModule {}
```

## File: backend/src/tags/tags.service.ts
```typescript
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateTagDto, UpdateTagDto } from "./dto";
import { TagCategoriesService } from "./tag-categories.service";

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagCategoriesService: TagCategoriesService,
  ) {}

  async findAll(options: { scopes?: string[]; includeInactive?: boolean } = {}) {
    const categories = await this.tagCategoriesService.findMany({
      scopes: options.scopes,
      includeGroups: true,
      includeInactive: options.includeInactive,
    });

    return {
      success: true,
      data: categories.map((category) => ({
        id: category.id,
        key: category.key,
        name: category.name,
        description: category.description ?? undefined,
        color: category.color ?? undefined,
        textColor: category.textColor ?? undefined,
        displayOrder: category.displayOrder,
        scopes: category.scopes,
        isActive: category.isActive,
        groups: (category.groups ?? []).map((group) => ({
          id: group.id,
          categoryId: group.categoryId,
          name: group.name,
          description: group.description ?? undefined,
          color: group.color ?? undefined,
          textColor: group.textColor ?? undefined,
          displayOrder: group.displayOrder,
          isActive: group.isActive,
          tags: (group.tags ?? []).map((tag) => ({
            id: tag.id,
            groupId: tag.groupId,
            name: tag.name,
            color: tag.color,
            textColor: tag.textColor,
            description: tag.description ?? undefined,
            displayOrder: tag.displayOrder,
            allowsManual: tag.allowsManual,
            allowsAutomation: tag.allowsAutomation,
            metadata: tag.metadata ?? undefined,
            isActive: tag.isActive,
            usageCount: tag.cats.length,
          })),
        })),
      })),
    };
  }

  async create(dto: CreateTagDto) {
    const displayOrder = dto.displayOrder ?? (await this.getNextDisplayOrder(dto.groupId));
    const data = await this.prisma.tag.create({
      data: {
        group: { connect: { id: dto.groupId } },
        name: dto.name,
        color: dto.color ?? undefined,
        textColor: dto.textColor ?? undefined,
        description: dto.description ?? undefined,
        displayOrder,
        ...(dto.allowsManual !== undefined ? { allowsManual: dto.allowsManual } : {}),
        ...(dto.allowsAutomation !== undefined
          ? { allowsAutomation: dto.allowsAutomation }
          : {}),
        metadata: this.toJson(dto.metadata),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: this.defaultTagInclude(),
    });

    return { success: true, data };
  }

  async update(id: string, dto: UpdateTagDto) {
    const updateData: Prisma.TagUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.color !== undefined ? { color: dto.color } : {}),
  ...(dto.textColor !== undefined ? { textColor: dto.textColor } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
      ...(dto.metadata !== undefined
        ? { metadata: this.toJson(dto.metadata) ?? Prisma.JsonNull }
        : {}),
      ...(dto.groupId ? { group: { connect: { id: dto.groupId } } } : {}),
      ...(dto.allowsManual !== undefined ? { allowsManual: dto.allowsManual } : {}),
      ...(dto.allowsAutomation !== undefined
        ? { allowsAutomation: dto.allowsAutomation }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };

    const data = await this.prisma.tag.update({
      where: { id },
      data: updateData,
      include: this.defaultTagInclude(),
    });

    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }

  async reorder(items: Array<{ id: string; displayOrder: number; groupId?: string }>) {
    if (!items.length) {
      return { success: true };
    }

    await this.prisma.$transaction(
      items.map(({ id, displayOrder, groupId }) =>
        this.prisma.tag.update({
          where: { id },
          data: {
            displayOrder,
            ...(groupId ? { group: { connect: { id: groupId } } } : {}),
          },
        }),
      ),
    );

    return { success: true };
  }

  async assignToCat(catId: string, tagId: string) {
    try {
      await this.prisma.catTag.create({ data: { catId, tagId } });
    } catch {
      // Unique constraint (already assigned) -> return success idempotently
    }
    return { success: true };
  }

  async unassignFromCat(catId: string, tagId: string) {
    await this.prisma.catTag.delete({
      where: { catId_tagId: { catId, tagId } },
    });
    return { success: true };
  }

  private defaultTagInclude(): Prisma.TagInclude {
    return {
      cats: {
        select: { catId: true },
      },
    };
  }

  private toJson(value?: Record<string, unknown> | null): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }

  private async getNextDisplayOrder(groupId: string): Promise<number> {
    const result = await this.prisma.tag.aggregate({
      _max: { displayOrder: true },
      where: { groupId },
    });
    return (result._max.displayOrder ?? -1) + 1;
  }
}
```

## File: backend/src/tenants/dto/create-tenant.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

/**
 * テナント作成DTO
 */
export class CreateTenantDto {
  @ApiProperty({
    description: 'テナント名',
    example: 'サンプルテナント',
  })
  @IsString()
  @IsNotEmpty({ message: 'テナント名は必須です' })
  @MaxLength(100, { message: 'テナント名は100文字以内で入力してください' })
  name: string;

  @ApiPropertyOptional({
    description: 'テナントスラッグ（未入力の場合は自動生成）',
    example: 'sample-tenant',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'スラッグを指定する場合は空文字列にできません' })
  @IsString()
  @MaxLength(100, { message: 'スラッグは100文字以内で入力してください' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'スラッグは半角英小文字または数字で始まり、ハイフンで区切ることができます（連続・先頭・末尾のハイフンは不可）' })
  slug?: string;
}
```

## File: backend/src/tenants/dto/invitation.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * SuperAdmin がテナント管理者を招待するための DTO
 */
export class InviteTenantAdminDto {
  @ApiProperty({ description: '招待するメールアドレス', example: 'admin@example.com' })
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @ApiProperty({ description: 'テナント名', example: 'Sample Tenant' })
  @IsString()
  @IsNotEmpty({ message: 'テナント名は必須です' })
  @MinLength(2, { message: 'テナント名は2文字以上である必要があります' })
  @MaxLength(100, { message: 'テナント名は100文字以内で入力してください' })
  tenantName: string;

  @ApiProperty({ 
    description: 'テナントスラッグ（URL識別子）', 
    example: 'sample-tenant',
    required: false 
  })
  @IsString()
  @MinLength(2, { message: 'スラッグは2文字以上である必要があります' })
  @MaxLength(50, { message: 'スラッグは50文字以内で入力してください' })
  tenantSlug?: string;
}

/**
 * テナント管理者がユーザーを招待するための DTO
 */
export class InviteUserDto {
  @ApiProperty({ description: '招待するメールアドレス', example: 'user@example.com' })
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @ApiProperty({ 
    description: 'ユーザーロール', 
    enum: UserRole,
    default: UserRole.USER 
  })
  @IsEnum(UserRole, { message: '有効なロールを指定してください' })
  role: UserRole;
}

/**
 * 招待トークンでユーザー登録を完了するための DTO
 */
export class CompleteInvitationDto {
  @ApiProperty({ description: '招待トークン' })
  @IsString()
  @IsNotEmpty({ message: 'トークンは必須です' })
  token: string;

  @ApiProperty({ description: 'パスワード', minLength: 8 })
  @IsString()
  @IsNotEmpty({ message: 'パスワードは必須です' })
  @MinLength(8, { message: 'パスワードは8文字以上である必要があります' })
  password: string;

  @ApiProperty({ description: '名', required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ description: '姓', required: false })
  @IsString()
  lastName?: string;
}
```

## File: backend/src/tenants/dto/update-tenant.dto.ts
```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';

/**
 * テナント更新DTO
 */
export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'テナント名',
    example: '更新後テナント名',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'テナント名は100文字以内で入力してください' })
  name?: string;

  @ApiPropertyOptional({
    description: 'テナントスラッグ',
    example: 'updated-tenant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'スラッグは100文字以内で入力してください' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'スラッグは半角英小文字または数字で始まり、ハイフンで区切ることができます' })
  slug?: string;

  @ApiPropertyOptional({
    description: '有効/無効フラグ',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

## File: backend/src/tenants/tenants.controller.ts
```typescript
import { 
  Controller, 
  Get,
  Post, 
  Patch,
  Delete,
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { TenantScopedGuard } from '../common/guards/tenant-scoped.guard';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { 
  InviteTenantAdminDto, 
  InviteUserDto, 
  CompleteInvitationDto 
} from './dto/invitation.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

/**
 * テナント管理コントローラ
 * 
 * テナント作成、ユーザー招待、招待完了のエンドポイントを提供します。
 */
@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * テナント一覧取得
   * SUPER_ADMIN のみがアクセス可能
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'テナント一覧取得',
    description: 'SuperAdminのみが実行可能。全テナントの一覧を取得します。' 
  })
  @ApiResponse({ status: 200, description: 'テナント一覧を返却' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  async listTenants() {
    return this.tenantsService.listTenants();
  }

  /**
   * テナント作成
   * SUPER_ADMIN のみがアクセス可能
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'テナント作成',
    description: 'SuperAdminのみが実行可能。新しいテナントを作成します。' 
  })
  @ApiResponse({ status: 201, description: 'テナントが作成されました' })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 409, description: 'スラッグが既に使用されています' })
  async createTenant(@Body() dto: CreateTenantDto) {
    return this.tenantsService.createTenant(dto);
  }

  /**
   * テナント詳細取得
   * SUPER_ADMIN または TENANT_ADMIN（自テナントのみ）がアクセス可能
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'テナント詳細取得',
    description: 'SuperAdminまたはテナント管理者（自テナントのみ）が実行可能。指定IDのテナント詳細を取得します。' 
  })
  @ApiResponse({ status: 200, description: 'テナント詳細を返却' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  async getTenantById(
    @Param('id') id: string,
    @GetUser() user: RequestUser,
  ) {
    return this.tenantsService.getTenantById(id, user);
  }

  /**
   * テナント更新
   * SUPER_ADMIN のみがアクセス可能
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'テナント更新',
    description: 'SuperAdminのみが実行可能。指定IDのテナントを更新します。' 
  })
  @ApiResponse({ status: 200, description: 'テナントが更新されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  @ApiResponse({ status: 409, description: 'スラッグが既に使用されています' })
  async updateTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
    @GetUser() user: RequestUser,
  ) {
    return this.tenantsService.updateTenant(id, dto, user);
  }

  /**
   * SuperAdmin がテナント管理者を招待
   */
  @Post('invite-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'テナント管理者を招待',
    description: 'SuperAdminのみが実行可能。新しいテナントを作成し、管理者を招待します。' 
  })
  @ApiResponse({ status: 201, description: '招待が正常に作成されました' })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 409, description: 'メールアドレスまたはスラッグが既に使用されています' })
  async inviteTenantAdmin(@Body() dto: InviteTenantAdminDto) {
    return this.tenantsService.inviteTenantAdmin(dto);
  }

  /**
   * テナント管理者がユーザーを招待
   */
  @Post(':tenantId/users/invite')
  @UseGuards(JwtAuthGuard, RoleGuard, TenantScopedGuard)
  @Roles(UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'ユーザーを招待',
    description: 'テナント管理者が自分のテナントにユーザーを招待します。' 
  })
  @ApiResponse({ status: 201, description: '招待が正常に作成されました' })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async inviteUser(
    @Param('tenantId') tenantId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.tenantsService.inviteUser(tenantId, dto);
  }

  /**
   * 招待完了（トークンでユーザー登録）
   */
  @Post('complete-invitation')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '招待完了',
    description: '招待トークンを使用してユーザー登録を完了します。認証不要。' 
  })
  @ApiResponse({ status: 201, description: 'ユーザー登録が完了しました' })
  @ApiResponse({ status: 400, description: '不正なリクエストまたは無効なトークン' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async completeInvitation(@Body() dto: CompleteInvitationDto) {
    return this.tenantsService.completeInvitation(dto);
  }

  /**
   * テナント削除
   * SUPER_ADMIN のみがアクセス可能
   * 所属ユーザーがいる場合は削除不可
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'テナント削除',
    description: 'SuperAdminのみが実行可能。指定IDのテナントを削除します。所属ユーザーがいる場合は削除できません。' 
  })
  @ApiResponse({ status: 200, description: 'テナントが削除されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  @ApiResponse({ status: 409, description: '所属ユーザーが存在するため削除できません' })
  async deleteTenant(
    @Param('id') id: string,
    @GetUser() user: RequestUser,
  ) {
    return this.tenantsService.deleteTenant(id, user);
  }
}
```

## File: backend/src/tenants/tenants.module.ts
```typescript
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

/**
 * テナント管理モジュール
 * 
 * マルチテナント環境でのテナント作成とユーザー招待機能を提供します。
 */
@Module({
  imports: [PrismaModule, AuthModule, EmailModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
```

## File: backend/src/tenants/tenants.service.spec.ts
```typescript
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { PasswordService } from '../auth/password.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { InviteTenantAdminDto, InviteUserDto, CompleteInvitationDto } from './dto/invitation.dto';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let _prisma: PrismaService;
  let _passwordService: PasswordService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    invitationToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockPasswordService = {
    validatePasswordStrength: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockEmailService = {
    sendInvitationEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    _prisma = module.get<PrismaService>(PrismaService);
    _passwordService = module.get<PasswordService>(PasswordService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('inviteTenantAdmin', () => {
    const dto: InviteTenantAdminDto = {
      email: 'admin@example.com',
      tenantName: 'Test Tenant',
      tenantSlug: 'test-tenant',
    };

    it('テナントと招待トークンを正常に作成', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          tenant: {
            create: jest.fn().mockResolvedValue({
              id: 'tenant-1',
              name: dto.tenantName,
              slug: dto.tenantSlug,
            }),
          },
          invitationToken: {
            create: jest.fn().mockResolvedValue({
              id: 'invitation-1',
              token: 'test-token',
              email: dto.email,
            }),
          },
        });
      });

      const result = await service.inviteTenantAdmin(dto);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBeDefined();
      expect(result.invitationToken).toBeDefined();
    });

    it('メールアドレスが既に使用されている場合エラー', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });

      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(ConflictException);
      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(
        'このメールアドレスは既に使用されています',
      );
    });

    it('スラッグが既に使用されている場合エラー', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });

      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(ConflictException);
      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(
        'このスラッグは既に使用されています',
      );
    });
  });

  describe('inviteUser', () => {
    const tenantId = 'tenant-1';
    const dto: InviteUserDto = {
      email: 'user@example.com',
      role: UserRole.USER,
    };

    it('ユーザー招待トークンを正常に作成', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        isActive: true,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.invitationToken.create.mockResolvedValue({
        id: 'invitation-1',
        token: 'test-token',
      });

      const result = await service.inviteUser(tenantId, dto);

      expect(result.success).toBe(true);
      expect(result.invitationToken).toBeDefined();
    });

    it('テナントが存在しない場合エラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(NotFoundException);
      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(
        'テナントが見つかりません',
      );
    });

    it('テナントが無効化されている場合エラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        isActive: false,
      });

      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(BadRequestException);
      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(
        'このテナントは無効化されています',
      );
    });

    it('TENANT_ADMINを招待しようとするとエラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        isActive: true,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const adminDto = { ...dto, role: UserRole.TENANT_ADMIN };

      await expect(service.inviteUser(tenantId, adminDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeInvitation', () => {
    const dto: CompleteInvitationDto = {
      token: 'valid-token',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('招待完了とユーザー作成に成功', async () => {
      const invitation = {
        id: 'invitation-1',
        email: 'user@example.com',
        role: UserRole.USER,
        tenantId: 'tenant-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 86400000), // 24時間後
        tenant: { id: 'tenant-1', isActive: true },
      };

      mockPrismaService.invitationToken.findUnique.mockResolvedValue(invitation);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPasswordService.validatePasswordStrength.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordService.hashPassword.mockResolvedValue('hashed-password');
      mockJwtService.signAsync.mockResolvedValue('test-jwt-token');
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'user-1',
              email: invitation.email,
              tenantId: invitation.tenantId,
            }),
          },
          invitationToken: {
            update: jest.fn(),
          },
        });
      });

      const result = await service.completeInvitation(dto);

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.tenantId).toBe('tenant-1');
      expect(result.access_token).toBe('test-jwt-token');
    });

    it('無効なトークンの場合エラー', async () => {
      mockPrismaService.invitationToken.findUnique.mockResolvedValue(null);

      await expect(service.completeInvitation(dto)).rejects.toThrow(BadRequestException);
      await expect(service.completeInvitation(dto)).rejects.toThrow('無効な招待トークンです');
    });

    it('既に使用済みのトークンの場合エラー', async () => {
      mockPrismaService.invitationToken.findUnique.mockResolvedValue({
        usedAt: new Date(),
      });

      await expect(service.completeInvitation(dto)).rejects.toThrow(BadRequestException);
      await expect(service.completeInvitation(dto)).rejects.toThrow(
        'この招待トークンは既に使用されています',
      );
    });

    it('期限切れのトークンの場合エラー', async () => {
      mockPrismaService.invitationToken.findUnique.mockResolvedValue({
        usedAt: null,
        expiresAt: new Date(Date.now() - 86400000), // 24時間前
        tenant: { isActive: true },
      });

      await expect(service.completeInvitation(dto)).rejects.toThrow(BadRequestException);
      await expect(service.completeInvitation(dto)).rejects.toThrow(
        '招待トークンの有効期限が切れています',
      );
    });
  });

  describe('listTenants', () => {
    it('全テナントの一覧を正常に取得', async () => {
      const mockTenants = [
        {
          id: 'tenant-1',
          name: 'Test Tenant 1',
          slug: 'test-tenant-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tenant-2',
          name: 'Test Tenant 2',
          slug: 'test-tenant-2',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.tenant.findMany.mockResolvedValue(mockTenants);

      const result = await service.listTenants();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTenants);
      expect(result.count).toBe(2);
      expect(mockPrismaService.tenant.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('テナントが存在しない場合は空の配列を返す', async () => {
      mockPrismaService.tenant.findMany.mockResolvedValue([]);

      const result = await service.listTenants();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('createTenant', () => {
    it('明示的なスラッグでテナントを正常に作成', async () => {
      const dto: CreateTenantDto = {
        name: 'Test Tenant',
        slug: 'test-tenant',
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: dto.name,
        slug: dto.slug,
      });

      const result = await service.createTenant(dto);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tenant-1');
      expect(result.data.name).toBe(dto.name);
      expect(result.data.slug).toBe(dto.slug);
      expect(mockPrismaService.tenant.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          slug: dto.slug,
          isActive: true,
        },
      });
    });

    it('自動生成されたスラッグでテナントを正常に作成', async () => {
      const dto: CreateTenantDto = {
        name: 'My New Tenant',
        // slug は未指定
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-2',
        name: dto.name,
        slug: 'my-new-tenant',
      });

      const result = await service.createTenant(dto);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tenant-2');
      expect(result.data.name).toBe(dto.name);
      expect(result.data.slug).toBe('my-new-tenant');
    });

    it('日本語のみのテナント名（スラッグ生成不可）の場合エラー', async () => {
      const dto: CreateTenantDto = {
        name: 'サンプルテナント',
        // slug は未指定 → 日本語から生成できない
      };

      await expect(service.createTenant(dto)).rejects.toThrow(BadRequestException);
      await expect(service.createTenant(dto)).rejects.toThrow(
        'テナント名からスラッグを生成できませんでした',
      );
    });

    it('スラッグが既に使用されている場合エラー', async () => {
      const dto: CreateTenantDto = {
        name: 'Another Tenant',
        slug: 'existing-slug',
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: 'existing-tenant',
        slug: 'existing-slug',
      });

      await expect(service.createTenant(dto)).rejects.toThrow(ConflictException);
      await expect(service.createTenant(dto)).rejects.toThrow(
        'このスラッグは既に使用されています',
      );
    });

    it('レスポンス構造が正しい形式であること', async () => {
      const dto: CreateTenantDto = {
        name: 'Response Test',
        slug: 'response-test',
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-3',
        name: dto.name,
        slug: dto.slug,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createTenant(dto);

      // レスポンス構造を検証
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('slug');
      // 余分なプロパティは含まれないことを確認
      expect(Object.keys(result.data)).toHaveLength(3);
    });
  });

  describe('getTenantById', () => {
    const tenantId = 'tenant-1';

    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    it('SUPER_ADMIN は指定 ID のテナントを正常に取得できる', async () => {
      const mockTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 5 },
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.getTenantById(tenantId, superAdminUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTenant);
      expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
      });
    });

    it('TENANT_ADMIN は自テナントの情報を取得できる', async () => {
      const mockTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 3 },
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.getTenantById(tenantId, tenantAdminUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTenant);
    });

    it('TENANT_ADMIN は他のテナントの情報にはアクセスできない', async () => {
      await expect(
        service.getTenantById('tenant-2', tenantAdminUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getTenantById('tenant-2', tenantAdminUser),
      ).rejects.toThrow('他のテナントの情報にはアクセスできません');
    });

    it('テナントに所属していない TENANT_ADMIN はエラー', async () => {
      const noTenantAdminUser: RequestUser = {
        userId: 'tenant-admin-2',
        email: 'tenantadmin2@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: undefined,
      };

      await expect(
        service.getTenantById(tenantId, noTenantAdminUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getTenantById(tenantId, noTenantAdminUser),
      ).rejects.toThrow('テナントに所属していません');
    });

    it('テナントが見つからない場合は NotFoundException をスロー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.getTenantById(tenantId, superAdminUser)).rejects.toThrow(NotFoundException);
      await expect(service.getTenantById(tenantId, superAdminUser)).rejects.toThrow('テナントが見つかりません');
    });
  });

  describe('updateTenant', () => {
    const tenantId = 'tenant-1';
    
    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    beforeEach(() => {
      mockPrismaService.tenant.findUnique.mockReset();
      mockPrismaService.tenant.update.mockReset();
    });

    it('SUPER_ADMIN がテナント名を正常に更新できる', async () => {
      const existingTenant = {
        id: tenantId,
        name: 'Original Name',
        slug: 'original-slug',
        isActive: true,
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(existingTenant);
      mockPrismaService.tenant.update.mockResolvedValue({
        ...existingTenant,
        name: 'Updated Name',
        updatedAt: new Date(),
      });

      const result = await service.updateTenant(tenantId, { name: 'Updated Name' }, superAdminUser);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Name');
      expect(mockPrismaService.tenant.update).toHaveBeenCalledWith({
        where: { id: tenantId },
        data: { name: 'Updated Name' },
        select: expect.any(Object),
      });
    });

    it('スラッグ変更時に重複チェックを行う', async () => {
      const existingTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
      };

      mockPrismaService.tenant.findUnique
        .mockResolvedValueOnce(existingTenant) // 対象テナント
        .mockResolvedValueOnce({ id: 'other-tenant', slug: 'new-slug' }); // 重複スラッグ

      await expect(
        service.updateTenant(tenantId, { slug: 'new-slug' }, superAdminUser)
      ).rejects.toThrow(ConflictException);
    });

    it('テナントが見つからない場合はエラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTenant(tenantId, { name: 'Updated' }, superAdminUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('TENANT_ADMIN は更新できない', async () => {
      await expect(
        service.updateTenant(tenantId, { name: 'Updated' }, tenantAdminUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('isActive を false に更新できる', async () => {
      const existingTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(existingTenant);
      mockPrismaService.tenant.update.mockResolvedValue({
        ...existingTenant,
        isActive: false,
        updatedAt: new Date(),
      });

      const result = await service.updateTenant(tenantId, { isActive: false }, superAdminUser);

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(false);
    });
  });

  describe('deleteTenant', () => {
    const tenantId = 'tenant-1';

    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    const adminUser: RequestUser = {
      userId: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      tenantId: 'tenant-1',
    };

    it('SUPER_ADMIN がテナントを正常に削除できる', async () => {
      const emptyTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
        _count: {
          users: 0,
        },
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(emptyTenant);
      mockPrismaService.invitationToken.deleteMany.mockResolvedValue({ count: 2 });
      mockPrismaService.tenant.delete.mockResolvedValue({
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
      });

      const result = await service.deleteTenant(tenantId, superAdminUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('テナントを削除しました');
      expect(mockPrismaService.invitationToken.deleteMany).toHaveBeenCalledWith({
        where: { tenantId },
      });
      expect(mockPrismaService.tenant.delete).toHaveBeenCalledWith({
        where: { id: tenantId },
      });
    });

    it('所属ユーザーが存在する場合に ConflictException がスローされる', async () => {
      const tenantWithUsers = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
        _count: {
          users: 3,
        },
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(tenantWithUsers);

      await expect(
        service.deleteTenant(tenantId, superAdminUser),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.deleteTenant(tenantId, superAdminUser),
      ).rejects.toThrow('このテナントには3人のユーザーが所属しているため削除できません');

      expect(mockPrismaService.tenant.delete).not.toHaveBeenCalled();
      expect(mockPrismaService.invitationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('存在しないテナント ID を指定した場合に NotFoundException がスローされる', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteTenant('non-existent-tenant', superAdminUser),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.deleteTenant('non-existent-tenant', superAdminUser),
      ).rejects.toThrow('テナントが見つかりません');

      expect(mockPrismaService.tenant.delete).not.toHaveBeenCalled();
      expect(mockPrismaService.invitationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('SUPER_ADMIN 以外のロールが削除しようとした場合に ForbiddenException がスローされる', async () => {
      await expect(
        service.deleteTenant(tenantId, tenantAdminUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.deleteTenant(tenantId, tenantAdminUser),
      ).rejects.toThrow('テナントを削除する権限がありません');

      expect(mockPrismaService.tenant.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.tenant.delete).not.toHaveBeenCalled();
      expect(mockPrismaService.invitationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('ADMIN ロールが削除しようとした場合に ForbiddenException がスローされる', async () => {
      await expect(
        service.deleteTenant(tenantId, adminUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.deleteTenant(tenantId, adminUser),
      ).rejects.toThrow('テナントを削除する権限がありません');

      expect(mockPrismaService.tenant.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.tenant.delete).not.toHaveBeenCalled();
      expect(mockPrismaService.invitationToken.deleteMany).not.toHaveBeenCalled();
    });

    it('関連する招待トークンが正しく削除される', async () => {
      const emptyTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
        _count: {
          users: 0,
        },
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(emptyTenant);
      mockPrismaService.invitationToken.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaService.tenant.delete.mockResolvedValue({
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
      });

      await service.deleteTenant(tenantId, superAdminUser);

      expect(mockPrismaService.invitationToken.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.invitationToken.deleteMany).toHaveBeenCalledWith({
        where: { tenantId },
      });
    });
  });
});
```

## File: backend/src/tenants/tenants.service.ts
```typescript
import { randomBytes, randomUUID } from 'crypto';

import { 
  Injectable, 
  BadRequestException, 
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { PasswordService } from '../auth/password.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { 
  InviteTenantAdminDto, 
  InviteUserDto, 
  CompleteInvitationDto 
} from './dto/invitation.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/**
 * テナント管理サービス
 * 
 * マルチテナント環境でのテナント作成、ユーザー招待、招待完了を管理します。
 */
@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * テナント一覧を取得
   * 
   * @returns 全テナントの一覧
   */
  async listTenants() {
    const tenants = await this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: tenants,
      count: tenants.length,
    };
  }

  /**
   * テナントを作成
   * 
   * @param dto テナント作成DTO
   * @returns 作成されたテナント
   * @throws BadRequestException スラッグを生成できなかった場合
   * @throws ConflictException スラッグが既に使用されている場合
   */
  async createTenant(dto: CreateTenantDto): Promise<{
    success: true;
    data: { id: string; name: string; slug: string };
  }> {
    // テナントスラッグの生成（未指定の場合）
    const slug = dto.slug || this.generateSlug(dto.name);

    // 生成されたスラッグが空の場合はエラー
    if (!slug) {
      throw new BadRequestException('テナント名からスラッグを生成できませんでした。半角英小文字・数字・ハイフンで構成されるスラッグを明示的に指定してください（例: sample-tenant）');
    }

    // スラッグの重複チェック
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException('このスラッグは既に使用されています');
    }

    // テナント作成
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug,
        isActive: true,
      },
    });

    this.logger.log({
      message: 'Tenant created',
      tenantId: tenant.id,
      tenantName: tenant.name,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    };
  }

  /**
   * 指定 ID のテナントを取得
   * 
   * - SUPER_ADMIN: すべてのテナントにアクセス可能
   * - TENANT_ADMIN: 自テナントのみアクセス可能
   * 
   * @param tenantId テナント ID
   * @param currentUser 現在のユーザー情報
   * @returns テナント詳細
   * @throws NotFoundException テナントが見つからない場合
   * @throws ForbiddenException アクセス権がない場合
   */
  async getTenantById(tenantId: string, currentUser: RequestUser) {
    // TENANT_ADMIN の場合、自テナントのみアクセス可能
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      if (!currentUser.tenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }
      if (currentUser.tenantId !== tenantId) {
        throw new ForbiddenException('他のテナントの情報にはアクセスできません');
      }
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }

    return {
      success: true,
      data: tenant,
    };
  }

  /**
   * SuperAdmin がテナント管理者を招待
   * 
   * 新しいテナントを作成し、管理者招待トークンを生成します。
   */
  async inviteTenantAdmin(dto: InviteTenantAdminDto): Promise<{
    success: true;
    tenantId: string;
    invitationToken: string;
    message: string;
  }> {
    const email = dto.email.trim().toLowerCase();

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // テナントスラッグの生成（未指定の場合）
    const slug = dto.tenantSlug || this.generateSlug(dto.tenantName);

    // スラッグの重複チェック
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException('このスラッグは既に使用されています');
    }

    // トランザクションでテナントと招待トークンを作成
    const result = await this.prisma.$transaction(async (tx) => {
      // テナント作成
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug,
          isActive: true,
        },
      });

      // 招待トークン生成（有効期限: 7日間）
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await tx.invitationToken.create({
        data: {
          email,
          token,
          role: UserRole.TENANT_ADMIN,
          tenantId: tenant.id,
          expiresAt,
        },
      });

      return { tenant, invitation };
    });

    this.logger.log({
      message: 'Tenant admin invitation created',
      tenantId: result.tenant.id,
      email,
      timestamp: new Date().toISOString(),
    });

    // 招待メールを送信
    const emailSent = await this.emailService.sendInvitationEmail(
      email,
      result.invitation.token,
      result.tenant.name,
      UserRole.TENANT_ADMIN,
    );

    if (!emailSent) {
      this.logger.warn(`Failed to send invitation email to ${email}, but invitation was created successfully`);
    }

    // 開発環境では安全な形式でトークン情報を出力
    if (process.env.NODE_ENV !== 'production') {
      const tokenPreview = `${result.invitation.token.substring(0, 8)}...`;
      this.logger.log(`Invitation token created for ${email} (preview: ${tokenPreview})`);
      this.logger.log(`Invitation URL: http://localhost:3000/accept-invitation?token=${result.invitation.token}`);
    }

    return {
      success: true,
      tenantId: result.tenant.id,
      invitationToken: result.invitation.token,
      message: emailSent ? '招待メールを送信しました' : '招待を作成しましたが、メール送信に失敗しました',
    };
  }

  /**
   * テナント管理者がユーザーを招待
   */
  async inviteUser(
    tenantId: string,
    dto: InviteUserDto,
  ): Promise<{
    success: true;
    invitationToken: string;
    message: string;
  }> {
    const email = dto.email.trim().toLowerCase();

    // テナントの存在確認
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }

    if (!tenant.isActive) {
      throw new BadRequestException('このテナントは無効化されています');
    }

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // TENANT_ADMIN は招待できない（SUPER_ADMIN のみ可能）
    if (dto.role === UserRole.TENANT_ADMIN || dto.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('テナント管理者またはスーパー管理者を招待することはできません');
    }

    // 招待トークン生成（有効期限: 7日間）
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitationToken.create({
      data: {
        email,
        token,
        role: dto.role,
        tenantId,
        expiresAt,
      },
    });

    this.logger.log({
      message: 'User invitation created',
      tenantId,
      email,
      role: dto.role,
      timestamp: new Date().toISOString(),
    });

    // 招待メールを送信
    const emailSent = await this.emailService.sendInvitationEmail(
      email,
      invitation.token,
      tenant.name,
      dto.role,
    );

    if (!emailSent) {
      this.logger.warn(`Failed to send invitation email to ${email}, but invitation was created successfully`);
    }

    // 開発環境では安全な形式でトークン情報を出力
    if (process.env.NODE_ENV !== 'production') {
      const tokenPreview = `${invitation.token.substring(0, 8)}...`;
      this.logger.log(`Invitation token created for ${email} (preview: ${tokenPreview})`);
      this.logger.log(`Invitation URL: http://localhost:3000/accept-invitation?token=${invitation.token}`);
    }

    return {
      success: true,
      invitationToken: invitation.token,
      message: emailSent ? '招待メールを送信しました' : '招待を作成しましたが、メール送信に失敗しました',
    };
  }

  /**
   * 招待トークンでユーザー登録を完了
   */
  async completeInvitation(dto: CompleteInvitationDto): Promise<{
    success: true;
    userId: string;
    tenantId: string;
    access_token: string;
    message: string;
  }> {
    // トークンの検証
    const invitation = await this.prisma.invitationToken.findUnique({
      where: { token: dto.token },
      include: { tenant: true },
    });

    if (!invitation) {
      throw new BadRequestException('無効な招待トークンです');
    }

    // トークンの使用済みチェック
    if (invitation.usedAt) {
      throw new BadRequestException('この招待トークンは既に使用されています');
    }

    // トークンの有効期限チェック
    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('招待トークンの有効期限が切れています');
    }

    // テナントの有効性チェック
    if (!invitation.tenant.isActive) {
      throw new BadRequestException('このテナントは無効化されています');
    }

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // パスワード強度チェック
    const validation = this.passwordService.validatePasswordStrength(dto.password);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'パスワードが要件を満たしていません',
        errors: validation.errors,
      });
    }

    // パスワードハッシュ化
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // トランザクションでユーザー作成と招待トークン使用済みマーク
    const result = await this.prisma.$transaction(async (tx) => {
      // ユーザー作成
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          tenantId: invitation.tenantId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          clerkId: `local_${randomUUID()}`,
          isActive: true,
          failedLoginAttempts: 0,
        },
      });

      // 招待トークンを使用済みにマーク
      await tx.invitationToken.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return user;
    });

    this.logger.log({
      message: 'Invitation completed, user created',
      userId: result.id,
      tenantId: result.tenantId,
      email: result.email,
      role: result.role,
      timestamp: new Date().toISOString(),
    });

    // JWT トークン生成
    const accessToken = await this.jwt.signAsync(
      {
        sub: result.id,
        email: result.email,
        role: result.role,
        tenantId: result.tenantId,
        jti: randomUUID(),
      },
      {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET,
      },
    );

    return {
      success: true,
      userId: result.id,
      tenantId: result.tenantId!,
      access_token: accessToken,
      message: 'ユーザー登録が完了しました',
    };
  }

  /**
   * テナント名からスラッグを生成
   * 
   * @private
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 英数字とスペース、ハイフンのみ
      .replace(/\s+/g, '-') // スペースをハイフンに
      .replace(/-+/g, '-') // 連続するハイフンを1つに
      .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
  }

  /**
   * テナントを更新
   * SUPER_ADMIN のみが実行可能
   * 
   * @param tenantId テナント ID
   * @param dto 更新 DTO
   * @param currentUser 現在のユーザー情報
   * @returns 更新後のテナント
   * @throws NotFoundException テナントが見つからない場合
   * @throws ConflictException スラッグが重複している場合
   */
  async updateTenant(tenantId: string, dto: UpdateTenantDto, currentUser: RequestUser) {
    // SUPER_ADMIN のみ更新可能
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('テナントを更新する権限がありません');
    }

    // テナントの存在確認
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }

    // スラッグ変更時の重複チェック
    if (dto.slug && dto.slug !== tenant.slug) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.slug },
      });

      if (existingTenant) {
        throw new ConflictException('このスラッグは既に使用されています');
      }
    }

    // 更新データの構築
    const updateData: { name?: string; slug?: string; isActive?: boolean } = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    // テナント更新
    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log({
      message: 'Tenant updated',
      tenantId: updatedTenant.id,
      updatedFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      data: updatedTenant,
    };
  }

  /**
   * テナントを削除
   * SUPER_ADMIN のみが実行可能
   * 所属ユーザーがいる場合は削除不可
   * 
   * @param tenantId テナント ID
   * @param currentUser 現在のユーザー情報
   * @returns 削除結果
   * @throws NotFoundException テナントが見つからない場合
   * @throws ForbiddenException 権限がない場合
   * @throws ConflictException 所属ユーザーが存在する場合
   */
  async deleteTenant(tenantId: string, currentUser: RequestUser) {
    // SUPER_ADMIN のみ削除可能
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('テナントを削除する権限がありません');
    }

    // テナントの存在確認と所属ユーザー数を取得
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }

    // 所属ユーザーがいる場合は削除不可
    if (tenant._count.users > 0) {
      throw new ConflictException(
        `このテナントには${tenant._count.users}人のユーザーが所属しているため削除できません。先にユーザーを削除してください。`
      );
    }

    // 関連する招待トークンを削除
    await this.prisma.invitationToken.deleteMany({
      where: { tenantId },
    });

    // テナント削除
    await this.prisma.tenant.delete({
      where: { id: tenantId },
    });

    this.logger.log({
      message: 'Tenant deleted',
      tenantId,
      deletedBy: currentUser.userId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'テナントを削除しました',
    };
  }
}
```

## File: backend/src/users/dto/invite-user.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * ユーザー招待 DTO
 * 
 * SUPER_ADMIN: 任意のテナントに TENANT_ADMIN / ADMIN / USER を招待可能
 * TENANT_ADMIN: 自テナントにのみ ADMIN / USER を招待可能
 */
export class InviteUserDto {
  @ApiProperty({ 
    description: '招待するメールアドレス', 
    example: 'user@example.com' 
  })
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @ApiProperty({ 
    description: 'ユーザーロール', 
    enum: UserRole,
    example: UserRole.USER 
  })
  @IsEnum(UserRole, { message: '有効なロールを指定してください' })
  role: UserRole;

  @ApiProperty({ 
    description: '招待先テナント ID', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsUUID('4', { message: '有効なテナント ID を指定してください' })
  @IsNotEmpty({ message: 'テナント ID は必須です' })
  tenantId: string;
}
```

## File: backend/src/users/dto/update-profile.dto.ts
```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * プロフィール更新 DTO
 * 
 * 認証されたユーザーが自身のプロフィール情報を更新するためのDTO
 * すべてのフィールドはオプショナル（更新したいフィールドのみ送信可能）
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: '名',
    example: '太郎',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '名は文字列で入力してください' })
  @MaxLength(100, { message: '名は100文字以内で入力してください' })
  firstName?: string;

  @ApiPropertyOptional({
    description: '姓',
    example: '山田',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '姓は文字列で入力してください' })
  @MaxLength(100, { message: '姓は100文字以内で入力してください' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'メールアドレス',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email?: string;
}
```

## File: backend/src/users/dto/update-user-role.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

/**
 * ユーザーロール変更 DTO
 * 
 * SUPER_ADMIN: 任意のユーザーのロールを変更可能（自分自身とSUPER_ADMIN降格は不可）
 * TENANT_ADMIN: 自テナントの ADMIN ↔ USER のみ変更可能
 */
export class UpdateUserRoleDto {
  @ApiProperty({ 
    description: '新しいロール', 
    enum: UserRole,
    example: UserRole.ADMIN 
  })
  @IsEnum(UserRole, { message: '有効なロールを指定してください' })
  role: UserRole;
}
```

## File: backend/src/users/users.controller.ts
```typescript
import { 
  Controller, 
  Get, 
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

/**
 * ユーザー管理コントローラ
 * 
 * ユーザー一覧取得などのエンドポイントを提供します。
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ユーザー一覧取得
   * 
   * - SUPER_ADMIN: 全テナントのユーザーを取得可能（tenantId でフィルタ可能）
   * - TENANT_ADMIN: 自テナントのユーザーのみ取得可能
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'ユーザー一覧取得',
    description: 'SUPER_ADMINは全ユーザー、TENANT_ADMINは自テナントのユーザーを取得します。' 
  })
  @ApiQuery({ 
    name: 'tenantId', 
    required: false, 
    description: 'テナント ID でフィルタ（SUPER_ADMIN のみ有効）' 
  })
  @ApiResponse({ status: 200, description: 'ユーザー一覧を返却' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  async listUsers(
    @GetUser() user: RequestUser,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.usersService.listUsers(user, tenantId);
  }

  /**
   * 自身のプロフィール取得
   * 
   * JWTで認証されたユーザー自身のプロフィール情報を取得します。
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '自身のプロフィール取得',
    description: 'JWTで認証されたユーザー自身のプロフィール情報を取得します。' 
  })
  @ApiResponse({ status: 200, description: 'プロフィール情報を返却' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async getMe(@GetUser() user: RequestUser) {
    return this.usersService.getProfile(user);
  }

  /**
   * 自身のプロフィール更新
   * 
   * JWTで認証されたユーザー自身のプロフィール情報を更新します。
   * 各フィールドはオプショナル（更新したいフィールドのみ送信可能）。
   * メールアドレスが変更される場合は重複チェックを行います。
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '自身のプロフィール更新',
    description: 'JWTで認証されたユーザー自身のプロフィール情報を更新します。各フィールドはオプショナルです。' 
  })
  @ApiResponse({ status: 200, description: 'プロフィールが更新されました' })
  @ApiResponse({ status: 400, description: '更新するフィールドがありません' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async updateMe(
    @GetUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user, dto);
  }

  /**
   * 初回 SUPER_ADMIN 昇格
   * 
   * DB 上に SUPER_ADMIN が存在しない場合のみ、現在のログインユーザーを SUPER_ADMIN に昇格します。
   */
  @Post('promote-to-superadmin-once')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '初回 SUPER_ADMIN 昇格',
    description: 'SUPER_ADMIN がまだ存在しない場合のみ、現在のユーザーを SUPER_ADMIN に昇格します。' 
  })
  @ApiResponse({ status: 200, description: '昇格成功' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: 'SUPER_ADMIN はすでに存在します' })
  async promoteToSuperAdminOnce(@GetUser() user: RequestUser) {
    return this.usersService.promoteToSuperAdminOnce(user);
  }

  /**
   * ユーザー招待
   * 
   * - SUPER_ADMIN: 任意のテナントに TENANT_ADMIN / ADMIN / USER を招待可能
   * - TENANT_ADMIN: 自テナントにのみ ADMIN / USER を招待可能
   */
  @Post('invite')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'ユーザー招待',
    description: 'SUPER_ADMINは任意のテナント、TENANT_ADMINは自テナントにユーザーを招待します。' 
  })
  @ApiResponse({ status: 201, description: '招待が作成されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async inviteUser(
    @GetUser() user: RequestUser,
    @Body() dto: InviteUserDto,
  ) {
    return this.usersService.inviteUser(user, dto);
  }

  /**
   * ユーザーロール変更
   * 
   * - SUPER_ADMIN: 任意のユーザーのロールを変更可能（自分自身と SUPER_ADMIN 降格は不可）
   * - TENANT_ADMIN: 自テナントの ADMIN ↔ USER のみ変更可能
   */
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'ユーザーロール変更',
    description: 'SUPER_ADMINは任意のユーザー、TENANT_ADMINは自テナントのADMIN/USERのロールを変更します。' 
  })
  @ApiParam({ name: 'id', description: '対象ユーザー ID' })
  @ApiResponse({ status: 200, description: 'ロールが更新されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async updateUserRole(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(user, id, dto);
  }

  /**
   * ユーザー削除
   * 
   * - SUPER_ADMIN: 任意のユーザーを削除可能（自分自身と他の SUPER_ADMIN は削除不可）
   * - TENANT_ADMIN: 自テナントの ADMIN / USER のみ削除可能
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'ユーザー削除',
    description: 'SUPER_ADMINは任意のユーザー（自分と他のSUPER_ADMINを除く）、TENANT_ADMINは自テナントのADMIN/USERを削除します。' 
  })
  @ApiParam({ name: 'id', description: '対象ユーザー ID' })
  @ApiResponse({ status: 200, description: 'ユーザーが削除されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async deleteUser(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteUser(user, id);
  }
}
```

## File: backend/src/users/users.module.ts
```typescript
import { Module } from "@nestjs/common";

import { EmailModule } from "../email/email.module";
import { PrismaModule } from "../prisma/prisma.module";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## File: backend/src/users/users.service.spec.ts
```typescript
import { 
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  // トランザクション内で使用されるモック
  const mockTxUser = {
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
    invitationToken: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: { user: typeof mockTxUser }) => Promise<unknown>) => {
      return callback({ user: mockTxUser });
    }),
  };

  const mockEmailService = {
    sendInvitationEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
    // トランザクションのモックもクリア
    mockTxUser.count.mockClear();
    mockTxUser.update.mockClear();
    mockPrismaService.tenant.findUnique.mockClear();
    mockPrismaService.user.findUnique.mockClear();
    mockPrismaService.user.findFirst.mockClear();
    mockPrismaService.invitationToken.create.mockClear();
    mockEmailService.sendInvitationEmail.mockClear();
  });

  describe('listUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        role: UserRole.USER,
        isActive: true,
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        role: UserRole.USER,
        isActive: true,
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      },
    ];

    describe('SUPER_ADMIN として', () => {
      const superAdminUser: RequestUser = {
        userId: 'super-admin-1',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN,
        tenantId: undefined,
      };

      it('全ユーザーを取得できる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(superAdminUser);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUsers);
        expect(result.count).toBe(2);
        expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
          where: undefined,
          select: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('tenantId でフィルタできる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(superAdminUser, 'tenant-1');

        expect(result.success).toBe(true);
        expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
          where: { tenantId: 'tenant-1' },
          select: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });
    });

    describe('TENANT_ADMIN として', () => {
      const tenantAdminUser: RequestUser = {
        userId: 'tenant-admin-1',
        email: 'tenantadmin@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: 'tenant-1',
      };

      it('自テナントのユーザーを取得できる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(tenantAdminUser);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUsers);
        expect(result.count).toBe(2);
        expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
          where: { tenantId: 'tenant-1' },
          select: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('自テナントの tenantId を指定しても取得できる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(tenantAdminUser, 'tenant-1');

        expect(result.success).toBe(true);
        expect(result.count).toBe(2);
      });

      it('他のテナント ID を指定するとエラー', async () => {
        await expect(
          service.listUsers(tenantAdminUser, 'tenant-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.listUsers(tenantAdminUser, 'tenant-2'),
        ).rejects.toThrow('他のテナントのユーザー一覧にはアクセスできません');
      });

      it('テナントに所属していない場合はエラー', async () => {
        const noTenantAdminUser: RequestUser = {
          userId: 'tenant-admin-2',
          email: 'tenantadmin2@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: undefined,
        };

        await expect(service.listUsers(noTenantAdminUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(noTenantAdminUser)).rejects.toThrow(
          'テナントに所属していません',
        );
      });
    });

    describe('権限のないロールとして', () => {
      it('USER ロールはアクセスできない', async () => {
        const regularUser: RequestUser = {
          userId: 'user-1',
          email: 'user@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        await expect(service.listUsers(regularUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(regularUser)).rejects.toThrow(
          'ユーザー一覧の取得権限がありません',
        );
      });

      it('ADMIN ロールはアクセスできない', async () => {
        const adminUser: RequestUser = {
          userId: 'admin-1',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          tenantId: 'tenant-1',
        };

        await expect(service.listUsers(adminUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(adminUser)).rejects.toThrow(
          'ユーザー一覧の取得権限がありません',
        );
      });

      it('ロールが未設定の場合はアクセスできない', async () => {
        const noRoleUser: RequestUser = {
          userId: 'user-no-role',
          email: 'norole@example.com',
          role: undefined,
          tenantId: 'tenant-1',
        };

        await expect(service.listUsers(noRoleUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(noRoleUser)).rejects.toThrow(
          'ユーザーロールが設定されていません',
        );
      });
    });
  });

  describe('promoteToSuperAdminOnce', () => {
    const regularUser: RequestUser = {
      userId: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    describe('SUPER_ADMIN がまだ存在しない場合', () => {
      it('ユーザーを SUPER_ADMIN に昇格できる', async () => {
        mockTxUser.count.mockResolvedValue(0);
        mockTxUser.update.mockResolvedValue({
          id: regularUser.userId,
          email: regularUser.email,
          role: UserRole.SUPER_ADMIN,
        });

        const result = await service.promoteToSuperAdminOnce(regularUser);

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(regularUser.userId);
        expect(result.data.email).toBe(regularUser.email);
        expect(result.data.role).toBe(UserRole.SUPER_ADMIN);

        expect(mockTxUser.count).toHaveBeenCalledWith({
          where: { role: UserRole.SUPER_ADMIN },
        });
        expect(mockTxUser.update).toHaveBeenCalledWith({
          where: { id: regularUser.userId },
          data: { role: UserRole.SUPER_ADMIN },
          select: {
            id: true,
            email: true,
            role: true,
          },
        });
      });
    });

    describe('SUPER_ADMIN がすでに存在する場合', () => {
      it('ForbiddenException を投げる', async () => {
        mockTxUser.count.mockResolvedValue(1);

        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          'SUPER_ADMINはすでに存在します',
        );
      });

      it('prisma.user.update が呼ばれないことを確認', async () => {
        mockTxUser.count.mockResolvedValue(2);

        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          ForbiddenException,
        );

        expect(mockTxUser.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('inviteUser', () => {
    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    const mockTenant = {
      id: 'tenant-1',
      name: 'Test Tenant',
      slug: 'test-tenant',
      isActive: true,
    };

    const mockInvitation = {
      id: 'invitation-1',
      email: 'newuser@example.com',
      token: 'mock-token-123',
      role: UserRole.USER,
      tenantId: 'tenant-1',
      expiresAt: new Date(),
    };

    describe('SUPER_ADMIN として', () => {
      it('任意のテナントにユーザーを招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue(mockInvitation);

        const result = await service.inviteUser(superAdminUser, dto);

        expect(result.success).toBe(true);
        expect(result.tenantId).toBe('tenant-1');
        expect(result.message).toBe('招待メールを送信しました');
        expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
          where: { id: 'tenant-1' },
        });
        expect(mockPrismaService.invitationToken.create).toHaveBeenCalled();
        expect(mockEmailService.sendInvitationEmail).toHaveBeenCalledWith(
          'newuser@example.com',
          'mock-token-123',
          'Test Tenant',
          UserRole.USER,
        );
      });

      it('TENANT_ADMIN を招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newadmin@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue({
          ...mockInvitation,
          role: UserRole.TENANT_ADMIN,
        });

        const result = await service.inviteUser(superAdminUser, dto);

        expect(result.success).toBe(true);
      });
    });

    describe('TENANT_ADMIN として', () => {
      it('自テナントに ADMIN を招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newadmin@example.com',
          role: UserRole.ADMIN,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue({
          ...mockInvitation,
          role: UserRole.ADMIN,
        });

        const result = await service.inviteUser(tenantAdminUser, dto);

        expect(result.success).toBe(true);
        expect(result.tenantId).toBe('tenant-1');
      });

      it('自テナントに USER を招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue(mockInvitation);

        const result = await service.inviteUser(tenantAdminUser, dto);

        expect(result.success).toBe(true);
      });

      it('TENANT_ADMIN を招待しようとすると 403', async () => {
        const dto: InviteUserDto = {
          email: 'newadmin@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: 'tenant-1',
        };

        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN を招待する権限がありません',
        );
      });

      it('SUPER_ADMIN を招待しようとすると 403', async () => {
        const dto: InviteUserDto = {
          email: 'newsuperadmin@example.com',
          role: UserRole.SUPER_ADMIN,
          tenantId: 'tenant-1',
        };

        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN を招待する権限がありません',
        );
      });

      it('他テナントに招待しようとすると 403', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-2',
        };

        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          '他のテナントにユーザーを招待することはできません',
        );
      });
    });

    describe('共通エラーケース', () => {
      it('既存ユーザーがいる場合は 409', async () => {
        const dto: InviteUserDto = {
          email: 'existing@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'existing-user',
          email: 'existing@example.com',
        });

        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          'このメールアドレスは既に使用されています',
        );
      });

      it('テナントが存在しない場合は 404', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'non-existent-tenant',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(null);

        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          '指定されたテナントが見つかりません',
        );
      });
    });
  });

  describe('updateUserRole', () => {
    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockAdmin = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      tenantId: 'tenant-1',
    };

    const mockSuperAdmin = {
      id: 'super-admin-2',
      email: 'superadmin2@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const mockTenantAdmin = {
      id: 'tenant-admin-2',
      email: 'tenantadmin2@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    describe('SUPER_ADMIN として', () => {
      it('ユーザーのロールを変更できる', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.update.mockResolvedValue({
          ...mockUser,
          role: UserRole.ADMIN,
        });

        const result = await service.updateUserRole(superAdminUser, 'user-1', dto);

        expect(result.success).toBe(true);
        expect(result.data.role).toBe(UserRole.ADMIN);
        expect(result.message).toBe('ロールを更新しました');
      });

      it('SUPER_ADMIN を降格しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockSuperAdmin);

        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow('SUPER_ADMIN を降格することはできません');
      });

      it('自分自身のロールを変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'super-admin-1',
          email: 'superadmin@example.com',
          role: UserRole.SUPER_ADMIN,
        });

        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-1', dto),
        ).rejects.toThrow('自分自身のロールを変更することはできません');
      });
    });

    describe('TENANT_ADMIN として', () => {
      it('自テナントの ADMIN を USER に変更できる', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.USER };

        mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);
        mockPrismaService.user.update.mockResolvedValue({
          ...mockAdmin,
          role: UserRole.USER,
        });

        const result = await service.updateUserRole(tenantAdminUser, 'admin-1', dto);

        expect(result.success).toBe(true);
        expect(result.data.role).toBe(UserRole.USER);
      });

      it('自テナントの USER を ADMIN に変更できる', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.update.mockResolvedValue({
          ...mockUser,
          role: UserRole.ADMIN,
        });

        const result = await service.updateUserRole(tenantAdminUser, 'user-1', dto);

        expect(result.success).toBe(true);
        expect(result.data.role).toBe(UserRole.ADMIN);
      });

      it('他テナントのユーザーを変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        const otherTenantUser = {
          ...mockUser,
          tenantId: 'tenant-2',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(otherTenantUser);

        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow('他のテナントのユーザーのロールを変更することはできません');
      });

      it('SUPER_ADMIN を変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        const superAdminInTenant = {
          ...mockSuperAdmin,
          tenantId: 'tenant-1',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(superAdminInTenant);

        await expect(
          service.updateUserRole(tenantAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN のロールを変更する権限がありません',
        );
      });

      it('TENANT_ADMIN を変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.USER };

        mockPrismaService.user.findUnique.mockResolvedValue(mockTenantAdmin);

        await expect(
          service.updateUserRole(tenantAdminUser, 'tenant-admin-2', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'tenant-admin-2', dto),
        ).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN のロールを変更する権限がありません',
        );
      });

      it('SUPER_ADMIN に変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.SUPER_ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN に変更する権限がありません');
      });

      it('TENANT_ADMIN に変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.TENANT_ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN に変更する権限がありません');
      });
    });

    describe('共通エラーケース', () => {
      it('ユーザーが存在しない場合は 404', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(
          service.updateUserRole(superAdminUser, 'non-existent-user', dto),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.updateUserRole(superAdminUser, 'non-existent-user', dto),
        ).rejects.toThrow('指定されたユーザーが見つかりません');
      });
    });
  });

  describe('getProfile', () => {
    const regularUser: RequestUser = {
      userId: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockUserProfile = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Test',
      role: UserRole.USER,
    };

    it('ユーザーが存在する場合、プロフィール情報を正常に取得できる', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserProfile);

      const result = await service.getProfile(regularUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserProfile);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    });

    it('ユーザーが存在しない場合、NotFoundException がスローされる', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(regularUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile(regularUser)).rejects.toThrow(
        'ユーザーが見つかりません',
      );
    });
  });

  describe('updateProfile', () => {
    const regularUser: RequestUser = {
      userId: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockUpdatedUser = {
      id: 'user-1',
      email: 'newemail@example.com',
      firstName: 'NewFirst',
      lastName: 'NewLast',
      role: UserRole.USER,
    };

    it('firstName, lastName, email を正常に更新できる', async () => {
      const dto = {
        firstName: 'NewFirst',
        lastName: 'NewLast',
        email: 'newemail@example.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateProfile(regularUser, dto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedUser);
      expect(result.message).toBe('プロフィールを更新しました');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: {
          firstName: 'NewFirst',
          lastName: 'NewLast',
          email: 'newemail@example.com',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    });

    it('firstName のみを更新できる', async () => {
      const dto = { firstName: 'NewFirst' };

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        firstName: 'NewFirst',
      });

      const result = await service.updateProfile(regularUser, dto);

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: { firstName: 'NewFirst' },
        select: expect.any(Object),
      });
    });

    it('空のDTOの場合、BadRequestException がスローされる', async () => {
      const dto = {};

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        '更新するフィールドがありません',
      );
    });

    it('既存のメールアドレスを指定した場合、ConflictException がスローされる', async () => {
      const dto = { email: 'existing@example.com' };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'other-user',
        email: 'existing@example.com',
      });

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        'このメールアドレスは既に使用されています',
      );
    });

    it('空のメールアドレスを指定した場合、BadRequestException がスローされる', async () => {
      const dto = { email: '' };

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        'メールアドレスは空にできません',
      );
    });

    it('空白のみのメールアドレスを指定した場合、BadRequestException がスローされる', async () => {
      const dto = { email: '   ' };

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        'メールアドレスは空にできません',
      );
    });

    it('メールアドレスが正規化される（trim + toLowerCase）', async () => {
      const dto = { email: '  Test@Example.COM  ' };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        email: 'test@example.com',
      });

      await service.updateProfile(regularUser, dto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: { email: 'test@example.com' },
        select: expect.any(Object),
      });
    });

    it('空文字列で firstName/lastName を削除できる', async () => {
      const dto = { firstName: '', lastName: '' };

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        firstName: '',
        lastName: '',
      });

      const result = await service.updateProfile(regularUser, dto);

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: { firstName: '', lastName: '' },
        select: expect.any(Object),
      });
    });
  });

  describe('deleteUser', () => {
    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockAdmin = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      tenantId: 'tenant-1',
    };

    const mockSuperAdmin = {
      id: 'super-admin-2',
      email: 'superadmin2@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const mockTenantAdmin = {
      id: 'tenant-admin-2',
      email: 'tenantadmin2@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    describe('SUPER_ADMIN として', () => {
      it('自分自身を削除しようとした場合は拒否される', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'super-admin-1',
          email: 'superadmin@example.com',
          role: UserRole.SUPER_ADMIN,
          tenantId: undefined,
        });

        await expect(
          service.deleteUser(superAdminUser, 'super-admin-1'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(superAdminUser, 'super-admin-1'),
        ).rejects.toThrow('自分自身を削除することはできません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('他の SUPER_ADMIN を削除しようとした場合は拒否される', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockSuperAdmin);

        await expect(
          service.deleteUser(superAdminUser, 'super-admin-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(superAdminUser, 'super-admin-2'),
        ).rejects.toThrow('SUPER_ADMIN を削除することはできません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('TENANT_ADMIN を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockTenantAdmin);
        mockPrismaService.user.delete.mockResolvedValue(mockTenantAdmin);

        const result = await service.deleteUser(superAdminUser, 'tenant-admin-2');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'tenant-admin-2' },
        });
      });

      it('ADMIN を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);
        mockPrismaService.user.delete.mockResolvedValue(mockAdmin);

        const result = await service.deleteUser(superAdminUser, 'admin-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'admin-1' },
        });
      });

      it('USER を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.delete.mockResolvedValue(mockUser);

        const result = await service.deleteUser(superAdminUser, 'user-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'user-1' },
        });
      });
    });

    describe('TENANT_ADMIN として', () => {
      it('自テナントの ADMIN を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);
        mockPrismaService.user.delete.mockResolvedValue(mockAdmin);

        const result = await service.deleteUser(tenantAdminUser, 'admin-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'admin-1' },
        });
      });

      it('自テナントの USER を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.delete.mockResolvedValue(mockUser);

        const result = await service.deleteUser(tenantAdminUser, 'user-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'user-1' },
        });
      });

      it('SUPER_ADMIN を削除しようとした場合は拒否される', async () => {
        const superAdminInTenant = {
          ...mockSuperAdmin,
          tenantId: 'tenant-1',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(superAdminInTenant);

        await expect(
          service.deleteUser(tenantAdminUser, 'super-admin-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(tenantAdminUser, 'super-admin-2'),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN を削除する権限がありません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('TENANT_ADMIN を削除しようとした場合は拒否される', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockTenantAdmin);

        await expect(
          service.deleteUser(tenantAdminUser, 'tenant-admin-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(tenantAdminUser, 'tenant-admin-2'),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN を削除する権限がありません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('他テナントのユーザーを削除しようとした場合は拒否される', async () => {
        const otherTenantUser = {
          ...mockUser,
          tenantId: 'tenant-2',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(otherTenantUser);

        await expect(
          service.deleteUser(tenantAdminUser, 'user-1'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(tenantAdminUser, 'user-1'),
        ).rejects.toThrow('他のテナントのユーザーを削除することはできません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });
    });

    describe('共通エラーケース', () => {
      it('存在しないユーザー ID を指定した場合はエラー', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(
          service.deleteUser(superAdminUser, 'non-existent-user'),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.deleteUser(superAdminUser, 'non-existent-user'),
        ).rejects.toThrow('指定されたユーザーが見つかりません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('ロールが設定されていない場合はアクセス拒否', async () => {
        const userWithoutRole: RequestUser = {
          userId: 'user-1',
          email: 'user@example.com',
          role: undefined as any,
          tenantId: 'tenant-1',
        };

        await expect(
          service.deleteUser(userWithoutRole, 'user-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(userWithoutRole, 'user-2'),
        ).rejects.toThrow('ユーザーロールが設定されていません');

        expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('ADMIN または USER ロールの場合はアクセス拒否', async () => {
        const adminUser: RequestUser = {
          userId: 'admin-1',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          tenantId: 'tenant-1',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await expect(
          service.deleteUser(adminUser, 'user-1'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(adminUser, 'user-1'),
        ).rejects.toThrow('ユーザー削除の権限がありません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });
    });
  });
});
```

## File: backend/src/users/users.service.ts
```typescript
import { randomBytes } from 'crypto';

import { 
  Injectable, 
  Logger, 
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

/** 招待トークンのバイトサイズ */
const INVITATION_TOKEN_BYTES = 32;
/** 招待トークンの有効期限（日数） */
const INVITATION_EXPIRY_DAYS = 7;

export interface PromoteToSuperAdminResponse {
  success: true;
  data: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * ユーザープロフィール情報の共通型
 */
export interface UserProfileData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

/**
 * ユーザー管理サービス
 * 
 * マルチテナント環境でのユーザー一覧取得機能を提供します。
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * 指定されたロールが高権限ロール（SUPER_ADMIN, TENANT_ADMIN）かどうかをチェック
   * 
   * @private
   */
  private isPrivilegedRole(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN || role === UserRole.TENANT_ADMIN;
  }

  /**
   * ユーザー一覧を取得
   * 
   * - SUPER_ADMIN: 全テナントのユーザーを取得可能
   * - TENANT_ADMIN: 自テナントのユーザーのみ取得可能
   * 
   * @param currentUser 現在のユーザー情報
   * @param tenantId フィルタするテナント ID（オプション）
   * @returns ユーザー一覧
   */
  async listUsers(currentUser: RequestUser, tenantId?: string) {
    // ロールが設定されていない場合はアクセス拒否
    if (!currentUser.role) {
      throw new ForbiddenException('ユーザーロールが設定されていません');
    }

    // SUPER_ADMIN の場合
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      const users = await this.prisma.user.findMany({
        where: tenantId ? { tenantId } : undefined,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log({
        message: 'Users listed by SUPER_ADMIN',
        userId: currentUser.userId,
        tenantId: tenantId ?? 'all',
        count: users.length,
      });

      return {
        success: true,
        data: users,
        count: users.length,
      };
    }

    // TENANT_ADMIN の場合
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      // 自テナントのユーザーのみ取得可能
      const userTenantId = currentUser.tenantId;

      if (!userTenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }

      // 他のテナント ID が指定された場合はエラー
      if (tenantId && tenantId !== userTenantId) {
        throw new ForbiddenException('他のテナントのユーザー一覧にはアクセスできません');
      }

      const users = await this.prisma.user.findMany({
        where: { tenantId: userTenantId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log({
        message: 'Users listed by TENANT_ADMIN',
        userId: currentUser.userId,
        tenantId: userTenantId,
        count: users.length,
      });

      return {
        success: true,
        data: users,
        count: users.length,
      };
    }

    // それ以外のロールの場合はアクセス拒否
    throw new ForbiddenException('ユーザー一覧の取得権限がありません');
  }

  /**
   * 初回 SUPER_ADMIN 昇格
   * 
   * DB 上に SUPER_ADMIN が存在しない場合のみ、現在のユーザーを SUPER_ADMIN に昇格します。
   * 
   * @param currentUser 現在のユーザー情報
   * @returns 昇格後のユーザー情報
   * @throws ForbiddenException SUPER_ADMIN がすでに存在する場合
   */
  async promoteToSuperAdminOnce(currentUser: RequestUser): Promise<PromoteToSuperAdminResponse> {
    // トランザクションで競合状態を防止
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const superAdminCount = await tx.user.count({
        where: { role: UserRole.SUPER_ADMIN },
      });

      if (superAdminCount > 0) {
        this.logger.warn({
          message: 'promoteToSuperAdminOnce: すでにSUPER_ADMINが存在するため拒否',
          requestedByUserId: currentUser.userId,
          requestedByEmail: currentUser.email,
        });
        throw new ForbiddenException('SUPER_ADMINはすでに存在します');
      }

      return tx.user.update({
        where: { id: currentUser.userId },
        data: { role: UserRole.SUPER_ADMIN },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
    });

    this.logger.log({
      message: 'promoteToSuperAdminOnce: SUPER_ADMINを初回作成',
      userId: updatedUser.id,
      email: updatedUser.email,
    });

    return {
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }

  /**
   * ユーザー招待
   * 
   * 権限チェックルール:
   * - SUPER_ADMIN: 任意のテナントに TENANT_ADMIN / ADMIN / USER を招待可能
   * - TENANT_ADMIN: 自テナント (currentUser.tenantId === dto.tenantId) にのみ ADMIN / USER を招待可能
   *   - SUPER_ADMIN, TENANT_ADMIN ロールへの招待は ForbiddenException
   * 
   * @param currentUser 現在のユーザー情報
   * @param dto 招待情報
   * @returns 招待トークン情報
   */
  async inviteUser(
    currentUser: RequestUser,
    dto: InviteUserDto,
  ): Promise<{
    success: true;
    invitationToken: string;
    tenantId: string;
    message: string;
  }> {
    // ロールが設定されていない場合はアクセス拒否
    if (!currentUser.role) {
      throw new ForbiddenException('ユーザーロールが設定されていません');
    }

    const email = dto.email.trim().toLowerCase();

    // SUPER_ADMIN の場合
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // SUPER_ADMIN は任意のテナントに任意のロールを招待可能
      return this.createInvitation(email, dto.role, dto.tenantId, currentUser);
    }

    // TENANT_ADMIN の場合
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      // テナントに所属していない場合はエラー
      if (!currentUser.tenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }

      // 他のテナントへの招待は禁止
      if (currentUser.tenantId !== dto.tenantId) {
        throw new ForbiddenException('他のテナントにユーザーを招待することはできません');
      }

      // SUPER_ADMIN, TENANT_ADMIN ロールへの招待は禁止
      if (this.isPrivilegedRole(dto.role)) {
        throw new ForbiddenException('SUPER_ADMIN または TENANT_ADMIN を招待する権限がありません');
      }

      return this.createInvitation(email, dto.role, dto.tenantId, currentUser);
    }

    // それ以外のロールの場合はアクセス拒否
    throw new ForbiddenException('ユーザー招待の権限がありません');
  }

  /**
   * 招待トークンを作成する内部メソッド
   * 
   * @private
   */
  private async createInvitation(
    email: string,
    role: UserRole,
    tenantId: string,
    currentUser: RequestUser,
  ): Promise<{
    success: true;
    invitationToken: string;
    tenantId: string;
    message: string;
  }> {
    // テナントの存在確認
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('指定されたテナントが見つかりません');
    }

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // 招待トークン生成
    const token = randomBytes(INVITATION_TOKEN_BYTES).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await this.prisma.invitationToken.create({
      data: {
        email,
        token,
        role,
        tenantId,
        expiresAt,
      },
    });

    this.logger.log({
      message: 'User invitation created',
      tenantId,
      email,
      role,
      invitedBy: currentUser.userId,
      timestamp: new Date().toISOString(),
    });

    // 招待メールを送信
    const emailSent = await this.emailService.sendInvitationEmail(
      email,
      invitation.token,
      tenant.name,
      role,
    );

    if (!emailSent) {
      this.logger.warn(`Failed to send invitation email to ${email}, but invitation was created successfully`);
    }

    return {
      success: true,
      invitationToken: invitation.token,
      tenantId,
      message: emailSent ? '招待メールを送信しました' : '招待を作成しましたが、メール送信に失敗しました',
    };
  }

  /**
   * ユーザーロール変更
   * 
   * 権限チェックルール:
   * - SUPER_ADMIN:
   *   - 任意のユーザーのロールを変更可能
   *   - ただし、SUPER_ADMIN を SUPER_ADMIN 以外に降格する操作は ForbiddenException
   *   - 自分自身のロール変更も禁止
   * - TENANT_ADMIN:
   *   - 対象ユーザーが自テナント所属であること (user.tenantId === currentUser.tenantId)
   *   - 変更可能なロール: ADMIN ↔ USER のみ
   *   - SUPER_ADMIN, TENANT_ADMIN への変更は ForbiddenException
   *   - SUPER_ADMIN, TENANT_ADMIN のロール変更も ForbiddenException
   * 
   * @param currentUser 現在のユーザー情報
   * @param userId 対象ユーザー ID
   * @param dto 新しいロール情報
   * @returns 更新後のユーザー情報
   */
  async updateUserRole(
    currentUser: RequestUser,
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<{
    success: true;
    data: {
      id: string;
      email: string;
      role: UserRole;
    };
    message: string;
  }> {
    // ロールが設定されていない場合はアクセス拒否
    if (!currentUser.role) {
      throw new ForbiddenException('ユーザーロールが設定されていません');
    }

    // 対象ユーザーの取得
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('指定されたユーザーが見つかりません');
    }

    // SUPER_ADMIN の場合
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // 自分自身のロール変更は禁止
      if (currentUser.userId === userId) {
        throw new ForbiddenException('自分自身のロールを変更することはできません');
      }

      // SUPER_ADMIN を降格することは禁止
      if (targetUser.role === UserRole.SUPER_ADMIN && dto.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('SUPER_ADMIN を降格することはできません');
      }

      // ロール更新
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { role: dto.role },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      this.logger.log({
        message: 'User role updated by SUPER_ADMIN',
        targetUserId: userId,
        oldRole: targetUser.role,
        newRole: dto.role,
        updatedBy: currentUser.userId,
      });

      return {
        success: true,
        data: updatedUser,
        message: 'ロールを更新しました',
      };
    }

    // TENANT_ADMIN の場合
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      // テナントに所属していない場合はエラー
      if (!currentUser.tenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }

      // 対象ユーザーが他テナントの場合はエラー
      if (targetUser.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException('他のテナントのユーザーのロールを変更することはできません');
      }

      // 対象ユーザーが SUPER_ADMIN または TENANT_ADMIN の場合は変更不可
      if (this.isPrivilegedRole(targetUser.role)) {
        throw new ForbiddenException('SUPER_ADMIN または TENANT_ADMIN のロールを変更する権限がありません');
      }

      // SUPER_ADMIN, TENANT_ADMIN への変更は禁止
      if (this.isPrivilegedRole(dto.role)) {
        throw new ForbiddenException('SUPER_ADMIN または TENANT_ADMIN に変更する権限がありません');
      }

      // ロール更新（ADMIN ↔ USER のみ許可）
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { role: dto.role },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      this.logger.log({
        message: 'User role updated by TENANT_ADMIN',
        targetUserId: userId,
        oldRole: targetUser.role,
        newRole: dto.role,
        updatedBy: currentUser.userId,
        tenantId: currentUser.tenantId,
      });

      return {
        success: true,
        data: updatedUser,
        message: 'ロールを更新しました',
      };
    }

    // それ以外のロールの場合はアクセス拒否
    throw new ForbiddenException('ユーザーロール変更の権限がありません');
  }

  /**
   * 認証されたユーザーのプロフィールを取得
   * 
   * @param currentUser 現在のユーザー情報
   * @returns プロフィール情報
   */
  async getProfile(currentUser: RequestUser): Promise<{
    success: true;
    data: UserProfileData;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    this.logger.log({
      message: 'Profile retrieved',
      userId: user.id,
    });

    return {
      success: true,
      data: user,
    };
  }

  /**
   * 認証されたユーザーのプロフィールを更新
   * 
   * @param currentUser 現在のユーザー情報
   * @param dto 更新するプロフィール情報
   * @returns 更新後のプロフィール情報
   */
  async updateProfile(
    currentUser: RequestUser,
    dto: UpdateProfileDto,
  ): Promise<{
    success: true;
    data: UserProfileData;
    message: string;
  }> {
    // 更新対象のフィールドがない場合はエラー
    if (dto.firstName === undefined && dto.lastName === undefined && dto.email === undefined) {
      throw new BadRequestException('更新するフィールドがありません');
    }

    // 更新データを構築
    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } = {};

    // firstName/lastName は空文字列も許可（名前を消す場合）
    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.email !== undefined) {
      const trimmedEmail = dto.email.trim().toLowerCase();
      if (trimmedEmail === '') {
        throw new BadRequestException('メールアドレスは空にできません');
      }
      // メールアドレスの重複チェック
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id: currentUser.userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('このメールアドレスは既に使用されています');
      }
      updateData.email = trimmedEmail;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    this.logger.log({
      message: 'Profile updated',
      userId: updatedUser.id,
      updatedFields: Object.keys(updateData),
    });

    return {
      success: true,
      data: updatedUser,
      message: 'プロフィールを更新しました',
    };
  }

  /**
   * ユーザー削除
   * 
   * 権限チェックルール:
   * - SUPER_ADMIN:
   *   - 任意のユーザーを削除可能
   *   - ただし、自分自身と他の SUPER_ADMIN は削除不可
   * - TENANT_ADMIN:
   *   - 自テナントの ADMIN / USER のみ削除可能
   *   - SUPER_ADMIN, TENANT_ADMIN は削除不可
   * 
   * @param currentUser 現在のユーザー情報
   * @param userId 対象ユーザー ID
   * @returns 削除結果
   */
  async deleteUser(
    currentUser: RequestUser,
    userId: string,
  ): Promise<{
    success: true;
    message: string;
  }> {
    // ロールが設定されていない場合はアクセス拒否
    if (!currentUser.role) {
      throw new ForbiddenException('ユーザーロールが設定されていません');
    }

    // 対象ユーザーの取得
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('指定されたユーザーが見つかりません');
    }

    // SUPER_ADMIN の場合
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // 自分自身の削除は禁止
      if (currentUser.userId === userId) {
        throw new ForbiddenException('自分自身を削除することはできません');
      }

      // 他の SUPER_ADMIN の削除は禁止
      if (targetUser.role === UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('SUPER_ADMIN を削除することはできません');
      }

      // ユーザー削除
      await this.prisma.user.delete({
        where: { id: userId },
      });

      this.logger.log({
        message: 'User deleted by SUPER_ADMIN',
        targetUserId: userId,
        targetEmail: targetUser.email,
        deletedBy: currentUser.userId,
      });

      return {
        success: true,
        message: 'ユーザーを削除しました',
      };
    }

    // TENANT_ADMIN の場合
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      // テナントに所属していない場合はエラー
      if (!currentUser.tenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }

      // 対象ユーザーが他テナントの場合はエラー
      if (targetUser.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException('他のテナントのユーザーを削除することはできません');
      }

      // 対象ユーザーが SUPER_ADMIN または TENANT_ADMIN の場合は削除不可
      if (this.isPrivilegedRole(targetUser.role)) {
        throw new ForbiddenException('SUPER_ADMIN または TENANT_ADMIN を削除する権限がありません');
      }

      // ユーザー削除
      await this.prisma.user.delete({
        where: { id: userId },
      });

      this.logger.log({
        message: 'User deleted by TENANT_ADMIN',
        targetUserId: userId,
        targetEmail: targetUser.email,
        deletedBy: currentUser.userId,
        tenantId: currentUser.tenantId,
      });

      return {
        success: true,
        message: 'ユーザーを削除しました',
      };
    }

    // それ以外のロールの場合はアクセス拒否
    throw new ForbiddenException('ユーザー削除の権限がありません');
  }
}
```

## File: frontend/src/app/settings/page.tsx
```typescript
import { redirect } from 'next/navigation';

/**
 * 設定ページ - tenantsページのユーザー設定タブへリダイレクト
 * 
 * ボトムナビゲーション設定はユーザー設定タブに統合されました。
 */
export default function SettingsPage() {
  redirect('/tenants');
}
```

## File: frontend/src/app/tags/components/AutomationIndicator.tsx
```typescript
'use client';

import { Group, Text, Tooltip } from '@mantine/core';
import { IconWand } from '@tabler/icons-react';

import type { TagView } from '@/lib/api/hooks/use-tags';
import { extractAutomationMeta } from '../utils';

type AutomationIndicatorProps = {
  tag: TagView;
};

/**
 * タグの自動化状態を表示するインジケーター
 */
export function AutomationIndicator({ tag }: AutomationIndicatorProps) {
  const meta = extractAutomationMeta(tag);
  if (!meta && !tag.allowsAutomation) {
    return null;
  }

  const tooltipParts = [meta?.ruleName, meta?.reason, meta?.source, meta?.assignedAt].filter(Boolean);
  if (!meta && tag.allowsAutomation && !tag.allowsManual) {
    tooltipParts.push('自動付与専用タグ');
  }
  if (!meta && tag.allowsAutomation && tooltipParts.length === 0) {
    tooltipParts.push('自動付与ルールで使用可能');
  }

  const content = (
    <Group gap={4} align="center" wrap="nowrap" style={{ fontSize: 11 }}>
      <IconWand size={12} />
      <Text span>{meta ? '自動' : '自動可'}</Text>
    </Group>
  );

  return (
    <Tooltip label={tooltipParts.join(' / ')} withArrow multiline withinPortal>
      {content}
    </Tooltip>
  );
}
```

## File: frontend/src/app/tags/components/AutomationTab.tsx
```typescript
'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconRobot,
  IconTrash,
  IconWand,
} from '@tabler/icons-react';

import type { TagAutomationRule } from '@/lib/api/hooks/use-tag-automation';

export type AutomationTabProps = {
  isLoading: boolean;
  automationRules: TagAutomationRule[];
  isAnyMutationPending: boolean;
  createAutomationRulePending: boolean;
  updateAutomationRulePending: boolean;
  deleteAutomationRulePending: boolean;
  onOpenCreateRule: () => void;
  onEditRule: (rule: TagAutomationRule) => void;
  onDeleteRule: (id: string) => void;
  onOpenExecuteRule: (rule: TagAutomationRule) => void;
};

/**
 * 自動化ルールタブコンポーネント
 * タグ自動付与ルールの一覧と管理
 */
export function AutomationTab({
  isLoading,
  automationRules,
  isAnyMutationPending,
  createAutomationRulePending,
  updateAutomationRulePending,
  deleteAutomationRulePending,
  onOpenCreateRule,
  onEditRule,
  onDeleteRule,
  onOpenExecuteRule,
}: AutomationTabProps) {
  return (
    <Stack gap="md">
      <Card withBorder padding="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="lg" fw={600}>
              自動化ルール
            </Text>
            <Button 
              leftSection={<IconPlus size={16} />} 
              size="sm" 
              onClick={onOpenCreateRule}
              disabled={isAnyMutationPending || createAutomationRulePending}
            >
              ルール作成
            </Button>
          </Group>
          <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
            自動化ルールを設定すると、特定のイベント（交配登録、妊娠確認、子猫登録など）が発生したときに、条件に合致する猫へ自動的にタグを付与できます。
          </Alert>
        </Stack>
      </Card>

      {isLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : automationRules.length === 0 ? (
        <Center py="xl">
          <Stack gap="sm" align="center">
            <IconRobot size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" size="sm">
              自動化ルールが登録されていません
            </Text>
            <Text c="dimmed" size="xs">
              「ルール作成」ボタンから新しいルールを追加できます
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {automationRules.map((rule) => (
            <Card key={rule.id} withBorder radius="md" padding="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs" align="center">
                    <Text fw={500}>{rule.name}</Text>
                    {!rule.isActive && (
                      <Badge size="xs" color="gray" variant="outline">
                        無効
                      </Badge>
                    )}
                    <Badge size="xs" variant="light" color="blue">
                      {rule.triggerType === 'EVENT' && 'イベント'}
                      {rule.triggerType === 'SCHEDULE' && 'スケジュール'}
                      {rule.triggerType === 'MANUAL' && '手動'}
                    </Badge>
                    {rule.eventType && (
                      <Badge size="xs" variant="outline">
                        {rule.eventType === 'BREEDING_PLANNED' && '交配予定'}
                        {rule.eventType === 'BREEDING_CONFIRMED' && '交配確認'}
                        {rule.eventType === 'PREGNANCY_CONFIRMED' && '妊娠確認'}
                        {rule.eventType === 'KITTEN_REGISTERED' && '子猫登録'}
                        {rule.eventType === 'AGE_THRESHOLD' && '年齢閾値'}
                        {rule.eventType === 'PAGE_ACTION' && 'ページアクション'}
                        {rule.eventType === 'CUSTOM' && 'カスタム'}
                      </Badge>
                    )}
                  </Group>
                  {rule.description && (
                    <Text size="sm" c="dimmed">
                      {rule.description}
                    </Text>
                  )}
                  <Group gap="xs">
                    <Badge size="xs" variant="outline">
                      優先度: {rule.priority}
                    </Badge>
                    {rule.scope && (
                      <Badge size="xs" variant="outline">
                        スコープ: {rule.scope}
                      </Badge>
                    )}
                    {rule.config && typeof rule.config === 'object' && (rule.config as { tagIds?: string[] }).tagIds && (
                      <Badge size="xs" variant="outline" color="teal">
                        付与タグ: {((rule.config as { tagIds?: string[] }).tagIds ?? []).length}個
                      </Badge>
                    )}
                    {rule._count && (
                      <>
                        {rule._count.runs !== undefined && (
                          <Badge size="xs" variant="outline">
                            実行回数: {rule._count.runs}
                          </Badge>
                        )}
                        {rule._count.assignmentHistory !== undefined && (
                          <Badge size="xs" variant="outline">
                            付与履歴: {rule._count.assignmentHistory}
                          </Badge>
                        )}
                      </>
                    )}
                  </Group>
                </Stack>
                <Group gap={6}>
                  <Tooltip label="テスト実行">
                    <ActionIcon
                      variant="light"
                      color="green"
                      size="sm"
                      onClick={() => onOpenExecuteRule(rule)}
                      disabled={isAnyMutationPending}
                    >
                      <IconWand size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="編集">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => onEditRule(rule)}
                      disabled={isAnyMutationPending || updateAutomationRulePending}
                    >
                      <IconPencil size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="削除">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      disabled={deleteAutomationRulePending}
                      onClick={() => void onDeleteRule(rule.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
```

## File: frontend/src/app/tags/components/CategoriesTab.tsx
```typescript
'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  Center,
  Loader,
  Stack,
  Text,
} from '@mantine/core';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import { SortableCategoryCard } from './SortableCategoryCard';

export type CategoriesTabProps = {
  isLoading: boolean;
  sortedCategories: TagCategoryView[];
  isAnyMutationPending: boolean;
  reorderCategoriesPending: boolean;
  deleteCategoryPending: boolean;
  deleteGroupPending: boolean;
  deleteTagPending: boolean;
  reorderGroupsPending: boolean;
  reorderTagsPending: boolean;
  onCategoryDragEnd: (event: DragEndEvent) => void;
  onEditCategory: (category: TagCategoryView) => void;
  onDeleteCategory: (id: string) => void;
  onOpenCreateGroup: (categoryId: string) => void;
  onOpenCreateTag: (categoryId: string, groupId?: string) => void;
  onEditGroup: (category: TagCategoryView, group: TagGroupView) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
  onTagContextAction?: (action: string, tag?: TagView) => void;
  onReorderGroups: (categoryId: string, groups: TagGroupView[]) => void;
  onReorderTags: (groupId: string, tags: TagView[]) => void;
};

/**
 * カテゴリタブコンポーネント
 * カテゴリ一覧をDnDで並べ替え可能な形式で表示
 */
export function CategoriesTab({
  isLoading,
  sortedCategories,
  isAnyMutationPending,
  reorderCategoriesPending,
  deleteCategoryPending,
  deleteGroupPending,
  deleteTagPending,
  reorderGroupsPending,
  reorderTagsPending,
  onCategoryDragEnd,
  onEditCategory,
  onDeleteCategory,
  onOpenCreateGroup,
  onOpenCreateTag,
  onEditGroup,
  onDeleteGroup,
  onEditTag,
  onDeleteTag,
  onTagContextAction,
  onReorderGroups,
  onReorderTags,
}: CategoriesTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">カテゴリが見つかりません。新規作成してください。</Text>
      </Center>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onCategoryDragEnd}>
      <SortableContext items={sortedCategories.map((category) => category.id)} strategy={rectSortingStrategy}>
        <Stack gap="lg">
          {sortedCategories.map((category) => (
            <SortableCategoryCard
              key={category.id}
              category={category}
              isAnyMutationPending={isAnyMutationPending}
              reorderCategoriesPending={reorderCategoriesPending}
              deleteCategoryPending={deleteCategoryPending}
              deleteGroupPending={deleteGroupPending}
              deleteTagPending={deleteTagPending}
              reorderGroupsPending={reorderGroupsPending}
              reorderTagsPending={reorderTagsPending}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onOpenCreateGroup={onOpenCreateGroup}
              onOpenCreateTag={onOpenCreateTag}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
              onEditTag={onEditTag}
              onDeleteTag={onDeleteTag}
              onTagContextAction={onTagContextAction}
              onReorderGroups={onReorderGroups}
              onReorderTags={onReorderTags}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}
```

## File: frontend/src/app/tags/components/index.ts
```typescript
/**
 * タグ管理ページのコンポーネント群
 */

// タブコンポーネント
export { CategoriesTab } from './CategoriesTab';
export type { CategoriesTabProps } from './CategoriesTab';

export { TagsListTab } from './TagsListTab';
export type { TagsListTabProps, FlatTag } from './TagsListTab';

export { AutomationTab } from './AutomationTab';
export type { AutomationTabProps } from './AutomationTab';

// DnDコンポーネント
export { SortableCategoryCard } from './SortableCategoryCard';
export type { SortableCategoryCardProps } from './SortableCategoryCard';

export { SortableGroupCard } from './SortableGroupCard';
export type { SortableGroupCardProps } from './SortableGroupCard';

export { SortableTagItem } from './SortableTagItem';
export type { SortableTagItemProps } from './SortableTagItem';

export { AutomationIndicator } from './AutomationIndicator';

// モーダルコンポーネント
export { CategoryModal } from './CategoryModal';
export type { CategoryModalProps } from './CategoryModal';

export { GroupModal } from './GroupModal';
export type { GroupModalProps } from './GroupModal';

export { TagModal } from './TagModal';
export type { TagModalProps } from './TagModal';

export { AutomationRuleModal } from './AutomationRuleModal';
export type { AutomationRuleModalProps } from './AutomationRuleModal';

export { ExecuteRuleModal } from './ExecuteRuleModal';
export type { ExecuteRuleModalProps } from './ExecuteRuleModal';
```

## File: frontend/src/app/tags/components/SortableCategoryCard.tsx
```typescript
'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconHandGrab,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
} from '../constants';
import { sortGroups, sortTags } from '../utils';
import { SortableGroupCard } from './SortableGroupCard';
import { SortableTagItem } from './SortableTagItem';

export type SortableCategoryCardProps = {
  category: TagCategoryView;
  isAnyMutationPending: boolean;
  reorderCategoriesPending: boolean;
  deleteCategoryPending: boolean;
  deleteGroupPending: boolean;
  deleteTagPending: boolean;
  reorderGroupsPending: boolean;
  reorderTagsPending: boolean;
  onEditCategory: (category: TagCategoryView) => void;
  onDeleteCategory: (id: string) => void;
  onOpenCreateGroup: (categoryId: string) => void;
  onOpenCreateTag: (categoryId: string, groupId?: string) => void;
  onEditGroup: (category: TagCategoryView, group: TagGroupView) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
  onTagContextAction?: (action: string, tag?: TagView) => void;
  onReorderGroups: (categoryId: string, groups: TagGroupView[]) => void;
  onReorderTags: (groupId: string, tags: TagView[]) => void;
};

/**
 * ドラッグ可能なカテゴリカードコンポーネント
 * 内部にグループとタグのDnDコンテキストを持つ
 */
export function SortableCategoryCard({
  category,
  isAnyMutationPending,
  reorderCategoriesPending,
  deleteCategoryPending,
  deleteGroupPending,
  deleteTagPending,
  reorderGroupsPending,
  reorderTagsPending,
  onEditCategory,
  onDeleteCategory,
  onOpenCreateGroup,
  onOpenCreateTag,
  onEditGroup,
  onDeleteGroup,
  onEditTag,
  onDeleteTag,
  onTagContextAction,
  onReorderGroups,
  onReorderTags,
}: SortableCategoryCardProps) {
  const sortedGroups = useMemo(() => sortGroups(category.groups), [category.groups]);
  const [groupsOpened, { toggle: toggleGroups }] = useDisclosure(false);
  const [tagsOpened, { toggle: toggleTags }] = useDisclosure(false);
  const [groupOrder, setGroupOrder] = useState(sortedGroups);
  const [tagOrders, setTagOrders] = useState<Record<string, TagView[]>>(() =>
    Object.fromEntries(sortedGroups.map((group) => [group.id, sortTags(group.tags)])),
  );

  useEffect(() => {
    setGroupOrder(sortedGroups);
    setTagOrders(Object.fromEntries(sortedGroups.map((group) => [group.id, sortTags(group.tags)])));
  }, [sortedGroups]);

  const totalTags = useMemo(
    () =>
      groupOrder.reduce((sum, group) => {
        const tags = tagOrders[group.id] ?? sortTags(group.tags);
        return sum + tags.length;
      }, 0),
    [groupOrder, tagOrders],
  );

  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: { type: 'category' },
    disabled: reorderCategoriesPending,
  });

  const colorHex = category.color ?? DEFAULT_CATEGORY_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    borderColor: colorHex,
    borderWidth: 2,
    backgroundColor: `${colorHex}14`,
  };

  const nestedSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGroupDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || reorderGroupsPending) {
      return;
    }

    const oldIndex = groupOrder.findIndex((group) => group.id === active.id);
    const newIndex = groupOrder.findIndex((group) => group.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(groupOrder, oldIndex, newIndex);
    setGroupOrder(reordered);
    void onReorderGroups(category.id, reordered);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      withBorder
      padding="lg"
      radius="md"
      shadow="sm"
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Group gap="sm" align="center" wrap="wrap">
            <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
              <ActionIcon
                variant="light"
                aria-label="カテゴリを並べ替え"
                ref={setActivatorNodeRef}
                disabled={reorderCategoriesPending}
                {...listeners}
                {...attributes}
              >
                <IconHandGrab size={16} />
              </ActionIcon>
            </Tooltip>
            <Text fw={600} size="lg" style={{ color: category.textColor ?? DEFAULT_CATEGORY_TEXT_COLOR }}>
              {category.name}
            </Text>
            {!category.isActive && (
              <Badge color="gray" variant="outline" size="sm">
                非アクティブ
              </Badge>
            )}
            <Group gap={6} wrap="wrap">
              {category.scopes.length > 0 ? (
                category.scopes.map((scope) => (
                  <Badge key={scope} variant="dot">
                    {scope}
                  </Badge>
                ))
              ) : (
                <Badge variant="dot" color="gray">
                  スコープ未設定
                </Badge>
              )}
            </Group>
          </Group>
          <Group gap={6} align="center">
            <ActionIcon
              variant="light"
              aria-label="カテゴリを編集"
              onClick={() => onEditCategory(category)}
              disabled={isAnyMutationPending}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              aria-label="カテゴリを削除"
              onClick={() => void onDeleteCategory(category.id)}
              disabled={deleteCategoryPending}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Group gap="md" align="center" wrap="wrap" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
              {category.description || '説明が設定されていません'}
            </Text>
          </Group>
          <Group gap="md" align="center" wrap="wrap">
            <Group gap={4} align="center">
              <Button
                variant="subtle"
                size="xs"
                rightSection={
                  <IconChevronDown
                    size={12}
                    style={{ transform: groupsOpened ? 'rotate(180deg)' : undefined, transition: 'transform 120ms ease' }}
                  />
                }
                onClick={toggleGroups}
              >
                グループ {groupOrder.length}
              </Button>
              <Tooltip label="グループを追加" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onOpenCreateGroup(category.id)}
                  disabled={isAnyMutationPending}
                  aria-label="グループを追加"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Group gap={4} align="center">
              <Button
                variant="subtle"
                size="xs"
                rightSection={
                  <IconChevronDown
                    size={12}
                    style={{ transform: tagsOpened ? 'rotate(180deg)' : undefined, transition: 'transform 120ms ease' }}
                  />
                }
                onClick={toggleTags}
              >
                タグ {totalTags}
              </Button>
              <Tooltip label="タグを追加" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onOpenCreateTag(category.id)}
                  disabled={isAnyMutationPending}
                  aria-label="タグを追加"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Group>

        <Collapse in={groupsOpened}>
          <Stack gap="sm" mt="sm">
            {groupOrder.length === 0 ? (
              <Text size="sm" c="dimmed">
                このカテゴリにはまだタググループがありません。
              </Text>
            ) : (
              <DndContext
                sensors={nestedSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGroupDragEnd}
              >
                <SortableContext items={groupOrder.map((group) => group.id)} strategy={rectSortingStrategy}>
                  <Stack gap="sm">
                    {groupOrder.map((group, groupIndex) => {
                      const tags = tagOrders[group.id] ?? sortTags(group.tags);
                      return (
                        <SortableGroupCard
                          key={group.id}
                          category={category}
                          group={group}
                          index={groupIndex}
                          tags={tags}
                          reorderGroupsPending={reorderGroupsPending}
                          deleteGroupPending={deleteGroupPending}
                          isAnyMutationPending={isAnyMutationPending}
                          onOpenCreateTag={onOpenCreateTag}
                          onEditGroup={onEditGroup}
                          onDeleteGroup={onDeleteGroup}
                        />
                      );
                    })}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Stack>
        </Collapse>

        <Collapse in={tagsOpened}>
          <Stack gap="md" mt="sm">
            {totalTags === 0 ? (
              <Text size="sm" c="dimmed">
                このカテゴリにはまだタグがありません。
              </Text>
            ) : (
              groupOrder.map((group) => {
                const tags = tagOrders[group.id] ?? sortTags(group.tags);
                return (
                  <Stack key={group.id} gap="xs">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs" align="center" wrap="wrap">
                        <Badge variant="light" color="gray">
                          {group.name}
                        </Badge>
                        <Badge size="xs" variant="outline">
                          タグ {tags.length}
                        </Badge>
                      </Group>
                      <Tooltip label="このグループにタグを追加" withArrow withinPortal>
                        <ActionIcon
                          variant="light"
                          size="sm"
                          onClick={() => onOpenCreateTag(category.id, group.id)}
                          disabled={isAnyMutationPending}
                          aria-label="タグを追加"
                        >
                          <IconPlus size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    {tags.length === 0 ? (
                      <Text size="xs" c="dimmed" pl="md">
                        このグループにはまだタグがありません。
                      </Text>
                    ) : (
                      <DndContext
                        sensors={nestedSensors}
                        collisionDetection={closestCenter}
                        onDragEnd={({ active, over }) => {
                          if (!over || active.id === over.id || reorderTagsPending) {
                            return;
                          }
                          const currentTags = tagOrders[group.id] ?? tags;
                          const oldIndex = currentTags.findIndex((item) => item.id === active.id);
                          const newIndex = currentTags.findIndex((item) => item.id === over.id);
                          if (oldIndex === -1 || newIndex === -1) {
                            return;
                          }
                          const reordered = arrayMove(currentTags, oldIndex, newIndex);
                          setTagOrders((prev) => ({ ...prev, [group.id]: reordered }));
                          void onReorderTags(group.id, reordered);
                        }}
                      >
                        <SortableContext
                          items={(tagOrders[group.id] ?? tags).map((tag) => tag.id)}
                          strategy={rectSortingStrategy}
                        >
                          <Stack gap="xs">
                            {(tagOrders[group.id] ?? tags).map((tag, tagIndex) => (
                              <SortableTagItem
                                key={tag.id}
                                category={category}
                                group={group}
                                tag={tag}
                                index={tagIndex}
                                reorderTagsPending={reorderTagsPending}
                                deleteTagPending={deleteTagPending}
                                isAnyMutationPending={isAnyMutationPending}
                                onEditTag={onEditTag}
                                onDeleteTag={onDeleteTag}
                                onContextAction={onTagContextAction}
                              />
                            ))}
                          </Stack>
                        </SortableContext>
                      </DndContext>
                    )}
                  </Stack>
                );
              })
            )}
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}
```

## File: frontend/src/app/tags/components/SortableGroupCard.tsx
```typescript
'use client';

import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconHandGrab, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import {
  DEFAULT_GROUP_COLOR,
  DEFAULT_GROUP_TEXT_COLOR,
} from '../constants';

export type SortableGroupCardProps = {
  category: TagCategoryView;
  group: TagGroupView;
  index: number;
  tags: TagView[];
  reorderGroupsPending: boolean;
  deleteGroupPending: boolean;
  isAnyMutationPending: boolean;
  onOpenCreateTag: (categoryId: string, groupId: string) => void;
  onEditGroup: (category: TagCategoryView, group: TagGroupView) => void;
  onDeleteGroup: (groupId: string) => void;
};

/**
 * ドラッグ可能なタググループカードコンポーネント
 */
export function SortableGroupCard({
  category,
  group,
  index,
  tags,
  reorderGroupsPending,
  deleteGroupPending,
  isAnyMutationPending,
  onOpenCreateTag,
  onEditGroup,
  onDeleteGroup,
}: SortableGroupCardProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: 'group', categoryId: category.id },
    disabled: reorderGroupsPending,
  });

  const groupColor = group.color ?? DEFAULT_GROUP_COLOR;
  const groupTextColor = group.textColor ?? DEFAULT_GROUP_TEXT_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    borderColor: groupColor,
    borderWidth: 2,
    backgroundColor: `${groupColor}14`,
  };

  return (
    <Card ref={setNodeRef} style={style} withBorder radius="sm" padding="md" shadow="xs">
      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs" align="center" wrap="wrap">
            <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
              <ActionIcon
                variant="light"
                aria-label="タググループを並べ替え"
                ref={setActivatorNodeRef}
                disabled={reorderGroupsPending}
                {...listeners}
                {...attributes}
              >
                <IconHandGrab size={14} />
              </ActionIcon>
            </Tooltip>
            <Badge color="gray" variant="light" size="sm">
              {index + 1}
            </Badge>
            <Text fw={600} style={{ color: groupTextColor }}>
              {group.name}
            </Text>
            {!group.isActive && (
              <Badge size="xs" color="gray" variant="outline">
                非アクティブ
              </Badge>
            )}
            <Badge size="xs" variant="outline">
              タグ {tags.length}
            </Badge>
          </Group>
          {group.description && (
            <Text size="xs" c="dimmed">
              {group.description}
            </Text>
          )}
        </Stack>
        <Group gap={6} align="center" wrap="wrap">
          <Tooltip label="このグループにタグを追加" withArrow withinPortal>
            <ActionIcon
              variant="light"
              size="sm"
              onClick={() => onOpenCreateTag(category.id, group.id)}
              disabled={isAnyMutationPending}
              aria-label="タグを追加"
            >
              <IconPlus size={14} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon
            variant="light"
            aria-label="グループを編集"
            onClick={() => onEditGroup(category, group)}
            disabled={isAnyMutationPending}
          >
            <IconPencil size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            aria-label="グループを削除"
            onClick={() => void onDeleteGroup(group.id)}
            disabled={deleteGroupPending}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
```

## File: frontend/src/app/tags/components/SortableTagItem.tsx
```typescript
'use client';

import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconHandGrab, IconPencil, IconTrash } from '@tabler/icons-react';

import { ContextMenuProvider } from '@/components/context-menu/context-menu';
import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
} from '../constants';
import { AutomationIndicator } from './AutomationIndicator';

export type SortableTagItemProps = {
  category: TagCategoryView;
  group: TagGroupView;
  tag: TagView;
  index: number;
  reorderTagsPending: boolean;
  deleteTagPending: boolean;
  isAnyMutationPending: boolean;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
  onContextAction?: (action: string, tag?: TagView) => void;
};

/**
 * ドラッグ可能なタグアイテムコンポーネント
 */
export function SortableTagItem({
  category,
  group,
  tag,
  index,
  reorderTagsPending,
  deleteTagPending,
  isAnyMutationPending,
  onEditTag,
  onDeleteTag,
  onContextAction,
}: SortableTagItemProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tag.id,
    data: { type: 'tag', groupId: group.id },
    disabled: reorderTagsPending,
  });

  const tagColor = tag.color ?? DEFAULT_TAG_COLOR;
  const tagTextColor = tag.textColor ?? DEFAULT_TAG_TEXT_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    borderColor: tagColor,
    borderWidth: 2,
    backgroundColor: `${tagColor}14`,
  };

  return (
    <ContextMenuProvider
      entity={tag}
      entityType="タグ"
      actions={['edit', 'delete']}
      onAction={onContextAction}
    >
      <Card 
        ref={setNodeRef} 
        style={{ 
          ...style, 
          cursor: 'pointer',
        }} 
        withBorder 
        radius="sm" 
        padding="sm"
        title="右クリックまたはダブルクリックで操作"
      >
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="xs" align="center" wrap="wrap">
              <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  aria-label="タグを並べ替え"
                  ref={setActivatorNodeRef}
                  disabled={reorderTagsPending}
                  {...attributes}
                  {...listeners}
                >
                  <IconHandGrab size={14} />
                </ActionIcon>
              </Tooltip>
              <Badge color="gray" variant="light" size="sm">
                {index + 1}
              </Badge>
              <Text fw={600} size="sm" style={{ color: tagTextColor }}>
                {tag.name}
              </Text>
              {!tag.isActive && (
                <Badge size="xs" color="gray" variant="outline">
                  非アクティブ
                </Badge>
              )}
              <Badge size="xs" variant="outline">
                使用 {tag.usageCount.toLocaleString()}回
              </Badge>
              <AutomationIndicator tag={tag} />
            </Group>
            {tag.description && (
              <Text size="xs" c="dimmed">
                {tag.description}
              </Text>
            )}
            <Group gap="xs" wrap="wrap">
              <Badge size="xs" variant="outline">
                手動 {tag.allowsManual ? '可' : '不可'}
              </Badge>
              <Badge size="xs" variant="outline">
                自動 {tag.allowsAutomation ? '可' : '不可'}
              </Badge>
              <Badge size="xs" variant="outline">
                {group.name}
              </Badge>
              <Badge
                size="xs"
                variant="light"
                style={{
                  backgroundColor: `${(category.color ?? DEFAULT_CATEGORY_COLOR)}1A`,
                  color: category.color ?? DEFAULT_CATEGORY_COLOR,
                }}
              >
                {category.name}
              </Badge>
            </Group>
          </Stack>
          <Group gap={4} align="center" wrap="wrap">
            <ActionIcon
              variant="light"
              aria-label="タグを編集"
              onClick={() => onEditTag(category, group, tag)}
              disabled={isAnyMutationPending}
            >
              <IconPencil size={14} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              aria-label="タグを削除"
              onClick={() => onDeleteTag(tag.id)}
              disabled={deleteTagPending || isAnyMutationPending}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>
    </ContextMenuProvider>
  );
}
```

## File: frontend/src/app/tags/components/TagsListTab.tsx
```typescript
'use client';

import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import { DEFAULT_CATEGORY_COLOR } from '../constants';
import { AutomationIndicator } from './AutomationIndicator';

export type FlatTag = {
  category: TagCategoryView;
  group: TagGroupView;
  tag: TagView;
};

export type TagsListTabProps = {
  isLoading: boolean;
  flatTags: FlatTag[];
  isAnyMutationPending: boolean;
  deleteTagPending: boolean;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
};

/**
 * タグ一覧タブコンポーネント
 * フラットなリスト形式でタグを表示
 */
export function TagsListTab({
  isLoading,
  flatTags,
  isAnyMutationPending,
  deleteTagPending,
  onEditTag,
  onDeleteTag,
}: TagsListTabProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (flatTags.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">表示できるタグがありません。</Text>
      </Center>
    );
  }

  return (
    <Stack gap="sm">
      {flatTags.map(({ category, group, tag }) => (
        <Card key={tag.id} withBorder radius="md" padding="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Group gap="xs" align="center">
                <Badge
                  variant="light"
                  style={{
                    backgroundColor: `${(category.color ?? DEFAULT_CATEGORY_COLOR)}1A`,
                    color: category.color ?? DEFAULT_CATEGORY_COLOR,
                  }}
                >
                  {category.name}
                </Badge>
                <Badge variant="light" color="gray">
                  {group.name}
                </Badge>
                <Text fw={500}>{tag.name}</Text>
                {!tag.isActive && (
                  <Badge size="xs" color="gray" variant="outline">
                    非アクティブ
                  </Badge>
                )}
                <AutomationIndicator tag={tag} />
              </Group>
              <Group gap="xs">
                <Badge size="xs" variant="outline">
                  使用 {tag.usageCount.toLocaleString()}回
                </Badge>
                <Badge size="xs" variant="outline">
                  手動 {tag.allowsManual ? '可' : '不可'}
                </Badge>
                <Badge size="xs" variant="outline">
                  自動 {tag.allowsAutomation ? '可' : '不可'}
                </Badge>
              </Group>
              {tag.description && (
                <Text size="sm" c="dimmed">
                  {tag.description}
                </Text>
              )}
            </Stack>
            <Group gap={6}>
              <Button
                size="xs"
                variant="light"
                onClick={() => onEditTag(category, group, tag)}
                disabled={isAnyMutationPending}
              >
                編集
              </Button>
              <Button 
                size="xs" 
                color="red" 
                variant="light" 
                onClick={() => void onDeleteTag(tag.id)} 
                disabled={deleteTagPending}
              >
                削除
              </Button>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
```

## File: frontend/src/app/tags/hooks/index.ts
```typescript
/**
 * タグ管理ページのカスタムフック群
 */

export { useTagPageData } from './useTagPageData';
export { useAutomationRulesData } from './useAutomationRulesData';
```

## File: frontend/src/app/tags/hooks/useAutomationRulesData.ts
```typescript
'use client';

import { useMemo } from 'react';

import {
  useGetAutomationRules,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
  useExecuteAutomationRule,
} from '@/lib/api/hooks/use-tag-automation';

/**
 * 自動化ルールのデータ取得・ミューテーション用フック
 */
export function useAutomationRulesData() {
  // データ取得
  const { data: automationRulesData, isLoading: isLoadingAutomationRules } = useGetAutomationRules();

  // ルールリストを整形
  const automationRules = useMemo(() => automationRulesData?.data ?? [], [automationRulesData]);

  // ミューテーション
  const createAutomationRule = useCreateAutomationRule();
  const updateAutomationRule = useUpdateAutomationRule();
  const deleteAutomationRule = useDeleteAutomationRule();
  const executeAutomationRule = useExecuteAutomationRule();

  return {
    // データ
    isLoadingAutomationRules,
    automationRules,
    // ミューテーション
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    executeAutomationRule,
  };
}
```

## File: frontend/src/app/tags/hooks/useTagPageData.ts
```typescript
'use client';

import { useMemo, useState } from 'react';

import {
  useGetTagCategories,
  useCreateTagCategory,
  useUpdateTagCategory,
  useDeleteTagCategory,
  useReorderTagCategories,
  useCreateTagGroup,
  useUpdateTagGroup,
  useDeleteTagGroup,
  useReorderTagGroups,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useReorderTags,
  type TagCategoryFilters,
} from '@/lib/api/hooks/use-tags';
import {
  useGetTagColorDefaults,
  useUpdateTagColorDefaults,
} from '@/lib/api/hooks/use-tenant-settings';

import type { TagFiltersState } from '../types';
import { sortCategories, sortGroups, sortTags } from '../utils';

/**
 * タグページのデータ取得・ミューテーション用フック
 */
export function useTagPageData() {
  // フィルタ状態
  const [filters, setFilters] = useState<TagFiltersState>({
    scopes: [],
    includeInactive: false,
  });

  // クエリフィルタを構築
  const queryFilters = useMemo<TagCategoryFilters | undefined>(() => {
    const payload: TagCategoryFilters = {};
    if (filters.scopes.length) {
      payload.scope = filters.scopes;
    }
    if (filters.includeInactive) {
      payload.includeInactive = true;
    }
    return Object.keys(payload).length ? payload : undefined;
  }, [filters]);

  // データ取得
  const { data, isLoading, isFetching } = useGetTagCategories(queryFilters, {
    placeholderData: (previousData) => previousData,
  });

  // カテゴリデータを整形
  const categories = useMemo(() => data?.data ?? [], [data]);
  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

  // 利用可能なスコープを抽出
  const availableScopes = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((category) => {
      category.scopes.forEach((scope) => {
        if (scope) {
          set.add(scope);
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [categories]);

  // フラットなタグリストを生成
  const flatTags = useMemo(() => {
    return sortedCategories.flatMap((category) =>
      sortGroups(category.groups).flatMap((group) =>
        sortTags(group.tags).map((tag) => ({ category, group, tag })),
      ),
    );
  }, [sortedCategories]);

  // ミューテーション
  const createCategory = useCreateTagCategory();
  const updateCategory = useUpdateTagCategory();
  const deleteCategory = useDeleteTagCategory();
  const reorderCategoriesMutation = useReorderTagCategories();
  const createGroup = useCreateTagGroup();
  const updateGroup = useUpdateTagGroup();
  const deleteGroup = useDeleteTagGroup();
  const reorderGroupsMutation = useReorderTagGroups();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const reorderTagsMutation = useReorderTags();

  // テナントのデフォルトカラー設定
  const { data: colorDefaults } = useGetTagColorDefaults();
  const updateTagColorDefaults = useUpdateTagColorDefaults();

  // ミューテーション状態
  const isCategorySubmitting = createCategory.isPending || updateCategory.isPending;
  const isGroupSubmitting = createGroup.isPending || updateGroup.isPending;
  const isTagSubmitting = createTag.isPending || updateTag.isPending;
  const isAnyMutationPending =
    isCategorySubmitting ||
    isGroupSubmitting ||
    isTagSubmitting ||
    deleteCategory.isPending ||
    deleteGroup.isPending ||
    deleteTag.isPending ||
    reorderCategoriesMutation.isPending ||
    reorderGroupsMutation.isPending ||
    reorderTagsMutation.isPending;

  return {
    // フィルタ
    filters,
    setFilters,
    // データ
    isLoading,
    isFetching,
    categories,
    sortedCategories,
    availableScopes,
    flatTags,
    // カテゴリ操作
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategoriesMutation,
    // グループ操作
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroupsMutation,
    // タグ操作
    createTag,
    updateTag,
    deleteTag,
    reorderTagsMutation,
    // デフォルトカラー
    colorDefaults,
    updateTagColorDefaults,
    // ミューテーション状態
    isCategorySubmitting,
    isGroupSubmitting,
    isTagSubmitting,
    isAnyMutationPending,
  };
}
```

## File: frontend/src/app/tags/constants.ts
```typescript
/**
 * タグ管理ページで使用する定数
 */

// プリセットカラー
export const PRESET_COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f39c12',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#95a5a6',
];

// デフォルトカラー
export const DEFAULT_CATEGORY_COLOR = '#6366F1';
export const DEFAULT_CATEGORY_TEXT_COLOR = '#111827';
export const DEFAULT_GROUP_COLOR = '#3B82F6';
export const DEFAULT_GROUP_TEXT_COLOR = '#111827';
export const DEFAULT_TAG_COLOR = '#3B82F6';
export const DEFAULT_TAG_TEXT_COLOR = '#FFFFFF';

// カテゴリのスコープ選択肢（アプリ定義）
export const CATEGORY_SCOPE_OPTIONS = [
  { value: 'global', label: '全てのページ' },
  { value: 'cats', label: '猫一覧' },
  { value: 'cats-detail', label: '猫詳細' },
  { value: 'breeding', label: '交配管理' },
  { value: 'kittens', label: '子猫管理' },
  { value: 'care', label: 'ケアスケジュール' },
  { value: 'pedigrees', label: '血統書データ' },
  { value: 'medical-records', label: '医療データ' },
  { value: 'gallery', label: 'ギャラリー' },
  { value: 'tags', label: 'タグ管理' },
  { value: 'staff-shifts', label: 'スタッフシフト' },
  { value: 'settings', label: '設定' },
  { value: 'tenants', label: 'ユーザー設定' },
];

// ルールタイプオプション（シンプル化されたUI用）
export const RULE_TYPE_OPTIONS = [
  { value: 'PAGE_ACTION', label: 'イベント発生時' },
  { value: 'AGE_THRESHOLD', label: '年齢条件に達した時' },
  { value: 'TAG_ASSIGNED', label: '特定タグが付与された時' },
];

// アクションタイプオプション
export const ACTION_TYPE_OPTIONS = [
  { value: 'ASSIGN', label: 'タグを付与する' },
  { value: 'REMOVE', label: 'タグを削除する' },
];

// 年齢タイプオプション
export const AGE_TYPE_OPTIONS = [
  { value: 'days', label: '子猫（日数で指定）' },
  { value: 'months', label: '成猫（月数で指定）' },
];

// トリガータイプオプション（内部用・互換性維持）
export const TRIGGER_TYPE_OPTIONS = [
  { value: 'EVENT', label: 'イベント駆動' },
  { value: 'SCHEDULE', label: 'スケジュール' },
];

// イベントタイプオプション（内部用・互換性維持）
export const EVENT_TYPE_OPTIONS = [
  { value: 'BREEDING_PLANNED', label: '交配予定' },
  { value: 'BREEDING_CONFIRMED', label: '交配確認' },
  { value: 'PREGNANCY_CONFIRMED', label: '妊娠確認' },
  { value: 'KITTEN_REGISTERED', label: '子猫登録' },
  { value: 'AGE_THRESHOLD', label: '年齢閾値' },
  { value: 'PAGE_ACTION', label: 'ページ・アクション駆動' },
  { value: 'TAG_ASSIGNED', label: 'タグ付与時' },
  { value: 'CUSTOM', label: 'カスタム' },
];

// 自動化ルールで使用可能なスコープのデフォルトリスト（互換性維持）
export const AUTOMATION_SCOPE_OPTIONS = [
  { value: 'cats', label: '猫管理' },
  { value: 'breeding', label: '交配管理' },
  { value: 'health', label: '健康管理' },
  { value: 'care', label: 'ケア記録' },
  { value: 'pedigree', label: '血統管理' },
];

// PAGE_ACTIONで選択可能なページ（実際のナビゲーション構造に基づく）
export const PAGE_OPTIONS = [
  { value: 'cats', label: '猫一覧', href: '/cats' },
  { value: 'cats-new', label: '新規猫登録', href: '/cats/new' },
  { value: 'cats-detail', label: '猫詳細', href: '/cats/[id]' },
  { value: 'breeding', label: '交配管理', href: '/breeding' },
  { value: 'kittens', label: '子猫管理', href: '/kittens' },
  { value: 'care', label: 'ケアスケジュール', href: '/care' },
  { value: 'pedigrees', label: '血統書データ', href: '/pedigrees' },
  { value: 'medical-records', label: '医療データ', href: '/medical-records' },
  { value: 'gallery', label: 'ギャラリー', href: '/gallery' },
  { value: 'tags', label: 'タグ管理', href: '/tags' },
  { value: 'staff-shifts', label: 'スタッフシフト', href: '/staff/shifts' },
];

// ページごとに利用可能なアクション
export const PAGE_ACTIONS_MAP: Record<string, Array<{ value: string; label: string; description?: string }>> = {
  'cats': [
    { value: 'view', label: '一覧表示', description: '猫一覧ページが表示された時' },
    { value: 'filter', label: 'フィルタ適用', description: '検索・フィルタが適用された時' },
    { value: 'sort', label: 'ソート変更', description: '並び順が変更された時' },
  ],
  'cats-new': [
    { value: 'create', label: '新規登録', description: '新しい猫が登録された時' },
    { value: 'create_success', label: '登録成功', description: '猫の登録が成功した時' },
  ],
  'cats-detail': [
    { value: 'view', label: '詳細表示', description: '猫の詳細が表示された時' },
    { value: 'update', label: '情報更新', description: '猫の情報が更新された時' },
    { value: 'delete', label: '削除', description: '猫が削除された時' },
    { value: 'tag_added', label: 'タグ追加', description: '猫にタグが追加された時' },
    { value: 'tag_removed', label: 'タグ削除', description: '猫からタグが削除された時' },
  ],
  'breeding': [
    { value: 'create', label: '交配予定登録', description: '新しい交配予定が登録された時' },
    { value: 'update', label: '交配情報更新', description: '交配情報が更新された時' },
    { value: 'confirm', label: '交配確認', description: '交配が確認された時' },
    { value: 'pregnancy_confirmed', label: '妊娠確認', description: '妊娠が確認された時' },
    { value: 'cancel', label: 'キャンセル', description: '交配予定がキャンセルされた時' },
  ],
  'kittens': [
    { value: 'register', label: '子猫登録', description: '新しい子猫が登録された時' },
    { value: 'update', label: '子猫情報更新', description: '子猫の情報が更新された時' },
    { value: 'graduate', label: '卒業処理', description: '子猫が卒業した時' },
    { value: 'health_check', label: '健康チェック', description: '健康チェックが記録された時' },
  ],
  'care': [
    { value: 'create', label: 'ケア予定登録', description: '新しいケア予定が登録された時' },
    { value: 'complete', label: 'ケア完了', description: 'ケアが完了した時' },
    { value: 'update', label: 'ケア情報更新', description: 'ケア情報が更新された時' },
    { value: 'cancel', label: 'キャンセル', description: 'ケア予定がキャンセルされた時' },
  ],
  'pedigrees': [
    { value: 'create', label: '血統書作成', description: '新しい血統書が作成された時' },
    { value: 'update', label: '血統書更新', description: '血統書が更新された時' },
    { value: 'export', label: 'エクスポート', description: '血統書がエクスポートされた時' },
  ],
  'medical-records': [
    { value: 'create', label: '医療記録登録', description: '新しい医療記録が登録された時' },
    { value: 'update', label: '医療記録更新', description: '医療記録が更新された時' },
    { value: 'delete', label: '医療記録削除', description: '医療記録が削除された時' },
  ],
  'gallery': [
    { value: 'upload', label: '画像アップロード', description: '新しい画像がアップロードされた時' },
    { value: 'delete', label: '画像削除', description: '画像が削除された時' },
  ],
  'tags': [
    { value: 'create', label: 'タグ作成', description: '新しいタグが作成された時' },
    { value: 'update', label: 'タグ更新', description: 'タグが更新された時' },
    { value: 'delete', label: 'タグ削除', description: 'タグが削除された時' },
  ],
  'staff-shifts': [
    { value: 'create', label: 'シフト登録', description: '新しいシフトが登録された時' },
    { value: 'update', label: 'シフト更新', description: 'シフトが更新された時' },
    { value: 'delete', label: 'シフト削除', description: 'シフトが削除された時' },
  ],
};

// 対象猫の選択方法
export const TARGET_SELECTION_OPTIONS = [
  { value: 'event_target', label: 'イベント対象の猫' },
  { value: 'specific_cats', label: '特定の猫' },
  { value: 'all_cats', label: '全ての猫' },
];
```

## File: frontend/src/app/tags/types.ts
```typescript
/**
 * タグ管理ページで使用する型定義
 */

import type {
  TagAutomationTriggerType,
  TagAutomationEventType,
} from '@/lib/api/hooks/use-tag-automation';

// カテゴリフォームの値
export type CategoryFormValues = {
  key: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  scopes: string[];
  isActive: boolean;
};

// タグフォームの値
export type TagFormValues = {
  categoryId: string;
  name: string;
  groupId: string;
  description: string;
  color: string;
  textColor: string;
  allowsManual: boolean;
  allowsAutomation: boolean;
  isActive: boolean;
};

// グループフォームの値
export type GroupFormValues = {
  categoryId: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  isActive: boolean;
};

// ルールタイプ（シンプル化されたUI用）
export type RuleType = 'PAGE_ACTION' | 'AGE_THRESHOLD' | 'TAG_ASSIGNED';

// アクションタイプ
export type ActionType = 'ASSIGN' | 'REMOVE';

// 自動化ルールフォームの値（シンプル化版）
export type AutomationRuleFormValues = {
  // UI用のルールタイプ
  ruleType: RuleType;
  // アクション（付与/削除）
  actionType: ActionType;
  // 対象タグ
  tagIds: string[];
  // ルール名（任意、未入力なら自動生成）
  name: string;
  // メモ
  description: string;
  // アクティブ状態
  isActive: boolean;
  // PAGE_ACTION設定
  pageAction: {
    page: string;
    action: string;
  };
  // 年齢閾値設定
  ageThreshold: {
    ageType: 'days' | 'months';
    threshold: number;
  };
  // TAG_ASSIGNED設定（特定タグ付与時の削除トリガー）
  triggerTagId: string;
  // 内部用（バックエンドとの互換性維持）
  key?: string;
  triggerType?: TagAutomationTriggerType;
  eventType?: TagAutomationEventType | '';
  scope?: string;
  priority?: number;
};

// 自動化メタデータ
export type AutomationMeta = {
  ruleName?: string;
  reason?: string;
  source?: string;
  assignedAt?: string;
};

// フィルタ状態
export type TagFiltersState = {
  scopes: string[];
  includeInactive: boolean;
};
```

## File: frontend/src/app/tags/utils.ts
```typescript
/**
 * タグ管理ページで使用するユーティリティ関数
 */

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
  CreateTagCategoryRequest,
  CreateTagRequest,
} from '@/lib/api/hooks/use-tags';
import type { AutomationMeta, CategoryFormValues, TagFormValues } from './types';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
} from './constants';

/**
 * カテゴリを表示順でソート
 */
export function sortCategories(categories: TagCategoryView[]): TagCategoryView[] {
  return [...categories].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

/**
 * グループを表示順でソート
 */
export function sortGroups(groups?: TagGroupView[] | null): TagGroupView[] {
  return [...(groups ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

/**
 * タグを表示順でソート
 */
export function sortTags(tags?: TagView[] | null): TagView[] {
  return [...(tags ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

/**
 * タグから自動化メタデータを抽出
 */
export function extractAutomationMeta(tag: TagView): AutomationMeta | null {
  if (!tag.metadata || typeof tag.metadata !== 'object') {
    return null;
  }

  const metadata = tag.metadata as Record<string, unknown>;
  const automation = metadata.automation;

  if (!automation || typeof automation !== 'object') {
    return null;
  }

  const info = automation as Record<string, unknown>;

  const meta: AutomationMeta = {
    ruleName: typeof info.ruleName === 'string' ? info.ruleName : undefined,
    reason: typeof info.reason === 'string' ? info.reason : undefined,
    source: typeof info.source === 'string' ? info.source : undefined,
    assignedAt: typeof info.assignedAt === 'string' ? info.assignedAt : undefined,
  };

  return Object.values(meta).some(Boolean) ? meta : null;
}

/**
 * カテゴリフォームの値からAPIリクエストペイロードを構築
 */
export function buildCategoryPayload(values: CategoryFormValues): CreateTagCategoryRequest & {
  textColor?: string;
} {
  const payload: CreateTagCategoryRequest & { textColor?: string } = {
    name: values.name,
    ...(values.key ? { key: values.key } : {}),
    ...(values.description ? { description: values.description } : {}),
    color: values.color || DEFAULT_CATEGORY_COLOR,
    textColor: values.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
    ...(values.scopes.length ? { scopes: values.scopes } : { scopes: [] }),
    isActive: values.isActive,
  };
  return payload;
}

/**
 * タグフォームの値からAPIリクエストペイロードを構築
 */
export function buildTagPayload(values: TagFormValues): CreateTagRequest & {
  textColor?: string;
} {
  const payload: CreateTagRequest & { textColor?: string } = {
    name: values.name,
    groupId: values.groupId,
    ...(values.description ? { description: values.description } : {}),
    color: values.color || DEFAULT_TAG_COLOR,
    textColor: values.textColor || DEFAULT_TAG_TEXT_COLOR,
    allowsManual: values.allowsManual,
    allowsAutomation: values.allowsAutomation,
    isActive: values.isActive,
  };
  return payload;
}
```

## File: frontend/src/app/tenants/_components/BottomNavSettings.tsx
```typescript
'use client';

import { Card, Stack, Title, Text, Switch, Group, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useBottomNavSettings } from '@/lib/hooks/use-bottom-nav-settings';
import { bottomNavigationItems } from '@/components/AppLayout';
import { ActionButton } from '@/components/ActionButton';

/**
 * ボトムナビゲーション設定コンポーネント
 * 
 * 表示したい項目を選択してカスタマイズできます。
 * 設定はローカルストレージに保存されます。
 */
export function BottomNavSettings() {
  const {
    items,
    isLoading,
    hasChanges,
    toggleItem,
    showAll,
    hideAll,
    resetToDefault,
    saveSettings,
  } = useBottomNavSettings(bottomNavigationItems);

  const handleSave = () => {
    const success = saveSettings();
    if (success) {
      notifications.show({
        title: '保存しました',
        message: 'ボトムナビゲーションの設定を保存しました',
        color: 'green',
      });
    } else {
      notifications.show({
        title: '保存に失敗しました',
        message: '設定の保存中にエラーが発生しました',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text>読み込み中...</Text>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3}>ボトムナビゲーション設定</Title>
        <Text size="sm" c="dimmed">
          表示したい項目を選択してください。設定はこのデバイスに保存されます。
        </Text>

        <Divider />

        <Stack gap="xs">
          {items.map((item) => (
            <Group key={item.id} justify="space-between">
              <Text size="sm">{item.label}</Text>
              <Switch
                checked={item.visible}
                onChange={() => toggleItem(item.id)}
                size="sm"
              />
            </Group>
          ))}
        </Stack>

        <Divider />

        <Group gap="sm">
          <ActionButton action="view" onClick={showAll} isSectionAction>
            全て表示
          </ActionButton>
          <ActionButton action="cancel" onClick={hideAll} isSectionAction>
            全て非表示
          </ActionButton>
          <ActionButton action="delete" onClick={resetToDefault} isSectionAction>
            デフォルトに戻す
          </ActionButton>
        </Group>

        <Divider />

        <Group justify="flex-end">
          <ActionButton 
            action="save"
            onClick={handleSave} 
            disabled={!hasChanges}
            isSectionAction
          >
            {hasChanges ? '設定を保存' : '変更なし'}
          </ActionButton>
        </Group>
      </Stack>
    </Card>
  );
}
```

## File: frontend/src/app/tenants/_components/TenantsList.tsx
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Badge,
  Text,
  Card,
  Loader,
  Center,
  Alert,
  Stack,
  Group,
  Modal,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconPlus, IconUserPlus } from '@tabler/icons-react';
import { apiClient, apiRequest } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import { useAuth } from '@/lib/auth/store';
import { EditTenantModal } from './EditTenantModal';
import { ActionMenu } from './ActionMenu';
import { InviteTenantAdminModal } from './InviteTenantAdminModal';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTenantFormData {
  name: string;
  slug: string;
}

interface CreateTenantResponse {
  id: string;
  name: string;
  slug: string;
}

/**
 * テナント一覧テーブル
 * SUPER_ADMINはテナント作成機能も使用可能
 */
export function TenantsList() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // テナント作成モーダルの状態
  const [opened, { open, close }] = useDisclosure(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTenantFormData>({
    name: '',
    slug: '',
  });

  // 編集モーダルの状態
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  // 招待モーダルの状態
  const [inviteAdminOpened, { open: openInviteAdmin, close: closeInviteAdmin }] = useDisclosure(false);

  // 削除確認モーダルの状態
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // テナント一覧取得
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // SUPER_ADMIN のみアクセス可能
      const response = await apiClient.request('/tenants' as never, 'get');

      if (response.success && Array.isArray(response.data)) {
        setTenants(response.data as Tenant[]);
      } else {
        throw new Error(response.error || 'テナント情報の取得に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
    });
  };

  // モーダルを閉じる
  const handleClose = () => {
    if (!createLoading) {
      resetForm();
      close();
    }
  };

  // テナント作成処理
  const handleCreateTenant = async () => {
    // バリデーション
    if (!formData.name.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'テナント名を入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setCreateLoading(true);

      // POST /tenants でテナントを作成
      const requestBody: { name: string; slug?: string } = {
        name: formData.name.trim(),
      };
      if (formData.slug.trim()) {
        requestBody.slug = formData.slug.trim();
      }

      const response = await apiRequest<CreateTenantResponse>('/tenants', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (response.success && response.data) {
        notifications.show({
          title: '成功',
          message: 'テナントを作成しました',
          color: 'green',
        });
        handleClose();
        // 一覧を再取得
        fetchTenants();
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'テナントの作成に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // 編集ボタンがクリックされたときのハンドラ
  const handleEditClick = (tenant: Tenant) => {
    setEditingTenant(tenant);
    openEditModal();
  };

  // 編集成功時のハンドラ
  const handleEditSuccess = () => {
    fetchTenants();
  };

  // 削除ボタンがクリックされたときのハンドラ
  const handleDeleteClick = (tenant: Tenant) => {
    setDeletingTenant(tenant);
    openDeleteModal();
  };

  // 削除確認ダイアログを閉じる
  const handleDeleteModalClose = () => {
    if (!deleteLoading) {
      setDeletingTenant(null);
      closeDeleteModal();
    }
  };

  // テナント削除処理
  const handleDeleteTenant = async () => {
    if (!deletingTenant) return;

    try {
      setDeleteLoading(true);

      const response = await apiRequest(`/tenants/${deletingTenant.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'テナントを削除しました',
          color: 'green',
        });
        handleDeleteModalClose();
        // 一覧を再取得
        fetchTenants();
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'テナントの削除に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // アクションメニュー項目を生成
  const getActionItems = () => {
    if (!isSuperAdmin) return [];

    return [
      {
        id: 'create-tenant',
        label: '新規テナント作成',
        icon: <IconPlus size={16} />,
        onClick: open,
      },
      {
        id: 'invite-admin',
        label: 'テナント管理者を招待',
        icon: <IconUserPlus size={16} />,
        onClick: openInviteAdmin,
      },
    ];
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* SUPER_ADMIN のみアクションメニューを表示 */}
      {isSuperAdmin && (
        <Group justify="flex-end">
          <ActionMenu 
            items={getActionItems()} 
            buttonLabel="アクション" 
            isSectionAction
          />
        </Group>
      )}

      {tenants.length === 0 ? (
        <Card withBorder p="xl">
          <Center>
            <Text c="dimmed">テナントがありません</Text>
          </Center>
        </Card>
      ) : (
        <Card withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>テナント名</Table.Th>
                <Table.Th>スラッグ</Table.Th>
                <Table.Th>ステータス</Table.Th>
                <Table.Th>作成日</Table.Th>
                {isSuperAdmin && <Table.Th>操作</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tenants.map((tenant) => (
                <Table.Tr key={tenant.id}>
                  <Table.Td>
                    <Text fw={600}>{tenant.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c="dimmed" size="sm">
                      {tenant.slug}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={tenant.isActive ? 'green' : 'gray'} variant="light">
                      {tenant.isActive ? '有効' : '無効'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(tenant.createdAt).toLocaleDateString('ja-JP')}
                    </Text>
                  </Table.Td>
                  {isSuperAdmin && (
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIconButton
                          action="edit"
                          onClick={() => handleEditClick(tenant)}
                          title="編集"
                        />
                        <ActionIconButton
                          action="delete"
                          onClick={() => handleDeleteClick(tenant)}
                          title="削除"
                        />
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* テナント作成モーダル */}
      <Modal
        opened={opened}
        onClose={handleClose}
        title="新規テナント作成"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="テナント名"
            placeholder="サンプルテナント"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={createLoading}
          />

          <TextInput
            label="テナントスラッグ（オプション）"
            placeholder="sample-tenant"
            description="未入力の場合、テナント名から自動生成されます"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            disabled={createLoading}
          />

          <Group justify="flex-end" mt="md">
            <ActionButton action="cancel" onClick={handleClose} disabled={createLoading}>
              キャンセル
            </ActionButton>
            <ActionButton action="save" onClick={handleCreateTenant} loading={createLoading}>
              作成
            </ActionButton>
          </Group>
        </Stack>
      </Modal>

      {/* テナント編集モーダル */}
      <EditTenantModal
        tenant={editingTenant}
        opened={editModalOpened}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* テナント管理者招待モーダル */}
      <InviteTenantAdminModal
        opened={inviteAdminOpened}
        onClose={closeInviteAdmin}
      />

      {/* テナント削除確認モーダル */}
      <Modal
        opened={deleteModalOpened}
        onClose={handleDeleteModalClose}
        title="テナント削除の確認"
        size="md"
      >
        <Stack gap="md">
          <Text>
            以下のテナントを削除しますか？この操作は取り消せません。
          </Text>
          <Text fw={600} size="lg">
            {deletingTenant?.name}
          </Text>
          <Text size="sm" c="dimmed">
            ※所属ユーザーがいる場合は削除できません。
          </Text>
          <Group justify="flex-end" mt="md">
            <ActionButton action="cancel" onClick={handleDeleteModalClose} disabled={deleteLoading}>
              キャンセル
            </ActionButton>
            <ActionButton action="delete" onClick={handleDeleteTenant} loading={deleteLoading}>
              削除
            </ActionButton>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
```

## File: frontend/src/app/tenants/page.tsx
```typescript
import { TenantsManagement } from './_components/TenantsManagement';

/**
 * テナント管理ページ
 * 
 * SUPER_ADMIN: テナント管理者招待機能
 * TENANT_ADMIN: 自テナント内ユーザー招待機能
 * 共通: テナント一覧表示、ユーザー一覧表示
 */
export default function TenantsPage() {
  return <TenantsManagement />;
}
```

## File: frontend/src/app/staff/shifts/page.tsx
```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Text,
  Group,
  Stack,
  Button,
  Paper,
  TextInput,
  ColorInput,
  ScrollArea,
  LoadingOverlay,
  Alert,
  Badge,
  ActionIcon,
  Menu,
  Checkbox,
  NumberInput,
  Textarea,
  CopyButton,
  Tooltip,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useMediaQuery, useLocalStorage } from '@mantine/hooks';
import {
  IconPlus,
  IconUser,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconDeviceFloppy,
  IconX,
  IconAlertCircle,
  IconGripVertical,
  IconChevronDown,
  IconCalendarPlus,
  IconUsers,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ActionMenu } from '@/app/tenants/_components/ActionMenu';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable, EventReceiveArg } from '@fullcalendar/interaction';
import type { EventDropArg, EventClickArg, EventContentArg, DayCellContentArg } from '@fullcalendar/core';
import { UnifiedModal } from '@/components/common';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { apiClient, ApiError } from '@/lib/api/typesafe-client';
import type {
  StaffResponseDto,
  CreateStaffRequest,
  UpdateStaffRequest,
  CalendarShiftEvent,
  Weekday,
  WorkTimeTemplate,
} from '@/types/api.types';

/**
 * 共通バリデーション関数
 */
const validateName = (value: string | undefined): string | null => {
  return !value ? '名前は必須です' : null;
};

const validateColor = (value: string | undefined): string | null => {
  if (!value) return 'カラーは必須です';
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return 'カラーコードは#000000形式で指定してください';
  }
  return null;
};

const validateWorkingDays = (value: Weekday[] | undefined): string | null => {
  return !value || value.length === 0 ? '少なくとも1つの出勤曜日を選択してください' : null;
};

const validateWorkTimeTemplate = (value: WorkTimeTemplate | undefined): string | null => {
  if (!value) return null;
  const { startHour, endHour } = value;
  // NumberInput は 0 を含む数値または NaN を返す可能性があるため、型チェックで検証
  if (
    typeof startHour !== 'number' ||
    typeof endHour !== 'number' ||
    Number.isNaN(startHour) ||
    Number.isNaN(endHour)
  ) {
    return '開始／終了時間を入力してください';
  }
  if (startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24) {
    return '開始時間は0〜23、終了時間は1〜24の範囲で指定してください';
  }
  if (endHour <= startHour) {
    return '終了時間は開始時間より後にしてください';
  }
  return null;
};

export default function StaffShiftsPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const { setPageHeader } = usePageHeader();
  useRouter();

  // レスポンシブ判定（タブレット以下: 768px未満）
  const isMobile = useMediaQuery('(max-width: 768px)');

  // リサイズ可能なセクション幅/高さ（localStorageに保存）
  const [staffListWidth, setStaffListWidth] = useLocalStorage<number>({
    key: 'shift-staff-list-width',
    defaultValue: 200,
  });
  const [textShiftHeight, setTextShiftHeight] = useLocalStorage<number>({
    key: 'shift-text-shift-height',
    defaultValue: 200,
  });

  // リサイズ状態管理
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  // 横幅リサイズ開始
  const handleWidthResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingWidth(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: staffListWidth,
      startHeight: textShiftHeight,
    };
  }, [staffListWidth, textShiftHeight]);

  // 高さリサイズ開始
  const handleHeightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingHeight(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: staffListWidth,
      startHeight: textShiftHeight,
    };
  }, [staffListWidth, textShiftHeight]);

  // リサイズ中の処理
  useEffect(() => {
    if (!isResizingWidth && !isResizingHeight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;

      if (isResizingWidth) {
        const diff = e.clientX - resizeRef.current.startX;
        const newWidth = Math.max(150, Math.min(400, resizeRef.current.startWidth + diff));
        setStaffListWidth(newWidth);
      }

      if (isResizingHeight) {
        const diff = resizeRef.current.startY - e.clientY;
        const newHeight = Math.max(100, Math.min(400, resizeRef.current.startHeight + diff));
        setTextShiftHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
      setIsResizingHeight(false);
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingWidth, isResizingHeight, setStaffListWidth, setTextShiftHeight]);

  // State管理
  const [staffList, setStaffList] = useState<StaffResponseDto[]>([]);
  const [shifts, setShifts] = useState<CalendarShiftEvent[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル制御
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectStaffOpened, { open: openSelectStaff, close: closeSelectStaff }] = useDisclosure(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // テンプレート入力用スタッフ選択
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // スタッフ作成フォーム
  // フォームでは workingDays と workTimeTemplate を必須として扱う
  // APIへ送信時はそのまま CreateStaffRequest として使用可能（オプショナルフィールドのため）
  const createForm = useForm<
    Omit<CreateStaffRequest, 'workingDays' | 'workTimeTemplate' | 'email'> & {
      workingDays: Weekday[];
      workTimeTemplate: WorkTimeTemplate;
      email: string;
    }
  >({
    initialValues: {
      name: '',
      email: '',
      role: 'スタッフ',
      color: '#4dabf7',
      workingDays: [],
      workTimeTemplate: { startHour: 9, endHour: 18 },
    },
    validate: {
      name: validateName,
      color: validateColor,
      workingDays: validateWorkingDays,
      workTimeTemplate: validateWorkTimeTemplate,
    },
  });

  // スタッフ編集フォーム
  // フォームでは workingDays と workTimeTemplate を必須として扱う
  // APIへ送信時はそのまま UpdateStaffRequest として使用可能（オプショナルフィールドのため）
  const editForm = useForm<
    Omit<UpdateStaffRequest, 'workingDays' | 'workTimeTemplate' | 'email'> & {
      workingDays: Weekday[];
      workTimeTemplate: WorkTimeTemplate;
      email: string;
    }
  >({
    initialValues: {
      name: '',
      email: '',
      role: 'スタッフ',
      color: '#4dabf7',
      workingDays: [],
      workTimeTemplate: { startHour: 9, endHour: 18 },
    },
    validate: {
      name: validateName,
      color: validateColor,
      workingDays: validateWorkingDays,
      workTimeTemplate: validateWorkTimeTemplate,
    },
  });

  // ページヘッダー設定
  useEffect(() => {
    setPageHeader(
      'スタッフシフト管理',
      <ActionMenu
        buttonLabel="操作"
        buttonIcon={IconPlus}
        action="create"
        items={[
          {
            id: 'add-staff',
            label: 'スタッフ追加',
            icon: <IconPlus size={16} />,
            onClick: openCreate,
          },
          {
            id: 'bulk-input',
            label: '全員一括入力',
            icon: <IconCalendarPlus size={16} />,
            onClick: handleBulkTemplateInput,
          },
          {
            id: 'select-input',
            label: '選択入力...',
            icon: <IconUsers size={16} />,
            onClick: openSelectStaff,
          }
        ]}
      />
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初期データ取得
  useEffect(() => {
    fetchInitialData();
  }, []);

  // ドラッグ可能な要素の初期化
  useEffect(() => {
    let draggable: Draggable | null = null;

    // isMobile が undefined の間（SSR / 初期レンダリング）はスキップ
    if (isMobile === undefined) return;

    const staffListElement = document.getElementById('staff-list');
    if (staffListElement && staffList.length > 0) {
      draggable = new Draggable(staffListElement, {
        itemSelector: '.draggable-staff',
        eventData: function (eventEl: HTMLElement) {
          const staffId = eventEl.getAttribute('data-staff-id') || '';
          const staffName = eventEl.getAttribute('data-staff-name') || '';
          const staffColor = eventEl.getAttribute('data-staff-color') || '#4c6ef5';
          return {
            title: staffName,
            backgroundColor: staffColor,
            borderColor: staffColor,
            extendedProps: {
              staffId: staffId,
              staffName: staffName,
            },
          };
        },
      });
    }

    return () => {
      if (draggable) {
        draggable.destroy();
      }
    };
  }, [staffList, isMobile]);

  /**
   * 初期データ取得
   */
  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // スタッフ一覧を取得
      const staffData = await apiClient.getStaffList();
      setStaffList(staffData.staffList);

      // 今月のシフトデータを取得
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      const shiftsData = await apiClient.getCalendarShifts({ startDate, endDate });
      setShifts(shiftsData);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'データの取得に失敗しました';
      setError(errorMessage);
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * スタッフ作成
   */
  const handleCreateStaff = async (values: CreateStaffRequest & { workingDays: Weekday[]; workTimeTemplate: WorkTimeTemplate }) => {
    setOperationLoading(true);

    try {
      // 空文字列のフィールドをundefinedに変換（バリデーションエラー回避）
      const sanitizedValues = {
        ...values,
        email: values.email === '' ? undefined : values.email,
      };
      const newStaff = await apiClient.createStaff(sanitizedValues);
      setStaffList((prev) => [...prev, newStaff]);

      notifications.show({
        title: 'スタッフ作成成功',
        message: `${newStaff.name}を追加しました`,
        color: 'green',
      });

      closeCreate();
      createForm.reset();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'スタッフの作成に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * スタッフ編集
   */
  const handleEditStaff = async (values: UpdateStaffRequest & { workingDays: Weekday[]; workTimeTemplate: WorkTimeTemplate }) => {
    if (!selectedStaff) return;

    setOperationLoading(true);

    try {
      // 空文字列のフィールドをundefinedに変換（バリデーションエラー回避）
      const sanitizedValues = {
        ...values,
        email: values.email === '' ? undefined : values.email,
      };
      const updatedStaff = await apiClient.updateStaff(selectedStaff.id, sanitizedValues);
      setStaffList((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));

      notifications.show({
        title: 'スタッフ更新成功',
        message: `${updatedStaff.name}の情報を更新しました`,
        color: 'green',
      });

      closeEdit();
      setSelectedStaff(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'スタッフの更新に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * スタッフ削除
   */
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    setOperationLoading(true);

    try {
      await apiClient.deleteStaff(selectedStaff.id);
      setStaffList((prev) => prev.filter((s) => s.id !== selectedStaff.id));

      notifications.show({
        title: 'スタッフ削除成功',
        message: `${selectedStaff.name}を削除しました`,
        color: 'blue',
      });

      closeDelete();
      setSelectedStaff(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'スタッフの削除に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * 編集モーダルを開く
   */
  const openEditModal = (staff: StaffResponseDto) => {
    setSelectedStaff(staff);
    editForm.setValues({
      name: staff.name,
      email: staff.email ?? '',
      role: staff.role,
      color: staff.color,
      workingDays: staff.workingDays ?? [],
      workTimeTemplate: staff.workTimeTemplate ?? { startHour: 9, endHour: 18 },
    });
    openEdit();
  };

  /**
   * 削除モーダルを開く
   */
  const openDeleteModal = (staff: StaffResponseDto) => {
    setSelectedStaff(staff);
    openDelete();
  };

  /**
   * カレンダーへのドロップイベント
   */
  const handleEventReceive = async (info: EventReceiveArg) => {
    const staffId = info.event.extendedProps.staffId;
    const shiftDate = info.event.startStr.split('T')[0]; // YYYY-MM-DD

    try {
      const newShift = await apiClient.createShift({
        staffId,
        shiftDate,
      });

      // カレンダーイベントを更新
      info.event.setExtendedProp('shiftId', newShift.id);

      // シフトリストを更新
      await refreshShifts();

      notifications.show({
        title: 'シフト作成成功',
        message: `${info.event.title}のシフトを追加しました`,
        color: 'green',
      });
    } catch (err) {
      info.revert(); // ドロップを元に戻す
      const errorMessage = err instanceof ApiError ? err.message : 'シフトの作成に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  /**
   * カレンダーイベントの移動
   */
  const handleEventDrop = async (info: EventDropArg) => {
    const shiftId = info.event.extendedProps.shiftId;
    if (!shiftId) {
      info.revert();
      return;
    }

    const newShiftDate = info.event.startStr.split('T')[0]; // YYYY-MM-DD

    try {
      await apiClient.updateShift(shiftId, { shiftDate: newShiftDate });

      notifications.show({
        title: 'シフト変更成功',
        message: `${info.event.title}のシフトを変更しました`,
        color: 'blue',
      });
    } catch (err) {
      info.revert(); // 移動を元に戻す
      const errorMessage = err instanceof ApiError ? err.message : 'シフトの変更に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  /**
   * カレンダーイベントのクリック（削除）
   */
  const handleEventClick = async (info: EventClickArg) => {
    const shiftId = info.event.extendedProps.shiftId;
    if (!shiftId) return;

    if (confirm(`${info.event.title}のシフトを削除しますか?`)) {
      try {
        await apiClient.deleteShift(shiftId);
        info.event.remove();

        notifications.show({
          title: 'シフト削除成功',
          message: `${info.event.title}のシフトを削除しました`,
          color: 'blue',
        });
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'シフトの削除に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    }
  };

  /**
   * シフトデータを再取得
   */
  const refreshShifts = async () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    const view = calendarApi.view;
    const startDate = view.activeStart.toISOString().split('T')[0];
    const endDate = view.activeEnd.toISOString().split('T')[0];

    try {
      const shiftsData = await apiClient.getCalendarShifts({ startDate, endDate });
      setShifts(shiftsData);
    } catch (err) {
      console.error('シフトの再取得に失敗:', err);
    }
  };

  /**
   * 曜日コードから日本の曜日インデックスへ変換
   * JavaScript の getDay(): 0=日, 1=月, 2=火, ... 6=土
   */
  const weekdayToJsDay: Record<Weekday, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  /**
   * テンプレート基準でシフトを一括入力（指定スタッフ）
   */
  const handleTemplateInput = async (targetStaffList: StaffResponseDto[]) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) {
      notifications.show({
        title: 'エラー',
        message: 'カレンダーが初期化されていません',
        color: 'red',
      });
      return;
    }

    // テンプレートが設定されていないスタッフをフィルタ
    const staffWithTemplate = targetStaffList.filter(
      (staff) => staff.workingDays && staff.workingDays.length > 0
    );

    if (staffWithTemplate.length === 0) {
      notifications.show({
        title: '警告',
        message: '出勤曜日が設定されているスタッフがいません',
        color: 'yellow',
      });
      return;
    }

    setOperationLoading(true);

    try {
      const view = calendarApi.view;
      const startDate = view.activeStart;
      const endDate = view.activeEnd;

      // 既存シフトの日付とスタッフIDのセットを作成（重複防止）
      const existingShiftKeys = new Set(
        shifts.map((shift) => {
          const shiftDate = shift.start ? formatDateKey(new Date(shift.start)) : '';
          const staffId = shift.extendedProps?.staffId ?? '';
          return `${shiftDate}_${staffId}`;
        })
      );

      // 生成するシフトのリスト
      const shiftsToCreate: { staffId: string; shiftDate: string; displayName: string | null }[] = [];

      // 表示範囲内の各日を走査
      const currentDate = new Date(startDate);
      while (currentDate < endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateKey = formatDateKey(currentDate);

        // 各スタッフについてチェック
        for (const staff of staffWithTemplate) {
          // このスタッフの出勤曜日に該当するか
          const workingDays = staff.workingDays ?? [];
          const isWorkingDay = workingDays.some(
            (wd) => weekdayToJsDay[wd as Weekday] === dayOfWeek
          );

          if (isWorkingDay) {
            const key = `${dateKey}_${staff.id}`;
            // 既存シフトがなければ追加対象
            if (!existingShiftKeys.has(key)) {
              // displayName: 時間テンプレートがあれば「9〜18」形式
              const displayName = staff.workTimeTemplate
                ? `${staff.workTimeTemplate.startHour}〜${staff.workTimeTemplate.endHour}`
                : null;

              shiftsToCreate.push({
                staffId: staff.id,
                shiftDate: dateKey,
                displayName,
              });
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (shiftsToCreate.length === 0) {
        notifications.show({
          title: '情報',
          message: '追加するシフトはありません（既に入力済み、または対象日がありません）',
          color: 'blue',
        });
        return;
      }

      // 並列でシフト作成（バッチ処理）
      const results = await Promise.allSettled(
        shiftsToCreate.map((shiftData) => apiClient.createShift(shiftData))
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failCount = results.filter((r) => r.status === 'rejected').length;

      // シフトデータを再取得
      await refreshShifts();

      if (failCount === 0) {
        notifications.show({
          title: 'シフト一括入力完了',
          message: `${successCount}件のシフトを追加しました`,
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'シフト一括入力完了（一部エラー）',
          message: `成功: ${successCount}件 / 失敗: ${failCount}件`,
          color: 'yellow',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'シフトの一括入力に失敗しました';
      notifications.show({
        title: 'エラー',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * 全スタッフ一括入力
   */
  const handleBulkTemplateInput = () => {
    handleTemplateInput(staffList);
  };

  /**
   * 選択スタッフ入力
   */
  const handleSelectedTemplateInput = () => {
    const targetStaff = staffList.filter((s) => selectedStaffIds.includes(s.id));
    handleTemplateInput(targetStaff);
    closeSelectStaff();
    setSelectedStaffIds([]);
  };

  /**
   * シフトテキスト生成
   */
  const weekdayLabelJa = ['日', '月', '火', '水', '木', '金', '土'];

  /**
   * シフトイベントからスタッフ名を取得
   * FullCalendar イベントでは title にスタッフ名が設定されるが、
   * フォールバックとして extendedProps.staffName も確認する
   */
  const getStaffNameFromShift = (shift: CalendarShiftEvent): string => {
    return shift.title ?? shift.extendedProps?.staffName ?? '';
  };

  /**
   * Date オブジェクトをタイムゾーンに依存しない YYYY-MM-DD 形式に変換
   * toISOString() は UTC に変換されるため、ローカル日付を正しく取得するために
   * 年月日を個別に取得して文字列化する
   */
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateShiftText = (): string => {
    if (!shifts || shifts.length === 0) return '';

    const map = new Map<string, string[]>();

    shifts.forEach((shift) => {
      const start = shift.start;
      if (!start) return;

      const date = new Date(start);
      if (Number.isNaN(date.getTime())) return;

      const dateKey = formatDateKey(date);
      const staffName = getStaffNameFromShift(shift);
      if (!staffName) return;

      const list = map.get(dateKey) ?? [];
      list.push(staffName);
      map.set(dateKey, list);
    });

    const sortedKeys = Array.from(map.keys()).sort();

    const lines = sortedKeys
      .map((dateKey) => {
        const date = new Date(dateKey);
        // 不正な日付をスキップ
        if (Number.isNaN(date.getTime())) return null;
        const day = date.getDate();
        const weekday = weekdayLabelJa[date.getDay()];
        const staffNames = map.get(dateKey) ?? [];
        return `${day}日(${weekday}) ${staffNames.join(' ')}`;
      })
      .filter((line): line is string => line !== null);

    return lines.join('\n');
  };

  if (error && !loading) {
    return (
      <Container size="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="エラー"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <LoadingOverlay visible={loading} />

      {/* スタッフ作成モーダル */}
      <UnifiedModal
        opened={createOpened}
        onClose={closeCreate}
        title="スタッフ追加"
        size="md"
        sections={[
          {
            label: '基本情報',
            content: (
              <Stack gap="md">
                <TextInput
                  label="名前"
                  placeholder="田中 太郎"
                  required
                  {...createForm.getInputProps('name')}
                />

                <TextInput
                  label="メールアドレス（任意）"
                  placeholder="tanaka@example.com"
                  type="email"
                  {...createForm.getInputProps('email')}
                />

                <TextInput
                  label="役職"
                  placeholder="スタッフ"
                  {...createForm.getInputProps('role')}
                />

                <ColorInput
                  label="表示カラー"
                  placeholder="カラーを選択"
                  format="hex"
                  swatches={[
                    '#4c6ef5',
                    '#f06595',
                    '#20c997',
                    '#fd7e14',
                    '#fab005',
                    '#51cf66',
                    '#4dabf7',
                    '#845ef7',
                    '#ff6b6b',
                    '#74c0fc',
                  ]}
                  {...createForm.getInputProps('color')}
                />
              </Stack>
            ),
          },
          {
            label: '出勤設定',
            content: (
              <>
                <Checkbox.Group
                  label="出勤曜日"
                  description="通常出勤する曜日を選択してください"
                  {...createForm.getInputProps('workingDays')}
                >
                  <Group mt="xs">
                    <Checkbox value="mon" label="月" />
                    <Checkbox value="tue" label="火" />
                    <Checkbox value="wed" label="水" />
                    <Checkbox value="thu" label="木" />
                    <Checkbox value="fri" label="金" />
                    <Checkbox value="sat" label="土" />
                    <Checkbox value="sun" label="日" />
                  </Group>
                </Checkbox.Group>

                <Group grow>
                  <NumberInput
                    label="出勤開始時刻（テンプレート）"
                    description="0〜23の範囲で入力（例: 9）"
                    min={0}
                    max={23}
                    step={1}
                    suffix=" 時"
                    {...createForm.getInputProps('workTimeTemplate.startHour')}
                  />
                  <NumberInput
                    label="出勤終了時刻（テンプレート）"
                    description="1〜24の範囲で入力（例: 18）"
                    min={1}
                    max={24}
                    step={1}
                    suffix=" 時"
                    {...createForm.getInputProps('workTimeTemplate.endHour')}
                  />
                </Group>
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={closeCreate}
                  disabled={operationLoading}
                  leftSection={<IconX size={16} />}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={() => {
                    createForm.validate();
                    if (createForm.isValid()) {
                      void handleCreateStaff(createForm.values);
                    }
                  }}
                  loading={operationLoading}
                  variant="filled"
                  color="blue"
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  作成
                </Button>
              </Group>
            ),
          },
        ]}
      />

      {/* スタッフ編集モーダル */}
      <UnifiedModal
        opened={editOpened}
        onClose={closeEdit}
        title="スタッフ編集"
        size="md"
        sections={[
          {
            label: '基本情報',
            content: (
              <Stack gap="md">
                <TextInput
                  label="名前"
                  placeholder="田中 太郎"
                  required
                  {...editForm.getInputProps('name')}
                />

                <TextInput
                  label="メールアドレス（任意）"
                  placeholder="tanaka@example.com"
                  type="email"
                  {...editForm.getInputProps('email')}
                />

                <TextInput
                  label="役職"
                  placeholder="スタッフ"
                  {...editForm.getInputProps('role')}
                />

                <ColorInput
                  label="表示カラー"
                  placeholder="カラーを選択"
                  format="hex"
                  swatches={[
                    '#4c6ef5',
                    '#f06595',
                    '#20c997',
                    '#fd7e14',
                    '#fab005',
                    '#51cf66',
                    '#4dabf7',
                    '#845ef7',
                    '#ff6b6b',
                    '#74c0fc',
                  ]}
                  {...editForm.getInputProps('color')}
                />
              </Stack>
            ),
          },
          {
            label: '出勤設定',
            content: (
              <>
                <Checkbox.Group
                  label="出勤曜日"
                  description="通常出勤する曜日を選択してください"
                  {...editForm.getInputProps('workingDays')}
                >
                  <Group mt="xs">
                    <Checkbox value="mon" label="月" />
                    <Checkbox value="tue" label="火" />
                    <Checkbox value="wed" label="水" />
                    <Checkbox value="thu" label="木" />
                    <Checkbox value="fri" label="金" />
                    <Checkbox value="sat" label="土" />
                    <Checkbox value="sun" label="日" />
                  </Group>
                </Checkbox.Group>

                <Group grow>
                  <NumberInput
                    label="出勤開始時刻（テンプレート）"
                    description="0〜23の範囲で入力（例: 9）"
                    min={0}
                    max={23}
                    step={1}
                    suffix=" 時"
                    {...editForm.getInputProps('workTimeTemplate.startHour')}
                  />
                  <NumberInput
                    label="出勤終了時刻（テンプレート）"
                    description="1〜24の範囲で入力（例: 18）"
                    min={1}
                    max={24}
                    step={1}
                    suffix=" 時"
                    {...editForm.getInputProps('workTimeTemplate.endHour')}
                  />
                </Group>
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={closeEdit}
                  disabled={operationLoading}
                  leftSection={<IconX size={16} />}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={() => {
                    editForm.validate();
                    if (editForm.isValid()) {
                      void handleEditStaff(editForm.values);
                    }
                  }}
                  loading={operationLoading}
                  variant="filled"
                  color="blue"
                  leftSection={<IconDeviceFloppy size={16} />}
                >
                  保存
                </Button>
              </Group>
            ),
          },
        ]}
      />

      {/* スタッフ削除確認モーダル */}
      <UnifiedModal
        opened={deleteOpened}
        onClose={closeDelete}
        title="スタッフ削除"
        size="sm"
        sections={[
          {
            content: (
              <>
                <Text>{selectedStaff?.name} を削除してもよろしいですか?</Text>
                <Text size="sm" c="dimmed">
                  この操作は取り消せません。
                </Text>
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={closeDelete}
                  disabled={operationLoading}
                  leftSection={<IconX size={16} />}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleDeleteStaff}
                  loading={operationLoading}
                  variant="filled"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                >
                  削除
                </Button>
              </Group>
            ),
          },
        ]}
      />

      {/* スタッフ選択モーダル（テンプレート入力用） */}
      <UnifiedModal
        opened={selectStaffOpened}
        onClose={() => {
          closeSelectStaff();
          setSelectedStaffIds([]);
        }}
        title="スタッフ選択"
        size="md"
        sections={[
          {
            content: (
              <>
                <Text size="sm" c="dimmed">
                  テンプレート入力するスタッフを選択してください。
                  出勤曜日が設定されているスタッフのみが対象です。
                </Text>

                <Checkbox.Group
                  value={selectedStaffIds}
                  onChange={setSelectedStaffIds}
                >
                  <Stack gap="xs">
                    {staffList.map((staff) => {
                      const hasTemplate = staff.workingDays && staff.workingDays.length > 0;
                      const timeLabel = staff.workTimeTemplate
                        ? `${staff.workTimeTemplate.startHour}〜${staff.workTimeTemplate.endHour}`
                        : '';
                      const daysLabel = staff.workingDays
                        ? staff.workingDays.map((d) => {
                            const dayMap: Record<string, string> = {
                              mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日'
                            };
                            return dayMap[d] ?? d;
                          }).join('・')
                        : '';

                      return (
                        <Checkbox
                          key={staff.id}
                          value={staff.id}
                          disabled={!hasTemplate}
                          label={
                            <Group gap="xs">
                              <Box
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  backgroundColor: staff.color,
                                }}
                              />
                              <Text size="sm" fw={500}>
                                {staff.name}
                              </Text>
                              {hasTemplate ? (
                                <Text size="xs" c="dimmed">
                                  ({daysLabel}{timeLabel && ` ${timeLabel}`})
                                </Text>
                              ) : (
                                <Text size="xs" c="red">
                                  ※曜日未設定
                                </Text>
                              )}
                            </Group>
                          }
                        />
                      );
                    })}
                  </Stack>
                </Checkbox.Group>
              </>
            ),
          },
          {
            content: (
              <Group justify="space-between">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    const selectableIds = staffList
                      .filter((s) => s.workingDays && s.workingDays.length > 0)
                      .map((s) => s.id);
                    setSelectedStaffIds(selectableIds);
                  }}
                >
                  全選択
                </Button>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      closeSelectStaff();
                      setSelectedStaffIds([]);
                    }}
                    leftSection={<IconX size={16} />}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleSelectedTemplateInput}
                    loading={operationLoading}
                    variant="filled"
                    color="blue"
                    leftSection={<IconCalendarEvent size={16} />}
                    disabled={selectedStaffIds.length === 0}
                  >
                    入力実行
                  </Button>
                </Group>
              </Group>
            ),
          },
        ]}
      />

      {/* メインコンテンツ: レスポンシブレイアウト */}
      {/* モバイル: 左にスタッフバッジ、右にカレンダー、下にテキストシフト */}
      {/* デスクトップ: 左にスタッフ一覧、右にテキストシフト＋カレンダー */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: isMobile ? 8 : 16,
          height: 'calc(100vh - 200px)',
          minHeight: 400,
        }}
      >
        {/* 左サイドバー: スタッフ一覧 / モバイルではバッジのみ */}
        {isMobile ? (
          /* モバイル: バッジ形式スタッフ一覧（全角3文字幅） */
          <ScrollArea
            id="staff-list"
            style={{
              width: 56, // 全角3文字幅 + padding
              flexShrink: 0,
            }}
          >
            <Stack gap={6}>
              {staffList.map((staff) => (
                <Tooltip
                  key={staff.id}
                  label={staff.name}
                  position="right"
                  withArrow
                >
                  <Badge
                    className="draggable-staff"
                    data-staff-id={staff.id}
                    data-staff-name={staff.name}
                    data-staff-color={staff.color}
                    color={staff.color}
                    variant="filled"
                    size="lg"
                    radius="sm"
                    style={{
                      cursor: 'grab',
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    {/* 名前の先頭3文字（全角換算） */}
                    {staff.name.slice(0, 3)}
                  </Badge>
                </Tooltip>
              ))}
            </Stack>
          </ScrollArea>
        ) : (
          /* デスクトップ: 1行形式スタッフ一覧（リサイズ可能） */
          <Box style={{ display: 'flex', flexShrink: 0 }}>
            <Paper
              withBorder
              p="md"
              style={{
                width: staffListWidth,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Group justify="space-between" mb="sm">
                <Text fw={600} size="sm">
                  <IconUser size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  スタッフ一覧
                </Text>
                <Group gap="xs">
                  <Badge size="sm" variant="light">
                    {staffList.length}人
                  </Badge>
                  <Menu shadow="md" width={180} position="bottom-end">
                    <Menu.Target>
                      <Button
                        variant="light"
                        size="xs"
                        rightSection={<IconChevronDown size={14} />}
                        loading={operationLoading}
                      >
                        操作
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconPlus size={16} />}
                        onClick={openCreate}
                      >
                        スタッフ追加
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Label>テンプレート入力</Menu.Label>
                      <Menu.Item
                        leftSection={<IconCalendarPlus size={16} />}
                        onClick={handleBulkTemplateInput}
                        disabled={staffList.length === 0}
                      >
                        全員一括入力
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconUsers size={16} />}
                        onClick={openSelectStaff}
                        disabled={staffList.length === 0}
                      >
                        選択入力...
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>

              <ScrollArea style={{ flex: 1 }} id="staff-list">
                <Stack gap={4}>
                  {staffList.map((staff) => {
                    // 勤務時間テンプレートを表示用に整形
                    const timeLabel = staff.workTimeTemplate
                      ? `${staff.workTimeTemplate.startHour}〜${staff.workTimeTemplate.endHour}`
                      : '';

                    return (
                      <Box
                        key={staff.id}
                        className="draggable-staff"
                        data-staff-id={staff.id}
                        data-staff-name={staff.name}
                        data-staff-color={staff.color}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 4,
                          border: `2px solid ${staff.color}`,
                          cursor: 'grab',
                          backgroundColor: 'var(--mantine-color-body)',
                          transition: 'all 0.15s',
                          minHeight: 32,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {/* カラーインジケーター */}
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: staff.color,
                            flexShrink: 0,
                          }}
                        />
                        {/* 名前 + 時間 */}
                        <Text size="sm" fw={500} style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {staff.name}
                          {timeLabel && (
                            <Text component="span" size="xs" c="dimmed" ml={6}>
                              {timeLabel}
                            </Text>
                          )}
                        </Text>
                        {/* CRUDメニュー */}
                        <Menu shadow="md" width={140}>
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              style={{ cursor: 'pointer', flexShrink: 0 }}
                            >
                              <IconDotsVertical size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(staff);
                              }}
                            >
                              編集
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(staff);
                              }}
                            >
                              削除
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Box>
                    );
                  })}
                </Stack>
              </ScrollArea>
            </Paper>

            {/* 横幅リサイズハンドル */}
            <Box
              onMouseDown={handleWidthResizeStart}
              style={{
                width: 8,
                cursor: 'col-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isResizingWidth ? 'var(--mantine-color-blue-1)' : 'transparent',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isResizingWidth) {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isResizingWidth) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <IconGripVertical size={12} style={{ opacity: 0.5 }} />
            </Box>
          </Box>
        )}

        {/* 右サイド: カレンダーとテキストエクスポート */}
        <Stack style={{ flex: 1, height: '100%', minWidth: 0 }} gap="md">
          {/* カレンダー（モバイルでは先に表示） */}
          <Paper
            withBorder
            p={isMobile ? 'xs' : 'md'}
            style={{
              flex: 1,
              overflow: 'hidden',
              minHeight: 300,
            }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ja"
              headerToolbar={
                isMobile
                  ? {
                      left: 'prev,next',
                      center: 'title',
                      right: '',
                    }
                  : {
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,dayGridWeek',
                    }
              }
              buttonText={{
                today: '今日',
                month: '月',
                week: '週',
              }}
              height="100%"
              editable={true}
              droppable={true}
              events={shifts}
              eventReceive={handleEventReceive}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              dayCellContent={(arg: DayCellContentArg) => {
                const dayOfWeek = arg.date.getDay();
                let color = 'inherit';
                if (dayOfWeek === 0) color = '#e03131'; // 日曜: 赤
                if (dayOfWeek === 6) color = '#1971c2'; // 土曜: 青
                return (
                  <span style={{ color, fontWeight: dayOfWeek === 0 || dayOfWeek === 6 ? 600 : 400 }}>
                    {arg.dayNumberText}
                  </span>
                );
              }}
              eventContent={(arg: EventContentArg) => {
                const staffName = arg.event.title;
                const displayName = arg.event.extendedProps?.displayName as string | null;
                const dotColor = arg.event.extendedProps?.staffColor ?? arg.event.backgroundColor ?? '#4dabf7';

                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 4px',
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#333',
                      }}
                    >
                      {staffName}
                      {displayName && (
                        <span style={{ marginLeft: 4, color: '#666' }}>{displayName}</span>
                      )}
                    </span>
                  </div>
                );
              }}
              eventDisplay="list-item"
            />
          </Paper>

          {/* テキストエクスポート（カレンダーの下、リサイズ可能） */}
          {!isMobile && (
            <Box
              onMouseDown={handleHeightResizeStart}
              style={{
                height: 6,
                cursor: 'row-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isResizingHeight ? 'var(--mantine-color-blue-1)' : 'transparent',
                transition: 'background-color 0.15s',
                borderRadius: 3,
              }}
              onMouseEnter={(e) => {
                if (!isResizingHeight) {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isResizingHeight) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Box style={{ width: 40, height: 3, backgroundColor: 'var(--mantine-color-gray-4)', borderRadius: 2 }} />
            </Box>
          )}
          <Paper 
            withBorder 
            p={isMobile ? 'xs' : 'md'}
            style={!isMobile ? { height: textShiftHeight, flexShrink: 0 } : undefined}
          >
            <Group justify="space-between" align="flex-start" mb="xs">
              {!isMobile && (
                <Text fw={600} size="sm">
                  テキスト形式シフト一覧
                </Text>
              )}
              <CopyButton value={generateShiftText()} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'コピーしました' : 'コピー'}>
                    <Button
                      size="xs"
                      variant="light"
                      color={copied ? 'teal' : 'blue'}
                      onClick={copy}
                      style={isMobile ? { marginLeft: 'auto' } : undefined}
                    >
                      {copied ? 'コピー済み' : 'シフトをコピー'}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              value={generateShiftText()}
              readOnly
              autosize
              minRows={isMobile ? 2 : 3}
              maxRows={isMobile ? 5 : 10}
              placeholder="カレンダーに登録されたシフトがここに表示されます"
              styles={{
                input: {
                  fontSize: isMobile ? 12 : 14,
                },
              }}
            />
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
```

## File: frontend/src/app/tenants/_components/ActionMenu.tsx
```typescript
'use client';

import { Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { ActionButton, ActionType } from '@/components/ActionButton';

interface ActionMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  buttonLabel?: string;
  /** アイコンコンポーネント（例: IconPlus）または undefined */
  buttonIcon?: React.ComponentType<{ size?: number | string }>;
  action?: ActionType;
  isSectionAction?: boolean;
}

export function ActionMenu({ 
  items, 
  buttonLabel = 'アクション', 
  buttonIcon,
  action = 'view',
  isSectionAction = false // Change default to false, as it's often used in headers
}: ActionMenuProps) {
  if (items.length === 0) return null;

  // コンポーネント型をReactNodeに変換
  const ButtonIconComponent = buttonIcon;
  const iconElement = ButtonIconComponent ? <ButtonIconComponent size={18} /> : undefined;

  return (
    <Menu shadow="md" width={200} radius="md" position="bottom-end" transitionProps={{ transition: 'pop', duration: 150 }}>
      <Menu.Target>
        <ActionButton 
          action={action}
          rightSection={<IconChevronDown size={16} />}
          customIcon={iconElement}
          isSectionAction={isSectionAction}
        >
          {buttonLabel}
        </ActionButton>
      </Menu.Target>
      <Menu.Dropdown 
        className="glass-effect" 
        style={{ 
          border: '1px solid var(--glass-border)',
          backgroundColor: 'var(--glass-bg, #fff)',
          backdropFilter: 'blur(var(--glass-blur, 0px))',
        }}
      >
        {items.map((item) => (
          <Menu.Item 
            key={item.id} 
            leftSection={item.icon} 
            onClick={item.onClick}
            style={{ 
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-base, 8px) * 0.5)',
            }}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
```

## File: frontend/src/app/tenants/_components/UserProfileForm.tsx
```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Card,
  TextInput,
  PasswordInput,
  Group,
  Text,
  Divider,
  Alert,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ActionButton } from '@/components/ActionButton';
import { useAuth, useAuthStore } from '@/lib/auth/store';
import { apiClient, apiRequest } from '@/lib/api/client';

interface ProfileFormData {
  displayName: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

/**
 * ユーザープロフィール編集・パスワード変更フォーム
 * 
 * 2つのセクションで構成：
 * - プロフィール編集（ユーザーネーム、メールアドレス）
 * - パスワード変更（現在のパスワード、新しいパスワード、確認）
 */
export function UserProfileForm() {
  const { user } = useAuth();
  const updateUser = useAuthStore((state) => state.updateUser);

  // プロフィールフォームの状態
  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: '',
    email: '',
  });
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(false);

  // パスワードフォームの状態
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ユーザー情報が変更されたらフォームを初期化
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.firstName ?? '',
        email: user.email ?? '',
      });
      setOriginalEmail(user.email ?? '');
    }
  }, [user]);

  // メールアドレスが変更されたかどうか
  const isEmailChanged = profileData.email.trim().toLowerCase() !== originalEmail.toLowerCase();

  // プロフィール更新処理
  const handleProfileSubmit = async () => {
    // 空白チェック（ユーザーネームは任意だが、メールは必須）
    if (!profileData.email.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'メールアドレスを入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setProfileLoading(true);

      // PATCH /users/me で呼び出し
      // ビジネスロジック: UIでは「ユーザーネーム」として単一フィールドで入力させ、
      // バックエンドの firstName フィールドにマッピングする。lastName は使用しない（空文字列）。
      // これにより既存のデータモデルを維持しつつ、シンプルなUI体験を提供する。
      const response = await apiRequest<ProfileUpdateResponse>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: profileData.displayName.trim(),
          lastName: '',
          email: profileData.email.trim(),
        }),
      });

      if (response.success && response.data) {
        // 認証ストアを更新
        updateUser({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        });

        // 元のメールアドレスを更新
        setOriginalEmail(response.data.email);

        notifications.show({
          title: '成功',
          message: 'プロフィールを更新しました',
          color: 'green',
        });
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'プロフィールの更新に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // パスワード変更処理
  const handlePasswordSubmit = async () => {
    // バリデーション
    if (!passwordData.currentPassword) {
      notifications.show({
        title: 'エラー',
        message: '現在のパスワードを入力してください',
        color: 'red',
      });
      return;
    }

    if (!passwordData.newPassword) {
      notifications.show({
        title: 'エラー',
        message: '新しいパスワードを入力してください',
        color: 'red',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      notifications.show({
        title: 'エラー',
        message: '新しいパスワードは8文字以上で入力してください',
        color: 'red',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notifications.show({
        title: 'エラー',
        message: '新しいパスワードが一致しません',
        color: 'red',
      });
      return;
    }

    try {
      setPasswordLoading(true);

      // POST /auth/change-password で型安全に呼び出し
      const response = await apiClient.post('/auth/change-password', {
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'パスワードを変更しました',
          color: 'green',
        });
        // フォームをリセット
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'パスワードの変更に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* プロフィール編集セクション */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="lg">プロフィール編集</Text>
          <Divider />

          <TextInput
            label="ユーザーネーム"
            placeholder="山田太郎"
            value={profileData.displayName}
            onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
            disabled={profileLoading}
          />

          <TextInput
            label="メールアドレス"
            placeholder="user@example.com"
            type="email"
            required
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            disabled={profileLoading}
          />

          {isEmailChanged && (
            <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
              メールアドレスを変更すると、次回ログイン時に新しいメールアドレスが必要になります。
            </Alert>
          )}

          <Group justify="flex-end">
            <ActionButton
              action="save"
              onClick={handleProfileSubmit}
              loading={profileLoading}
              isSectionAction
            >
              保存
            </ActionButton>
          </Group>
        </Stack>
      </Card>

      {/* パスワード変更セクション */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="lg">パスワード変更</Text>
          <Divider />

          <PasswordInput
            label="現在のパスワード"
            placeholder="現在のパスワードを入力"
            required
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            disabled={passwordLoading}
          />

          <PasswordInput
            label="新しいパスワード"
            placeholder="8文字以上で入力"
            required
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            disabled={passwordLoading}
            description="8文字以上で入力してください"
          />

          <PasswordInput
            label="新しいパスワード（確認）"
            placeholder="新しいパスワードを再入力"
            required
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            disabled={passwordLoading}
          />

          <Group justify="flex-end">
            <ActionButton
              action="save"
              onClick={handlePasswordSubmit}
              loading={passwordLoading}
              isSectionAction
            >
              パスワードを変更
            </ActionButton>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
```

## File: frontend/src/app/tenants/_components/UsersList.tsx
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Text, Card, Loader, Center, Alert, Select, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import { UnifiedModal } from '@/components/common';
import { apiClient, apiRequest } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/lib/auth/store';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  tenantId: string;
  createdAt: string;
}

interface RoleOption {
  value: string;
  label: string;
}

/**
 * ユーザー一覧テーブル
 */
export function UsersList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isTenantAdmin = currentUser?.role === 'TENANT_ADMIN';

  // 削除確認モーダルの状態
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ロール表示名変換
  const getRoleLabel = (role: string): string => {
    const mapping: Record<string, string> = {
      SUPER_ADMIN: 'スーパー管理者',
      TENANT_ADMIN: 'テナント管理者',
      ADMIN: '管理者',
      USER: '一般ユーザー',
    };
    return mapping[role] || role;
  };

  // ロール色
  const getRoleColor = (role: string): string => {
    const mapping: Record<string, string> = {
      SUPER_ADMIN: 'red',
      TENANT_ADMIN: 'blue',
      ADMIN: 'yellow',
      USER: 'gray',
    };
    return mapping[role] || 'gray';
  };

  /**
   * ターゲットユーザーのロール変更可能な選択肢を返す
   * 変更不可の場合は null を返す
   */
  const getRoleOptions = useCallback((targetUser: User): RoleOption[] | null => {
    // 自分自身は変更不可
    if (targetUser.id === currentUser?.id) return null;

    if (isSuperAdmin) {
      // SUPER_ADMIN は他の SUPER_ADMIN のロールは変更不可
      if (targetUser.role === 'SUPER_ADMIN') return null;
      // ADMIN ↔ USER, TENANT_ADMIN への変更を許可
      return [
        { value: 'USER', label: '一般ユーザー' },
        { value: 'ADMIN', label: '管理者' },
        { value: 'TENANT_ADMIN', label: 'テナント管理者' },
      ];
    }

    if (isTenantAdmin) {
      // TENANT_ADMIN は SUPER_ADMIN と TENANT_ADMIN のユーザーは変更不可
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'TENANT_ADMIN') return null;
      // 自テナントの ADMIN ↔ USER のみ変更可能
      return [
        { value: 'USER', label: '一般ユーザー' },
        { value: 'ADMIN', label: '管理者' },
      ];
    }

    return null;
  }, [currentUser?.id, isSuperAdmin, isTenantAdmin]);

  /**
   * ロール変更 API 呼び出し
   */
  const handleRoleChange = async (userId: string, newRole: string): Promise<void> => {
    setChangingRoleUserId(userId);
    try {
      const response = await apiClient.request(`/users/${userId}/role` as never, 'patch', {
        body: { role: newRole } as never,
      });

      if (response.success) {
        // ユーザー一覧の state を更新
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        notifications.show({
          title: '成功',
          message: 'ロールを変更しました',
          color: 'green',
        });
      } else {
        throw new Error(response.error || 'ロールの変更に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setChangingRoleUserId(null);
    }
  };

  // ユーザー一覧取得
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 自分のテナント内のユーザーを取得
      const response = await apiClient.request('/users' as never, 'get');

      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data as User[]);
      } else {
        throw new Error(response.error || 'ユーザー情報の取得に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * 対象ユーザーを削除可能かどうかを判定
   */
  const canDeleteUser = useCallback((targetUser: User): boolean => {
    // 自分自身は削除不可
    if (targetUser.id === currentUser?.id) return false;

    if (isSuperAdmin) {
      // SUPER_ADMIN は他の SUPER_ADMIN は削除不可
      if (targetUser.role === 'SUPER_ADMIN') return false;
      return true;
    }

    if (isTenantAdmin) {
      // TENANT_ADMIN は SUPER_ADMIN と TENANT_ADMIN は削除不可
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'TENANT_ADMIN') return false;
      return true;
    }

    return false;
  }, [currentUser?.id, isSuperAdmin, isTenantAdmin]);

  // 削除ボタンがクリックされたときのハンドラ
  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    openDeleteModal();
  };

  // 削除確認ダイアログを閉じる
  const handleDeleteModalClose = () => {
    if (!deleteLoading) {
      setDeletingUser(null);
      closeDeleteModal();
    }
  };

  // ユーザー削除処理
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setDeleteLoading(true);

      const response = await apiRequest(`/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'ユーザーを削除しました',
          color: 'green',
        });
        handleDeleteModalClose();
        // 一覧を再取得
        fetchUsers();
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'ユーザーの削除に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
        {error}
      </Alert>
    );
  }

  if (users.length === 0) {
    return (
      <Card withBorder p="xl">
        <Center>
          <Text c="dimmed">ユーザーがいません</Text>
        </Center>
      </Card>
    );
  }

  // 現在のユーザーが SUPER_ADMIN または TENANT_ADMIN の場合、操作列を表示
  const showActionsColumn = isSuperAdmin || isTenantAdmin;

  return (
    <Card withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ユーザー名</Table.Th>
            <Table.Th>メールアドレス</Table.Th>
            <Table.Th>ロール</Table.Th>
            <Table.Th>登録日</Table.Th>
            {showActionsColumn && <Table.Th>操作</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => {
            const displayName = [u.lastName, u.firstName].filter(Boolean).join(' ') || '未設定';
            const roleOptions = getRoleOptions(u);
            const isChangingRole = changingRoleUserId === u.id;
            
            return (
              <Table.Tr key={u.id}>
                <Table.Td>
                  <Text fw={600}>{displayName}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {u.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getRoleColor(u.role)} variant="light">
                    {getRoleLabel(u.role)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(u.createdAt).toLocaleDateString('ja-JP')}
                  </Text>
                </Table.Td>
                {showActionsColumn && (
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      {roleOptions ? (
                        <Select
                          size="xs"
                          w={140}
                          placeholder="ロール変更"
                          data={roleOptions}
                          value={u.role}
                          onChange={(value) => {
                            if (value && value !== u.role) {
                              void handleRoleChange(u.id, value);
                            }
                          }}
                          disabled={isChangingRole}
                          rightSection={isChangingRole ? <Loader size="xs" /> : undefined}
                          aria-label={`${displayName}のロールを変更`}
                        />
                      ) : (
                        <Text size="sm" c="dimmed" w={140}>
                          -
                        </Text>
                      )}
                      {canDeleteUser(u) && (
                        <ActionIconButton
                          action="delete"
                          onClick={() => handleDeleteClick(u)}
                          title="削除"
                        />
                      )}
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      {/* ユーザー削除確認モーダル */}
      <UnifiedModal
        opened={deleteModalOpened}
        onClose={handleDeleteModalClose}
        title="ユーザー削除の確認"
        size="md"
      >
        <Text>
          以下のユーザーを削除しますか？この操作は取り消せません。
        </Text>
        <Text fw={600} size="lg">
          {deletingUser?.firstName || deletingUser?.lastName
            ? [deletingUser?.lastName, deletingUser?.firstName].filter(Boolean).join(' ')
            : deletingUser?.email}
        </Text>
        <Text size="sm" c="dimmed">
          メールアドレス: {deletingUser?.email}
        </Text>
        <Group justify="flex-end" mt="md">
          <ActionButton action="cancel" onClick={handleDeleteModalClose} disabled={deleteLoading}>
            キャンセル
          </ActionButton>
          <ActionButton action="delete" onClick={handleDeleteUser} loading={deleteLoading}>
            削除
          </ActionButton>
        </Group>
      </UnifiedModal>
    </Card>
  );
}
```

## File: backend/prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Tenant {
  id          String            @id @default(uuid())
  name        String
  slug        String            @unique
  isActive    Boolean           @default(true) @map("is_active")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  invitations InvitationToken[]
  settings    TenantSettings?
  users       User[]
  pedigreePrintSetting PedigreePrintSetting?

  @@index([slug])
  @@index([isActive])
  @@map("tenants")
}

model TenantSettings {
  id               String   @id @default(uuid())
  tenantId         String   @unique @map("tenant_id")
  tagColorDefaults Json?    @map("tag_color_defaults")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  tenant           Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_settings")
}

model InvitationToken {
  id        String    @id @default(uuid())
  email     String
  token     String    @unique
  role      UserRole
  tenantId  String    @map("tenant_id")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")
  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([token])
  @@index([tenantId])
  @@index([expiresAt])
  @@map("invitation_tokens")
}

model User {
  id                   String             @id @default(uuid())
  clerkId              String             @unique @map("clerk_id")
  email                String             @unique
  firstName            String?            @map("first_name")
  lastName             String?            @map("last_name")
  role                 UserRole           @default(USER)
  isActive             Boolean            @default(true) @map("is_active")
  passwordHash         String?            @map("password_hash")
  refreshToken         String?            @map("refresh_token")
  failedLoginAttempts  Int                @default(0) @map("failed_login_attempts")
  lockedUntil          DateTime?          @map("locked_until")
  lastLoginAt          DateTime?          @map("last_login_at")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")
  resetPasswordExpires DateTime?          @map("reset_password_expires")
  resetPasswordToken   String?            @map("reset_password_token")
  tenantId             String?            @map("tenant_id")
  birthPlans           BirthPlan[]
  breedingRecords      BreedingRecord[]
  breedingSchedules    BreedingSchedule[]
  careRecords          CareRecord[]
  displayPreference    DisplayPreference?
  loginAttempts        LoginAttempt[]
  medicalRecords       MedicalRecord[]
  pregnancyChecks      PregnancyCheck[]
  schedules            Schedule[]
  staff                Staff?
  tenant               Tenant?            @relation(fields: [tenantId], references: [id])
  weightRecords        WeightRecord[]

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@index([lastLoginAt])
  @@index([tenantId])
  @@index([role, isActive])
  @@index([isActive, lastLoginAt])
  @@index([tenantId, role])
  @@map("users")
}

model DisplayPreference {
  id                     String          @id @default(uuid())
  userId                 String          @unique @map("user_id")
  breedNameMode          DisplayNameMode @default(CANONICAL) @map("breed_name_mode")
  coatColorNameMode      DisplayNameMode @default(CANONICAL) @map("coat_color_name_mode")
  breedNameOverrides     Json?           @map("breed_name_overrides")
  coatColorNameOverrides Json?           @map("coat_color_name_overrides")
  createdAt              DateTime        @default(now()) @map("created_at")
  updatedAt              DateTime        @updatedAt @map("updated_at")
  user                   User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("display_preferences")
}

model LoginAttempt {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  email     String
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  success   Boolean
  reason    String?
  createdAt DateTime @default(now()) @map("created_at")
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([email])
  @@index([success])
  @@index([createdAt])
  @@index([email, createdAt])
  @@index([userId, createdAt])
  @@index([success, createdAt])
  @@map("login_attempts")
}

model Breed {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("breeds")
}

model CoatColor {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("coat_colors")
}

model Gender {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@map("genders")
}

model Cat {
  id                    String                 @id @default(uuid())
  registrationNumber    String?                @unique @map("registration_number")
  name                  String
  breedId               String?                @map("breed_id")
  birthDate             DateTime               @map("birth_date")
  description           String?                @map("notes")
  fatherId              String?                @map("father_id")
  motherId              String?                @map("mother_id")
  createdAt             DateTime               @default(now()) @map("created_at")
  updatedAt             DateTime               @updatedAt @map("updated_at")
  pedigreeId            String?                @map("pedigree_id")
  gender                String
  coatColorId           String?                @map("coat_color_id")
  isInHouse             Boolean                @default(true) @map("is_in_house")
  microchipNumber       String?                @unique @map("microchip_number")
  isGraduated           Boolean                @default(false) @map("is_graduated")
  birthPlans            BirthPlan[]            @relation("BirthPlanMother")
  femaleBreedingRecords BreedingRecord[]       @relation("FemaleBreeding")
  maleBreedingRecords   BreedingRecord[]       @relation("MaleBreeding")
  maleBreedingSchedules BreedingSchedule[]     @relation("BreedingScheduleMale")
  femaleBreedingSchedules BreedingSchedule[]   @relation("BreedingScheduleFemale")
  careRecords           CareRecord[]
  tags                  CatTag[]
  breed                 Breed?                 @relation(fields: [breedId], references: [id])
  coatColor             CoatColor?             @relation(fields: [coatColorId], references: [id])
  father                Cat?                   @relation("CatFather", fields: [fatherId], references: [id])
  fatherOf              Cat[]                  @relation("CatFather")
  mother                Cat?                   @relation("CatMother", fields: [motherId], references: [id])
  motherOf              Cat[]                  @relation("CatMother")
  pedigree              Pedigree?              @relation("CatPedigree", fields: [pedigreeId], references: [pedigreeId])
  galleryEntries        GalleryEntry[]         @relation("GalleryEntryCat")
  graduation            Graduation?
  kittenDispositions    KittenDisposition[]
  medicalRecords        MedicalRecord[]
  pregnancyChecks       PregnancyCheck[]       @relation("PregnancyCheckMother")
  scheduleCats          ScheduleCat[]
  schedules             Schedule[]
  tagHistory            TagAssignmentHistory[]
  weightRecords         WeightRecord[]

  @@index([breedId])
  @@index([coatColorId])
  @@index([fatherId])
  @@index([motherId])
  @@index([birthDate])
  @@index([name])
  @@index([gender])
  @@index([isInHouse])
  @@index([isGraduated])
  @@index([registrationNumber])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedId, name])
  @@index([isInHouse, isGraduated])
  @@index([birthDate, gender])
  @@map("cats")
}

model BreedingRecord {
  id              String         @id @default(uuid())
  maleId          String         @map("male_id")
  femaleId        String         @map("female_id")
  breedingDate    DateTime       @map("breeding_date")
  expectedDueDate DateTime?      @map("expected_due_date")
  actualDueDate   DateTime?      @map("actual_due_date")
  numberOfKittens Int?           @map("number_of_kittens")
  notes           String?
  status          BreedingStatus @default(PLANNED)
  recordedBy      String         @map("recorded_by")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  female          Cat            @relation("FemaleBreeding", fields: [femaleId], references: [id])
  male            Cat            @relation("MaleBreeding", fields: [maleId], references: [id])
  recorder        User           @relation(fields: [recordedBy], references: [id])

  @@index([maleId])
  @@index([femaleId])
  @@index([breedingDate])
  @@index([status])
  @@index([recordedBy])
  @@index([maleId, femaleId])
  @@index([maleId, breedingDate])
  @@index([femaleId, breedingDate])
  @@index([breedingDate, status])
  @@map("breeding_records")
}

model BreedingNgRule {
  id               String             @id @default(uuid())
  name             String
  description      String?
  type             BreedingNgRuleType @default(TAG_COMBINATION)
  maleConditions   String[]           @default([]) @map("male_conditions")
  femaleConditions String[]           @default([]) @map("female_conditions")
  maleNames        String[]           @default([]) @map("male_names")
  femaleNames      String[]           @default([]) @map("female_names")
  generationLimit  Int?               @map("generation_limit")
  active           Boolean            @default(true)
  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  @@map("breeding_ng_rules")
}

// 交配スケジュール - 交配期間の管理
model BreedingSchedule {
  id         String                  @id @default(uuid())
  maleId     String                  @map("male_id")
  femaleId   String                  @map("female_id")
  startDate  DateTime                @map("start_date")
  duration   Int                     // 日数
  status     BreedingScheduleStatus  @default(SCHEDULED)
  notes      String?
  recordedBy String                  @map("recorded_by")
  createdAt  DateTime                @default(now()) @map("created_at")
  updatedAt  DateTime                @updatedAt @map("updated_at")

  male       Cat                     @relation("BreedingScheduleMale", fields: [maleId], references: [id])
  female     Cat                     @relation("BreedingScheduleFemale", fields: [femaleId], references: [id])
  recorder   User                    @relation(fields: [recordedBy], references: [id])
  checks     MatingCheck[]

  @@index([maleId])
  @@index([femaleId])
  @@index([startDate])
  @@index([status])
  @@index([maleId, startDate])
  @@index([femaleId, startDate])
  @@map("breeding_schedules")
}

// 交配チェック - 交配確認回数の記録
model MatingCheck {
  id         String           @id @default(uuid())
  scheduleId String           @map("schedule_id")
  checkDate  DateTime         @map("check_date")
  count      Int              @default(1)
  createdAt  DateTime         @default(now()) @map("created_at")

  schedule   BreedingSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@index([checkDate])
  @@map("mating_checks")
}

enum BreedingScheduleStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model PregnancyCheck {
  id         String          @id @default(uuid())
  checkDate  DateTime        @map("check_date")
  status     PregnancyStatus @default(SUSPECTED)
  notes      String?
  recordedBy String          @map("recorded_by")
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")
  motherId   String          @map("mother_id")
  fatherId   String?         @map("father_id")
  matingDate DateTime?       @map("mating_date")
  mother     Cat             @relation("PregnancyCheckMother", fields: [motherId], references: [id])
  recorder   User            @relation(fields: [recordedBy], references: [id])

  @@index([motherId])
  @@index([fatherId])
  @@index([checkDate])
  @@index([status])
  @@index([recordedBy])
  @@index([motherId, checkDate])
  @@index([status, checkDate])
  @@map("pregnancy_checks")
}

model BirthPlan {
  id                 String              @id @default(uuid())
  status             BirthStatus         @default(EXPECTED)
  notes              String?
  recordedBy         String              @map("recorded_by")
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  actualBirthDate    DateTime?           @map("actual_birth_date")
  actualKittens      Int?                @map("actual_kittens")
  expectedBirthDate  DateTime            @map("expected_birth_date")
  expectedKittens    Int?                @map("expected_kittens")
  motherId           String              @map("mother_id")
  fatherId           String?             @map("father_id")
  matingDate         DateTime?           @map("mating_date")
  completedAt        DateTime?           @map("completed_at")
  mother             Cat                 @relation("BirthPlanMother", fields: [motherId], references: [id])
  recorder           User                @relation(fields: [recordedBy], references: [id])
  kittenDispositions KittenDisposition[]

  @@index([motherId])
  @@index([fatherId])
  @@index([expectedBirthDate])
  @@index([status])
  @@index([recordedBy])
  @@index([actualBirthDate])
  @@index([motherId, expectedBirthDate])
  @@index([status, expectedBirthDate])
  @@index([expectedBirthDate, status])
  @@map("birth_plans")
}

model KittenDisposition {
  id                String          @id @default(uuid())
  birthRecordId     String          @map("birth_record_id")
  kittenId          String?         @map("kitten_id")
  name              String
  gender            String
  disposition       DispositionType
  trainingStartDate DateTime?       @map("training_start_date")
  saleInfo          Json?           @map("sale_info")
  deathDate         DateTime?       @map("death_date")
  deathReason       String?         @map("death_reason")
  notes             String?
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  birthRecord       BirthPlan       @relation(fields: [birthRecordId], references: [id], onDelete: Cascade)
  kitten            Cat?            @relation(fields: [kittenId], references: [id])

  @@index([birthRecordId])
  @@index([kittenId])
  @@map("kitten_dispositions")
}

model CareRecord {
  id           String    @id @default(uuid())
  catId        String    @map("cat_id")
  careType     CareType  @map("care_type")
  description  String
  careDate     DateTime  @map("care_date")
  nextDueDate  DateTime? @map("next_due_date")
  cost         Float?
  veterinarian String?
  notes        String?
  recordedBy   String    @map("recorded_by")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  cat          Cat       @relation(fields: [catId], references: [id])
  recorder     User      @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([careDate])
  @@index([careType])
  @@index([recordedBy])
  @@index([nextDueDate])
  @@index([catId, careDate])
  @@index([catId, careType])
  @@index([careType, careDate])
  @@index([nextDueDate, careType])
  @@map("care_records")
}

// 体重記録モデル - 子猫の体重推移を追跡
model WeightRecord {
  id         String   @id @default(uuid())
  catId      String   @map("cat_id")
  weight     Float    // グラム単位
  recordedAt DateTime @default(now()) @map("recorded_at")
  notes      String?
  recordedBy String   @map("recorded_by")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  recorder   User     @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([recordedAt])
  @@index([catId, recordedAt])
  @@map("weight_records")
}

model Schedule {
  id             String             @id @default(uuid())
  title          String
  description    String?
  scheduleDate   DateTime           @map("schedule_date")
  scheduleType   ScheduleType       @map("schedule_type")
  status         ScheduleStatus     @default(PENDING)
  priority       Priority           @default(MEDIUM)
  catId          String?            @map("cat_id")
  assignedTo     String             @map("assigned_to")
  createdAt      DateTime           @default(now()) @map("created_at")
  updatedAt      DateTime           @updatedAt @map("updated_at")
  careType       CareType?          @map("care_type")
  endDate        DateTime?          @map("end_date")
  name           String             @map("name")
  recurrenceRule String?            @map("recurrence_rule")
  timezone       String?            @map("timezone")
  medicalRecords MedicalRecord[]
  scheduleCats   ScheduleCat[]
  reminders      ScheduleReminder[]
  tags           ScheduleTag[]
  assignee       User               @relation(fields: [assignedTo], references: [id])
  cat            Cat?               @relation(fields: [catId], references: [id])

  @@index([scheduleDate])
  @@index([endDate])
  @@index([status])
  @@index([catId])
  @@index([assignedTo])
  @@index([careType])
  @@index([scheduleType])
  @@index([priority])
  @@index([scheduleDate, status])
  @@index([catId, scheduleDate])
  @@index([assignedTo, scheduleDate])
  @@index([scheduleType, scheduleDate])
  @@index([status, priority])
  @@map("schedules")
}

model ScheduleReminder {
  id              String                   @id @default(uuid())
  scheduleId      String                   @map("schedule_id")
  timingType      ReminderTimingType       @map("timing_type")
  remindAt        DateTime?                @map("remind_at")
  offsetValue     Int?                     @map("offset_value")
  offsetUnit      ReminderOffsetUnit?      @map("offset_unit")
  relativeTo      ReminderRelativeTo?      @map("relative_to")
  channel         ReminderChannel          @map("channel")
  repeatFrequency ReminderRepeatFrequency? @map("repeat_frequency")
  repeatInterval  Int?                     @map("repeat_interval")
  repeatCount     Int?                     @map("repeat_count")
  repeatUntil     DateTime?                @map("repeat_until")
  notes           String?
  isActive        Boolean                  @default(true) @map("is_active")
  createdAt       DateTime                 @default(now()) @map("created_at")
  updatedAt       DateTime                 @updatedAt @map("updated_at")
  schedule        Schedule                 @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@map("schedule_reminders")
}

model CareTag {
  id           String        @id @default(uuid())
  slug         String        @unique
  label        String
  level        Int           @default(1)
  parentId     String?       @map("parent_id")
  description  String?
  isActive     Boolean       @default(true) @map("is_active")
  priority     Int?
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  parent       CareTag?      @relation("CareTagHierarchy", fields: [parentId], references: [id])
  children     CareTag[]     @relation("CareTagHierarchy")
  scheduleTags ScheduleTag[]

  @@index([parentId])
  @@index([level])
  @@map("care_tags")
}

model ScheduleTag {
  scheduleId String   @map("schedule_id")
  careTagId  String   @map("care_tag_id")
  createdAt  DateTime @default(now()) @map("created_at")
  careTag    CareTag  @relation(fields: [careTagId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, careTagId])
  @@map("schedule_tags")
}

model ScheduleCat {
  scheduleId String   @map("schedule_id")
  catId      String   @map("cat_id")
  createdAt  DateTime @default(now()) @map("created_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, catId])
  @@map("schedule_cats")
}

model MedicalVisitType {
  id           String          @id @default(uuid())
  key          String?         @unique
  name         String
  description  String?
  displayOrder Int             @default(0) @map("display_order")
  isActive     Boolean         @default(true) @map("is_active")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")
  records      MedicalRecord[]

  @@index([displayOrder])
  @@map("medical_visit_types")
}

model MedicalRecord {
  id             String                    @id @default(uuid())
  catId          String                    @map("cat_id")
  scheduleId     String?                   @map("schedule_id")
  recordedBy     String                    @map("recorded_by")
  visitDate      DateTime                  @map("visit_date")
  symptomDetails Json?                     @map("symptom_details")
  diagnosis      String?                   @map("diagnosis")
  treatmentPlan  String?                   @map("treatment_plan")
  medications    Json?                     @map("medications")
  followUpDate   DateTime?                 @map("follow_up_date")
  status         MedicalRecordStatus       @default(TREATING)
  notes          String?
  createdAt      DateTime                  @default(now()) @map("created_at")
  updatedAt      DateTime                  @updatedAt @map("updated_at")
  diseaseName    String?                   @map("disease_name")
  symptom        String?                   @map("symptom")
  hospitalName   String?                   @map("hospital_name")
  visitTypeId    String?                   @map("visit_type_id")
  attachments    MedicalRecordAttachment[]
  tags           MedicalRecordTag[]
  cat            Cat                       @relation(fields: [catId], references: [id])
  recorder       User                      @relation(fields: [recordedBy], references: [id])
  schedule       Schedule?                 @relation(fields: [scheduleId], references: [id])
  visitType      MedicalVisitType?         @relation(fields: [visitTypeId], references: [id])

  @@index([catId])
  @@index([visitDate])
  @@index([scheduleId])
  @@index([visitTypeId])
  @@index([status])
  @@index([recordedBy])
  @@index([catId, visitDate])
  @@index([visitTypeId, visitDate])
  @@index([status, visitDate])
  @@map("medical_records")
}

model MedicalRecordAttachment {
  id              String        @id @default(uuid())
  medicalRecordId String        @map("medical_record_id")
  url             String
  fileName        String?       @map("file_name")
  fileType        String?       @map("file_type")
  fileSize        Int?          @map("file_size")
  capturedAt      DateTime?     @map("captured_at")
  description     String?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)

  @@index([medicalRecordId])
  @@map("medical_record_attachments")
}

model MedicalRecordTag {
  medicalRecordId String        @map("medical_record_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  tagId           String        @map("tag_id")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)
  tag             Tag           @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([medicalRecordId, tagId])
  @@map("medical_record_tags")
}

model TagCategory {
  id           String     @id @default(uuid())
  key          String     @unique
  name         String
  description  String?
  color        String?    @default("#3B82F6")
  displayOrder Int        @default(0) @map("display_order")
  scopes       String[]   @default([])
  isActive     Boolean    @default(true) @map("is_active")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  textColor    String?    @default("#111827") @map("text_color")
  groups       TagGroup[]

  @@map("tag_categories")
}

model TagGroup {
  id           String      @id @default(uuid())
  categoryId   String      @map("category_id")
  name         String
  description  String?
  displayOrder Int         @default(0) @map("display_order")
  isActive     Boolean     @default(true) @map("is_active")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")
  color        String?     @default("#3B82F6")
  textColor    String?     @default("#111827") @map("text_color")
  category     TagCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  tags         Tag[]

  @@unique([categoryId, name])
  @@map("tag_groups")
}

model Tag {
  id                String                 @id @default(uuid())
  name              String
  color             String                 @default("#3B82F6")
  description       String?
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  displayOrder      Int                    @default(0) @map("display_order")
  allowsManual      Boolean                @default(true) @map("allows_manual")
  allowsAutomation  Boolean                @default(true) @map("allows_automation")
  metadata          Json?
  isActive          Boolean                @default(true) @map("is_active")
  groupId           String                 @map("group_id")
  textColor         String                 @default("#FFFFFF") @map("text_color")
  cats              CatTag[]
  medicalRecordTags MedicalRecordTag[]
  history           TagAssignmentHistory[]
  group             TagGroup               @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([groupId, name])
  @@index([groupId])
  @@map("tags")
}

model Pedigree {
  id               String     @id @default(uuid())
  pedigreeId       String     @unique @map("pedigree_id")
  title            String?    @map("title")
  catName          String?    @map("cat_name")
  catName2         String?    @map("cat_name2")
  breedCode        Int?       @map("breed_code")
  genderCode       Int?       @map("gender_code")
  eyeColor         String?    @map("eye_color")
  coatColorCode    Int?       @map("coat_color_code")
  birthDate        String?    @map("birth_date")
  breederName      String?    @map("breeder_name")
  ownerName        String?    @map("owner_name")
  registrationDate String?    @map("registration_date")
  brotherCount     Int?       @map("brother_count")
  sisterCount      Int?       @map("sister_count")
  notes            String?    @map("notes")
  notes2           String?    @map("notes2")
  otherNo          String?    @map("other_no")
  fatherTitle      String?    @map("father_title")
  fatherCatName    String?    @map("father_cat_name")
  fatherCatName2   String?    @map("father_cat_name2")
  fatherCoatColor  String?    @map("father_coat_color")
  fatherEyeColor   String?    @map("father_eye_color")
  fatherJCU        String?    @map("father_jcu")
  fatherOtherCode  String?    @map("father_other_code")
  motherTitle      String?    @map("mother_title")
  motherCatName    String?    @map("mother_cat_name")
  motherCatName2   String?    @map("mother_cat_name2")
  motherCoatColor  String?    @map("mother_coat_color")
  motherEyeColor   String?    @map("mother_eye_color")
  motherJCU        String?    @map("mother_jcu")
  motherOtherCode  String?    @map("mother_other_code")
  ffTitle          String?    @map("ff_title")
  ffCatName        String?    @map("ff_cat_name")
  ffCatColor       String?    @map("ff_cat_color")
  fmTitle          String?    @map("fm_title")
  fmCatName        String?    @map("fm_cat_name")
  fmCatColor       String?    @map("fm_cat_color")
  mfTitle          String?    @map("mf_title")
  mfCatName        String?    @map("mf_cat_name")
  mfCatColor       String?    @map("mf_cat_color")
  mmTitle          String?    @map("mm_title")
  mmCatName        String?    @map("mm_cat_name")
  mmCatColor       String?    @map("mm_cat_color")
  fffTitle         String?    @map("fff_title")
  fffCatName       String?    @map("fff_cat_name")
  fffCatColor      String?    @map("fff_cat_color")
  ffmTitle         String?    @map("ffm_title")
  ffmCatName       String?    @map("ffm_cat_name")
  ffmCatColor      String?    @map("ffm_cat_color")
  fmfTitle         String?    @map("fmf_title")
  fmfCatName       String?    @map("fmf_cat_name")
  fmfCatColor      String?    @map("fmf_cat_color")
  fmmTitle         String?    @map("fmm_title")
  fmmCatName       String?    @map("fmm_cat_name")
  fmmCatColor      String?    @map("fmm_cat_color")
  mffTitle         String?    @map("mff_title")
  mffCatName       String?    @map("mff_cat_name")
  mffCatColor      String?    @map("mff_cat_color")
  mfmTitle         String?    @map("mfm_title")
  mfmCatName       String?    @map("mfm_cat_name")
  mfmCatColor      String?    @map("mfm_cat_color")
  mmfTitle         String?    @map("mmf_title")
  mmfCatName       String?    @map("mmf_cat_name")
  mmfCatColor      String?    @map("mmf_cat_color")
  mmmTitle         String?    @map("mmm_title")
  mmmCatName       String?    @map("mmm_cat_name")
  mmmCatColor      String?    @map("mmm_cat_color")
  oldCode          String?    @map("old_code")
  createdAt        DateTime   @default(now()) @map("created_at")
  updatedAt        DateTime   @updatedAt @map("updated_at")
  fffjcu           String?    @map("fffjcu")
  ffjcu            String?    @map("ffjcu")
  ffmjcu           String?    @map("ffmjcu")
  fmfjcu           String?    @map("fmfjcu")
  fmjcu            String?    @map("fmjcu")
  fmmjcu           String?    @map("fmmjcu")
  mffjcu           String?    @map("mffjcu")
  mfjcu            String?    @map("mfjcu")
  mfmjcu           String?    @map("mfmjcu")
  mmfjcu           String?    @map("mmfjcu")
  mmjcu            String?    @map("mmjcu")
  mmmjcu           String?    @map("mmmjcu")
  cats             Cat[]      @relation("CatPedigree")
  breed            Breed?     @relation(fields: [breedCode], references: [code])
  coatColor        CoatColor? @relation(fields: [coatColorCode], references: [code])
  gender           Gender?    @relation(fields: [genderCode], references: [code])

  @@index([breedCode])
  @@index([genderCode])
  @@index([coatColorCode])
  @@index([catName])
  @@index([pedigreeId])
  @@index([catName2])
  @@index([eyeColor])
  @@index([breederName])
  @@index([ownerName])
  @@index([birthDate])
  @@index([registrationDate])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedCode, catName])
  @@map("pedigrees")
}

model CatTag {
  catId     String   @map("cat_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  cat       Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([catId, tagId])
  @@map("cat_tags")
}

model TagAutomationRule {
  id          String                   @id @default(uuid())
  key         String                   @unique
  name        String
  description String?
  triggerType TagAutomationTriggerType @map("trigger_type")
  eventType   TagAutomationEventType   @map("event_type")
  scope       String?                  @map("scope")
  isActive    Boolean                  @default(true) @map("is_active")
  priority    Int                      @default(0)
  config      Json?                    @map("config")
  createdAt   DateTime                 @default(now()) @map("created_at")
  updatedAt   DateTime                 @updatedAt @map("updated_at")
  history     TagAssignmentHistory[]
  runs        TagAutomationRun[]

  @@map("tag_automation_rules")
}

model TagAutomationRun {
  id           String                 @id @default(uuid())
  ruleId       String                 @map("rule_id")
  eventPayload Json?                  @map("event_payload")
  status       TagAutomationRunStatus @default(PENDING) @map("status")
  startedAt    DateTime?              @map("started_at")
  completedAt  DateTime?              @map("completed_at")
  errorMessage String?                @map("error_message")
  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")
  history      TagAssignmentHistory[]
  rule         TagAutomationRule      @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@index([ruleId])
  @@map("tag_automation_runs")
}

model TagAssignmentHistory {
  id              String              @id @default(uuid())
  catId           String              @map("cat_id")
  tagId           String              @map("tag_id")
  ruleId          String?             @map("rule_id")
  automationRunId String?             @map("automation_run_id")
  action          TagAssignmentAction @default(ASSIGNED)
  source          TagAssignmentSource @default(MANUAL)
  reason          String?
  metadata        Json?
  createdAt       DateTime            @default(now()) @map("created_at")
  automationRun   TagAutomationRun?   @relation(fields: [automationRunId], references: [id])
  cat             Cat                 @relation(fields: [catId], references: [id], onDelete: Cascade)
  rule            TagAutomationRule?  @relation(fields: [ruleId], references: [id])
  tag             Tag                 @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@index([catId])
  @@index([tagId])
  @@index([ruleId])
  @@index([automationRunId])
  @@map("tag_assignment_history")
}

model Staff {
  id               String              @id @default(uuid())
  userId           String?             @unique @map("user_id")
  name             String
  email            String?             @unique
  role             String              @default("スタッフ")
  color            String              @default("#4dabf7")
  isActive         Boolean             @default(true) @map("is_active")
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  workTimeTemplate Json?               @map("work_time_template")
  workingDays      Json?               @map("working_days")
  shifts           Shift[]
  user             User?               @relation(fields: [userId], references: [id])
  availabilities   StaffAvailability[]

  @@index([userId])
  @@index([name])
  @@index([email])
  @@index([isActive])
  @@index([isActive, role])
  @@map("staff")
}

model ShiftTemplate {
  id           String   @id @default(uuid())
  name         String
  startTime    String   @map("start_time")
  endTime      String   @map("end_time")
  duration     Int
  color        String   @default("#4dabf7")
  breakTime    Int      @default(0) @map("break_time")
  isActive     Boolean  @default(true) @map("is_active")
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  shifts       Shift[]

  @@index([name])
  @@index([displayOrder])
  @@map("shift_templates")
}

model Shift {
  id              String         @id @default(uuid())
  staffId         String         @map("staff_id")
  shiftDate       DateTime       @map("shift_date")
  displayName     String?        @map("display_name")
  templateId      String?        @map("template_id")
  startTime       DateTime?      @map("start_time")
  endTime         DateTime?      @map("end_time")
  breakDuration   Int?           @map("break_duration")
  status          ShiftStatus    @default(SCHEDULED)
  notes           String?
  actualStartTime DateTime?      @map("actual_start_time")
  actualEndTime   DateTime?      @map("actual_end_time")
  metadata        Json?
  mode            ShiftMode      @default(SIMPLE)
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  tasks           ShiftTask[]
  staff           Staff          @relation(fields: [staffId], references: [id], onDelete: Cascade)
  template        ShiftTemplate? @relation(fields: [templateId], references: [id])

  @@index([staffId])
  @@index([templateId])
  @@index([shiftDate])
  @@index([status])
  @@index([mode])
  @@index([staffId, shiftDate])
  @@index([shiftDate, status])
  @@index([status, shiftDate])
  @@map("shifts")
}

model ShiftTask {
  id          String     @id @default(uuid())
  shiftId     String     @map("shift_id")
  taskType    String     @map("task_type")
  description String
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(PENDING)
  startTime   DateTime?  @map("start_time")
  endTime     DateTime?  @map("end_time")
  notes       String?
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  shift       Shift      @relation(fields: [shiftId], references: [id], onDelete: Cascade)

  @@index([shiftId])
  @@index([status])
  @@map("shift_tasks")
}

model StaffAvailability {
  id          String   @id @default(uuid())
  staffId     String   @map("staff_id")
  dayOfWeek   Int      @map("day_of_week")
  startTime   String   @map("start_time")
  endTime     String   @map("end_time")
  isAvailable Boolean  @default(true) @map("is_available")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  staff       Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId])
  @@index([dayOfWeek])
  @@index([isAvailable])
  @@index([staffId, dayOfWeek])
  @@index([dayOfWeek, isAvailable])
  @@map("staff_availabilities")
}

model ShiftSettings {
  id                       String    @id @default(uuid())
  organizationId           String?   @map("organization_id")
  defaultMode              ShiftMode @default(SIMPLE) @map("default_mode")
  enabledModes             String[]  @default(["SIMPLE", "DETAILED"]) @map("enabled_modes")
  simpleRequireDisplayName Boolean   @default(false) @map("simple_require_display_name")
  detailedRequireTime      Boolean   @default(true) @map("detailed_require_time")
  detailedRequireTemplate  Boolean   @default(false) @map("detailed_require_template")
  detailedEnableTasks      Boolean   @default(true) @map("detailed_enable_tasks")
  detailedEnableActual     Boolean   @default(true) @map("detailed_enable_actual")
  customFields             Json?     @map("custom_fields")
  createdAt                DateTime  @default(now()) @map("created_at")
  updatedAt                DateTime  @updatedAt @map("updated_at")

  @@map("shift_settings")
}

model Graduation {
  id            String   @id @default(uuid())
  catId         String   @unique @map("cat_id")
  transferDate  DateTime @map("transfer_date")
  destination   String
  notes         String?
  catSnapshot   Json     @map("cat_snapshot")
  transferredBy String?  @map("transferred_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  cat           Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)

  @@index([transferDate])
  @@index([catId])
  @@map("graduations")
}

model GalleryEntry {
  id            String          @id @default(uuid())
  category      GalleryCategory
  name          String
  gender        String
  coatColor     String?         @map("coat_color")
  breed         String?
  catId         String?         @map("cat_id")
  transferDate  DateTime?       @map("transfer_date")
  destination   String?
  externalLink  String?         @map("external_link")
  transferredBy String?         @map("transferred_by")
  catSnapshot   Json?           @map("cat_snapshot")
  notes         String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cat           Cat?            @relation("GalleryEntryCat", fields: [catId], references: [id])
  media         GalleryMedia[]

  @@index([category])
  @@index([catId])
  @@index([createdAt])
  @@index([category, createdAt])
  @@map("gallery_entries")
}

model GalleryMedia {
  id             String       @id @default(uuid())
  galleryEntryId String       @map("gallery_entry_id")
  type           MediaType
  url            String
  thumbnailUrl   String?      @map("thumbnail_url")
  order          Int          @default(0)
  createdAt      DateTime     @default(now()) @map("created_at")
  galleryEntry   GalleryEntry @relation(fields: [galleryEntryId], references: [id], onDelete: Cascade)

  @@index([galleryEntryId])
  @@index([order])
  @@map("gallery_media")
}

// ==========================================
// Pedigree Print Settings
// ==========================================

model PedigreePrintSetting {
  id        String   @id @default(uuid())
  tenantId  String?  @map("tenant_id")
  globalKey String?  @unique @map("global_key")
  settings  Json
  version   Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  tenant    Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId])
  @@map("pedigree_print_settings")
}

// ==========================================
// Print Template Management
// ==========================================

model PrintTemplate {
  id                String                @id @default(uuid())
  tenantId          String?               @map("tenant_id") // null = 共通テンプレート
  name              String
  description       String?
  category          PrintTemplateCategory @default(PEDIGREE)
  paperWidth        Int                   @map("paper_width")    // mm単位
  paperHeight       Int                   @map("paper_height")   // mm単位
  backgroundUrl     String?               @map("background_url")
  backgroundOpacity Int                   @default(100) @map("background_opacity") // 0-100%
  positions         Json                  // フィールド座標設定
  fontSizes         Json?                 @map("font_sizes")     // フォントサイズ設定
  isActive          Boolean               @default(true) @map("is_active")
  isDefault         Boolean               @default(false) @map("is_default")
  displayOrder      Int                   @default(0) @map("display_order")
  createdAt         DateTime              @default(now()) @map("created_at")
  updatedAt         DateTime              @updatedAt @map("updated_at")

  @@index([tenantId])
  @@index([category])
  @@index([isActive])
  @@index([name])
  @@index([tenantId, category, isActive])
  @@map("print_templates")
}

enum PrintTemplateCategory {
  PEDIGREE           // 血統書
  KITTEN_TRANSFER    // 子猫譲渡証明書
  HEALTH_CERTIFICATE // 健康診断書
  VACCINATION_RECORD // ワクチン接種記録
  BREEDING_RECORD    // 繁殖記録
  CONTRACT           // 契約書
  INVOICE            // 請求書/領収書
  CUSTOM             // カスタム書類
}

enum DisplayNameMode {
  CANONICAL
  CODE_AND_NAME
  CUSTOM
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  TENANT_ADMIN
}

enum BreedingStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum PregnancyStatus {
  CONFIRMED
  SUSPECTED
  NEGATIVE
  ABORTED
}

enum BirthStatus {
  EXPECTED
  BORN
  ABORTED
  STILLBORN
}

enum DispositionType {
  TRAINING
  SALE
  DECEASED
}

enum BreedingNgRuleType {
  TAG_COMBINATION
  INDIVIDUAL_PROHIBITION
  GENERATION_LIMIT
}

enum CareType {
  VACCINATION
  HEALTH_CHECK
  GROOMING
  DENTAL_CARE
  MEDICATION
  SURGERY
  OTHER
}

enum ScheduleType {
  BREEDING
  CARE
  APPOINTMENT
  REMINDER
  MAINTENANCE
}

enum ScheduleStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ReminderTimingType {
  ABSOLUTE
  RELATIVE
}

enum ReminderOffsetUnit {
  MINUTE
  HOUR
  DAY
  WEEK
  MONTH
}

enum ReminderRelativeTo {
  START_DATE
  END_DATE
  CUSTOM_DATE
}

enum ReminderChannel {
  IN_APP
  EMAIL
  SMS
  PUSH
}

enum ReminderRepeatFrequency {
  NONE
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  CUSTOM
}

enum MedicalRecordStatus {
  TREATING
  COMPLETED
}

enum TagAssignmentAction {
  ASSIGNED
  UNASSIGNED
}

enum TagAssignmentSource {
  MANUAL
  AUTOMATION
  SYSTEM
}

enum TagAutomationTriggerType {
  EVENT
  SCHEDULE
  MANUAL
}

enum TagAutomationEventType {
  BREEDING_PLANNED
  BREEDING_CONFIRMED
  PREGNANCY_CONFIRMED
  KITTEN_REGISTERED
  AGE_THRESHOLD
  CUSTOM
  PAGE_ACTION
  TAG_ASSIGNED
}

enum TagAutomationRunStatus {
  PENDING
  COMPLETED
  FAILED
}

enum ShiftMode {
  SIMPLE
  DETAILED
  CUSTOM
}

enum ShiftStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  ABSENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum GalleryCategory {
  KITTEN
  FATHER
  MOTHER
  GRADUATION
}

enum MediaType {
  IMAGE
  YOUTUBE
}
```

## File: frontend/src/app/tags/components/AutomationRuleModal.tsx
```typescript
'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Group,
  MultiSelect,
  NumberInput,
  Radio,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import { UnifiedModal, type ModalSection } from '@/components/common';

import type { AutomationRuleFormValues, RuleType, ActionType } from '../types';
import {
  RULE_TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
  AGE_TYPE_OPTIONS,
  PAGE_OPTIONS,
} from '../constants';

export type AutomationRuleModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<AutomationRuleFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  automationTagOptions: { value: string; label: string }[];
  pageActionOptions: { value: string; label: string }[];
};

/**
 * 自動化ルール編集/作成モーダル（シンプル化版）
 */
export function AutomationRuleModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  automationTagOptions,
  pageActionOptions,
}: AutomationRuleModalProps) {
  const ruleType = form.values.ruleType;
  const actionType = form.values.actionType;

  // TAG_ASSIGNEDは削除専用
  const isTagAssignedRule = ruleType === 'TAG_ASSIGNED';
  
  // TAG_ASSIGNED選択時は自動的に削除アクションに設定
  const handleRuleTypeChange = (value: RuleType) => {
    form.setFieldValue('ruleType', value);
    if (value === 'TAG_ASSIGNED') {
      form.setFieldValue('actionType', 'REMOVE');
    }
  };

  const sections: ModalSection[] = [
    {
      content: (
        <Box component="form" onSubmit={onSubmit}>
          <Stack gap="md" p="md">
            {/* ルールタイプ選択 */}
            <Radio.Group
            label="いつ実行するか"
            value={ruleType}
            onChange={(value) => handleRuleTypeChange(value as RuleType)}
          >
            <Stack gap="xs" mt="xs">
              {RULE_TYPE_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value} label={option.label} />
              ))}
            </Stack>
          </Radio.Group>

          <Divider />

          {/* 条件設定エリア */}
          <Card withBorder padding="md" bg="gray.0">
            <Stack gap="md">
              {/* イベント発生時 */}
              {ruleType === 'PAGE_ACTION' && (
                <>
                  <Select
                    label="どこで"
                    placeholder="ページを選択"
                    data={PAGE_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
                    value={form.values.pageAction.page}
                    onChange={(value) => {
                      form.setFieldValue('pageAction.page', value || '');
                      form.setFieldValue('pageAction.action', '');
                    }}
                    required
                  />
                  {form.values.pageAction.page && (
                    <Select
                      label="何が発生したら"
                      placeholder="アクションを選択"
                      data={pageActionOptions}
                      value={form.values.pageAction.action}
                      onChange={(value) => form.setFieldValue('pageAction.action', value || '')}
                      required
                    />
                  )}
                </>
              )}

              {/* 年齢条件 */}
              {ruleType === 'AGE_THRESHOLD' && (
                <>
                  <Radio.Group
                    label="対象"
                    value={form.values.ageThreshold.ageType}
                    onChange={(value) => form.setFieldValue('ageThreshold.ageType', value as 'days' | 'months')}
                  >
                    <Group mt="xs">
                      {AGE_TYPE_OPTIONS.map((option) => (
                        <Radio key={option.value} value={option.value} label={option.label} />
                      ))}
                    </Group>
                  </Radio.Group>
                  <NumberInput
                    label={`生後${form.values.ageThreshold.ageType === 'days' ? '日数' : '月数'}`}
                    description={`この${form.values.ageThreshold.ageType === 'days' ? '日数' : '月数'}に達したら実行`}
                    placeholder="例: 60"
                    min={1}
                    value={form.values.ageThreshold.threshold}
                    onChange={(value) => form.setFieldValue('ageThreshold.threshold', typeof value === 'number' ? value : 0)}
                    required
                  />
                </>
              )}

              {/* タグ付与時（削除専用） */}
              {ruleType === 'TAG_ASSIGNED' && (
                <>
                  <Select
                    label="このタグが付与されたら"
                    placeholder="トリガーとなるタグを選択"
                    data={automationTagOptions}
                    value={form.values.triggerTagId}
                    onChange={(value) => form.setFieldValue('triggerTagId', value || '')}
                    searchable
                    required
                  />
                  <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                    選択したタグが付与されると、下で指定したタグが自動的に削除されます。
                  </Alert>
                </>
              )}
            </Stack>
          </Card>

          <Divider />

          {/* アクション選択 */}
          <Radio.Group
            label="何をするか"
            value={actionType}
            onChange={(value) => form.setFieldValue('actionType', value as ActionType)}
          >
            <Group mt="xs">
              {ACTION_TYPE_OPTIONS.map((option) => (
                <Radio 
                  key={option.value} 
                  value={option.value} 
                  label={option.label}
                  disabled={isTagAssignedRule && option.value === 'ASSIGN'}
                />
              ))}
            </Group>
          </Radio.Group>

          {/* 対象タグ */}
          <MultiSelect
            label={actionType === 'ASSIGN' ? '付与するタグ' : '削除するタグ'}
            placeholder="タグを選択"
            description="自動化が許可されているタグのみ選択できます"
            data={automationTagOptions}
            value={form.values.tagIds}
            onChange={(value) => form.setFieldValue('tagIds', value)}
            searchable
            required
            maxDropdownHeight={300}
            error={form.errors.tagIds}
          />

          <Divider label="オプション" labelPosition="center" />

          {/* ルール名（任意） */}
          <TextInput
            label="ルール名（任意）"
            placeholder="例: 新規猫登録時のタグ付与"
            description="空欄の場合は自動生成されます"
            value={form.values.name}
            onChange={(e) => form.setFieldValue('name', e.currentTarget.value)}
          />

          {/* メモ */}
          <TextInput
            label="メモ（任意）"
            placeholder="このルールの説明"
            value={form.values.description}
            onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
          />

          {/* アクティブスイッチ */}
          <Switch
            label="このルールを有効にする"
            checked={form.values.isActive}
            onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
          />

          {/* 設定サマリー */}
          <Card withBorder padding="sm" bg="blue.0">
            <Stack gap={4}>
              <Text size="sm" fw={500}>設定内容</Text>
              <Text size="xs" c="dimmed">
                {ruleType === 'PAGE_ACTION' && form.values.pageAction.page && form.values.pageAction.action && (
                  <>
                    📍 {PAGE_OPTIONS.find(p => p.value === form.values.pageAction.page)?.label}で
                    「{pageActionOptions.find(a => a.value === form.values.pageAction.action)?.label}」が発生したら
                  </>
                )}
                {ruleType === 'AGE_THRESHOLD' && form.values.ageThreshold.threshold > 0 && (
                  <>
                    📅 生後{form.values.ageThreshold.threshold}{form.values.ageThreshold.ageType === 'days' ? '日' : 'ヶ月'}に達したら
                  </>
                )}
                {ruleType === 'TAG_ASSIGNED' && form.values.triggerTagId && (
                  <>
                    🏷️ 「{automationTagOptions.find(t => t.value === form.values.triggerTagId)?.label}」が付与されたら
                  </>
                )}
              </Text>
              <Text size="xs">
                {actionType === 'ASSIGN' ? '→ タグを付与' : '→ タグを削除'}
                {form.values.tagIds.length > 0 && ` (${form.values.tagIds.length}件)`}
              </Text>
            </Stack>
            </Card>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEditing ? '更新' : '作成'}
              </Button>
            </Group>
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title={isEditing ? '自動化ルールの編集' : '自動化ルールの作成'}
      size="lg"
      addContentPadding={false}
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/tags/page.tsx
```typescript
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  Container,
  Group,
  Loader,
  Stack,
  Switch,
  Tabs,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconFolderPlus,
  IconPlus,
  IconRobot,
  IconTag,
  IconTags,
} from '@tabler/icons-react';

import { useContextMenu } from '@/components/context-menu/use-context-menu';
import { OperationModalManager } from '@/components/context-menu/operation-modal-manager';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import type {
  TagCategoryView,
  TagGroupView,
  TagView,
  CreateTagGroupRequest,
  UpdateTagCategoryRequest,
  UpdateTagGroupRequest,
  UpdateTagRequest,
} from '@/lib/api/hooks/use-tags';
import type {
  TagAutomationRule,
  CreateTagAutomationRuleRequest,
  UpdateTagAutomationRuleRequest,
} from '@/lib/api/hooks/use-tag-automation';

import type {
  CategoryFormValues,
  TagFormValues,
  GroupFormValues,
  AutomationRuleFormValues,
} from './types';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
  DEFAULT_GROUP_COLOR,
  DEFAULT_GROUP_TEXT_COLOR,
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
  CATEGORY_SCOPE_OPTIONS,
  PAGE_ACTIONS_MAP,
} from './constants';
import { buildCategoryPayload, buildTagPayload, sortGroups } from './utils';
import { useTagPageData } from './hooks/useTagPageData';
import { useAutomationRulesData } from './hooks/useAutomationRulesData';
import {
  CategoriesTab,
  TagsListTab,
  AutomationTab,
  CategoryModal,
  GroupModal,
  TagModal,
  AutomationRuleModal,
  ExecuteRuleModal,
} from './components';

import { ActionMenu } from '@/app/tenants/_components/ActionMenu';

// 有効なタブ値の型定義
type TabValue = 'categories' | 'tags' | 'automation';
const VALID_TABS: TabValue[] = ['categories', 'tags', 'automation'];

export default function TagsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URLパラメータからタブ状態を取得（無効な値の場合はデフォルトの 'categories' を使用）
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = VALID_TABS.includes(tabParam as TabValue) 
    ? (tabParam as TabValue) 
    : 'categories';

  const { setPageHeader } = usePageHeader();

  // タブ切り替え時にURLを更新
  const handleTabChange = (nextTab: string | null) => {
    if (!nextTab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // データ取得
  const {
    filters,
    setFilters,
    isLoading,
    isFetching,
    sortedCategories,
    flatTags,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategoriesMutation,
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroupsMutation,
    createTag,
    updateTag,
    deleteTag,
    reorderTagsMutation,
    colorDefaults,
    updateTagColorDefaults,
    isCategorySubmitting,
    isGroupSubmitting,
    isTagSubmitting,
    isAnyMutationPending,
  } = useTagPageData();

  const {
    isLoadingAutomationRules,
    automationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    executeAutomationRule,
  } = useAutomationRulesData();

  // 編集状態
  const [editingCategory, setEditingCategory] = useState<TagCategoryView | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ category: TagCategoryView; group: TagGroupView } | null>(null);
  const [editingTag, setEditingTag] = useState<{ category: TagCategoryView; group: TagGroupView; tag: TagView } | null>(null);
  const [editingAutomationRule, setEditingAutomationRule] = useState<TagAutomationRule | null>(null);
  const [executingRule, setExecutingRule] = useState<TagAutomationRule | null>(null);

  // モーダル状態
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [groupModalOpened, { open: openGroupModal, close: closeGroupModal }] = useDisclosure(false);
  const [tagModalOpened, { open: openTagModal, close: closeTagModal }] = useDisclosure(false);
  const [automationRuleModalOpened, { open: openAutomationRuleModal, close: closeAutomationRuleModal }] = useDisclosure(false);
  const [executeRuleModalOpened, { open: openExecuteRuleModal, close: closeExecuteRuleModal }] = useDisclosure(false);

  // デフォルト設定用のチェックボックス状態
  const [setAsCategoryDefaultBgColor, setSetAsCategoryDefaultBgColor] = useState(false);
  const [setAsCategoryDefaultTextColor, setSetAsCategoryDefaultTextColor] = useState(false);
  const [setAsGroupDefaultBgColor, setSetAsGroupDefaultBgColor] = useState(false);
  const [setAsGroupDefaultTextColor, setSetAsGroupDefaultTextColor] = useState(false);
  const [setAsTagDefaultBgColor, setSetAsTagDefaultBgColor] = useState(false);
  const [setAsTagDefaultTextColor, setSetAsTagDefaultTextColor] = useState(false);

  // 親階層からの継承用のチェックボックス状態
  const [inheritGroupColorFromCategory, setInheritGroupColorFromCategory] = useState(false);
  const [inheritTagColorFromGroup, setInheritTagColorFromGroup] = useState(false);

  // フォーム
  const categoryForm = useForm<CategoryFormValues>({
    initialValues: {
      key: '',
      name: '',
      description: '',
      color: DEFAULT_CATEGORY_COLOR,
      textColor: DEFAULT_CATEGORY_TEXT_COLOR,
      scopes: [],
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length ? null : 'カテゴリ名を入力してください'),
    },
  });

  const groupForm = useForm<GroupFormValues>({
    initialValues: {
      categoryId: '',
      name: '',
      description: '',
      color: DEFAULT_GROUP_COLOR,
      textColor: DEFAULT_GROUP_TEXT_COLOR,
      isActive: true,
    },
    validate: {
      categoryId: (value) => (value ? null : 'カテゴリを選択してください'),
      name: (value) => (value.trim().length ? null : 'グループ名を入力してください'),
    },
  });

  const tagForm = useForm<TagFormValues>({
    initialValues: {
      name: '',
      categoryId: '',
      groupId: '',
      description: '',
      color: DEFAULT_TAG_COLOR,
      textColor: DEFAULT_TAG_TEXT_COLOR,
      allowsManual: true,
      allowsAutomation: true,
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length ? null : 'タグ名を入力してください'),
      categoryId: (value) => (value ? null : 'カテゴリを選択してください'),
      groupId: (value) => (value ? null : 'タググループを選択してください'),
    },
  });

  const automationRuleForm = useForm<AutomationRuleFormValues>({
    initialValues: {
      ruleType: 'PAGE_ACTION',
      actionType: 'ASSIGN',
      tagIds: [],
      name: '',
      description: '',
      isActive: true,
      pageAction: {
        page: 'cats',
        action: '',
      },
      ageThreshold: {
        ageType: 'days',
        threshold: 60,
      },
      triggerTagId: '',
    },
    validate: {
      tagIds: (value) => {
        if (!value || value.length === 0) {
          return '少なくとも1つのタグを選択してください';
        }
        return null;
      },
      triggerTagId: (value, values) => {
        if (values.ruleType === 'TAG_ASSIGNED' && !value) {
          return 'トリガータグを選択してください';
        }
        return null;
      },
    },
  });

  // オプション生成

  const automationTagOptions = useMemo(() => {
    if (!sortedCategories || sortedCategories.length === 0) {
      return [];
    }
    const options: { value: string; label: string }[] = [];
    sortedCategories.forEach((category) => {
      if (!category || !category.groups) return;
      const groups = Array.isArray(category.groups) ? category.groups : [];
      groups.forEach((group) => {
        if (!group) return;
        const tags = Array.isArray(group.tags) ? group.tags : [];
        tags.forEach((tag) => {
          if (tag && tag.allowsAutomation && tag.isActive) {
            options.push({
              value: tag.id,
              label: `${category.name} > ${group.name} > ${tag.name}`,
            });
          }
        });
      });
    });
    return options;
  }, [sortedCategories]);

  const pageActionOptions = useMemo(() => {
    const selectedPage = automationRuleForm.values.pageAction?.page;
    if (!selectedPage) {
      return [];
    }
    const actions = PAGE_ACTIONS_MAP[selectedPage] || [];
    return actions.map(action => ({
      value: action.value,
      label: action.description
        ? `${action.label} - ${action.description}`
        : action.label
    }));
  }, [automationRuleForm.values.pageAction?.page]);

  const categoryOptions = useMemo(
    () => sortedCategories.map((category) => ({ value: category.id, label: category.name })),
    [sortedCategories],
  );

  const groupOptionsByCategory = useMemo(() => {
    const map = new Map<string, { value: string; label: string }[]>();
    sortedCategories.forEach((category) => {
      map.set(
        category.id,
        sortGroups(category.groups).map((group) => ({ value: group.id, label: group.name })),
      );
    });
    return map;
  }, [sortedCategories]);

  const tagGroupOptions = useMemo(() => {
    if (!tagForm.values.categoryId) {
      return [];
    }
    return groupOptionsByCategory.get(tagForm.values.categoryId) ?? [];
  }, [groupOptionsByCategory, tagForm.values.categoryId]);

  // タグモーダルでグループの自動選択
  useEffect(() => {
    if (!tagModalOpened) {
      return;
    }
    if (!tagForm.values.categoryId) {
      if (tagForm.values.groupId !== '') {
        tagForm.setFieldValue('groupId', '');
      }
      return;
    }
    if (tagForm.values.groupId && !tagGroupOptions.some((option) => option.value === tagForm.values.groupId)) {
      tagForm.setFieldValue('groupId', '');
      return;
    }
    if (!tagForm.values.groupId && tagGroupOptions.length > 0) {
      tagForm.setFieldValue('groupId', tagGroupOptions[0].value);
    }
  }, [tagModalOpened, tagForm, tagGroupOptions]);

  // デフォルト設定更新のヘルパー関数
  const updateColorDefaultsIfNeeded = async (
    type: 'category' | 'group' | 'tag',
    setBg: boolean,
    setText: boolean,
    values: { color: string; textColor: string }
  ) => {
    if (!setBg && !setText) return;
    const updates: { color?: string; textColor?: string } = {};
    if (setBg) {
      updates.color = values.color;
    }
    if (setText) {
      updates.textColor = values.textColor;
    }
    await updateTagColorDefaults.mutateAsync({ [type]: updates });
  };

  // コンテキストメニュー
  const {
    currentOperation,
    currentEntity,
    handleAction: handleTagContextAction,
    openOperation,
    closeOperation,
  } = useContextMenu<TagView>({
    edit: (tag) => {
      const tagInfo = flatTags.find(t => t.tag.id === tag?.id);
      if (tagInfo) {
        handleEditTag(tagInfo.category, tagInfo.group, tagInfo.tag);
      }
    },
    delete: () => {
      openOperation('delete');
    },
  });

  const handleOperationConfirm = async () => {
    if (!currentEntity) return;
    if (currentOperation === 'delete') {
      await deleteTag.mutateAsync(currentEntity.id);
      closeOperation();
    }
  };

  // カテゴリ操作
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.setValues({
      key: '',
      name: '',
      description: '',
      color: colorDefaults?.category?.color || DEFAULT_CATEGORY_COLOR,
      textColor: colorDefaults?.category?.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
      scopes: [],
      isActive: true,
    });
    setSetAsCategoryDefaultBgColor(false);
    setSetAsCategoryDefaultTextColor(false);
    openCategoryModal();
  };

  const handleEditCategory = (category: TagCategoryView) => {
    setEditingCategory(category);
    categoryForm.setValues({
      key: category.key ?? '',
      name: category.name,
      description: category.description ?? '',
      color: category.color ?? DEFAULT_CATEGORY_COLOR,
      textColor: category.textColor ?? DEFAULT_CATEGORY_TEXT_COLOR,
      scopes: category.scopes ?? [],
      isActive: category.isActive,
    });
    openCategoryModal();
  };

  const handleSubmitCategory = categoryForm.onSubmit(async (values) => {
    const payload = buildCategoryPayload(values);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, payload: payload as UpdateTagCategoryRequest });
      } else {
        await createCategory.mutateAsync(payload);
      }
      await updateColorDefaultsIfNeeded('category', setAsCategoryDefaultBgColor, setAsCategoryDefaultTextColor, values);
      closeCategoryModal();
    } catch {
      // エラーハンドリングはミューテーション側の通知に委譲
    }
  });

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('このカテゴリと関連タグを削除しますか？')) {
      return;
    }
    try {
      await deleteCategory.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleCategoryDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || reorderCategoriesMutation.isPending) {
      return;
    }
    const oldIndex = sortedCategories.findIndex((item) => item.id === active.id);
    const newIndex = sortedCategories.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    const reordered = arrayMove(sortedCategories, oldIndex, newIndex);
    void reorderCategoriesMutation.mutateAsync({
      items: reordered.map((category, orderIndex) => ({
        id: category.id,
        displayOrder: orderIndex,
      })),
    });
  };

  // グループ操作
  const handleOpenCreateGroup = (categoryId?: string) => {
    setEditingGroup(null);
    const selectedCategoryId = categoryId ?? (sortedCategories.length > 0 ? sortedCategories[0].id : '');
    groupForm.setValues({
      categoryId: selectedCategoryId,
      name: '',
      description: '',
      color: colorDefaults?.group?.color || DEFAULT_GROUP_COLOR,
      textColor: colorDefaults?.group?.textColor || DEFAULT_GROUP_TEXT_COLOR,
      isActive: true,
    });
    setSetAsGroupDefaultBgColor(false);
    setSetAsGroupDefaultTextColor(false);
    setInheritGroupColorFromCategory(false);
    openGroupModal();
  };

  const handleEditGroup = (category: TagCategoryView, group: TagGroupView) => {
    setEditingGroup({ category, group });
    groupForm.setValues({
      categoryId: category.id,
      name: group.name,
      description: group.description ?? '',
      color: group.color ?? DEFAULT_GROUP_COLOR,
      textColor: group.textColor ?? DEFAULT_GROUP_TEXT_COLOR,
      isActive: group.isActive,
    });
    openGroupModal();
  };

  const handleSubmitGroup = groupForm.onSubmit(async (values) => {
    const payload: CreateTagGroupRequest & { color?: string; textColor?: string } = {
      categoryId: values.categoryId,
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
      color: values.color || DEFAULT_GROUP_COLOR,
      textColor: values.textColor || DEFAULT_GROUP_TEXT_COLOR,
      isActive: values.isActive,
    };
    try {
      if (editingGroup) {
        await updateGroup.mutateAsync({
          id: editingGroup.group.id,
          payload: payload as UpdateTagGroupRequest,
        });
      } else {
        await createGroup.mutateAsync(payload);
      }
      await updateColorDefaultsIfNeeded('group', setAsGroupDefaultBgColor, setAsGroupDefaultTextColor, values);
      closeGroupModal();
    } catch {
      // noop
    }
  });

  const handleDeleteGroupAction = async (id: string) => {
    if (!window.confirm('このタググループと関連タグを削除しますか？')) {
      return;
    }
    try {
      await deleteGroup.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleReorderGroups = async (categoryId: string, groups: TagGroupView[]) => {
    if (reorderGroupsMutation.isPending) {
      return;
    }
    try {
      await reorderGroupsMutation.mutateAsync({
        items: groups.map((group, orderIndex) => ({
          id: group.id,
          displayOrder: orderIndex,
          categoryId,
        })),
      });
    } catch {
      // noop
    }
  };

  const handleInheritGroupColorFromCategoryChange = (checked: boolean) => {
    setInheritGroupColorFromCategory(checked);
    if (checked) {
      const selectedCategory = sortedCategories.find(c => c.id === groupForm.values.categoryId);
      if (selectedCategory) {
        groupForm.setFieldValue('color', selectedCategory.color || DEFAULT_CATEGORY_COLOR);
        groupForm.setFieldValue('textColor', selectedCategory.textColor || DEFAULT_CATEGORY_TEXT_COLOR);
      }
    }
  };

  // タグ操作
  const handleOpenCreateTag = (categoryId?: string, groupId?: string) => {
    setEditingTag(null);
    let selectedCategoryId = categoryId;
    let selectedGroupId = groupId;
    if (!selectedCategoryId && sortedCategories.length > 0) {
      selectedCategoryId = sortedCategories[0].id;
      if (!selectedGroupId && sortedCategories[0].groups.length > 0) {
        selectedGroupId = sortedCategories[0].groups[0].id;
      }
    }
    tagForm.setValues({
      name: '',
      categoryId: selectedCategoryId ?? '',
      groupId: selectedGroupId ?? '',
      description: '',
      color: colorDefaults?.tag?.color || DEFAULT_TAG_COLOR,
      textColor: colorDefaults?.tag?.textColor || DEFAULT_TAG_TEXT_COLOR,
      allowsManual: true,
      allowsAutomation: true,
      isActive: true,
    });
    setSetAsTagDefaultBgColor(false);
    setSetAsTagDefaultTextColor(false);
    setInheritTagColorFromGroup(false);
    openTagModal();
  };

  const handleEditTag = (category: TagCategoryView, group: TagGroupView, tag: TagView) => {
    setEditingTag({ category, group, tag });
    tagForm.setValues({
      name: tag.name,
      categoryId: category.id,
      groupId: group.id,
      description: tag.description ?? '',
      color: tag.color ?? DEFAULT_TAG_COLOR,
      textColor: tag.textColor ?? DEFAULT_TAG_TEXT_COLOR,
      allowsManual: tag.allowsManual,
      allowsAutomation: tag.allowsAutomation,
      isActive: tag.isActive,
    });
    openTagModal();
  };

  const handleSubmitTag = tagForm.onSubmit(async (values) => {
    const payload = buildTagPayload(values);
    try {
      if (editingTag) {
        await updateTag.mutateAsync({ id: editingTag.tag.id, payload: payload as UpdateTagRequest });
      } else {
        await createTag.mutateAsync(payload);
      }
      await updateColorDefaultsIfNeeded('tag', setAsTagDefaultBgColor, setAsTagDefaultTextColor, values);
      closeTagModal();
    } catch {
      // 通知はミューテーション側で実施
    }
  });

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm('このタグを削除しますか？')) {
      return;
    }
    try {
      await deleteTag.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleReorderTags = async (groupId: string, tags: TagView[]) => {
    if (reorderTagsMutation.isPending) {
      return;
    }
    try {
      await reorderTagsMutation.mutateAsync({
        items: tags.map((tag, orderIndex) => ({
          id: tag.id,
          displayOrder: orderIndex,
          groupId,
        })),
      });
    } catch {
      // noop
    }
  };

  const handleInheritTagColorFromGroupChange = (checked: boolean) => {
    setInheritTagColorFromGroup(checked);
    if (checked) {
      const selectedCategory = sortedCategories.find(c => c.id === tagForm.values.categoryId);
      const selectedGroup = selectedCategory?.groups.find(g => g.id === tagForm.values.groupId);
      if (selectedGroup) {
        tagForm.setFieldValue('color', selectedGroup.color || DEFAULT_GROUP_COLOR);
        tagForm.setFieldValue('textColor', selectedGroup.textColor || DEFAULT_GROUP_TEXT_COLOR);
      }
    }
  };

  // 自動化ルール操作
  const handleOpenCreateAutomationRule = () => {
    setEditingAutomationRule(null);
    automationRuleForm.reset();
    openAutomationRuleModal();
  };

  const handleEditAutomationRule = (rule: TagAutomationRule) => {
    setEditingAutomationRule(rule);
    
    // configからデータを抽出
    const config = (rule.config && typeof rule.config === 'object') ? rule.config as Record<string, unknown> : {};
    const tagIds = (config.tagIds as string[]) || [];
    
    // ルールタイプの判定
    let ruleType: AutomationRuleFormValues['ruleType'] = 'PAGE_ACTION';
    if (rule.eventType === 'AGE_THRESHOLD') {
      ruleType = 'AGE_THRESHOLD';
    } else if (rule.eventType === 'TAG_ASSIGNED') {
      ruleType = 'TAG_ASSIGNED';
    }
    
    // アクションタイプの判定
    const actionType: AutomationRuleFormValues['actionType'] = 
      (config.actionType as string) === 'REMOVE' ? 'REMOVE' : 'ASSIGN';
    
    // ページアクション設定
    const pageAction: AutomationRuleFormValues['pageAction'] = {
      page: (config.page as string) || 'cats',
      action: (config.action as string) || '',
    };
    
    // 年齢閾値設定
    const ageThreshold: AutomationRuleFormValues['ageThreshold'] = {
      ageType: (config.ageType as 'days' | 'months') || 'days',
      threshold: (config.threshold as number) || 60,
    };
    
    // トリガータグID
    const triggerTagId = (config.triggerTagId as string) || '';

    automationRuleForm.setValues({
      ruleType,
      actionType,
      tagIds,
      name: rule.name,
      description: rule.description || '',
      isActive: rule.isActive,
      pageAction,
      ageThreshold,
      triggerTagId,
    });
    openAutomationRuleModal();
  };

  const handleOpenExecuteRule = (rule: TagAutomationRule) => {
    setExecutingRule(rule);
    openExecuteRuleModal();
  };

  const handleExecuteRule = async () => {
    if (!executingRule) return;
    try {
      await executeAutomationRule.mutateAsync({ id: executingRule.id });
      closeExecuteRuleModal();
      setExecutingRule(null);
    } catch {
      // エラーハンドリングはミューテーション側で実施
    }
  };

  const handleSubmitAutomationRule = automationRuleForm.onSubmit(async (values) => {
    // configを構築
    const config: Record<string, unknown> = {
      tagIds: values.tagIds,
      actionType: values.actionType,
    };

    // ルールタイプに応じた設定を追加
    if (values.ruleType === 'PAGE_ACTION') {
      config.page = values.pageAction.page;
      config.action = values.pageAction.action;
    } else if (values.ruleType === 'AGE_THRESHOLD') {
      config.ageType = values.ageThreshold.ageType;
      config.threshold = values.ageThreshold.threshold;
    } else if (values.ruleType === 'TAG_ASSIGNED') {
      config.triggerTagId = values.triggerTagId;
    }

    // ペイロードを構築（keyは省略してバックエンドで自動生成）
    const payload: CreateTagAutomationRuleRequest | UpdateTagAutomationRuleRequest = {
      name: values.name || undefined, // 空の場合はバックエンドで自動生成
      description: values.description || undefined,
      triggerType: 'EVENT', // 全て EVENT トリガー
      eventType: values.ruleType, // ruleTypeをeventTypeとして使用
      isActive: values.isActive,
      config,
    };

    try {
      if (editingAutomationRule) {
        await updateAutomationRule.mutateAsync({
          id: editingAutomationRule.id,
          payload: payload as UpdateTagAutomationRuleRequest
        });
      } else {
        await createAutomationRule.mutateAsync(payload as CreateTagAutomationRuleRequest);
      }
      closeAutomationRuleModal();
    } catch {
      // 通知はミューテーション側で実施
    }
  });

  const handleDeleteAutomationRule = (id: string) => {
    deleteAutomationRule.mutate(id);
  };

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      'タグ管理',
      <ActionMenu
        buttonLabel="新規作成"
        buttonIcon={IconPlus}
        action="create"
        items={[
          {
            id: 'category',
            label: 'カテゴリ作成',
            icon: <IconFolderPlus size={16} />,
            onClick: handleOpenCreateCategory,
          },
          {
            id: 'group',
            label: 'グループ作成',
            icon: <IconTags size={16} />,
            onClick: () => handleOpenCreateGroup(),
          },
          {
            id: 'tag',
            label: 'タグ作成',
            icon: <IconTag size={16} />,
            onClick: () => handleOpenCreateTag(),
          }
        ]}
      />
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyMutationPending, sortedCategories.length]);

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Group justify="space-between" align="center" wrap="wrap">
          <Switch
            label="非アクティブを含める"
            checked={filters.includeInactive}
            onChange={(event) => {
              const checked = event.currentTarget?.checked ?? false;
              setFilters((prev) => ({ ...prev, includeInactive: checked }));
            }}
          />
          {isFetching && <Loader size="sm" />}
        </Group>

        <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="categories">カテゴリ</Tabs.Tab>
            <Tabs.Tab value="tags">タグ一覧</Tabs.Tab>
            <Tabs.Tab value="automation" leftSection={<IconRobot size={16} />}>
              自動化ルール
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="categories" pt="lg">
            <CategoriesTab
              isLoading={isLoading}
              sortedCategories={sortedCategories}
              isAnyMutationPending={isAnyMutationPending}
              reorderCategoriesPending={reorderCategoriesMutation.isPending}
              deleteCategoryPending={deleteCategory.isPending}
              deleteGroupPending={deleteGroup.isPending}
              deleteTagPending={deleteTag.isPending}
              reorderGroupsPending={reorderGroupsMutation.isPending}
              reorderTagsPending={reorderTagsMutation.isPending}
              onCategoryDragEnd={handleCategoryDragEnd}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onOpenCreateGroup={handleOpenCreateGroup}
              onOpenCreateTag={handleOpenCreateTag}
              onEditGroup={handleEditGroup}
              onDeleteGroup={handleDeleteGroupAction}
              onEditTag={handleEditTag}
              onDeleteTag={handleDeleteTag}
              onTagContextAction={handleTagContextAction}
              onReorderGroups={handleReorderGroups}
              onReorderTags={handleReorderTags}
            />
          </Tabs.Panel>

          <Tabs.Panel value="tags" pt="lg">
            <TagsListTab
              isLoading={isLoading}
              flatTags={flatTags}
              isAnyMutationPending={isAnyMutationPending}
              deleteTagPending={deleteTag.isPending}
              onEditTag={handleEditTag}
              onDeleteTag={handleDeleteTag}
            />
          </Tabs.Panel>

          <Tabs.Panel value="automation" pt="lg">
            <AutomationTab
              isLoading={isLoadingAutomationRules}
              automationRules={automationRules}
              isAnyMutationPending={isAnyMutationPending}
              createAutomationRulePending={createAutomationRule.isPending}
              updateAutomationRulePending={updateAutomationRule.isPending}
              deleteAutomationRulePending={deleteAutomationRule.isPending}
              onOpenCreateRule={handleOpenCreateAutomationRule}
              onEditRule={handleEditAutomationRule}
              onDeleteRule={handleDeleteAutomationRule}
              onOpenExecuteRule={handleOpenExecuteRule}
            />
          </Tabs.Panel>
        </Tabs>

        {/* モーダル群 */}
        <CategoryModal
          opened={categoryModalOpened}
          onClose={() => {
            closeCategoryModal();
            setEditingCategory(null);
          }}
          form={categoryForm}
          onSubmit={handleSubmitCategory}
          isEditing={!!editingCategory}
          isSubmitting={isCategorySubmitting}
          categoryScopeOptions={CATEGORY_SCOPE_OPTIONS}
          setAsCategoryDefaultBgColor={setAsCategoryDefaultBgColor}
          onSetAsCategoryDefaultBgColorChange={setSetAsCategoryDefaultBgColor}
          setAsCategoryDefaultTextColor={setAsCategoryDefaultTextColor}
          onSetAsCategoryDefaultTextColorChange={setSetAsCategoryDefaultTextColor}
        />

        <GroupModal
          opened={groupModalOpened}
          onClose={() => {
            closeGroupModal();
            setEditingGroup(null);
          }}
          form={groupForm}
          onSubmit={handleSubmitGroup}
          isEditing={!!editingGroup}
          isSubmitting={isGroupSubmitting}
          categoryOptions={categoryOptions}
          setAsGroupDefaultBgColor={setAsGroupDefaultBgColor}
          onSetAsGroupDefaultBgColorChange={setSetAsGroupDefaultBgColor}
          setAsGroupDefaultTextColor={setAsGroupDefaultTextColor}
          onSetAsGroupDefaultTextColorChange={setSetAsGroupDefaultTextColor}
          inheritGroupColorFromCategory={inheritGroupColorFromCategory}
          onInheritGroupColorFromCategoryChange={handleInheritGroupColorFromCategoryChange}
        />

        <TagModal
          opened={tagModalOpened}
          onClose={() => {
            closeTagModal();
            setEditingTag(null);
          }}
          form={tagForm}
          onSubmit={handleSubmitTag}
          isEditing={!!editingTag}
          isSubmitting={isTagSubmitting}
          categoryOptions={categoryOptions}
          tagGroupOptions={tagGroupOptions}
          setAsTagDefaultBgColor={setAsTagDefaultBgColor}
          onSetAsTagDefaultBgColorChange={setSetAsTagDefaultBgColor}
          setAsTagDefaultTextColor={setAsTagDefaultTextColor}
          onSetAsTagDefaultTextColorChange={setSetAsTagDefaultTextColor}
          inheritTagColorFromGroup={inheritTagColorFromGroup}
          onInheritTagColorFromGroupChange={handleInheritTagColorFromGroupChange}
        />

        <AutomationRuleModal
          opened={automationRuleModalOpened}
          onClose={() => {
            closeAutomationRuleModal();
            setEditingAutomationRule(null);
            automationRuleForm.reset();
          }}
          form={automationRuleForm}
          onSubmit={handleSubmitAutomationRule}
          isEditing={!!editingAutomationRule}
          isSubmitting={createAutomationRule.isPending || updateAutomationRule.isPending}
          automationTagOptions={automationTagOptions}
          pageActionOptions={pageActionOptions}
        />

        <ExecuteRuleModal
          opened={executeRuleModalOpened}
          onClose={() => {
            closeExecuteRuleModal();
            setExecutingRule(null);
          }}
          rule={executingRule}
          isExecuting={executeAutomationRule.isPending}
          onExecute={handleExecuteRule}
        />

        {/* 操作確認モーダル */}
        <OperationModalManager
          operationType={currentOperation}
          entity={currentEntity}
          entityType="タグ"
          onClose={closeOperation}
          onConfirm={handleOperationConfirm}
        />
      </Stack>
    </Container>
  );
}
```

## File: frontend/src/app/tenants/_components/TenantsManagement.tsx
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Stack, Tabs, Alert, Loader, Center, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { TenantsList } from './TenantsList';
import { UsersList } from './UsersList';
import { UserProfileForm } from './UserProfileForm';
import { BottomNavSettings } from './BottomNavSettings';
import { InviteUserModal } from './InviteUserModal';
import { ActionMenu } from './ActionMenu';

/**
 * ユーザー設定メインコンポーネント
 * 
 * ロールに応じて以下の機能を提供:
 * - 全員: プロフィール編集、パスワード変更
 * - SUPER_ADMIN: テナント管理者招待、全テナント閲覧、テナント作成
 * - TENANT_ADMIN: ユーザー招待、自テナントのユーザー閲覧
 */
export function TenantsManagement() {
  const { user, isAuthenticated, initialized } = useAuth();
  const { setPageHeader } = usePageHeader();
  const [activeTab, setActiveTab] = useState<string | null>('profile');

  // 招待モーダルの状態
  const [inviteUserOpened, { open: openInviteUser, close: closeInviteUser }] = useDisclosure(false);

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader('ユーザー管理');
    return () => setPageHeader(null);
  }, [setPageHeader]);

  // 権限チェック
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isTenantAdmin = user?.role === 'TENANT_ADMIN';
  // ユーザー管理は SUPER_ADMIN と TENANT_ADMIN が可能
  const hasUserManagementAccess = isSuperAdmin || isTenantAdmin;

  // 現在のタブに応じたアクションメニュー項目を生成
  const getActionItems = () => {
    // 「ユーザー一覧」タブで TENANT_ADMIN の場合のみ、ユーザー招待を表示
    if (activeTab === 'users' && isTenantAdmin) {
      return [
        {
          id: 'invite-user',
          label: 'ユーザーを招待',
          icon: <IconUserPlus size={16} />,
          onClick: openInviteUser,
        },
      ];
    }

    return [];
  };

  // 初期化待機
  if (!initialized) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // 未認証
  if (!isAuthenticated || !user) {
    return (
      <Center h="50vh">
        <Alert icon={<IconAlertCircle size={16} />} title="認証エラー" color="red">
          ログインが必要です
        </Alert>
      </Center>
    );
  }

  const actionItems = getActionItems();

  return (
    <Stack gap="lg" p={0}>
      {actionItems.length > 0 && (
        <Group justify="flex-end">
          <ActionMenu 
            items={actionItems} 
            buttonLabel="アクション" 
            isSectionAction
          />
        </Group>
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <Tabs.Tab value="profile">ユーザー設定</Tabs.Tab>
          {isSuperAdmin && <Tabs.Tab value="tenants">テナント一覧</Tabs.Tab>}
          {hasUserManagementAccess && <Tabs.Tab value="users">ユーザー一覧</Tabs.Tab>}
        </Tabs.List>

        {/* 
         * タブパネルは条件付きでレンダリングし、アクティブなタブのみコンポーネントをマウントする。
         * これにより、権限がないユーザーがページに入った時に、
         * 不要なAPIコールが発生して403エラーになることを防ぐ。
         */}
        <Tabs.Panel value="profile" pt="md">
          {activeTab === 'profile' && (
            <Stack gap="lg">
              <UserProfileForm />
              <BottomNavSettings />
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="tenants" pt="md">
          {activeTab === 'tenants' && isSuperAdmin && <TenantsList />}
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          {activeTab === 'users' && hasUserManagementAccess && <UsersList />}
        </Tabs.Panel>
      </Tabs>

      {/* TENANT_ADMIN 専用: ユーザー招待モーダル */}
      {isTenantAdmin && (
        <InviteUserModal
          opened={inviteUserOpened}
          onClose={closeInviteUser}
        />
      )}
    </Stack>
  );
}
```

## File: frontend/src/app/tags/components/CategoryModal.tsx
```typescript
'use client';

import {
  Box,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Group,
  MultiSelect,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { UnifiedModal, type ModalSection } from '@/components/common';

import type { CategoryFormValues } from '../types';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
  PRESET_COLORS,
} from '../constants';

export type CategoryModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<CategoryFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  // スコープ関連（事前定義済み選択肢）
  categoryScopeOptions: { value: string; label: string }[];
  // デフォルト設定
  setAsCategoryDefaultBgColor: boolean;
  onSetAsCategoryDefaultBgColorChange: (checked: boolean) => void;
  setAsCategoryDefaultTextColor: boolean;
  onSetAsCategoryDefaultTextColorChange: (checked: boolean) => void;
};

/**
 * カテゴリ編集/作成モーダル
 */
export function CategoryModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  categoryScopeOptions,
  setAsCategoryDefaultBgColor,
  onSetAsCategoryDefaultBgColorChange,
  setAsCategoryDefaultTextColor,
  onSetAsCategoryDefaultTextColorChange,
}: CategoryModalProps) {
  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <>
          <TextInput
            label="キー"
            description="URLなどで利用する識別子（未入力の場合は自動生成）"
            value={form.values.key}
            onChange={(event) => form.setFieldValue('key', event.currentTarget.value)}
          />
          <TextInput
            label="カテゴリ名"
            required
            value={form.values.name}
            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            error={form.errors.name}
          />
          <TextInput
            label="説明"
            placeholder="カテゴリの用途や対象を記載"
            value={form.values.description}
            onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
          />
        </>
      ),
    },
    {
      label: 'カラー設定',
      content: (
        <>
          <Group gap="md" align="flex-end">
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="背景カラー"
                swatches={PRESET_COLORS}
                value={form.values.color}
                onChange={(value) => form.setFieldValue('color', value || DEFAULT_CATEGORY_COLOR)}
              />
              <Checkbox
                label="新規カテゴリのデフォルトに設定"
                checked={setAsCategoryDefaultBgColor}
                onChange={(e) => onSetAsCategoryDefaultBgColorChange(e.currentTarget.checked)}
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="テキストカラー"
                swatches={PRESET_COLORS}
                value={form.values.textColor}
                onChange={(value) =>
                  form.setFieldValue('textColor', value || DEFAULT_CATEGORY_TEXT_COLOR)
                }
              />
              <Checkbox
                label="新規カテゴリのデフォルトに設定"
                checked={setAsCategoryDefaultTextColor}
                onChange={(e) => onSetAsCategoryDefaultTextColorChange(e.currentTarget.checked)}
              />
            </Stack>
          </Group>
          <Card
            withBorder
            padding="sm"
            radius="md"
            shadow="xs"
            style={{
              backgroundColor: `${(form.values.color || DEFAULT_CATEGORY_COLOR)}26`,
              color: form.values.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
              borderColor: form.values.color || DEFAULT_CATEGORY_COLOR,
            }}
          >
            <Text fw={600}>{form.values.name || 'カテゴリ名'}</Text>
            <Text size="xs">サンプルプレビュー</Text>
          </Card>
        </>
      ),
    },
    {
      label: '設定',
      content: (
        <>
          <MultiSelect
            label="利用ページ"
            description="このカテゴリのタグを表示するページを選択"
            data={categoryScopeOptions}
            value={form.values.scopes}
            onChange={(value) => form.setFieldValue('scopes', value)}
            placeholder="ページを選択"
            searchable
            clearable
            maxDropdownHeight={220}
          />
          <Switch
            label="アクティブ"
            checked={form.values.isActive}
            onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
          />
        </>
      ),
    },
    {
      content: (
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? '更新' : '作成'}
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <Box component="form" onSubmit={onSubmit}>
      <UnifiedModal
        opened={opened}
        onClose={onClose}
        title={isEditing ? 'カテゴリを編集' : 'カテゴリを追加'}
        size="lg"
        keepMounted={false}
        sections={sections}
      />
    </Box>
  );
}
```

## File: frontend/src/app/tags/components/GroupModal.tsx
```typescript
'use client';

import {
  Box,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { UnifiedModal, type ModalSection } from '@/components/common';

import type { GroupFormValues } from '../types';
import {
  DEFAULT_GROUP_COLOR,
  DEFAULT_GROUP_TEXT_COLOR,
  PRESET_COLORS,
} from '../constants';

export type GroupModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<GroupFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  categoryOptions: { value: string; label: string }[];
  // デフォルト設定
  setAsGroupDefaultBgColor: boolean;
  onSetAsGroupDefaultBgColorChange: (checked: boolean) => void;
  setAsGroupDefaultTextColor: boolean;
  onSetAsGroupDefaultTextColorChange: (checked: boolean) => void;
  // 継承設定
  inheritGroupColorFromCategory: boolean;
  onInheritGroupColorFromCategoryChange: (checked: boolean) => void;
};

/**
 * タググループ編集/作成モーダル
 */
export function GroupModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  categoryOptions,
  setAsGroupDefaultBgColor,
  onSetAsGroupDefaultBgColorChange,
  setAsGroupDefaultTextColor,
  onSetAsGroupDefaultTextColorChange,
  inheritGroupColorFromCategory,
  onInheritGroupColorFromCategoryChange,
}: GroupModalProps) {
  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <>
          <Select
            label="カテゴリ"
            data={categoryOptions}
            value={form.values.categoryId}
            onChange={(value) => form.setFieldValue('categoryId', value ?? '')}
            error={form.errors.categoryId}
            required
          />
          <TextInput
            label="グループ名"
            value={form.values.name}
            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            error={form.errors.name}
            required
          />
          <TextInput
            label="説明"
            placeholder="タググループの用途"
            value={form.values.description}
            onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
          />
        </>
      ),
    },
    {
      label: 'カラー設定',
      content: (
        <>
          <Checkbox
            label="親カテゴリのカラーを継承"
            checked={inheritGroupColorFromCategory}
            onChange={(e) => onInheritGroupColorFromCategoryChange(e.currentTarget.checked)}
          />
          <Group gap="md" align="flex-end">
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="背景カラー"
                swatches={PRESET_COLORS}
                value={form.values.color}
                onChange={(value) => form.setFieldValue('color', value || DEFAULT_GROUP_COLOR)}
              />
              <Checkbox
                label="新規グループのデフォルトに設定"
                checked={setAsGroupDefaultBgColor}
                onChange={(e) => onSetAsGroupDefaultBgColorChange(e.currentTarget.checked)}
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="テキストカラー"
                swatches={PRESET_COLORS}
                value={form.values.textColor}
                onChange={(value) =>
                  form.setFieldValue('textColor', value || DEFAULT_GROUP_TEXT_COLOR)
                }
              />
              <Checkbox
                label="新規グループのデフォルトに設定"
                checked={setAsGroupDefaultTextColor}
                onChange={(e) => onSetAsGroupDefaultTextColorChange(e.currentTarget.checked)}
              />
            </Stack>
          </Group>
          <Card
            withBorder
            padding="sm"
            radius="md"
            shadow="xs"
            style={{
              backgroundColor: `${(form.values.color || DEFAULT_GROUP_COLOR)}26`,
              color: form.values.textColor || DEFAULT_GROUP_TEXT_COLOR,
              borderColor: form.values.color || DEFAULT_GROUP_COLOR,
            }}
          >
            <Text fw={600}>{form.values.name || 'タググループ名'}</Text>
            <Text size="xs">サンプルプレビュー</Text>
          </Card>
        </>
      ),
    },
    {
      label: '設定',
      content: (
        <Switch
          label="アクティブ"
          checked={form.values.isActive}
          onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
        />
      ),
    },
    {
      content: (
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? '更新' : '作成'}
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <Box component="form" onSubmit={onSubmit}>
      <UnifiedModal
        opened={opened}
        onClose={onClose}
        title={isEditing ? 'タググループを編集' : 'タググループを追加'}
        size="lg"
        keepMounted={false}
        sections={sections}
      />
    </Box>
  );
}
```

## File: frontend/src/app/tags/components/TagModal.tsx
```typescript
'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { UnifiedModal, type ModalSection } from '@/components/common';

import type { TagFormValues } from '../types';
import {
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
  PRESET_COLORS,
} from '../constants';

export type TagModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<TagFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  categoryOptions: { value: string; label: string }[];
  tagGroupOptions: { value: string; label: string }[];
  // デフォルト設定
  setAsTagDefaultBgColor: boolean;
  onSetAsTagDefaultBgColorChange: (checked: boolean) => void;
  setAsTagDefaultTextColor: boolean;
  onSetAsTagDefaultTextColorChange: (checked: boolean) => void;
  // 継承設定
  inheritTagColorFromGroup: boolean;
  onInheritTagColorFromGroupChange: (checked: boolean) => void;
};

/**
 * タグ編集/作成モーダル
 */
export function TagModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  categoryOptions,
  tagGroupOptions,
  setAsTagDefaultBgColor,
  onSetAsTagDefaultBgColorChange,
  setAsTagDefaultTextColor,
  onSetAsTagDefaultTextColorChange,
  inheritTagColorFromGroup,
  onInheritTagColorFromGroupChange,
}: TagModalProps) {
  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <>
          <Select
            label="カテゴリ"
            data={categoryOptions}
            value={form.values.categoryId}
            onChange={(value) => {
              form.setFieldValue('categoryId', value ?? '');
              form.setFieldValue('groupId', '');
            }}
            error={form.errors.categoryId}
            required
          />
          <Select
            label="タググループ"
            placeholder={form.values.categoryId ? 'グループを選択してください' : '先にカテゴリを選択してください'}
            data={tagGroupOptions}
            value={form.values.groupId}
            onChange={(value) => form.setFieldValue('groupId', value ?? '')}
            error={form.errors.groupId}
            required
            disabled={!form.values.categoryId || tagGroupOptions.length === 0}
          />
          <TextInput
            label="タグ名"
            value={form.values.name}
            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            error={form.errors.name}
            required
          />
          <TextInput
            label="説明"
            placeholder="タグの補足情報"
            value={form.values.description}
            onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
          />
        </>
      ),
    },
    {
      label: 'カラー設定',
      content: (
        <>
          <Checkbox
            label="親グループのカラーを継承"
            checked={inheritTagColorFromGroup}
            onChange={(e) => onInheritTagColorFromGroupChange(e.currentTarget.checked)}
          />
          <Group gap="md" align="flex-end">
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="背景カラー"
                swatches={PRESET_COLORS}
                value={form.values.color}
                onChange={(value) => form.setFieldValue('color', value || DEFAULT_TAG_COLOR)}
              />
              <Checkbox
                label="新規タグのデフォルトに設定"
                checked={setAsTagDefaultBgColor}
                onChange={(e) => onSetAsTagDefaultBgColorChange(e.currentTarget.checked)}
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="テキストカラー"
                swatches={PRESET_COLORS}
                value={form.values.textColor}
                onChange={(value) =>
                  form.setFieldValue('textColor', value || DEFAULT_TAG_TEXT_COLOR)
                }
              />
              <Checkbox
                label="新規タグのデフォルトに設定"
                checked={setAsTagDefaultTextColor}
                onChange={(e) => onSetAsTagDefaultTextColorChange(e.currentTarget.checked)}
              />
            </Stack>
          </Group>
          <Card
            withBorder
            padding="sm"
            radius="md"
            shadow="xs"
            style={{
              backgroundColor: `${(form.values.color || DEFAULT_TAG_COLOR)}26`,
              color: form.values.textColor || DEFAULT_TAG_TEXT_COLOR,
              borderColor: form.values.color || DEFAULT_TAG_COLOR,
            }}
          >
            <Group gap="xs" align="center" wrap="wrap">
              <Text fw={600}>{form.values.name || 'タグ名'}</Text>
              <Badge size="xs" variant="outline" color="gray">
                プレビュー
              </Badge>
            </Group>
            {form.values.description && (
              <Text size="xs" mt={4}>
                {form.values.description}
              </Text>
            )}
            <Group gap={6} mt="xs" wrap="wrap">
              <Badge
                size="xs"
                variant="light"
                style={{
                  backgroundColor: `${(form.values.color || DEFAULT_TAG_COLOR)}33`,
                  color: form.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                }}
              >
                手動 {form.values.allowsManual ? '可' : '不可'}
              </Badge>
              <Badge
                size="xs"
                variant="light"
                style={{
                  backgroundColor: `${(form.values.color || DEFAULT_TAG_COLOR)}33`,
                  color: form.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                }}
              >
                自動 {form.values.allowsAutomation ? '可' : '不可'}
              </Badge>
            </Group>
          </Card>
        </>
      ),
    },
    {
      label: '設定',
      content: (
        <>
          <Group gap="lg">
            <Switch
              label="手動付与を許可"
              checked={form.values.allowsManual}
              onChange={(event) => form.setFieldValue('allowsManual', event.currentTarget.checked)}
            />
            <Switch
              label="自動付与を許可"
              checked={form.values.allowsAutomation}
              onChange={(event) => form.setFieldValue('allowsAutomation', event.currentTarget.checked)}
            />
          </Group>
          <Switch
            label="アクティブ"
            checked={form.values.isActive}
            onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
          />
        </>
      ),
    },
    {
      content: (
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? '更新' : '作成'}
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <Box component="form" onSubmit={onSubmit}>
      <UnifiedModal
        opened={opened}
        onClose={onClose}
        title={isEditing ? 'タグを編集' : 'タグを追加'}
        size="lg"
        keepMounted={false}
        sections={sections}
      />
    </Box>
  );
}
```

## File: frontend/src/app/tenants/_components/EditTenantModal.tsx
```typescript
'use client';

import { useState, useEffect } from 'react';
import { TextInput, Switch, Group, Text, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { UnifiedModal } from '@/components/common';
import { apiRequest } from '@/lib/api/client';
import { ActionButton } from '@/components/ActionButton';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface EditTenantModalProps {
  tenant: Tenant | null;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTenantModal({ tenant, opened, onClose, onSuccess }: EditTenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    isActive: true,
  });

  // テナント情報が変わったらフォームを初期化
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
      });
    }
  }, [tenant]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!tenant) return;

    // バリデーション
    if (!formData.name.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'テナント名を入力してください',
        color: 'red',
      });
      return;
    }

    if (!formData.slug.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'スラッグを入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest(`/tenants/${tenant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          isActive: formData.isActive,
        }),
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'テナントを更新しました',
          color: 'green',
        });
        onSuccess();
        onClose();
      } else {
        const errorMessage = response.error || response.message || 'テナントの更新に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UnifiedModal
      opened={opened}
      onClose={handleClose}
      title="テナントを編集"
      size="md"
    >
      <TextInput
        label="テナント名"
        placeholder="サンプルテナント"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={loading}
      />

      <TextInput
        label="テナントスラッグ"
        placeholder="sample-tenant"
        required
        description="半角英小文字、数字、ハイフンのみ使用可能"
        value={formData.slug}
        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        disabled={loading}
      />

      <Divider />

      <Group>
        <Switch
          label="有効"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
          disabled={loading}
        />
        <Text size="sm" c="dimmed">
          無効にするとテナントのユーザーはログインできなくなります
        </Text>
      </Group>

      <Divider />

      <Group justify="flex-end" mt="md">
        <ActionButton action="cancel" onClick={handleClose} disabled={loading}>
          キャンセル
        </ActionButton>
        <ActionButton action="save" onClick={handleSubmit} loading={loading}>
          保存
        </ActionButton>
      </Group>
    </UnifiedModal>
  );
}
```

## File: frontend/src/app/tenants/_components/InviteTenantAdminModal.tsx
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack,
  TextInput,
  Group,
  Alert,
  Code,
  CopyButton,
  Button,
  Text,
} from '@mantine/core';
import { IconCheck, IconCopy, IconMail } from '@tabler/icons-react';
import { UnifiedModal, type ModalSection } from '@/components/common';
import { ActionButton } from '@/components/ActionButton';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { getInvitationUrl } from '@/lib/invitation-utils';

interface InviteTenantAdminModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * テナント管理者招待モーダル（SUPER_ADMIN専用）
 */
export function InviteTenantAdminModal({ opened, onClose }: InviteTenantAdminModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    tenantName: '',
    tenantSlug: '',
  });
  // 招待成功後の情報を保持
  const [invitationResult, setInvitationResult] = useState<{
    email: string;
    invitationToken: string;
  } | null>(null);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      email: '',
      tenantName: '',
      tenantSlug: '',
    });
    setInvitationResult(null);
  };

  // モーダルを閉じる
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // テナント一覧を更新して閉じる
  const handleFinish = () => {
    handleClose();
    router.refresh();
  };

  // 招待送信
  const handleSubmit = async () => {
    // バリデーション
    if (!formData.email.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'メールアドレスを入力してください',
        color: 'red',
      });
      return;
    }

    if (!formData.tenantName.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'テナント名を入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.request('/tenants/invite-admin' as never, 'post', {
        body: {
          email: formData.email.trim(),
          tenantName: formData.tenantName.trim(),
          tenantSlug: formData.tenantSlug.trim() || undefined,
        } as never,
      });

      if (response.success && response.data) {
        const data = response.data as { invitationToken?: string };
        if (data.invitationToken) {
          // 招待URLを表示するモードに切り替え
          setInvitationResult({
            email: formData.email.trim(),
            invitationToken: data.invitationToken,
          });
          notifications.show({
            title: '成功',
            message: 'テナントと招待が作成されました',
            color: 'green',
          });
        } else {
          // トークンが返されなかった場合は従来の動作
          notifications.show({
            title: '成功',
            message: 'テナント管理者の招待を送信しました',
            color: 'green',
          });
          handleFinish();
        }
      } else {
        throw new Error(response.error || '招待の送信に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const sections: ModalSection[] = invitationResult
    ? [
        {
          content: (
            <Alert icon={<IconMail size={16} />} title="招待を作成しました" color="green">
            <Text size="sm" mb="xs">
              <strong>{invitationResult.email}</strong> 宛ての招待を作成しました。
            </Text>
            <Text size="sm" c="dimmed">
                以下の招待URLをコピーして、招待者に共有してください。
            </Text>
          </Alert>
          ),
        },
        {
          label: "招待URL",
          content: (
            <>
              <Stack gap="xs">
            <Text size="sm" fw={500}>招待URL:</Text>
            <Code block style={{ wordBreak: 'break-all' }}>
              {getInvitationUrl(invitationResult.invitationToken)}
            </Code>
            <CopyButton value={getInvitationUrl(invitationResult.invitationToken)}>
              {({ copied, copy }) => (
                <Button
                  color={copied ? 'teal' : 'blue'}
                  leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  onClick={copy}
                  variant="light"
                >
                  {copied ? 'コピーしました！' : 'URLをコピー'}
                </Button>
              )}
            </CopyButton>
              </Stack>

              <Text size="xs" c="dimmed">
                ※ 招待URLは7日間有効です。
              </Text>
            </>
          ),
        },
        {
          content: (
            <Group justify="flex-end" mt="md">
            <ActionButton action="save" onClick={handleFinish}>
                閉じる
            </ActionButton>
          </Group>
          ),
        },
      ]
    : [
        {
          content: (
            <>
              <TextInput
            label="メールアドレス"
            placeholder="admin@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />

          <TextInput
            label="テナント名"
            placeholder="サンプルテナント"
            required
            value={formData.tenantName}
            onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
            disabled={loading}
          />

          <TextInput
            label="テナントスラッグ（オプション）"
            placeholder="sample-tenant"
            description="未入力の場合、テナント名から自動生成されます"
            value={formData.tenantSlug}
            onChange={(e) => setFormData({ ...formData, tenantSlug: e.target.value })}
              disabled={loading}
            />
            </>
          ),
        },
        {
          content: (
            <Group justify="flex-end" mt="md">
            <ActionButton action="cancel" onClick={handleClose} disabled={loading}>
              キャンセル
            </ActionButton>
            <ActionButton action="save" onClick={handleSubmit} loading={loading}>
                招待を送信
            </ActionButton>
          </Group>
          ),
        },
      ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={handleClose}
      title="テナント管理者を招待"
      size="md"
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/tenants/_components/InviteUserModal.tsx
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack,
  TextInput,
  Select,
  Group,
  Alert,
  Code,
  CopyButton,
  Button,
  Text,
} from '@mantine/core';
import { IconCheck, IconCopy, IconMail } from '@tabler/icons-react';
import { UnifiedModal, type ModalSection } from '@/components/common';
import { ActionButton } from '@/components/ActionButton';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/store';
import { notifications } from '@mantine/notifications';
import { getInvitationUrl } from '@/lib/invitation-utils';

// ロール選択肢（TENANT_ADMIN が招待できるのは USER と ADMIN のみ）
const ROLE_OPTIONS = [
  { value: 'USER', label: '一般ユーザー' },
  { value: 'ADMIN', label: '管理者' },
];

interface InviteUserModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * ユーザー招待モーダル（TENANT_ADMIN専用）
 */
export function InviteUserModal({ opened, onClose }: InviteUserModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER',
  });
  // 招待成功後の情報を保持
  const [invitationResult, setInvitationResult] = useState<{
    email: string;
    invitationToken: string;
    role: string;
  } | null>(null);

  // テナントIDを取得（ユーザーオブジェクトから）
  const tenantId = user?.tenantId;

  // フォームリセット
  const resetForm = () => {
    setFormData({
      email: '',
      role: 'USER',
    });
    setInvitationResult(null);
  };

  // モーダルを閉じる
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // ユーザー一覧を更新して閉じる
  const handleFinish = () => {
    handleClose();
    router.refresh();
  };

  // 招待送信
  const handleSubmit = async () => {
    // バリデーション
    if (!formData.email.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'メールアドレスを入力してください',
        color: 'red',
      });
      return;
    }

    if (!tenantId) {
      notifications.show({
        title: 'エラー',
        message: 'テナント情報が見つかりません',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.request(`/tenants/${tenantId}/users/invite` as never, 'post', {
        body: {
          email: formData.email.trim(),
          role: formData.role,
        } as never,
      });

      if (response.success && response.data) {
        const data = response.data as { invitationToken?: string };
        if (data.invitationToken) {
          // 招待URLを表示するモードに切り替え
          setInvitationResult({
            email: formData.email.trim(),
            invitationToken: data.invitationToken,
            role: formData.role,
          });
          notifications.show({
            title: '成功',
            message: '招待を作成しました',
            color: 'green',
          });
        } else {
          // トークンが返されなかった場合は従来の動作
          notifications.show({
            title: '成功',
            message: 'ユーザーの招待を送信しました',
            color: 'green',
          });
          handleFinish();
        }
      } else {
        throw new Error(response.error || '招待の送信に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // ロール名を日本語で取得
  const getRoleLabel = (role: string) => {
    return ROLE_OPTIONS.find((opt) => opt.value === role)?.label || role;
  };

  // テナントIDがない場合は何も表示しない
  if (!tenantId) {
    return null;
  }

  const sections: ModalSection[] = invitationResult
    ? [
        {
          content: (
            <Alert icon={<IconMail size={16} />} title="招待を作成しました" color="green">
            <Text size="sm" mb="xs">
              <strong>{invitationResult.email}</strong> を
              <strong>{getRoleLabel(invitationResult.role)}</strong>として招待しました。
            </Text>
            <Text size="sm" c="dimmed">
                以下の招待URLをコピーして、招待者に共有してください。
            </Text>
          </Alert>
          ),
        },
        {
          label: "招待URL",
          content: (
            <>
              <Stack gap="xs">
            <Text size="sm" fw={500}>招待URL:</Text>
            <Code block style={{ wordBreak: 'break-all' }}>
              {getInvitationUrl(invitationResult.invitationToken)}
            </Code>
            <CopyButton value={getInvitationUrl(invitationResult.invitationToken)}>
              {({ copied, copy }) => (
                <Button
                  color={copied ? 'teal' : 'blue'}
                  leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  onClick={copy}
                  variant="light"
                >
                  {copied ? 'コピーしました！' : 'URLをコピー'}
                </Button>
              )}
            </CopyButton>
              </Stack>

              <Text size="xs" c="dimmed">
                ※ 招待URLは7日間有効です。
              </Text>
            </>
          ),
        },
        {
          content: (
            <Group justify="flex-end" mt="md">
            <ActionButton action="save" onClick={handleFinish}>
                閉じる
            </ActionButton>
          </Group>
          ),
        },
      ]
    : [
        {
          content: (
            <>
              <TextInput
            label="メールアドレス"
            placeholder="user@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />

          <Select
            label="ロール"
            placeholder="ロールを選択"
            required
            data={ROLE_OPTIONS}
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value || 'USER' })}
              disabled={loading}
            />
            </>
          ),
        },
        {
          content: (
            <Group justify="flex-end" mt="md">
            <ActionButton action="cancel" onClick={handleClose} disabled={loading}>
              キャンセル
            </ActionButton>
            <ActionButton action="save" onClick={handleSubmit} loading={loading}>
                招待を送信
            </ActionButton>
          </Group>
          ),
        },
      ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={handleClose}
      title="ユーザーを招待"
      size="md"
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/tags/components/ExecuteRuleModal.tsx
```typescript
'use client';

import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Text,
} from '@mantine/core';
import { IconInfoCircle, IconWand } from '@tabler/icons-react';
import { UnifiedModal, type ModalSection } from '@/components/common';

import type { TagAutomationRule } from '@/lib/api/hooks/use-tag-automation';

export type ExecuteRuleModalProps = {
  opened: boolean;
  onClose: () => void;
  rule: TagAutomationRule | null;
  isExecuting: boolean;
  onExecute: () => void;
};

/**
 * 自動化ルールテスト実行モーダル
 */
export function ExecuteRuleModal({
  opened,
  onClose,
  rule,
  isExecuting,
  onExecute,
}: ExecuteRuleModalProps) {
  const sections: ModalSection[] = !rule
    ? []
    : [
        {
          content: (
            <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
              このルールをテスト実行します。実際のデータに対してタグの付与が行われますのでご注意ください。
            </Alert>
          ),
        },
        {
          label: "ルール詳細",
          content: (
            <>
              <Box>
                <Text size="sm" fw={500} mb={4}>
                  ルール名
                </Text>
                <Text size="sm" c="dimmed">
                  {rule.name}
                </Text>
              </Box>

              {rule.description && (
                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    説明
                  </Text>
                  <Text size="sm" c="dimmed">
                    {rule.description}
                  </Text>
                </Box>
              )}

              <Box>
                <Text size="sm" fw={500} mb={4}>
                  イベントタイプ
                </Text>
                <Badge size="sm" variant="light">
                  {rule.eventType === 'BREEDING_PLANNED' && '交配予定'}
                  {rule.eventType === 'BREEDING_CONFIRMED' && '交配確認'}
                  {rule.eventType === 'PREGNANCY_CONFIRMED' && '妊娠確認'}
                  {rule.eventType === 'KITTEN_REGISTERED' && '子猫登録'}
                  {rule.eventType === 'AGE_THRESHOLD' && '年齢閾値'}
                  {rule.eventType === 'PAGE_ACTION' && 'ページアクション'}
                  {rule.eventType === 'CUSTOM' && 'カスタム'}
                </Badge>
              </Box>

              {rule.config && typeof rule.config === 'object' && (rule.config as { tagIds?: string[] }).tagIds && (
                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    付与するタグ
                  </Text>
                  <Text size="sm" c="dimmed">
                    {((rule.config as { tagIds?: string[] }).tagIds ?? []).length}個のタグを付与
                  </Text>
                </Box>
              )}

              <Alert icon={<IconInfoCircle size={18} />} variant="light" color="yellow">
                注意: テスト用のダミーデータでイベントを発行します。実際の猫データには影響しません。
              </Alert>
            </>
          ),
        },
        {
          content: (
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={onClose}
                disabled={isExecuting}
              >
                キャンセル
              </Button>
              <Button
                color="green"
                onClick={onExecute}
                loading={isExecuting}
                leftSection={<IconWand size={16} />}
              >
                実行
              </Button>
            </Group>
          ),
        },
      ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="自動化ルールのテスト実行"
      size="md"
      sections={sections}
    />
  );
}
```
