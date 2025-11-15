import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { BreedingService } from './breeding.service';



describe('BreedingService', () => {
  let service: BreedingService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    breeding: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    breedingRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cat: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    breedingNgRule: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((args) => Promise.all(args)),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BreedingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<BreedingService>(BreedingService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a breeding record successfully', async () => {
      const createDto = {
        femaleId: 'mother-1',
        maleId: 'father-1',
        breedingDate: '2024-01-15',
      };

      const mockFather = { id: 'father-1', gender: 'MALE' };
      const mockMother = { id: 'mother-1', gender: 'FEMALE' };
      const mockBreeding = {
        id: '1',
        femaleId: createDto.femaleId,
        maleId: createDto.maleId,
        breedingDate: new Date(createDto.breedingDate),
      };

      mockPrismaService.cat.findUnique
        .mockResolvedValueOnce(mockMother) // First call for female
        .mockResolvedValueOnce(mockFather); // Second call for male
      mockPrismaService.breedingNgRule.findMany.mockResolvedValue([]);
      mockPrismaService.breeding.create.mockResolvedValue(mockBreeding);

      const result = await service.create(createDto);

      expect(result).toEqual(mockBreeding);
      expect(mockPrismaService.breeding.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid father', async () => {
      const createDto = {
        femaleId: 'mother-1',
        maleId: 'invalid-father',
        breedingDate: '2024-01-15',
      };

      mockPrismaService.cat.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated breeding records', async () => {
      const mockBreedings = [
        {
          id: '1',
          femaleId: 'mother-1',
          maleId: 'father-1',
          breedingDate: new Date(),
        },
      ];

      mockPrismaService.breedingRecord.count.mockResolvedValue(1);
      mockPrismaService.breedingRecord.findMany.mockResolvedValue(mockBreedings);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockBreedings);
      expect(result.meta.total).toBe(1);
    });
  });


});
