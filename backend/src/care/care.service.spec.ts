import { NotFoundException } from '@nestjs/common';
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
});
