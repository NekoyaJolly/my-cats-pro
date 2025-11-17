#!/usr/bin/env node

import { spawnSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');

const execution = spawnSync('pnpm', ['run', 'generate-secrets'], {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (execution.error) {
  console.error('❌ ルートスクリプトの実行に失敗しました:', execution.error);
  process.exit(1);
}

process.exit(execution.status ?? 0);
