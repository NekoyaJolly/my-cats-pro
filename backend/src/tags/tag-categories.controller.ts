import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CreateTagCategoryDto } from "./dto/create-tag-category.dto";
import { ReorderTagCategoriesDto } from "./dto/reorder-tag-category.dto";
import { UpdateTagCategoryDto } from "./dto/update-tag-category.dto";
import { TagCategoriesService } from "./tag-categories.service";
import { TagsService } from "./tags.service";

@ApiTags("Tags")
@Controller("tags/categories")
export class TagCategoriesController {
  constructor(
    private readonly tagCategoriesService: TagCategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "タグカテゴリ一覧の取得" })
  @ApiQuery({ name: "scope", required: false, description: "対象スコープ", type: [String] })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    description: "非アクティブカテゴリを含める",
    type: Boolean,
  })
  async findAll(
    @Query("scope") scope?: string | string[],
    @Query("includeInactive") includeInactive?: string,
  ) {
    const scopes = Array.isArray(scope) ? scope : scope ? [scope] : undefined;
    const includeInactiveFlag = includeInactive === "true";
    return this.tagsService.findAll({ scopes, includeInactive: includeInactiveFlag });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "タグカテゴリの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() dto: CreateTagCategoryDto) {
    return this.tagCategoriesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("reorder")
  @ApiOperation({ summary: "タグカテゴリの並び替え" })
  @ApiResponse({ status: HttpStatus.OK })
  async reorder(@Body() dto: ReorderTagCategoriesDto) {
    return this.tagCategoriesService.reorder(dto.items);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "タグカテゴリの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  async update(@Param("id") id: string, @Body() dto: UpdateTagCategoryDto) {
    return this.tagCategoriesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "タグカテゴリの削除" })
  @ApiParam({ name: "id" })
  async remove(@Param("id") id: string) {
    await this.tagCategoriesService.remove(id);
    return { success: true };
  }
}
