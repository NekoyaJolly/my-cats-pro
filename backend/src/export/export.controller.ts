import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExportService } from './export.service';
import { ExportRequestDto, ExportFormat } from './dto/export-request.dto';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
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
