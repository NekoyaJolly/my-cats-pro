import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PERMISSIONS } from '../auth/permissions';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

import { CreateTagGroupDto, ReorderTagGroupDto, UpdateTagGroupDto } from "./dto";
import { TagGroupsService } from "./tag-groups.service";

@ApiTags("Tags")
@Controller("tags/groups")
export class TagGroupsController {
  constructor(private readonly tagGroupsService: TagGroupsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post()
  @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @ApiOperation({ summary: "タググループの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: CreateTagGroupDto) {
    return this.tagGroupsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch("reorder")
  @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @ApiOperation({ summary: "タググループの並び替え" })
  @ApiResponse({ status: HttpStatus.OK })
  reorder(@Body() dto: ReorderTagGroupDto) {
    return this.tagGroupsService.reorder(dto.items);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch(":id")
  @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @ApiOperation({ summary: "タググループの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdateTagGroupDto) {
    return this.tagGroupsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete(":id")
  @RequirePermissions(PERMISSIONS.TAGS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "タググループの削除" })
  @ApiParam({ name: "id" })
  async remove(@Param("id") id: string) {
    await this.tagGroupsService.remove(id);
    return { success: true };
  }
}
