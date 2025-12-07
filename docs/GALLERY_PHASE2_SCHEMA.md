# ギャラリー機能 Phase 2: スキーマ & マイグレーション

## 概要

ギャラリー機能のデータベーススキーマを設計・実装します。既存の `Graduation` テーブルを `GalleryEntry` に統合し、メディア管理機能を追加します。

## 技術要件

- **ORM**: Prisma 6. 14.0
- **DB**: PostgreSQL 15+
- **統合対象**: 既存の `Graduation` テーブル → `GalleryEntry` に移行

## 実装タスク

### 1.  Prisma スキーマの追加

`backend/prisma/schema.prisma` に以下のモデルを追加：

```prisma
// ==========================================
// Gallery Models
// ==========================================

model GalleryEntry {
  id        String          @id @default(uuid())
  category  GalleryCategory

  // スナップショット情報（登録時点でコピー、後から編集可能）
  name      String
  gender    String          // MALE, FEMALE, NEUTER, SPAY
  coatColor String?          @map("coat_color")
  breed     String? 

  // 元の猫への参照（任意）
  catId     String?          @map("cat_id")
  cat       Cat?             @relation("GalleryEntryCat", fields: [catId], references: [id], onDelete: SetNull)

  // 卒業猫用フィールド（Graduation統合）
  transferDate   DateTime?   @map("transfer_date")
  destination    String? 
  externalLink   String?    @map("external_link")
  transferredBy  String?    @map("transferred_by")
  catSnapshot    Json?      @map("cat_snapshot")
  notes          String? 

  // メディア
  media     GalleryMedia[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // インデックス
  @@index([category])
  @@index([catId])
  @@index([createdAt])
  @@index([category, createdAt])
  @@map("gallery_entries")
}

enum GalleryCategory {
  KITTEN
  FATHER
  MOTHER
  GRADUATION
}

model GalleryMedia {
  id             String       @id @default(uuid())
  galleryEntryId String       @map("gallery_entry_id")
  galleryEntry   GalleryEntry @relation(fields: [galleryEntryId], references: [id], onDelete: Cascade)

  type           MediaType
  url            String
  thumbnailUrl   String?       @map("thumbnail_url")
  order          Int          @default(0)

  createdAt      DateTime     @default(now()) @map("created_at")

  // インデックス
  @@index([galleryEntryId])
  @@index([order])
  @@map("gallery_media")
}

enum MediaType {
  IMAGE
  YOUTUBE
}
```

### 2. Cat モデルへのリレーション追加

`Cat` モデルに以下のリレーションを追加：

```prisma
model Cat {
  // ... 既存のフィールド

  // Gallery relations
  galleryEntries GalleryEntry[] @relation("GalleryEntryCat")

  // ...  既存のリレーション
}
```

### 3. マイグレーション生成

```bash
cd backend
pnpm prisma migrate dev --name add_gallery_models
```

### 4. 既存Graduation → GalleryEntry マイグレーション

既存の `Graduation` データを `GalleryEntry` に移行するためのマイグレーションスクリプト：

#### 4-1. マイグレーションスクリプト作成

`backend/prisma/migrations/[timestamp]_migrate_graduation_to_gallery/migration.sql` に追記（または新規マイグレーションで実行）：

```sql
-- 既存のGraduationデータをGalleryEntryに移行
INSERT INTO gallery_entries (
  id,
  category,
  name,
  gender,
  coat_color,
  breed,
  cat_id,
  transfer_date,
  destination,
  transferred_by,
  cat_snapshot,
  notes,
  created_at,
  updated_at
)
SELECT
  g.id,
  'GRADUATION'::\"GalleryCategory\",
  COALESCE((g.cat_snapshot->>'name')::text, c.name, 'Unknown'),
  COALESCE((g. cat_snapshot->>'gender')::text, c.gender, 'MALE'),
  (g.cat_snapshot->'coatColor'->>'name')::text,
  (g.cat_snapshot->'breed'->>'name')::text,
  g.cat_id,
  g. transfer_date,
  g.destination,
  g.transferred_by,
  g.cat_snapshot,
  g. notes,
  g.created_at,
  g.updated_at
FROM graduations g
LEFT JOIN cats c ON g.cat_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM gallery_entries ge WHERE ge.id = g.id
);
```

#### 4-2.  Seed用のTypeScriptマイグレーション（代替手段）

`backend/prisma/seed-gallery-migration.ts` を作成：

```typescript
import { PrismaClient, GalleryCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface CatSnapshot {
  name?: string;
  gender?: string;
  coatColor?: { name?: string };
  breed?: { name?: string };
}

async function migrateGraduationsToGallery() {
  console.log('Graduation → GalleryEntry マイグレーション開始.. .');

  const graduations = await prisma.graduation.findMany({
    include: {
      cat: true,
    },
  });

  console.log(`${graduations.length}件のGraduationを移行します`);

  for (const grad of graduations) {
    // 既存チェック
    const existing = await prisma. galleryEntry.findFirst({
      where: {
        catId: grad.catId,
        category: GalleryCategory. GRADUATION,
      },
    });

    if (existing) {
      console.log(`スキップ: ${grad.id} (既に存在)`);
      continue;
    }

    const snapshot = grad.catSnapshot as CatSnapshot | null;

    await prisma.galleryEntry.create({
      data: {
        category: GalleryCategory. GRADUATION,
        name: snapshot?.name || grad.cat?.name || 'Unknown',
        gender: snapshot?.gender || grad.cat?.gender || 'MALE',
        coatColor: snapshot?.coatColor?. name || null,
        breed: snapshot?.breed?.name || null,
        catId: grad. catId,
        transferDate: grad. transferDate,
        destination: grad.destination,
        transferredBy: grad.transferredBy,
        catSnapshot: grad.catSnapshot,
        notes: grad. notes,
        createdAt: grad. createdAt,
        updatedAt: grad.updatedAt,
      },
    });

    console.log(`移行完了: ${grad. id}`);
  }

  console.log('マイグレーション完了');
}

migrateGraduationsToGallery()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 5. Gallery API Module 作成

#### 5-1.  ファイル構成

```
backend/src/gallery/
├── gallery. module.ts
├── gallery.controller.ts
├── gallery.service.ts
├── dto/
│   ├── index.ts
│   ├── create-gallery-entry.dto.ts
│   ├── update-gallery-entry.dto.ts
│   ├── add-media.dto. ts
│   └── gallery-query.dto.ts
└── interfaces/
    └── gallery-entry.interface.ts
```

#### 5-2. DTOの定義

**create-gallery-entry. dto.ts**

```typescript
import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GalleryCategoryDto {
  KITTEN = 'KITTEN',
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GRADUATION = 'GRADUATION',
}

export class CreateMediaDto {
  @ApiProperty({ enum: ['IMAGE', 'YOUTUBE'] })
  @IsEnum(['IMAGE', 'YOUTUBE'])
  type: 'IMAGE' | 'YOUTUBE';

  @ApiProperty({ description: 'メディアURL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'サムネイルURL（YouTube用）' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '表示順序' })
  @IsOptional()
  order?: number;
}

export class CreateGalleryEntryDto {
  @ApiProperty({ enum: GalleryCategoryDto })
  @IsEnum(GalleryCategoryDto)
  category: GalleryCategoryDto;

  @ApiProperty({ description: '猫の名前' })
  @IsString()
  name: string;

  @ApiProperty({ description: '性別', enum: ['MALE', 'FEMALE', 'NEUTER', 'SPAY'] })
  @IsEnum(['MALE', 'FEMALE', 'NEUTER', 'SPAY'])
  gender: string;

  @ApiPropertyOptional({ description: '毛色' })
  @IsOptional()
  @IsString()
  coatColor?: string;

  @ApiPropertyOptional({ description: '品種' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ description: '在舎猫ID（参照用）' })
  @IsOptional()
  @IsUUID()
  catId?: string;

  @ApiPropertyOptional({ description: '譲渡日（卒業猫用）' })
  @IsOptional()
  @IsDateString()
  transferDate?: string;

  @ApiPropertyOptional({ description: '譲渡先（卒業猫用）' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ description: '外部リンク（卒業猫用）' })
  @IsOptional()
  @IsString()
  externalLink?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'メディア（画像・動画）', type: [CreateMediaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[];
}
```

**gallery-query.dto.ts**

```typescript
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GalleryCategoryDto } from './create-gallery-entry. dto';

export class GalleryQueryDto {
  @ApiPropertyOptional({ enum: GalleryCategoryDto })
  @IsOptional()
  @IsEnum(GalleryCategoryDto)
  category?: GalleryCategoryDto;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

#### 5-3.  サービスの実装

**gallery.service.ts**

```typescript
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GalleryUploadService } from '../gallery-upload/gallery-upload.service';
import { CreateGalleryEntryDto, GalleryQueryDto, GalleryCategoryDto } from './dto';
import { GalleryCategory, MediaType } from '@prisma/client';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService. name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: GalleryUploadService,
  ) {}

  /**
   * ギャラリーエントリ一覧取得
   */
  async findAll(query: GalleryQueryDto) {
    const { category, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = category ? { category: category as GalleryCategory } : {};

    const [entries, total] = await Promise. all([
      this.prisma.galleryEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          media: {
            orderBy: { order: 'asc' },
          },
        },
      }),
      this.prisma.galleryEntry.count({ where }),
    ]);

    return {
      success: true,
      data: entries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * ギャラリーエントリ詳細取得
   */
  async findOne(id: string) {
    const entry = await this.prisma.galleryEntry.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        cat: {
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`ギャラリーエントリ（ID: ${id}）が見つかりません`);
    }

    return {
      success: true,
      data: entry,
    };
  }

  /**
   * ギャラリーエントリ作成
   */
  async create(dto: CreateGalleryEntryDto, userId?: string) {
    const { media, catId, transferDate, ... entryData } = dto;

    // 在舎猫からスナップショットを取得
    let catSnapshot = null;
    if (catId) {
      const cat = await this. prisma.cat. findUnique({
        where: { id: catId },
        include: {
          breed: true,
          coatColor: true,
          tags: { include: { tag: true } },
        },
      });
      if (cat) {
        catSnapshot = cat;
      }
    }

    const entry = await this. prisma.galleryEntry.create({
      data: {
        ...entryData,
        category: dto.category as GalleryCategory,
        catId,
        transferDate: transferDate ?  new Date(transferDate) : null,
        transferredBy: userId,
        catSnapshot,
        media: media
          ? {
              create: media.map((m, index) => ({
                type: m.type as MediaType,
                url: m.url,
                thumbnailUrl: m. thumbnailUrl,
                order: m.order ??  index,
              })),
            }
          : undefined,
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    });

    this.logger.log(`ギャラリーエントリ作成: ${entry.id} (${entry.category})`);

    return {
      success: true,
      data: entry,
    };
  }

  /**
   * ギャラリーエントリ更新
   */
  async update(id: string, dto: Partial<CreateGalleryEntryDto>) {
    const existing = await this.prisma.galleryEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`ギャラリーエントリ（ID: ${id}）が見つかりません`);
    }

    const { media, transferDate, ...updateData } = dto;

    const entry = await this. prisma.galleryEntry.update({
      where: { id },
      data: {
        ...updateData,
        category: dto.category as GalleryCategory | undefined,
        transferDate: transferDate ?  new Date(transferDate) : undefined,
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: entry,
    };
  }

  /**
   * ギャラリーエントリ削除
   */
  async delete(id: string) {
    const entry = await this.prisma.galleryEntry. findUnique({
      where: { id },
      include: { media: true },
    });

    if (!entry) {
      throw new NotFoundException(`ギャラリーエントリ（ID: ${id}）が見つかりません`);
    }

    // 関連画像をCloud Storageから削除
    for (const m of entry.media) {
      if (m.type === 'IMAGE' && m.url. includes('storage. googleapis.com')) {
        const fileKey = this.extractFileKey(m. url);
        if (fileKey) {
          await this. uploadService.deleteFile(fileKey);
        }
      }
    }

    await this.prisma.galleryEntry. delete({ where: { id } });

    return {
      success: true,
      message: 'ギャラリーエントリを削除しました',
    };
  }

  /**
   * メディア追加
   */
  async addMedia(entryId: string, mediaData: { type: 'IMAGE' | 'YOUTUBE'; url: string; thumbnailUrl?: string }) {
    const entry = await this.prisma.galleryEntry.findUnique({
      where: { id: entryId },
      include: { media: true },
    });

    if (!entry) {
      throw new NotFoundException(`ギャラリーエントリ（ID: ${entryId}）が見つかりません`);
    }

    const maxOrder = entry.media.reduce((max, m) => Math.max(max, m.order), -1);

    const media = await this.prisma.galleryMedia.create({
      data: {
        galleryEntryId: entryId,
        type: mediaData.type as MediaType,
        url: mediaData. url,
        thumbnailUrl: mediaData.thumbnailUrl,
        order: maxOrder + 1,
      },
    });

    return {
      success: true,
      data: media,
    };
  }

  /**
   * メディア削除
   */
  async deleteMedia(mediaId: string) {
    const media = await this.prisma.galleryMedia. findUnique({ where: { id: mediaId } });

    if (!media) {
      throw new NotFoundException(`メディア（ID: ${mediaId}）が見つかりません`);
    }

    // 画像の場合はCloud Storageからも削除
    if (media.type === 'IMAGE' && media.url. includes('storage.googleapis.com')) {
      const fileKey = this.extractFileKey(media.url);
      if (fileKey) {
        await this.uploadService.deleteFile(fileKey);
      }
    }

    await this.prisma.galleryMedia. delete({ where: { id: mediaId } });

    return {
      success: true,
      message: 'メディアを削除しました',
    };
  }

  /**
   * 一括登録（子育て中タブから）
   */
  async bulkCreate(entries: CreateGalleryEntryDto[], userId?: string) {
    const results = [];

    for (const dto of entries) {
      const result = await this.create(dto, userId);
      results.push(result. data);
    }

    return {
      success: true,
      data: results,
      meta: {
        created: results.length,
      },
    };
  }

  private extractFileKey(url: string): string | null {
    const match = url.match(/storage\.googleapis\.com\/[^/]+\/(. +)/);
    return match ? match[1] : null;
  }
}
```

#### 5-4. コントローラーの実装

**gallery. controller.ts**

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { CreateGalleryEntryDto, GalleryQueryDto, CreateMediaDto } from './dto';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @ApiOperation({ summary: 'ギャラリーエントリ一覧取得' })
  @ApiQuery({ name: 'category', required: false, enum: ['KITTEN', 'FATHER', 'MOTHER', 'GRADUATION'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'ギャラリー一覧' })
  async findAll(@Query() query: GalleryQueryDto) {
    return this.galleryService. findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ギャラリーエントリ詳細取得' })
  @ApiParam({ name: 'id', description: 'エントリID' })
  @ApiResponse({ status: 200, description: 'ギャラリー詳細' })
  @ApiResponse({ status: 404, description: 'エントリが見つかりません' })
  async findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus. CREATED)
  @ApiOperation({ summary: 'ギャラリーエントリ作成' })
  @ApiResponse({ status: 201, description: '作成成功' })
  async create(@Body() dto: CreateGalleryEntryDto) {
    return this.galleryService. create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ギャラリーエントリ更新' })
  @ApiParam({ name: 'id', description: 'エントリID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: 'エントリが見つかりません' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateGalleryEntryDto>) {
    return this.galleryService. update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus. OK)
  @ApiOperation({ summary: 'ギャラリーエントリ削除' })
  @ApiParam({ name: 'id', description: 'エントリID' })
  @ApiResponse({ status: 200, description: '削除成功' })
  @ApiResponse({ status: 404, description: 'エントリが見つかりません' })
  async delete(@Param('id') id: string) {
    return this.galleryService.delete(id);
  }

  @Post(':id/media')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'メディア追加' })
  @ApiParam({ name: 'id', description: 'エントリID' })
  @ApiResponse({ status: 201, description: 'メディア追加成功' })
  async addMedia(@Param('id') id: string, @Body() dto: CreateMediaDto) {
    return this.galleryService. addMedia(id, dto);
  }

  @Delete('media/:mediaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'メディア削除' })
  @ApiParam({ name: 'mediaId', description: 'メディアID' })
  @ApiResponse({ status: 200, description: 'メディア削除成功' })
  async deleteMedia(@Param('mediaId') mediaId: string) {
    return this. galleryService.deleteMedia(mediaId);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '一括登録（子育て中タブ用）' })
  @ApiResponse({ status: 201, description: '一括登録成功' })
  async bulkCreate(@Body() entries: CreateGalleryEntryDto[]) {
    return this.galleryService.bulkCreate(entries);
  }
}
```

#### 5-5. モジュールの定義

**gallery. module.ts**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GalleryUploadModule } from '../gallery-upload/gallery-upload.module';
import { GalleryController } from './gallery. controller';
import { GalleryService } from './gallery.service';

@Module({
  imports: [PrismaModule, GalleryUploadModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
```

### 6. AppModuleへの登録

`backend/src/app. module.ts` に `GalleryModule` を追加：

```typescript
import { GalleryModule } from './gallery/gallery. module';

@Module({
  imports: [
    // ... 既存のモジュール
    GalleryModule,
  ],
})
export class AppModule {}
```

## 品質チェックリスト

- [ ] `pnpm prisma generate` が成功すること
- [ ] `pnpm db:migrate` が成功すること
- [ ] `pnpm lint` が通ること
- [ ] `pnpm backend:build` が成功すること
- [ ] Swagger ドキュメント (`/api/docs`) でGalleryエンドポイントが確認できること
- [ ] 既存のGraduationデータが正しくGalleryEntryに移行されること

## 実行手順

```bash
cd backend

# 1.  Prismaクライアント生成
pnpm prisma generate

# 2. マイグレーション実行
pnpm prisma migrate dev --name add_gallery_models

# 3.  既存データ移行（必要に応じて）
pnpm ts-node prisma/seed-gallery-migration.ts

# 4. ビルド確認
pnpm build

# 5.  テスト
pnpm test:e2e -- --passWithNoTests
```

## 完了条件

1. `GalleryEntry` と `GalleryMedia` テーブルが作成される
2.  CRUD APIが動作する（Swagger UIで確認）
3. 既存のGraduationデータがGalleryEntryに移行される
4. カテゴリ別のフィルタリングが動作する
5.  メディアの追加・削除が動作する