import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateStaffDto) {
    return this.prisma.staff.create({
      data: {
        ...createStaffDto,
        role: createStaffDto.role || 'スタッフ',
        color: createStaffDto.color || '#4dabf7',
      },
      include: {
        user: true,
      },
    });
  }

  async findAll() {
    return this.prisma.staff.findMany({
      where: { isActive: true },
      include: {
        user: true,
        _count: {
          select: { shifts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        user: true,
        shifts: {
          orderBy: { shiftDate: 'desc' },
          take: 10,
        },
        availabilities: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.staff.update({
      where: { id },
      data: updateStaffDto,
      include: {
        user: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    // Soft delete
    return this.prisma.staff.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async restore(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return this.prisma.staff.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
