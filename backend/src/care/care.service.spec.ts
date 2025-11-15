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
    medicalRecord: {
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
        },
      ];

      mockPrismaService.careSchedule.findMany.mockResolvedValue(mockSchedules);
      mockPrismaService.careSchedule.count.mockResolvedValue(1);

      const result = await service.findSchedules({});

      expect(result.data).toEqual(mockSchedules);
      expect(result.meta.total).toBe(1);
    });

    it('should filter schedules by catId', async () => {
      const mockSchedules = [
        {
          id: '1',
          catId: 'cat-1',
          name: 'Vaccine',
          scheduledDate: new Date(),
        },
      ];

      mockPrismaService.careSchedule.findMany.mockResolvedValue(mockSchedules);
      mockPrismaService.careSchedule.count.mockResolvedValue(1);

      const result = await service.findSchedules({ catId: 'cat-1' });

      expect(result.data).toEqual(mockSchedules);
    });
  });

  describe('addSchedule', () => {
    it('should create a care schedule successfully', async () => {
      const createDto = {
        name: 'Vaccine',
        catId: 'cat-1',
        scheduledDate: '2024-12-01',
        type: 'CARE' as const,
      };

      const mockSchedule = {
        id: '1',
        ...createDto,
        scheduledDate: new Date(createDto.scheduledDate),
        status: 'PENDING',
        createdAt: new Date(),
      };

      mockPrismaService.careSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.addSchedule(createDto);

      expect(result).toEqual(mockSchedule);
      expect(mockPrismaService.careSchedule.create).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete a care schedule successfully', async () => {
      const mockSchedule = {
        id: '1',
        catId: 'cat-1',
        status: 'PENDING',
      };

      const mockCompletedSchedule = {
        ...mockSchedule,
        status: 'COMPLETED',
        completedAt: new Date(),
      };

      mockPrismaService.careSchedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.careSchedule.update.mockResolvedValue(mockCompletedSchedule);

      const result = await service.complete('1', {});

      expect(result.status).toBe('COMPLETED');
      expect(mockPrismaService.careSchedule.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid schedule', async () => {
      mockPrismaService.careSchedule.findUnique.mockResolvedValue(null);

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
        ...createDto,
        visitDate: new Date(createDto.visitDate),
        createdAt: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue({ id: 'cat-1' });
      mockPrismaService.medicalRecord.create.mockResolvedValue(mockRecord);

      const result = await service.addMedicalRecord(createDto);

      expect(result).toEqual(mockRecord);
      expect(mockPrismaService.medicalRecord.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid cat', async () => {
      const createDto = {
        catId: 'invalid-cat',
        visitDate: '2024-01-15',
        diagnosis: 'Healthy',
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.addMedicalRecord(createDto)).rejects.toThrow(NotFoundException);
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
        },
      ];

      mockPrismaService.medicalRecord.findMany.mockResolvedValue(mockRecords);
      mockPrismaService.medicalRecord.count.mockResolvedValue(1);

      const result = await service.findMedicalRecords({});

      expect(result.data).toEqual(mockRecords);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule successfully', async () => {
      const mockSchedule = { id: '1', name: 'Vaccine' };

      mockPrismaService.careSchedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.careSchedule.delete.mockResolvedValue(mockSchedule);

      const result = await service.deleteSchedule('1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.careSchedule.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException for invalid schedule', async () => {
      mockPrismaService.careSchedule.findUnique.mockResolvedValue(null);

      await expect(service.deleteSchedule('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
