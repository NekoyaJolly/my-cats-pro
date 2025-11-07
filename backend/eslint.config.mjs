/**
 * ESLint設定ファイル (バックエンド)
 * NestJS + TypeScript + Prisma 用フラット設定
 * 
 * 設定方針:
 * - 本番運用レベルの厳格な型安全性チェック
 * - サーバーサイドの信頼性とセキュリティを最優先
 * - NestJS/Prisma のベストプラクティスに準拠
 * - 非同期処理の適切なエラーハンドリングを強制
 * 
 * 厳格化レベル: ★★★★☆ (High-Reliability Server)
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';

export default [
  // === 基本設定 ===
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  
  // === メイン設定 ===
  {
    name: 'backend-main-config',
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.eslint.json', // ESLint専用tsconfig使用
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        node: true,
        jest: true
      }
    },
    plugins: {
      'import-x': importX,
    },
    rules: {
      // === TypeScript Rules (厳格化) ===
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      
      // TypeScript unsafe operations - 本番では error に
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      
      // 非同期処理の安全性
      '@typescript-eslint/require-await': 'off', // NestJSでは非同期デコレータが多用される
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/promise-function-async': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      
      // 型安全性の向上
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off', // 厳しすぎるため無効
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // === Import/Export Rules (厳格化) ===
      'import-x/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
        'pathGroups': [
          { 'pattern': '@nestjs/**', 'group': 'external', 'position': 'before' },
          { 'pattern': '@prisma/**', 'group': 'external', 'position': 'before' }
        ]
      }],
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'warn',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-default-export': 'off', // NestJSモジュールで必要
      
      // === NestJS/Node.js Specific (本番品質) ===
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-process-env': 'off', // 環境変数の使用は必要
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'no-throw-literal': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.eslint.json'
        },
        node: true
      }
    }
  },
  
  // === テストファイル専用設定 ===
  {
    name: 'backend-test-config',
    files: ['test/**/*.ts', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        jest: true
      }
    },
    rules: {
      // テストファイルでは型制約を緩和
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off', // テスト時のデバッグ用
    }
  },
  
  // === スクリプトファイル専用設定（段階的移行用）===
  {
    name: 'backend-scripts-config',
    files: ['src/scripts/**/*.ts', 'src/scripts/**/*.mjs', 'scripts/**/*.ts', 'scripts/**/*.mjs'],
    rules: {
      // スクリプトファイルは段階的に改善
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-misused-promises': 'off', // csv-parserの.on("data")で誤検知
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      'no-console': 'off', // スクリプトでのログ出力は許可
    }
  },
  
  // === 除外設定 ===
  {
    name: 'backend-ignores',
    ignores: [
      'dist/**', 
      'node_modules/**', 
      'coverage/**',
      'prisma/migrations/**',
      '**/*.d.ts',
      '**/*-old.ts',
      '**/*_old.ts',
      '*.config.js',
      '*.config.mjs'
    ]
  }
];
