#!/usr/bin/env node
/**
 * メモリ使用量チェックスクリプト
 * Node.jsプロセスのメモリ使用量を表示します
 */

import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const isWindows = platform() === 'win32';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getNodeProcesses() {
  try {
    if (isWindows) {
      // Windows: PowerShellを使用
      const command = `powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, @{Name='Memory(MB)';Expression={[math]::Round($_.WS / 1MB, 2)}}, @{Name='CPU(s)';Expression={$_.CPU}} | Format-Table -AutoSize"`;
      const output = execSync(command, { encoding: 'utf-8' });
      return output;
    } else {
      // macOS/Linux: psコマンドを使用
      const command = `ps aux | grep -E 'node|next|nest' | grep -v grep | awk '{printf "PID: %-8s Memory: %6s%% CPU: %6s%% Command: %s\\n", $2, $4, $3, $11}'`;
      const output = execSync(command, { encoding: 'utf-8' });
      return output;
    }
  } catch (error) {
    return `エラー: プロセス情報の取得に失敗しました\n${error.message}`;
  }
}

function getTotalMemory() {
  try {
    if (isWindows) {
      const command = `powershell -Command "[math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)"`;
      const totalGB = parseFloat(execSync(command, { encoding: 'utf-8' }).trim());
      return totalGB;
    } else {
      // macOS/Linux: freeコマンドまたはsysctlを使用
      try {
        const command = `free -g | grep Mem | awk '{print $2}'`;
        const totalGB = parseFloat(execSync(command, { encoding: 'utf-8' }).trim());
        return totalGB;
      } catch {
        // macOSの場合
        const command = `sysctl -n hw.memsize | awk '{print $1/1024/1024/1024}'`;
        const totalGB = parseFloat(execSync(command, { encoding: 'utf-8' }).trim());
        return totalGB;
      }
    }
  } catch (error) {
    return null;
  }
}

function getNodeProcessMemory() {
  try {
    if (isWindows) {
      const command = `powershell -Command "(Get-Process node -ErrorAction SilentlyContinue | Measure-Object -Property WS -Sum).Sum / 1MB"`;
      const memoryMB = parseFloat(execSync(command, { encoding: 'utf-8' }).trim() || '0');
      return memoryMB;
    } else {
      const command = `ps aux | grep -E 'node|next|nest' | grep -v grep | awk '{sum+=$6} END {print sum/1024}'`;
      const memoryMB = parseFloat(execSync(command, { encoding: 'utf-8' }).trim() || '0');
      return memoryMB;
    }
  } catch (error) {
    return 0;
  }
}

console.log('📊 Node.js プロセスのメモリ使用量\n');
console.log('='.repeat(60));

const processes = getNodeProcesses();
console.log(processes);

console.log('\n' + '='.repeat(60));

const totalMemoryGB = getTotalMemory();
const nodeMemoryMB = getNodeProcessMemory();

if (totalMemoryGB && nodeMemoryMB > 0) {
  const nodeMemoryGB = nodeMemoryMB / 1024;
  const percentage = ((nodeMemoryGB / totalMemoryGB) * 100).toFixed(1);
  
  console.log(`\n💾 システム情報:`);
  console.log(`   総メモリ: ${totalMemoryGB} GB`);
  console.log(`   Node.js使用量: ${nodeMemoryGB.toFixed(2)} GB (${percentage}%)`);
  
  if (percentage > 50) {
    console.log(`\n⚠️  警告: Node.jsプロセスが総メモリの50%以上を使用しています`);
    console.log(`   推奨: pnpm dev:low-memory を使用してください`);
  } else if (percentage > 30) {
    console.log(`\n💡 ヒント: メモリ使用量が高いです。必要に応じて pnpm dev:low-memory を検討してください`);
  } else {
    console.log(`\n✅ メモリ使用量は正常範囲内です`);
  }
}

console.log('\n📝 メモリ最適化コマンド:');
console.log('   pnpm dev:low-memory        - メモリ制限付きで開発サーバーを起動');
console.log('   pnpm dev:no-prisma-sync    - Prisma syncなしで起動');
console.log('   pnpm dev:memory-check      - このスクリプトを実行');

