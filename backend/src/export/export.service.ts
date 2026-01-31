import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExportDataType, ExportFormat, ExportRequestDto } from './dto/export-request.dto';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportData(dto: ExportRequestDto, userId: string): Promise<{ data: any[]; filename: string }> {
    let data: any[] = [];
    let filename = '';

    switch (dto.dataType) {
      case ExportDataType.CATS:
        data = await this.exportCats(dto, userId);
        filename = `cats_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.PEDIGREES:
        data = await this.exportPedigrees(dto, userId);
        filename = `pedigrees_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.MEDICAL_RECORDS:
        data = await this.exportMedicalRecords(dto, userId);
        filename = `medical_records_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.CARE_SCHEDULES:
        data = await this.exportCareSchedules(dto, userId);
        filename = `care_schedules_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case ExportDataType.TAGS:
        data = await this.exportTags(dto, userId);
        filename = `tags_export_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        throw new BadRequestException('未対応のデータタイプです');
    }

    return { data, filename: `${filename}.${dto.format}` };
  }

  private async exportCats(dto: ExportRequestDto, userId: string): Promise<any[]> {
    const where: any = { ownerId: userId };
    
    if (dto.ids && dto.ids.length > 0) {
      where.id = { in: dto.ids };
    }

    if (dto.startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(dto.startDate) };
    }

    if (dto.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(dto.endDate) };
    }

    const cats = await this.prisma.cat.findMany({
      where,
      include: {
        breed: true,
        color: true,
        father: true,
        mother: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return cats.map(cat => ({
      id: cat.id,
      name: cat.name,
      registrationNumber: cat.registrationNumber,
      gender: cat.gender,
      birthDate: cat.birthDate?.toISOString().split('T')[0] || '',
      breed: cat.breed?.name || '',
      color: cat.color?.name || '',
      microchipNumber: cat.microchipNumber || '',
      fatherName: cat.father?.name || '',
      motherName: cat.mother?.name || '',
      notes: cat.notes || '',
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));
  }

  private async exportPedigrees(dto: ExportRequestDto, userId: string): Promise<any[]> {
    const where: any = {};
    
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

  private async exportMedicalRecords(dto: ExportRequestDto, userId: string): Promise<any[]> {
    // 医療記録のエクスポート実装（現在は空配列を返す）
    return [];
  }

  private async exportCareSchedules(dto: ExportRequestDto, userId: string): Promise<any[]> {
    const where: any = {};
    
    if (dto.ids && dto.ids.length > 0) {
      where.id = { in: dto.ids };
    }

    const schedules = await this.prisma.careSchedule.findMany({
      where,
      include: {
        cats: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });

    return schedules.flatMap(schedule =>
      schedule.cats.map(cat => ({
        scheduleId: schedule.id,
        catName: cat.name,
        careType: schedule.careType,
        scheduledDate: schedule.scheduledDate.toISOString().split('T')[0],
        completedDate: schedule.completedDate?.toISOString().split('T')[0] || '',
        description: schedule.description || '',
        notes: schedule.notes || '',
      }))
    );
  }

  private async exportTags(dto: ExportRequestDto, userId: string): Promise<any[]> {
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

  convertToCSV(data: any[]): string {
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
