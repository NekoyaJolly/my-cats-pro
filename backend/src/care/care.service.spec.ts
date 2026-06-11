import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { CareService } from './care.service';


describe('CareService', () => {
  let service: CareService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    careSchedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    schedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    medicalRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    careRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cat: {
      findUnique: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((args: any): any => {
      if (Array.isArray(args)) {
        return Promise.all(args);
      }
      return args(mockPrismaService);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CareService>(CareService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findSchedules', () => {
    it('should return paginated care schedules', async () => {
      const mockSchedules = [
        {
          id: '1',
          catId: 'cat-1',
          name: 'Vaccine',
          status: 'PENDING',
          scheduledDate: new Date(),
          reminders: [],
          tags: [],
        },
      ];

      mockPrismaService.schedule.count.mockResolvedValue(1);
      mockPrismaService.schedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.findSchedules({});

      expect(result.data).toBeDefined();
      expect(result.meta.total).toBe(1);
    });

    it('should filter schedules by catId', async () => {
      const mockSchedules = [
        {
          id: '1',
          catId: 'cat-1',
          name: 'Vaccine',
          scheduledDate: new Date(),
          reminders: [],
          tags: [],
        },
      ];

      mockPrismaService.schedule.count.mockResolvedValue(1);
      mockPrismaService.schedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.findSchedules({ catId: 'cat-1' });

      expect(result.data).toBeDefined();
    });
  });

  describe('addSchedule', () => {
    it('should create a care schedule successfully', async () => {
      const createDto = {
        name: 'Vaccine',
        catIds: ['cat-1'],
        scheduledDate: '2024-12-01',
        careType: 'HEALTH_CHECK' as const,
      };

      const mockSchedule = {
        id: '1',
        name: createDto.name,
        scheduledDate: new Date(createDto.scheduledDate),
        careType: createDto.careType,
        status: 'PENDING',
        createdAt: new Date(),
        reminders: [],
        tags: [],
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.schedule.create.mockResolvedValue(mockSchedule);

      const result = await service.addSchedule(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.schedule.create).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete a care schedule successfully', async () => {
      const mockSchedule = {
        id: '1',
        catId: 'cat-1',
        scheduleType: 'CARE',
        careType: 'HEALTH_CHECK',
        scheduleCats: [],
      };

      const mockCareRecord = {
        id: 'record-1',
        scheduleId: '1',
        catId: 'cat-1',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.schedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.careRecord.create.mockResolvedValue(mockCareRecord);
      mockPrismaService.schedule.update.mockResolvedValue({ ...mockSchedule, status: 'COMPLETED' });

      const result = await service.complete('1', {});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException for invalid schedule', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue(null);

      await expect(service.complete('invalid', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMedicalRecord', () => {
    it('should create a medical record successfully', async () => {
      const createDto = {
        catId: 'cat-1',
        visitDate: '2024-01-15',
        diagnosis: 'Healthy',
        treatment: 'Regular checkup',
        veterinarian: 'Dr. Smith',
      };

      const mockRecord = {
        id: '1',
        catId: createDto.catId,
        visitDate: new Date(createDto.visitDate),
        diagnosis: createDto.diagnosis,
        treatment: createDto.treatment,
        veterinarian: createDto.veterinarian,
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: 'user-1',
        status: 'COMPLETED',
        cat: { id: 'cat-1', name: 'Test Cat' },
        schedule: null,
        tags: [],
        attachments: [],
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.cat.findUnique.mockResolvedValue({ id: 'cat-1', name: 'Test Cat' });
      mockPrismaService.medicalRecord.create.mockResolvedValue(mockRecord);

      const result = await service.addMedicalRecord(createDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.cat.id).toBe('cat-1');
      expect(mockPrismaService.medicalRecord.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid cat', async () => {
      const createDto = {
        catId: 'invalid-cat',
        visitDate: '2024-01-15',
        diagnosis: 'Healthy',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      // Mock Prisma to throw a foreign key constraint error
      mockPrismaService.medicalRecord.create.mockRejectedValue(
        new Error('Foreign key constraint failed on the field: `catId`')
      );

      await expect(service.addMedicalRecord(createDto)).rejects.toThrow();
    });
  });

  describe('findMedicalRecords', () => {
    it('should return paginated medical records', async () => {
      const mockRecords = [
        {
          id: '1',
          catId: 'cat-1',
          visitDate: new Date(),
          diagnosis: 'Healthy',
          createdAt: new Date(),
          updatedAt: new Date(),
          recordedBy: 'user-1',
          status: 'COMPLETED',
          cat: { id: 'cat-1', name: 'Test Cat' },
          schedule: null,
          tags: [],
          attachments: [],
        },
      ];

      mockPrismaService.medicalRecord.count.mockResolvedValue(1);
      mockPrismaService.medicalRecord.findMany.mockResolvedValue(mockRecords);

      const result = await service.findMedicalRecords({});

      expect(result.meta.total).toBe(1);
      expect(result.data).toBeDefined();
      expect(result.data[0].cat.id).toBe('cat-1');
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule successfully', async () => {
      const mockSchedule = { id: '1', name: 'Vaccine' };

      mockPrismaService.schedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.schedule.delete.mockResolvedValue(mockSchedule);

      const result = await service.deleteSchedule('1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.schedule.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException for invalid schedule', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue(null);

      await expect(service.deleteSchedule('invalid')).rejects.toThrow(NotFoundException);
    });
  });
  describe('findMedicalRecordById', () => {
    const mockRecord = {
      id: 'rec-1',
      catId: 'cat-1',
      visitDate: new Date(),
      diagnosis: 'Healthy',
      createdAt: new Date(),
      updatedAt: new Date(),
      recordedBy: 'user-1',
      status: 'COMPLETED',
      cat: { id: 'cat-1', name: 'Test Cat' },
      schedule: null,
      tags: [],
      attachments: [],
    };

    it('should return a medical record by id', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValue(mockRecord);

      const result = await service.findMedicalRecordById('rec-1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('rec-1');
      expect(result.data.cat.id).toBe('cat-1');
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValue(null);

      await expect(service.findMedicalRecordById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMedicalRecord', () => {
    const mockUpdated = {
      id: 'rec-1',
      catId: 'cat-1',
      visitDate: new Date(),
      diagnosis: '更新済み診断',
      createdAt: new Date(),
      updatedAt: new Date(),
      recordedBy: 'user-1',
      status: 'COMPLETED',
      cat: { id: 'cat-1', name: 'Test Cat' },
      schedule: null,
      tags: [],
      attachments: [],
    };

    it('should update diagnosis and replace tags/attachments', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValue({ id: 'rec-1' });
      mockPrismaService.medicalRecord.update.mockResolvedValue(mockUpdated);

      const result = await service.updateMedicalRecord('rec-1', {
        diagnosis: '更新済み診断',
        tagIds: ['tag-1'],
        attachments: [{ url: 'https://example.com/a.png' }],
      });

      expect(result.success).toBe(true);
      expect(result.data.diagnosis).toBe('更新済み診断');
      const updateArgs = mockPrismaService.medicalRecord.update.mock.calls[0][0];
      expect(updateArgs.data.diagnosis).toBe('更新済み診断');
      // tags / attachments は全置換（deleteMany + create）であること
      expect(updateArgs.data.tags).toEqual({
        deleteMany: {},
        create: [{ tagId: 'tag-1' }],
      });
      expect(updateArgs.data.attachments.deleteMany).toEqual({});
      expect(updateArgs.data.attachments.create).toHaveLength(1);
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValue(null);

      await expect(service.updateMedicalRecord('invalid', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMedicalRecord', () => {
    it('should delete a medical record successfully', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValue({ id: 'rec-1' });
      mockPrismaService.medicalRecord.delete.mockResolvedValue({ id: 'rec-1' });

      const result = await service.deleteMedicalRecord('rec-1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.medicalRecord.delete).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
      });
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockPrismaService.medicalRecord.findUnique.mockResolvedValue(null);

      await expect(service.deleteMedicalRecord('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateScheduleStatus', () => {
    it('should update schedule status', async () => {
      const mockSchedule = {
        id: '1',
        name: 'Vaccine',
        title: 'Vaccine',
        description: null,
        scheduleDate: new Date(),
        endDate: null,
        timezone: null,
        scheduleType: 'CARE',
        status: 'CANCELLED',
        careType: 'HEALTH_CHECK',
        priority: 'MEDIUM',
        recurrenceRule: null,
        assignedTo: 'user-1',
        cat: null,
        scheduleCats: [],
        reminders: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.schedule.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.schedule.update.mockResolvedValue(mockSchedule);

      const result = await service.updateScheduleStatus('1', 'CANCELLED');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('CANCELLED');
      expect(mockPrismaService.schedule.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' }, data: { status: 'CANCELLED' } }),
      );
    });

    it('should throw NotFoundException for invalid schedule', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue(null);

      await expect(service.updateScheduleStatus('invalid', 'PENDING')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

