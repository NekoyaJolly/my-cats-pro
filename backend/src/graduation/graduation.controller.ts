import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
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
import { GraduationService } from './graduation.service';
import { TransferCatDto } from './dto';

@ApiTags('Graduation')
@Controller('graduations')
export class GraduationController {
  constructor(private readonly graduationService: GraduationService) {}

  /**
   * 猫を譲渡（卒業）する
   */
  @Post('cats/:id/transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '猫を譲渡（卒業）する' })
  @ApiParam({ name: 'id', description: '猫ID' })
  @ApiResponse({ status: 201, description: '譲渡成功' })
  @ApiResponse({ status: 404, description: '猫が見つかりません' })
  @ApiResponse({ status: 400, description: 'すでに卒業済みです' })
  async transferCat(@Param('id') id: string, @Body() dto: TransferCatDto) {
    return this.graduationService.transferCat(id, dto);
  }

  /**
   * 卒業猫一覧取得
   */
  @Get()
  @ApiOperation({ summary: '卒業猫一覧取得' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '卒業猫一覧' })
  async findAllGraduations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.graduationService.findAllGraduations(pageNum, limitNum);
  }

  /**
   * 卒業猫詳細取得
   */
  @Get(':id')
  @ApiOperation({ summary: '卒業猫詳細取得' })
  @ApiParam({ name: 'id', description: '卒業ID' })
  @ApiResponse({ status: 200, description: '卒業猫詳細' })
  @ApiResponse({ status: 404, description: '卒業記録が見つかりません' })
  async findOneGraduation(@Param('id') id: string) {
    return this.graduationService.findOneGraduation(id);
  }

  /**
   * 卒業取り消し（緊急時用）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '卒業取り消し（緊急時用）' })
  @ApiParam({ name: 'id', description: '卒業ID' })
  @ApiResponse({ status: 200, description: '卒業取り消し成功' })
  @ApiResponse({ status: 404, description: '卒業記録が見つかりません' })
  async cancelGraduation(@Param('id') id: string) {
    return this.graduationService.cancelGraduation(id);
  }
}
