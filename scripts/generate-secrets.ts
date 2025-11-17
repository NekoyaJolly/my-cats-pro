#!/usr/bin/env tsx

import { randomBytes } from 'crypto';

const SECTION_SEPARATOR = '-'.repeat(60);

const generateBase64Secret = (bytes: number): string => randomBytes(bytes).toString('base64');

const generateAlphanumericSecret = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBuffer = randomBytes(length);

  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[randomBuffer[i] % chars.length];
  }
  return result;
};

const printHeading = (): void => {
  console.log('🔐 MyCats Pro - セキュアシークレット生成');
  console.log('='.repeat(SECTION_SEPARATOR.length));
  console.log('\n以下の値を .env ファイルにコピーしてください (Git 管理禁止)\n');
};

const printSecretBlock = (title: string, secrets: Array<{ key: string; value: string }>): void => {
  console.log(SECTION_SEPARATOR);
  console.log(`\n# ${title}`);
  secrets.forEach((secret) => {
    console.log(`${secret.key}="${secret.value}"`);
  });
  console.log('');
};

const printNotes = (): void => {
  console.log(SECTION_SEPARATOR);
  console.log('\n📝 注意事項:');
  console.log('  - JWT_SECRET と JWT_REFRESH_SECRET は必ず異なる値にしてください');
  console.log('  - CSRF_TOKEN_SECRET も同様にユニークな値を使用してください');
  console.log('  - 本番環境の環境変数は必ず Secrets Manager 等で安全に管理してください');
  console.log('  - 値は共有しない & 定期的なローテーションを推奨します');
  console.log('');
};

const main = (): void => {
  printHeading();

  printSecretBlock('JWT シークレット (Base64 / 48 bytes)', [
    { key: 'JWT_SECRET', value: generateBase64Secret(48) },
    { key: 'JWT_REFRESH_SECRET', value: generateBase64Secret(48) },
  ]);

  printSecretBlock('CSRF シークレット (Base64 / 48 bytes)', [
    { key: 'CSRF_TOKEN_SECRET', value: generateBase64Secret(48) },
  ]);

  printSecretBlock('英数字のみを使用したい場合 (64 chars)', [
    { key: '# JWT_SECRET', value: generateAlphanumericSecret(64) },
    { key: '# JWT_REFRESH_SECRET', value: generateAlphanumericSecret(64) },
    { key: '# CSRF_TOKEN_SECRET', value: generateAlphanumericSecret(64) },
  ]);

  printNotes();
};

try {
  main();
} catch (error) {
  console.error('❌ シークレット生成に失敗しました:', error);
  process.exit(1);
}
