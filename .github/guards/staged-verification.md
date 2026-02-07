# 段階的検証ポイント

## Stage 1: ファイル変更時

```bash
pnpm lint
```

## Stage 2: 機能単位完成時

```bash
pnpm --filter <package> run test
pnpm --filter <package> run build
```

## Stage 3: PR 前最終検証

```bash
pnpm lint
pnpm backend:build
pnpm frontend:build
pnpm db:migrate
pnpm db:seed
pnpm dev:health
```

## 禁止事項

- エラーを残したまま次工程へ進む
- 後回し前提のコミット
