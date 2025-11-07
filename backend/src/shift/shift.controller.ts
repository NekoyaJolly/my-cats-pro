import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { GetShiftsQueryDto } from './dto/get-shifts-query.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { ShiftResponseDto, CalendarShiftEvent } from '../common/types/shift.types';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  /**
   * シフトを新規作成
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createShiftDto: CreateShiftDto): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftService.create(createShiftDto);
    return ApiResponse.success(shift);
  }

  /**
   * シフト一覧を取得
   */
  @Get()
  async findAll(@Query() query: GetShiftsQueryDto): Promise<ApiResponse<ShiftResponseDto[]>> {
    const shifts = await this.shiftService.findAll(query);
    return ApiResponse.success(shifts);
  }

  /**
   * カレンダー表示用のシフトデータを取得
   */
  @Get('calendar')
  async getCalendarData(
    @Query() query: GetShiftsQueryDto,
  ): Promise<ApiResponse<CalendarShiftEvent[]>> {
    const events = await this.shiftService.getCalendarData(query);
    return ApiResponse.success(events);
  }

  /**
   * 指定IDのシフトを取得
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftService.findOne(id);
    return ApiResponse.success(shift);
  }

  /**
   * シフト情報を更新
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftService.update(id, updateShiftDto);
    return ApiResponse.success(shift);
  }

  /**
   * シフトを削除
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<{ id: string }>> {
    await this.shiftService.remove(id);
    return ApiResponse.success({ id });
  }
}
