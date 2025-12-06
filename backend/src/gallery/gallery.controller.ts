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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import {
  CreateGalleryEntryDto,
  UpdateGalleryEntryDto,
  GalleryQueryDto,
  AddMediaDto,
  GalleryCategoryDto,
} from './dto';
import { GalleryService } from './gallery.service';

/**
 * ギャラリーコントローラー
 * ギャラリーエントリのCRUD APIを提供
 */
@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @ApiOperation({ summary: 'ギャラリーエントリ一覧取得' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: GalleryCategoryDto,
    description: 'カテゴリでフィルタリング',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'ページ番号' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '1ページあたりの件数' })
  @ApiResponse({ status: 200, description: 'ギャラリー一覧' })
  async findAll(@Query() query: GalleryQueryDto) {
    return this.galleryService.findAll(query);
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ギャラリーエントリ作成' })
  @ApiResponse({ status: 201, description: '作成成功' })
  async create(@Body() dto: CreateGalleryEntryDto) {
    return this.galleryService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ギャラリーエントリ更新' })
  @ApiParam({ name: 'id', description: 'エントリID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: 'エントリが見つかりません' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryEntryDto,
  ) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
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
  async addMedia(@Param('id') id: string, @Body() dto: AddMediaDto) {
    return this.galleryService.addMedia(id, dto);
  }

  @Delete('media/:mediaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'メディア削除' })
  @ApiParam({ name: 'mediaId', description: 'メディアID' })
  @ApiResponse({ status: 200, description: 'メディア削除成功' })
  async deleteMedia(@Param('mediaId') mediaId: string) {
    return this.galleryService.deleteMedia(mediaId);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '一括登録（子育て中タブ用）' })
  @ApiResponse({ status: 201, description: '一括登録成功' })
  async bulkCreate(@Body() entries: CreateGalleryEntryDto[]) {
    return this.galleryService.bulkCreate(entries);
  }
}
