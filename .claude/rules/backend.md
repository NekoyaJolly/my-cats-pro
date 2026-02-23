---
paths:
  - "backend/**"
---

# Backend ルール (NestJS + Prisma)

## レイヤー規約

- Controller → Service → PrismaService の順序を厳守。Controller で直接 Prisma を呼ばない
- ビジネスロジックは Service に集約。Controller はリクエスト/レスポンスの変換のみ
- 新しいモジュールは `backend/src/` 配下に縦割りで配置（`module`, `controller`, `service`, `dto` をセット）

## DTO とバリデーション

- 入出力は DTO + `class-validator` デコレータで定義
- DTO 命名: `Create*Dto`, `Update*Dto`, `*ResponseDto`
- レスポンス整形が必要な場合は Presenter / Serializer を導入してもよい

## Prisma

- クエリは `select` / `include` で必要なフィールドのみ取得し N+1 を回避
- スキーマ変更後は `pnpm db:migrate` → `pnpm db:seed` で検証
- パッケージ追加後は `pnpm install` → `pnpm --filter backend run prisma:generate`

## エラー処理

- NestJS 例外フィルタ (`HttpException`, `BadRequestException`, カスタム例外) を使用
- エラーメッセージは日本語で記述
- `unknown` なエラーは `instanceof` 判定やステータスコードで分岐

## テスト

- ユニットテスト: `*.spec.ts`、PrismaService をモック
- e2e テスト: `test/*.e2e-spec.ts`
- Controller にサービス依存を追加・変更したら `*.controller.spec.ts` の `Test.createTestingModule` の `providers` を必ず更新
- 品質ゲート: `pnpm --filter backend run lint` → `pnpm backend:build` → `pnpm test:e2e`

## セキュリティ

- 認証: JWT + Passport (`@UseGuards(JwtAuthGuard)`)
- API ドキュメント: Swagger デコレータ (`@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`) を付与
