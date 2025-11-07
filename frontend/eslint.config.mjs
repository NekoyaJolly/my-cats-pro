/**
 * ESLint設定ファイル (フロントエンド)
 * Next.js + React + TypeScript 用フラット設定
 * 
 * 設定方針:
 * - 本番品質を意識した厳格な型安全性チェック
 * - 開発段階から型エラーを徹底的に検出
 * - Next.js/React のベストプラクティスに準拠
 * - セキュリティとパフォーマンスを重視
 * 
 * 厳格化レベル: ★★★☆☆ (Production-Ready)
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  // === 基本設定 ===
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  
  // === TypeScript設定 ===
  {
    name: 'frontend-typescript-config',
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      'import-x': importX,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      }
    },
    rules: {
      // === TypeScript Rules (厳格化) ===
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off', // 厳しすぎるため無効
      '@typescript-eslint/triple-slash-reference': 'off', // Next.js generated files
      
      // === Import/Export Rules (厳格化) ===
      'import-x/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
        'pathGroups': [
          { 'pattern': '@/**', 'group': 'internal' },
          { 'pattern': 'react', 'group': 'external', 'position': 'before' }
        ],
        'pathGroupsExcludedImportTypes': ['react']
      }],
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'off', // TypeScriptで解決
      'import-x/no-unused-modules': 'off',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-default-export': 'off', // Next.jsではdefault exportが必要
      
      // === React/Next.js Rules (厳格化) ===
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-page-custom-font': 'error',
      '@next/next/no-unwanted-polyfillio': 'error',
      
      // === 一般的なJavaScript Rules (本番意識) ===
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'no-throw-literal': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
    },
    settings: {
      next: {
        rootDir: '.'
      },
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        },
        node: true
      }
    }
  },

  // === JavaScript設定 (TypeScriptプロジェクトチェックなし) ===
  {
    name: 'frontend-javascript-config',
    files: ["**/*.js", "**/*.jsx"],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      'import-x': importX,
    },
    rules: {
      // === React/Next.js Rules ===
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',
      
      // === 一般的なJavaScript Rules ===
      'no-console': 'off',
      'no-debugger': 'warn',
    },
    settings: {
      next: {
        rootDir: '.'
      }
    }
  },
  
  // === テストファイル専用設定 ===
  {
    name: 'frontend-test-config',
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      // テストファイルではany型使用を許可
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-console': 'off', // テスト時のデバッグ用
    }
  },

  // === 旧ファイル専用の緩和ルール（段階的移行用）===
  {
    name: 'frontend-legacy-files',
    files: [
      'src/app/breeding/**/*.tsx',
      'src/app/cats/**/*.tsx',
      'src/app/pedigrees/**/*.tsx',
      'src/app/tags/**/*.tsx',
    ],
    rules: {
      // レガシーファイルは段階的に改善
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
    }
  },
  
  // === 除外設定 ===
  {
    name: 'frontend-ignores',
    ignores: [
      ".next/**",
      "out/**", 
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      "**/*-old.tsx",
      "**/*-old.ts",
      "**/*_old.tsx",
      "**/*_old.ts",
      "**/*page_old.tsx", 
      "**/*page_new.tsx",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "src/lib/api/generated/**"
    ]
  }
];

export default eslintConfig;
