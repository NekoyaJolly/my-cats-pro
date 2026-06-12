import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PERMISSIONS } from '../auth/permissions';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

import { ExportRequestDto, ExportFormat } from './dto/export-request.dto';
import { ExportService } from './export.service';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.DATA_IMPORT_EXPORT)
  // ファイル生成のため作成(201)ではなく 200 を返す
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'データをエクスポート' })
  @ApiResponse({ status: HttpStatus.OK, description: 'エクスポート成功' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '無効なリクエスト' })
  async export(
    @Body() dto: ExportRequestDto,
    @GetUser() user: RequestUser,
    @Res() res: Response,
  ) {
    const { data, filename } = await this.exportService.exportData(dto, user.userId);

    if (dto.format === ExportFormat.CSV) {
      const csv = this.exportService.convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(JSON.stringify(data, null, 2));
    }
  }
}
