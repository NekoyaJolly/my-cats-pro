#!/usr/bin/env node

/**
 * セキュアなシークレット値生成スクリプト
 * 
 * 使用方法:
 *   node scripts/generate-secrets.mjs
 * 
 * 本番環境用の強力なランダムシークレットを生成します。
 */

import { randomBytes } from 'crypto';

/**
 * 指定した長さのランダムなBase64文字列を生成
 * @param {number} length - バイト長
 * @returns {string} Base64エンコードされた文字列
 */
function generateSecret(length = 32) {
  return randomBytes(length).toString('base64');
}

/**
 * 指定した長さのランダムな英数字文字列を生成
 * @param {number} length - 文字数
 * @returns {string} 英数字のみの文字列
 */
function generateAlphanumeric(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

console.log('🔐 MyCats Pro - セキュアシークレット生成');
console.log('=' .repeat(60));
console.log('');
console.log('以下の値を .env ファイルにコピーしてください:');
console.log('⚠️  これらの値は絶対にGitにコミットしないでください!');
console.log('');
console.log('-'.repeat(60));
console.log('');
console.log('# JWT シークレット (Base64形式)');
console.log(`JWT_SECRET="${generateSecret(32)}"`);
console.log(`JWT_REFRESH_SECRET="${generateSecret(32)}"`);
console.log('');
console.log('# CSRF トークンシークレット (Base64形式)');
console.log(`CSRF_TOKEN_SECRET="${generateSecret(32)}"`);
console.log('');
console.log('# または 英数字形式を使用する場合:');
console.log(`# JWT_SECRET="${generateAlphanumeric(64)}"`);
console.log(`# JWT_REFRESH_SECRET="${generateAlphanumeric(64)}"`);
console.log(`# CSRF_TOKEN_SECRET="${generateAlphanumeric(64)}"`);
console.log('');
console.log('-'.repeat(60));
console.log('');
console.log('📝 注意事項:');
console.log('  1. JWT_SECRET と JWT_REFRESH_SECRET は必ず異なる値にしてください');
console.log('  2. CSRF_TOKEN_SECRET も他のシークレットとは異なる値を使用してください');
console.log('  3. 本番環境では環境変数として安全に管理してください');
console.log('  4. これらの値を他人と共有しないでください');
console.log('  5. 定期的にローテーション（更新）することを推奨します');
console.log('');
console.log('🔒 セキュリティベストプラクティス:');
console.log('  - AWS Secrets Manager, GCP Secret Manager などの利用を推奨');
console.log('  - CI/CDパイプラインでは暗号化された環境変数を使用');
console.log('  - ローカル開発では .env ファイル (.gitignore に追加済み)');
console.log('');
