import { Injectable, NotFoundException } from '@nestjs/common';
import { Staff } from '@prisma/client';

import { StaffResponseDto, StaffListResponseDto } from '../common/types/staff.types';
import { PrismaService } from '../prisma/prisma.service';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  /**
   * Staffエンティティを StaffResponseDto に変換
   */
  private toResponseDto(staff: Staff): StaffResponseDto {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      color: staff.color,
      isActive: staff.isActive,
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
    };
  }

  /**
   * スタッフを新規作成
   */
  async create(createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.create({
      data: {
        name: createStaffDto.name,
        email: createStaffDto.email || null,
        role: createStaffDto.role || 'スタッフ',
        color: createStaffDto.color || '#4dabf7',
        userId: createStaffDto.userId || null,
        isActive: createStaffDto.isActive !== undefined ? createStaffDto.isActive : true,
      },
    });

    return this.toResponseDto(staff);
  }

  /**
   * スタッフ一覧を取得（有効なスタッフのみ）
   */
  async findAll(): Promise<StaffListResponseDto> {
    const staffList = await this.prisma.staff.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      staffList: staffList.map((staff) => this.toResponseDto(staff)),
      total: staffList.length,
    };
  }

  /**
   * 指定IDのスタッフを取得
   */
  async findOne(id: string): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return this.toResponseDto(staff);
  }

  /**
   * スタッフ情報を更新
   */
  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<StaffResponseDto> {
    await this.findOne(id); // 存在チェック

    const staff = await this.prisma.staff.update({
      where: { id },
      data: {
        ...(updateStaffDto.name !== undefined && { name: updateStaffDto.name }),
        ...(updateStaffDto.email !== undefined && { email: updateStaffDto.email }),
        ...(updateStaffDto.role !== undefined && { role: updateStaffDto.role }),
        ...(updateStaffDto.color !== undefined && { color: updateStaffDto.color }),
        ...(updateStaffDto.isActive !== undefined && { isActive: updateStaffDto.isActive }),
      },
    });

    return this.toResponseDto(staff);
  }

  /**
   * スタッフを削除（論理削除）
   */
  async remove(id: string): Promise<StaffResponseDto> {
    await this.findOne(id); // 存在チェック

    const staff = await this.prisma.staff.update({
      where: { id },
      data: { isActive: false },
    });

    return this.toResponseDto(staff);
  }

  /**
   * 削除したスタッフを復元
   */
  async restore(id: string): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    const restoredStaff = await this.prisma.staff.update({
      where: { id },
      data: { isActive: true },
    });

    return this.toResponseDto(restoredStaff);
  }
}
