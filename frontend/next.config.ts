import type { NextConfig } from "next";
import path from "path";
// Bundle Analyzer (ANALYZE=true でビルド時に有効化)
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
  eslint: {
    // 本番ビルド時にESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 本番ビルド時にTypeScriptエラーを無視（開発時は型チェックが有効）
    ignoreBuildErrors: false,
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Build configuration
  generateEtags: false,
  poweredByHeader: false,
  // Standalone output for production deployment
  output: 'standalone',
  // Bundle size optimization
  // swcMinify: true, // Removed in Next.js 15 as it's default
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@tabler/icons-react',
    ],
  },
  // モノレポ対応のためのワークスペースルート設定
  outputFileTracingRoot: path.join(__dirname, "../"),
  // Memory optimization for CI/CD and development
  webpack: (config, { dev, isServer }) => {
    // 開発環境でのメモリ最適化
    if (dev) {
      // 開発環境ではメモリ使用量を抑制するため、一部の最適化を無効化
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (config.optimization) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        config.optimization.removeAvailableModules = false;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        config.optimization.removeEmptyChunks = false;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        config.optimization.splitChunks = false;
      }
    }
    
    // 本番ビルド時の最適化
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!dev && !isServer && config.optimization?.splitChunks?.cacheGroups) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const cg = config.optimization.splitChunks.cacheGroups;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      config.optimization.splitChunks.cacheGroups = {
        ...cg,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config;
  },
  // Remove rewrites and headers as they don't work with static export
};

export default bundleAnalyzer(nextConfig);
