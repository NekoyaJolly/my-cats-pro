import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GraduationService } from './graduation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GraduationService', () => {
  let service: GraduationService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    cat: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    graduationRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
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
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transferCat', () => {
    it('should transfer a cat successfully', async () => {
      const transferDto = {
        catId: 'cat-1',
        transferDate: '2024-01-15',
        destination: 'New Home',
        notes: 'Good home',
      };

      const mockCat = {
        id: 'cat-1',
        name: 'Test Cat',
        isInHouse: true,
      };

      const mockUpdatedCat = {
        ...mockCat,
        isInHouse: false,
      };

      const mockGradRecord = {
        id: '1',
        catId: 'cat-1',
        transferDate: new Date(transferDto.transferDate),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.cat.update.mockResolvedValue(mockUpdatedCat);
      mockPrismaService.graduationRecord.create.mockResolvedValue(mockGradRecord);

      const result = await service.transferCat(transferDto);

      expect(result).toEqual(mockGradRecord);
      expect(mockPrismaService.cat.update).toHaveBeenCalled();
      expect(mockPrismaService.graduationRecord.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid cat', async () => {
      const transferDto = {
        catId: 'invalid-cat',
        transferDate: '2024-01-15',
        destination: 'New Home',
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.transferCat(transferDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllGraduationRecords', () => {
    it('should return paginated graduation records', async () => {
      const mockRecords = [
        {
          id: '1',
          catId: 'cat-1',
          transferDate: new Date(),
          destination: 'New Home',
        },
      ];

      mockPrismaService.graduationRecord.findMany.mockResolvedValue(mockRecords);
      mockPrismaService.graduationRecord.count.mockResolvedValue(1);

      const result = await service.findAllGraduationRecords({});

      expect(result.data).toEqual(mockRecords);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getGraduatedCats', () => {
    it('should return graduated cats', async () => {
      const mockCats = [
        {
          id: 'cat-1',
          name: 'Graduated Cat',
          isInHouse: false,
        },
      ];

      mockPrismaService.cat.findMany.mockResolvedValue(mockCats);

      const result = await service.getGraduatedCats({});

      expect(result.data).toEqual(mockCats);
    });
  });
});
