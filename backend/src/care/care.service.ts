import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CareType,
  MedicalRecordStatus,
  Priority,
  Prisma,
  ReminderRepeatFrequency,
  ScheduleStatus,
  ScheduleType,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  CareQueryDto,
  CompleteCareDto,
  CreateCareScheduleDto,
  CreateMedicalRecordDto,
  MedicalRecordQueryDto,
} from "./dto";
import type {
  CareScheduleListResponse,
  CareScheduleMeta,
  CareScheduleResponse,
} from "./dto/care-schedule-response.dto";
import type { ScheduleReminderInput } from "./dto/create-care-schedule.dto";
import type { MedicalRecordAttachmentInput } from "./dto/create-medical-record.dto";
import type {
  MedicalRecordData,
  MedicalRecordListResponse,
  MedicalRecordMeta,
  MedicalRecordResponse,
} from "./dto/medical-record-response.dto";

const scheduleListInclude = {
  cat: { select: { id: true, name: true } },
  scheduleCats: { include: { cat: { select: { id: true, name: true } } } },
  reminders: true,
  tags: { include: { careTag: true } },
} as const;

const scheduleMinimalInclude = {
  cat: { select: { id: true, name: true } },
  tags: { select: { careTagId: true } },
} as const;

const medicalRecordInclude = {
  cat: { select: { id: true, name: true } },
  schedule: { select: { id: true, name: true } },
  visitType: true,
  tags: {
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          color: true,
          textColor: true,
          groupId: true,
          group: {
            select: {
              id: true,
              name: true,
              categoryId: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
  attachments: true,
} as const;

type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: typeof scheduleListInclude;
}>;

type ScheduleCatRelation = {
  cat: { id: string; name: string };
};

type MedicalRecordWithRelations = Prisma.MedicalRecordGetPayload<{
  include: typeof medicalRecordInclude;
}>;

type PrismaExecutor = Prisma.TransactionClient | PrismaService;

type MedicalRecordCreateInput = Partial<CreateMedicalRecordDto> & {
  catId?: string;
  scheduleId?: string;
  visitDate?: string;
  visitTypeId?: string;
};

// Extended types for scheduleCats relation
type ScheduleCreateWithCats = Omit<Prisma.ScheduleUncheckedCreateInput, 'scheduleCats'> & {
  scheduleCats?: {
    create?: Array<{
      cat: {
        connect: {
          id: string;
        };
      };
    }>;
  };
};

type ScheduleUpdateWithCats = Omit<Prisma.ScheduleUncheckedUpdateInput, 'scheduleCats'> & {
  scheduleCats?: {
    deleteMany?: Record<string, never>;
    create?: Array<{
      cat: {
        connect: {
          id: string;
        };
      };
    }>;
  };
};

const toIsoString = (value?: Date | null): string | null =>
  value ? value.toISOString() : null;

@Injectable()
export class CareService {
  constructor(private readonly prisma: PrismaService) {}

  async findSchedules(query: CareQueryDto): Promise<CareScheduleListResponse> {
    const { page = 1, limit = 20, catId, careType, dateFrom, dateTo } = query;
    const where: Prisma.ScheduleWhereInput = {
      scheduleType: ScheduleType.CARE,
    };
    if (catId) where.catId = catId;
    if (careType) {
      Object.assign(where, { careType });
    }
    if (dateFrom || dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.scheduleDate = dateFilter;
    }

    const [total, schedules] = await this.prisma.$transaction([
      this.prisma.schedule.count({ where }),
      this.prisma.schedule.findMany({
        where,
        include: scheduleListInclude,
        orderBy: { scheduleDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const meta: CareScheduleMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      data: schedules.map((schedule) => this.mapScheduleToResponse(schedule as ScheduleWithRelations)),
      meta,
    };
  }

  async addSchedule(
    dto: CreateCareScheduleDto,
    userId?: string,
  ): Promise<CareScheduleResponse> {
    const assignedUserId = await this.resolveUserId(userId);

    const reminderCreates = (dto.reminders ?? []).map((reminder) =>
      this.buildReminderCreateInput(reminder),
    );

    // 最初の猫IDを旧catIdフィールドに設定（後方互換性のため）
    const primaryCatId = dto.catIds?.[0];

    const createData: ScheduleCreateWithCats = {
      catId: primaryCatId,
      name: dto.name,
      title: dto.name,
      description: dto.description,
      scheduleType: ScheduleType.CARE,
      scheduleDate: new Date(dto.scheduledDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      timezone: dto.timezone,
      careType: dto.careType ?? null,
      status: ScheduleStatus.PENDING,
      priority: dto.priority ?? Priority.MEDIUM,
      recurrenceRule: dto.recurrenceRule,
      assignedTo: assignedUserId,
      reminders: reminderCreates.length
        ? { create: reminderCreates }
        : undefined,
      tags: dto.careTagIds?.length
        ? {
            create: dto.careTagIds.map((careTagId) => ({
              careTag: { connect: { id: careTagId } },
            })),
          }
        : undefined,
      scheduleCats: dto.catIds?.length
        ? {
            create: dto.catIds.map((catId) => ({
              cat: { connect: { id: catId } },
            })),
          }
        : undefined,
    };

    const schedule = await this.prisma.schedule.create({
      data: createData as unknown as Prisma.ScheduleCreateInput,
      include: scheduleListInclude,
    });

    return {
      success: true,
      data: this.mapScheduleToResponse(schedule as ScheduleWithRelations),
    };
  }

  async complete(
    id: string,
    dto: CompleteCareDto,
    userId?: string,
  ): Promise<{
    success: true;
    data: { scheduleId: string; recordId: string; medicalRecordId?: string | null };
  }> {
    const recorderId = await this.resolveUserId(userId);

    const existing = await this.prisma.schedule.findUnique({
      where: { id },
      include: scheduleMinimalInclude,
    });

    if (!existing) {
      throw new NotFoundException("Schedule not found");
    }

    const followUpDate = dto.nextScheduledDate ? new Date(dto.nextScheduledDate) : undefined;
    const completedDate = dto.completedDate ? new Date(dto.completedDate) : new Date();
    const hospitalName = this.normalizeOptionalText(dto.medicalRecord?.hospitalName);

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.schedule.update({
        where: { id },
        data: { status: ScheduleStatus.COMPLETED },
      });

      if (followUpDate) {
        await tx.schedule.create({
          data: {
            catId: existing.catId ?? undefined,
            name: existing.name,
            title: existing.name,
            description: dto.notes ?? existing.description ?? undefined,
            scheduleType: ScheduleType.CARE,
            scheduleDate: followUpDate,
            timezone: existing.timezone ?? undefined,
            careType: (existing.careType as CareType | null) ?? null,
            status: ScheduleStatus.PENDING,
            priority: existing.priority ?? Priority.MEDIUM,
            recurrenceRule: existing.recurrenceRule ?? undefined,
            assignedTo: updated.assignedTo,
            tags: existing.tags.length
              ? {
                  create: existing.tags.map(({ careTagId }) => ({
                    careTag: { connect: { id: careTagId } },
                  })),
                }
              : undefined,
          },
        });
      }

      const careRecord = await tx.careRecord.create({
        data: {
          catId: existing.catId ?? undefined,
          careType: (existing.careType as CareType | null) ?? CareType.OTHER,
          description: existing.name,
          careDate: completedDate,
          nextDueDate: followUpDate,
          notes: dto.notes,
          veterinarian: hospitalName,
          recordedBy: recorderId,
        },
      });

      let medicalRecordId: string | null = null;
      if (dto.medicalRecord) {
        const record = await this.createMedicalRecordEntity(tx, dto.medicalRecord, recorderId, {
          catId: existing.catId ?? undefined,
          scheduleId: existing.id,
        });
        medicalRecordId = record.id;
      }

      return { updated, careRecord, medicalRecordId };
    });

    return {
      success: true,
      data: {
        scheduleId: result.updated.id,
        recordId: result.careRecord.id,
        medicalRecordId: result.medicalRecordId,
      },
    };
  }

  async findMedicalRecords(
    query: MedicalRecordQueryDto,
  ): Promise<MedicalRecordListResponse> {
    const {
      page = 1,
      limit = 20,
      catId,
      scheduleId,
      visitTypeId,
      status,
      dateFrom,
      dateTo,
    } = query;

    const where: Prisma.MedicalRecordWhereInput = {};
    if (catId) where.catId = catId;
    if (scheduleId) where.scheduleId = scheduleId;
    if (visitTypeId) where.visitTypeId = visitTypeId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.visitDate = dateFilter;
    }

    const [total, records] = await this.prisma.$transaction([
      this.prisma.medicalRecord.count({ where }),
      this.prisma.medicalRecord.findMany({
        where,
        include: medicalRecordInclude,
        orderBy: { visitDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const meta: MedicalRecordMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      data: records.map((record) => this.mapMedicalRecordToResponse(record as MedicalRecordWithRelations)),
      meta,
    };
  }

  async updateSchedule(
    id: string,
    dto: CreateCareScheduleDto,
    userId?: string,
  ): Promise<CareScheduleResponse> {
    const assignedUserId = await this.resolveUserId(userId);

    const existing = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Schedule not found");
    }

    const reminderCreates = (dto.reminders ?? []).map((reminder) =>
      this.buildReminderCreateInput(reminder),
    );

    const primaryCatId = dto.catIds?.[0];

    const updateData: ScheduleUpdateWithCats = {
      catId: primaryCatId,
      name: dto.name,
      title: dto.name,
      description: dto.description,
      scheduleDate: new Date(dto.scheduledDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      timezone: dto.timezone,
      careType: dto.careType ?? null,
      priority: dto.priority ?? Priority.MEDIUM,
      recurrenceRule: dto.recurrenceRule,
      assignedTo: assignedUserId,
      reminders: {
        deleteMany: {},
        create: reminderCreates,
      },
      tags: {
        deleteMany: {},
        create: dto.careTagIds?.length
          ? dto.careTagIds.map((careTagId) => ({
              careTag: { connect: { id: careTagId } },
            }))
          : undefined,
      },
      scheduleCats: {
        deleteMany: {},
        create: dto.catIds?.length
          ? dto.catIds.map((catId) => ({
              cat: { connect: { id: catId } },
            }))
          : undefined,
      },
    };

    const schedule = await this.prisma.schedule.update({
      where: { id },
      data: updateData as unknown as Prisma.ScheduleUpdateInput,
      include: scheduleListInclude,
    });

    return {
      success: true,
      data: this.mapScheduleToResponse(schedule as ScheduleWithRelations),
    };
  }

  async deleteSchedule(id: string): Promise<{ success: true; message: string }> {
    const existing = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Schedule not found");
    }

    await this.prisma.schedule.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Schedule deleted successfully",
    };
  }

  async addMedicalRecord(
    dto: CreateMedicalRecordDto,
    userId?: string,
  ): Promise<MedicalRecordResponse> {
    const recorderId = await this.resolveUserId(userId);
    const record = await this.createMedicalRecordEntity(this.prisma, dto, recorderId);

    return {
      success: true,
      data: this.mapMedicalRecordToResponse(record),
    };
  }

  private async resolveUserId(userId?: string): Promise<string> {
    if (userId) {
      return userId;
    }

    const user = await this.prisma.user.findFirst({ select: { id: true } });
    if (!user) {
      throw new NotFoundException("Assignee user not found");
    }
    return user.id;
  }

  private buildReminderCreateInput(
    reminder: ScheduleReminderInput,
  ): Prisma.ScheduleReminderUncheckedCreateWithoutScheduleInput {
    return {
      timingType: reminder.timingType,
      remindAt: reminder.remindAt ? new Date(reminder.remindAt) : undefined,
      offsetValue: reminder.offsetValue ?? null,
      offsetUnit: reminder.offsetUnit ?? null,
      relativeTo: reminder.relativeTo ?? null,
      channel: reminder.channel,
      repeatFrequency: reminder.repeatFrequency ?? ReminderRepeatFrequency.NONE,
      repeatInterval: reminder.repeatInterval ?? null,
      repeatCount: reminder.repeatCount ?? null,
      repeatUntil: reminder.repeatUntil ? new Date(reminder.repeatUntil) : undefined,
      notes: reminder.notes ?? null,
      isActive: reminder.isActive ?? true,
    };
  }

  private mapScheduleToResponse(
    schedule: ScheduleWithRelations,
  ): CareScheduleResponse["data"] {
    const sortedReminders = [...schedule.reminders].sort((a, b) => {
      const aTime = a.remindAt?.getTime() ?? 0;
      const bTime = b.remindAt?.getTime() ?? 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const reminders = sortedReminders.map((reminder) => ({
      id: reminder.id,
      timingType: reminder.timingType,
      remindAt: toIsoString(reminder.remindAt),
      offsetValue: reminder.offsetValue ?? null,
      offsetUnit: reminder.offsetUnit ?? null,
      relativeTo: reminder.relativeTo ?? null,
      channel: reminder.channel,
      repeatFrequency: reminder.repeatFrequency ?? ReminderRepeatFrequency.NONE,
      repeatInterval: reminder.repeatInterval ?? null,
      repeatCount: reminder.repeatCount ?? null,
      repeatUntil: toIsoString(reminder.repeatUntil),
      notes: reminder.notes ?? null,
      isActive: reminder.isActive,
    }));

    const tags = schedule.tags
      .map(({ careTag }) => ({
        id: careTag.id,
        slug: careTag.slug,
        label: careTag.label,
        level: careTag.level,
        parentId: careTag.parentId ?? null,
      }))
      .sort((a, b) => a.level - b.level);

    return {
      id: schedule.id,
      name: schedule.name ?? schedule.title,
      title: schedule.title,
      description: schedule.description ?? null,
      scheduleDate: toIsoString(schedule.scheduleDate)!,
      endDate: toIsoString(schedule.endDate),
      timezone: schedule.timezone ?? null,
      scheduleType: schedule.scheduleType,
      status: schedule.status,
      careType: (schedule.careType as CareType | null) ?? null,
      priority: schedule.priority ?? Priority.MEDIUM,
      recurrenceRule: schedule.recurrenceRule ?? null,
      assignedTo: schedule.assignedTo,
      cat: schedule.cat ? { id: schedule.cat.id, name: schedule.cat.name } : null,
      cats: Array.isArray(schedule.scheduleCats)
        ? (schedule.scheduleCats as ScheduleCatRelation[]).map((sc) => ({
            id: sc.cat.id,
            name: sc.cat.name,
          }))
        : [],
      reminders,
      tags,
      createdAt: toIsoString(schedule.createdAt)!,
      updatedAt: toIsoString(schedule.updatedAt)!,
    };
  }

  private mapMedicalRecordToResponse(
    record: MedicalRecordWithRelations,
  ): MedicalRecordData {
    const symptomDetails = this.normalizeSymptomDetails(record.symptomDetails);
    const medications = this.normalizeMedications(record.medications);

    const visitType = record.visitType
      ? {
          id: record.visitType.id,
          key: record.visitType.key ?? null,
          name: record.visitType.name,
          description: record.visitType.description ?? null,
          displayOrder: record.visitType.displayOrder,
          isActive: record.visitType.isActive,
        }
      : null;

    const tags = record.tags
      .map(({ tag }) => {
        if (!tag) {
          return null;
        }
        const group = tag.group ?? null;
        const category = group?.category ?? null;
        return {
          id: tag.id,
          name: tag.name,
          color: tag.color ?? null,
          textColor: tag.textColor ?? null,
          groupId: tag.groupId,
          groupName: group?.name ?? null,
          categoryId: group?.categoryId ?? null,
          categoryName: category?.name ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));

    const attachments = record.attachments.map((attachment) => ({
      url: attachment.url,
      description: attachment.description ?? null,
      fileName: attachment.fileName ?? null,
      fileType: attachment.fileType ?? null,
      fileSize: attachment.fileSize ?? null,
      capturedAt: toIsoString(attachment.capturedAt),
    }));

    return {
      id: record.id,
      visitDate: toIsoString(record.visitDate)!,
      visitType,
      hospitalName: record.hospitalName ?? null,
      symptom: record.symptom ?? null,
      symptomDetails,
      diseaseName: record.diseaseName ?? null,
      diagnosis: record.diagnosis ?? null,
      treatmentPlan: record.treatmentPlan ?? null,
      medications,
      followUpDate: toIsoString(record.followUpDate),
      status: record.status,
      notes: record.notes ?? null,
      cat: { id: record.cat.id, name: record.cat.name },
      schedule: record.schedule
        ? { id: record.schedule.id, name: record.schedule.name }
        : null,
      tags,
      attachments,
      recordedBy: record.recordedBy,
      createdAt: toIsoString(record.createdAt)!,
      updatedAt: toIsoString(record.updatedAt)!,
    };
  }

  private normalizeSymptomDetails(
    data: Prisma.JsonValue | null,
  ): MedicalRecordData["symptomDetails"] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const payload = item as Record<string, unknown>;
        const label = payload.label;
        if (typeof label !== "string") return null;
        const note = typeof payload.note === "string" ? payload.note : null;
        return { label, note };
      })
      .filter((item): item is { label: string; note: string | null } => item !== null);
  }

  private normalizeMedications(
    data: Prisma.JsonValue | null,
  ): MedicalRecordData["medications"] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const payload = item as Record<string, unknown>;
        const name = payload.name;
        if (typeof name !== "string") return null;
        const dosage = typeof payload.dosage === "string" ? payload.dosage : null;
        return { name, dosage };
      })
      .filter((item): item is { name: string; dosage: string | null } => item !== null);
  }

  private async createMedicalRecordEntity(
    executor: PrismaExecutor,
    dto: MedicalRecordCreateInput,
    recorderId: string,
    defaults: { catId?: string; scheduleId?: string; visitTypeId?: string } = {},
  ): Promise<MedicalRecordWithRelations> {
    const catId = dto.catId ?? defaults.catId;
    if (!catId) {
      throw new NotFoundException("Cat ID is required for medical record");
    }

    const symptomDetails = (dto.symptomDetails ?? []).map((symptom) => ({
      label: symptom.label,
      note: symptom.note ?? null,
    }));

    const medications = (dto.medications ?? []).map((medication) => ({
      name: medication.name,
      dosage: medication.dosage ?? null,
    }));

    const attachments = dto.attachments ?? [];
    const hospitalName = this.normalizeOptionalText(dto.hospitalName);

    const record = await executor.medicalRecord.create({
      data: {
        catId,
    scheduleId: dto.scheduleId ?? defaults.scheduleId,
    recordedBy: recorderId,
    visitDate: new Date(dto.visitDate ?? dto.followUpDate ?? new Date()),
    visitTypeId: dto.visitTypeId ?? defaults.visitTypeId,
        hospitalName,
        symptom: dto.symptom,
        symptomDetails: symptomDetails.length ? (symptomDetails as Prisma.JsonArray) : Prisma.DbNull,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
        medications: medications.length ? (medications as Prisma.JsonArray) : Prisma.DbNull,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        status: dto.status ?? MedicalRecordStatus.TREATING,
        notes: dto.notes,
        tags: dto.tagIds?.length
          ? {
              create: dto.tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
        attachments: attachments.length
          ? {
              create: attachments.map((attachment: MedicalRecordAttachmentInput) => ({
                url: attachment.url,
                description: attachment.description,
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
                capturedAt: attachment.capturedAt ? new Date(attachment.capturedAt) : undefined,
              })),
            }
          : undefined,
      },
      include: medicalRecordInclude,
    });

    return record as MedicalRecordWithRelations;
  }

  private normalizeOptionalText(value?: string | null): string | undefined {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
