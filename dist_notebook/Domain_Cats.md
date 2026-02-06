This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: backend/prisma/schema.prisma, backend/src/cats/**, backend/src/breeds/**, backend/src/coat-colors/**, backend/src/gallery/**, backend/src/gallery-upload/**, frontend/src/app/cats/**, frontend/src/app/gallery/**, frontend/src/components/cats/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
backend/
  prisma/
    schema.prisma
  src/
    breeds/
      dto/
        breed-query.dto.ts
        create-breed.dto.ts
        index.ts
        update-breed.dto.ts
      breed-master.data.ts
      breeds.controller.spec.ts
      breeds.controller.ts
      breeds.module.ts
      breeds.service.spec.ts
      breeds.service.ts
    cats/
      constants/
        gender.spec.ts
        gender.ts
      dto/
        cat-family.dto.ts
        cat-query.dto.ts
        cat-statistics.dto.ts
        create-cat.dto.ts
        index.ts
        kitten-query.dto.ts
        update-cat.dto.ts
        weight-record.dto.ts
      types/
        cat.types.ts
      cats.controller.spec.ts
      cats.controller.ts
      cats.module.ts
      cats.service.spec.ts
      cats.service.ts
    coat-colors/
      dto/
        coat-color-query.dto.ts
        create-coat-color.dto.ts
        index.ts
        update-coat-color.dto.ts
      coat-color-master.data.ts
      coat-colors.controller.spec.ts
      coat-colors.controller.ts
      coat-colors.module.ts
      coat-colors.service.spec.ts
      coat-colors.service.ts
    gallery/
      dto/
        add-media.dto.ts
        create-gallery-entry.dto.ts
        gallery-query.dto.ts
        index.ts
        update-gallery-entry.dto.ts
      gallery.controller.ts
      gallery.module.ts
      gallery.service.ts
    gallery-upload/
      dto/
        confirm-upload.dto.ts
        generate-upload-url.dto.ts
        index.ts
      interfaces/
        upload-result.interface.ts
      gallery-upload.controller.ts
      gallery-upload.module.ts
      gallery-upload.service.ts
frontend/
  src/
    app/
      cats/
        [id]/
          edit/
            client.tsx
            page.tsx
          pedigree/
            client.tsx
            page.tsx
          client.tsx
          layout.tsx
          page.tsx
        new/
          page.tsx
        page.tsx
      gallery/
        components/
          GalleryAddModal.tsx
          GalleryCatCard.tsx
          GalleryGrid.tsx
          GalleryTabs.tsx
          ImageUploader.tsx
          MediaCarousel.tsx
          MediaLightbox.tsx
          YouTubeInput.tsx
        hooks/
          useGalleryTab.ts
        page.tsx
    components/
      cats/
        cat-edit-modal.tsx
        cat-quick-edit-modal.tsx
        PedigreeTab.tsx
```

# Files

## File: backend/src/breeds/dto/breed-query.dto.ts
````typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsInt, IsIn, Min, Max } from "class-validator";

export class BreedQueryDto {
  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 50, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ description: "検索キーワード" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "ソート項目", default: "name" })
  @IsOptional()
  @IsString()
  @IsIn(["name", "nameEn", "createdAt", "updatedAt", "code"])
  sortBy?: string = "name";

  @ApiPropertyOptional({ description: "ソート順", default: "asc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";
}
````

## File: backend/src/breeds/dto/create-breed.dto.ts
````typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsOptional, MaxLength, IsInt, Min, Max } from "class-validator";

export class CreateBreedDto {
  @ApiProperty({ description: "品種コード" })
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  code: number;

  @ApiProperty({ description: "品種名" })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: "品種の説明" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
````

## File: backend/src/breeds/dto/index.ts
````typescript
export * from "./create-breed.dto";
export * from "./update-breed.dto";
export * from "./breed-query.dto";
````

## File: backend/src/breeds/dto/update-breed.dto.ts
````typescript
import { PartialType } from "@nestjs/mapped-types";

import { CreateBreedDto } from "./create-breed.dto";

export class UpdateBreedDto extends PartialType(CreateBreedDto) {}
````

## File: backend/src/breeds/breed-master.data.ts
````typescript
/**
 * Pedigreesテーブルのbreedリレーションで利用する品種マスターデータ。
 * 元データ: 猫種データUTF8Ver.csv（ヘッダー: キー, 種類名称）
 * 本ファイルではヘッダーを code / name にリネームし、全レコード (0-112) を保持する。
 */

export interface BreedMasterRecord {
  code: number;
  name: string;
}

export const BREED_MASTER_DATA: ReadonlyArray<BreedMasterRecord> = [
  { code: 0, name: "" },
  { code: 1, name: "Abyssinian" },
  { code: 2, name: "American Curl(LH)" },
  { code: 3, name: "American Curl(SH)" },
  { code: 4, name: "American Curl(LH.SE)" },
  { code: 5, name: "American Curl(SH.SE)" },
  { code: 6, name: "American Shorthair" },
  { code: 7, name: "American Wirehair" },
  { code: 8, name: "Balinese" },
  { code: 9, name: "Bengal" },
  { code: 10, name: "Birman" },
  { code: 11, name: "Bombay" },
  { code: 12, name: "British Shorthair" },
  { code: 13, name: "Burmese" },
  { code: 14, name: "Chartreux" },
  { code: 15, name: "Colorpoint Shorthair" },
  { code: 16, name: "Cornish Rex" },
  { code: 17, name: "Cymic" },
  { code: 18, name: "Devon Rex" },
  { code: 19, name: "Egyptian Mau" },
  { code: 20, name: "Exotic" },
  { code: 21, name: "Havana Brown" },
  { code: 22, name: "House Hold Pet" },
  { code: 23, name: "Japanese Bobtail" },
  { code: 24, name: "Javanese" },
  { code: 25, name: "Korat" },
  { code: 26, name: "Maine Coon" },
  { code: 27, name: "Manx" },
  { code: 28, name: "Munchkin (SH)" },
  { code: 29, name: "Norwegian Forest Cat" },
  { code: 30, name: "Ocicat" },
  { code: 31, name: "Oriental Longhair" },
  { code: 32, name: "Oriental Shorthair" },
  { code: 33, name: "Persian" },
  { code: 34, name: "Persian (HIMALAYAN)" },
  { code: 35, name: "Persian (C.P.C)" },
  { code: 36, name: "Ragdoll" },
  { code: 37, name: "Russian Blue" },
  { code: 38, name: "Scottish Fold (LH)" },
  { code: 39, name: "Scottish Fold (SH)" },
  { code: 40, name: "Scottish Fold(LH.SE)" },
  { code: 41, name: "Scottish Fold(SH.SE)" },
  { code: 42, name: "Snowshoe" },
  { code: 43, name: "Siamese" },
  { code: 44, name: "Selkirk Rex (SH)" },
  { code: 45, name: "Singapura" },
  { code: 46, name: "Somali" },
  { code: 47, name: "Sphynx" },
  { code: 48, name: "Tonkinese" },
  { code: 49, name: "Turkish Angora" },
  { code: 50, name: "Turkish Van" },
  { code: 51, name: "Wild Cat" },
  { code: 52, name: "Sugar Fold" },
  { code: 53, name: "Domestic Cat" },
  { code: 54, name: "European Burmese" },
  { code: 55, name: "Russian Blue (AOC)" },
  { code: 56, name: "Munchkin (SH.NL)" },
  { code: 57, name: "Munchkin (LH)" },
  { code: 58, name: "Exotic Longhair" },
  { code: 59, name: "Ragamuffin" },
  { code: 60, name: "American Curl" },
  { code: 61, name: "Scottish Fold" },
  { code: 62, name: "La Perm (LH)" },
  { code: 63, name: "La Perm (SH)" },
  { code: 64, name: "La Perm (LH.ST)" },
  { code: 65, name: "La Perm (SH.ST)" },
  { code: 66, name: "Munchkin (LH.NL)" },
  { code: 67, name: "Siberian" },
  { code: 68, name: "British Longhair" },
  { code: 69, name: "Domestic Cat (LH)" },
  { code: 70, name: "White (Albino)" },
  { code: 71, name: "Balinese-(Javanese)" },
  { code: 72, name: "Thai" },
  { code: 73, name: "Skookum" },
  { code: 74, name: "Selkirk Rex (LH)" },
  { code: 75, name: "Selkirk Rex (SH.ST)" },
  { code: 76, name: "Selkirk Rex (LH.ST)" },
  { code: 77, name: "American Curl (SWH)" },
  { code: 78, name: "American Curl (LWH)" },
  { code: 79, name: "Canadian Lop (SH)" },
  { code: 80, name: "Canadian Lop (LH)" },
  { code: 81, name: "Canadian Lop (SH.SE)" },
  { code: 82, name: "Canadian Lop (LH.SE)" },
  { code: 83, name: "Lamkin (SH)" },
  { code: 84, name: "Lamkin (LH)" },
  { code: 85, name: "Lamkin (SH.ST)" },
  { code: 86, name: "Lamkin (LH.ST)" },
  { code: 87, name: "Lamkin (SH.NL)" },
  { code: 88, name: "Lamkin (LH.NL)" },
  { code: 89, name: "Lamkin (SH.ST.NL)" },
  { code: 90, name: "Lamkin (LH.ST.NL)" },
  { code: 91, name: "Minuet(SH)" },
  { code: 92, name: "Minuet(LH)" },
  { code: 93, name: "Minuet(SH.NL)" },
  { code: 94, name: "Minuet(LH.NL)" },
  { code: 95, name: "Skookum (SH)" },
  { code: 96, name: "Skookum (LH)" },
  { code: 97, name: "Skookum (SH.NL)" },
  { code: 98, name: "Skookum (LH.NL)" },
  { code: 99, name: "Skookum (SH.ST)" },
  { code: 100, name: "Skookum (LH.ST)" },
  { code: 101, name: "Kinkaro (SH)" },
  { code: 102, name: "Kinkaro (LH)" },
  { code: 103, name: "Kinkaro (SH.SE)" },
  { code: 104, name: "Kinkaro (LH.SE)" },
  { code: 105, name: "Kinkaro (SH.NL)" },
  { code: 106, name: "Kinkaro (LH.NL)" },
  { code: 107, name: "Kinkaro (SH.SE.NL)" },
  { code: 108, name: "Kinkaro (LH.SE.NL)" },
  { code: 109, name: "ｱｷ" },
  { code: 110, name: "Bengal(A.O.C)" },
  { code: 111, name: "Jenetta" },
  { code: 112, name: "Toyger" },
];

const BREED_MASTER_MAP_ENTRIES = BREED_MASTER_DATA.map((record) => [record.code, record] as const);

export const BREED_MASTER_MAP: ReadonlyMap<number, BreedMasterRecord> = new Map(
  BREED_MASTER_MAP_ENTRIES,
);

export const findBreedByCode = (code: number): BreedMasterRecord | undefined =>
  BREED_MASTER_MAP.get(code);
````

## File: backend/src/breeds/breeds.controller.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';

import { DisplayPreferencesService } from '../display-preferences/display-preferences.service';
import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { BreedsController } from './breeds.controller';
import { BreedsService } from './breeds.service';

describe('BreedsController', () => {
  let controller: BreedsController;
  let service: BreedsService;

  const mockBreedsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getMasterData: jest.fn(),
  };
  const mockDisplayPreferencesService = {
    getPreferences: jest.fn(),
    buildPersonalizedBreedRecords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [BreedsController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: BreedsService,
          useValue: mockBreedsService,
        },
        {
          provide: DisplayPreferencesService,
          useValue: mockDisplayPreferencesService,
        },
      ],
    }).compile();

    controller = module.get<BreedsController>(BreedsController);
    service = module.get<BreedsService>(BreedsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a breed', async () => {
      const createDto = { code: 1, name: 'Persian', description: 'Long-haired' };
      const mockBreed = { id: '1', ...createDto };

      mockBreedsService.create.mockResolvedValue(mockBreed);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockBreed);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated breeds', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Persian' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockBreedsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a breed by id', async () => {
      const mockBreed = { id: '1', name: 'Persian' };

      mockBreedsService.findOne.mockResolvedValue(mockBreed);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockBreed);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a breed', async () => {
      const updateDto = { name: 'Updated Persian' };
      const mockBreed = { id: '1', name: 'Updated Persian' };

      mockBreedsService.update.mockResolvedValue(mockBreed);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockBreed);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a breed', async () => {
      mockBreedsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getMasterData', () => {
    it('should return master data via service', async () => {
      const mockMaster = [{ code: 1, name: 'Abyssinian' }];
      mockBreedsService.getMasterData.mockResolvedValue(mockMaster);

      const result = await controller.getMasterData(undefined);

      expect(result).toEqual(mockMaster);
      expect(service.getMasterData).toHaveBeenCalled();
    });
  });
});
````

## File: backend/src/breeds/breeds.controller.ts
````typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiExtraModels,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../auth/roles.decorator";
import { DisplayPreferencesService } from "../display-preferences/display-preferences.service";
import { MasterDataItemDto } from "../display-preferences/dto/master-data-item.dto";

import { BreedsService } from "./breeds.service";
import { CreateBreedDto, UpdateBreedDto, BreedQueryDto } from "./dto";


@ApiExtraModels(MasterDataItemDto)
@ApiTags("Breeds")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("breeds")
export class BreedsController {
  constructor(
    private readonly breedsService: BreedsService,
    private readonly displayPreferences: DisplayPreferencesService,
  ) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "品種データを作成（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "品種データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedsService.create(createBreedDto);
  }

  @Get()
  @ApiOperation({ summary: "品種データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "品種データの一覧" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 50,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード" })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "name",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "asc",
  })
  findAll(@Query() query: BreedQueryDto) {
    return this.breedsService.findAll(query);
  }

  @Get("master-data")
  @ApiOperation({ summary: "Pedigree連携用の品種マスターデータを取得" })
  @ApiOkResponse({
    description: "CSV マスターデータを displayName / displayNameMode 付きで返却",
    type: MasterDataItemDto,
    isArray: true,
  })
  async getMasterData(@GetUser() user: RequestUser | undefined) {
    if (!user) {
      return this.breedsService.getMasterData();
    }

    const preference = await this.displayPreferences.getPreferences(user.userId);
    const personalized =
      await this.displayPreferences.buildPersonalizedBreedRecords(preference);

    return personalized.map((record) => ({
      code: record.code,
      name: record.canonicalName,
      displayName: record.displayName,
      displayNameMode: preference.breedNameMode,
      isOverridden: record.isOverridden,
    }));
  }

  @Get("statistics")
  @ApiOperation({ summary: "品種データの統計情報を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "統計情報" })
  getStatistics() {
    return this.breedsService.getStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで品種データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "品種データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "品種データが見つかりません",
  })
  @ApiParam({ name: "id", description: "品種データのID" })
  findOne(@Param("id") id: string) {
    return this.breedsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "品種データを更新（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "品種データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "品種データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "品種データのID" })
  update(@Param("id") id: string, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedsService.update(id, updateBreedDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "品種データを削除（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "品種データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "品種データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "品種データのID" })
  remove(@Param("id") id: string) {
    return this.breedsService.remove(id);
  }
}
````

## File: backend/src/breeds/breeds.module.ts
````typescript
import { Module } from "@nestjs/common";

import { DisplayPreferencesModule } from "../display-preferences/display-preferences.module";
import { PrismaModule } from "../prisma/prisma.module";

import { BreedsController } from "./breeds.controller";
import { BreedsService } from "./breeds.service";

@Module({
  imports: [PrismaModule, DisplayPreferencesModule],
  controllers: [BreedsController],
  providers: [BreedsService],
  exports: [BreedsService],
})
export class BreedsModule {}
````

## File: backend/src/breeds/breeds.service.spec.ts
````typescript
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { BreedsService } from './breeds.service';


describe('BreedsService', () => {
  let service: BreedsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    breed: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cat: {
      count: jest.fn(),
    },
    pedigree: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BreedsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BreedsService>(BreedsService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a breed successfully', async () => {
      const createDto = {
        code: 1,
        name: 'Persian',
        description: 'Long-haired cat',
      };

      const mockBreed = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.breed.create.mockResolvedValue(mockBreed);

      const result = await service.create(createDto);

      expect(result).toEqual(mockBreed);
      expect(mockPrismaService.breed.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated breeds', async () => {
      const mockBreeds = [
        { id: '1', name: 'Persian' },
        { id: '2', name: 'Siamese' },
      ];

      mockPrismaService.breed.findMany.mockResolvedValue(mockBreeds);
      mockPrismaService.breed.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockBreeds);
      expect(result.meta.total).toBe(2);
      expect(mockPrismaService.breed.findMany).toHaveBeenCalled();
      expect(mockPrismaService.breed.count).toHaveBeenCalled();
    });

    it('should filter breeds by search term', async () => {
      const mockBreeds = [{ id: '1', name: 'Persian' }];

      mockPrismaService.breed.findMany.mockResolvedValue(mockBreeds);
      mockPrismaService.breed.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'Persian' });

      expect(result.data).toEqual(mockBreeds);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a breed by id', async () => {
      const mockBreed = { id: '1', name: 'Persian', cats: [] };

      mockPrismaService.breed.findUnique.mockResolvedValue(mockBreed);

      const result = await service.findOne('1');

      expect(result).toEqual(mockBreed);
    });

    it('should throw NotFoundException when breed not found', async () => {
      mockPrismaService.breed.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a breed successfully', async () => {
      const updateDto = { name: 'Updated Persian' };
      const mockBreed = { id: '1', name: 'Updated Persian' };

      mockPrismaService.breed.findUnique.mockResolvedValue({ id: '1', name: 'Persian' });
      mockPrismaService.breed.update.mockResolvedValue(mockBreed);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockBreed);
      expect(mockPrismaService.breed.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when updating non-existent breed', async () => {
      mockPrismaService.breed.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a breed successfully', async () => {
      const mockBreed = { id: '1', name: 'Persian' };

      mockPrismaService.breed.findUnique.mockResolvedValue(mockBreed);
      mockPrismaService.cat.count.mockResolvedValue(0);
      mockPrismaService.pedigree.count.mockResolvedValue(0);
      mockPrismaService.breed.delete.mockResolvedValue(mockBreed);

      await service.remove('1');

      expect(mockPrismaService.breed.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent breed', async () => {
      mockPrismaService.breed.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMasterData', () => {
    it('should return breed master data from prisma', async () => {
      const mockMaster = [
        { code: 1, name: 'Abyssinian' },
        { code: 2, name: 'American Curl(LH)' },
      ];

      mockPrismaService.breed.findMany.mockResolvedValue(mockMaster);

      const result = await service.getMasterData();

      expect(mockPrismaService.breed.findMany).toHaveBeenCalledWith({
        select: { code: true, name: true },
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });
      expect(result).toEqual(mockMaster);
    });
  });
});
````

## File: backend/src/breeds/breeds.service.ts
````typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateBreedDto, UpdateBreedDto, BreedQueryDto } from "./dto";

export type BreedMasterRecord = {
  code: number;
  name: string;
};

@Injectable()
export class BreedsService {
  constructor(private prisma: PrismaService) {}

  async create(createBreedDto: CreateBreedDto) {
    return this.prisma.breed.create({
      data: createBreedDto,
    });
  }

  async findAll(query: BreedQueryDto) {
    const {
      page = 1,
      limit = 50,
      search,
      sortBy = "name",
      sortOrder = "asc",
    } = query;

  const skip = (page - 1) * limit;
  const where: Prisma.BreedWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    type Sortable = "name" | "createdAt" | "updatedAt" | "code";
    const sortMap: Record<string, Sortable> = {
      name: "name",
      nameEn: "name", // フィールドがないため name へフォールバック
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      code: "code",
    };
    const sortKey = sortMap[sortBy] ?? "name";

    const [breeds, total] = await Promise.all([
      this.prisma.breed.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              cats: true,
            },
          },
        },
        orderBy: { [sortKey]: sortOrder } as Prisma.BreedOrderByWithRelationInput,
      }),
      this.prisma.breed.count({ where }),
    ]);

    return {
      data: breeds,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const breed = await this.prisma.breed.findUnique({
      where: { id },
      include: {
        cats: {
          include: {
            coatColor: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            cats: true,
          },
        },
      },
    });

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return breed;
  }

  async update(id: string, updateBreedDto: UpdateBreedDto) {
    const existingBreed = await this.prisma.breed.findUnique({
      where: { id },
    });

    if (!existingBreed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return this.prisma.breed.update({
      where: { id },
      data: updateBreedDto,
    });
  }

  async remove(id: string) {
    const existingBreed = await this.prisma.breed.findUnique({
      where: { id },
    });

    if (!existingBreed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    // Check if breed is being used
    const [catCount, pedigreeCount] = await Promise.all([
      this.prisma.cat.count({ where: { breedId: id } }),
      this.prisma.pedigree.count({ where: { breedCode: parseInt(id) } }),
    ]);

    if (catCount > 0 || pedigreeCount > 0) {
      throw new NotFoundException(
        `Cannot delete breed: ${catCount} cats and ${pedigreeCount} pedigrees are using this breed`,
      );
    }

    return this.prisma.breed.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [totalBreeds, mostPopularBreeds, breedDistribution] =
      await Promise.all([
        this.prisma.breed.count(),
        this.prisma.breed.findMany({
          include: {
            _count: {
              select: {
                cats: true,
              },
            },
          },
          orderBy: {
            cats: {
              _count: "desc",
            },
          },
          take: 10,
        }),
        this.prisma.cat.groupBy({
          by: ["breedId"],
          _count: true,
          orderBy: {
            _count: {
              breedId: "desc",
            },
          },
        }),
      ]);

    return {
      totalBreeds,
      mostPopularBreeds,
      breedDistribution,
    };
  }

  async getMasterData(): Promise<BreedMasterRecord[]> {
    return this.prisma.breed.findMany({
      select: { code: true, name: true },
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
  }
}
````

## File: backend/src/cats/constants/gender.spec.ts
````typescript
import {
  CatGender,
  InvalidGenderError,
  parseGenderInput,
  parseOptionalGenderInput,
} from "./gender";

describe("gender master parsing", () => {
  it("parses master names case-insensitively", () => {
    expect(parseGenderInput("Male")).toBe(CatGender.MALE);
    expect(parseGenderInput("female")).toBe(CatGender.FEMALE);
    expect(parseGenderInput("Neuter")).toBe(CatGender.NEUTER);
    expect(parseGenderInput("SPAY")).toBe(CatGender.SPAY);
  });

  it("parses master keys", () => {
    expect(parseGenderInput("1")).toBe(CatGender.MALE);
    expect(parseGenderInput("2")).toBe(CatGender.FEMALE);
    expect(parseGenderInput("3")).toBe(CatGender.NEUTER);
    expect(parseGenderInput("4")).toBe(CatGender.SPAY);
  });

  it("ignores optional inputs when undefined or blank", () => {
    expect(parseOptionalGenderInput(undefined)).toBeUndefined();
    expect(parseOptionalGenderInput(null)).toBeUndefined();
    expect(parseOptionalGenderInput("   ")).toBeUndefined();
  });

  it("throws for unsupported values", () => {
    expect(() => parseGenderInput("0")).toThrow(InvalidGenderError);
    expect(() => parseGenderInput("unknown"))
      .toThrow(InvalidGenderError);
  });
});
````

## File: backend/src/cats/constants/gender.ts
````typescript
export enum CatGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NEUTER = "NEUTER",
  SPAY = "SPAY",
}

export type GenderMasterKey = "1" | "2" | "3" | "4";
export type CatGenderInput = CatGender | GenderMasterKey;

export interface GenderMasterRecord {
  key: GenderMasterKey;
  name: string;
  canonical: CatGender;
}

export const GENDER_MASTER: ReadonlyArray<GenderMasterRecord> = [
  { key: "1", name: "Male", canonical: CatGender.MALE },
  { key: "2", name: "Female", canonical: CatGender.FEMALE },
  { key: "3", name: "Neuter", canonical: CatGender.NEUTER },
  { key: "4", name: "Spay", canonical: CatGender.SPAY },
];

const NAME_TO_CANONICAL = new Map<string, CatGender>();
const KEY_TO_CANONICAL = new Map<string, CatGender>();

for (const record of GENDER_MASTER) {
  NAME_TO_CANONICAL.set(record.name.toUpperCase(), record.canonical);
  NAME_TO_CANONICAL.set(record.canonical, record.canonical);
  KEY_TO_CANONICAL.set(record.key, record.canonical);
}

export const GENDER_INPUT_VALUES: ReadonlyArray<string> = [
  ...Object.values(CatGender),
  ...GENDER_MASTER.map((record) => record.key),
];

const DIGIT_PATTERN = /^\d+$/u;

export const transformGenderInput = (
  value: unknown,
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return trimmed;
    }

    if (DIGIT_PATTERN.test(trimmed)) {
      return trimmed;
    }

    return trimmed.toUpperCase();
  }

  return "";
};

export class InvalidGenderError extends Error {
  constructor(input: string) {
    super(`Invalid gender value: ${input}`);
    this.name = "InvalidGenderError";
  }
}

const coerceInputString = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
};

const resolveCanonicalGender = (value: string): CatGender | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.length === 1 ? value : value.toUpperCase();
  const fromName = NAME_TO_CANONICAL.get(normalized);
  if (fromName) {
    return fromName;
  }

  const fromKey = KEY_TO_CANONICAL.get(value);
  if (fromKey) {
    return fromKey;
  }

  return undefined;
};

export const parseGenderInput = (value: unknown): CatGender => {
  const input = coerceInputString(value);
  const canonical = resolveCanonicalGender(input);
  if (!canonical) {
    throw new InvalidGenderError(input || String(value));
  }

  return canonical;
};

export const parseOptionalGenderInput = (
  value: unknown,
): CatGender | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const input = coerceInputString(value);
  if (!input) {
    return undefined;
  }

  const canonical = resolveCanonicalGender(input);
  if (!canonical) {
    throw new InvalidGenderError(input);
  }

  return canonical;
};

export const GENDER_CANONICAL_ORDER: ReadonlyArray<CatGender> = [
  CatGender.MALE,
  CatGender.FEMALE,
  CatGender.NEUTER,
  CatGender.SPAY,
];
````

## File: backend/src/cats/dto/cat-family.dto.ts
````typescript
/**
 * 猫の家族情報（血統タブ用）DTO
 */

/**
 * 祖先（祖父母・曾祖父母）の情報
 * Pedigreeテーブルから取得される先祖情報
 */
export interface AncestorInfo {
  /** 血統書ID（Pedigreeレコードがある場合） */
  pedigreeId: string | null;
  /** 猫の名前 */
  catName: string | null;
  /** 毛色 */
  coatColor: string | null;
  /** タイトル */
  title: string | null;
  /** JCU番号 */
  jcu: string | null;
}

/**
 * 親情報（父または母）
 * 猫レコードとPedigreeレコードの両方から情報を取得
 */
export interface ParentInfo {
  /** 猫ID（Catレコードがある場合） */
  id: string | null;
  /** 血統書ID（Pedigreeレコードがある場合） */
  pedigreeId: string | null;
  /** 猫の名前 */
  name: string;
  /** 性別 */
  gender: string | null;
  /** 生年月日 */
  birthDate: string | null;
  /** 品種 */
  breed: { id: string; name: string } | null;
  /** 毛色 */
  coatColor: { id: string; name: string } | string | null;
  /** 父方祖父 */
  father: AncestorInfo | null;
  /** 父方祖母 */
  mother: AncestorInfo | null;
}

/**
 * 兄弟姉妹情報
 */
export interface SiblingInfo {
  /** 猫ID */
  id: string;
  /** 名前 */
  name: string;
  /** 性別 */
  gender: string;
  /** 生年月日 */
  birthDate: string;
  /** 品種 */
  breed: { id: string; name: string } | null;
  /** 毛色 */
  coatColor: { id: string; name: string } | null;
  /** 血統書ID */
  pedigreeId: string | null;
}

/**
 * 子猫情報
 */
export interface OffspringInfo {
  /** 猫ID */
  id: string;
  /** 名前 */
  name: string;
  /** 性別 */
  gender: string;
  /** 生年月日 */
  birthDate: string;
  /** 品種 */
  breed: { id: string; name: string } | null;
  /** 毛色 */
  coatColor: { id: string; name: string } | null;
  /** 血統書ID */
  pedigreeId: string | null;
  /** 相手の親（この猫がオスなら母、メスなら父） */
  otherParent: {
    id: string;
    name: string;
    gender: string;
    pedigreeId: string | null;
  } | null;
}

/**
 * 猫の家族情報レスポンス
 */
export interface CatFamilyResponse {
  /** 本猫の情報 */
  cat: {
    id: string;
    name: string;
    gender: string;
    birthDate: string;
    pedigreeId: string | null;
    breed: { id: string; name: string } | null;
    coatColor: { id: string; name: string } | null;
  };
  /** 父親情報（Pedigreeから祖父母・曾祖父母を含む） */
  father: ParentInfo | null;
  /** 母親情報（Pedigreeから祖父母・曾祖父母を含む） */
  mother: ParentInfo | null;
  /** 兄弟姉妹（両親が一致する猫のみ） */
  siblings: SiblingInfo[];
  /** 子猫一覧（この猫が親の場合） */
  offspring: OffspringInfo[];
}
````

## File: backend/src/cats/dto/cat-query.dto.ts
````typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  IsBoolean,
  Min,
  Max,
} from "class-validator";

import {
  CatGenderInput,
  GENDER_INPUT_VALUES,
  transformGenderInput,
} from "../constants/gender";

export class CatQueryDto {
  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: "検索キーワード" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "品種ID" })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: "毛色ID" })
  @IsOptional()
  @IsString()
  coatColorId?: string;

  @ApiPropertyOptional({
    description: "性別",
    enum: GENDER_INPUT_VALUES,
  })
  @IsOptional()
  @Transform(({ value }) => transformGenderInput(value), { toClassOnly: true })
  @IsString()
  @IsIn(GENDER_INPUT_VALUES)
  gender?: CatGenderInput;

  @ApiPropertyOptional({ description: "在舎中フィルター" })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isInHouse?: boolean;

  @ApiPropertyOptional({ description: "最小年齢" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageMin?: number;

  @ApiPropertyOptional({ description: "最大年齢" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageMax?: number;

  @ApiPropertyOptional({ description: "ソート項目", default: "createdAt" })
  @IsOptional()
  @IsString()
  @IsIn(["createdAt", "updatedAt", "name", "birthDate", "weight"])
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({ description: "ソート順", default: "desc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
````

## File: backend/src/cats/dto/cat-statistics.dto.ts
````typescript
/**
 * 猫統計情報のレスポンスDTO
 * タブ別カウントを含む拡張統計情報
 */

/**
 * タブ別カウント情報
 */
export interface TabCounts {
  /** 全成猫数（子猫除外） */
  total: number;
  /** オス成猫数 */
  male: number;
  /** メス成猫数 */
  female: number;
  /** 子猫数（生後3ヶ月以内 + 母猫あり） */
  kitten: number;
  /** 養成中タグ付き猫数 */
  raising: number;
  /** 卒業予定タグ付き猫数 */
  grad: number;
}

/**
 * 性別分布情報
 */
export interface GenderDistribution {
  MALE: number;
  FEMALE: number;
  NEUTER: number;
  SPAY: number;
}

/**
 * 品種統計情報
 */
export interface BreedStat {
  breed: {
    id: string;
    name: string;
  } | null;
  count: number;
}

/**
 * 猫統計レスポンス
 */
export interface CatStatisticsResponse {
  /** 全猫数 */
  total: number;
  /** 性別分布 */
  genderDistribution: GenderDistribution;
  /** 品種分布（上位10件） */
  breedDistribution: BreedStat[];
  /** タブ別カウント（猫一覧ページ用） */
  tabCounts: TabCounts;
}
````

## File: backend/src/cats/dto/create-cat.dto.ts
````typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsBoolean,
  IsArray,
  IsIn,
} from "class-validator";

export class CreateCatDto {
  @ApiProperty({ description: "猫の名前", example: "Alpha" })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: "性別",
    enum: ["MALE", "FEMALE", "NEUTER", "SPAY"],
    example: "MALE",
  })
  @IsString()
  @IsIn(["MALE", "FEMALE", "NEUTER", "SPAY"])
  gender: "MALE" | "FEMALE" | "NEUTER" | "SPAY";

  @ApiProperty({ description: "生年月日", example: "2024-05-01" })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ description: "品種ID" })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: "毛色ID" })
  @IsOptional()
  @IsString()
  coatColorId?: string;

  @ApiPropertyOptional({ description: "マイクロチップ番号" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  microchipNumber?: string;

  @ApiPropertyOptional({ description: "登録番号" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @ApiPropertyOptional({ description: "説明・備考" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: "施設内に在舎しているか" })
  @IsOptional()
  @IsBoolean()
  isInHouse?: boolean;

  @ApiPropertyOptional({ description: "父猫のID" })
  @IsOptional()
  @IsString()
  fatherId?: string;

  @ApiPropertyOptional({ description: "母猫のID" })
  @IsOptional()
  @IsString()
  motherId?: string;

  @ApiPropertyOptional({ description: "タグID配列" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
````

## File: backend/src/cats/dto/index.ts
````typescript
export * from "./create-cat.dto";
export * from "./update-cat.dto";
export * from "./cat-query.dto";
export * from "./kitten-query.dto";
export * from "./weight-record.dto";
export * from "./cat-family.dto";
export * from "./cat-statistics.dto";
export {
	CatGender,
	CatGenderInput,
	GenderMasterKey,
	GENDER_INPUT_VALUES,
} from "../constants/gender";
````

## File: backend/src/cats/dto/kitten-query.dto.ts
````typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  IsUUID,
  Min,
  Max,
} from "class-validator";

/**
 * 子猫一覧取得用クエリDTO
 * 生後6ヶ月未満の猫をフィルタリングし、母猫ごとにグループ化
 */
export class KittenQueryDto {
  @ApiPropertyOptional({ description: "母猫ID（指定時はその母猫の子猫のみ取得）" })
  @IsOptional()
  @IsUUID("4")
  motherId?: string;

  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ description: "検索キーワード（子猫名）" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "ソート項目", default: "birthDate" })
  @IsOptional()
  @IsString()
  @IsIn(["birthDate", "name", "createdAt"])
  sortBy?: string = "birthDate";

  @ApiPropertyOptional({ description: "ソート順", default: "desc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
````

## File: backend/src/cats/dto/update-cat.dto.ts
````typescript
import { PartialType } from "@nestjs/mapped-types";
import { IsIn, IsOptional } from "class-validator";

import { CreateCatDto } from "./create-cat.dto";

export class UpdateCatDto extends PartialType(CreateCatDto) {
  @IsOptional()
  @IsIn(["MALE", "FEMALE", "NEUTER", "SPAY"])
  gender?: "MALE" | "FEMALE" | "NEUTER" | "SPAY";
}
````

## File: backend/src/cats/dto/weight-record.dto.ts
````typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
} from "class-validator";

/**
 * 体重記録作成 DTO
 */
export class CreateWeightRecordDto {
  @ApiProperty({
    description: "体重（グラム単位）",
    example: 350,
    minimum: 1,
    maximum: 50000,
  })
  @IsNumber()
  @Min(1, { message: "体重は1g以上で入力してください" })
  @Max(50000, { message: "体重は50000g以下で入力してください" })
  @Type(() => Number)
  weight!: number;

  @ApiPropertyOptional({
    description: "記録日時（省略時は現在日時）",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString({}, { message: "記録日時は有効な日付形式で入力してください" })
  recordedAt?: string;

  @ApiPropertyOptional({
    description: "メモ",
    example: "ミルクをよく飲んでいる",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 体重記録更新 DTO
 */
export class UpdateWeightRecordDto {
  @ApiPropertyOptional({
    description: "体重（グラム単位）",
    example: 380,
    minimum: 1,
    maximum: 50000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: "体重は1g以上で入力してください" })
  @Max(50000, { message: "体重は50000g以下で入力してください" })
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({
    description: "記録日時",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString({}, { message: "記録日時は有効な日付形式で入力してください" })
  recordedAt?: string;

  @ApiPropertyOptional({
    description: "メモ",
    example: "順調に成長中",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 体重記録クエリ DTO
 */
export class WeightRecordQueryDto {
  @ApiPropertyOptional({
    description: "ページ番号",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: "1ページあたりの件数",
    example: 50,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: "開始日（この日以降の記録を取得）",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString({}, { message: "開始日は有効な日付形式で入力してください" })
  startDate?: string;

  @ApiPropertyOptional({
    description: "終了日（この日以前の記録を取得）",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString({}, { message: "終了日は有効な日付形式で入力してください" })
  endDate?: string;

  @ApiPropertyOptional({
    description: "ソート順",
    example: "desc",
    default: "desc",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

/**
 * 一括体重記録の個別レコード DTO
 */
export class BulkWeightRecordItemDto {
  @ApiProperty({
    description: "猫ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID("4", { message: "猫IDは有効なUUID形式で入力してください" })
  catId!: string;

  @ApiProperty({
    description: "体重（グラム単位）",
    example: 350,
    minimum: 1,
    maximum: 50000,
  })
  @IsNumber()
  @Min(1, { message: "体重は1g以上で入力してください" })
  @Max(50000, { message: "体重は50000g以下で入力してください" })
  @Type(() => Number)
  weight!: number;

  @ApiPropertyOptional({
    description: "メモ",
    example: "元気",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 一括体重記録作成 DTO
 */
export class CreateBulkWeightRecordsDto {
  @ApiProperty({
    description: "記録日時（全レコード共通）",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsDateString({}, { message: "記録日時は有効な日付形式で入力してください" })
  recordedAt!: string;

  @ApiProperty({
    description: "体重記録の配列",
    type: [BulkWeightRecordItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: "少なくとも1件の体重記録が必要です" })
  @ValidateNested({ each: true })
  @Type(() => BulkWeightRecordItemDto)
  records!: BulkWeightRecordItemDto[];
}

/**
 * 一括体重記録レスポンス型
 */
export interface BulkWeightRecordsResponse {
  success: boolean;
  created: number;
  records: WeightRecordResponse[];
}

/**
 * 体重記録レスポンス型（型定義のみ、バリデーションなし）
 */
export interface WeightRecordResponse {
  id: string;
  catId: string;
  weight: number;
  recordedAt: string;
  notes: string | null;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  recorder?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

/**
 * 体重記録一覧レスポンス型
 */
export interface WeightRecordsListResponse {
  data: WeightRecordResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary?: {
    latestWeight: number | null;
    previousWeight: number | null;
    weightChange: number | null;
    latestRecordedAt: string | null;
    recordCount: number;
  };
}
````

## File: backend/src/cats/types/cat.types.ts
````typescript
import { Prisma } from "@prisma/client";

export const catWithRelationsInclude = Prisma.validator<Prisma.CatInclude>()({
  breed: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  coatColor: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  father: {
    select: {
      id: true,
      name: true,
      gender: true,
    },
  },
  mother: {
    select: {
      id: true,
      name: true,
      gender: true,
    },
  },
  pedigree: {
    select: {
      id: true,
      pedigreeId: true,
      catName: true,
      breedCode: true,
      coatColorCode: true,
      genderCode: true,
      birthDate: true,
      breederName: true,
      ownerName: true,
    },
  },
  tags: {
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          color: true,
          textColor: true,
          group: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

export type CatWithRelations = Prisma.CatGetPayload<{
  include: typeof catWithRelationsInclude;
}>;
````

## File: backend/src/cats/cats.controller.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  const mockCatsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getBreedingHistory: jest.fn(),
    getCareHistory: jest.fn(),
    getStatistics: jest.fn(),
    findKittens: jest.fn(),
    getWeightRecords: jest.fn(),
    createWeightRecord: jest.fn(),
    updateWeightRecord: jest.fn(),
    deleteWeightRecord: jest.fn(),
    getWeightRecord: jest.fn(),
    createBulkWeightRecords: jest.fn(),
    getWeightRecordsForKittens: jest.fn(),
    getCatFamily: jest.fn(),
    assignTags: jest.fn(),
    removeTags: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [CatsController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: CatsService,
          useValue: mockCatsService,
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cat', async () => {
      const createDto = {
        name: 'Test Cat',
        gender: 'FEMALE' as const,
        birthDate: '2024-01-01',
        isInHouse: true,
      };
      const mockCat = { id: '1', ...createDto };

      mockCatsService.create.mockResolvedValue(mockCat);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCat);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated cats', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Cat 1' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCatsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a cat by id', async () => {
      const mockCat = { id: '1', name: 'Test Cat' };

      mockCatsService.findOne.mockResolvedValue(mockCat);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCat);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a cat', async () => {
      const updateDto = { name: 'Updated Cat' };
      const mockCat = { id: '1', name: 'Updated Cat' };

      mockCatsService.update.mockResolvedValue(mockCat);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockCat);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a cat', async () => {
      mockCatsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getStatistics', () => {
    it('should return cat statistics', async () => {
      const mockStats = {
        total: 18,
        female: 10,
        male: 8,
        inHouse: 15,
        graduated: 3,
      };

      mockCatsService.getStatistics.mockResolvedValue(mockStats);

      const result = await controller.getStatistics();

      expect(result).toEqual(mockStats);
      expect(service.getStatistics).toHaveBeenCalled();
    });
  });
});
````

## File: backend/src/cats/cats.controller.ts
````typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  Logger,
  UseGuards,
  ParseUUIDPipe,
  Header,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CatsService } from "./cats.service";
import { GENDER_MASTER } from "./constants/gender";
import {
  CreateCatDto,
  UpdateCatDto,
  CatQueryDto,
  KittenQueryDto,
  CreateWeightRecordDto,
  UpdateWeightRecordDto,
  WeightRecordQueryDto,
  CreateBulkWeightRecordsDto,
} from "./dto";

@ApiTags("Cats")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cats")
export class CatsController {
  private readonly logger = new Logger(CatsController.name);

  constructor(private readonly catsService: CatsService) {}

  @Post()
  @ApiOperation({ summary: "猫データを作成" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "猫データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  create(@Body() createCatDto: CreateCatDto) {
    this.logger.log({
      message: 'Creating new cat',
      catName: createCatDto.name,
      breedId: createCatDto.breedId,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.create(createCatDto);
  }

  @Get()
  @Header('Cache-Control', 'no-cache')
  @ApiOperation({ summary: "猫データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "猫データの一覧" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 10,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード" })
  @ApiQuery({ name: "breedId", required: false, description: "品種ID" })
  @ApiQuery({ name: "coatColorId", required: false, description: "毛色ID" })
  @ApiQuery({ name: "gender", required: false, description: "性別" })
  @ApiQuery({ name: "status", required: false, description: "ステータス" })
  @ApiQuery({ name: "ageMin", required: false, description: "最小年齢" })
  @ApiQuery({ name: "ageMax", required: false, description: "最大年齢" })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "createdAt",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  findAll(@Query() query: CatQueryDto) {
    return this.catsService.findAll(query);
  }

  @Get("statistics")
  @ApiOperation({ summary: "猫データの統計情報を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "統計情報" })
  getStatistics() {
    return this.catsService.getStatistics();
  }

  @Get("kittens")
  @Header('Cache-Control', 'no-cache')
  @ApiOperation({ summary: "子猫一覧を取得（生後6ヶ月未満、母猫ごとにグループ化）" })
  @ApiResponse({ status: HttpStatus.OK, description: "子猫データの一覧（母猫ごとにグループ化）" })
  @ApiQuery({
    name: "motherId",
    required: false,
    description: "母猫ID（指定時はその母猫の子猫のみ取得）",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 50,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード（子猫名）" })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "birthDate",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  findKittens(@Query() query: KittenQueryDto) {
    return this.catsService.findKittens(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで猫データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "猫データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.catsService.findOne(id);
  }

  @Get(":id/breeding-history")
  @ApiOperation({ summary: "猫の繁殖履歴を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "繁殖履歴" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  getBreedingHistory(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.catsService.getBreedingHistory(id);
  }

  @Get(":id/care-history")
  @ApiOperation({ summary: "猫のケア履歴を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "ケア履歴" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  getCareHistory(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.catsService.getCareHistory(id);
  }

  @Get(":id/family")
  @Header('Cache-Control', 'no-cache')
  @ApiOperation({ summary: "猫の家族情報を取得（血統タブ用）" })
  @ApiResponse({ status: HttpStatus.OK, description: "家族情報（親・兄弟姉妹・子猫）" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  getCatFamily(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.catsService.getCatFamily(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "猫データを更新" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "猫データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateCatDto: UpdateCatDto,
  ) {
    this.logger.log({
      message: 'Updating cat',
      catId: id,
      fields: Object.keys(updateCatDto),
      timestamp: new Date().toISOString(),
    });
    return this.catsService.update(id, updateCatDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "猫データを削除" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "猫データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    this.logger.warn({
      message: 'Deleting cat',
      catId: id,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.remove(id);
  }

  @Get("genders")
  @ApiOperation({ summary: "性別マスタデータを取得" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "性別マスタデータを返却",
  })
  getGenders() {
    return {
      success: true,
      data: GENDER_MASTER.map(record => ({
        id: parseInt(record.key),
        code: parseInt(record.key),
        name: record.name,
        canonical: record.canonical,
      })),
    };
  }

  // ==========================================
  // 体重記録 API エンドポイント
  // ==========================================

  @Get(":id/weight-records")
  @Header("Cache-Control", "no-cache")
  @ApiOperation({ summary: "猫の体重記録一覧を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "体重記録一覧" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 50,
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "開始日",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "終了日",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  getWeightRecords(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Query() query: WeightRecordQueryDto,
    @GetUser() user: RequestUser,
  ) {
    return this.catsService.getWeightRecords(id, query, user.userId);
  }

  @Post(":id/weight-records")
  @ApiOperation({ summary: "猫の体重記録を追加" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "体重記録が正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  createWeightRecord(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: CreateWeightRecordDto,
    @GetUser() user: RequestUser,
  ) {
    this.logger.log({
      message: "Creating weight record",
      catId: id,
      weight: dto.weight,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.createWeightRecord(id, dto, user.userId);
  }

  @Get("weight-records/:recordId")
  @ApiOperation({ summary: "体重記録を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "体重記録" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "体重記録が見つかりません",
  })
  @ApiParam({ name: "recordId", description: "体重記録のID" })
  getWeightRecord(
    @Param("recordId", new ParseUUIDPipe({ version: "4" })) recordId: string,
  ) {
    return this.catsService.getWeightRecord(recordId);
  }

  @Patch("weight-records/:recordId")
  @ApiOperation({ summary: "体重記録を更新" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "体重記録が正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "体重記録が見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiParam({ name: "recordId", description: "体重記録のID" })
  updateWeightRecord(
    @Param("recordId", new ParseUUIDPipe({ version: "4" })) recordId: string,
    @Body() dto: UpdateWeightRecordDto,
    @GetUser() user: RequestUser,
  ) {
    this.logger.log({
      message: "Updating weight record",
      recordId,
      fields: Object.keys(dto),
      timestamp: new Date().toISOString(),
    });
    return this.catsService.updateWeightRecord(recordId, dto, user.userId);
  }

  @Delete("weight-records/:recordId")
  @ApiOperation({ summary: "体重記録を削除" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "体重記録が正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "体重記録が見つかりません",
  })
  @ApiParam({ name: "recordId", description: "体重記録のID" })
  deleteWeightRecord(
    @Param("recordId", new ParseUUIDPipe({ version: "4" })) recordId: string,
    @GetUser() user: RequestUser,
  ) {
    this.logger.warn({
      message: "Deleting weight record",
      recordId,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.deleteWeightRecord(recordId, user.userId);
  }

  @Post("weight-records/bulk")
  @ApiOperation({ summary: "複数の猫の体重を一括登録" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "体重記録が正常に一括作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  createBulkWeightRecords(
    @Body() dto: CreateBulkWeightRecordsDto,
    @GetUser() user: RequestUser,
  ) {
    this.logger.log({
      message: "Creating bulk weight records",
      count: dto.records.length,
      recordedAt: dto.recordedAt,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.createBulkWeightRecords(dto, user.userId);
  }
}
````

## File: backend/src/cats/cats.module.ts
````typescript
import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";

import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";

@Module({
  imports: [PrismaModule, AuthModule, EventEmitterModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
````

## File: backend/src/cats/cats.service.spec.ts
````typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { CatsService } from './cats.service';
import { CreateCatDto } from './dto';

describe('CatsService', () => {
  let service: CatsService;
  let _prismaService: PrismaService;
  let _eventEmitter: EventEmitter2;

  const mockPrismaService = {
    cat: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    kittenDisposition: {
      deleteMany: jest.fn(),
    },
    breed: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    coatColor: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
    catTag: {
      count: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a cat successfully', async () => {
      const createCatDto: CreateCatDto = {
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: '2024-01-01',
        isInHouse: true,
      };

      const mockCat = {
        id: '1',
        ...createCatDto,
        birthDate: new Date(createCatDto.birthDate),
        breed: null,
        coatColor: null,
        tags: [],
      };

      mockPrismaService.cat.create.mockResolvedValue(mockCat);

      const result = await service.create(createCatDto);

      expect(result).toEqual(mockCat);
      expect(mockPrismaService.cat.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException for invalid breed', async () => {
      const createCatDto: CreateCatDto = {
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: '2024-01-01',
        breedId: 'invalid-breed-id',
        isInHouse: true,
      };

      mockPrismaService.breed.findUnique.mockResolvedValue(null);
      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.create(createCatDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid coat color', async () => {
      const createCatDto: CreateCatDto = {
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: '2024-01-01',
        coatColorId: 'invalid-color-id',
        isInHouse: true,
      };

      mockPrismaService.coatColor.findUnique.mockResolvedValue(null);
      mockPrismaService.coatColor.findFirst.mockResolvedValue(null);

      await expect(service.create(createCatDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated cats', async () => {
      const mockCats = [
        { id: '1', name: 'Cat 1', gender: 'FEMALE', birthDate: new Date() },
        { id: '2', name: 'Cat 2', gender: 'MALE', birthDate: new Date() },
      ];

      mockPrismaService.cat.findMany.mockResolvedValue(mockCats);
      mockPrismaService.cat.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockCats);
      expect(result.meta.total).toBe(2);
      expect(mockPrismaService.cat.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.cat.count).toHaveBeenCalledTimes(1);
    });

    it('should filter cats by gender', async () => {
      const mockCats = [
        { id: '1', name: 'Cat 1', gender: 'FEMALE', birthDate: new Date() },
      ];

      mockPrismaService.cat.findMany.mockResolvedValue(mockCats);
      mockPrismaService.cat.count.mockResolvedValue(1);

      const result = await service.findAll({ gender: 'FEMALE' as any });

      expect(result.data).toEqual(mockCats);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a cat by id', async () => {
      const mockCat = {
        id: '1',
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCat);
      expect(mockPrismaService.cat.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when cat not found', async () => {
      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cat successfully', async () => {
      const updateDto = { name: 'Updated Cat' };
      const mockCat = {
        id: '1',
        name: 'Updated Cat',
        gender: 'FEMALE',
        birthDate: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.cat.update.mockResolvedValue(mockCat);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockCat);
      expect(mockPrismaService.cat.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating non-existent cat', async () => {
      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a cat successfully', async () => {
      const mockCat = {
        id: '1',
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.cat.delete.mockResolvedValue(mockCat);

      await service.remove('1');

      expect(mockPrismaService.kittenDisposition.deleteMany).toHaveBeenCalledWith({
        where: { kittenId: '1' },
      });
      expect(mockPrismaService.cat.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          breed: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          coatColor: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          father: {
            select: {
              id: true,
              name: true,
              gender: true,
            },
          },
          mother: {
            select: {
              id: true,
              name: true,
              gender: true,
            },
          },
          pedigree: {
            select: {
              id: true,
              pedigreeId: true,
              catName: true,
              breedCode: true,
              coatColorCode: true,
              genderCode: true,
              birthDate: true,
              breederName: true,
              ownerName: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  textColor: true,
                  group: {
                    select: {
                      id: true,
                      name: true,
                      category: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when deleting non-existent cat', async () => {
      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('should return cat statistics', async () => {
      // 全猫数
      mockPrismaService.cat.count.mockResolvedValue(18);
      
      // 性別分布とブリード分布のgroupBy（2回呼ばれる）
      mockPrismaService.cat.groupBy
        .mockResolvedValueOnce([
          { gender: 'MALE', _count: 8 },
          { gender: 'FEMALE', _count: 10 },
        ])
        .mockResolvedValueOnce([
          { breedId: 'breed-1', _count: 10 },
          { breedId: 'breed-2', _count: 8 },
        ]);

      // 在舎猫のデータ（タブカウント計算用）
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      mockPrismaService.cat.findMany.mockResolvedValue([
        { id: 'cat-1', gender: 'MALE', birthDate: new Date('2023-01-01'), motherId: null },
        { id: 'cat-2', gender: 'FEMALE', birthDate: new Date('2023-02-01'), motherId: null },
        { id: 'cat-3', gender: 'MALE', birthDate: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000), motherId: 'cat-2' },
      ]);

      // 養成中タグ数
      mockPrismaService.catTag.count
        .mockResolvedValueOnce(2)
        // 卒業予定タグ数
        .mockResolvedValueOnce(1);

      // ブリード情報
      mockPrismaService.breed.findMany.mockResolvedValue([
        { id: 'breed-1', name: 'Persian', code: 1 },
        { id: 'breed-2', name: 'Siamese', code: 2 },
      ]);

      const result = await service.getStatistics();

      expect(result.total).toBe(18);
      expect(result.genderDistribution.MALE).toBe(8);
      expect(result.genderDistribution.FEMALE).toBe(10);
    });
  });
});
````

## File: backend/src/cats/cats.service.ts
````typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { TAG_AUTOMATION_EVENTS } from "../tags/events/tag-automation.events";

import {
  CreateCatDto,
  UpdateCatDto,
  CatQueryDto,
  KittenQueryDto,
  CreateWeightRecordDto,
  UpdateWeightRecordDto,
  WeightRecordQueryDto,
  WeightRecordResponse,
  WeightRecordsListResponse,
  CreateBulkWeightRecordsDto,
  BulkWeightRecordsResponse,
  CatFamilyResponse,
  ParentInfo,
  AncestorInfo,
  SiblingInfo,
  OffspringInfo,
  CatStatisticsResponse,
} from "./dto";
import { catWithRelationsInclude, CatWithRelations } from "./types/cat.types";

@Injectable()
export class CatsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createCatDto: CreateCatDto) {
    const {
      name,
      gender,
      birthDate,
      breedId,
      coatColorId,
      microchipNumber,
      registrationNumber,
      description,
      isInHouse,
      fatherId,
      motherId,
      tagIds,
    } = createCatDto;

    // Validate breed if provided
    let breedIdToConnect: string | undefined;
    if (breedId) {
      // Try to find by ID first
      let breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      
      // If not found by ID, try to find by name
      if (!breed) {
        breed = await this.prisma.breed.findFirst({
          where: { name: breedId },
        });
      }
      
      if (!breed) {
        throw new BadRequestException("Invalid breed ID or name");
      }
      
      breedIdToConnect = breed.id;
    }

    // Validate coatColor if provided
    let coatColorIdToConnect: string | undefined;
    if (coatColorId) {
      // Try to find by ID first
      let color = await this.prisma.coatColor.findUnique({
        where: { id: coatColorId },
      });
      
      // If not found by ID, try to find by name
      if (!color) {
        color = await this.prisma.coatColor.findFirst({
          where: { name: coatColorId },
        });
      }
      
      if (!color) {
        throw new BadRequestException("Invalid coat color ID or name");
      }
      
      coatColorIdToConnect = color.id;
    }

    const birth = new Date(birthDate);

    try {
      // Create the cat
      let cat = await this.prisma.cat.create({
        data: {
          name,
          gender,
          birthDate: birth,
          ...(registrationNumber ? { registrationNumber } : {}),
          ...(microchipNumber ? { microchipNumber } : {}),
          ...(description ? { description } : {}),
          isInHouse: isInHouse ?? true,
          ...(breedIdToConnect ? { breed: { connect: { id: breedIdToConnect } } } : {}),
          ...(coatColorIdToConnect ? { coatColor: { connect: { id: coatColorIdToConnect } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: catWithRelationsInclude,
      });

      // Handle tag assignments if provided
      if (tagIds && tagIds.length > 0) {
        await this.prisma.catTag.createMany({
          data: tagIds.map((tagId) => ({
            catId: cat.id,
            tagId,
          })),
          skipDuplicates: true,
        });

        // Fetch the cat again with tags
        const updatedCat = await this.prisma.cat.findUnique({
          where: { id: cat.id },
          include: catWithRelationsInclude,
        });
        if (updatedCat) {
          cat = updatedCat;
        }
      }

      // 子猫登録イベントを発火（母猫または父猫が設定されている場合）
      if (cat && (motherId || fatherId)) {
        this.eventEmitter.emit(TAG_AUTOMATION_EVENTS.KITTEN_REGISTERED, {
          eventType: "KITTEN_REGISTERED" as const,
          kittenId: cat.id,
          motherId: motherId || undefined,
          fatherId: fatherId || undefined,
        });
      }

      return cat;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("microchipNumber") || target?.includes("microchip_number")) {
          throw new ConflictException("Cat with the same microchip number already exists");
        }
        throw new ConflictException("Cat with the same registration number already exists");
      }
      throw error;
    }
  }

  async findAll(query: CatQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      breedId,
      coatColorId,
      gender,
      isInHouse,
      ageMin,
      ageMax,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.CatWhereInput = {};

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { microchipNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (breedId) where.breedId = breedId;
    if (coatColorId) where.coatColorId = coatColorId;
    if (gender) {
      where.gender = gender;
    }
    if (isInHouse !== undefined) {
      where.isInHouse = isInHouse;
    }

    // Age filters
    if (ageMin || ageMax) {
      const now = new Date();
      const birthFilter: Prisma.DateTimeFilter = {};
      if (ageMax) {
        const minBirthDate = new Date(
          now.getFullYear() - ageMax,
          now.getMonth(),
          now.getDate(),
        );
        birthFilter.gte = minBirthDate;
      }
      if (ageMin) {
        const maxBirthDate = new Date(
          now.getFullYear() - ageMin,
          now.getMonth(),
          now.getDate(),
        );
        birthFilter.lte = maxBirthDate;
      }
      if (birthFilter.gte || birthFilter.lte) {
        where.birthDate = birthFilter;
      }
    }

    type Sortable = "createdAt" | "updatedAt" | "name" | "birthDate";
    const orderBy: Prisma.CatOrderByWithRelationInput = {
      [sortBy as Sortable]: sortOrder,
    } as Prisma.CatOrderByWithRelationInput;

    const [cats, total] = (await Promise.all([
      this.prisma.cat.findMany({
        where,
        skip,
        take: limit,
        include: catWithRelationsInclude,
        orderBy,
      }),
      this.prisma.cat.count({ where }),
    ])) as [CatWithRelations[], number];

    return {
      data: cats,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cat = await this.prisma.cat.findUnique({
      where: { id },
      include: catWithRelationsInclude,
    });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    return cat;
  }

  async update(id: string, updateCatDto: UpdateCatDto) {
    const existingCat = await this.prisma.cat.findUnique({
      where: { id },
    });

    if (!existingCat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    const {
      name,
      gender,
      birthDate,
      breedId,
      coatColorId,
      microchipNumber,
      registrationNumber,
      description,
      isInHouse,
      fatherId,
      motherId,
      tagIds,
    } = updateCatDto;

    // Validate breed if provided
    let breedIdToConnect: string | undefined;
    if (breedId) {
      // Try to find by ID first
      let breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      
      // If not found by ID, try to find by name
      if (!breed) {
        breed = await this.prisma.breed.findFirst({
          where: { name: breedId },
        });
      }
      
      if (!breed) {
        throw new BadRequestException("Invalid breed ID or name");
      }
      
      breedIdToConnect = breed.id;
    }

    // Validate color if provided
    let coatColorIdToConnect: string | undefined;
    if (coatColorId) {
      // Try to find by ID first
      let color = await this.prisma.coatColor.findUnique({
        where: { id: coatColorId },
      });
      
      // If not found by ID, try to find by name
      if (!color) {
        color = await this.prisma.coatColor.findFirst({
          where: { name: coatColorId },
        });
      }
      
      if (!color) {
        throw new BadRequestException("Invalid coat color ID or name");
      }
      
      coatColorIdToConnect = color.id;
    }

    const birth = birthDate ? new Date(birthDate) : undefined;

    try {
      // タグの更新処理（tagIdsが指定されている場合）
      if (tagIds !== undefined) {
        // 既存のタグを全て削除
        await this.prisma.catTag.deleteMany({
          where: { catId: id },
        });

        // 新しいタグを追加
        if (tagIds.length > 0) {
          await this.prisma.catTag.createMany({
            data: tagIds.map((tagId) => ({
              catId: id,
              tagId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return await this.prisma.cat.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(gender ? { gender } : {}),
          ...(birth ? { birthDate: birth } : {}),
          ...(registrationNumber !== undefined ? { registrationNumber } : {}),
          ...(microchipNumber !== undefined ? { microchipNumber } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(isInHouse !== undefined ? { isInHouse } : {}),
          ...(breedIdToConnect ? { breed: { connect: { id: breedIdToConnect } } } : {}),
          ...(coatColorIdToConnect ? { coatColor: { connect: { id: coatColorIdToConnect } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: catWithRelationsInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("microchipNumber") || target?.includes("microchip_number")) {
          throw new ConflictException("Cat with the same microchip number already exists");
        }
        throw new ConflictException("Cat with the same registration number already exists");
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existingCat = await this.prisma.cat.findUnique({
      where: { id },
    });

    if (!existingCat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    await this.prisma.kittenDisposition.deleteMany({
      where: { kittenId: id },
    });

    return this.prisma.cat.delete({
      where: { id },
      include: catWithRelationsInclude,
    });
  }

  async getBreedingHistory(id: string) {
    const cat = await this.findOne(id);

    const breedingRecords = await this.prisma.breedingRecord.findMany({
      where: {
        OR: [{ maleId: id }, { femaleId: id }],
      },
      include: {
        male: {
          include: {
            breed: true,
            coatColor: true,
          },
        },
        female: {
          include: {
            breed: true,
            coatColor: true,
          },
        },
        recorder: true,
      },
      orderBy: {
        breedingDate: "desc",
      },
    });

    return {
      cat,
      breedingRecords,
    };
  }

  async getCareHistory(id: string) {
    const cat = await this.findOne(id);

    const careRecords = await this.prisma.careRecord.findMany({
      where: { catId: id },
      include: {
        recorder: true,
      },
      orderBy: {
        careDate: "desc",
      },
    });

    return {
      cat,
      careRecords,
    };
  }

  async getStatistics(): Promise<CatStatisticsResponse> {
    // 生後6ヶ月の基準日を計算（成猫判定用）
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 生後3ヶ月の基準日を計算（子猫判定用）
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // 基本統計とタブ別カウントを並列取得
    const [
      totalCats,
      genderGroups,
      breedStats,
      // タブ別カウント用クエリ
      inHouseCats,
      raisingTagCats,
      gradTagCats,
    ] = await Promise.all([
      // 全猫数
      this.prisma.cat.count(),
      // 性別分布
      this.prisma.cat.groupBy({
        by: ["gender"],
        _count: true,
      }),
      // 品種分布（上位10件）
      this.prisma.cat.groupBy({
        by: ["breedId"],
        _count: true,
        orderBy: {
          _count: {
            breedId: "desc",
          },
        },
        take: 10,
      }),
      // 在舎猫の基本情報（タブカウント計算用）
      this.prisma.cat.findMany({
        where: { isInHouse: true },
        select: {
          id: true,
          gender: true,
          birthDate: true,
          motherId: true,
        },
      }),
      // 養成中タグが付いた猫数
      this.prisma.catTag.count({
        where: {
          cat: { isInHouse: true },
          tag: { name: "養成中" },
        },
      }),
      // 卒業予定タグが付いた猫数
      this.prisma.catTag.count({
        where: {
          cat: { isInHouse: true },
          tag: { name: "卒業予定" },
        },
      }),
    ]);

    // 性別分布を構築
    const genderDistribution: Record<string, number> = {
      MALE: 0,
      FEMALE: 0,
      NEUTER: 0,
      SPAY: 0,
    };

    for (const group of genderGroups) {
      if (group.gender === "MALE" || group.gender === "FEMALE" || group.gender === "NEUTER" || group.gender === "SPAY") {
        genderDistribution[group.gender] = group._count;
      }
    }

    // 品種情報を取得
    const breedIds = breedStats.map((stat) => stat.breedId).filter((id): id is string => id !== null);
    const breeds = await this.prisma.breed.findMany({
      where: { id: { in: breedIds } },
    });

    const breedStatsWithNames = breedStats.map((stat) => ({
      breed: breeds.find((breed) => breed.id === stat.breedId) ?? null,
      count: stat._count,
    }));

    // タブ別カウントを計算
    // 成猫: 生後6ヶ月以上の在舎猫
    const adultCats = inHouseCats.filter(
      (cat) => new Date(cat.birthDate) < sixMonthsAgo
    );

    // 子猫: 生後3ヶ月以内 + 母猫あり
    const kittenCount = inHouseCats.filter((cat) => {
      if (!cat.motherId) return false;
      return new Date(cat.birthDate) >= threeMonthsAgo;
    }).length;

    // オス成猫数
    const maleCount = adultCats.filter((cat) => cat.gender === "MALE").length;

    // メス成猫数
    const femaleCount = adultCats.filter((cat) => cat.gender === "FEMALE").length;

    return {
      total: totalCats,
      genderDistribution: {
        MALE: genderDistribution.MALE,
        FEMALE: genderDistribution.FEMALE,
        NEUTER: genderDistribution.NEUTER,
        SPAY: genderDistribution.SPAY,
      },
      breedDistribution: breedStatsWithNames,
      tabCounts: {
        total: adultCats.length,
        male: maleCount,
        female: femaleCount,
        kitten: kittenCount,
        raising: raisingTagCats,
        grad: gradTagCats,
      },
    };
  }

  /**
   * 子猫一覧を取得（生後6ヶ月未満、母猫ごとにグループ化）
   */
  async findKittens(query: KittenQueryDto) {
    const {
      motherId,
      page = 1,
      limit = 50,
      search,
      sortBy = "birthDate",
      sortOrder = "desc",
    } = query;

    // 生後6ヶ月の基準日を計算
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const skip = (page - 1) * limit;
    const where: Prisma.CatWhereInput = {
      // 生後6ヶ月未満
      birthDate: { gte: sixMonthsAgo },
      // 母猫が設定されている（子猫として登録されている）
      motherId: motherId ? motherId : { not: null },
    };

    // 検索キーワード
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    type Sortable = "birthDate" | "name" | "createdAt";
    const orderBy: Prisma.CatOrderByWithRelationInput = {
      [sortBy as Sortable]: sortOrder,
    } as Prisma.CatOrderByWithRelationInput;

    // 子猫一覧を取得
    const [kittens, total] = await Promise.all([
      this.prisma.cat.findMany({
        where,
        skip,
        take: limit,
        include: {
          ...catWithRelationsInclude,
          mother: {
            select: {
              id: true,
              name: true,
              gender: true,
              birthDate: true,
              breed: {
                select: { id: true, name: true },
              },
              coatColor: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy,
      }),
      this.prisma.cat.count({ where }),
    ]);

    // 母猫ごとにグループ化
    const motherGroups = new Map<string, {
      mother: {
        id: string;
        name: string;
        gender: string;
        birthDate: Date;
        breed: { id: string; name: string } | null;
        coatColor: { id: string; name: string } | null;
      };
      kittens: typeof kittens;
      fatherId: string | null;
    }>();

    for (const kitten of kittens) {
      if (!kitten.mother) continue;

      const motherId = kitten.mother.id;
      if (!motherGroups.has(motherId)) {
        motherGroups.set(motherId, {
          mother: kitten.mother,
          kittens: [],
          fatherId: kitten.fatherId,
        });
      }
      const group = motherGroups.get(motherId);
      if (group) {
        group.kittens.push(kitten);
      }
    }

    // 父猫情報を取得
    const fatherIds = Array.from(motherGroups.values())
      .map((g) => g.fatherId)
      .filter((id): id is string => id !== null);
    
    const fathers = fatherIds.length > 0
      ? await this.prisma.cat.findMany({
          where: { id: { in: fatherIds } },
          select: {
            id: true,
            name: true,
            gender: true,
            breed: { select: { id: true, name: true } },
            coatColor: { select: { id: true, name: true } },
          },
        })
      : [];

    const fatherMap = new Map(fathers.map((f) => [f.id, f]));

    // レスポンス形式に変換
    const groupedData = Array.from(motherGroups.entries()).map(([, group]) => ({
      mother: group.mother,
      father: group.fatherId ? fatherMap.get(group.fatherId) ?? null : null,
      kittens: group.kittens,
      kittenCount: group.kittens.length,
      deliveryDate: group.kittens[0]?.birthDate ?? null,
    }));

    // 出産日で降順ソート（最新の出産が先頭）
    groupedData.sort((a, b) => {
      const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0;
      const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0;
      return dateB - dateA;
    });

    return {
      data: groupedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalGroups: motherGroups.size,
      },
    };
  }

  // ==========================================
  // 体重記録 CRUD メソッド
  // ==========================================

  /**
   * 猫の体重記録一覧を取得
   */
  async getWeightRecords(
    catId: string,
    query: WeightRecordQueryDto,
    _userId: string,
  ): Promise<WeightRecordsListResponse> {
    // 猫の存在確認
    await this.findOne(catId);

    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.WeightRecordWhereInput = { catId };

    // 日付フィルタ
    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) {
        where.recordedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordedAt.lte = new Date(endDate);
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.weightRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: sortOrder },
        include: {
          recorder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.weightRecord.count({ where }),
    ]);

    // サマリー情報を計算
    const latestRecords = await this.prisma.weightRecord.findMany({
      where: { catId },
      orderBy: { recordedAt: "desc" },
      take: 2,
      select: { weight: true, recordedAt: true },
    });

    const latestWeight = latestRecords[0]?.weight ?? null;
    const previousWeight = latestRecords[1]?.weight ?? null;
    const weightChange =
      latestWeight !== null && previousWeight !== null
        ? latestWeight - previousWeight
        : null;
    const latestRecordedAt = latestRecords[0]?.recordedAt?.toISOString() ?? null;

    const data: WeightRecordResponse[] = records.map((record) => ({
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        latestWeight,
        previousWeight,
        weightChange,
        latestRecordedAt,
        recordCount: total,
      },
    };
  }

  /**
   * 体重記録を作成
   */
  async createWeightRecord(
    catId: string,
    dto: CreateWeightRecordDto,
    userId: string,
  ): Promise<WeightRecordResponse> {
    // 猫の存在確認
    await this.findOne(catId);

    const record = await this.prisma.weightRecord.create({
      data: {
        catId,
        weight: dto.weight,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
        notes: dto.notes,
        recordedBy: userId,
      },
      include: {
        recorder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    };
  }

  /**
   * 体重記録を更新
   */
  async updateWeightRecord(
    recordId: string,
    dto: UpdateWeightRecordDto,
    _userId: string,
  ): Promise<WeightRecordResponse> {
    const existingRecord = await this.prisma.weightRecord.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      throw new NotFoundException(`体重記録が見つかりません（ID: ${recordId}）`);
    }

    const record = await this.prisma.weightRecord.update({
      where: { id: recordId },
      data: {
        ...(dto.weight !== undefined ? { weight: dto.weight } : {}),
        ...(dto.recordedAt ? { recordedAt: new Date(dto.recordedAt) } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
      include: {
        recorder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    };
  }

  /**
   * 体重記録を削除
   */
  async deleteWeightRecord(recordId: string, _userId: string): Promise<void> {
    const existingRecord = await this.prisma.weightRecord.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      throw new NotFoundException(`体重記録が見つかりません（ID: ${recordId}）`);
    }

    await this.prisma.weightRecord.delete({
      where: { id: recordId },
    });
  }

  /**
   * 単一の体重記録を取得
   */
  async getWeightRecord(recordId: string): Promise<WeightRecordResponse> {
    const record = await this.prisma.weightRecord.findUnique({
      where: { id: recordId },
      include: {
        recorder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`体重記録が見つかりません（ID: ${recordId}）`);
    }

    return {
      id: record.id,
      catId: record.catId,
      weight: record.weight,
      recordedAt: record.recordedAt.toISOString(),
      notes: record.notes,
      recordedBy: record.recordedBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      recorder: record.recorder,
    };
  }

  /**
   * 複数の猫の体重を一括登録
   */
  async createBulkWeightRecords(
    dto: CreateBulkWeightRecordsDto,
    userId: string,
  ): Promise<BulkWeightRecordsResponse> {
    const { recordedAt, records } = dto;
    const recordedAtDate = new Date(recordedAt);

    // 全ての猫IDの存在確認
    const catIds = records.map((r) => r.catId);
    const existingCats = await this.prisma.cat.findMany({
      where: { id: { in: catIds } },
      select: { id: true },
    });

    const existingCatIds = new Set(existingCats.map((c) => c.id));
    const missingCatIds = catIds.filter((id) => !existingCatIds.has(id));

    if (missingCatIds.length > 0) {
      throw new BadRequestException(
        `以下の猫IDが見つかりません: ${missingCatIds.join(", ")}`,
      );
    }

    // トランザクションで一括登録
    const createdRecords = await this.prisma.$transaction(
      records.map((record) =>
        this.prisma.weightRecord.create({
          data: {
            catId: record.catId,
            weight: record.weight,
            recordedAt: recordedAtDate,
            notes: record.notes,
            recordedBy: userId,
          },
          include: {
            recorder: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ),
    );

    const responseRecords: WeightRecordResponse[] = createdRecords.map((r) => ({
      id: r.id,
      catId: r.catId,
      weight: r.weight,
      recordedAt: r.recordedAt.toISOString(),
      notes: r.notes,
      recordedBy: r.recordedBy,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      recorder: r.recorder,
    }));

    return {
      success: true,
      created: createdRecords.length,
      records: responseRecords,
    };
  }

  /**
   * 複数の猫の体重記録履歴を一括取得（テーブル表示用）
   */
  async getWeightRecordsForKittens(
    catIds: string[],
    limit: number = 8,
  ): Promise<
    Map<
      string,
      Array<{
        id: string;
        weight: number;
        recordedAt: string;
        notes: string | null;
      }>
    >
  > {
    // 各猫の最新N件の体重記録を取得
    const records = await this.prisma.weightRecord.findMany({
      where: { catId: { in: catIds } },
      orderBy: { recordedAt: "desc" },
      select: {
        id: true,
        catId: true,
        weight: true,
        recordedAt: true,
        notes: true,
      },
    });

    // 猫ごとにグループ化し、最新N件に制限
    const result = new Map<
      string,
      Array<{
        id: string;
        weight: number;
        recordedAt: string;
        notes: string | null;
      }>
    >();

    for (const catId of catIds) {
      const catRecords = records
        .filter((r) => r.catId === catId)
        .slice(0, limit)
        .map((r) => ({
          id: r.id,
          weight: r.weight,
          recordedAt: r.recordedAt.toISOString(),
          notes: r.notes,
        }));
      result.set(catId, catRecords);
    }

    return result;
  }

  /**
   * 猫の家族情報を取得（血統タブ用）
   * - 父母情報（Pedigreeがある場合は祖父母・曾祖父母も含む）
   * - 兄弟姉妹（両親が一致する猫のみ）
   * - 子猫一覧
   */
  async getCatFamily(id: string): Promise<CatFamilyResponse> {
    // 猫の詳細情報を取得
    const cat = await this.prisma.cat.findUnique({
      where: { id },
      include: {
        breed: { select: { id: true, name: true } },
        coatColor: { select: { id: true, name: true } },
        father: {
          include: {
            breed: { select: { id: true, name: true } },
            coatColor: { select: { id: true, name: true } },
            pedigree: true,
          },
        },
        mother: {
          include: {
            breed: { select: { id: true, name: true } },
            coatColor: { select: { id: true, name: true } },
            pedigree: true,
          },
        },
        pedigree: true,
      },
    });

    if (!cat) {
      throw new NotFoundException(`猫が見つかりません（ID: ${id}）`);
    }

    // 父親情報の構築
    const father = this.buildParentInfo(cat.father, "father");

    // 母親情報の構築
    const mother = this.buildParentInfo(cat.mother, "mother");

    // 兄弟姉妹を取得（両親が一致する猫のみ）
    let siblings: SiblingInfo[] = [];
    if (cat.fatherId && cat.motherId) {
      const siblingCats = await this.prisma.cat.findMany({
        where: {
          fatherId: cat.fatherId,
          motherId: cat.motherId,
          id: { not: cat.id }, // 自分自身を除外
        },
        include: {
          breed: { select: { id: true, name: true } },
          coatColor: { select: { id: true, name: true } },
          pedigree: { select: { pedigreeId: true } },
        },
        orderBy: { birthDate: "asc" },
      });

      siblings = siblingCats.map((sibling) => ({
        id: sibling.id,
        name: sibling.name,
        gender: sibling.gender,
        birthDate: sibling.birthDate.toISOString(),
        breed: sibling.breed,
        coatColor: sibling.coatColor,
        pedigreeId: sibling.pedigree?.pedigreeId ?? null,
      }));
    }

    // 子猫を取得（この猫が親の場合）
    const offspringCats = await this.prisma.cat.findMany({
      where: {
        OR: [
          { fatherId: cat.id },
          { motherId: cat.id },
        ],
      },
      include: {
        breed: { select: { id: true, name: true } },
        coatColor: { select: { id: true, name: true } },
        pedigree: { select: { pedigreeId: true } },
        father: {
          select: {
            id: true,
            name: true,
            gender: true,
            pedigree: { select: { pedigreeId: true } },
          },
        },
        mother: {
          select: {
            id: true,
            name: true,
            gender: true,
            pedigree: { select: { pedigreeId: true } },
          },
        },
      },
      orderBy: { birthDate: "desc" },
    });

    const offspring: OffspringInfo[] = offspringCats.map((child) => {
      // この猫がオスなら母親を、メスなら父親を相手の親として返す
      const isFather = child.fatherId === cat.id;
      const otherParentData = isFather ? child.mother : child.father;

      return {
        id: child.id,
        name: child.name,
        gender: child.gender,
        birthDate: child.birthDate.toISOString(),
        breed: child.breed,
        coatColor: child.coatColor,
        pedigreeId: child.pedigree?.pedigreeId ?? null,
        otherParent: otherParentData
          ? {
              id: otherParentData.id,
              name: otherParentData.name,
              gender: otherParentData.gender,
              pedigreeId: otherParentData.pedigree?.pedigreeId ?? null,
            }
          : null,
      };
    });

    return {
      cat: {
        id: cat.id,
        name: cat.name,
        gender: cat.gender,
        birthDate: cat.birthDate.toISOString(),
        pedigreeId: cat.pedigree?.pedigreeId ?? null,
        breed: cat.breed,
        coatColor: cat.coatColor,
      },
      father,
      mother,
      siblings,
      offspring,
    };
  }

  /**
   * 親情報を構築（Pedigreeから祖父母・曾祖父母情報を含む）
   */
  private buildParentInfo(
    parent: {
      id: string;
      name: string;
      gender: string;
      birthDate: Date;
      breed: { id: string; name: string } | null;
      coatColor: { id: string; name: string } | null;
      pedigree: {
        pedigreeId: string;
        // 父方の祖父母
        ffTitle: string | null;
        ffCatName: string | null;
        ffCatColor: string | null;
        ffjcu: string | null;
        fmTitle: string | null;
        fmCatName: string | null;
        fmCatColor: string | null;
        fmjcu: string | null;
        // 母方の祖父母
        mfTitle: string | null;
        mfCatName: string | null;
        mfCatColor: string | null;
        mfjcu: string | null;
        mmTitle: string | null;
        mmCatName: string | null;
        mmCatColor: string | null;
        mmjcu: string | null;
        // 父方の曾祖父母
        fffTitle: string | null;
        fffCatName: string | null;
        fffCatColor: string | null;
        fffjcu: string | null;
        ffmTitle: string | null;
        ffmCatName: string | null;
        ffmCatColor: string | null;
        ffmjcu: string | null;
        fmfTitle: string | null;
        fmfCatName: string | null;
        fmfCatColor: string | null;
        fmfjcu: string | null;
        fmmTitle: string | null;
        fmmCatName: string | null;
        fmmCatColor: string | null;
        fmmjcu: string | null;
        // 母方の曾祖父母
        mffTitle: string | null;
        mffCatName: string | null;
        mffCatColor: string | null;
        mffjcu: string | null;
        mfmTitle: string | null;
        mfmCatName: string | null;
        mfmCatColor: string | null;
        mfmjcu: string | null;
        mmfTitle: string | null;
        mmfCatName: string | null;
        mmfCatColor: string | null;
        mmfjcu: string | null;
        mmmTitle: string | null;
        mmmCatName: string | null;
        mmmCatColor: string | null;
        mmmjcu: string | null;
        // 親の親情報
        fatherJCU: string | null;
        fatherCatName: string | null;
        fatherCoatColor: string | null;
        fatherTitle: string | null;
        motherJCU: string | null;
        motherCatName: string | null;
        motherCoatColor: string | null;
        motherTitle: string | null;
      } | null;
    } | null,
    _position: "father" | "mother",
  ): ParentInfo | null {
    if (!parent) {
      return null;
    }

    const pedigree = parent.pedigree;

    // 父方の祖父母情報を構築
    const fatherAncestor: AncestorInfo | null = pedigree
      ? {
          pedigreeId: pedigree.fatherJCU,
          catName: pedigree.fatherCatName,
          coatColor: pedigree.fatherCoatColor,
          title: pedigree.fatherTitle,
          jcu: pedigree.fatherJCU,
        }
      : null;

    // 母方の祖父母情報を構築
    const motherAncestor: AncestorInfo | null = pedigree
      ? {
          pedigreeId: pedigree.motherJCU,
          catName: pedigree.motherCatName,
          coatColor: pedigree.motherCoatColor,
          title: pedigree.motherTitle,
          jcu: pedigree.motherJCU,
        }
      : null;

    return {
      id: parent.id,
      pedigreeId: pedigree?.pedigreeId ?? null,
      name: parent.name,
      gender: parent.gender,
      birthDate: parent.birthDate.toISOString(),
      breed: parent.breed,
      coatColor: parent.coatColor,
      father: fatherAncestor,
      mother: motherAncestor,
    };
  }
}
````

## File: backend/src/coat-colors/dto/coat-color-query.dto.ts
````typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsInt, IsIn, Min, Max } from "class-validator";

export class CoatColorQueryDto {
  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 50, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ description: "検索キーワード" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "ソート項目", default: "name" })
  @IsOptional()
  @IsString()
  @IsIn(["name", "nameEn", "colorCode", "category", "createdAt", "updatedAt", "code"])
  sortBy?: string = "name";

  @ApiPropertyOptional({ description: "ソート順", default: "asc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";
}
````

## File: backend/src/coat-colors/dto/create-coat-color.dto.ts
````typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsOptional, MaxLength, IsInt, Min, Max } from "class-validator";

export class CreateCoatColorDto {
  @ApiProperty({ description: "毛色コード" })
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  code: number;

  @ApiProperty({ description: "毛色名" })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: "毛色の説明" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
````

## File: backend/src/coat-colors/dto/index.ts
````typescript
export * from "./create-coat-color.dto";
export * from "./update-coat-color.dto";
export * from "./coat-color-query.dto";
````

## File: backend/src/coat-colors/dto/update-coat-color.dto.ts
````typescript
import { PartialType } from "@nestjs/mapped-types";

import { CreateCoatColorDto } from "./create-coat-color.dto";

export class UpdateCoatColorDto extends PartialType(CreateCoatColorDto) {}
````

## File: backend/src/coat-colors/coat-color-master.data.ts
````typescript
/**
 * Pedigreesテーブルのcoat-colorsリレーションで利用する色柄マスターデータ。
 * 元データ: 色柄データUTF8Ver.csv（ヘッダー: キー, 毛色名称 / BOM付）
 * 本ファイルではヘッダーを code / name に置き換え、CSV原本の並びと値をそのまま保持する。
 */

export interface CoatColorMasterRecord {
  code: number;
  name: string;
}

const RAW_COAT_COLOR_CSV = `
code,name
0,
1,White
2,Blue
3,Black
4,Red
5,Peke-Face Red
6,Cream
7,Cameo
8,Ruddy
9,Fawn
10,Sable
11,Champagne
12,Platinum
13,Blue Gray
14,Silver
15,Bronze
16,Lilac
17,Chocolate
18,Brown
19,Lavender
20,Blue Silver
21,Sepia Agouti
22,Ebony
23,Chestnut
24,Shell Cameo
30,Tortoiseshell
31,Blue Cream
32,Calico
33,Dilute Calico
34,Mike Tri Color
35,Blue-White
36,Black-White
37,Red-White
38,Cream-White
39,Cameo-White
40,Tortoiseshell-White
41,Blue Cream-White
42,Blue-White Van
43,Black-White Van
44,Red-White Van
45,Cream-White Van
46,Cameo-White Van
47,Van Calico
48,Dilute Calico Van
49,Blue Smoke-White
50,Black Smoke-White
51,Cream Smoke-White
52,Tortie Smoke-White
53,Blue Cream Smoke-White
54,Cameo Red Smoke-White
60,Chinchilla Silver
61,Chinchilla Golden
62,Shaded Silver
63,Shaded Golden
64,Blue Chinchilla Silver
65,Blue Shaded Silver
66,Shaded Cameo
70,Black Smoke
71,Blue Smoke
72,Tortie Smoke
73,Cream Smoke
74,Blue Cream Smoke
75,Cameo Smoke
80,Seal Point
81,Blue Point
82,Lilac Point
83,Red Point
84,Chocolate Point
85,Cream Point
86,Tortie Point
87,Blue Cream Point
88,Lilac Cream Point
89,Seal Tortie Point
90,Choco Tortie Point
91,Flame Point
100,Seal Lynx Point
101,Blue Lynx Point
102,Brown Lynx Point
103,Lilac Lynx Point
104,Red Lynx Point
105,Chocolate Lynx Point
106,Cream Lynx Point
107,Seal Tortie Lynx Point
108,Choco Tortie Lynx Point
109,Blue Cream Lynx Point
110,Lilac Cream Lynx Point
120,Seal Point Mitted
121,Blue Point Mitted
130,Silver Tabby
131,Silver Mackerel Tabby
132,Brown Tabby
133,Brown Mackerel Tabby
134,Blue Tabby
135,Blue Mackerel Tabby
136,Red Tabby
137,Red Mackerel Tabby
138,Cream Tabby
139,Cream Mackerel Tabby
140,Cameo Tabby
141,Cameo Mackerel Tabby
142,Peke-Face Red Tabby
143,Peke-Face Red Mc Tabby
144,Golden Tabby
145,Golden Mc Tabby
146,Chestnut Tabby
147,Lavender Tabby
148,Ebony Tabby
149,Fawn Tabby
150,Cinnamon Tabby
151,Blue Silver Tabby
152,Chestnut Silver Tabby
153,Silver Ticked Tabby
154,Brown Ticked Tabby
155,Blue Ticked Tabby
160,Silver Patched Tabby
161,Silver Patched Mc Tabby
162,Brown Patched Tabby
163,Brown Patched Mc Tabby
165,Blue Patched Tabby
166,Blue Patched Mc Tabby
167,Cinnamon Patched Tabby
168,Ebony Patched Tabby
169,Chestnut Patched Tabby
170,Lavender Patched Tabby
171,Fawn Patched Tabby
180,Silver Tabby-White
181,Silver Mc Tabby-White
182,Brown Tabby-White
183,Brown Mc Tabby-White
184,Blue Tabby-White
185,Blue Mc Tabby-White
186,Red Tabby-White
187,Red Mc Tabby-White
188,P-F Red Tabby-White
189,P-F Red Mc Tabby-White
190,Cream Tabby-White
191,Cream Mc Tabby-White
192,Cameo Tabby-White
193,Cameo Mc Tabby-White
194,Silver Tc Tabby-White
195,Brown Tc Tabby-White
196,Blue Tc Tabby-White
200,Silver Pt Tabby-White
201,Silver Pt Mc Tabby-White
202,Brown Pt Tabby-White
203,Brown Pt Mc Tabby-White
204,Blue Pt Tabby-White
205,Blue Pt Mc Tabby-White
206,Silver Tabby-White Van
207,Silver Mc Tabby-W Van
208,Brown Tabby-White Van
209,Brown Mc Tabby-White Van
210,Blue Tabby-White Van
211,Blue Mc Tabby-White Van
212,Red Tabby-White Van
213,Red Mc Tabby-White Van
214,Cream Tabby-White Van
215,Cream Mc Tabby-White Van
216,Cameo Tabby-White Van
217,Cameo Mc Tabby-White Van
220,Silver Pt Tabby-W Van
221,Silver Pt Mc Tabby-W Van
222,Brown Pt Tabby-White Van
223,Brown Pt Mc Tabby-W Van
224,Blue Pt Tabby-White Van
225,Blue Pt Mc Tabby-W Van
230,Silver Spotted Tabby
231,Brown Spotted Tabby
232,Red Spotted Tabby
233,Blue Spotted Tabby
234,Cream Spotted Tabby
235,Tawny Spotted Tabby
236,Cinnamon Spotted Tabby
237,Fawn Spotted Tabby
238,Chocolate Spotted Tabby
239,Lavender Spotted Tabby
240,Silver Sp Tabby-White
241,Brown Sp Tabby-White
242,Red Sp Tabby-White
243,Blue Sp Tabby-White
244,Cream Sp Tabby-White
250,Leopard
260,Any Other Color
261,AOV
270,Silver Pt Sp Tabby
271,Brown Pt Sp Tabby
272,Blue Pt Sp Tabby
273,Silver Pt Sp Tabby-White
274,Brown Pt Sp Tabby-White
275,Blue Pt Sp Tabby-White
276,Blue Smoke-White Van
277,Black Smoke-White Van
278,Cream Smoke-White Van
279,Tortie Smoke-White Van
280,Blue Cream Smoke-White Van
281,Cameo Red Smoke-White Van
282,Silver Ticked Tabby-White
283,Brown Ticked Tabby-White
284,Chocolate Point Mitted
285,Snow
286,Blue Silver Tabby-White
287,Sorrel (Red)
288,Sorrel Spotted Tabby
289,Brown-White
290,Cinnamon
291,Seal Tortie Point
292,Seal Point Bi-Color
293,Chocolate Point Bi-Color
294,Blue Point Bi-Color
295,Lilac Point Bi-Color
296,Brown Marbled Tabby
297,Seal Point(A.O.C)
298,Blue Marble
299,Flame Point Bi-Color
300,Shell Tortoiseshell
301,Blue Tortie-White
302,Blue Silver Pt Tabby-White
303,Blue Silver Pt T-W Van
304,Shaded Tortie
305,Blue Tortie
306,Seal Lynx Point Bi-Color
307,Brown Classic Tobie
308,Tortie Point Bi-Color
309,Chocolate Tortie Point Bi-Color
310,Blue Silver Mc Tabby
311,Shaded Cameo-White
312,Calico Smoke
313,Smoke Dilute Calico
314,Red Point Bi-Color
315,Cream Point Bi-Color
316,Silver Classic Tobie
317,Silver Mackerel Tobie
318,Brown Mackerel Tobie
319,Blue Tortie Point Mitted
320,Lilac Point Mitted
321,Blue Tortie Point Bi-Color
322,Blue Silver Mc Tabby-White
323,Red Point Mitted
324,Smoke
325,Ebony Silver
326,Shaded Chocolate
327,Chocolate Tortie
328,Lilac Tortie
329,Cream Cameo Tabby
330,Cream Cameo Mc Tabby
331,Cream Cameo Tabby-White
332,Cream Cameo Mc Tabby-W
333,Blue Silver Tabby-W Van
334,Chocolate Lynx Point-White
335,Cream Cameo
336,Seal Tortie Point Bi-Color
337,Seal Tortie Point Mitted
338,Browm Classic Torbie-White
339,Platinum Mink(Lilac Mink)
340,Blue Silver Classic Tabby
341,Cream Shell Cameo
342,Flame Lynx Point
343,Shell Cream
344,Shaded Cream
345,Tortie Point Mitted
346,Seal Tortie Point
347,Blue Cream Point Bi-Color
348,Sable Ticked Tabby
349,Chocolate Cream P Bi-Color
350,Shell Blue(Blue Chinchilla)
351,Seal Point (A.O.C)
352,Blue Point (A.O.C)
353,Cream Point Mitted
354,Shaded Silver-White
355,Tortoiseshell-White Van
356,Champagne Mink
357,Champagne Solid 
358,Platinum Solid
359,Seal Lynx Point-White
360,Natural Point
361,Platinum Point
362,Champagne Point
363,Blue Cream Point Mitted
364,Blue Silver Patched Tabby
365,Seal Lynx Point Van Bi-C
366,Blue Lynx Point Van Bi-C
367,Flame Point Bi-Color
368,Brown Mc Tobie-White
369,Blue Lynx Point-White
370,Natural Mink (Seal Mink)
371,Chocolate Point-White
372,Blue Solid
373,Blue Mink
374,Choco Tortie Point Mitted
375,Chocolate Point Mitted
376,Blue Cream-White Van
377,Choco Silver Lynx Point-W
378,Chocolate Patched Tabby
379,Seal Point-White
380,Snow Spotted Tabby
381,Seal Tortie Point-White
382,Chocolate-White
383,Blue Point-White
384,Shell Tortoiseshell-White
385,Natural Solid
386,Cameo(Red Silver) Tabby
387,Seal Tortie Lynx Point-W
388,Blue Chinchilla Golden
389,Blue Silver Pt Mc Tabby-W
390,Blue Silver Pt Mc Tabby
391,Red Lynx Point-White
392,Chocolate Silver Spotted Tabby
393,Ebony Silver Ticked T
394,Shaded Tortie-White
395,Black Brown Spotted Tabby
396,Ebony Silver Mc Tabby
397,Red Silver(Cameo)Tabby-W
398,Chocolate Tabby
399,Blue Silver Spotted Tabby
400,Cinnamon-White
401,Blue Ticked Tabby-White
402,Chestnut Tortie
403,Flame Point Mitted
404,Chestnut Tortie-White
405,Chestnut Tortie Point-W
406,Choco Silver Tortie Lynx Point 
407,Brown Sp Tabby (Rosettes)
408,Choco Tortie Lynx Point Mitted
409,Shell Cameo-White
410,Ebony Smoke
411,Ebony Tabby
412,Ebony Mackerel Tabby
413,Red Point-White
414,Chinchilla Silver-White
415,Chinchilla Golden-White
416,Red Ticked Tabby
417,Cream Ticked Tabby
418,Chocolate Lynx Point (AOC)
419,Chocolate Pt Tabby-White
420,Cream Silver Tabby-White
421,Smoke Calico Van
422,Cameo Spotted Tabby
423,Blue Silver Pt Sp Tabby
424,Ebony Silver Spotted Tabby
425,Silver Marbled Tabby
426,Blue Silver Sp Tabby-W
427,Cream Point-White
428,Lilac-White
429,Choco Cream Point
430,Choco Tortie Lynx Point-W
431,Choco Cream Lynx Point-W
432,Ebony-White
433,Ebony Silver Ticked T-W
434,Ebony Silver Tabby-White
435,Seal Mink Spotted Tabby
436,Cinnamon Tabby(AOC)
437,Cream Classic Tabby-White
438,Blue Classic Tabby-White
439,Smoke Tortoiseshell
440,Lilac Point-White
441,Lilac Tabby
442,Cinnamon Mackerel Tabby
443,Chocolate Tortie Lynx Point-White
444,Blue Spotted
445,Blue Cream Point-White
446,Brown Pt Ticked Tabby-W
447,Black(A.O.C)
448,Blue Shaded
449,Cream Cameo Tabby-White Van
450,Blue Silver-White
451,Silver Lynx Point
452,Blue Lynx Point Bi-Color
453,Lilac Point Bi-Color
454,Chocolate Tortie Lynx Point
455,Lilac Cream
456,Seal Bi-Color
457,Blue Cream Lynx Point-White
458,Smoke Calico
459,Brown Pt Ticked Tabby
460,Blue Silver Pt Tabby-White Van
461,Black Silver Spotted Tabby
462,Silver Pt Tc Tabby-White
463,Lilac Tortie Point Mitted
464,Lilac Cream Point-White
465,Seal Tortie Lynx Point-White
466,Brown Classic Tabby-White
467,Brown Ticked Pt Tabby
468,Lilac Silver Tabby-White
469,Cream Lynx Point Bi-Color
470,Black(AOC)
471,Cinnamon Ticked Tabby
472,Chocolate Lynx Point Bi-Color
473,Silver Pt Ticked Tabby
474,Seal Mink
475,Shaded Tortie Lynx Point-White
476,Silver Patched Ticked Tabby
477,Brown Patched Sp Tabby
478,Blue Tortie Point
479,Black Silver Marbled Tabby
480,Lilac Tabby-White
481,Shell Tortoiseshell
482,Silver Classic Tabby
483,Seal Tortie Lynx Point Bi-Color
484,Seal Tortie Lynx Point Mitted
485,Silver-White
486,Shaded Golden-White
487,Cream Ticked Tabby-White
488,Blue Shaded Golden
489,Lilac Tortie Lynx Point Mitted
490,Tortie Point-White
491,Flame Point-White
492,Blue Silver Ticked Tabby
493,Blue Lynx Point Mitted
`;

const parseCoatColorMasterData = (): ReadonlyArray<CoatColorMasterRecord> => {
  const [, ...lines] = RAW_COAT_COLOR_CSV.trim().split(/\r?\n/);

  return lines
    .filter((line) => line.length > 0)
    .map((line) => {
      const [codePart, ...nameParts] = line.split(",");
      const code = Number.parseInt(codePart.trim(), 10);
      if (Number.isNaN(code)) {
        throw new Error(`Invalid coat color code detected: ${line}`);
      }
      const name = nameParts.join(",");
      return { code, name };
    });
};

export const COAT_COLOR_MASTER_DATA: ReadonlyArray<CoatColorMasterRecord> =
  Object.freeze(parseCoatColorMasterData());

const COAT_COLOR_MASTER_MAP_ENTRIES = COAT_COLOR_MASTER_DATA.map(
  (record) => [record.code, record] as const,
);

export const COAT_COLOR_MASTER_MAP: ReadonlyMap<number, CoatColorMasterRecord> =
  new Map(COAT_COLOR_MASTER_MAP_ENTRIES);

export const findCoatColorByCode = (
  code: number,
): CoatColorMasterRecord | undefined => COAT_COLOR_MASTER_MAP.get(code);
````

## File: backend/src/coat-colors/coat-colors.controller.spec.ts
````typescript
import { Test, TestingModule } from '@nestjs/testing';

import { DisplayPreferencesService } from '../display-preferences/display-preferences.service';
import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { CoatColorsController } from './coat-colors.controller';
import { CoatColorsService } from './coat-colors.service';

describe('CoatColorsController', () => {
  let controller: CoatColorsController;
  let service: CoatColorsService;

  const mockCoatColorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getMasterData: jest.fn(),
  };
  const mockDisplayPreferencesService = {
    getPreferences: jest.fn(),
    buildPersonalizedCoatColorRecords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [CoatColorsController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: CoatColorsService,
          useValue: mockCoatColorsService,
        },
        {
          provide: DisplayPreferencesService,
          useValue: mockDisplayPreferencesService,
        },
      ],
    }).compile();

    controller = module.get<CoatColorsController>(CoatColorsController);
    service = module.get<CoatColorsService>(CoatColorsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a coat color', async () => {
      const createDto = { code: 1, name: 'Black', description: 'Solid black' };
      const mockColor = { id: '1', ...createDto };

      mockCoatColorsService.create.mockResolvedValue(mockColor);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockColor);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated coat colors', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Black' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCoatColorsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a coat color by id', async () => {
      const mockColor = { id: '1', name: 'Black' };

      mockCoatColorsService.findOne.mockResolvedValue(mockColor);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockColor);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a coat color', async () => {
      const updateDto = { name: 'Updated Black' };
      const mockColor = { id: '1', name: 'Updated Black' };

      mockCoatColorsService.update.mockResolvedValue(mockColor);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockColor);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a coat color', async () => {
      mockCoatColorsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getMasterData', () => {
    it('should return master data via service', async () => {
      const mockMaster = [{ code: 1, name: 'White' }];
      mockCoatColorsService.getMasterData.mockResolvedValue(mockMaster);

      const result = await controller.getMasterData(undefined);

      expect(result).toEqual(mockMaster);
      expect(service.getMasterData).toHaveBeenCalled();
    });
  });
});
````

## File: backend/src/coat-colors/coat-colors.controller.ts
````typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiExtraModels,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../auth/roles.decorator";
import { DisplayPreferencesService } from "../display-preferences/display-preferences.service";
import { MasterDataItemDto } from "../display-preferences/dto/master-data-item.dto";

import { CoatColorsService } from "./coat-colors.service";
import {
  CreateCoatColorDto,
  UpdateCoatColorDto,
  CoatColorQueryDto,
} from "./dto";


@ApiExtraModels(MasterDataItemDto)
@ApiTags("Coat Colors")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("coat-colors")
export class CoatColorsController {
  constructor(
    private readonly coatColorsService: CoatColorsService,
    private readonly displayPreferences: DisplayPreferencesService,
  ) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "毛色データを作成（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "毛色データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  create(@Body() createCoatColorDto: CreateCoatColorDto) {
    return this.coatColorsService.create(createCoatColorDto);
  }

  @Get()
  @ApiOperation({ summary: "毛色データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "毛色データの一覧" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 50,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード" })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "name",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "asc",
  })
  findAll(@Query() query: CoatColorQueryDto) {
    return this.coatColorsService.findAll(query);
  }

  @Get("master-data")
  @ApiOperation({ summary: "Pedigree連携用の色柄マスターデータを取得" })
  @ApiOkResponse({
    description: "CSV マスターデータを displayName / displayNameMode 付きで返却",
    type: MasterDataItemDto,
    isArray: true,
  })
  async getMasterData(@GetUser() user: RequestUser | undefined) {
    if (!user) {
      return this.coatColorsService.getMasterData();
    }

    const preference = await this.displayPreferences.getPreferences(user.userId);
    const personalized =
      await this.displayPreferences.buildPersonalizedCoatColorRecords(preference);

    return personalized.map((record) => ({
      code: record.code,
      name: record.canonicalName,
      displayName: record.displayName,
      displayNameMode: preference.coatColorNameMode,
      isOverridden: record.isOverridden,
    }));
  }

  @Get("statistics")
  @ApiOperation({ summary: "毛色データの統計情報を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "統計情報" })
  getStatistics() {
    return this.coatColorsService.getStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで毛色データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "毛色データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "毛色データが見つかりません",
  })
  @ApiParam({ name: "id", description: "毛色データのID" })
  findOne(@Param("id") id: string) {
    return this.coatColorsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "毛色データを更新（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "毛色データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "毛色データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "毛色データのID" })
  update(
    @Param("id") id: string,
    @Body() updateCoatColorDto: UpdateCoatColorDto,
  ) {
    return this.coatColorsService.update(id, updateCoatColorDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "毛色データを削除（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "毛色データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "毛色データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "毛色データのID" })
  remove(@Param("id") id: string) {
    return this.coatColorsService.remove(id);
  }
}
````

## File: backend/src/coat-colors/coat-colors.module.ts
````typescript
import { Module } from "@nestjs/common";

import { DisplayPreferencesModule } from "../display-preferences/display-preferences.module";
import { PrismaModule } from "../prisma/prisma.module";

import { CoatColorsController } from "./coat-colors.controller";
import { CoatColorsService } from "./coat-colors.service";

@Module({
  imports: [PrismaModule, DisplayPreferencesModule],
  controllers: [CoatColorsController],
  providers: [CoatColorsService],
  exports: [CoatColorsService],
})
export class CoatColorsModule {}
````

## File: backend/src/coat-colors/coat-colors.service.spec.ts
````typescript
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { CoatColorsService } from './coat-colors.service';


describe('CoatColorsService', () => {
  let service: CoatColorsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    coatColor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cat: {
      count: jest.fn(),
    },
    pedigree: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoatColorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoatColorsService>(CoatColorsService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a coat color successfully', async () => {
      const createDto = {
        code: 1,
        name: 'Black',
        description: 'Solid black coat',
      };

      const mockColor = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coatColor.create.mockResolvedValue(mockColor);

      const result = await service.create(createDto);

      expect(result).toEqual(mockColor);
      expect(mockPrismaService.coatColor.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated coat colors', async () => {
      const mockColors = [
        { id: '1', name: 'Black' },
        { id: '2', name: 'White' },
      ];

      mockPrismaService.coatColor.findMany.mockResolvedValue(mockColors);
      mockPrismaService.coatColor.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockColors);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a coat color by id', async () => {
      const mockColor = { id: '1', name: 'Black' };

      mockPrismaService.coatColor.findUnique.mockResolvedValue(mockColor);

      const result = await service.findOne('1');

      expect(result).toEqual(mockColor);
    });

    it('should throw NotFoundException when coat color not found', async () => {
      mockPrismaService.coatColor.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a coat color successfully', async () => {
      const updateDto = { name: 'Updated Black' };
      const mockColor = { id: '1', name: 'Updated Black' };

      mockPrismaService.coatColor.findUnique.mockResolvedValue({ id: '1', name: 'Black' });
      mockPrismaService.coatColor.update.mockResolvedValue(mockColor);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockColor);
      expect(mockPrismaService.coatColor.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a coat color successfully', async () => {
      const mockColor = { id: '1', name: 'Black' };

      mockPrismaService.coatColor.findUnique.mockResolvedValue(mockColor);
      mockPrismaService.cat.count.mockResolvedValue(0);
      mockPrismaService.pedigree.count.mockResolvedValue(0);
      mockPrismaService.coatColor.delete.mockResolvedValue(mockColor);

      await service.remove('1');

      expect(mockPrismaService.coatColor.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('getMasterData', () => {
    it('should return coat color master data from prisma', async () => {
      const mockMaster = [
        { code: 1, name: 'White' },
        { code: 2, name: 'Blue' },
      ];

      mockPrismaService.coatColor.findMany.mockResolvedValue(mockMaster);

      const result = await service.getMasterData();

      expect(mockPrismaService.coatColor.findMany).toHaveBeenCalledWith({
        select: { code: true, name: true },
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });
      expect(result).toEqual(mockMaster);
    });
  });
});
````

## File: backend/src/coat-colors/coat-colors.service.ts
````typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  CreateCoatColorDto,
  UpdateCoatColorDto,
  CoatColorQueryDto,
} from "./dto";

export type CoatColorMasterRecord = {
  code: number;
  name: string;
};

@Injectable()
export class CoatColorsService {
  constructor(private prisma: PrismaService) {}

  async create(createCoatColorDto: CreateCoatColorDto) {
    return this.prisma.coatColor.create({
      data: createCoatColorDto,
    });
  }

  async findAll(query: CoatColorQueryDto) {
    const {
      page = 1,
      limit = 50,
      search,
      sortBy = "name",
      sortOrder = "asc",
    } = query;

  const skip = (page - 1) * limit;
  const where: Prisma.CoatColorWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    type Sortable = "name" | "createdAt" | "updatedAt" | "code";
    const sortMap: Record<string, Sortable> = {
      name: "name",
      nameEn: "name", // フィールドがないため name へフォールバック
      colorCode: "code",
      category: "name", // モデルにないため name へフォールバック
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };
    const sortKey = sortMap[sortBy] ?? "name";

    const [colors, total] = await Promise.all([
      this.prisma.coatColor.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              cats: true,
            },
          },
        },
        orderBy: { [sortKey]: sortOrder } as Prisma.CoatColorOrderByWithRelationInput,
      }),
      this.prisma.coatColor.count({ where }),
    ]);

    return {
      data: colors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const color = await this.prisma.coatColor.findUnique({
      where: { id },
      include: {
        cats: {
          include: {
            breed: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            cats: true,
          },
        },
      },
    });

    if (!color) {
      throw new NotFoundException(`Coat color with ID ${id} not found`);
    }

    return color;
  }

  async update(id: string, updateCoatColorDto: UpdateCoatColorDto) {
    const existingColor = await this.prisma.coatColor.findUnique({
      where: { id },
    });

    if (!existingColor) {
      throw new NotFoundException(`Coat color with ID ${id} not found`);
    }

    return this.prisma.coatColor.update({
      where: { id },
      data: updateCoatColorDto,
    });
  }

  async remove(id: string) {
    const existingColor = await this.prisma.coatColor.findUnique({
      where: { id },
    });

    if (!existingColor) {
      throw new NotFoundException(`Coat color with ID ${id} not found`);
    }

    // Check if color is being used
    const [catCount, pedigreeCount] = await Promise.all([
      this.prisma.cat.count({ where: { coatColorId: id } }),
      this.prisma.pedigree.count({ where: { coatColorCode: parseInt(id) } }),
    ]);

    if (catCount > 0 || pedigreeCount > 0) {
      throw new NotFoundException(
        `Cannot delete coat color: ${catCount} cats and ${pedigreeCount} pedigrees are using this color`,
      );
    }

    return this.prisma.coatColor.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [totalColors, mostPopularColors, colorDistribution] =
      await Promise.all([
        this.prisma.coatColor.count(),
        this.prisma.coatColor.findMany({
          include: {
            _count: {
              select: {
                cats: true,
              },
            },
          },
          orderBy: {
            cats: {
              _count: "desc",
            },
          },
          take: 10,
        }),
        this.prisma.cat.groupBy({
          by: ["coatColorId"],
          _count: true,
          orderBy: {
            _count: {
              coatColorId: "desc",
            },
          },
        }),
      ]);

    return {
      totalColors,
      mostPopularColors,
      colorDistribution,
    };
  }

  async getMasterData(): Promise<CoatColorMasterRecord[]> {
    return this.prisma.coatColor.findMany({
      select: { code: true, name: true },
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
  }
}
````

## File: backend/src/gallery/dto/add-media.dto.ts
````typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

import { MediaTypeDto } from './create-gallery-entry.dto';

/**
 * メディア追加 DTO
 */
export class AddMediaDto {
  @ApiProperty({ enum: MediaTypeDto, description: 'メディアタイプ' })
  @IsEnum(MediaTypeDto)
  type: MediaTypeDto;

  @ApiProperty({ description: 'メディアURL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'サムネイルURL（YouTube用）' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
````

## File: backend/src/gallery/dto/create-gallery-entry.dto.ts
````typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';

/**
 * ギャラリーカテゴリ
 */
export enum GalleryCategoryDto {
  KITTEN = 'KITTEN',
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GRADUATION = 'GRADUATION',
}

/**
 * メディアタイプ
 */
export enum MediaTypeDto {
  IMAGE = 'IMAGE',
  YOUTUBE = 'YOUTUBE',
}

/**
 * メディア作成 DTO
 */
export class CreateMediaDto {
  @ApiProperty({ enum: MediaTypeDto, description: 'メディアタイプ' })
  @IsEnum(MediaTypeDto)
  type: MediaTypeDto;

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

/**
 * ギャラリーエントリ作成 DTO
 */
export class CreateGalleryEntryDto {
  @ApiProperty({ enum: GalleryCategoryDto, description: 'カテゴリ' })
  @IsEnum(GalleryCategoryDto)
  category: GalleryCategoryDto;

  @ApiProperty({ description: '猫の名前' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '性別',
    enum: ['MALE', 'FEMALE', 'NEUTER', 'SPAY'],
  })
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

  @ApiPropertyOptional({
    description: 'メディア（画像・動画）',
    type: [CreateMediaDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[];
}
````

## File: backend/src/gallery/dto/gallery-query.dto.ts
````typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

import { GalleryCategoryDto } from './create-gallery-entry.dto';

/**
 * ギャラリー一覧取得用クエリ DTO
 */
export class GalleryQueryDto {
  @ApiPropertyOptional({ enum: GalleryCategoryDto, description: 'カテゴリフィルター' })
  @IsOptional()
  @IsEnum(GalleryCategoryDto)
  category?: GalleryCategoryDto;

  @ApiPropertyOptional({ default: 1, description: 'ページ番号' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, description: '1ページあたりの件数' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
````

## File: backend/src/gallery/dto/index.ts
````typescript
export * from './create-gallery-entry.dto';
export * from './update-gallery-entry.dto';
export * from './gallery-query.dto';
export * from './add-media.dto';
````

## File: backend/src/gallery/dto/update-gallery-entry.dto.ts
````typescript
import { PartialType } from '@nestjs/swagger';

import { CreateGalleryEntryDto } from './create-gallery-entry.dto';

/**
 * ギャラリーエントリ更新 DTO
 */
export class UpdateGalleryEntryDto extends PartialType(CreateGalleryEntryDto) {}
````

## File: backend/src/gallery/gallery.controller.ts
````typescript
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
````

## File: backend/src/gallery/gallery.module.ts
````typescript
import { Module } from '@nestjs/common';

import { GalleryUploadModule } from '../gallery-upload/gallery-upload.module';
import { PrismaModule } from '../prisma/prisma.module';

import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

/**
 * ギャラリーモジュール
 * ギャラリーエントリの CRUD 機能を提供
 */
@Module({
  imports: [PrismaModule, GalleryUploadModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
````

## File: backend/src/gallery/gallery.service.ts
````typescript
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
````

## File: backend/src/gallery-upload/dto/confirm-upload.dto.ts
````typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

/**
 * アップロード完了確認リクエスト DTO
 */
export class ConfirmUploadDto {
  @ApiProperty({
    description: 'アップロード時に発行されたファイルキー',
    example: 'gallery/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  @IsString()
  fileKey: string;

  @ApiProperty({
    description: '紐付けるギャラリーエントリID（任意）',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: '有効なUUIDを指定してください' })
  galleryEntryId?: string;
}
````

## File: backend/src/gallery-upload/dto/generate-upload-url.dto.ts
````typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsNumber, Min, Max } from 'class-validator';

/**
 * アップロード用 Signed URL 生成リクエスト DTO
 */
export class GenerateUploadUrlDto {
  @ApiProperty({ description: 'ファイル名', example: 'kitten-photo-1.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'コンテンツタイプ',
    enum: ['image/jpeg', 'image/png', 'image/webp'],
    example: 'image/jpeg',
  })
  @IsIn(['image/jpeg', 'image/png', 'image/webp'], {
    message: '対応形式は JPEG, PNG, WebP のみです',
  })
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';

  @ApiProperty({
    description: 'ファイルサイズ（バイト）',
    example: 1024000,
    minimum: 1,
    maximum: 10485760,
  })
  @IsNumber()
  @Min(1, { message: 'ファイルサイズは1バイト以上である必要があります' })
  @Max(10 * 1024 * 1024, { message: 'ファイルサイズは10MB以下である必要があります' })
  fileSize: number;
}
````

## File: backend/src/gallery-upload/dto/index.ts
````typescript
export { GenerateUploadUrlDto } from './generate-upload-url.dto';
export { ConfirmUploadDto } from './confirm-upload.dto';
````

## File: backend/src/gallery-upload/interfaces/upload-result.interface.ts
````typescript
/**
 * アップロード結果インターフェース
 */
export interface UploadResult {
  /** 操作成功フラグ */
  success: boolean;
  /** 公開URL */
  url: string;
  /** ファイルサイズ（バイト） */
  size: number;
}

/**
 * Signed URL 生成結果インターフェース
 */
export interface SignedUrlResult {
  /** アップロード用 Signed URL */
  uploadUrl: string;
  /** GCS 内のファイルキー */
  fileKey: string;
  /** アップロード後の公開URL */
  publicUrl: string;
}
````

## File: backend/src/gallery-upload/gallery-upload.controller.ts
````typescript
import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { GenerateUploadUrlDto, ConfirmUploadDto } from './dto';
import { GalleryUploadService } from './gallery-upload.service';

/**
 * ギャラリー画像アップロード用コントローラー
 * Signed URL 方式でクライアントから直接 GCS へアップロードを行う
 */
@ApiTags('Gallery Upload')
@Controller('gallery/upload')
export class GalleryUploadController {
  constructor(private readonly uploadService: GalleryUploadService) {}

  /**
   * アップロード用 Signed URL を生成
   */
  @Post('signed-url')
  @ApiOperation({
    summary: 'アップロード用Signed URLを生成',
    description: 'クライアントがGCSへ直接アップロードするためのSigned URLを発行します。有効期限は15分です。',
  })
  @ApiResponse({
    status: 201,
    description: 'Signed URL生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            uploadUrl: { type: 'string', description: 'アップロード用Signed URL' },
            fileKey: { type: 'string', description: 'GCS内のファイルキー' },
            publicUrl: { type: 'string', description: 'アップロード後の公開URL' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'パラメータエラー' })
  async generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    const result = await this.uploadService.generateUploadUrl(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * アップロード完了を確認
   */
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'アップロード完了を確認',
    description: 'クライアントがGCSへアップロード完了後に呼び出し、ファイルの存在を確認します。',
  })
  @ApiResponse({
    status: 200,
    description: '確認成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            url: { type: 'string', description: 'ファイルの公開URL' },
            size: { type: 'number', description: 'ファイルサイズ（バイト）' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ファイルが見つからない' })
  async confirmUpload(@Body() dto: ConfirmUploadDto) {
    const result = await this.uploadService.confirmUpload(dto.fileKey);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * アップロード済みファイルを削除
   */
  @Delete(':fileKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'アップロード済みファイルを削除',
    description: '指定されたファイルキーのファイルをGCSから削除します。',
  })
  @ApiParam({
    name: 'fileKey',
    description: '削除するファイルのキー（URLエンコード済み）',
    example: 'gallery%2F550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  @ApiResponse({ status: 200, description: '削除成功' })
  async deleteFile(@Param('fileKey') fileKey: string) {
    await this.uploadService.deleteFile(decodeURIComponent(fileKey));
    return {
      success: true,
      message: 'ファイルを削除しました',
    };
  }
}
````

## File: backend/src/gallery-upload/gallery-upload.module.ts
````typescript
import { Module } from '@nestjs/common';

import { GalleryUploadController } from './gallery-upload.controller';
import { GalleryUploadService } from './gallery-upload.service';

/**
 * ギャラリー画像アップロードモジュール
 * Google Cloud Storage を使用した画像アップロード機能を提供
 */
@Module({
  controllers: [GalleryUploadController],
  providers: [GalleryUploadService],
  exports: [GalleryUploadService],
})
export class GalleryUploadModule {}
````

## File: backend/src/gallery-upload/gallery-upload.service.ts
````typescript
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
````

## File: frontend/src/app/cats/[id]/edit/client.tsx
````typescript
"use client";

import { useRouter } from "next/navigation";
import { Container, Title, Paper, Group, Button, Stack, TextInput, Textarea, Select, Loader, Center, Alert } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy, IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useGetCat, useUpdateCat, useDeleteCat } from "@/lib/api/hooks/use-cats";
import { useGetBreeds } from "@/lib/api/hooks/use-breeds";
import { useGetCoatColors } from "@/lib/api/hooks/use-coat-colors";
import { useBreedMasterData, useCoatColorMasterData } from "@/lib/api/hooks/use-master-data";
import { ALPHANUM_SPACE_HYPHEN_PATTERN, MasterDataCombobox } from "@/components/forms/MasterDataCombobox";
import { useSelectionHistory } from "@/lib/hooks/use-selection-history";
import { buildMasterOptions, createDisplayNameMap } from "@/lib/master-data/master-options";
import { format } from "date-fns";

type Props = {
  catId: string;
};

// Gender options
const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NEUTER", label: "Neutered Male" },
  { value: "SPAY", label: "Spayed Female" },
];

const COAT_COLOR_DESCRIPTION = "半角英数字・スペース・ハイフンで検索できます。";

export default function CatEditClient({ catId }: Props) {
  const router = useRouter();
  const { data: cat, isLoading: isCatLoading, error: catError } = useGetCat(catId);
  const breedListQuery = useMemo(() => ({ limit: 1000, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const coatColorListQuery = useMemo(() => ({ limit: 1000, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const { data: breedsData, isLoading: isBreedsLoading } = useGetBreeds(breedListQuery);
  const { data: coatColorsData, isLoading: isCoatColorsLoading } = useGetCoatColors(coatColorListQuery);
  const { data: breedMasterData, isLoading: isBreedMasterLoading } = useBreedMasterData();
  const { data: coatMasterData, isLoading: isCoatMasterLoading } = useCoatColorMasterData();
  const { history: breedHistory, recordSelection: recordBreedSelection } = useSelectionHistory('breed');
  const { history: coatHistory, recordSelection: recordCoatSelection } = useSelectionHistory('coat-color');
  const breedDisplayMap = useMemo(() => createDisplayNameMap(breedMasterData?.data), [breedMasterData]);
  const coatDisplayMap = useMemo(() => createDisplayNameMap(coatMasterData?.data), [coatMasterData]);
  const breedOptions = useMemo(() => buildMasterOptions(breedsData?.data, breedDisplayMap), [breedsData, breedDisplayMap]);
  const coatColorOptions = useMemo(() => buildMasterOptions(coatColorsData?.data, coatDisplayMap), [coatColorsData, coatDisplayMap]);
  const updateCat = useUpdateCat(catId);
  const deleteCat = useDeleteCat();

  const [form, setForm] = useState<{
    name: string;
    gender: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
    breedId: string;
    coatColorId: string;
    birthDate: string;
    microchipNumber: string;
    registrationNumber: string;
    description: string;
  }>({
    name: "",
    gender: "MALE",
    breedId: "",
    coatColorId: "",
    birthDate: "",
    microchipNumber: "",
    registrationNumber: "",
    description: "",
  });

  // データ取得後にフォームを初期化
  useEffect(() => {
    if (cat?.data) {
      const catData = cat.data;
      setForm({
        name: catData.name || "",
        gender: catData.gender || "MALE",
        breedId: catData.breedId || "",
        coatColorId: catData.coatColorId || "",
        birthDate: catData.birthDate ? format(new Date(catData.birthDate), "yyyy-MM-dd") : "",
        microchipNumber: catData.microchipNumber || "",
        registrationNumber: catData.registrationNumber || "",
        description: catData.description || "",
      });
    }
  }, [cat]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateCat.mutateAsync({
        name: form.name,
        gender: form.gender,
        breedId: form.breedId || null,
        coatColorId: form.coatColorId || null,
        birthDate: form.birthDate,
        microchipNumber: form.microchipNumber || null,
        registrationNumber: form.registrationNumber || null,
        description: form.description || null,
      });

      router.push(`/cats/${catId}`);
    } catch (error) {
      console.error("更新エラー:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) {
      return;
    }

    try {
      await deleteCat.mutateAsync(catId);
      router.push("/cats");
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  // ローディング中
  if (isCatLoading || isBreedsLoading || isCoatColorsLoading || isBreedMasterLoading || isCoatMasterLoading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  // エラー
  if (catError || !cat) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
          猫の情報を読み込めませんでした。
        </Alert>
        <Button
          mt="md"
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push("/cats")}
        >
          一覧へ戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>猫の情報編集</Title>
        <Button
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push(`/cats/${catId}`)}
        >
          詳細へ戻る
        </Button>
      </Group>

      <Paper shadow="sm" p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="名前"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <Select
              label="性別"
              value={form.gender}
              onChange={(value) => handleChange("gender", value || "")}
              data={GENDER_OPTIONS}
              required
            />

            <MasterDataCombobox
              label="品種"
              value={form.breedId || undefined}
              onChange={(next) => handleChange("breedId", next ?? "")}
              options={breedOptions}
              historyItems={breedHistory}
              disabled={updateCat.isPending}
              loading={isBreedsLoading || isBreedMasterLoading}
              historyLabel="最近の品種"
              onOptionSelected={recordBreedSelection}
            />

            <MasterDataCombobox
              label="色柄"
              value={form.coatColorId || undefined}
              onChange={(next) => handleChange("coatColorId", next ?? "")}
              options={coatColorOptions}
              historyItems={coatHistory}
              disabled={updateCat.isPending}
              loading={isCoatColorsLoading || isCoatMasterLoading}
              historyLabel="最近の色柄"
              onOptionSelected={recordCoatSelection}
              description={COAT_COLOR_DESCRIPTION}
              sanitizePattern={ALPHANUM_SPACE_HYPHEN_PATTERN}
            />

            <TextInput
              label="生年月日"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              required
            />

            <TextInput
              label="マイクロチップ番号"
              value={form.microchipNumber}
              onChange={(e) => handleChange("microchipNumber", e.target.value)}
              placeholder="15桁の番号"
            />

            <TextInput
              label="登録番号"
              value={form.registrationNumber}
              onChange={(e) => handleChange("registrationNumber", e.target.value)}
              placeholder="血統書登録番号"
            />

            <Textarea
              label="詳細説明"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              placeholder="特記事項や性格など"
            />

            <Group justify="flex-end" gap="md" pt="md">
              <Button 
                variant="outline" 
                color="red" 
                onClick={handleDelete}
                loading={deleteCat.isPending}
              >
                削除
              </Button>
              <Button 
                type="submit" 
                leftSection={<IconDeviceFloppy size={16} />}
                loading={updateCat.isPending}
              >
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
````

## File: frontend/src/app/cats/[id]/edit/page.tsx
````typescript
import CatEditClient from './client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CatEditPage({ params }: Props) {
  const { id } = await params;
  return <CatEditClient catId={id} />;
}
````

## File: frontend/src/app/cats/[id]/pedigree/client.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Title,
  Text,
  Flex,
  Grid,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

// ダミーデータ
const pedigreeData = {
  id: '1',
  name: 'レオ',
  generation1: { // 親
    father: { name: 'パパ猫', color: '茶トラ' },
    mother: { name: 'ママ猫', color: '三毛' }
  },
  generation2: { // 祖父母
    paternalGrandfather: { name: '祖父1', color: '茶トラ' },
    paternalGrandmother: { name: '祖母1', color: '白' },
    maternalGrandfather: { name: '祖父2', color: '黒' },
    maternalGrandmother: { name: '祖母2', color: '三毛' }
  },
  generation3: { // 曾祖父母
    ppgf: { name: '曾祖父1', color: '茶トラ' }, // paternal paternal grandfather
    ppgm: { name: '曾祖母1', color: '白' },     // paternal paternal grandmother
    pmgf: { name: '曾祖父2', color: '茶' },     // paternal maternal grandfather
    pmgm: { name: '曾祖母2', color: '白' },     // paternal maternal grandmother
    mpgf: { name: '曾祖父3', color: '黒' },     // maternal paternal grandfather
    mpgm: { name: '曾祖母3', color: '灰' },     // maternal paternal grandmother
    mmgf: { name: '曾祖父4', color: '三毛' },   // maternal maternal grandfather
    mmgm: { name: '曾祖母4', color: '茶' }      // maternal maternal grandmother
  }
};

const CatCard = ({ cat, level = 0 }: { cat: { name: string; color: string } | null; level?: number }) => {
  if (!cat) {
    return (
      <Card shadow="sm" padding="sm" radius="md" withBorder style={{ minHeight: 60, opacity: 0.3 }}>
        <Text size="sm" c="dimmed">不明</Text>
      </Card>
    );
  }

  const colors = {
    0: '#e3f2fd', // 本人: ライトブルー
    1: '#f3e5f5', // 親: ライトパープル
    2: '#e8f5e8', // 祖父母: ライトグリーン
    3: '#fff3e0'  // 曾祖父母: ライトオレンジ
  };

  return (
    <Card 
      shadow="sm" 
      padding="sm" 
      radius="md" 
      withBorder 
      style={{ 
        backgroundColor: colors[level as keyof typeof colors] || '#f5f5f5',
        minHeight: 60 
      }}
    >
      <Stack gap="xs">
        <Text fw={600} size="sm">{cat.name}</Text>
        <Text size="xs" c="dimmed">{cat.color}</Text>
      </Stack>
    </Card>
  );
};

export default function PedigreeClient() {
  const router = useRouter();

  return (
  <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* ヘッダー */}
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              戻る
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container size="xl" style={{ paddingTop: '2rem' }}>
        <Title order={1} mb="lg" ta="center">
          {pedigreeData.name}の血統表（4世代）
        </Title>

        {/* 血統表グリッド */}
        <Box style={{ overflowX: 'auto' }}>
          <Grid style={{ minWidth: '1200px' }}>
            {/* 第1列: 本人 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%', justifyContent: 'center' }}>
                <CatCard cat={{ name: pedigreeData.name, color: '茶トラ' }} level={0} />
              </Stack>
            </Grid.Col>

            {/* 第2列: 親 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation1.father} level={1} />
                <CatCard cat={pedigreeData.generation1.mother} level={1} />
              </Stack>
            </Grid.Col>

            {/* 第3列: 祖父母 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation2.paternalGrandfather} level={2} />
                <CatCard cat={pedigreeData.generation2.paternalGrandmother} level={2} />
                <CatCard cat={pedigreeData.generation2.maternalGrandfather} level={2} />
                <CatCard cat={pedigreeData.generation2.maternalGrandmother} level={2} />
              </Stack>
            </Grid.Col>

            {/* 第4列: 曾祖父母 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation3.ppgf} level={3} />
                <CatCard cat={pedigreeData.generation3.ppgm} level={3} />
                <CatCard cat={pedigreeData.generation3.pmgf} level={3} />
                <CatCard cat={pedigreeData.generation3.pmgm} level={3} />
                <CatCard cat={pedigreeData.generation3.mpgf} level={3} />
                <CatCard cat={pedigreeData.generation3.mpgm} level={3} />
                <CatCard cat={pedigreeData.generation3.mmgf} level={3} />
                <CatCard cat={pedigreeData.generation3.mmgm} level={3} />
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>

        {/* 世代ラベル */}
        <Box mt="xl">
          <Grid>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="blue">本人</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="purple">親（第1世代）</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="green">祖父母（第2世代）</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="orange">曾祖父母（第3世代）</Text>
            </Grid.Col>
          </Grid>
        </Box>

        {/* 注意書き */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Title order={3} mb="md">血統表について</Title>
          <Stack gap="sm">
            <Text size="sm">• この血統表は4世代（本人 + 親、祖父母、曾祖父母）を表示しています</Text>
            <Text size="sm">• 各世代は色分けされており、世代が古くなるほど薄い色になります</Text>
            <Text size="sm">• 不明な個体は「不明」と表示されます</Text>
            <Text size="sm">• より詳細な血統情報が必要な場合は、個別にお問い合わせください</Text>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
````

## File: frontend/src/app/cats/[id]/layout.tsx
````typescript
// Static export support - return empty array for dynamic routes
export function generateStaticParams() {
  return [];
}

export default function CatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: frontend/src/app/cats/[id]/page.tsx
````typescript
import CatDetailClient from './client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CatDetailPage({ params }: Props) {
  const { id } = await params;
  return <CatDetailClient catId={id} />;
}
````

## File: frontend/src/app/cats/new/page.tsx
````typescript
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Container,
  Group,
  Stack,
  Switch,
  Alert,
  LoadingOverlay,
  Tabs,
} from '@mantine/core';
import { InputWithFloatingLabel } from '@/components/ui/InputWithFloatingLabel';
import { TextareaWithFloatingLabel } from '@/components/ui/TextareaWithFloatingLabel';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useCreateCat, type CreateCatRequest } from '@/lib/api/hooks/use-cats';
import { useGetBreeds } from '@/lib/api/hooks/use-breeds';
import { useGetCoatColors } from '@/lib/api/hooks/use-coat-colors';
import { useBreedMasterData, useCoatColorMasterData } from '@/lib/api/hooks/use-master-data';
import { ActionButton } from '@/components/ActionButton';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import TagSelector from '@/components/TagSelector';
import { ALPHANUM_SPACE_HYPHEN_PATTERN, MasterDataCombobox } from '@/components/forms/MasterDataCombobox';
import { useSelectionHistory } from '@/lib/hooks/use-selection-history';
import { buildMasterOptions, createDisplayNameMap } from '@/lib/master-data/master-options';
import { catFormSchema, type CatFormSchema as CatFormValues } from '@/lib/schemas';
import { SelectWithFloatingLabel } from '@/components/ui/SelectWithFloatingLabel';

export default function CatRegistrationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>('register');
  const { setPageHeader } = usePageHeader();
  const createCat = useCreateCat();
  const breedListQuery = useMemo(() => ({ limit: 500, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const coatColorListQuery = useMemo(() => ({ limit: 500, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const { data: breedsData, isLoading: isBreedsLoading } = useGetBreeds(breedListQuery);
  const { data: coatColorsData, isLoading: isCoatColorsLoading } = useGetCoatColors(coatColorListQuery);
  const { data: breedMasterData, isLoading: isBreedMasterLoading } = useBreedMasterData();
  const { data: coatMasterData, isLoading: isCoatMasterLoading } = useCoatColorMasterData();
  const { history: breedHistory, recordSelection: recordBreedSelection } = useSelectionHistory('breed');
  const { history: coatHistory, recordSelection: recordCoatSelection } = useSelectionHistory('coat-color');
  const breedDisplayMap = useMemo(() => createDisplayNameMap(breedMasterData?.data), [breedMasterData]);
  const coatDisplayMap = useMemo(() => createDisplayNameMap(coatMasterData?.data), [coatMasterData]);
  const breedOptions = useMemo(
    () => buildMasterOptions(breedsData?.data, breedDisplayMap),
    [breedsData, breedDisplayMap],
  );
  const coatColorOptions = useMemo(
    () => buildMasterOptions(coatColorsData?.data, coatDisplayMap),
    [coatColorsData, coatDisplayMap],
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CatFormValues>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      birthDate: '',
      breedId: undefined,
      coatColorId: undefined,
      microchipNumber: undefined,
      registrationId: undefined,
      description: undefined,
      isInHouse: true,
      tagIds: [],
    },
  });

  const onSubmit = async (values: CatFormValues) => {
    const payload: CreateCatRequest = {
      name: values.name,
      gender: values.gender,
      birthDate: values.birthDate,
      breedId: values.breedId ?? null,
      coatColorId: values.coatColorId ?? null,
      microchipNumber: values.microchipNumber,
      registrationNumber: values.registrationId,
      description: values.description,
      isInHouse: values.isInHouse,
      tagIds: values.tagIds.length > 0 ? values.tagIds : undefined,
    };

    try {
      await createCat.mutateAsync(payload);
      reset();
      // 登録成功後に一覧ページに遷移（タイムスタンプを追加してキャッシュをバイパス）
      router.replace(`/cats?t=${Date.now()}`);
    } catch {
      // エラーハンドリングは useCreateCat 内で通知を表示
    }
  };

  const isSubmitting = createCat.isPending;

  // グローバルヘッダーにページタイトルとアクションボタンを設定
  useEffect(() => {
    setPageHeader(
      '在舎猫登録',
      <ActionButton
        action="create"
        onClick={handleSubmit(onSubmit)}
        loading={isSubmitting}
      >
        登録する
      </ActionButton>
    );

    return () => {
      setPageHeader(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting]);

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isSubmitting} zIndex={1000} overlayProps={{ blur: 2 }} />

      {/* タブコンポーネント */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="register" leftSection={<IconPlus size={16} />}>
            新規登録
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="register" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={10}>
                {/* 1行目: 猫の名前、性別 */}
                <Group grow gap={10}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="猫の名前"
                        required
                        error={errors.name?.message}
                        {...field}
                        value={field.value}
                      />
                    )}
                  />

                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <SelectWithFloatingLabel
                        label="性別"
                        data={[
                          { value: 'MALE', label: 'Male (オス)' },
                          { value: 'FEMALE', label: 'Female (メス)' },
                          { value: 'NEUTER', label: 'Neuter (去勢オス)' },
                          { value: 'SPAY', label: 'Spay (避妊メス)' },
                        ]}
                        required
                        error={errors.gender?.message}
                        value={field.value ?? null}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Group>

                {/* 2行目: 猫種コンボ、色柄コンボ */}
                <Group grow gap={10}>
                  <Controller
                    name="breedId"
                    control={control}
                    render={({ field }) => (
                      <MasterDataCombobox
                        label=""
                        placeholder="猫種コードや名称を入力"
                        description=""
                        value={field.value ?? undefined}
                        onChange={(next) => field.onChange(next ?? undefined)}
                        options={breedOptions}
                        historyItems={breedHistory}
                        error={errors.breedId?.message}
                        disabled={isSubmitting}
                        loading={isBreedsLoading || isBreedMasterLoading}
                        historyLabel="最近の品種"
                        onOptionSelected={recordBreedSelection}
                      />
                    )}
                  />

                  <Controller
                    name="coatColorId"
                    control={control}
                    render={({ field }) => (
                      <MasterDataCombobox
                        label=""
                        placeholder="色柄コードや名称を入力"
                        description=""
                        value={field.value ?? undefined}
                        onChange={(next) => field.onChange(next ?? undefined)}
                        options={coatColorOptions}
                        historyItems={coatHistory}
                        error={errors.coatColorId?.message}
                        disabled={isSubmitting}
                        loading={isCoatColorsLoading || isCoatMasterLoading}
                        historyLabel="最近の色柄"
                        onOptionSelected={recordCoatSelection}
                        sanitizePattern={ALPHANUM_SPACE_HYPHEN_PATTERN}
                      />
                    )}
                  />
                </Group>

                {/* 3行目: 生年月日、マイクロチップ番号、登録番号 */}
                <Group grow gap={10}>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="生年月日"
                        error={errors.birthDate?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="microchipNumber"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="マイクロチップ番号"
                        error={errors.microchipNumber?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />

                  <Controller
                    name="registrationId"
                    control={control}
                    render={({ field }) => (
                      <InputWithFloatingLabel
                        label="登録番号"
                        error={errors.registrationId?.message}
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </Group>

                {/* 4行目: 備考 */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextareaWithFloatingLabel
                      label="備考"
                      placeholder="特徴や性格などを記入してください"
                      minRows={3}
                      error={errors.description?.message}
                      {...field}
                      value={field.value ?? ''}
                    />
                  )}
                />

                {/* 5行目: タグ */}
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <TagSelector
                      selectedTags={field.value ?? []}
                      onChange={field.onChange}
                      label="タグ"
                      placeholder="猫の特徴タグを選択"
                      disabled={isSubmitting}
                    />
                  )}
                />

                {/* 6行目: 在舎スイッチ */}
                <Controller
                  name="isInHouse"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      label="施設内に在舎している猫です"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.currentTarget.checked)}
                    />
                  )}
                />

                {createCat.isError && (
                  <Alert color="red" title="登録に失敗しました">
                    {(createCat.error as Error)?.message ?? '時間をおいて再度お試しください。'}
                  </Alert>
                )}

                {/* フォーム下部の登録ボタン */}
                <Group justify="flex-end" mt="md">
                  <ActionButton
                    action="create"
                    onClick={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    isSectionAction
                  >
                    登録する
                  </ActionButton>
                </Group>
              </Stack>
            </form>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
````

## File: frontend/src/app/gallery/components/GalleryCatCard.tsx
````typescript
'use client';

/**
 * ギャラリーカードコンポーネント
 * 個別の猫カード表示
 */

import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  ActionIcon,
  Menu,
  Stack,
  AspectRatio,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconPhoto,
  IconBrandYoutube,
} from '@tabler/icons-react';
import type { GalleryEntry } from '@/lib/api/hooks/use-gallery';
import { GenderBadge } from '@/components/GenderBadge';

/**
 * 性別を表示用に変換
 */
function formatGender(gender: string): 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY' {
  const upperGender = gender.toUpperCase();
  if (
    upperGender === 'MALE' ||
    upperGender === 'FEMALE' ||
    upperGender === 'NEUTER' ||
    upperGender === 'SPAY'
  ) {
    return upperGender;
  }
  // オス/メスの文字列対応
  if (gender === 'オス' || gender === '♂') return 'MALE';
  if (gender === 'メス' || gender === '♀') return 'FEMALE';
  return 'MALE';
}

/**
 * 日付フォーマット
 */
function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const date = new Date(value);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * サムネイルURLの取得
 */
function getThumbnailUrl(entry: GalleryEntry): string | null {
  if (entry.media.length === 0) return null;

  // order順でソートして最初のメディアを取得
  const sortedMedia = [...entry.media].sort((a, b) => a.order - b.order);
  const firstMedia = sortedMedia[0];

  if (firstMedia.type === 'YOUTUBE') {
    return firstMedia.thumbnailUrl ?? null;
  }
  return firstMedia.url;
}

/**
 * メディアタイプの判定
 */
function getMediaInfo(entry: GalleryEntry): {
  hasImages: boolean;
  hasYouTube: boolean;
  count: number;
} {
  const hasImages = entry.media.some((m) => m.type === 'IMAGE');
  const hasYouTube = entry.media.some((m) => m.type === 'YOUTUBE');
  return {
    hasImages,
    hasYouTube,
    count: entry.media.length,
  };
}

interface GalleryCatCardProps {
  /** ギャラリーエントリ */
  entry: GalleryEntry;
  /** カードクリック時のコールバック */
  onClick?: () => void;
  /** 編集クリック時のコールバック */
  onEdit?: () => void;
  /** 削除クリック時のコールバック */
  onDelete?: () => void;
}

/**
 * ギャラリーカードコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryCatCard
 *   entry={entry}
 *   onClick={() => openDetail(entry.id)}
 *   onEdit={() => openEditModal(entry)}
 *   onDelete={() => confirmDelete(entry)}
 * />
 * ```
 */
export function GalleryCatCard({
  entry,
  onClick,
  onEdit,
  onDelete,
}: GalleryCatCardProps) {
  const thumbnailUrl = getThumbnailUrl(entry);
  const mediaInfo = getMediaInfo(entry);

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={(e) => {
        // メニューボタンのクリックは除外
        if ((e.target as HTMLElement).closest('[data-menu-button]')) {
          return;
        }
        onClick?.();
      }}
    >
      {/* サムネイル画像 */}
      <Card.Section>
        <AspectRatio ratio={4 / 3}>
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={entry.name} fit="cover" />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--mantine-color-gray-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconPhoto size={48} stroke={1} color="var(--mantine-color-gray-5)" />
            </div>
          )}
        </AspectRatio>
      </Card.Section>

      {/* カード本体 */}
      <Stack gap="xs" mt="sm">
        {/* ヘッダー: 名前とメニュー */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fw={600} size="md" lineClamp={1}>
            {entry.name}
          </Text>
          {(onEdit || onDelete) && (
            <Menu shadow="md" position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  data-menu-button
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {onEdit && (
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    編集
                  </Menu.Item>
                )}
                {entry.externalLink && (
                  <Menu.Item
                    leftSection={<IconExternalLink size={14} />}
                    component="a"
                    href={entry.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    外部リンク
                  </Menu.Item>
                )}
                {onDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      削除
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {/* 性別と毛色 */}
        <Group gap="xs">
          <GenderBadge gender={formatGender(entry.gender)} size="xs" />
          {entry.coatColor && (
            <Badge size="xs" variant="light" color="gray">
              {entry.coatColor}
            </Badge>
          )}
        </Group>

        {/* 猫種 */}
        {entry.breed && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {entry.breed}
          </Text>
        )}

        {/* 卒業情報（GRADUATIONカテゴリの場合） */}
        {entry.category === 'GRADUATION' && entry.transferDate && (
          <Text size="xs" c="dimmed">
            卒業: {formatDate(entry.transferDate)}
          </Text>
        )}

        {/* メディア情報 */}
        {mediaInfo.count > 0 && (
          <Group gap={4}>
            {mediaInfo.hasImages && (
              <Badge
                size="xs"
                variant="dot"
                color="blue"
                leftSection={<IconPhoto size={10} />}
              >
                画像
              </Badge>
            )}
            {mediaInfo.hasYouTube && (
              <Badge
                size="xs"
                variant="dot"
                color="red"
                leftSection={<IconBrandYoutube size={10} />}
              >
                動画
              </Badge>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}
````

## File: frontend/src/app/gallery/components/GalleryGrid.tsx
````typescript
'use client';

/**
 * ギャラリーグリッドコンポーネント
 * カードをレスポンシブグリッドで表示
 */

import {
  SimpleGrid,
  Skeleton,
  Alert,
  Center,
  Stack,
  Text,
  Pagination,
} from '@mantine/core';
import { IconAlertCircle, IconPhotoOff } from '@tabler/icons-react';
import { GalleryCatCard } from './GalleryCatCard';
import type { GalleryEntry, GalleryCategory } from '@/lib/api/hooks/use-gallery';

interface GalleryGridProps {
  /** エントリ一覧 */
  entries: GalleryEntry[];
  /** ローディング中フラグ */
  loading?: boolean;
  /** エラーメッセージ */
  error?: string | null;
  /** 現在のカテゴリ */
  category: GalleryCategory;
  /** カードクリック時のコールバック */
  onCardClick?: (entry: GalleryEntry) => void;
  /** 編集クリック時のコールバック */
  onEditClick?: (entry: GalleryEntry) => void;
  /** 削除クリック時のコールバック */
  onDeleteClick?: (entry: GalleryEntry) => void;
  /** ページネーション: 現在ページ */
  currentPage?: number;
  /** ページネーション: 総ページ数 */
  totalPages?: number;
  /** ページネーション: ページ変更コールバック */
  onPageChange?: (page: number) => void;
}

/**
 * ローディングスケルトン
 */
function LoadingSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={280} radius="md" />
      ))}
    </SimpleGrid>
  );
}

/**
 * 空状態の表示
 */
function EmptyState({ category }: { category: GalleryCategory }) {
  const categoryLabels: Record<GalleryCategory, string> = {
    KITTEN: '子猫',
    FATHER: '父猫',
    MOTHER: '母猫',
    GRADUATION: '卒業猫',
  };

  return (
    <Center py="xl">
      <Stack align="center" gap="md">
        <IconPhotoOff size={48} stroke={1.5} color="gray" />
        <Text c="dimmed" ta="center">
          {categoryLabels[category]}のギャラリーがまだありません
        </Text>
      </Stack>
    </Center>
  );
}

/**
 * ギャラリーグリッドコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryGrid
 *   entries={data}
 *   loading={isLoading}
 *   category="KITTEN"
 *   onCardClick={(entry) => openDetail(entry.id)}
 * />
 * ```
 */
export function GalleryGrid({
  entries,
  loading,
  error,
  category,
  onCardClick,
  onEditClick,
  onDeleteClick,
  currentPage,
  totalPages,
  onPageChange,
}: GalleryGridProps) {
  // エラー表示
  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="エラー"
        color="red"
        variant="light"
      >
        {error}
      </Alert>
    );
  }

  // ローディング表示
  if (loading) {
    return <LoadingSkeleton />;
  }

  // 空状態
  if (entries.length === 0) {
    return <EmptyState category={category} />;
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
        {entries.map((entry) => (
          <GalleryCatCard
            key={entry.id}
            entry={entry}
            onClick={() => onCardClick?.(entry)}
            onEdit={() => onEditClick?.(entry)}
            onDelete={() => onDeleteClick?.(entry)}
          />
        ))}
      </SimpleGrid>

      {/* ページネーション */}
      {totalPages && totalPages > 1 && onPageChange && (
        <Center mt="md">
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
            siblings={1}
            boundaries={1}
          />
        </Center>
      )}
    </Stack>
  );
}
````

## File: frontend/src/app/gallery/components/ImageUploader.tsx
````typescript
'use client';

/**
 * 画像アップローダーコンポーネント
 * ドラッグ＆ドロップまたはファイル選択による画像アップロード
 */

import { useState, useRef } from 'react';
import {
  Box,
  Text,
  Stack,
  Progress,
  Group,
  ActionIcon,
  Image,
  Paper,
} from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconCheck } from '@tabler/icons-react';
import { useGalleryUpload } from '@/lib/api/hooks/use-gallery-upload';
import { notifications } from '@mantine/notifications';

interface ImageUploaderProps {
  /** アップロード完了時のコールバック */
  onUploaded: (url: string) => void;
  /** 許可する最大ファイル数 */
  maxFiles?: number;
  /** ドラッグ＆ドロップ無効 */
  disabled?: boolean;
}

/**
 * 画像アップローダーコンポーネント
 *
 * @example
 * ```tsx
 * <ImageUploader
 *   onUploaded={(url) => handleImageUploaded(url)}
 *   maxFiles={5}
 * />
 * ```
 */
export function ImageUploader({
  onUploaded,
  maxFiles = 10,
  disabled,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      id: string;
      name: string;
      progress: number;
      status: 'uploading' | 'completed' | 'error';
      previewUrl?: string;
      error?: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useGalleryUpload();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      notifications.show({
        title: 'エラー',
        message: '画像ファイルのみアップロードできます',
        color: 'red',
      });
      return;
    }

    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      await processFiles(files);
    }
    // inputをリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const filesToProcess = files.slice(0, maxFiles);

    for (const file of filesToProcess) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);

      setUploadingFiles((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          progress: 0,
          status: 'uploading',
          previewUrl,
        },
      ]);

      try {
        // プログレス更新（擬似的）
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: 30 } : f))
        );

        const url = await uploadFile(file);

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, progress: 100, status: 'completed' } : f
          )
        );

        onUploaded(url);

        // 完了したファイルを少し後に削除
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
          URL.revokeObjectURL(previewUrl);
        }, 2000);
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: 'error',
                  error:
                    error instanceof Error
                      ? error.message
                      : 'アップロードに失敗しました',
                }
              : f
          )
        );
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    const file = uploadingFiles.find((f) => f.id === id);
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Stack gap="sm">
      {/* ドロップゾーン */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          borderStyle: 'dashed',
          borderColor: isDragging
            ? 'var(--mantine-color-blue-5)'
            : 'var(--mantine-color-gray-4)',
          backgroundColor: isDragging
            ? 'var(--mantine-color-blue-0)'
            : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Stack align="center" gap="xs">
          <IconUpload
            size={32}
            stroke={1.5}
            color={
              isDragging
                ? 'var(--mantine-color-blue-5)'
                : 'var(--mantine-color-gray-5)'
            }
          />
          <Text size="sm" c="dimmed" ta="center">
            画像をドラッグ＆ドロップ
            <br />
            またはクリックして選択
          </Text>
          <Text size="xs" c="dimmed">
            JPEG, PNG, WebP 対応
          </Text>
        </Stack>
      </Paper>

      {/* 隠しファイルインプット */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* アップロード中のファイル一覧 */}
      {uploadingFiles.length > 0 && (
        <Stack gap="xs">
          {uploadingFiles.map((file) => (
            <Paper key={file.id} p="xs" radius="sm" withBorder>
              <Group gap="sm" wrap="nowrap">
                {/* プレビュー */}
                <Box
                  w={40}
                  h={40}
                  style={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {file.previewUrl ? (
                    <Image
                      src={file.previewUrl}
                      alt={file.name}
                      w={40}
                      h={40}
                      fit="cover"
                    />
                  ) : (
                    <Box
                      w={40}
                      h={40}
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconPhoto size={20} />
                    </Box>
                  )}
                </Box>

                {/* ファイル名とプログレス */}
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" lineClamp={1}>
                    {file.name}
                  </Text>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} size="xs" animated />
                  )}
                  {file.status === 'error' && (
                    <Text size="xs" c="red">
                      {file.error}
                    </Text>
                  )}
                </Stack>

                {/* ステータスアイコン */}
                {file.status === 'completed' && (
                  <IconCheck size={20} color="var(--mantine-color-green-5)" />
                )}
                {file.status === 'error' && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
````

## File: frontend/src/app/gallery/components/MediaCarousel.tsx
````typescript
'use client';

/**
 * メディアカルーセルコンポーネント
 * 画像とYouTube動画のスライド表示
 */

import { useState } from 'react';
import {
  Box,
  Image,
  ActionIcon,
  Group,
  AspectRatio,
  Indicator,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconBrandYoutube,
} from '@tabler/icons-react';
import type { GalleryMedia } from '@/lib/api/hooks/use-gallery';

/**
 * YouTube URLからビデオIDを抽出
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * YouTube埋め込みコンポーネント
 */
function YouTubeEmbed({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--mantine-color-dark-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconBrandYoutube size={48} color="var(--mantine-color-red-5)" />
      </Box>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  );
}

interface MediaCarouselProps {
  /** メディア一覧 */
  media: GalleryMedia[];
  /** アスペクト比 */
  aspectRatio?: number;
  /** クリック時のコールバック（ライトボックス表示用） */
  onMediaClick?: (index: number) => void;
}

/**
 * メディアカルーセルコンポーネント
 *
 * @example
 * ```tsx
 * <MediaCarousel
 *   media={entry.media}
 *   aspectRatio={4 / 3}
 *   onMediaClick={(index) => openLightbox(index)}
 * />
 * ```
 */
export function MediaCarousel({
  media,
  aspectRatio = 4 / 3,
  onMediaClick,
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // order順でソート
  const sortedMedia = [...media].sort((a, b) => a.order - b.order);

  if (sortedMedia.length === 0) {
    return null;
  }

  const currentMedia = sortedMedia[currentIndex];
  const hasMultiple = sortedMedia.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? sortedMedia.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === sortedMedia.length - 1 ? 0 : prev + 1
    );
  };

  const handleClick = () => {
    onMediaClick?.(currentIndex);
  };

  return (
    <Box pos="relative">
      <AspectRatio ratio={aspectRatio}>
        <Box
          onClick={handleClick}
          style={{ cursor: onMediaClick ? 'pointer' : 'default' }}
        >
          {currentMedia.type === 'YOUTUBE' ? (
            <YouTubeEmbed url={currentMedia.url} />
          ) : (
            <Image
              src={currentMedia.url}
              alt="Gallery media"
              fit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </Box>
      </AspectRatio>

      {/* ナビゲーションボタン */}
      {hasMultiple && (
        <>
          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="lg"
            pos="absolute"
            left={8}
            top="50%"
            style={{ transform: 'translateY(-50%)' }}
            onClick={handlePrev}
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="lg"
            pos="absolute"
            right={8}
            top="50%"
            style={{ transform: 'translateY(-50%)' }}
            onClick={handleNext}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </>
      )}

      {/* インジケーター */}
      {hasMultiple && (
        <Group
          gap={4}
          justify="center"
          pos="absolute"
          bottom={8}
          left={0}
          right={0}
        >
          {sortedMedia.map((m, index) => (
            <Indicator
              key={m.id}
              color={index === currentIndex ? 'blue' : 'gray'}
              size={8}
              processing={false}
              position="middle-center"
              offset={0}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            >
              <Box w={8} h={8} />
            </Indicator>
          ))}
        </Group>
      )}

      {/* YouTubeバッジ */}
      {currentMedia.type === 'YOUTUBE' && (
        <Box
          pos="absolute"
          top={8}
          right={8}
          style={{
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          <IconBrandYoutube size={16} color="white" />
        </Box>
      )}
    </Box>
  );
}
````

## File: frontend/src/app/gallery/components/MediaLightbox.tsx
````typescript
'use client';

/**
 * メディアライトボックスコンポーネント
 * フルスクリーンでのメディア表示
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Box,
  Image,
  ActionIcon,
  Group,
  Text,
  Stack,
  CloseButton,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconBrandYoutube,
  IconDownload,
} from '@tabler/icons-react';
import type { GalleryMedia } from '@/lib/api/hooks/use-gallery';

/**
 * YouTube URLからビデオIDを抽出
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

interface MediaLightboxProps {
  /** メディア一覧 */
  media: GalleryMedia[];
  /** 表示/非表示 */
  opened: boolean;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** 初期表示インデックス */
  initialIndex?: number;
}

/**
 * メディアライトボックスコンポーネント
 *
 * @example
 * ```tsx
 * <MediaLightbox
 *   media={entry.media}
 *   opened={lightboxOpened}
 *   onClose={() => setLightboxOpened(false)}
 *   initialIndex={0}
 * />
 * ```
 */
export function MediaLightbox({
  media,
  opened,
  onClose,
  initialIndex = 0,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // order順でソート
  const sortedMedia = [...media].sort((a, b) => a.order - b.order);

  // 初期インデックスが変わったらリセット
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentMedia = sortedMedia[currentIndex];
  const hasMultiple = sortedMedia.length > 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? sortedMedia.length - 1 : prev - 1
    );
  }, [sortedMedia.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === sortedMedia.length - 1 ? 0 : prev + 1
    );
  }, [sortedMedia.length]);

  // キーボードナビゲーション
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, handlePrev, handleNext, onClose]);

  if (sortedMedia.length === 0) {
    return null;
  }

  const handleDownload = async () => {
    if (currentMedia.type === 'YOUTUBE') return;

    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gallery-${currentMedia.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // ダウンロード失敗時は何もしない
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      styles={{
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
        },
        content: {
          backgroundColor: 'transparent',
        },
      }}
    >
      {/* ヘッダー */}
      <Group
        justify="space-between"
        p="md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <Text c="white" size="sm">
          {currentIndex + 1} / {sortedMedia.length}
        </Text>
        <Group gap="xs">
          {currentMedia.type === 'IMAGE' && (
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={handleDownload}
              title="ダウンロード"
            >
              <IconDownload size={20} />
            </ActionIcon>
          )}
          <CloseButton
            variant="subtle"
            color="white"
            size="lg"
            onClick={onClose}
          />
        </Group>
      </Group>

      {/* メインコンテンツ */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 60px',
        }}
      >
        {/* 前へボタン */}
        {hasMultiple && (
          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="xl"
            pos="absolute"
            left={16}
            onClick={handlePrev}
          >
            <IconChevronLeft size={24} />
          </ActionIcon>
        )}

        {/* メディア表示 */}
        <Box
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentMedia.type === 'YOUTUBE' ? (
            <Box
              style={{
                width: '80vw',
                maxWidth: '1200px',
                aspectRatio: '16 / 9',
              }}
            >
              {(() => {
                const videoId = extractYouTubeId(currentMedia.url);
                if (!videoId) {
                  return (
                    <Stack align="center" justify="center" h="100%">
                      <IconBrandYoutube
                        size={64}
                        color="var(--mantine-color-red-5)"
                      />
                      <Text c="white">動画を読み込めませんでした</Text>
                    </Stack>
                  );
                }
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                );
              })()}
            </Box>
          ) : (
            <Image
              src={currentMedia.url}
              alt="Gallery media"
              fit="contain"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 120px)',
              }}
            />
          )}
        </Box>

        {/* 次へボタン */}
        {hasMultiple && (
          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="xl"
            pos="absolute"
            right={16}
            onClick={handleNext}
          >
            <IconChevronRight size={24} />
          </ActionIcon>
        )}
      </Box>

      {/* サムネイル一覧 */}
      {hasMultiple && (
        <Group
          gap="xs"
          justify="center"
          p="md"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          {sortedMedia.map((m, index) => (
            <Box
              key={m.id}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: 60,
                height: 60,
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                border:
                  index === currentIndex
                    ? '2px solid var(--mantine-color-blue-5)'
                    : '2px solid transparent',
                opacity: index === currentIndex ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            >
              {m.type === 'YOUTUBE' ? (
                <Box
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--mantine-color-dark-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconBrandYoutube
                    size={20}
                    color="var(--mantine-color-red-5)"
                  />
                </Box>
              ) : (
                <Image
                  src={m.thumbnailUrl || m.url}
                  alt="Thumbnail"
                  fit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </Box>
          ))}
        </Group>
      )}
    </Modal>
  );
}
````

## File: frontend/src/app/gallery/components/YouTubeInput.tsx
````typescript
'use client';

/**
 * YouTube URL入力コンポーネント
 * YouTube URLの入力とサムネイル取得
 */

import { useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Paper,
  Text,
  Image,
  Stack,
  ActionIcon,
  Box,
} from '@mantine/core';
import { IconBrandYoutube, IconPlus, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

/**
 * YouTube URLからビデオIDを抽出
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * YouTube動画のサムネイルURLを取得
 */
function getYouTubeThumbnailUrl(videoId: string): string {
  // 高品質サムネイル（存在しない場合はデフォルトにフォールバック）
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * YouTube URLを正規化
 */
function normalizeYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

interface YouTubeInputProps {
  /** 追加時のコールバック */
  onAdded: (url: string, thumbnailUrl?: string) => void;
  /** 無効状態 */
  disabled?: boolean;
}

/**
 * YouTube URL入力コンポーネント
 *
 * @example
 * ```tsx
 * <YouTubeInput
 *   onAdded={(url, thumbnail) => handleYouTubeAdded(url, thumbnail)}
 * />
 * ```
 */
export function YouTubeInput({ onAdded, disabled }: YouTubeInputProps) {
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<{
    videoId: string;
    thumbnailUrl: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setPreview(null);
  };

  const handleValidate = () => {
    if (!url.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'URLを入力してください',
        color: 'red',
      });
      return;
    }

    setIsValidating(true);

    const videoId = extractYouTubeId(url);

    if (!videoId) {
      notifications.show({
        title: 'エラー',
        message: '有効なYouTube URLではありません',
        color: 'red',
      });
      setIsValidating(false);
      return;
    }

    const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
    setPreview({ videoId, thumbnailUrl });
    setIsValidating(false);
  };

  const handleAdd = () => {
    if (!preview) return;

    const normalizedUrl = normalizeYouTubeUrl(preview.videoId);
    onAdded(normalizedUrl, preview.thumbnailUrl);

    // リセット
    setUrl('');
    setPreview(null);

    notifications.show({
      title: '追加完了',
      message: 'YouTube動画を追加しました',
      color: 'green',
    });
  };

  const handleClearPreview = () => {
    setPreview(null);
    setUrl('');
  };

  return (
    <Stack gap="sm">
      {/* URL入力 */}
      <Group gap="sm" align="flex-end">
        <TextInput
          label="YouTube URL"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => handleUrlChange(e.currentTarget.value)}
          disabled={disabled}
          style={{ flex: 1 }}
          leftSection={<IconBrandYoutube size={16} />}
        />
        <Button
          variant="light"
          onClick={handleValidate}
          loading={isValidating}
          disabled={disabled || !url.trim()}
        >
          確認
        </Button>
      </Group>

      {/* プレビュー */}
      {preview && (
        <Paper p="sm" radius="md" withBorder>
          <Group gap="md" wrap="nowrap">
            <Box
              w={120}
              h={90}
              style={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Image
                src={preview.thumbnailUrl}
                alt="YouTube thumbnail"
                w={120}
                h={90}
                fit="cover"
              />
              <Box
                pos="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                <IconBrandYoutube size={32} color="white" />
              </Box>
            </Box>

            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                YouTube動画
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                ID: {preview.videoId}
              </Text>
              <Group gap="xs">
                <Button
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={handleAdd}
                >
                  追加
                </Button>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleClearPreview}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Stack>
          </Group>
        </Paper>
      )}

      {/* ヘルプテキスト */}
      <Text size="xs" c="dimmed">
        対応形式: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
      </Text>
    </Stack>
  );
}
````

## File: frontend/src/app/gallery/hooks/useGalleryTab.ts
````typescript
'use client';

/**
 * ギャラリータブのURL同期管理フック
 * URLクエリパラメータとタブ状態を同期
 */

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { GalleryCategory } from '@/lib/api/hooks/use-gallery';

/**
 * 有効なタブ一覧
 */
const VALID_TABS: GalleryCategory[] = [
  'KITTEN',
  'FATHER',
  'MOTHER',
  'GRADUATION',
];

/**
 * デフォルトタブ
 */
const DEFAULT_TAB: GalleryCategory = 'KITTEN';

/**
 * タブのラベルマッピング
 */
export const TAB_LABELS: Record<GalleryCategory, string> = {
  KITTEN: '子猫',
  FATHER: '父猫',
  MOTHER: '母猫',
  GRADUATION: '卒業猫',
};

/**
 * URLクエリパラメータからカテゴリを判定するヘルパー
 */
function parseTabFromQuery(tabQuery: string | null): GalleryCategory {
  if (!tabQuery) return DEFAULT_TAB;
  const upperTab = tabQuery.toUpperCase() as GalleryCategory;
  return VALID_TABS.includes(upperTab) ? upperTab : DEFAULT_TAB;
}

/**
 * ギャラリータブ管理フック
 *
 * @returns currentTab - 現在のタブ
 * @returns setTab - タブを変更（URL同期）
 * @returns tabLabels - タブラベル一覧
 *
 * @example
 * ```tsx
 * const { currentTab, setTab } = useGalleryTab();
 *
 * return (
 *   <Tabs value={currentTab} onChange={(tab) => setTab(tab as GalleryCategory)}>
 *     ...
 *   </Tabs>
 * );
 * ```
 */
export function useGalleryTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * 現在のタブ（URLクエリから取得）
   */
  const currentTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return parseTabFromQuery(tab);
  }, [searchParams]);

  /**
   * タブを変更し、URLを更新
   */
  const setTab = useCallback(
    (tab: GalleryCategory) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab.toLowerCase());
      // ページはリセット
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * 有効なタブ一覧を取得
   */
  const validTabs = useMemo(() => VALID_TABS, []);

  return {
    currentTab,
    setTab,
    tabLabels: TAB_LABELS,
    validTabs,
  };
}

/**
 * ギャラリーページネーション管理フック
 */
export function useGalleryPagination() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * 現在のページ番号
   */
  const currentPage = useMemo(() => {
    const page = searchParams.get('page');
    const parsed = page ? parseInt(page, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  /**
   * ページを変更し、URLを更新
   */
  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return {
    currentPage,
    setPage,
  };
}
````

## File: frontend/src/app/cats/[id]/pedigree/page.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Title,
  Text,
  Flex,
  Grid,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

// ダミーデータ
const pedigreeData = {
  id: '1',
  name: 'レオ',
  generation1: { // 親
    father: { name: 'パパ猫', color: '茶トラ' },
    mother: { name: 'ママ猫', color: '三毛' }
  },
  generation2: { // 祖父母
    paternalGrandfather: { name: '祖父1', color: '茶トラ' },
    paternalGrandmother: { name: '祖母1', color: '白' },
    maternalGrandfather: { name: '祖父2', color: '黒' },
    maternalGrandmother: { name: '祖母2', color: '三毛' }
  },
  generation3: { // 曾祖父母
    ppgf: { name: '曾祖父1', color: '茶トラ' }, // paternal paternal grandfather
    ppgm: { name: '曾祖母1', color: '白' },     // paternal paternal grandmother
    pmgf: { name: '曾祖父2', color: '茶' },     // paternal maternal grandfather
    pmgm: { name: '曾祖母2', color: '白' },     // paternal maternal grandmother
    mpgf: { name: '曾祖父3', color: '黒' },     // maternal paternal grandfather
    mpgm: { name: '曾祖母3', color: '灰' },     // maternal paternal grandmother
    mmgf: { name: '曾祖父4', color: '三毛' },   // maternal maternal grandfather
    mmgm: { name: '曾祖母4', color: '茶' }      // maternal maternal grandmother
  }
};

const CatCard = ({ cat, level = 0 }: { cat: { name: string; color: string } | null; level?: number }) => {
  if (!cat) {
    return (
      <Card shadow="sm" padding="sm" radius="md" withBorder style={{ minHeight: 60, opacity: 0.3 }}>
        <Text size="sm" c="dimmed">不明</Text>
      </Card>
    );
  }

  const colors = {
    0: '#e3f2fd', // 本人: ライトブルー
    1: '#f3e5f5', // 親: ライトパープル
    2: '#e8f5e8', // 祖父母: ライトグリーン
    3: '#fff3e0'  // 曾祖父母: ライトオレンジ
  };

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      style={{
        backgroundColor: colors[level as keyof typeof colors] || '#f5f5f5',
        minHeight: 60
      }}
    >
      <Stack gap="xs">
        <Text fw={600} size="sm">{cat.name}</Text>
        <Text size="xs" c="dimmed">{cat.color}</Text>
      </Stack>
    </Card>
  );
};

export default function PedigreePage() {
  const router = useRouter();
  // const params = useParams();

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* ヘッダー */}
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              戻る
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container size="xl" style={{ paddingTop: '2rem' }}>
        <Title order={1} mb="lg" ta="center">
          {pedigreeData.name}の血統表（4世代）
        </Title>

        {/* 血統表グリッド */}
        <Box style={{ overflowX: 'auto' }}>
          <Grid style={{ minWidth: '1200px' }}>
            {/* 第1列: 本人 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%', justifyContent: 'center' }}>
                <CatCard cat={{ name: pedigreeData.name, color: '茶トラ' }} level={0} />
              </Stack>
            </Grid.Col>

            {/* 第2列: 親 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation1.father} level={1} />
                <CatCard cat={pedigreeData.generation1.mother} level={1} />
              </Stack>
            </Grid.Col>

            {/* 第3列: 祖父母 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation2.paternalGrandfather} level={2} />
                <CatCard cat={pedigreeData.generation2.paternalGrandmother} level={2} />
                <CatCard cat={pedigreeData.generation2.maternalGrandfather} level={2} />
                <CatCard cat={pedigreeData.generation2.maternalGrandmother} level={2} />
              </Stack>
            </Grid.Col>

            {/* 第4列: 曾祖父母 */}
            <Grid.Col span={3}>
              <Stack gap="md" style={{ height: '100%' }}>
                <CatCard cat={pedigreeData.generation3.ppgf} level={3} />
                <CatCard cat={pedigreeData.generation3.ppgm} level={3} />
                <CatCard cat={pedigreeData.generation3.pmgf} level={3} />
                <CatCard cat={pedigreeData.generation3.pmgm} level={3} />
                <CatCard cat={pedigreeData.generation3.mpgf} level={3} />
                <CatCard cat={pedigreeData.generation3.mpgm} level={3} />
                <CatCard cat={pedigreeData.generation3.mmgf} level={3} />
                <CatCard cat={pedigreeData.generation3.mmgm} level={3} />
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>

        {/* 世代ラベル */}
        <Box mt="xl">
          <Grid>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="blue">本人</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="purple">親（第1世代）</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="green">祖父母（第2世代）</Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text ta="center" fw={600} c="orange">曾祖父母（第3世代）</Text>
            </Grid.Col>
          </Grid>
        </Box>

        {/* 注意書き */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Title order={3} mb="md">血統表について</Title>
          <Stack gap="sm">
            <Text size="sm">• この血統表は4世代（本人 + 親、祖父母、曾祖父母）を表示しています</Text>
            <Text size="sm">• 各世代は色分けされており、世代が古くなるほど薄い色になります</Text>
            <Text size="sm">• 不明な個体は「不明」と表示されます</Text>
            <Text size="sm">• より詳細な血統情報が必要な場合は、個別にお問い合わせください</Text>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
````

## File: frontend/src/app/gallery/page.tsx
````typescript
'use client';

/**
 * ギャラリーページ
 * 4つのカテゴリ（子猫 / 父猫 / 母猫 / 卒業猫）をタブ切り替えで表示
 */

import { Suspense, useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Group,
  Skeleton,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ActionButton } from '@/components/ActionButton';
import {
  useGalleryEntries,
  useCreateGalleryEntry,
  useDeleteGalleryEntry,
  type GalleryEntry,
  type GalleryCategory,
} from '@/lib/api/hooks/use-gallery';
import { GalleryTabs } from './components/GalleryTabs';
import { GalleryGrid } from './components/GalleryGrid';
import { GalleryAddModal } from './components/GalleryAddModal';
import { MediaLightbox } from './components/MediaLightbox';
import { useGalleryTab, useGalleryPagination } from './hooks/useGalleryTab';

/**
 * ギャラリーコンテンツコンポーネント
 * Suspense境界内で使用
 */
function GalleryContent() {
  const { setPageHeader } = usePageHeader();
  const { currentTab } = useGalleryTab();
  const { currentPage, setPage } = useGalleryPagination();

  // モーダル状態（useEffectより前に宣言する必要がある）
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);

  // ページヘッダー設定
  useEffect(() => {
    setPageHeader(
      'ギャラリー',
      <ActionButton
        action="create"
        onClick={openAddModal}
      >
        追加
      </ActionButton>
    );
    return () => setPageHeader(null);
  }, [setPageHeader, openAddModal]);
  const [lightboxOpened, { open: openLightbox, close: closeLightbox }] =
    useDisclosure(false);
  const [selectedEntry, setSelectedEntry] = useState<GalleryEntry | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // API フック
  const {
    data: galleryData,
    isLoading,
    error,
  } = useGalleryEntries(currentTab, currentPage, 20);

  const { mutate: createEntry, isPending: isCreating } =
    useCreateGalleryEntry();
  const { mutate: deleteEntry } =
    useDeleteGalleryEntry();

  // 全カテゴリの件数取得（カウント用）
  const { data: kittenData } = useGalleryEntries('KITTEN', 1, 1);
  const { data: fatherData } = useGalleryEntries('FATHER', 1, 1);
  const { data: motherData } = useGalleryEntries('MOTHER', 1, 1);
  const { data: graduationData } = useGalleryEntries('GRADUATION', 1, 1);

  const counts: Record<GalleryCategory, number> = {
    KITTEN: kittenData?.meta?.total ?? 0,
    FATHER: fatherData?.meta?.total ?? 0,
    MOTHER: motherData?.meta?.total ?? 0,
    GRADUATION: graduationData?.meta?.total ?? 0,
  };

  // ハンドラ
  const handleCardClick = (entry: GalleryEntry) => {
    if (entry.media.length > 0) {
      setSelectedEntry(entry);
      setLightboxIndex(0);
      openLightbox();
    }
  };

  const handleEditClick = (entry: GalleryEntry) => {
    // TODO: 編集モーダルを実装
    console.log('Edit entry:', entry.id);
  };

  const handleDeleteClick = (entry: GalleryEntry) => {
    modals.openConfirmModal({
      title: '削除の確認',
      children: (
        <Text size="sm">
          「{entry.name}」をギャラリーから削除しますか？
          <br />
          この操作は取り消せません。
        </Text>
      ),
      labels: { confirm: '削除', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteEntry(entry.id);
      },
    });
  };

  const handleAddSubmit = (dto: Parameters<typeof createEntry>[0]) => {
    createEntry(dto, {
      onSuccess: () => {
        closeAddModal();
      },
    });
  };

  const handleCloseLightbox = () => {
    closeLightbox();
    setSelectedEntry(null);
  };

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* ヘッダー: タブとアクション */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <GalleryTabs counts={counts} loading={isLoading} />
          <ActionButton
            action="create"
            onClick={openAddModal}
            disabled={isLoading}
          >
            追加
          </ActionButton>
        </Group>

        {/* グリッド */}
        <GalleryGrid
          entries={galleryData?.data ?? []}
          loading={isLoading}
          error={error ? (error instanceof Error ? error.message : 'エラーが発生しました') : null}
          category={currentTab}
          onCardClick={handleCardClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          currentPage={currentPage}
          totalPages={galleryData?.meta?.totalPages}
          onPageChange={setPage}
        />
      </Stack>

      {/* 追加モーダル */}
      <GalleryAddModal
        opened={addModalOpened}
        onClose={closeAddModal}
        category={currentTab}
        onSubmit={handleAddSubmit}
        loading={isCreating}
      />

      {/* ライトボックス */}
      {selectedEntry && (
        <MediaLightbox
          media={selectedEntry.media}
          opened={lightboxOpened}
          onClose={handleCloseLightbox}
          initialIndex={lightboxIndex}
        />
      )}
    </Container>
  );
}

/**
 * ギャラリーページローディングスケルトン
 */
function GalleryLoading() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Skeleton height={42} width={400} />
        <Skeleton height={600} />
      </Stack>
    </Container>
  );
}

/**
 * ギャラリーページ
 */
export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryContent />
    </Suspense>
  );
}
````

## File: frontend/src/components/cats/cat-edit-modal.tsx
````typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Loader,
  Center,
  Divider,
  Grid,
} from "@mantine/core";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { format } from "date-fns";
import { UnifiedModal } from '@/components/common';
import { useGetCat, useUpdateCat, type Cat } from "@/lib/api/hooks/use-cats";
import { useGetBreeds } from "@/lib/api/hooks/use-breeds";
import { useGetCoatColors } from "@/lib/api/hooks/use-coat-colors";
import { useBreedMasterData, useCoatColorMasterData } from "@/lib/api/hooks/use-master-data";
import TagSelector from "@/components/TagSelector";
import { ALPHANUM_SPACE_HYPHEN_PATTERN, MasterDataCombobox } from "@/components/forms/MasterDataCombobox";
import { useSelectionHistory } from "@/lib/hooks/use-selection-history";
import { buildMasterOptions, createDisplayNameMap } from "@/lib/master-data/master-options";

interface CatEditModalProps {
  opened: boolean;
  onClose: () => void;
  catId: string;
  onSuccess?: () => void;
}

// Gender options
const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NEUTER", label: "Neutered Male" },
  { value: "SPAY", label: "Spayed Female" },
];

const COAT_COLOR_DESCRIPTION = "半角英数字・スペース・ハイフンで検索できます。";

export function CatEditModal({
  opened,
  onClose,
  catId,
  onSuccess,
}: CatEditModalProps) {
  const { data: cat, isLoading: isCatLoading } = useGetCat(catId);
  const breedListQuery = useMemo(() => ({ limit: 1000, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const coatColorListQuery = useMemo(() => ({ limit: 1000, sortBy: 'code', sortOrder: 'asc' as const }), []);
  const { data: breedsData, isLoading: isBreedsLoading } = useGetBreeds(breedListQuery);
  const { data: coatColorsData, isLoading: isCoatColorsLoading } = useGetCoatColors(coatColorListQuery);
  const { data: breedMasterData, isLoading: isBreedMasterLoading } = useBreedMasterData();
  const { data: coatMasterData, isLoading: isCoatMasterLoading } = useCoatColorMasterData();
  const { history: breedHistory, recordSelection: recordBreedSelection } = useSelectionHistory("breed");
  const { history: coatHistory, recordSelection: recordCoatSelection } = useSelectionHistory("coat-color");
  const breedDisplayMap = useMemo(() => createDisplayNameMap(breedMasterData?.data), [breedMasterData]);
  const coatDisplayMap = useMemo(() => createDisplayNameMap(coatMasterData?.data), [coatMasterData]);
  const breedOptions = useMemo(() => buildMasterOptions(breedsData?.data, breedDisplayMap), [breedsData, breedDisplayMap]);
  const coatOptions = useMemo(() => buildMasterOptions(coatColorsData?.data, coatDisplayMap), [coatColorsData, coatDisplayMap]);
  const updateCat = useUpdateCat(catId);

  const [form, setForm] = useState<{
    name: string;
    gender: "MALE" | "FEMALE" | "NEUTER" | "SPAY";
    breedId: string;
    coatColorId: string;
    birthDate: string;
    microchipNumber: string;
    registrationNumber: string;
    description: string;
    tagIds: string[];
  }>({
    name: "",
    gender: "MALE",
    breedId: "",
    coatColorId: "",
    birthDate: "",
    microchipNumber: "",
    registrationNumber: "",
    description: "",
    tagIds: [],
  });

  // データ取得後にフォームを初期化
  useEffect(() => {
    if (cat?.data && opened) {
      const catData = cat.data;
      setForm({
        name: catData.name || "",
        gender: catData.gender || "MALE",
        breedId: catData.breedId || "",
        coatColorId: catData.coatColorId || "",
        birthDate: catData.birthDate ? format(new Date(catData.birthDate), "yyyy-MM-dd") : "",
        microchipNumber: catData.microchipNumber || "",
        registrationNumber: catData.registrationNumber || "",
        description: catData.description || "",
        tagIds: catData.tags?.map((catTag: NonNullable<Cat['tags']>[number]) => catTag.tag.id) || [],
      });
    }
  }, [cat, opened]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCat.mutateAsync({
        name: form.name,
        gender: form.gender,
        breedId: form.breedId || null,
        coatColorId: form.coatColorId || null,
        birthDate: form.birthDate,
        microchipNumber: form.microchipNumber || null,
        registrationNumber: form.registrationNumber || null,
        description: form.description || null,
        tagIds: form.tagIds,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("更新エラー:", error);
    }
  };

  const handleClose = () => {
    if (!updateCat.isPending) {
      onClose();
    }
  };

  const isLoading =
    isCatLoading || isBreedsLoading || isCoatColorsLoading || isBreedMasterLoading || isCoatMasterLoading;

  return (
    <UnifiedModal
      opened={opened}
      onClose={handleClose}
      title="猫の情報編集"
      size="lg"
      closeOnClickOutside={!updateCat.isPending}
      closeOnEscape={!updateCat.isPending}
      addContentPadding={false}
    >
      {isLoading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md" p="md">
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="名前"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label="性別"
                  value={form.gender}
                  onChange={(value) => handleChange("gender", value || "")}
                  data={GENDER_OPTIONS}
                  required
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <MasterDataCombobox
                  label="品種"
                  value={form.breedId || undefined}
                  onChange={(next) => handleChange("breedId", next ?? "")}
                  options={breedOptions}
                  historyItems={breedHistory}
                  disabled={updateCat.isPending}
                  loading={isBreedsLoading || isBreedMasterLoading}
                  historyLabel="最近の品種"
                  onOptionSelected={recordBreedSelection}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <MasterDataCombobox
                  label="色柄"
                  value={form.coatColorId || undefined}
                  onChange={(next) => handleChange("coatColorId", next ?? "")}
                  options={coatOptions}
                  historyItems={coatHistory}
                  disabled={updateCat.isPending}
                  loading={isCoatColorsLoading || isCoatMasterLoading}
                  historyLabel="最近の色柄"
                  onOptionSelected={recordCoatSelection}
                  description={COAT_COLOR_DESCRIPTION}
                  sanitizePattern={ALPHANUM_SPACE_HYPHEN_PATTERN}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="生年月日"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  required
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="マイクロチップ番号"
                  value={form.microchipNumber}
                  onChange={(e) => handleChange("microchipNumber", e.target.value)}
                  placeholder="15桁の番号"
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="登録番号"
                  value={form.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  placeholder="血統書登録番号"
                  disabled={updateCat.isPending}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Textarea
                  label="詳細説明"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  placeholder="特記事項や性格など"
                  disabled={updateCat.isPending}
                />
              </Grid.Col>
            </Grid>

            <Divider my="xs" />

            <TagSelector
              selectedTags={form.tagIds}
              onChange={(tagIds) => setForm(prev => ({ ...prev, tagIds }))}
              placeholder="タグを選択"
              label="タグ"
              disabled={updateCat.isPending}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={handleClose}
                disabled={updateCat.isPending}
                leftSection={<IconX size={16} />}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                loading={updateCat.isPending}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </UnifiedModal>
  );
}
````

## File: frontend/src/components/cats/PedigreeTab.tsx
````typescript
'use client';

import {
  Stack,
  Card,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Alert,
  Title,
  Grid,
  Paper,
  Anchor,
  Divider,
  SimpleGrid,
} from '@mantine/core';
import { IconAlertCircle, IconDna, IconUsers, IconBabyCarriage } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  useGetCatFamily,
  type ParentInfo,
  type SiblingInfo,
  type OffspringInfo,
  type AncestorInfo,
} from '@/lib/api/hooks/use-cats';

interface PedigreeTabProps {
  catId: string;
}

// 性別の表示ラベル
const GENDER_LABELS: Record<string, string> = {
  MALE: 'オス',
  FEMALE: 'メス',
  NEUTER: '去勢オス',
  SPAY: '避妊メス',
};

// 性別に応じた色
const getGenderColor = (gender: string): string => {
  switch (gender) {
    case 'MALE':
    case 'NEUTER':
      return 'blue';
    case 'FEMALE':
    case 'SPAY':
      return 'pink';
    default:
      return 'gray';
  }
};

/**
 * 祖先カード（祖父母・曾祖父母用）
 */
function AncestorCard({
  ancestor,
  label,
}: {
  ancestor: AncestorInfo | null;
  label: string;
}) {
  const router = useRouter();

  if (!ancestor || !ancestor.catName) {
    return (
      <Card p="xs" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Text size="xs" c="dimmed" ta="center">
          {label}: 情報なし
        </Text>
      </Card>
    );
  }

  const handleClick = () => {
    if (ancestor.pedigreeId) {
      router.push(`/pedigrees?tab=tree&id=${ancestor.pedigreeId}`);
    }
  };

  return (
    <Card
      p="xs"
      withBorder
      style={{
        cursor: ancestor.pedigreeId ? 'pointer' : 'default',
        transition: 'all 0.2s',
      }}
      onClick={handleClick}
    >
      <Stack gap={2}>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="sm" fw={500} lineClamp={1}>
          {ancestor.catName}
        </Text>
        {ancestor.pedigreeId && (
          <Text size="xs" c="blue" fw={500}>
            {ancestor.pedigreeId}
          </Text>
        )}
        {ancestor.coatColor && (
          <Text size="xs" c="dimmed">
            {ancestor.coatColor}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

/**
 * 親情報カード（父または母）
 */
function ParentCard({
  parent,
  position,
}: {
  parent: ParentInfo | null;
  position: 'father' | 'mother';
}) {
  const router = useRouter();
  const borderColor = position === 'father' ? '#228be6' : '#e64980';
  const label = position === 'father' ? '父' : '母';

  if (!parent) {
    return (
      <Card
        p="md"
        withBorder
        style={{
          borderColor: '#dee2e6',
          borderStyle: 'dashed',
          borderWidth: 2,
        }}
      >
        <Text c="dimmed" ta="center">
          {label}親: 情報なし
        </Text>
      </Card>
    );
  }

  const handleCatClick = () => {
    if (parent.id) {
      router.push(`/cats/${parent.id}`);
    }
  };

  const handlePedigreeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (parent.pedigreeId) {
      router.push(`/pedigrees?tab=tree&id=${parent.pedigreeId}`);
    }
  };

  const coatColorName =
    typeof parent.coatColor === 'string'
      ? parent.coatColor
      : parent.coatColor?.name ?? null;

  return (
    <Card
      p="md"
      withBorder
      style={{
        borderColor,
        borderWidth: 2,
        cursor: parent.id ? 'pointer' : 'default',
      }}
      onClick={handleCatClick}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="xs" c="dimmed">
              {label}親
            </Text>
            <Text fw={600} size="lg">
              {parent.name}
            </Text>
          </div>
          {parent.gender && (
            <Badge color={getGenderColor(parent.gender)} size="sm">
              {GENDER_LABELS[parent.gender] || parent.gender}
            </Badge>
          )}
        </Group>

        {parent.pedigreeId && (
          <Anchor
            size="sm"
            c="blue"
            onClick={handlePedigreeClick}
            style={{ cursor: 'pointer' }}
          >
            血統書: {parent.pedigreeId}
          </Anchor>
        )}

        {parent.birthDate && (
          <Text size="sm" c="dimmed">
            生年月日: {format(new Date(parent.birthDate), 'yyyy年MM月dd日', { locale: ja })}
          </Text>
        )}

        {parent.breed && (
          <Badge size="sm" variant="light">
            {parent.breed.name}
          </Badge>
        )}

        {coatColorName && (
          <Text size="sm" c="dimmed">
            毛色: {coatColorName}
          </Text>
        )}

        {/* 祖父母情報（Pedigreeから取得） */}
        {(parent.father || parent.mother) && (
          <>
            <Divider my="xs" />
            <Text size="xs" fw={500} c="dimmed">
              祖父母
            </Text>
            <SimpleGrid cols={2} spacing="xs">
              <AncestorCard ancestor={parent.father} label="祖父" />
              <AncestorCard ancestor={parent.mother} label="祖母" />
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Card>
  );
}

/**
 * 兄弟姉妹リスト
 */
function SiblingsList({ siblings }: { siblings: SiblingInfo[] }) {
  const router = useRouter();

  if (siblings.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        兄弟姉妹はいません（両親が一致する猫のみ表示）
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {siblings.map((sibling) => (
        <Card
          key={sibling.id}
          p="sm"
          withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/cats/${sibling.id}`)}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="wrap">
              <Text fw={500}>{sibling.name}</Text>
              <Badge size="sm" color={getGenderColor(sibling.gender)}>
                {GENDER_LABELS[sibling.gender] || sibling.gender}
              </Badge>
              {sibling.breed && (
                <Badge size="sm" variant="light">
                  {sibling.breed.name}
                </Badge>
              )}
              <Text size="sm" c="dimmed">
                {format(new Date(sibling.birthDate), 'yyyy/MM/dd', { locale: ja })}
              </Text>
            </Group>
            {sibling.pedigreeId && (
              <Anchor
                size="sm"
                c="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/pedigrees?tab=tree&id=${sibling.pedigreeId}`);
                }}
              >
                {sibling.pedigreeId}
              </Anchor>
            )}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * 子猫リスト
 */
function OffspringList({ offspring }: { offspring: OffspringInfo[] }) {
  const router = useRouter();

  if (offspring.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        子猫はいません
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {offspring.map((child) => (
        <Card
          key={child.id}
          p="sm"
          withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/cats/${child.id}`)}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="wrap">
              <Text fw={500}>{child.name}</Text>
              <Badge size="sm" color={getGenderColor(child.gender)}>
                {GENDER_LABELS[child.gender] || child.gender}
              </Badge>
              {child.breed && (
                <Badge size="sm" variant="light">
                  {child.breed.name}
                </Badge>
              )}
              <Text size="sm" c="dimmed">
                {format(new Date(child.birthDate), 'yyyy/MM/dd', { locale: ja })}
              </Text>
              {child.otherParent && (
                <Text size="sm" c="dimmed">
                  相手: {child.otherParent.name}
                </Text>
              )}
            </Group>
            {child.pedigreeId && (
              <Anchor
                size="sm"
                c="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/pedigrees?tab=tree&id=${child.pedigreeId}`);
                }}
              >
                {child.pedigreeId}
              </Anchor>
            )}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * 簡易家系図コンポーネント
 */
function SimpleFamilyTree({
  cat,
  father,
  mother,
}: {
  cat: {
    id: string;
    name: string;
    gender: string;
    pedigreeId: string | null;
  };
  father: ParentInfo | null;
  mother: ParentInfo | null;
}) {
  const router = useRouter();

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Title order={5}>
          <Group gap="xs">
            <IconDna size={20} />
            簡易家系図
          </Group>
        </Title>

        {/* 本猫 */}
        <Card
          p="md"
          withBorder
          style={{
            borderColor: getGenderColor(cat.gender) === 'blue' ? '#228be6' : '#e64980',
            borderWidth: 3,
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
        >
          <Group justify="center">
            <Stack gap="xs" align="center">
              <Text fw={700} size="lg">
                {cat.name}（本猫）
              </Text>
              <Badge color={getGenderColor(cat.gender)}>
                {GENDER_LABELS[cat.gender] || cat.gender}
              </Badge>
              {cat.pedigreeId && (
                <Anchor
                  size="sm"
                  c="blue"
                  onClick={() => router.push(`/pedigrees?tab=tree&id=${cat.pedigreeId}`)}
                >
                  血統書: {cat.pedigreeId}
                </Anchor>
              )}
            </Stack>
          </Group>
        </Card>

        {/* 両親 */}
        <Grid>
          <Grid.Col span={6}>
            <ParentCard parent={father} position="father" />
          </Grid.Col>
          <Grid.Col span={6}>
            <ParentCard parent={mother} position="mother" />
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
}

/**
 * 血統タブコンポーネント
 */
export function PedigreeTab({ catId }: PedigreeTabProps) {
  const { data: familyData, isLoading, error } = useGetCatFamily(catId);

  if (isLoading) {
    return (
      <Center style={{ minHeight: '200px' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !familyData) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
        家族情報を読み込めませんでした。
      </Alert>
    );
  }

  const { cat, father, mother, siblings, offspring } = familyData;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="lg">
        {/* 簡易家系図 */}
        <SimpleFamilyTree cat={cat} father={father} mother={mother} />

        {/* 兄弟姉妹 */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={5}>
              <Group gap="xs">
                <IconUsers size={20} />
                兄弟姉妹（両親が一致）
              </Group>
            </Title>
            <SiblingsList siblings={siblings} />
          </Stack>
        </Paper>

        {/* 子猫 */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={5}>
              <Group gap="xs">
                <IconBabyCarriage size={20} />
                子猫
              </Group>
            </Title>
            <OffspringList offspring={offspring} />
          </Stack>
        </Paper>
      </Stack>
    </Card>
  );
}
````

## File: backend/prisma/schema.prisma
````prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Tenant {
  id          String            @id @default(uuid())
  name        String
  slug        String            @unique
  isActive    Boolean           @default(true) @map("is_active")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  invitations InvitationToken[]
  settings    TenantSettings?
  users       User[]
  pedigreePrintSetting PedigreePrintSetting?

  @@index([slug])
  @@index([isActive])
  @@map("tenants")
}

model TenantSettings {
  id               String   @id @default(uuid())
  tenantId         String   @unique @map("tenant_id")
  tagColorDefaults Json?    @map("tag_color_defaults")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  tenant           Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_settings")
}

model InvitationToken {
  id        String    @id @default(uuid())
  email     String
  token     String    @unique
  role      UserRole
  tenantId  String    @map("tenant_id")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")
  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([token])
  @@index([tenantId])
  @@index([expiresAt])
  @@map("invitation_tokens")
}

model User {
  id                   String             @id @default(uuid())
  clerkId              String             @unique @map("clerk_id")
  email                String             @unique
  firstName            String?            @map("first_name")
  lastName             String?            @map("last_name")
  role                 UserRole           @default(USER)
  isActive             Boolean            @default(true) @map("is_active")
  passwordHash         String?            @map("password_hash")
  refreshToken         String?            @map("refresh_token")
  failedLoginAttempts  Int                @default(0) @map("failed_login_attempts")
  lockedUntil          DateTime?          @map("locked_until")
  lastLoginAt          DateTime?          @map("last_login_at")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")
  resetPasswordExpires DateTime?          @map("reset_password_expires")
  resetPasswordToken   String?            @map("reset_password_token")
  tenantId             String?            @map("tenant_id")
  birthPlans           BirthPlan[]
  breedingRecords      BreedingRecord[]
  breedingSchedules    BreedingSchedule[]
  careRecords          CareRecord[]
  displayPreference    DisplayPreference?
  loginAttempts        LoginAttempt[]
  medicalRecords       MedicalRecord[]
  pregnancyChecks      PregnancyCheck[]
  schedules            Schedule[]
  staff                Staff?
  tenant               Tenant?            @relation(fields: [tenantId], references: [id])
  weightRecords        WeightRecord[]

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@index([lastLoginAt])
  @@index([tenantId])
  @@index([role, isActive])
  @@index([isActive, lastLoginAt])
  @@index([tenantId, role])
  @@map("users")
}

model DisplayPreference {
  id                     String          @id @default(uuid())
  userId                 String          @unique @map("user_id")
  breedNameMode          DisplayNameMode @default(CANONICAL) @map("breed_name_mode")
  coatColorNameMode      DisplayNameMode @default(CANONICAL) @map("coat_color_name_mode")
  breedNameOverrides     Json?           @map("breed_name_overrides")
  coatColorNameOverrides Json?           @map("coat_color_name_overrides")
  createdAt              DateTime        @default(now()) @map("created_at")
  updatedAt              DateTime        @updatedAt @map("updated_at")
  user                   User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("display_preferences")
}

model LoginAttempt {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  email     String
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  success   Boolean
  reason    String?
  createdAt DateTime @default(now()) @map("created_at")
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([email])
  @@index([success])
  @@index([createdAt])
  @@index([email, createdAt])
  @@index([userId, createdAt])
  @@index([success, createdAt])
  @@map("login_attempts")
}

model Breed {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("breeds")
}

model CoatColor {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("coat_colors")
}

model Gender {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@map("genders")
}

model Cat {
  id                    String                 @id @default(uuid())
  registrationNumber    String?                @unique @map("registration_number")
  name                  String
  breedId               String?                @map("breed_id")
  birthDate             DateTime               @map("birth_date")
  description           String?                @map("notes")
  fatherId              String?                @map("father_id")
  motherId              String?                @map("mother_id")
  createdAt             DateTime               @default(now()) @map("created_at")
  updatedAt             DateTime               @updatedAt @map("updated_at")
  pedigreeId            String?                @map("pedigree_id")
  gender                String
  coatColorId           String?                @map("coat_color_id")
  isInHouse             Boolean                @default(true) @map("is_in_house")
  microchipNumber       String?                @unique @map("microchip_number")
  isGraduated           Boolean                @default(false) @map("is_graduated")
  birthPlans            BirthPlan[]            @relation("BirthPlanMother")
  femaleBreedingRecords BreedingRecord[]       @relation("FemaleBreeding")
  maleBreedingRecords   BreedingRecord[]       @relation("MaleBreeding")
  maleBreedingSchedules BreedingSchedule[]     @relation("BreedingScheduleMale")
  femaleBreedingSchedules BreedingSchedule[]   @relation("BreedingScheduleFemale")
  careRecords           CareRecord[]
  tags                  CatTag[]
  breed                 Breed?                 @relation(fields: [breedId], references: [id])
  coatColor             CoatColor?             @relation(fields: [coatColorId], references: [id])
  father                Cat?                   @relation("CatFather", fields: [fatherId], references: [id])
  fatherOf              Cat[]                  @relation("CatFather")
  mother                Cat?                   @relation("CatMother", fields: [motherId], references: [id])
  motherOf              Cat[]                  @relation("CatMother")
  pedigree              Pedigree?              @relation("CatPedigree", fields: [pedigreeId], references: [pedigreeId])
  galleryEntries        GalleryEntry[]         @relation("GalleryEntryCat")
  graduation            Graduation?
  kittenDispositions    KittenDisposition[]
  medicalRecords        MedicalRecord[]
  pregnancyChecks       PregnancyCheck[]       @relation("PregnancyCheckMother")
  scheduleCats          ScheduleCat[]
  schedules             Schedule[]
  tagHistory            TagAssignmentHistory[]
  weightRecords         WeightRecord[]

  @@index([breedId])
  @@index([coatColorId])
  @@index([fatherId])
  @@index([motherId])
  @@index([birthDate])
  @@index([name])
  @@index([gender])
  @@index([isInHouse])
  @@index([isGraduated])
  @@index([registrationNumber])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedId, name])
  @@index([isInHouse, isGraduated])
  @@index([birthDate, gender])
  @@map("cats")
}

model BreedingRecord {
  id              String         @id @default(uuid())
  maleId          String         @map("male_id")
  femaleId        String         @map("female_id")
  breedingDate    DateTime       @map("breeding_date")
  expectedDueDate DateTime?      @map("expected_due_date")
  actualDueDate   DateTime?      @map("actual_due_date")
  numberOfKittens Int?           @map("number_of_kittens")
  notes           String?
  status          BreedingStatus @default(PLANNED)
  recordedBy      String         @map("recorded_by")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  female          Cat            @relation("FemaleBreeding", fields: [femaleId], references: [id])
  male            Cat            @relation("MaleBreeding", fields: [maleId], references: [id])
  recorder        User           @relation(fields: [recordedBy], references: [id])

  @@index([maleId])
  @@index([femaleId])
  @@index([breedingDate])
  @@index([status])
  @@index([recordedBy])
  @@index([maleId, femaleId])
  @@index([maleId, breedingDate])
  @@index([femaleId, breedingDate])
  @@index([breedingDate, status])
  @@map("breeding_records")
}

model BreedingNgRule {
  id               String             @id @default(uuid())
  name             String
  description      String?
  type             BreedingNgRuleType @default(TAG_COMBINATION)
  maleConditions   String[]           @default([]) @map("male_conditions")
  femaleConditions String[]           @default([]) @map("female_conditions")
  maleNames        String[]           @default([]) @map("male_names")
  femaleNames      String[]           @default([]) @map("female_names")
  generationLimit  Int?               @map("generation_limit")
  active           Boolean            @default(true)
  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  @@map("breeding_ng_rules")
}

// 交配スケジュール - 交配期間の管理
model BreedingSchedule {
  id         String                  @id @default(uuid())
  maleId     String                  @map("male_id")
  femaleId   String                  @map("female_id")
  startDate  DateTime                @map("start_date")
  duration   Int                     // 日数
  status     BreedingScheduleStatus  @default(SCHEDULED)
  notes      String?
  recordedBy String                  @map("recorded_by")
  createdAt  DateTime                @default(now()) @map("created_at")
  updatedAt  DateTime                @updatedAt @map("updated_at")

  male       Cat                     @relation("BreedingScheduleMale", fields: [maleId], references: [id])
  female     Cat                     @relation("BreedingScheduleFemale", fields: [femaleId], references: [id])
  recorder   User                    @relation(fields: [recordedBy], references: [id])
  checks     MatingCheck[]

  @@index([maleId])
  @@index([femaleId])
  @@index([startDate])
  @@index([status])
  @@index([maleId, startDate])
  @@index([femaleId, startDate])
  @@map("breeding_schedules")
}

// 交配チェック - 交配確認回数の記録
model MatingCheck {
  id         String           @id @default(uuid())
  scheduleId String           @map("schedule_id")
  checkDate  DateTime         @map("check_date")
  count      Int              @default(1)
  createdAt  DateTime         @default(now()) @map("created_at")

  schedule   BreedingSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@index([checkDate])
  @@map("mating_checks")
}

enum BreedingScheduleStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model PregnancyCheck {
  id         String          @id @default(uuid())
  checkDate  DateTime        @map("check_date")
  status     PregnancyStatus @default(SUSPECTED)
  notes      String?
  recordedBy String          @map("recorded_by")
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")
  motherId   String          @map("mother_id")
  fatherId   String?         @map("father_id")
  matingDate DateTime?       @map("mating_date")
  mother     Cat             @relation("PregnancyCheckMother", fields: [motherId], references: [id])
  recorder   User            @relation(fields: [recordedBy], references: [id])

  @@index([motherId])
  @@index([fatherId])
  @@index([checkDate])
  @@index([status])
  @@index([recordedBy])
  @@index([motherId, checkDate])
  @@index([status, checkDate])
  @@map("pregnancy_checks")
}

model BirthPlan {
  id                 String              @id @default(uuid())
  status             BirthStatus         @default(EXPECTED)
  notes              String?
  recordedBy         String              @map("recorded_by")
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  actualBirthDate    DateTime?           @map("actual_birth_date")
  actualKittens      Int?                @map("actual_kittens")
  expectedBirthDate  DateTime            @map("expected_birth_date")
  expectedKittens    Int?                @map("expected_kittens")
  motherId           String              @map("mother_id")
  fatherId           String?             @map("father_id")
  matingDate         DateTime?           @map("mating_date")
  completedAt        DateTime?           @map("completed_at")
  mother             Cat                 @relation("BirthPlanMother", fields: [motherId], references: [id])
  recorder           User                @relation(fields: [recordedBy], references: [id])
  kittenDispositions KittenDisposition[]

  @@index([motherId])
  @@index([fatherId])
  @@index([expectedBirthDate])
  @@index([status])
  @@index([recordedBy])
  @@index([actualBirthDate])
  @@index([motherId, expectedBirthDate])
  @@index([status, expectedBirthDate])
  @@index([expectedBirthDate, status])
  @@map("birth_plans")
}

model KittenDisposition {
  id                String          @id @default(uuid())
  birthRecordId     String          @map("birth_record_id")
  kittenId          String?         @map("kitten_id")
  name              String
  gender            String
  disposition       DispositionType
  trainingStartDate DateTime?       @map("training_start_date")
  saleInfo          Json?           @map("sale_info")
  deathDate         DateTime?       @map("death_date")
  deathReason       String?         @map("death_reason")
  notes             String?
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  birthRecord       BirthPlan       @relation(fields: [birthRecordId], references: [id], onDelete: Cascade)
  kitten            Cat?            @relation(fields: [kittenId], references: [id])

  @@index([birthRecordId])
  @@index([kittenId])
  @@map("kitten_dispositions")
}

model CareRecord {
  id           String    @id @default(uuid())
  catId        String    @map("cat_id")
  careType     CareType  @map("care_type")
  description  String
  careDate     DateTime  @map("care_date")
  nextDueDate  DateTime? @map("next_due_date")
  cost         Float?
  veterinarian String?
  notes        String?
  recordedBy   String    @map("recorded_by")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  cat          Cat       @relation(fields: [catId], references: [id])
  recorder     User      @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([careDate])
  @@index([careType])
  @@index([recordedBy])
  @@index([nextDueDate])
  @@index([catId, careDate])
  @@index([catId, careType])
  @@index([careType, careDate])
  @@index([nextDueDate, careType])
  @@map("care_records")
}

// 体重記録モデル - 子猫の体重推移を追跡
model WeightRecord {
  id         String   @id @default(uuid())
  catId      String   @map("cat_id")
  weight     Float    // グラム単位
  recordedAt DateTime @default(now()) @map("recorded_at")
  notes      String?
  recordedBy String   @map("recorded_by")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  recorder   User     @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([recordedAt])
  @@index([catId, recordedAt])
  @@map("weight_records")
}

model Schedule {
  id             String             @id @default(uuid())
  title          String
  description    String?
  scheduleDate   DateTime           @map("schedule_date")
  scheduleType   ScheduleType       @map("schedule_type")
  status         ScheduleStatus     @default(PENDING)
  priority       Priority           @default(MEDIUM)
  catId          String?            @map("cat_id")
  assignedTo     String             @map("assigned_to")
  createdAt      DateTime           @default(now()) @map("created_at")
  updatedAt      DateTime           @updatedAt @map("updated_at")
  careType       CareType?          @map("care_type")
  endDate        DateTime?          @map("end_date")
  name           String             @map("name")
  recurrenceRule String?            @map("recurrence_rule")
  timezone       String?            @map("timezone")
  medicalRecords MedicalRecord[]
  scheduleCats   ScheduleCat[]
  reminders      ScheduleReminder[]
  tags           ScheduleTag[]
  assignee       User               @relation(fields: [assignedTo], references: [id])
  cat            Cat?               @relation(fields: [catId], references: [id])

  @@index([scheduleDate])
  @@index([endDate])
  @@index([status])
  @@index([catId])
  @@index([assignedTo])
  @@index([careType])
  @@index([scheduleType])
  @@index([priority])
  @@index([scheduleDate, status])
  @@index([catId, scheduleDate])
  @@index([assignedTo, scheduleDate])
  @@index([scheduleType, scheduleDate])
  @@index([status, priority])
  @@map("schedules")
}

model ScheduleReminder {
  id              String                   @id @default(uuid())
  scheduleId      String                   @map("schedule_id")
  timingType      ReminderTimingType       @map("timing_type")
  remindAt        DateTime?                @map("remind_at")
  offsetValue     Int?                     @map("offset_value")
  offsetUnit      ReminderOffsetUnit?      @map("offset_unit")
  relativeTo      ReminderRelativeTo?      @map("relative_to")
  channel         ReminderChannel          @map("channel")
  repeatFrequency ReminderRepeatFrequency? @map("repeat_frequency")
  repeatInterval  Int?                     @map("repeat_interval")
  repeatCount     Int?                     @map("repeat_count")
  repeatUntil     DateTime?                @map("repeat_until")
  notes           String?
  isActive        Boolean                  @default(true) @map("is_active")
  createdAt       DateTime                 @default(now()) @map("created_at")
  updatedAt       DateTime                 @updatedAt @map("updated_at")
  schedule        Schedule                 @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@map("schedule_reminders")
}

model CareTag {
  id           String        @id @default(uuid())
  slug         String        @unique
  label        String
  level        Int           @default(1)
  parentId     String?       @map("parent_id")
  description  String?
  isActive     Boolean       @default(true) @map("is_active")
  priority     Int?
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  parent       CareTag?      @relation("CareTagHierarchy", fields: [parentId], references: [id])
  children     CareTag[]     @relation("CareTagHierarchy")
  scheduleTags ScheduleTag[]

  @@index([parentId])
  @@index([level])
  @@map("care_tags")
}

model ScheduleTag {
  scheduleId String   @map("schedule_id")
  careTagId  String   @map("care_tag_id")
  createdAt  DateTime @default(now()) @map("created_at")
  careTag    CareTag  @relation(fields: [careTagId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, careTagId])
  @@map("schedule_tags")
}

model ScheduleCat {
  scheduleId String   @map("schedule_id")
  catId      String   @map("cat_id")
  createdAt  DateTime @default(now()) @map("created_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, catId])
  @@map("schedule_cats")
}

model MedicalVisitType {
  id           String          @id @default(uuid())
  key          String?         @unique
  name         String
  description  String?
  displayOrder Int             @default(0) @map("display_order")
  isActive     Boolean         @default(true) @map("is_active")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")
  records      MedicalRecord[]

  @@index([displayOrder])
  @@map("medical_visit_types")
}

model MedicalRecord {
  id             String                    @id @default(uuid())
  catId          String                    @map("cat_id")
  scheduleId     String?                   @map("schedule_id")
  recordedBy     String                    @map("recorded_by")
  visitDate      DateTime                  @map("visit_date")
  symptomDetails Json?                     @map("symptom_details")
  diagnosis      String?                   @map("diagnosis")
  treatmentPlan  String?                   @map("treatment_plan")
  medications    Json?                     @map("medications")
  followUpDate   DateTime?                 @map("follow_up_date")
  status         MedicalRecordStatus       @default(TREATING)
  notes          String?
  createdAt      DateTime                  @default(now()) @map("created_at")
  updatedAt      DateTime                  @updatedAt @map("updated_at")
  diseaseName    String?                   @map("disease_name")
  symptom        String?                   @map("symptom")
  hospitalName   String?                   @map("hospital_name")
  visitTypeId    String?                   @map("visit_type_id")
  attachments    MedicalRecordAttachment[]
  tags           MedicalRecordTag[]
  cat            Cat                       @relation(fields: [catId], references: [id])
  recorder       User                      @relation(fields: [recordedBy], references: [id])
  schedule       Schedule?                 @relation(fields: [scheduleId], references: [id])
  visitType      MedicalVisitType?         @relation(fields: [visitTypeId], references: [id])

  @@index([catId])
  @@index([visitDate])
  @@index([scheduleId])
  @@index([visitTypeId])
  @@index([status])
  @@index([recordedBy])
  @@index([catId, visitDate])
  @@index([visitTypeId, visitDate])
  @@index([status, visitDate])
  @@map("medical_records")
}

model MedicalRecordAttachment {
  id              String        @id @default(uuid())
  medicalRecordId String        @map("medical_record_id")
  url             String
  fileName        String?       @map("file_name")
  fileType        String?       @map("file_type")
  fileSize        Int?          @map("file_size")
  capturedAt      DateTime?     @map("captured_at")
  description     String?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)

  @@index([medicalRecordId])
  @@map("medical_record_attachments")
}

model MedicalRecordTag {
  medicalRecordId String        @map("medical_record_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  tagId           String        @map("tag_id")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)
  tag             Tag           @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([medicalRecordId, tagId])
  @@map("medical_record_tags")
}

model TagCategory {
  id           String     @id @default(uuid())
  key          String     @unique
  name         String
  description  String?
  color        String?    @default("#3B82F6")
  displayOrder Int        @default(0) @map("display_order")
  scopes       String[]   @default([])
  isActive     Boolean    @default(true) @map("is_active")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  textColor    String?    @default("#111827") @map("text_color")
  groups       TagGroup[]

  @@map("tag_categories")
}

model TagGroup {
  id           String      @id @default(uuid())
  categoryId   String      @map("category_id")
  name         String
  description  String?
  displayOrder Int         @default(0) @map("display_order")
  isActive     Boolean     @default(true) @map("is_active")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")
  color        String?     @default("#3B82F6")
  textColor    String?     @default("#111827") @map("text_color")
  category     TagCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  tags         Tag[]

  @@unique([categoryId, name])
  @@map("tag_groups")
}

model Tag {
  id                String                 @id @default(uuid())
  name              String
  color             String                 @default("#3B82F6")
  description       String?
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  displayOrder      Int                    @default(0) @map("display_order")
  allowsManual      Boolean                @default(true) @map("allows_manual")
  allowsAutomation  Boolean                @default(true) @map("allows_automation")
  metadata          Json?
  isActive          Boolean                @default(true) @map("is_active")
  groupId           String                 @map("group_id")
  textColor         String                 @default("#FFFFFF") @map("text_color")
  cats              CatTag[]
  medicalRecordTags MedicalRecordTag[]
  history           TagAssignmentHistory[]
  group             TagGroup               @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([groupId, name])
  @@index([groupId])
  @@map("tags")
}

model Pedigree {
  id               String     @id @default(uuid())
  pedigreeId       String     @unique @map("pedigree_id")
  title            String?    @map("title")
  catName          String?    @map("cat_name")
  catName2         String?    @map("cat_name2")
  breedCode        Int?       @map("breed_code")
  genderCode       Int?       @map("gender_code")
  eyeColor         String?    @map("eye_color")
  coatColorCode    Int?       @map("coat_color_code")
  birthDate        String?    @map("birth_date")
  breederName      String?    @map("breeder_name")
  ownerName        String?    @map("owner_name")
  registrationDate String?    @map("registration_date")
  brotherCount     Int?       @map("brother_count")
  sisterCount      Int?       @map("sister_count")
  notes            String?    @map("notes")
  notes2           String?    @map("notes2")
  otherNo          String?    @map("other_no")
  fatherTitle      String?    @map("father_title")
  fatherCatName    String?    @map("father_cat_name")
  fatherCatName2   String?    @map("father_cat_name2")
  fatherCoatColor  String?    @map("father_coat_color")
  fatherEyeColor   String?    @map("father_eye_color")
  fatherJCU        String?    @map("father_jcu")
  fatherOtherCode  String?    @map("father_other_code")
  motherTitle      String?    @map("mother_title")
  motherCatName    String?    @map("mother_cat_name")
  motherCatName2   String?    @map("mother_cat_name2")
  motherCoatColor  String?    @map("mother_coat_color")
  motherEyeColor   String?    @map("mother_eye_color")
  motherJCU        String?    @map("mother_jcu")
  motherOtherCode  String?    @map("mother_other_code")
  ffTitle          String?    @map("ff_title")
  ffCatName        String?    @map("ff_cat_name")
  ffCatColor       String?    @map("ff_cat_color")
  fmTitle          String?    @map("fm_title")
  fmCatName        String?    @map("fm_cat_name")
  fmCatColor       String?    @map("fm_cat_color")
  mfTitle          String?    @map("mf_title")
  mfCatName        String?    @map("mf_cat_name")
  mfCatColor       String?    @map("mf_cat_color")
  mmTitle          String?    @map("mm_title")
  mmCatName        String?    @map("mm_cat_name")
  mmCatColor       String?    @map("mm_cat_color")
  fffTitle         String?    @map("fff_title")
  fffCatName       String?    @map("fff_cat_name")
  fffCatColor      String?    @map("fff_cat_color")
  ffmTitle         String?    @map("ffm_title")
  ffmCatName       String?    @map("ffm_cat_name")
  ffmCatColor      String?    @map("ffm_cat_color")
  fmfTitle         String?    @map("fmf_title")
  fmfCatName       String?    @map("fmf_cat_name")
  fmfCatColor      String?    @map("fmf_cat_color")
  fmmTitle         String?    @map("fmm_title")
  fmmCatName       String?    @map("fmm_cat_name")
  fmmCatColor      String?    @map("fmm_cat_color")
  mffTitle         String?    @map("mff_title")
  mffCatName       String?    @map("mff_cat_name")
  mffCatColor      String?    @map("mff_cat_color")
  mfmTitle         String?    @map("mfm_title")
  mfmCatName       String?    @map("mfm_cat_name")
  mfmCatColor      String?    @map("mfm_cat_color")
  mmfTitle         String?    @map("mmf_title")
  mmfCatName       String?    @map("mmf_cat_name")
  mmfCatColor      String?    @map("mmf_cat_color")
  mmmTitle         String?    @map("mmm_title")
  mmmCatName       String?    @map("mmm_cat_name")
  mmmCatColor      String?    @map("mmm_cat_color")
  oldCode          String?    @map("old_code")
  createdAt        DateTime   @default(now()) @map("created_at")
  updatedAt        DateTime   @updatedAt @map("updated_at")
  fffjcu           String?    @map("fffjcu")
  ffjcu            String?    @map("ffjcu")
  ffmjcu           String?    @map("ffmjcu")
  fmfjcu           String?    @map("fmfjcu")
  fmjcu            String?    @map("fmjcu")
  fmmjcu           String?    @map("fmmjcu")
  mffjcu           String?    @map("mffjcu")
  mfjcu            String?    @map("mfjcu")
  mfmjcu           String?    @map("mfmjcu")
  mmfjcu           String?    @map("mmfjcu")
  mmjcu            String?    @map("mmjcu")
  mmmjcu           String?    @map("mmmjcu")
  cats             Cat[]      @relation("CatPedigree")
  breed            Breed?     @relation(fields: [breedCode], references: [code])
  coatColor        CoatColor? @relation(fields: [coatColorCode], references: [code])
  gender           Gender?    @relation(fields: [genderCode], references: [code])

  @@index([breedCode])
  @@index([genderCode])
  @@index([coatColorCode])
  @@index([catName])
  @@index([pedigreeId])
  @@index([catName2])
  @@index([eyeColor])
  @@index([breederName])
  @@index([ownerName])
  @@index([birthDate])
  @@index([registrationDate])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedCode, catName])
  @@map("pedigrees")
}

model CatTag {
  catId     String   @map("cat_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  cat       Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([catId, tagId])
  @@map("cat_tags")
}

model TagAutomationRule {
  id          String                   @id @default(uuid())
  key         String                   @unique
  name        String
  description String?
  triggerType TagAutomationTriggerType @map("trigger_type")
  eventType   TagAutomationEventType   @map("event_type")
  scope       String?                  @map("scope")
  isActive    Boolean                  @default(true) @map("is_active")
  priority    Int                      @default(0)
  config      Json?                    @map("config")
  createdAt   DateTime                 @default(now()) @map("created_at")
  updatedAt   DateTime                 @updatedAt @map("updated_at")
  history     TagAssignmentHistory[]
  runs        TagAutomationRun[]

  @@map("tag_automation_rules")
}

model TagAutomationRun {
  id           String                 @id @default(uuid())
  ruleId       String                 @map("rule_id")
  eventPayload Json?                  @map("event_payload")
  status       TagAutomationRunStatus @default(PENDING) @map("status")
  startedAt    DateTime?              @map("started_at")
  completedAt  DateTime?              @map("completed_at")
  errorMessage String?                @map("error_message")
  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")
  history      TagAssignmentHistory[]
  rule         TagAutomationRule      @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@index([ruleId])
  @@map("tag_automation_runs")
}

model TagAssignmentHistory {
  id              String              @id @default(uuid())
  catId           String              @map("cat_id")
  tagId           String              @map("tag_id")
  ruleId          String?             @map("rule_id")
  automationRunId String?             @map("automation_run_id")
  action          TagAssignmentAction @default(ASSIGNED)
  source          TagAssignmentSource @default(MANUAL)
  reason          String?
  metadata        Json?
  createdAt       DateTime            @default(now()) @map("created_at")
  automationRun   TagAutomationRun?   @relation(fields: [automationRunId], references: [id])
  cat             Cat                 @relation(fields: [catId], references: [id], onDelete: Cascade)
  rule            TagAutomationRule?  @relation(fields: [ruleId], references: [id])
  tag             Tag                 @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@index([catId])
  @@index([tagId])
  @@index([ruleId])
  @@index([automationRunId])
  @@map("tag_assignment_history")
}

model Staff {
  id               String              @id @default(uuid())
  userId           String?             @unique @map("user_id")
  name             String
  email            String?             @unique
  role             String              @default("スタッフ")
  color            String              @default("#4dabf7")
  isActive         Boolean             @default(true) @map("is_active")
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  workTimeTemplate Json?               @map("work_time_template")
  workingDays      Json?               @map("working_days")
  shifts           Shift[]
  user             User?               @relation(fields: [userId], references: [id])
  availabilities   StaffAvailability[]

  @@index([userId])
  @@index([name])
  @@index([email])
  @@index([isActive])
  @@index([isActive, role])
  @@map("staff")
}

model ShiftTemplate {
  id           String   @id @default(uuid())
  name         String
  startTime    String   @map("start_time")
  endTime      String   @map("end_time")
  duration     Int
  color        String   @default("#4dabf7")
  breakTime    Int      @default(0) @map("break_time")
  isActive     Boolean  @default(true) @map("is_active")
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  shifts       Shift[]

  @@index([name])
  @@index([displayOrder])
  @@map("shift_templates")
}

model Shift {
  id              String         @id @default(uuid())
  staffId         String         @map("staff_id")
  shiftDate       DateTime       @map("shift_date")
  displayName     String?        @map("display_name")
  templateId      String?        @map("template_id")
  startTime       DateTime?      @map("start_time")
  endTime         DateTime?      @map("end_time")
  breakDuration   Int?           @map("break_duration")
  status          ShiftStatus    @default(SCHEDULED)
  notes           String?
  actualStartTime DateTime?      @map("actual_start_time")
  actualEndTime   DateTime?      @map("actual_end_time")
  metadata        Json?
  mode            ShiftMode      @default(SIMPLE)
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  tasks           ShiftTask[]
  staff           Staff          @relation(fields: [staffId], references: [id], onDelete: Cascade)
  template        ShiftTemplate? @relation(fields: [templateId], references: [id])

  @@index([staffId])
  @@index([templateId])
  @@index([shiftDate])
  @@index([status])
  @@index([mode])
  @@index([staffId, shiftDate])
  @@index([shiftDate, status])
  @@index([status, shiftDate])
  @@map("shifts")
}

model ShiftTask {
  id          String     @id @default(uuid())
  shiftId     String     @map("shift_id")
  taskType    String     @map("task_type")
  description String
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(PENDING)
  startTime   DateTime?  @map("start_time")
  endTime     DateTime?  @map("end_time")
  notes       String?
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  shift       Shift      @relation(fields: [shiftId], references: [id], onDelete: Cascade)

  @@index([shiftId])
  @@index([status])
  @@map("shift_tasks")
}

model StaffAvailability {
  id          String   @id @default(uuid())
  staffId     String   @map("staff_id")
  dayOfWeek   Int      @map("day_of_week")
  startTime   String   @map("start_time")
  endTime     String   @map("end_time")
  isAvailable Boolean  @default(true) @map("is_available")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  staff       Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId])
  @@index([dayOfWeek])
  @@index([isAvailable])
  @@index([staffId, dayOfWeek])
  @@index([dayOfWeek, isAvailable])
  @@map("staff_availabilities")
}

model ShiftSettings {
  id                       String    @id @default(uuid())
  organizationId           String?   @map("organization_id")
  defaultMode              ShiftMode @default(SIMPLE) @map("default_mode")
  enabledModes             String[]  @default(["SIMPLE", "DETAILED"]) @map("enabled_modes")
  simpleRequireDisplayName Boolean   @default(false) @map("simple_require_display_name")
  detailedRequireTime      Boolean   @default(true) @map("detailed_require_time")
  detailedRequireTemplate  Boolean   @default(false) @map("detailed_require_template")
  detailedEnableTasks      Boolean   @default(true) @map("detailed_enable_tasks")
  detailedEnableActual     Boolean   @default(true) @map("detailed_enable_actual")
  customFields             Json?     @map("custom_fields")
  createdAt                DateTime  @default(now()) @map("created_at")
  updatedAt                DateTime  @updatedAt @map("updated_at")

  @@map("shift_settings")
}

model Graduation {
  id            String   @id @default(uuid())
  catId         String   @unique @map("cat_id")
  transferDate  DateTime @map("transfer_date")
  destination   String
  notes         String?
  catSnapshot   Json     @map("cat_snapshot")
  transferredBy String?  @map("transferred_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  cat           Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)

  @@index([transferDate])
  @@index([catId])
  @@map("graduations")
}

model GalleryEntry {
  id            String          @id @default(uuid())
  category      GalleryCategory
  name          String
  gender        String
  coatColor     String?         @map("coat_color")
  breed         String?
  catId         String?         @map("cat_id")
  transferDate  DateTime?       @map("transfer_date")
  destination   String?
  externalLink  String?         @map("external_link")
  transferredBy String?         @map("transferred_by")
  catSnapshot   Json?           @map("cat_snapshot")
  notes         String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cat           Cat?            @relation("GalleryEntryCat", fields: [catId], references: [id])
  media         GalleryMedia[]

  @@index([category])
  @@index([catId])
  @@index([createdAt])
  @@index([category, createdAt])
  @@map("gallery_entries")
}

model GalleryMedia {
  id             String       @id @default(uuid())
  galleryEntryId String       @map("gallery_entry_id")
  type           MediaType
  url            String
  thumbnailUrl   String?      @map("thumbnail_url")
  order          Int          @default(0)
  createdAt      DateTime     @default(now()) @map("created_at")
  galleryEntry   GalleryEntry @relation(fields: [galleryEntryId], references: [id], onDelete: Cascade)

  @@index([galleryEntryId])
  @@index([order])
  @@map("gallery_media")
}

// ==========================================
// Pedigree Print Settings
// ==========================================

model PedigreePrintSetting {
  id        String   @id @default(uuid())
  tenantId  String?  @map("tenant_id")
  globalKey String?  @unique @map("global_key")
  settings  Json
  version   Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  tenant    Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId])
  @@map("pedigree_print_settings")
}

// ==========================================
// Print Template Management
// ==========================================

model PrintTemplate {
  id                String                @id @default(uuid())
  tenantId          String?               @map("tenant_id") // null = 共通テンプレート
  name              String
  description       String?
  category          PrintTemplateCategory @default(PEDIGREE)
  paperWidth        Int                   @map("paper_width")    // mm単位
  paperHeight       Int                   @map("paper_height")   // mm単位
  backgroundUrl     String?               @map("background_url")
  backgroundOpacity Int                   @default(100) @map("background_opacity") // 0-100%
  positions         Json                  // フィールド座標設定
  fontSizes         Json?                 @map("font_sizes")     // フォントサイズ設定
  isActive          Boolean               @default(true) @map("is_active")
  isDefault         Boolean               @default(false) @map("is_default")
  displayOrder      Int                   @default(0) @map("display_order")
  createdAt         DateTime              @default(now()) @map("created_at")
  updatedAt         DateTime              @updatedAt @map("updated_at")

  @@index([tenantId])
  @@index([category])
  @@index([isActive])
  @@index([name])
  @@index([tenantId, category, isActive])
  @@map("print_templates")
}

enum PrintTemplateCategory {
  PEDIGREE           // 血統書
  KITTEN_TRANSFER    // 子猫譲渡証明書
  HEALTH_CERTIFICATE // 健康診断書
  VACCINATION_RECORD // ワクチン接種記録
  BREEDING_RECORD    // 繁殖記録
  CONTRACT           // 契約書
  INVOICE            // 請求書/領収書
  CUSTOM             // カスタム書類
}

enum DisplayNameMode {
  CANONICAL
  CODE_AND_NAME
  CUSTOM
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  TENANT_ADMIN
}

enum BreedingStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum PregnancyStatus {
  CONFIRMED
  SUSPECTED
  NEGATIVE
  ABORTED
}

enum BirthStatus {
  EXPECTED
  BORN
  ABORTED
  STILLBORN
}

enum DispositionType {
  TRAINING
  SALE
  DECEASED
}

enum BreedingNgRuleType {
  TAG_COMBINATION
  INDIVIDUAL_PROHIBITION
  GENERATION_LIMIT
}

enum CareType {
  VACCINATION
  HEALTH_CHECK
  GROOMING
  DENTAL_CARE
  MEDICATION
  SURGERY
  OTHER
}

enum ScheduleType {
  BREEDING
  CARE
  APPOINTMENT
  REMINDER
  MAINTENANCE
}

enum ScheduleStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ReminderTimingType {
  ABSOLUTE
  RELATIVE
}

enum ReminderOffsetUnit {
  MINUTE
  HOUR
  DAY
  WEEK
  MONTH
}

enum ReminderRelativeTo {
  START_DATE
  END_DATE
  CUSTOM_DATE
}

enum ReminderChannel {
  IN_APP
  EMAIL
  SMS
  PUSH
}

enum ReminderRepeatFrequency {
  NONE
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  CUSTOM
}

enum MedicalRecordStatus {
  TREATING
  COMPLETED
}

enum TagAssignmentAction {
  ASSIGNED
  UNASSIGNED
}

enum TagAssignmentSource {
  MANUAL
  AUTOMATION
  SYSTEM
}

enum TagAutomationTriggerType {
  EVENT
  SCHEDULE
  MANUAL
}

enum TagAutomationEventType {
  BREEDING_PLANNED
  BREEDING_CONFIRMED
  PREGNANCY_CONFIRMED
  KITTEN_REGISTERED
  AGE_THRESHOLD
  CUSTOM
  PAGE_ACTION
  TAG_ASSIGNED
}

enum TagAutomationRunStatus {
  PENDING
  COMPLETED
  FAILED
}

enum ShiftMode {
  SIMPLE
  DETAILED
  CUSTOM
}

enum ShiftStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  ABSENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum GalleryCategory {
  KITTEN
  FATHER
  MOTHER
  GRADUATION
}

enum MediaType {
  IMAGE
  YOUTUBE
}
````

## File: frontend/src/app/cats/[id]/client.tsx
````typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Tabs,
  Flex,
  Badge,
  Loader,
  Center,
  Alert,
  Accordion,
  Divider,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconEdit, IconUser, IconAlertCircle, IconChevronDown, IconDna } from '@tabler/icons-react';
import { PedigreeTab } from '@/components/cats/PedigreeTab';
import { useGetCat, useGetCats, type Cat } from '@/lib/api/hooks/use-cats';
import { useGetBirthPlans, type BirthPlan, type KittenDisposition } from '@/lib/api/hooks/use-breeding';
import { useGetCareSchedules, useGetMedicalRecords, type CareSchedule, type MedicalRecord } from '@/lib/api/hooks/use-care';
import { useTransferCat } from '@/lib/api/hooks/use-graduation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { KittenManagementModal } from '@/components/kittens/KittenManagementModal';
import { notifications } from '@mantine/notifications';

type CatTagRelation = NonNullable<Cat['tags']>[number];
type KittenWithDisposition = Cat & { disposition: KittenDisposition['disposition'] };

type Props = {
  catId: string;
};

// Gender labels (English for consistency with registration forms)
const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  NEUTER: 'Neutered Male',
  SPAY: 'Spayed Female',
};

export default function CatDetailClient({ catId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URLパラメータからタブ状態を取得（デフォルトは 'basic'）
  const tabParam = searchParams.get('tab') || 'basic';
  
  // タブ切り替え時にURLを更新
  const handleTabChange = (nextTab: string | null) => {
    if (!nextTab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    router.push(`${pathname}?${nextParams.toString()}`);
  };
  
  const { data: cat, isLoading, error } = useGetCat(catId);
  const { data: catsResponse } = useGetCats();
  const { data: birthPlansResponse } = useGetBirthPlans();
  // 一時的にパラメータなしでクエリ
  const { data: careSchedulesResponse } = useGetCareSchedules({});
  const { data: medicalRecordsResponse } = useGetMedicalRecords({});
  const [managementModalOpened, { open: openManagementModal, close: closeManagementModal }] = useDisclosure(false);
   
  const [_selectedBirthPlanId, setSelectedBirthPlanId] = useState<string | undefined>();
  
  // 譲渡機能
  const { mutate: transferCat, isPending: isTransferring } = useTransferCat();
  
  // 譲渡情報のステート
  const [transferDestination, setTransferDestination] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !cat) {
    return (
      <Container size="lg" style={{ paddingTop: '2rem' }}>
        <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
          猫の情報を読み込めませんでした。
        </Alert>
        <Button
          mt="md"
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/cats')}
        >
          一覧へ戻る
        </Button>
      </Container>
    );
  }

  const catData = cat.data;
  
  if (!catData) {
    return null;
  }

  // 譲渡処理
  const handleTransfer = () => {
    if (!transferDestination || !transferDate) {
      notifications.show({
        title: '入力エラー',
        message: '譲渡先と譲渡日は必須項目です',
        color: 'red',
      });
      return;
    }

    transferCat(
      {
        catId: catData.id,
        data: {
          transferDate: new Date(transferDate).toISOString(),
          destination: transferDestination,
          notes: transferNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: '譲渡完了',
            message: `${catData.name}の譲渡記録を作成しました`,
            color: 'green',
          });
          // ギャラリーページへリダイレクト
          router.push('/gallery');
        },
        onError: (transferError) => {
          notifications.show({
            title: '譲渡失敗',
            message: transferError instanceof Error ? transferError.message : '譲渡処理に失敗しました',
            color: 'red',
          });
        },
      }
    );
  };

  return (
  <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* ヘッダー */}
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/cats')}
            >
              一覧へ戻る
            </Button>
            <Group gap="sm">
              <Button
                variant="outline"
                color="yellow"
                leftSection={<IconEdit size={16} />}
                onClick={() => router.push(`/cats/${catData.id}/edit`)}
              >
                編集
              </Button>
              <Button
                variant="outline"
                color="gray"
                leftSection={<IconUser size={16} />}
                onClick={() => router.push(`/cats/${catData.id}/pedigree`)}
              >
                血統表を見る
              </Button>
            </Group>
          </Flex>
        </Container>
      </Box>

      <Container size="lg" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* タブで詳細情報 - URLパラメータで状態を永続化 */}
        <Tabs value={tabParam} onChange={handleTabChange}>
          <Tabs.List grow>
            <Tabs.Tab value="basic">基本情報</Tabs.Tab>
            <Tabs.Tab value="pedigree" leftSection={<IconDna size={16} />}>血統</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                {/* 名前とステータス */}
                <div>
                  <Title order={2} mb="xs">{catData.name}</Title>
                  <Group gap="xs">
                    <Badge color={catData.isInHouse ? 'green' : 'gray'}>
                      {catData.isInHouse ? '在舎' : '不在'}
                    </Badge>
                    {catData.tags && catData.tags.length > 0 && (
                      <>
                        {catData.tags.map((catTag: CatTagRelation) => (
                          <Badge
                            key={catTag.tag.id}
                            color={catTag.tag.color || 'blue'}
                            variant="light"
                          >
                            {catTag.tag.name}
                          </Badge>
                        ))}
                      </>
                    )}
                  </Group>
                </div>

                <Divider />

                {/* 基本情報 */}
                <Stack gap="md">
                  <Group>
                    <Text fw={600} w={150}>品種:</Text>
                    <Text>{catData.breed?.name || '未登録'}</Text>
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>性別:</Text>
                    <Text>{GENDER_LABELS[catData.gender] || catData.gender}</Text>
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>生年月日:</Text>
                    <Text>{format(new Date(catData.birthDate), 'yyyy年MM月dd日', { locale: ja })}</Text>
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>色柄:</Text>
                    <Text>{catData.coatColor?.name || '未登録'}</Text>
                  </Group>
                  {catData.microchipNumber && (
                    <Group>
                      <Text fw={600} w={150}>マイクロチップ:</Text>
                      <Text>{catData.microchipNumber}</Text>
                    </Group>
                  )}
                  {catData.registrationNumber && (
                    <Group>
                      <Text fw={600} w={150}>登録番号:</Text>
                      <Text>{catData.registrationNumber}</Text>
                    </Group>
                  )}
                  {catData.description && (
                    <Box>
                      <Text fw={600} mb="xs">説明:</Text>
                      <Text>{catData.description}</Text>
                    </Box>
                  )}
                </Stack>

                <Divider />

                {/* 親情報 */}
                <Stack gap="md">
                  <Text fw={600} size="lg">親情報</Text>
                  <Group>
                    <Text fw={600} w={150}>父:</Text>
                    {catData.father ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => catData.father && router.push(`/cats/${catData.father.id}`)}
                      >
                        {catData.father.name}
                      </Button>
                    ) : (
                      <Text c="dimmed">未登録</Text>
                    )}
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>母:</Text>
                    {catData.mother ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => catData.mother && router.push(`/cats/${catData.mother.id}`)}
                      >
                        {catData.mother.name}
                      </Button>
                    ) : (
                      <Text c="dimmed">未登録</Text>
                    )}
                  </Group>
                </Stack>

                <Divider />

                {/* アコーディオンセクション */}
                <Accordion variant="contained">
                  {/* 出産記録（メスの場合のみ） */}
                  {(catData.gender === 'FEMALE' || catData.gender === 'SPAY') && (
                    <Accordion.Item value="births">
                      <Accordion.Control icon={<IconChevronDown size={16} />}>
                        出産記録
                      </Accordion.Control>
                      <Accordion.Panel>
                        {(() => {
                          const birthPlans: BirthPlan[] = birthPlansResponse?.data ?? [];
                          const completedBirthPlans = birthPlans.filter(
                            (plan) => plan.motherId === catData.id && plan.status === 'BORN'
                          );

                          if (completedBirthPlans.length === 0) {
                            return (
                              <Text c="dimmed" size="sm">
                                出産記録はまだありません
                              </Text>
                            );
                          }

                          const allKittens: Cat[] = catsResponse?.data ?? [];

                          return (
                            <Stack gap="md">
                              {completedBirthPlans.map((plan) => {
                                const dispositions = plan.kittenDispositions ?? [];
                                const latestDispositions = dispositions.reduce<KittenDisposition[]>((acc, disposition) => {
                                  const key = disposition.kittenId ?? disposition.id;
                                  const existingIndex = acc.findIndex((item) => (item.kittenId ?? item.id) === key);

                                  if (existingIndex === -1) {
                                    acc.push(disposition);
                                    return acc;
                                  }

                                  const existing = acc[existingIndex];
                                  if (new Date(disposition.createdAt) > new Date(existing.createdAt)) {
                                    acc[existingIndex] = disposition;
                                  }
                                  return acc;
                                }, []);

                                const trainingCount = latestDispositions.filter((disposition) => disposition.disposition === 'TRAINING').length;
                                const saleCount = latestDispositions.filter((disposition) => disposition.disposition === 'SALE').length;
                                const deceasedCount = latestDispositions.filter((disposition) => disposition.disposition === 'DECEASED').length;
                                const totalKittens = latestDispositions.length;

                                const kittens = latestDispositions
                                  .map((disposition) => {
                                    const kitten = allKittens.find((candidate) => candidate.id === disposition.kittenId);
                                    return kitten ? { ...kitten, disposition: disposition.disposition } : null;
                                  })
                                  .filter((kitten): kitten is KittenWithDisposition => kitten !== null);

                                return (
                                  <Card key={plan.id} withBorder padding="md">
                                    <Stack gap="sm">
                                      <Group justify="space-between" wrap="nowrap">
                                        <Group gap="md" wrap="wrap">
                                          <Text size="sm" fw={600}>
                                            父: {plan.father?.name || '不明'}
                                          </Text>
                                          <Text size="sm">
                                            出産日: {plan.matingDate ? format(new Date(plan.matingDate), 'yyyy/MM/dd', { locale: ja }) : '不明'}
                                          </Text>
                                          <Text size="sm">
                                            出産: {totalKittens}頭
                                          </Text>
                                          <Text size="sm" c="red">
                                            死亡: {deceasedCount}頭
                                          </Text>
                                          <Text size="sm" c="green">
                                            出荷: {saleCount}頭
                                          </Text>
                                          <Text size="sm" c="blue">
                                            養成: {trainingCount}頭
                                          </Text>
                                        </Group>
                                        <Button
                                          size="xs"
                                          variant="light"
                                          onClick={() => {
                                            setSelectedBirthPlanId(plan.id);
                                            openManagementModal();
                                          }}
                                        >
                                          修正
                                        </Button>
                                      </Group>

                                      {kittens.length > 0 && (
                                        <Accordion variant="separated">
                                          <Accordion.Item value="kittens">
                                            <Accordion.Control>
                                              <Text size="sm">子猫情報 ({kittens.length}頭)</Text>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                              <Stack gap="xs">
                                                {kittens.map((kitten) => {
                                                  const dispositionIcon =
                                                    kitten.disposition === 'TRAINING'
                                                      ? '🎓'
                                                      : kitten.disposition === 'SALE'
                                                        ? '💰'
                                                        : kitten.disposition === 'DECEASED'
                                                          ? '🌈'
                                                          : '';

                                                  return (
                                                    <Group key={kitten.id} justify="space-between" wrap="nowrap">
                                                      <Group gap="md" wrap="wrap">
                                                        <Text size="sm" fw={500} style={{ minWidth: '80px' }}>
                                                          {kitten.name}
                                                        </Text>
                                                        <Badge size="sm" color={kitten.gender === 'MALE' ? 'blue' : 'pink'}>
                                                          {kitten.gender === 'MALE' ? 'オス' : 'メス'}
                                                        </Badge>
                                                        <Text size="sm" c="dimmed">
                                                          {kitten.coatColor?.name || '色柄未登録'}
                                                        </Text>
                                                        {dispositionIcon && (
                                                          <Badge size="sm" variant="light">
                                                            {dispositionIcon}{' '}
                                                            {kitten.disposition === 'TRAINING'
                                                              ? '養成中'
                                                              : kitten.disposition === 'SALE'
                                                                ? '出荷済'
                                                                : '死亡'}
                                                          </Badge>
                                                        )}
                                                      </Group>
                                                    </Group>
                                                  );
                                                })}
                                              </Stack>
                                            </Accordion.Panel>
                                          </Accordion.Item>
                                        </Accordion>
                                      )}
                                    </Stack>
                                  </Card>
                                );
                              })}
                            </Stack>
                          );
                        })()}
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}

                  {/* ケアノート */}
                  <Accordion.Item value="care">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      ケアノート
                    </Accordion.Control>
                    <Accordion.Panel>
                      {(() => {
                        const careSchedules: CareSchedule[] = careSchedulesResponse?.data ?? [];
                        const catCareSchedules = careSchedules.filter(
                          (schedule) =>
                            schedule.cat?.id === catData.id ||
                            schedule.cats?.some((careCat) => careCat.id === catData.id)
                        );

                        if (catCareSchedules.length === 0) {
                          return (
                            <Text c="dimmed" size="sm">
                              ケアスケジュールの記録はまだありません
                            </Text>
                          );
                        }

                        return (
                          <Stack gap="xs">
                            {catCareSchedules.map((schedule) => (
                              <Group key={schedule.id} gap="md" wrap="nowrap">
                                <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                                  {schedule.name || schedule.title}
                                </Text>
                                <Text size="sm" c="dimmed">
                                  {format(new Date(schedule.scheduleDate), 'yyyy/MM/dd', { locale: ja })}
                                </Text>
                                <Text size="sm" style={{ flex: 1 }}>
                                  {schedule.description || 'メモなし'}
                                </Text>
                              </Group>
                            ))}
                          </Stack>
                        );
                      })()}
                    </Accordion.Panel>
                  </Accordion.Item>

                  {/* 医療記録 */}
                  <Accordion.Item value="medical">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      医療記録
                    </Accordion.Control>
                    <Accordion.Panel>
                      {(() => {
                        const medicalRecords: MedicalRecord[] = medicalRecordsResponse?.data ?? [];
                        const catMedicalRecords = medicalRecords.filter(
                          (record) => record.cat?.id === catData.id
                        );

                        if (catMedicalRecords.length === 0) {
                          return (
                            <Text c="dimmed" size="sm">
                              医療記録はまだありません
                            </Text>
                          );
                        }

                        return (
                          <Stack gap="xs">
                            {catMedicalRecords.map((record) => (
                              <Card key={record.id} withBorder padding="sm">
                                <Group gap="md" wrap="wrap">
                                  <Text size="sm" fw={500}>
                                    {format(new Date(record.visitDate), 'yyyy/MM/dd', { locale: ja })}
                                  </Text>
                                  <Text size="sm">
                                    症状: {record.symptom || '記載なし'}
                                  </Text>
                                  <Text size="sm">
                                    治療結果: {record.diagnosis || '記載なし'}
                                  </Text>
                                  <Badge size="sm" color={record.status === 'COMPLETED' ? 'green' : 'orange'}>
                                    {record.status === 'COMPLETED' ? '完了' : '治療中'}
                                  </Badge>
                                </Group>
                              </Card>
                            ))}
                          </Stack>
                        );
                      })()}
                    </Accordion.Panel>
                  </Accordion.Item>

                  {/* 譲渡情報 */}
                  <Accordion.Item value="transfer">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      譲渡情報
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="md">
                        <Group align="flex-end" wrap="nowrap">
                          <TextInput
                            label="譲渡先"
                            placeholder="譲渡先を入力"
                            value={transferDestination}
                            onChange={(e) => setTransferDestination(e.currentTarget.value)}
                            style={{ flex: 1 }}
                          />
                          <TextInput
                            label="譲渡日"
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.currentTarget.value)}
                            style={{ width: '180px' }}
                          />
                          <TextInput
                            label="備考"
                            placeholder="備考を入力"
                            value={transferNotes}
                            onChange={(e) => setTransferNotes(e.currentTarget.value)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            onClick={handleTransfer}
                            disabled={!transferDestination || !transferDate}
                            loading={isTransferring}
                          >
                            登録
                          </Button>
                        </Group>
                        <Text c="dimmed" size="xs">
                          ※ 登録後、この猫はギャラリーページへ移動されます
                        </Text>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="pedigree" pt="md">
            <PedigreeTab catId={catData.id} />
          </Tabs.Panel>
        </Tabs>

        {/* 子猫管理モーダル */}
        {(catData.gender === 'FEMALE' || catData.gender === 'SPAY') && (
          <KittenManagementModal
            opened={managementModalOpened}
            onClose={closeManagementModal}
            motherId={catData.id}
            onSuccess={() => {
              // データ再取得
              if (catsResponse) {
                window.location.reload();
              }
            }}
          />
        )}
      </Container>
    </Box>
  );
}
````

## File: frontend/src/app/gallery/components/GalleryTabs.tsx
````typescript
'use client';

/**
 * ギャラリータブコンポーネント
 * カテゴリ切り替えとURLクエリ同期
 */

import { Tabs, Group, Badge } from '@mantine/core';
import {
  IconBabyCarriage,
  IconGenderMale,
  IconGenderFemale,
  IconTrophy,
} from '@tabler/icons-react';
import { useGalleryTab, TAB_LABELS } from '../hooks/useGalleryTab';
import type { GalleryCategory } from '@/lib/api/hooks/use-gallery';

/**
 * タブアイコンマッピング
 */
const TAB_ICONS: Record<GalleryCategory, React.ReactNode> = {
  KITTEN: <IconBabyCarriage size={16} />,
  FATHER: <IconGenderMale size={16} />,
  MOTHER: <IconGenderFemale size={16} />,
  GRADUATION: <IconTrophy size={16} />,
};

/**
 * タブカラーマッピング
 */
const TAB_COLORS: Record<GalleryCategory, string> = {
  KITTEN: 'pink',
  FATHER: 'blue',
  MOTHER: 'violet',
  GRADUATION: 'yellow',
};

interface GalleryTabsProps {
  /** 各カテゴリの件数 */
  counts?: Record<GalleryCategory, number>;
  /** ローディング中フラグ */
  loading?: boolean;
}

/**
 * ギャラリータブコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryTabs counts={{ KITTEN: 5, FATHER: 3, MOTHER: 4, GRADUATION: 10 }} />
 * ```
 */
export function GalleryTabs({ counts, loading }: GalleryTabsProps) {
  const { currentTab, setTab, validTabs } = useGalleryTab();

  return (
    <Tabs
      value={currentTab}
      onChange={(value) => {
        if (value) {
          setTab(value as GalleryCategory);
        }
      }}
    >
      <Tabs.List>
        {validTabs.map((tab) => (
          <Tabs.Tab
            key={tab}
            value={tab}
            leftSection={TAB_ICONS[tab]}
            disabled={loading}
          >
            <Group gap="xs">
              <span>{TAB_LABELS[tab]}</span>
              {counts && counts[tab] !== undefined && (
                <Badge size="xs" variant="light" color={TAB_COLORS[tab]}>
                  {counts[tab]}
                </Badge>
              )}
            </Group>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
````

## File: frontend/src/app/gallery/components/GalleryAddModal.tsx
````typescript
'use client';

/**
 * ギャラリー追加モーダルコンポーネント
 * 新規エントリの作成フォーム
 */

import { useState } from 'react';
import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Text,
  Box,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import { ImageUploader } from './ImageUploader';
import { YouTubeInput } from './YouTubeInput';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type {
  GalleryCategory,
  CreateGalleryEntryDto,
} from '@/lib/api/hooks/use-gallery';

interface MediaItem {
  type: 'IMAGE' | 'YOUTUBE';
  url: string;
  thumbnailUrl?: string;
}

interface FormValues {
  name: string;
  gender: string;
  coatColor: string;
  breed: string;
  transferDate: Date | null;
  destination: string;
  externalLink: string;
  notes: string;
}

interface GalleryAddModalProps {
  /** 表示/非表示 */
  opened: boolean;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** 現在のカテゴリ */
  category: GalleryCategory;
  /** 送信時のコールバック */
  onSubmit: (dto: CreateGalleryEntryDto) => void;
  /** 送信中フラグ */
  loading?: boolean;
}

/**
 * カテゴリ別のフォームタイトル
 */
const CATEGORY_TITLES: Record<GalleryCategory, string> = {
  KITTEN: '子猫を追加',
  FATHER: '父猫を追加',
  MOTHER: '母猫を追加',
  GRADUATION: '卒業猫を追加',
};

/**
 * 性別オプション
 */
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'オス' },
  { value: 'FEMALE', label: 'メス' },
  { value: 'NEUTER', label: '去勢済みオス' },
  { value: 'SPAY', label: '避妊済みメス' },
];

/**
 * ギャラリー追加モーダルコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryAddModal
 *   opened={modalOpened}
 *   onClose={() => setModalOpened(false)}
 *   category="KITTEN"
 *   onSubmit={(dto) => createEntry(dto)}
 *   loading={isPending}
 * />
 * ```
 */
export function GalleryAddModal({
  opened,
  onClose,
  category,
  onSubmit,
  loading,
}: GalleryAddModalProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      gender: '',
      coatColor: '',
      breed: '',
      transferDate: null,
      destination: '',
      externalLink: '',
      notes: '',
    },
    validate: {
      name: (value) => (value.trim() ? null : '名前は必須です'),
      gender: (value) => (value ? null : '性別を選択してください'),
    },
  });

  const handleClose = () => {
    form.reset();
    setMediaItems([]);
    onClose();
  };

  const handleSubmit = (values: FormValues) => {
    const dto: CreateGalleryEntryDto = {
      category,
      name: values.name.trim(),
      gender: values.gender,
      coatColor: values.coatColor.trim() || undefined,
      breed: values.breed.trim() || undefined,
      transferDate: values.transferDate
        ? values.transferDate.toISOString().split('T')[0]
        : undefined,
      destination: values.destination.trim() || undefined,
      externalLink: values.externalLink.trim() || undefined,
      notes: values.notes.trim() || undefined,
      media: mediaItems.map((m, index) => ({
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        order: index,
      })),
    };

    onSubmit(dto);
  };

  const handleImageUploaded = (url: string) => {
    setMediaItems((prev) => [...prev, { type: 'IMAGE', url }]);
  };

  const handleYouTubeAdded = (url: string, thumbnailUrl?: string) => {
    setMediaItems((prev) => [
      ...prev,
      { type: 'YOUTUBE', url, thumbnailUrl },
    ]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <>
          <TextInput
            label="名前"
            placeholder="猫の名前を入力"
            required
            {...form.getInputProps('name')}
          />

          <Group grow>
            <Select
              label="性別"
              placeholder="選択してください"
              data={GENDER_OPTIONS}
              required
              {...form.getInputProps('gender')}
            />
            <TextInput
              label="毛色"
              placeholder="例: 茶トラ"
              {...form.getInputProps('coatColor')}
            />
          </Group>

          <TextInput
            label="猫種"
            placeholder="例: アメリカンショートヘア"
            {...form.getInputProps('breed')}
          />
        </>
      ),
    },
    ...(category === 'GRADUATION' ? [{
      label: '卒業情報',
      content: (
        <Group grow>
          <DateInput
            label="卒業日"
            placeholder="日付を選択"
            valueFormat="YYYY/MM/DD"
            {...form.getInputProps('transferDate')}
          />
          <TextInput
            label="お届け先"
            placeholder="例: 東京都"
            {...form.getInputProps('destination')}
          />
        </Group>
      ),
    }] : []),
    {
      label: '写真・動画',
      content: (
        <Stack gap="sm">
          {mediaItems.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                追加済み ({mediaItems.length}件)
              </Text>
              {mediaItems.map((item, index) => (
                <Group key={index} justify="space-between">
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {item.type === 'YOUTUBE' ? '🎬 YouTube動画' : '🖼️ 画像'}:{' '}
                    {item.url.substring(0, 50)}...
                  </Text>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    削除
                  </Button>
                </Group>
              ))}
            </Stack>
          )}

          <ImageUploader onUploaded={handleImageUploaded} />
          <YouTubeInput onAdded={handleYouTubeAdded} />
        </Stack>
      ),
    },
    {
      label: 'その他',
      content: (
        <>
          <TextInput
            label="外部リンク"
            placeholder="https://..."
            {...form.getInputProps('externalLink')}
          />

          <Textarea
            label="メモ"
            placeholder="備考など"
            rows={3}
            {...form.getInputProps('notes')}
          />
        </>
      ),
    },
    {
      content: (
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            type="submit"
            leftSection={<IconPlus size={16} />}
            loading={loading}
          >
            追加
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <UnifiedModal
        opened={opened}
        onClose={handleClose}
        title={CATEGORY_TITLES[category]}
        size="lg"
        centered
        sections={sections}
      />
    </Box>
  );
}
````

## File: frontend/src/components/cats/cat-quick-edit-modal.tsx
````typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  TextInput,
  Divider,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { UnifiedModal } from '@/components/common';

interface CatQuickEditModalProps {
  opened: boolean;
  onClose: () => void;
  catId: string;
  catName: string;
  birthDate: string;
  onSave: (catId: string, updates: { name?: string; birthDate?: string }) => Promise<void>;
}

export function CatQuickEditModal({
  opened,
  onClose,
  catId,
  catName,
  birthDate,
  onSave,
}: CatQuickEditModalProps) {
  const [name, setName] = useState(catName);
  const [date, setDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setName(catName);
      setDate(new Date(birthDate));
      setError(null);
    }
  }, [opened, catName, birthDate]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('名前は必須です');
      return;
    }

    if (!date) {
      setError('誕生日は必須です');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updates: { name?: string; birthDate?: string } = {};
      
      if (name !== catName) {
        updates.name = name;
      }
      
      const newBirthDate = date.toISOString().split('T')[0];
      if (newBirthDate !== birthDate) {
        updates.birthDate = newBirthDate;
      }

      if (Object.keys(updates).length > 0) {
        await onSave(catId, updates);
        notifications.show({
          title: '更新成功',
          message: '猫の情報を更新しました',
          color: 'green',
        });
      }
      
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存に失敗しました';
      setError(message);
      notifications.show({
        title: '更新失敗',
        message,
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="猫情報の編集"
      size="md"
      centered
    >
      <TextInput
        label="名前"
        placeholder="猫の名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        error={error && error.includes('名前') ? error : undefined}
        autoFocus
      />

      <DateInput
        label="誕生日"
        placeholder="誕生日を選択"
        value={date}
        onChange={(value) => {
          if (typeof value === 'string') {
            setDate(new Date(value));
          } else {
            setDate(value);
          }
        }}
        required
        error={error && error.includes('誕生日') ? error : undefined}
        valueFormat="YYYY/MM/DD"
      />

      {error && !error.includes('名前') && !error.includes('誕生日') && (
        <TextInput
          error={error}
          styles={{ input: { display: 'none' } }}
        />
      )}

      <Divider />

      <Group justify="flex-end" gap="sm">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          キャンセル
        </Button>
        <Button onClick={handleSave} loading={isSaving}>
          保存
        </Button>
      </Group>
    </UnifiedModal>
  );
}
````

## File: frontend/src/app/cats/page.tsx
````typescript
'use client';

import { Fragment, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Text,
  TextInput,
  Card,
  Group,
  Stack,
  Box,
  Badge,
  Tabs,
  Select,
  Skeleton,
  Alert,
  Table,
} from '@mantine/core';
import { IconSearch, IconAlertCircle, IconCat, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useGetCats, useGetCatStatistics, useDeleteCat, type Cat, type GetCatsParams, type TabCounts } from '@/lib/api/hooks/use-cats';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import { CatEditModal } from '@/components/cats/cat-edit-modal';
import { ContextMenuProvider, OperationModalManager, useContextMenu } from '@/components/context-menu';
import { GenderBadge } from '@/components/GenderBadge';

export default function CatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPageHeader } = usePageHeader();
  
  // URLパラメータからタブを取得（初期値は'cats'）
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam || 'cats';
  });
  
  const [sortBy, setSortBy] = useState('name');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  
  // 子猫の展開/折りたたみ状態
  const [expandedMotherIds, setExpandedMotherIds] = useState<Set<string>>(new Set());
  
  // 編集モーダルの状態
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<Cat | null>(null);

  // コンテキストメニュー
  const {
    currentOperation,
    currentEntity,
    closeOperation,
    handleAction: handleContextAction,
  } = useContextMenu<Cat>({
    view: (cat) => {
      if (cat) {
        router.push(`/cats/${cat.id}`);
      }
    },
    edit: (cat) => {
      if (cat) {
        setSelectedCatForEdit(cat);
        openEditModal();
      }
    },
    duplicate: async (cat) => {
      if (cat) {
        // 複製ロジック（後で実装）
        console.log('Duplicate cat:', cat);
      }
    },
  });

  // カラム幅の状態管理（ローカルストレージから復元）
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catsTableColumnWidths');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      name: 15,
      gender: 10,
      breed: 15,
      age: 12,
      tags: 30,
      actions: 10,
    };
  });

  // リサイズ中の状態
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // カラム幅をローカルストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('catsTableColumnWidths', JSON.stringify(columnWidths));
    }
  }, [columnWidths]);

  // リサイズ開始
  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column]);
  };

  // リサイズ中
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(5, startWidth + (diff / window.innerWidth) * 100); // 最小5%
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth,
    }));
  }, [resizingColumn, startX, startWidth]);

  // リサイズ終了
  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  // マウスイベントリスナー
  useEffect(() => {
    if (resizingColumn) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  const queryParams = useMemo<GetCatsParams>(() => {
    const params: GetCatsParams = {
      limit: 1000, // 全タブで十分なデータを取得
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    // タブに関わらず全猫を取得（フィルタリングはクライアント側で実行）
    // これによりタブカウントが動的に変わることを防ぐ

    return params;
  }, [debouncedSearch]); // activeTabを依存配列から削除

  // API連携でデータ取得
  const { data, isLoading, isError, error, isRefetching, refetch } = useGetCats(queryParams, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
  });

  // 統計情報を取得（タブカウント用）
  const { data: statisticsData, isLoading: isStatisticsLoading } = useGetCatStatistics({
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
  });

  // サーバーサイドのタブカウントを使用（フォールバック付き）
  const tabCounts: TabCounts = statisticsData?.tabCounts ?? {
    total: 0,
    male: 0,
    female: 0,
    kitten: 0,
    raising: 0,
    grad: 0,
  };

  // URLパラメータからタブを取得して反映
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['cats', 'male', 'female', 'kitten', 'raising', 'grad'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // 新規登録からの遷移を検知して自動リフレッシュ
  useEffect(() => {
    const refreshParam = searchParams.get('t');
    if (refreshParam) {
      refetch();
      // URLからパラメータを削除
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('t');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, refetch]);

  // ページヘッダーを設定（マウント時のみ）
  useEffect(() => {
    setPageHeader(
      '在舎猫一覧',
      <ActionButton
        action="create"
        onClick={() => router.push('/cats/new')}
      >
        作成
      </ActionButton>
    );

    // クリーンアップ
    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列でマウント時のみ実行

  const apiCats = data?.data || [];

  // 在舎猫のみを対象とする（フィルタリング用）
  const inHouseCats = apiCats.filter((cat: Cat) => cat.isInHouse);

  // 子猫判定関数（6ヶ月未満）を先に定義
  const isKittenFunc = (birthDate: string): boolean => {
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInMonths = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return ageInMonths < 6;
  };

  // 成猫のみ（子猫を除外）- フィルタリング用
  const adultCats = inHouseCats.filter((cat: Cat) => !isKittenFunc(cat.birthDate));

  // タブカウントはサーバーサイドの統計データを使用
  // ローディング中はフォールバック値（0）を表示
  const totalCount = tabCounts.total;
  const maleCount = tabCounts.male;
  const femaleCount = tabCounts.female;
  const kittenCount = tabCounts.kitten;
  const raisingCount = tabCounts.raising;
  const gradCount = tabCounts.grad;

  // 年齢計算関数
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths}ヶ月`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}歳${months}ヶ月` : `${years}歳`;
    }
  };

  const handleViewDetails = (catId: string) => {
    router.push(`/cats/${catId}`);
  };

  // 子猫判定関数（6ヶ月未満）
  const isKitten = useCallback((birthDate: string): boolean => {
    return isKittenFunc(birthDate);
  }, []);

  // 子猫の展開/折りたたみトグル
  const toggleExpanded = (motherId: string) => {
    setExpandedMotherIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(motherId)) {
        newSet.delete(motherId);
      } else {
        newSet.add(motherId);
      }
      return newSet;
    });
  };

  // 猫情報の更新
  const deleteCatMutation = useDeleteCat();

  // コンテキストメニューからの操作確認
  const handleOperationConfirm = async (cat?: Cat) => {
    if (!currentOperation || !cat) return;

    switch (currentOperation) {
      case 'edit':
        // 編集モーダルを開く
        setSelectedCatForEdit(cat);
        closeOperation();
        openEditModal();
        break;

      case 'delete':
        // 削除実行
        await deleteCatMutation.mutateAsync(cat.id);
        await refetch();
        break;

      case 'duplicate':
        // 複製ロジック（後で実装）
        console.log('Duplicate:', cat);
        break;

      default:
        break;
    }
  };

  // タブ別フィルタリングとソート
  const getFilteredCats = () => {
    let filtered: Cat[] = [];
    
    switch (activeTab) {
      case 'male':
        // 在舎猫登録されていて、性別がMaleの成猫のみ（子猫除外）
        filtered = adultCats.filter((cat: Cat) => cat.gender === 'MALE');
        break;
      case 'female':
        // 在舎猫登録されていて、性別がFemaleの猫（成猫+子猫、表示時に子猫は母猫に格納）
        filtered = inHouseCats.filter((cat: Cat) => cat.gender === 'FEMALE');
        break;
      case 'kitten':
        // 母猫名が入力されてる生後3ヶ月(90日)以内の猫
        filtered = inHouseCats.filter((cat: Cat) => {
          if (!cat.birthDate || !cat.motherId) return false;
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
          return ageInDays <= 90; // 3ヶ月(90日)以内
        });
        break;
      case 'raising':
        // 養成中タグがついてる猫
        filtered = inHouseCats.filter((cat: Cat) => {
          return cat.tags?.some((catTag) => catTag.tag.name === '養成中');
        });
        break;
      case 'grad':
        // 卒業予定タグがついてる猫
        filtered = inHouseCats.filter((cat: Cat) => {
          return cat.tags?.some((catTag) => catTag.tag.name === '卒業予定');
        });
        break;
      case 'cats':
      default:
        // 在舎登録されている全ての猫（成猫+子猫、表示時に子猫は母猫に格納）
        filtered = inHouseCats;
        break;
    }
    
    // 検索フィルター適用
    if (searchTerm) {
      filtered = filtered.filter((cat: Cat) =>
        cat.name.includes(searchTerm) || 
        (cat.coatColor?.name || '').includes(searchTerm) ||
        (cat.breed?.name || '').includes(searchTerm)
      );
    }
    
    // ソート適用
    filtered.sort((a: Cat, b: Cat) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
        case 'breed':
          return (a.breed?.name || '').localeCompare(b.breed?.name || '');
        case 'gender':
          return a.gender.localeCompare(b.gender);
        case 'gender-name': {
          // 性別順（メス→オス）→名前順
          const genderCompare = a.gender.localeCompare(b.gender);
          if (genderCompare !== 0) return genderCompare;
          return a.name.localeCompare(b.name);
        }
        case 'gender-age': {
          // 性別順（メス→オス）→年齢順（新しい順）
          const genderCompare2 = a.gender.localeCompare(b.gender);
          if (genderCompare2 !== 0) return genderCompare2;
          return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
        }
        case 'breed-name': {
          // 品種順→名前順
          const breedCompare = (a.breed?.name || '').localeCompare(b.breed?.name || '');
          if (breedCompare !== 0) return breedCompare;
          return a.name.localeCompare(b.name);
        }
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredCats = getFilteredCats();

  // 母猫の子猫マップと表示用猫リストを作成
  const { displayCats, kittensByMother } = useMemo(() => {
    // Maleタブ: 成猫のオスのみ表示（子猫完全除外）
    if (activeTab === 'male') {
      return { displayCats: filteredCats, kittensByMother: new Map<string, Cat[]>() };
    }
    
    // Kittenタブ: 子猫全頭を個別表示（母猫に格納しない）
    if (activeTab === 'kitten') {
      return { displayCats: filteredCats, kittensByMother: new Map<string, Cat[]>() };
    }
    
    // Gradタブ: 個別表示（母猫に格納しない）
    if (activeTab === 'grad') {
      return { displayCats: filteredCats, kittensByMother: new Map<string, Cat[]>() };
    }
    
    // Cats/Female/Raisingタブ: 母猫に子猫を格納して表示
    const kittens = filteredCats.filter((cat: Cat) => isKitten(cat.birthDate) && cat.motherId);
    const kittensByMotherMap = new Map<string, Cat[]>();
    
    kittens.forEach((kitten: Cat) => {
      if (kitten.motherId) {
        if (!kittensByMotherMap.has(kitten.motherId)) {
          kittensByMotherMap.set(kitten.motherId, []);
        }
        const siblings = kittensByMotherMap.get(kitten.motherId);
        if (siblings) {
          siblings.push(kitten);
        }
      }
    });

    // 子猫を除外した表示用リスト（母猫は含む、ソート順を維持）
    const kittenIds = new Set(kittens.map((k: Cat) => k.id));
    const displayCats = filteredCats.filter((cat: Cat) => !kittenIds.has(cat.id));

    return { displayCats, kittensByMother: kittensByMotherMap };
  }, [filteredCats, activeTab, isKitten]);

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* メインコンテンツ */}
      <Container size="lg">
        {/* タブと検索バー・並び替えを同じ行に */}
        <Box mb="lg">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            {/* 左側: タブ */}
            <Tabs 
              value={activeTab} 
              onChange={(value) => setActiveTab(value || 'cats')} 
              style={{ flex: 1, minWidth: 'fit-content' }}
            >
              <Tabs.List>
                <Tabs.Tab value="cats">Cats ({isStatisticsLoading ? '...' : totalCount})</Tabs.Tab>
                <Tabs.Tab value="male">Male ({isStatisticsLoading ? '...' : maleCount})</Tabs.Tab>
                <Tabs.Tab value="female">Female ({isStatisticsLoading ? '...' : femaleCount})</Tabs.Tab>
                <Tabs.Tab value="kitten">Kitten ({isStatisticsLoading ? '...' : kittenCount})</Tabs.Tab>
                <Tabs.Tab value="raising">Raising ({isStatisticsLoading ? '...' : raisingCount})</Tabs.Tab>
                <Tabs.Tab value="grad">Grad ({isStatisticsLoading ? '...' : gradCount})</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {/* 右側: 検索とソート */}
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 'fit-content' }}>
              <TextInput
                placeholder="検索..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="並び替え"
                data={[
                  { value: 'name', label: '名前順' },
                  { value: 'age', label: '年齢順（新しい順）' },
                  { value: 'breed', label: '品種順' },
                  { value: 'gender', label: '性別順' },
                  { value: 'gender-name', label: '性別 → 名前順' },
                  { value: 'gender-age', label: '性別 → 年齢順' },
                  { value: 'breed-name', label: '品種 → 名前順' },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value || 'name')}
                style={{ width: 180 }}
              />
            </Group>
          </Group>
        </Box>

        {/* エラー表示 */}
        {isError && (
          <Alert icon={<IconAlertCircle />} title="エラー" color="red" mb="md">
            {error instanceof Error ? error.message : 'データ取得失敗'}
          </Alert>
        )}

        {/* ローディング */}
        {(isLoading || isRefetching) && (
          <Stack gap="xs">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={60} radius="md" />
            ))}
          </Stack>
        )}

        {/* 猫リスト（リサイズ可能なテーブル） */}
        {!isLoading && !isError && (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Box style={{ overflowX: 'auto', overflowY: 'visible' }}>
              <Table striped highlightOnHover style={{ minWidth: 800, tableLayout: 'fixed' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: `${columnWidths.name}%`, position: 'relative', userSelect: 'none' }}>
                      Name
                      <Box
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 8,
                          cursor: 'col-resize',
                          backgroundColor: resizingColumn === 'name' ? 'var(--mantine-color-blue-5)' : 'transparent',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseDown={(e) => handleResizeStart('name', e)}
                        onMouseEnter={(e) => {
                          if (!resizingColumn) {
                            (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!resizingColumn) {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent';
                          }
                        }}
                      />
                    </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.gender}%`, position: 'relative', userSelect: 'none' }}>
                    Gender
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'gender' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('gender', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.breed}%`, position: 'relative', userSelect: 'none' }}>
                    Breed
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'breed' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('breed', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.age}%`, position: 'relative', userSelect: 'none' }}>
                    Age
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'age' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('age', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.tags}%`, position: 'relative', userSelect: 'none' }}>
                    Tags
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'tags' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('tags', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.actions}%` }}>Operate</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {/* ソート済みの猫リストを1つずつ表示 */}
                {displayCats.map((cat: Cat) => {
                  const kittens = kittensByMother.get(cat.id) || [];
                  const hasMother = kittens.length > 0;
                  const isExpanded = expandedMotherIds.has(cat.id);

                  return (
                    <Fragment key={cat.id}>
                      {/* 猫の行（母猫または通常の猫） */}
                      <ContextMenuProvider
                        entity={cat}
                        entityType="猫"
                        actions={['view', 'edit', 'delete', 'duplicate']}
                        onAction={handleContextAction}
                        enableDoubleClick={true}
                        doubleClickAction="edit"
                      >
                        <Table.Tr 
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: (hasMother && isExpanded) ? 'var(--mantine-color-blue-0)' : undefined
                          }}
                          title="右クリックまたはダブルクリックで操作"
                        >
                          {/* 名前 */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {hasMother ? (
                              <Group gap="xs" wrap="nowrap" justify="space-between" style={{ width: '100%' }}>
                                <Text fw={600} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                  {cat.name}
                                </Text>
                                <Badge 
                                  size="xs" 
                                  color="pink" 
                                  variant="outline"
                                  leftSection={isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                                  rightSection={<IconCat size={12} />}
                                  style={{ 
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    flexShrink: 0
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(cat.id);
                                  }}
                                >
                                  {kittens.length}
                                </Badge>
                              </Group>
                            ) : (
                              <Text fw={600} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cat.name}
                              </Text>
                            )}
                          </Table.Td>
                          
                          {/* 性別バッジ */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <GenderBadge gender={cat.gender} size="sm" />
                          </Table.Td>
                          
                          {/* 品種名 */}
                          <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Text size="sm">{cat.breed?.name || '未登録'}</Text>
                          </Table.Td>
                          
                          {/* 年齢 */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <Text size="sm">{calculateAge(cat.birthDate)}</Text>
                          </Table.Td>
                          
                          {/* タグ表示 */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {cat.tags && cat.tags.length > 0 ? (
                              <Group gap={4} wrap="nowrap">
                                {cat.tags.slice(0, 3).map((catTag) => (
                                  <Badge 
                                    key={catTag.tag.id} 
                                    size="xs" 
                                    variant="dot"
                                    color={catTag.tag.color || 'gray'}
                                  >
                                    {catTag.tag.name}
                                  </Badge>
                                ))}
                                {cat.tags.length > 3 && (
                                  <Badge size="xs" variant="outline" color="gray">
                                    +{cat.tags.length - 3}
                                  </Badge>
                                )}
                              </Group>
                            ) : (
                              <Text size="xs" c="dimmed">-</Text>
                            )}
                          </Table.Td>
                          
                          {/* 操作アイコン */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <Group gap="xs" wrap="nowrap">
                              <ActionIconButton
                                action="edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCatForEdit(cat);
                                  openEditModal();
                                }}
                                title="編集"
                              />
                              <ActionIconButton
                                action="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContextAction('delete', cat);
                                }}
                                title="削除"
                              />
                              <ActionIconButton
                                action="view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(cat.id);
                                }}
                                title="詳細"
                              />
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      </ContextMenuProvider>

                      {/* 子猫の行（展開時） */}
                      {hasMother && isExpanded && kittens.map((kitten: Cat) => (
                        <ContextMenuProvider
                          key={kitten.id}
                          entity={kitten}
                          entityType="子猫"
                          actions={['view', 'edit', 'delete']}
                          onAction={handleContextAction}
                          enableDoubleClick={true}
                          doubleClickAction="edit"
                        >
                          <Table.Tr 
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: 'var(--mantine-color-gray-0)'
                            }}
                            title="右クリックまたはダブルクリックで操作"
                          >
                            {/* 名前（インデント） */}
                            <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: '3rem' }}>
                              <Group gap="xs">
                                <IconCat size={14} style={{ color: 'var(--mantine-color-gray-6)' }} />
                                <Text size="sm">{kitten.name}</Text>
                              </Group>
                            </Table.Td>

                            {/* 性別バッジ */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <GenderBadge gender={kitten.gender} size="sm" />
                            </Table.Td>
                            
                            {/* 品種名 */}
                            <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Text size="sm">{kitten.breed?.name || '未登録'}</Text>
                            </Table.Td>
                            
                            {/* 年齢 */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <Text size="sm">{calculateAge(kitten.birthDate)}</Text>
                            </Table.Td>
                            
                            {/* タグ表示 */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {kitten.tags && kitten.tags.length > 0 ? (
                                <Group gap={4} wrap="nowrap">
                                  {kitten.tags.slice(0, 3).map((catTag) => (
                                    <Badge 
                                      key={catTag.tag.id} 
                                      size="xs" 
                                      variant="dot"
                                      color={catTag.tag.color || 'gray'}
                                    >
                                      {catTag.tag.name}
                                    </Badge>
                                  ))}
                                  {kitten.tags.length > 3 && (
                                    <Badge size="xs" variant="outline" color="gray">
                                      +{kitten.tags.length - 3}
                                    </Badge>
                                  )}
                                </Group>
                              ) : (
                                <Text size="xs" c="dimmed">-</Text>
                              )}
                            </Table.Td>
                            
                            {/* 操作アイコン */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <Group gap="xs" wrap="nowrap">
                                <ActionIconButton
                                  action="edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCatForEdit(kitten);
                                    openEditModal();
                                  }}
                                  title="編集"
                                />
                                <ActionIconButton
                                  action="delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContextAction('delete', kitten);
                                  }}
                                  title="削除"
                                />
                                <ActionIconButton
                                  action="view"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(kitten.id);
                                  }}
                                  title="詳細"
                                />
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        </ContextMenuProvider>
                      ))}
                    </Fragment>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Box>
        </Card>
        )}

        {!isLoading && !isError && filteredCats.length === 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text ta="center">
              条件に一致する猫が見つかりませんでした
            </Text>
          </Card>
        )}
      </Container>

      {/* 猫情報編集モーダル */}
      {selectedCatForEdit && (
        <CatEditModal
          opened={editModalOpened}
          onClose={closeEditModal}
          catId={selectedCatForEdit.id}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* コンテキストメニュー操作モーダル */}
      <OperationModalManager
        operationType={currentOperation}
        entity={currentEntity || undefined}
        entityType="猫"
        onClose={closeOperation}
        onConfirm={handleOperationConfirm}
      />
    </Box>
  );
}
````
