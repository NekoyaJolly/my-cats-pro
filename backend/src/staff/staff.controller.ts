import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { StaffResponseDto, StaffListResponseDto } from '../common/types/staff.types';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * スタッフを新規作成
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStaffDto: CreateStaffDto): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.create(createStaffDto);
    return ApiResponse.success(staff);
  }

  /**
   * スタッフ一覧を取得
   */
  @Get()
  async findAll(): Promise<ApiResponse<StaffListResponseDto>> {
    const result = await this.staffService.findAll();
    return ApiResponse.success(result);
  }

  /**
   * 指定IDのスタッフを取得
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.findOne(id);
    return ApiResponse.success(staff);
  }

  /**
   * スタッフ情報を更新
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.update(id, updateStaffDto);
    return ApiResponse.success(staff);
  }

  /**
   * スタッフを削除（論理削除）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.remove(id);
    return ApiResponse.success(staff);
  }

  /**
   * 削除したスタッフを復元
   */
  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<ApiResponse<StaffResponseDto>> {
    const staff = await this.staffService.restore(id);
    return ApiResponse.success(staff);
  }
}
