# ギャラリー機能 Phase 1: Cloud Storage アップロードAPI

## 概要

ギャラリー機能の基盤となる画像アップロードAPIを実装します。Google Cloud Storageを使用し、Signed URL方式でセキュアなアップロードを実現します。

## 技術要件

- **ストレージ**: Google Cloud Storage（既存のGCPプロジェクト `my-cats-pro` を使用）
- **認証方式**: Signed URL（クライアントから直接GCSへアップロード）
- **画像処理**: クライアント側でリサイズ（1200px / 85%品質）
- **対応形式**: JPEG, PNG, WebP

## 実装タスク

### 1. バックエンド: GalleryUploadModule 作成

#### 1-1. 必要なパッケージインストール

```bash
cd backend
pnpm add @google-cloud/storage
```

#### 1-2. 環境変数の追加

`. env` および `. env.example` に以下を追加：

```env
# Google Cloud Storage
GCS_BUCKET_NAME=mycats-pro-gallery
GCS_PROJECT_ID=my-cats-pro
# 本番環境では GOOGLE_APPLICATION_CREDENTIALS が自動設定される（Cloud Run）
```

#### 1-3. ファイル構成

```
backend/src/gallery-upload/
├── gallery-upload.module.ts
├── gallery-upload.controller.ts
├── gallery-upload.service.ts
├── dto/
│   ├── index.ts
│   ├── generate-upload-url.dto. ts
│   └── confirm-upload.dto. ts
└── interfaces/
    └── upload-result.interface.ts
```

#### 1-4.  DTOの定義

**generate-upload-url. dto.ts**
```typescript
import { IsString, IsIn, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateUploadUrlDto {
  @ApiProperty({ description: 'ファイル名', example: 'kitten-photo-1.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'コンテンツタイプ', enum: ['image/jpeg', 'image/png', 'image/webp'] })
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';

  @ApiProperty({ description: 'ファイルサイズ（バイト）', example: 1024000 })
  @IsNumber()
  @Min(1)
  @Max(10 * 1024 * 1024) // 10MB上限
  fileSize: number;
}
```

**confirm-upload.dto.ts**
```typescript
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUploadDto {
  @ApiProperty({ description: 'アップロード時に発行されたファイルキー' })
  @IsString()
  fileKey: string;

  @ApiProperty({ description: '紐付けるギャラリーエントリID（任意）', required: false })
  @IsUUID()
  galleryEntryId?: string;
}
```

#### 1-5. サービスの実装

**gallery-upload.service.ts**

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { GenerateUploadUrlDto } from './dto/generate-upload-url. dto';

@Injectable()
export class GalleryUploadService {
  private readonly logger = new Logger(GalleryUploadService.name);
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
    });
    this.bucketName = process.env. GCS_BUCKET_NAME || 'mycats-pro-gallery';
  }

  /**
   * Signed URLを生成してクライアントに返す
   */
  async generateUploadUrl(dto: GenerateUploadUrlDto): Promise<{
    uploadUrl: string;
    fileKey: string;
    publicUrl: string;
  }> {
    const fileExtension = this.getExtension(dto.contentType);
    const fileKey = `gallery/${uuidv4()}${fileExtension}`;

    try {
      const bucket = this.storage. bucket(this.bucketName);
      const file = bucket.file(fileKey);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15分有効
        contentType: dto.contentType,
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;

      this.logger.log(`Signed URL generated for: ${fileKey}`);

      return {
        uploadUrl: signedUrl,
        fileKey,
        publicUrl,
      };
    } catch (error) {
      this.logger.error('Signed URL生成に失敗しました', error);
      throw new BadRequestException('アップロードURLの生成に失敗しました');
    }
  }

  /**
   * アップロード完了を確認し、ファイルの存在をチェック
   */
  async confirmUpload(fileKey: string): Promise<{
    success: boolean;
    url: string;
    size: number;
  }> {
    try {
      const bucket = this.storage.bucket(this. bucketName);
      const file = bucket.file(fileKey);

      const [exists] = await file.exists();
      if (! exists) {
        throw new BadRequestException('ファイルが見つかりません。アップロードが完了していない可能性があります');
      }

      const [metadata] = await file.getMetadata();

      return {
        success: true,
        url: `https://storage.googleapis. com/${this.bucketName}/${fileKey}`,
        size: Number(metadata.size),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('アップロード確認に失敗しました', error);
      throw new BadRequestException('アップロードの確認に失敗しました');
    }
  }

  /**
   * ファイルを削除
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileKey);
      await file.delete();
      this. logger.log(`File deleted: ${fileKey}`);
    } catch (error) {
      this.logger.error(`ファイル削除に失敗: ${fileKey}`, error);
      // 削除失敗は致命的ではないのでエラーを投げない
    }
  }

  private getExtension(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return map[contentType] || '.jpg';
  }
}
```

#### 1-6.  コントローラーの実装

**gallery-upload.controller.ts**

```typescript
import { Controller, Post, Body, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GalleryUploadService } from './gallery-upload.service';
import { GenerateUploadUrlDto, ConfirmUploadDto } from './dto';

@ApiTags('Gallery Upload')
@Controller('gallery/upload')
export class GalleryUploadController {
  constructor(private readonly uploadService: GalleryUploadService) {}

  @Post('signed-url')
  @ApiOperation({ summary: 'アップロード用Signed URLを生成' })
  @ApiResponse({ status: 201, description: 'Signed URL生成成功' })
  @ApiResponse({ status: 400, description: 'パラメータエラー' })
  async generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    const result = await this.uploadService.generateUploadUrl(dto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('confirm')
  @HttpCode(HttpStatus. OK)
  @ApiOperation({ summary: 'アップロード完了を確認' })
  @ApiResponse({ status: 200, description: '確認成功' })
  @ApiResponse({ status: 400, description: 'ファイルが見つからない' })
  async confirmUpload(@Body() dto: ConfirmUploadDto) {
    const result = await this. uploadService.confirmUpload(dto.fileKey);
    return {
      success: true,
      data: result,
    };
  }

  @Delete(':fileKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'アップロード済みファイルを削除' })
  @ApiResponse({ status: 200, description: '削除成功' })
  async deleteFile(@Param('fileKey') fileKey: string) {
    await this.uploadService.deleteFile(decodeURIComponent(fileKey));
    return {
      success: true,
      message: 'ファイルを削除しました',
    };
  }
}
```

#### 1-7. モジュールの定義

**gallery-upload.module. ts**

```typescript
import { Module } from '@nestjs/common';
import { GalleryUploadController } from './gallery-upload.controller';
import { GalleryUploadService } from './gallery-upload. service';

@Module({
  controllers: [GalleryUploadController],
  providers: [GalleryUploadService],
  exports: [GalleryUploadService],
})
export class GalleryUploadModule {}
```

#### 1-8.  AppModuleへの登録

`backend/src/app. module.ts` に `GalleryUploadModule` を追加：

```typescript
import { GalleryUploadModule } from './gallery-upload/gallery-upload.module';

@Module({
  imports: [
    // ... 既存のモジュール
    GalleryUploadModule,
  ],
})
export class AppModule {}
```

### 2. フロントエンド: 画像リサイズユーティリティ

#### 2-1. ファイル構成

```
frontend/src/lib/utils/
└── image-resizer. ts
```

#### 2-2.  画像リサイズ関数

**image-resizer. ts**

```typescript
/**
 * 画像リサイズ設定
 */
export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<ImageResizeOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: 'image/jpeg',
};

/**
 * 画像をリサイズしてBlobを返す
 * - アスペクト比を維持
 * - 1200px / 85%品質で最適化
 */
export async function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // アスペクト比を維持してリサイズ
      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts. maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (! ctx) {
        reject(new Error('Canvas context の取得に失敗しました'));
        return;
      }

      // 高品質リサイズ
      ctx.imageSmoothingEnabled = true;
      ctx. imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('画像の変換に失敗しました'));
          }
        },
        opts.format,
        opts.quality
      );
    };

    img. onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * ファイルサイズを人間が読める形式に変換
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 画像ファイルかどうかを判定
 */
export function isImageFile(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}
```

### 3. フロントエンド: アップロードフック

#### 3-1. ファイル構成

```
frontend/src/lib/api/hooks/
└── use-gallery-upload.ts
```

#### 3-2. カスタムフック

**use-gallery-upload.ts**

```typescript
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resizeImage, isImageFile, formatFileSize } from '@/lib/utils/image-resizer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1';

interface UploadProgress {
  fileKey: string;
  fileName: string;
  status: 'pending' | 'resizing' | 'uploading' | 'confirming' | 'completed' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

interface SignedUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    fileKey: string;
    publicUrl: string;
  };
}

/**
 * ギャラリー画像アップロード用フック
 */
export function useGalleryUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());

  const updateUpload = useCallback((fileKey: string, updates: Partial<UploadProgress>) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fileKey);
      if (current) {
        newMap.set(fileKey, { ...current, ...updates });
      }
      return newMap;
    });
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!isImageFile(file)) {
      throw new Error('JPEG、PNG、WebP形式の画像のみアップロードできます');
    }

    const tempKey = `temp-${Date.now()}-${file.name}`;

    // 初期状態を設定
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempKey, {
        fileKey: tempKey,
        fileName: file.name,
        status: 'resizing',
        progress: 0,
      });
      return newMap;
    });

    try {
      // 1. 画像をリサイズ
      const resizedBlob = await resizeImage(file);
      updateUpload(tempKey, { status: 'uploading', progress: 20 });

      // 2. Signed URLを取得
      const signedUrlRes = await fetch(`${API_BASE_URL}/gallery/upload/signed-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: 'image/jpeg',
          fileSize: resizedBlob.size,
        }),
      });

      if (!signedUrlRes.ok) {
        throw new Error('アップロードURLの取得に失敗しました');
      }

      const { data } = (await signedUrlRes.json()) as SignedUrlResponse;
      updateUpload(tempKey, { fileKey: data.fileKey, progress: 40 });

      // 3. GCSへ直接アップロード
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: resizedBlob,
      });

      if (! uploadRes.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      updateUpload(tempKey, { status: 'confirming', progress: 80 });

      // 4. アップロード完了を確認
      const confirmRes = await fetch(`${API_BASE_URL}/gallery/upload/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey: data.fileKey }),
      });

      if (!confirmRes.ok) {
        throw new Error('アップロードの確認に失敗しました');
      }

      updateUpload(tempKey, {
        status: 'completed',
        progress: 100,
        url: data. publicUrl,
      });

      return data.publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました';
      updateUpload(tempKey, { status: 'error', error: errorMessage });
      throw error;
    }
  }, [updateUpload]);

  const uploadMultiple = useCallback(async (files: File[]): Promise<string[]> => {
    const results = await Promise.allSettled(files.map(uploadFile));
    return results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map((r) => r.value);
  }, [uploadFile]);

  const clearUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    uploadFile,
    uploadMultiple,
    clearUploads,
  };
}
```

## GCS バケット設定

Cloud Storage バケットの作成と設定：

```bash
# バケット作成
gcloud storage buckets create gs://mycats-pro-gallery \
  --project=my-cats-pro \
  --location=asia-northeast1 \
  --uniform-bucket-level-access

# CORS設定
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3000", "https://mycats-pro-frontend-*. run.app"],
    "method": ["PUT", "GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gcloud storage buckets update gs://mycats-pro-gallery --cors-file=cors.json

# 公開アクセス設定（画像表示用）
gcloud storage buckets add-iam-policy-binding gs://mycats-pro-gallery \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

## 品質チェックリスト

- [ ] `pnpm lint` が通ること
- [ ] `pnpm backend:build` が成功すること
- [ ] 環境変数が `. env. example` に追加されていること
- [ ] Swagger ドキュメント (`/api/docs`) でエンドポイントが確認できること
- [ ] 10MB以上のファイルが適切にエラーになること
- [ ] 対応形式以外のファイルがエラーになること

## テスト実行

```bash
cd backend
pnpm test:e2e -- --passWithNoTests
```

## 完了条件

1. `/api/v1/gallery/upload/signed-url` でSigned URLが取得できる
2. 取得したURLに画像をPUTでアップロードできる
3. `/api/v1/gallery/upload/confirm` でアップロード確認ができる
4.  フロントエンドから画像リサイズ→アップロードの一連のフローが動作する