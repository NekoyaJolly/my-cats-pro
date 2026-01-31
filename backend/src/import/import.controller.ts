import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiConsumes, 
  ApiBody 
} from '@nestjs/swagger';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ImportResultDto, ImportPreviewDto } from './dto/import-response.dto';
import { ImportService } from './import.service';

/**
 * アップロードされたファイルの型定義
 */
interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  size: number;
}

/**
 * インポートコントローラ
 * 
 * CSV ファイルからデータをインポートするエンドポイントを提供します
 */
@ApiTags('Import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  /**
   * インポートファイルのプレビュー取得
   * 
   * ファイルをアップロードして、データの内容をプレビューします
   */
  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'インポートファイルのプレビュー' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSVファイル',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'プレビュー取得成功',
    type: ImportPreviewDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'ファイルが不正な形式' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '認証が必要' 
  })
  async preview(@UploadedFile() file: UploadedFile) {
    if (!file) {
      throw new BadRequestException('ファイルがアップロードされていません');
    }

    const result = await this.importService.previewFile(file);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 猫データをインポート
   * 
   * CSV ファイルから猫データを一括登録します
   */
  @Post('cats')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '猫データのインポート' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSVファイル（カラム: name, gender, birthDate, breed, color, registrationNumber, microchipNumber, notes）',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'インポート完了',
    type: ImportResultDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'ファイルが不正な形式' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '認証が必要' 
  })
  async importCats(
    @UploadedFile() file: UploadedFile,
    @GetUser() user: RequestUser | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('ファイルがアップロードされていません');
    }

    if (!user) {
      throw new BadRequestException('ユーザー情報が取得できません');
    }

    const result = await this.importService.importCats(file, user.userId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 血統書データをインポート
   * 
   * CSV ファイルから血統書データを一括登録します
   */
  @Post('pedigrees')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '血統書データのインポート' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSVファイル（カラム: pedigreeId, catName, title, breedCode, genderCode, coatColorCode）',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'インポート完了',
    type: ImportResultDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'ファイルが不正な形式' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '認証が必要' 
  })
  async importPedigrees(@UploadedFile() file: UploadedFile) {
    if (!file) {
      throw new BadRequestException('ファイルがアップロードされていません');
    }

    const result = await this.importService.importPedigrees(file);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * タグデータをインポート
   * 
   * CSV ファイルからタグデータを一括登録します
   */
  @Post('tags')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'タグデータのインポート' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSVファイル（カラム: name, category, group, color, isActive）',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'インポート完了',
    type: ImportResultDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'ファイルが不正な形式' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '認証が必要' 
  })
  async importTags(@UploadedFile() file: UploadedFile) {
    if (!file) {
      throw new BadRequestException('ファイルがアップロードされていません');
    }

    const result = await this.importService.importTags(file);
    return {
      success: true,
      data: result,
    };
  }
}
