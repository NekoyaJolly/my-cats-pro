import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { ExportDataType, ExportRequestDto } from './dto/export-request.dto';

interface ExportResult {
  [key: string]: string | number | boolean | null;
}

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportData(dto: ExportRequestDto, userId: string): Promise<{ data: ExportResult[]; filename: string }> {
    let data: ExportResult[] = [];
    let filename = '';

    switch (dto.dataType) {
      case ExportDataType.CATS:
        data = await this.exportCats(dto, userId);
        filename = `cats_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.PEDIGREES:
        data = await this.exportPedigrees(dto);
        filename = `pedigrees_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.MEDICAL_RECORDS:
        data = await this.exportMedicalRecords();
        filename = `medical_records_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.CARE_SCHEDULES:
        data = await this.exportCareSchedules(dto);
        filename = `care_schedules_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.TAGS:
        data = await this.exportTags();
        filename = `tags_export_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        throw new BadRequestException('未対応のデータタイプです');
    }

    return { data, filename: `${filename}.${dto.format}` };
  }

  private async exportCats(dto: ExportRequestDto, _userId: string): Promise<ExportResult[]> {
    const where: Prisma.CatWhereInput = {};
    
    if (dto.ids && dto.ids.length > 0) {
      where.id = { in: dto.ids };
    }

    if (dto.startDate || dto.endDate) {
      where.createdAt = {};
      if (dto.startDate) {
        where.createdAt.gte = new Date(dto.startDate);
      }
      if (dto.endDate) {
        where.createdAt.lte = new Date(dto.endDate);
      }
    }

    const cats = await this.prisma.cat.findMany({
      where,
      include: {
        breed: true,
        coatColor: true,
        father: true,
        mother: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return cats.map(cat => ({
      id: cat.id,
      name: cat.name,
      registrationNumber: cat.registrationNumber || '',
      gender: cat.gender,
      birthDate: cat.birthDate?.toISOString().split('T')[0] || '',
      breed: cat.breed?.name || '',
      color: cat.coatColor?.name || '',
      microchipNumber: cat.microchipNumber || '',
      fatherName: cat.father?.name || '',
      motherName: cat.mother?.name || '',
      notes: cat.description || '',
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));
  }

  private async exportPedigrees(dto: ExportRequestDto): Promise<ExportResult[]> {
    const where: Prisma.PedigreeWhereInput = {};
    
    if (dto.ids && dto.ids.length > 0) {
      where.id = { in: dto.ids };
    }

    const pedigrees = await this.prisma.pedigree.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return pedigrees.map(p => ({
      id: p.id,
      pedigreeId: p.pedigreeId,
      catName: p.catName,
      title: p.title || '',
      breedCode: p.breedCode || '',
      genderCode: p.genderCode || '',
      coatColorCode: p.coatColorCode || '',
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  private async exportMedicalRecords(): Promise<ExportResult[]> {
    // 医療記録のエクスポート実装（現在は空配列を返す）
    return [];
  }

  private async exportCareSchedules(dto: ExportRequestDto): Promise<ExportResult[]> {
    const where: Prisma.ScheduleWhereInput = {};
    
    if (dto.ids && dto.ids.length > 0) {
      where.id = { in: dto.ids };
    }

    const schedules = await this.prisma.schedule.findMany({
      where,
      include: {
        scheduleCats: {
          include: {
            cat: true,
          },
        },
      },
      orderBy: { scheduleDate: 'desc' },
    });

    return schedules.flatMap(schedule =>
      schedule.scheduleCats.map(scheduleCat => ({
        scheduleId: schedule.id,
        catName: scheduleCat.cat.name,
        careType: schedule.careType || '',
        scheduledDate: schedule.scheduleDate.toISOString().split('T')[0],
        completedDate: schedule.status === 'COMPLETED' ? schedule.updatedAt.toISOString().split('T')[0] : '',
        description: schedule.description || '',
        title: schedule.title || '',
      }))
    );
  }

  private async exportTags(): Promise<ExportResult[]> {
    const tags = await this.prisma.tag.findMany({
      include: {
        group: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      category: tag.group?.category?.name || '',
      group: tag.group?.name || '',
      isActive: tag.isActive,
      createdAt: tag.createdAt.toISOString(),
    }));
  }

  convertToCSV(data: ExportResult[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(h => {
      const value = item[h];
      // CSV エスケープ処理
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}
