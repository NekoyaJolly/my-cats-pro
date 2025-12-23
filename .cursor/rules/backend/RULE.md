---
description: "NestJS 10 + Prisma 6 + PostgreSQL バックエンド開発ルール"
globs:
  - "backend/**/*.ts"
  - "backend/prisma/**"
  - "backend/test/**"
alwaysApply: false
---

# Backend 開発ルール

## 技術スタック

- NestJS 10
- Prisma 6.14.0
- PostgreSQL 15+
- TypeScript 5

## 必須ルール

### アーキテクチャ

```
Controller (HTTP層)
  ↓ DTOでバリデーション
Service (ビジネスロジック)
  ↓ EntityやPrisma型で処理
Repository/PrismaService (データアクセス)
```

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

## コード例

### Service の標準形

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    const cat = await this.prisma.cat.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        breed: true,
      },
    });

    if (!cat) {
      throw new NotFoundException('指定された猫が見つかりません');
    }

    return cat;
  }

  async create(dto: CreateCatDto) {
    return this.prisma.cat.create({
      data: {
        name: dto.name,
        breed: dto.breed,
      },
    });
  }
}
```

### DTO の標準形

```typescript
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty({ description: '猫の名前', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: '名前は必須です' })
  @MaxLength(100, { message: '名前は100文字以内で入力してください' })
  name: string;

  @ApiProperty({ description: '品種', required: false })
  @IsString()
  @IsOptional()
  breed?: string;
}
```

## 作業フロー

### 新規機能追加時

1. DTOを定義（入力バリデーション）
2. Service にビジネスロジックを実装
3. Controller にエンドポイントを追加
4. Swagger アノテーションを追加
5. ユニットテストを作成
6. E2E テストで実際のHTTPリクエストをテスト

### Prisma スキーマ変更時

```bash
pnpm --filter backend run prisma:migrate  # マイグレーション生成
pnpm --filter backend run prisma:generate # TypeScript 型を再生成
pnpm --filter backend run test            # テスト実行
```

## 変更してはいけないファイル

- `prisma/migrations/**` - マイグレーションファイルは自動生成のみ
- `node_modules/**`
- `dist/**` - ビルド成果物

## 品質ゲート

変更後、必ず以下を実行:

```bash
pnpm --filter backend run lint
pnpm --filter backend run build
pnpm --filter backend run test
```

Prisma スキーマを変更した場合:

```bash
pnpm --filter backend run prisma:generate
pnpm --filter backend run prisma:migrate
pnpm --filter backend run test
```

## 品質チェックリスト

- すべての public メソッドに型定義がある
- any/unknown を使用していない
- エラーメッセージが日本語である
- N+1 クエリがない（select/include で最適化）
- DTO でバリデーションが完結している
- Swagger ドキュメントが正確である

## 参考ドキュメント

- [NestJS 公式ドキュメント](https://docs.nestjs.com/)
- [Prisma ベストプラクティス](https://www.prisma.io/docs/guides/performance-and-optimization)

