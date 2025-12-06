import { Storage } from '@google-cloud/storage';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { SignedUrlResult, UploadResult } from './interfaces/upload-result.interface';

/**
 * ギャラリー画像アップロードサービス
 * Google Cloud Storage を使用した Signed URL 方式でのアップロードを提供
 */
@Injectable()
export class GalleryUploadService {
  private readonly logger = new Logger(GalleryUploadService.name);
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('GCS_PROJECT_ID', 'my-cats-pro-staging');
    
    this.storage = new Storage({
      projectId,
    });
    
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME', 'mycats-pro-gallery-staging');
    
    this.logger.log(`GalleryUploadService initialized: bucket=${this.bucketName}, project=${projectId}`);
  }

  /**
   * コンテンツタイプからファイル拡張子を取得
   */
  private getExtension(contentType: string): string {
    const extensionMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return extensionMap[contentType] ?? '.jpg';
  }

  /**
   * Signed URL を生成してクライアントに返す
   * クライアントはこの URL を使って直接 GCS へアップロードする
   */
  async generateUploadUrl(dto: GenerateUploadUrlDto): Promise<SignedUrlResult> {
    const fileExtension = this.getExtension(dto.contentType);
    const fileKey = `gallery/${uuidv4()}${fileExtension}`;

    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileKey);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15分有効
        contentType: dto.contentType,
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;

      this.logger.log(`Signed URL generated: fileKey=${fileKey}, fileName=${dto.fileName}`);

      return {
        uploadUrl: signedUrl,
        fileKey,
        publicUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      this.logger.error(`Signed URL 生成に失敗しました: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new BadRequestException('アップロードURLの生成に失敗しました');
    }
  }

  /**
   * アップロード完了を確認し、ファイルの存在をチェック
   */
  async confirmUpload(fileKey: string): Promise<UploadResult> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileKey);

      const [exists] = await file.exists();
      if (!exists) {
        throw new BadRequestException('ファイルが見つかりません。アップロードが完了していない可能性があります');
      }

      const [metadata] = await file.getMetadata();

      this.logger.log(`Upload confirmed: fileKey=${fileKey}, size=${metadata.size}`);

      return {
        success: true,
        url: `https://storage.googleapis.com/${this.bucketName}/${fileKey}`,
        size: Number(metadata.size),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      this.logger.error(`アップロード確認に失敗しました: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
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
      
      const [exists] = await file.exists();
      if (!exists) {
        this.logger.warn(`削除対象のファイルが存在しません: ${fileKey}`);
        return;
      }
      
      await file.delete();
      this.logger.log(`ファイルを削除しました: ${fileKey}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      this.logger.error(`ファイル削除に失敗しました: ${fileKey}, error=${errorMessage}`);
      // 削除失敗は致命的ではないのでエラーを投げない
    }
  }
}
