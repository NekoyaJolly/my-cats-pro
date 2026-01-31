import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';

import { PrismaService } from '../prisma/prisma.service';

import { ImportResultDto, ImportPreviewDto } from './dto/import-response.dto';

/**
 * アップロードされたファイルの型定義
 */
interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  size: number;
}

/**
 * インポートサービス
 * 
 * CSV ファイルからデータをインポートする機能を提供します
 */
@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ファイルのプレビューを取得
   * 
   * @param file アップロードされたファイル
   * @returns プレビュー情報
   */
  async previewFile(file: UploadedFile): Promise<ImportPreviewDto> {
    try {
      const content = file.buffer.toString('utf-8');
      const parsed = Papa.parse(content, { 
        header: true, 
        skipEmptyLines: true 
      });

      if (parsed.errors.length > 0) {
        this.logger.warn(`CSV解析エラー: ${JSON.stringify(parsed.errors)}`);
        throw new BadRequestException('CSVファイルの解析に失敗しました');
      }

      const data = parsed.data as Record<string, unknown>[];

      return {
        previewCount: Math.min(data.length, 5),
        sampleData: data.slice(0, 5),
        columns: parsed.meta.fields || [],
        totalCount: data.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      this.logger.error(`プレビュー取得エラー: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 猫データをインポート
   * 
   * @param file アップロードされたCSVファイル
   * @param _userId インポートを実行するユーザーID
   * @returns インポート結果
   */
  async importCats(file: UploadedFile, _userId: string): Promise<ImportResultDto> {
    try {
      const content = file.buffer.toString('utf-8');
      const parsed = Papa.parse(content, { 
        header: true, 
        skipEmptyLines: true 
      });

      if (parsed.errors.length > 0) {
        throw new BadRequestException('CSVファイルの解析に失敗しました');
      }

      const data = parsed.data as Record<string, unknown>[];
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          // 必須フィールドのチェック
          if (!row.name || !row.gender || !row.birthDate) {
            throw new Error('必須フィールド（name, gender, birthDate）が不足しています');
          }

          // Breed の検索
          let breedId: string | null = null;
          if (row.breed && typeof row.breed === 'string') {
            const breed = await this.prisma.breed.findFirst({
              where: { name: row.breed },
            });
            breedId = breed?.id || null;
          }

          // CoatColor の検索
          let colorId: string | null = null;
          if (row.color && typeof row.color === 'string') {
            const color = await this.prisma.coatColor.findFirst({
              where: { name: row.color },
            });
            colorId = color?.id || null;
          }

          // 日付をパース
          const birthDate = new Date(String(row.birthDate));
          if (isNaN(birthDate.getTime())) {
            throw new Error('birthDate が無効な形式です');
          }

          await this.prisma.cat.create({
            data: {
              name: String(row.name),
              registrationNumber: row.registrationNumber 
                ? String(row.registrationNumber)
                : `AUTO-${Date.now()}-${i}`,
              gender: String(row.gender),
              birthDate,
              breedId,
              coatColorId: colorId,
              microchipNumber: row.microchipNumber 
                ? String(row.microchipNumber)
                : null,
            },
          });

          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : '不明なエラー';
          errors.push(`行${i + 2}: ${errorMessage}`);
        }
      }

      this.logger.log(`猫データインポート完了: 成功=${successCount}, 失敗=${errorCount}, 総件数=${data.length}`);

      return {
        successCount,
        errorCount,
        totalCount: data.length,
        errors: errors.slice(0, 10),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      this.logger.error(`猫データインポートエラー: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 血統書データをインポート
   * 
   * @param file アップロードされたCSVファイル
   * @returns インポート結果
   */
  async importPedigrees(file: UploadedFile): Promise<ImportResultDto> {
    try {
      const content = file.buffer.toString('utf-8');
      const parsed = Papa.parse(content, { 
        header: true, 
        skipEmptyLines: true 
      });

      if (parsed.errors.length > 0) {
        throw new BadRequestException('CSVファイルの解析に失敗しました');
      }

      const data = parsed.data as Record<string, unknown>[];
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          if (!row.pedigreeId || !row.catName) {
            throw new Error('必須フィールド（pedigreeId, catName）が不足しています');
          }

          // 重複チェック
          const existing = await this.prisma.pedigree.findUnique({
            where: { pedigreeId: String(row.pedigreeId) },
          });

          if (existing) {
            throw new Error('この血統書IDは既に存在します');
          }

          await this.prisma.pedigree.create({
            data: {
              pedigreeId: String(row.pedigreeId),
              catName: String(row.catName),
              title: row.title ? String(row.title) : null,
              breedCode: row.breedCode ? parseInt(String(row.breedCode), 10) : null,
              genderCode: row.genderCode ? parseInt(String(row.genderCode), 10) : null,
              coatColorCode: row.coatColorCode ? parseInt(String(row.coatColorCode), 10) : null,
            },
          });

          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : '不明なエラー';
          errors.push(`行${i + 2}: ${errorMessage}`);
        }
      }

      this.logger.log(`血統書データインポート完了: 成功=${successCount}, 失敗=${errorCount}, 総件数=${data.length}`);

      return {
        successCount,
        errorCount,
        totalCount: data.length,
        errors: errors.slice(0, 10),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      this.logger.error(`血統書データインポートエラー: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * タグデータをインポート
   * 
   * @param file アップロードされたCSVファイル
   * @returns インポート結果
   */
  async importTags(file: UploadedFile): Promise<ImportResultDto> {
    try {
      const content = file.buffer.toString('utf-8');
      const parsed = Papa.parse(content, { 
        header: true, 
        skipEmptyLines: true 
      });

      if (parsed.errors.length > 0) {
        throw new BadRequestException('CSVファイルの解析に失敗しました');
      }

      const data = parsed.data as Record<string, unknown>[];
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          if (!row.name) {
            throw new Error('必須フィールド（name）が不足しています');
          }

          // カテゴリの取得または作成
          const categoryName = row.category ? String(row.category) : 'その他';
          let category = await this.prisma.tagCategory.findFirst({
            where: { name: categoryName },
          });

          if (!category) {
            category = await this.prisma.tagCategory.create({
              data: {
                name: categoryName,
                key: categoryName.toLowerCase().replace(/\s+/g, '_'),
              },
            });
          }

          // グループの取得または作成
          const groupName = row.group ? String(row.group) : 'デフォルト';
          let group = await this.prisma.tagGroup.findFirst({
            where: {
              name: groupName,
              categoryId: category.id,
            },
          });

          if (!group) {
            group = await this.prisma.tagGroup.create({
              data: {
                name: groupName,
                categoryId: category.id,
              },
            });
          }

          // タグの作成（重複チェック）
          const existingTag = await this.prisma.tag.findFirst({
            where: {
              name: String(row.name),
              groupId: group.id,
            },
          });

          if (!existingTag) {
            await this.prisma.tag.create({
              data: {
                name: String(row.name),
                color: row.color ? String(row.color) : '#808080',
                groupId: group.id,
                isActive: row.isActive === 'false' ? false : true,
              },
            });
            successCount++;
          } else {
            errors.push(`行${i + 2}: タグ "${row.name}" は既に存在します（スキップ）`);
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : '不明なエラー';
          errors.push(`行${i + 2}: ${errorMessage}`);
        }
      }

      this.logger.log(`タグデータインポート完了: 成功=${successCount}, 失敗=${errorCount}, 総件数=${data.length}`);

      return {
        successCount,
        errorCount,
        totalCount: data.length,
        errors: errors.slice(0, 10),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      this.logger.error(`タグデータインポートエラー: ${errorMessage}`);
      throw error;
    }
  }
}
