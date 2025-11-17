import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { DisplayPreferencesService } from "./display-preferences.service";
import { UpdateDisplayPreferenceDto } from "./dto/update-display-preference.dto";

@ApiTags("Display Preferences")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("display-preferences")
export class DisplayPreferencesController {
  constructor(private readonly displayPreferences: DisplayPreferencesService) {}

  @Get("me")
  @ApiOperation({ summary: "自身の表示設定を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "表示設定の取得に成功" })
  async getMine(@GetUser() user: RequestUser | undefined) {
    if (!user) {
      throw new UnauthorizedException("ユーザー情報を確認できませんでした");
    }

    return this.displayPreferences.getPreferences(user.userId);
  }

  @Patch("me")
  @ApiOperation({ summary: "自身の表示設定を更新" })
  @ApiResponse({ status: HttpStatus.OK, description: "表示設定の更新に成功" })
  async updateMine(
    @GetUser() user: RequestUser | undefined,
    @Body() dto: UpdateDisplayPreferenceDto,
  ) {
    if (!user) {
      throw new UnauthorizedException("ユーザー情報を確認できませんでした");
    }

    return this.displayPreferences.upsertPreferences(user.userId, dto);
  }
}
