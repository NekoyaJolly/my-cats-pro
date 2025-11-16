import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { GraduationService } from './graduation.service';


describe('GraduationService', () => {
  let service: GraduationService;
  let _prismaService: PrismaService;

  const mockPrismaService: any = {
    cat: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    graduation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraduationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GraduationService>(GraduationService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transferCat', () => {
    it('should transfer a cat successfully', async () => {
      const catId = 'cat-1';
      const transferDto = {
        transferDate: '2024-01-15',
        destination: 'New Home',
        notes: 'Good home',
      };

      const mockCat = {
        id: 'cat-1',
        name: 'Test Cat',
        isInHouse: true,
        isGraduated: false,
      };

      const mockGraduation = {
        id: '1',
        catId: 'cat-1',
        transferDate: new Date(transferDto.transferDate),
        destination: transferDto.destination,
        notes: transferDto.notes,
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.graduation.create.mockResolvedValue(mockGraduation);
      mockPrismaService.cat.update.mockResolvedValue({ ...mockCat, isGraduated: true, isInHouse: false });

      const result = await service.transferCat(catId, transferDto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException for invalid cat', async () => {
      const catId = 'invalid-cat';
      const transferDto = {
        transferDate: '2024-01-15',
        destination: 'New Home',
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.transferCat(catId, transferDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllGraduations', () => {
    it('should return paginated graduation records', async () => {
      const mockRecords = [
        {
          id: '1',
          catId: 'cat-1',
          transferDate: new Date(),
          destination: 'New Home',
          cat: {
            id: 'cat-1',
            name: 'Test Cat',
            gender: 'MALE',
            birthDate: new Date(),
          },
        },
      ];

      mockPrismaService.graduation.findMany.mockResolvedValue(mockRecords);
      mockPrismaService.graduation.count.mockResolvedValue(1);

      const result = await service.findAllGraduations(1, 50);

      expect(result.data).toEqual(mockRecords);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOneGraduation', () => {
    it('should return a graduation record', async () => {
      const mockGraduation = {
        id: '1',
        catId: 'cat-1',
        transferDate: new Date(),
        destination: 'New Home',
      };

      mockPrismaService.graduation.findUnique.mockResolvedValue(mockGraduation);

      const result = await service.findOneGraduation('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGraduation);
    });

    it('should throw NotFoundException for invalid graduation', async () => {
      mockPrismaService.graduation.findUnique.mockResolvedValue(null);

      await expect(service.findOneGraduation('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelGraduation', () => {
    it('should cancel a graduation successfully', async () => {
      const mockGraduation = {
        id: '1',
        catId: 'cat-1',
      };

      const mockCat = {
        id: 'cat-1',
        isGraduated: true,
        isInHouse: false,
      };

      mockPrismaService.graduation.findUnique.mockResolvedValue(mockGraduation);
      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.graduation.delete.mockResolvedValue(mockGraduation);
      mockPrismaService.cat.update.mockResolvedValue({ ...mockCat, isGraduated: false, isInHouse: true });

      const result = await service.cancelGraduation('1');

      expect(result.success).toBe(true);
    });
  });
});
