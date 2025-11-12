import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Shift, Staff, Prisma } from '@prisma/client';

import {
  ShiftResponseDto,
  CalendarShiftEvent,
  // ShiftEntity, // Unused - keeping import for future use
} from '../common/types/shift.types';
import { PrismaService } from '../prisma/prisma.service';

import { CreateShiftDto } from './dto/create-shift.dto';
import { GetShiftsQueryDto } from './dto/get-shifts-query.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  /**
   * 日付文字列（YYYY-MM-DD）をDateオブジェクトに変換
   * 不正な日付の場合はエラーをスロー
   */
  private parseDate(dateString: string): Date {
    const date = new Date(dateString + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }
    return date;
  }

  /**
   * Shiftエンティティを ShiftResponseDto に変換
   */
  private toResponseDto(shift: Shift & { staff: Staff }): ShiftResponseDto {
    return {
      id: shift.id,
      staffId: shift.staffId,
      staffName: shift.staff.name,
      staffColor: shift.staff.color,
      shiftDate: shift.shiftDate.toISOString().split('T')[0], // YYYY-MM-DD
      displayName: shift.displayName,
      status: shift.status,
      notes: shift.notes,
      createdAt: shift.createdAt.toISOString(),
      updatedAt: shift.updatedAt.toISOString(),
    };
  }

  /**
   * Shiftエンティティを CalendarShiftEvent に変換
   */
  private toCalendarEvent(shift: Shift & { staff: Staff }): CalendarShiftEvent {
    const shiftDate = shift.shiftDate.toISOString().split('T')[0];
    const displayName = shift.displayName || shift.staff.name;

    return {
      id: shift.id,
      title: displayName,
      start: `${shiftDate}T00:00:00`,
      end: `${shiftDate}T23:59:59`,
      backgroundColor: shift.staff.color,
      borderColor: shift.staff.color,
      extendedProps: {
        shiftId: shift.id,
        staffId: shift.staffId,
        staffName: shift.staff.name,
        displayName: shift.displayName,
        notes: shift.notes,
      },
    };
  }

  /**
   * シフトを新規作成
   */
  async create(createShiftDto: CreateShiftDto): Promise<ShiftResponseDto> {
    // スタッフの存在確認
    const staff = await this.prisma.staff.findUnique({
      where: { id: createShiftDto.staffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${createShiftDto.staffId} not found`);
    }

    if (!staff.isActive) {
      throw new BadRequestException(`Staff with ID ${createShiftDto.staffId} is not active`);
    }

    // 日付をパース
    const shiftDate = this.parseDate(createShiftDto.shiftDate);

    // シフトを作成
    const shift = await this.prisma.shift.create({
      data: {
        staffId: createShiftDto.staffId,
        shiftDate: shiftDate,
        displayName: createShiftDto.displayName || null,
        notes: createShiftDto.notes || null,
        status: 'SCHEDULED', // デフォルト値
        mode: 'SIMPLE', // 最小実装では簡易モード
      },
      include: {
        staff: true,
      },
    });

    return this.toResponseDto(shift);
  }

  /**
   * シフト一覧を取得
   */
  async findAll(query: GetShiftsQueryDto): Promise<ShiftResponseDto[]> {
    const where: Prisma.ShiftWhereInput = {};

    // 日付範囲でフィルタ
    if (query.startDate && query.endDate) {
      where.shiftDate = {
        gte: this.parseDate(query.startDate),
        lte: this.parseDate(query.endDate),
      };
    } else if (query.startDate) {
      where.shiftDate = {
        gte: this.parseDate(query.startDate),
      };
    } else if (query.endDate) {
      where.shiftDate = {
        lte: this.parseDate(query.endDate),
      };
    }

    // スタッフIDでフィルタ
    if (query.staffId) {
      where.staffId = query.staffId;
    }

    const shifts = await this.prisma.shift.findMany({
      where,
      include: {
        staff: true,
      },
      orderBy: { shiftDate: 'asc' },
    });

    return shifts.map((shift) => this.toResponseDto(shift));
  }

  /**
   * カレンダー表示用のシフトデータを取得
   */
  async getCalendarData(query: GetShiftsQueryDto): Promise<CalendarShiftEvent[]> {
    const shifts = await this.prisma.shift.findMany({
      where: {
        ...(query.startDate &&
          query.endDate && {
            shiftDate: {
              gte: this.parseDate(query.startDate),
              lte: this.parseDate(query.endDate),
            },
          }),
        ...(query.staffId && { staffId: query.staffId }),
      },
      include: {
        staff: true,
      },
      orderBy: { shiftDate: 'asc' },
    });

    return shifts.map((shift) => this.toCalendarEvent(shift));
  }

  /**
   * 指定IDのシフトを取得
   */
  async findOne(id: string): Promise<ShiftResponseDto> {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        staff: true,
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return this.toResponseDto(shift);
  }

  /**
   * シフト情報を更新
   */
  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<ShiftResponseDto> {
    // 既存シフトの存在確認
    await this.findOne(id);

    // スタッフIDが変更される場合、スタッフの存在確認
    if (updateShiftDto.staffId) {
      const staff = await this.prisma.staff.findUnique({
        where: { id: updateShiftDto.staffId },
      });

      if (!staff || !staff.isActive) {
        throw new BadRequestException(`Staff with ID ${updateShiftDto.staffId} is not available`);
      }
    }

    // 更新データを構築
    const updateData: Partial<Prisma.ShiftUncheckedUpdateInput> = {};

    if (updateShiftDto.staffId !== undefined) {
      updateData.staffId = updateShiftDto.staffId;
    }

    if (updateShiftDto.shiftDate !== undefined) {
      updateData.shiftDate = this.parseDate(updateShiftDto.shiftDate);
    }

    if (updateShiftDto.displayName !== undefined) {
      updateData.displayName = updateShiftDto.displayName;
    }

    if (updateShiftDto.notes !== undefined) {
      updateData.notes = updateShiftDto.notes;
    }

    if (updateShiftDto.status !== undefined) {
      updateData.status = updateShiftDto.status;
    }

    // シフトを更新
    const shift = await this.prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        staff: true,
      },
    });

    return this.toResponseDto(shift);
  }

  /**
   * シフトを削除
   */
  async remove(id: string): Promise<void> {
    // 存在確認
    await this.findOne(id);

    // 物理削除
    await this.prisma.shift.delete({
      where: { id },
    });
  }
}
