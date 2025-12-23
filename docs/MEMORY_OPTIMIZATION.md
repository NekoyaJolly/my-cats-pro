# メモリ最適化ガイド

## 問題の概要

開発環境で `pnpm dev` を実行すると、複数のNode.jsプロセスが同時に起動し、大量のメモリを消費します。

### 主な原因

1. **Next.js 15の開発サーバー**: ホットリロード機能により、デフォルトで1-2GBのメモリを使用
2. **NestJSのウォッチモード**: `nest start --watch` がファイル監視とコンパイルでメモリを消費
3. **Prisma sync watch**: `chokidar` を使ったファイル監視プロセスが追加のメモリを消費
4. **複数プロセスの同時実行**: 3つのプロセスが同時に動くことで、メモリ使用量が累積

### 典型的なメモリ使用量

- **Next.js開発サーバー**: 1.5-2.5GB
- **NestJS開発サーバー**: 500MB-1GB
- **Prisma sync watch**: 100-200MB
- **合計**: 約2-4GB（8GBメモリの50%以上）

## 解決策

### 1. Node.jsメモリ制限の設定

各プロセスにメモリ制限を設定することで、メモリ使用量を抑制できます。

#### 方法A: 環境変数で設定（推奨）

```bash
# Windows (PowerShell)
$env:NODE_OPTIONS="--max-old-space-size=2048"

# macOS/Linux
export NODE_OPTIONS="--max-old-space-size=2048"
```

#### 方法B: スクリプト内で設定

`package.json` のスクリプトに直接設定：

```json
{
  "scripts": {
    "frontend:dev": "NODE_OPTIONS='--max-old-space-size=2048' next dev -p 3000",
    "backend:dev": "NODE_OPTIONS='--max-old-space-size=1024' nest start --watch"
  }
}
```

### 2. メモリ最適化された開発コマンドの使用

プロジェクトにはメモリ制限を設定した専用コマンドを追加しています：

```bash
# メモリ制限付きで開発サーバーを起動
pnpm dev:low-memory

# または、個別に起動
pnpm backend:dev:low-memory
pnpm frontend:dev:low-memory
```

### 3. Next.js開発サーバーの最適化

`frontend/next.config.ts` に以下の設定を追加（既に一部実装済み）：

```typescript
const nextConfig: NextConfig = {
  // 開発環境でのメモリ最適化
  experimental: {
    // パッケージインポートの最適化（既に実装済み）
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@tabler/icons-react',
    ],
  },
  // 開発サーバーのメモリ使用量を抑制
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config, { dev }) => {
      if (dev) {
        // 開発環境でのメモリ最適化
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };
      }
      return config;
    },
  }),
};
```

### 4. 不要なウォッチモードの無効化

Prisma sync watchが不要な場合は、`dev` コマンドから除外：

```bash
# Prisma syncなしで起動
pnpm run-p backend:dev frontend:dev:wait
```

または、`package.json` に新しいスクリプトを追加：

```json
{
  "scripts": {
    "dev:no-prisma-sync": "run-p backend:dev frontend:dev:wait"
  }
}
```

### 5. メモリ使用量の監視

メモリ使用量を監視するスクリプトを実行：

```bash
# メモリ使用量を確認
pnpm dev:memory-check

# または、手動で確認（Windows）
Get-Process node | Select-Object Id, ProcessName, @{Name="Memory(MB)";Expression={[math]::Round($_.WS / 1MB, 2)}}

# macOS/Linux
ps aux | grep node | awk '{print $2, $4, $11}' | sort -k2 -rn
```

## 推奨設定

### 8GBメモリのPC向け

```bash
# 各プロセスのメモリ制限
NODE_OPTIONS="--max-old-space-size=1536" pnpm dev
```

- Next.js: 1.5GB
- NestJS: 1GB
- Prisma sync: 512MB（自動調整）

### 16GBメモリのPC向け

```bash
# デフォルトのままでも問題なし
pnpm dev
```

または、より快適な開発のために：

```bash
NODE_OPTIONS="--max-old-space-size=3072" pnpm dev
```

## トラブルシューティング

### メモリ不足エラーが発生する場合

1. **メモリ制限を下げる**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=1024" pnpm dev
   ```

2. **Prisma syncを無効化**:
   ```bash
   pnpm dev:no-prisma-sync
   ```

3. **個別に起動して監視**:
   ```bash
   # バックエンドのみ
   pnpm backend:dev:low-memory
   
   # 別ターミナルでフロントエンド
   pnpm frontend:dev:low-memory
   ```

### パフォーマンスが低下する場合

メモリ制限を下げすぎると、パフォーマンスが低下する可能性があります。以下のバランスを取ってください：

- **最小**: 1GB（動作はするが遅い）
- **推奨**: 1.5-2GB（バランスが良い）
- **快適**: 2-3GB（快適だがメモリを多く使用）

## 参考リンク

- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [NestJS Performance](https://docs.nestjs.com/techniques/performance)

