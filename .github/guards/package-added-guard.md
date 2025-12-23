# パッケージ追加時の必須手順

## 1. インストール直後

```bash
pnpm install
pnpm prisma:generate
```

理由: node_modules 更新により Prisma Client の依存関係が変化する可能性があるため

## 2. 型チェック

```bash
pnpm --filter backend run build
pnpm --filter frontend run build
```

## 3. Lint チェック

```bash
pnpm lint
```

## 4. 依存関係の確認

- package.json の diff 確認
- pnpm-lock.yaml 更新確認
- `pnpm audit` による脆弱性チェック

## ルール

- いずれかで失敗した場合、次工程へ進まない
- 原因解決を最優先とする
