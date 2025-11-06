import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // Shift CRUD
  // ==========================================

  async create(createShiftDto: CreateShiftDto) {
    return this.prisma.shift.create({
      data: {
        ...createShiftDto,
        shiftDate: new Date(createShiftDto.shiftDate),
        startTime: createShiftDto.startTime
          ? new Date(createShiftDto.startTime)
          : null,
        endTime: createShiftDto.endTime
          ? new Date(createShiftDto.endTime)
          : null,
        actualStartTime: createShiftDto.actualStartTime
          ? new Date(createShiftDto.actualStartTime)
          : null,
        actualEndTime: createShiftDto.actualEndTime
          ? new Date(createShiftDto.actualEndTime)
          : null,
      },
      include: {
        staff: true,
        template: true,
        tasks: true,
      },
    });
  }

  async findAll(startDate?: string, endDate?: string, staffId?: string) {
    const where: Prisma.ShiftWhereInput = {};

    if (startDate && endDate) {
      where.shiftDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (staffId) {
      where.staffId = staffId;
    }

    return this.prisma.shift.findMany({
      where,
      include: {
        staff: true,
        template: true,
        tasks: true,
      },
      orderBy: { shiftDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        staff: true,
        template: true,
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto) {
    await this.findOne(id);

    return this.prisma.shift.update({
      where: { id },
      data: {
        ...updateShiftDto,
        shiftDate: updateShiftDto.shiftDate
          ? new Date(updateShiftDto.shiftDate)
          : undefined,
        startTime: updateShiftDto.startTime
          ? new Date(updateShiftDto.startTime)
          : undefined,
        endTime: updateShiftDto.endTime
          ? new Date(updateShiftDto.endTime)
          : undefined,
        actualStartTime: updateShiftDto.actualStartTime
          ? new Date(updateShiftDto.actualStartTime)
          : undefined,
        actualEndTime: updateShiftDto.actualEndTime
          ? new Date(updateShiftDto.actualEndTime)
          : undefined,
      },
      include: {
        staff: true,
        template: true,
        tasks: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.shift.delete({
      where: { id },
    });
  }

  // ==========================================
  // Shift Template CRUD
  // ==========================================

  async createTemplate(createTemplateDto: CreateShiftTemplateDto) {
    return this.prisma.shiftTemplate.create({
      data: createTemplateDto,
    });
  }

  async findAllTemplates() {
    return this.prisma.shiftTemplate.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOneTemplate(id: string) {
    const template = await this.prisma.shiftTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(id: string, updateTemplateDto: CreateShiftTemplateDto) {
    await this.findOneTemplate(id);

    return this.prisma.shiftTemplate.update({
      where: { id },
      data: updateTemplateDto,
    });
  }

  async removeTemplate(id: string) {
    await this.findOneTemplate(id);

    return this.prisma.shiftTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ==========================================
  // Calendar View
  // ==========================================

  async getCalendarData(startDate: string, endDate: string) {
    const shifts = await this.findAll(startDate, endDate);

    return shifts.map((shift) => ({
      id: shift.id,
      title: shift.displayName || shift.staff.name,
      start: shift.startTime || shift.shiftDate,
      end: shift.endTime || shift.shiftDate,
      backgroundColor: shift.staff.color,
      extendedProps: {
        staffId: shift.staff.id,
        staffName: shift.staff.name,
        mode: shift.mode,
        status: shift.status,
        notes: shift.notes,
      },
    }));
  }

  // ==========================================
  // Statistics
  // ==========================================

  async getStatistics(startDate: string, endDate: string) {
    const shifts = await this.findAll(startDate, endDate);

    const totalShifts = shifts.length;
    const confirmedShifts = shifts.filter(
      (s) => s.status === 'CONFIRMED',
    ).length;
    const completedShifts = shifts.filter(
      (s) => s.status === 'COMPLETED',
    ).length;

    const staffStats = shifts.reduce(
      (acc, shift) => {
        const staffName = shift.staff.name;
        if (!acc[staffName]) {
          acc[staffName] = 0;
        }
        acc[staffName]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalShifts,
      confirmedShifts,
      completedShifts,
      staffStats,
    };
  }
}
