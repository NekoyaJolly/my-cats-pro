---
applyTo: "backend/**"
excludeAgent: ""
---

# Backend パス固有の指示

このファイルは `backend/` ディレクトリに対する Copilot の動作を制御します。

## 適用範囲
- `backend/**/*.ts`
- `backend/prisma/**`
- `backend/test/**`

## 必須ルール

### アーキテクチャ
- Controller で直接 Prisma を呼び出さない
- Service レイヤーでビジネスロジックを実装
- PrismaService を使用してデータアクセス

### 型安全
- `any` / `unknown` の使用禁止
- すべての関数に明示的な型定義
- DTO で入力をバリデーション

### エラー処理
- `HttpException` 系を使用
- エラーメッセージは日本語
- 適切なHTTPステータスコードを返却

### Prisma
- スキーマ変更後は必ず `prisma:generate` を実行
- マイグレーションを生成して適用
- N+1 問題を避ける（select/include で最適化）

## ビルド・テストコマンド

```bash
# Lint
pnpm --filter backend run lint

# 型チェック
pnpm --filter backend run type-check

# ビルド
pnpm --filter backend run build

# ユニットテスト
pnpm --filter backend run test

# E2E テスト
pnpm --filter backend run test:e2e

# Prisma 関連
pnpm --filter backend run prisma:generate
pnpm --filter backend run prisma:migrate
pnpm --filter backend run prisma:deploy
```

## 変更してはいけないファイル
- `prisma/migrations/**` - マイグレーションファイルは自動生成のみ
- `node_modules/**`
- `dist/**` - ビルド成果物

## コード例

### Service の基本構造
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExampleService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    const item = await this.prisma.example.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('データが見つかりません');
    }

    return item;
  }
}
```

### DTO の基本構造
```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExampleDto {
  @ApiProperty({ description: '名前' })
  @IsString()
  @IsNotEmpty({ message: '名前は必須です' })
  name: string;
}
```

## 品質ゲート
変更後、必ず以下を実行してください:
1. `pnpm --filter backend run lint`
2. `pnpm --filter backend run build`
3. `pnpm --filter backend run test`

Prisma スキーマを変更した場合:
1. `pnpm --filter backend run prisma:generate`
2. `pnpm --filter backend run prisma:migrate`
3. テスト実行

## 参考ドキュメント
- [backend/AGENTS.md](../backend/AGENTS.md) - 詳細なガイドライン
- [NestJS ドキュメント](https://docs.nestjs.com/)
- [Prisma ドキュメント](https://www.prisma.io/docs)
