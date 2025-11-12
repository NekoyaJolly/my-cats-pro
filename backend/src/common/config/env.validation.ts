import { z } from 'zod';

/**
 * 環境変数のスキーマ定義
 */
const envSchema = z.object({
  // Node環境
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1000).max(65535).default(3004),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // データベース
  DATABASE_URL: z.string().min(1, 'DATABASE_URL は必須です'),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // JWT - アクセストークン
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET は最低32文字必要です（セキュリティ強度のため）'),
  JWT_EXPIRES_IN: z.string().default('15m'),

  // JWT - リフレッシュトークン
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET は最低32文字必要です（セキュリティ強度のため）')
    .refine(
      (val) => {
        const jwtSecret = process.env.JWT_SECRET;
        return !jwtSecret || val !== jwtSecret;
      },
      {
        message: 'JWT_REFRESH_SECRET は JWT_SECRET と異なる値である必要があります',
      }
    ),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // パスワード
  PASSWORD_MIN_LENGTH: z.coerce.number().min(8).default(8),

  // Argon2 設定
  ARGON2_MEMORY_COST: z.coerce.number().default(65536),
  ARGON2_TIME_COST: z.coerce.number().default(3),
  ARGON2_PARALLELISM: z.coerce.number().default(4),
  ARGON2_HASH_LENGTH: z.coerce.number().default(64),
  ARGON2_SALT_LENGTH: z.coerce.number().default(32),

  // レート制限
  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(100),

  // ヘルスチェック
  HEALTH_CHECK_DATABASE: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  HEALTH_CHECK_MEMORY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.9),

  // 管理者アカウント（開発/シード用）
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_FORCE_UPDATE: z.coerce.number().min(0).max(1).default(0),

  // 認証バイパス（開発専用・非推奨）
  AUTH_DISABLED: z.coerce.number().min(0).max(1).default(0),

  // Prisma
  PRISMA_CLIENT_ENGINE_TYPE: z.enum(['library', 'binary']).default('library'),

  // Sentry（オプション）
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  SENTRY_PROFILES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
});

export type Environment = z.infer<typeof envSchema>;

/**
 * 環境変数をバリデーション
 * 
 * @throws {Error} バリデーションエラー時
 */
export function validateEnvironment(): Environment {
  try {
    const validated = envSchema.parse(process.env);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 環境変数のバリデーションに失敗しました:');
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  - ${path}: ${err.message}`);
      });
      throw new Error('環境変数の設定が不正です。上記のエラーを確認してください。');
    }
    throw error;
  }
}

/**
 * 本番環境用の追加バリデーション
 */
export function validateProductionEnvironment(): void {
  const env = validateEnvironment();

  // 本番環境では必須の設定
  const requiredForProduction = [
    { key: 'CORS_ORIGIN', value: env.CORS_ORIGIN },
    { key: 'JWT_SECRET', value: env.JWT_SECRET },
    { key: 'JWT_REFRESH_SECRET', value: env.JWT_REFRESH_SECRET },
  ];

  const missingConfigs = requiredForProduction.filter(
    (config) => !config.value || (typeof config.value === 'string' && config.value.length === 0)
  );

  if (missingConfigs.length > 0) {
    console.error('❌ 本番環境で必須の設定が不足しています:');
    missingConfigs.forEach((config) => {
      console.error(`  - ${config.key}`);
    });
    throw new Error('本番環境の設定が不完全です');
  }

  // 開発用のデフォルト値が使われていないかチェック
  const insecureDefaults = [];

  if (typeof env.JWT_SECRET === 'string' && (env.JWT_SECRET.includes('changeme') || env.JWT_SECRET.includes('local'))) {
    insecureDefaults.push('JWT_SECRET に開発用の値が設定されています');
  }

  if (typeof env.JWT_REFRESH_SECRET === 'string' && (env.JWT_REFRESH_SECRET.includes('changeme') || env.JWT_REFRESH_SECRET.includes('local'))) {
    insecureDefaults.push('JWT_REFRESH_SECRET に開発用の値が設定されています');
  }

  if (env.AUTH_DISABLED === 1) {
    insecureDefaults.push('AUTH_DISABLED=1 は本番環境で使用できません');
  }

  if (insecureDefaults.length > 0) {
    console.error('❌ 本番環境でセキュリティ上問題のある設定が検出されました:');
    insecureDefaults.forEach((issue) => {
      console.error(`  - ${issue}`);
    });
    throw new Error('セキュリティ設定を確認してください');
  }
}

/**
 * 環境変数の情報をログ出力（機密情報は隠す）
 */
export function logEnvironmentInfo(): void {
  const env = validateEnvironment();

  console.log('📋 環境変数の設定:');
  console.log(`  NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  PORT: ${env.PORT}`);
  console.log(`  LOG_LEVEL: ${env.LOG_LEVEL}`);
  console.log(`  DATABASE_URL: ${maskConnectionString(String(env.DATABASE_URL))}`);
  console.log(`  CORS_ORIGIN: ${env.CORS_ORIGIN || '(開発モード)'}`);
  console.log(`  JWT_SECRET: ${maskSecret(String(env.JWT_SECRET))}`);
  console.log(`  JWT_REFRESH_SECRET: ${maskSecret(String(env.JWT_REFRESH_SECRET))}`);
  console.log(`  AUTH_DISABLED: ${env.AUTH_DISABLED === 1 ? '⚠️ YES (開発専用)' : 'NO'}`);
}

/**
 * 接続文字列をマスク
 */
function maskConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    return '***';
  }
}

/**
 * シークレット値をマスク
 */
function maskSecret(secret: string): string {
  if (!secret || secret.length < 8) {
    return '***';
  }
  return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)} (${secret.length}文字)`;
}
