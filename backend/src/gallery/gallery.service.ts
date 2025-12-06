import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { GalleryCategory, MediaType, Prisma } from '@prisma/client';

import { GalleryUploadService } from '../gallery-upload/gallery-upload.service';
import { PrismaService } from '../prisma/prisma.service';

import {
  CreateGalleryEntryDto,
  UpdateGalleryEntryDto,
  GalleryQueryDto,
  AddMediaDto,
  GalleryCategoryDto,
  MediaTypeDto,
} from './dto';

/**
 * ギャラリーサービス
 * ギャラリーエントリのCRUD操作とメディア管理を提供
 */
@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

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

    const where: Prisma.GalleryEntryWhereInput = category
      ? { category: category as GalleryCategory }
      : {};

    const [entries, total] = await Promise.all([
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
    const { media, catId, transferDate, ...entryData } = dto;

    // 在舎猫からスナップショットを取得
    let catSnapshot: Prisma.InputJsonValue | undefined = undefined;
    if (catId) {
      const cat = await this.prisma.cat.findUnique({
        where: { id: catId },
        include: {
          breed: true,
          coatColor: true,
          tags: { include: { tag: true } },
        },
      });
      if (cat) {
        // Prisma InputJsonValue として安全に変換
        catSnapshot = JSON.parse(JSON.stringify(cat)) as Prisma.InputJsonValue;
      }
    }

    const entry = await this.prisma.galleryEntry.create({
      data: {
        ...entryData,
        category: this.mapCategoryDtoToPrisma(dto.category),
        catId,
        transferDate: transferDate ? new Date(transferDate) : null,
        transferredBy: userId,
        catSnapshot,
        media: media
          ? {
              create: media.map((m, index) => ({
                type: this.mapMediaTypeDtoToPrisma(m.type),
                url: m.url,
                thumbnailUrl: m.thumbnailUrl,
                order: m.order ?? index,
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
  async update(id: string, dto: UpdateGalleryEntryDto) {
    const existing = await this.prisma.galleryEntry.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`ギャラリーエントリ（ID: ${id}）が見つかりません`);
    }

    const { media: _media, transferDate, category, ...updateData } = dto;

    const entry = await this.prisma.galleryEntry.update({
      where: { id },
      data: {
        ...updateData,
        category: category ? this.mapCategoryDtoToPrisma(category) : undefined,
        transferDate: transferDate ? new Date(transferDate) : undefined,
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    });

    this.logger.log(`ギャラリーエントリ更新: ${entry.id}`);

    return {
      success: true,
      data: entry,
    };
  }

  /**
   * ギャラリーエントリ削除
   */
  async delete(id: string) {
    const entry = await this.prisma.galleryEntry.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!entry) {
      throw new NotFoundException(`ギャラリーエントリ（ID: ${id}）が見つかりません`);
    }

    // 関連画像をCloud Storageから削除
    for (const m of entry.media) {
      if (m.type === 'IMAGE' && m.url.includes('storage.googleapis.com')) {
        const fileKey = this.extractFileKey(m.url);
        if (fileKey) {
          await this.uploadService.deleteFile(fileKey);
        }
      }
    }

    await this.prisma.galleryEntry.delete({ where: { id } });

    this.logger.log(`ギャラリーエントリ削除: ${id}`);

    return {
      success: true,
      message: 'ギャラリーエントリを削除しました',
    };
  }

  /**
   * メディア追加
   */
  async addMedia(
    entryId: string,
    mediaData: AddMediaDto,
  ) {
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
        type: this.mapMediaTypeDtoToPrisma(mediaData.type),
        url: mediaData.url,
        thumbnailUrl: mediaData.thumbnailUrl,
        order: maxOrder + 1,
      },
    });

    this.logger.log(`メディア追加: entryId=${entryId}, mediaId=${media.id}`);

    return {
      success: true,
      data: media,
    };
  }

  /**
   * メディア削除
   */
  async deleteMedia(mediaId: string) {
    const media = await this.prisma.galleryMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundException(`メディア（ID: ${mediaId}）が見つかりません`);
    }

    // 画像の場合はCloud Storageからも削除
    if (media.type === 'IMAGE' && media.url.includes('storage.googleapis.com')) {
      const fileKey = this.extractFileKey(media.url);
      if (fileKey) {
        await this.uploadService.deleteFile(fileKey);
      }
    }

    await this.prisma.galleryMedia.delete({ where: { id: mediaId } });

    this.logger.log(`メディア削除: ${mediaId}`);

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
      results.push(result.data);
    }

    this.logger.log(`一括登録完了: ${results.length}件`);

    return {
      success: true,
      data: results,
      meta: {
        created: results.length,
      },
    };
  }

  /**
   * URL からファイルキーを抽出
   */
  private extractFileKey(url: string): string | null {
    const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/);
    return match ? match[1] : null;
  }

  /**
   * カテゴリ DTO を Prisma enum にマッピング
   */
  private mapCategoryDtoToPrisma(category: GalleryCategoryDto): GalleryCategory {
    const mapping: Record<GalleryCategoryDto, GalleryCategory> = {
      [GalleryCategoryDto.KITTEN]: GalleryCategory.KITTEN,
      [GalleryCategoryDto.FATHER]: GalleryCategory.FATHER,
      [GalleryCategoryDto.MOTHER]: GalleryCategory.MOTHER,
      [GalleryCategoryDto.GRADUATION]: GalleryCategory.GRADUATION,
    };
    return mapping[category];
  }

  /**
   * メディアタイプ DTO を Prisma enum にマッピング
   */
  private mapMediaTypeDtoToPrisma(type: MediaTypeDto): MediaType {
    const mapping: Record<MediaTypeDto, MediaType> = {
      [MediaTypeDto.IMAGE]: MediaType.IMAGE,
      [MediaTypeDto.YOUTUBE]: MediaType.YOUTUBE,
    };
    return mapping[type];
  }
}
