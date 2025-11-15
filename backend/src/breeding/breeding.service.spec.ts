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
    cat: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    breedingNgRule: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
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
        fatherId: 'father-1',
        motherId: 'mother-1',
        matingDate: '2024-01-15',
      };

      const mockFather = { id: 'father-1', gender: 'MALE' };
      const mockMother = { id: 'mother-1', gender: 'FEMALE' };
      const mockBreeding = {
        id: '1',
        ...createDto,
        matingDate: new Date(createDto.matingDate),
      };

      mockPrismaService.cat.findUnique
        .mockResolvedValueOnce(mockFather)
        .mockResolvedValueOnce(mockMother);
      mockPrismaService.breedingNgRule.findMany.mockResolvedValue([]);
      mockPrismaService.breeding.create.mockResolvedValue(mockBreeding);

      const result = await service.create(createDto);

      expect(result).toEqual(mockBreeding);
      expect(mockPrismaService.breeding.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid father', async () => {
      const createDto = {
        fatherId: 'invalid-father',
        motherId: 'mother-1',
        matingDate: '2024-01-15',
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
          fatherId: 'father-1',
          motherId: 'mother-1',
          matingDate: new Date(),
        },
      ];

      mockPrismaService.breeding.findMany.mockResolvedValue(mockBreedings);
      mockPrismaService.breeding.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockBreedings);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a breeding record by id', async () => {
      const mockBreeding = {
        id: '1',
        fatherId: 'father-1',
        motherId: 'mother-1',
        matingDate: new Date(),
      };

      mockPrismaService.breeding.findUnique.mockResolvedValue(mockBreeding);

      const result = await service.findOne('1');

      expect(result).toEqual(mockBreeding);
    });

    it('should throw NotFoundException when breeding not found', async () => {
      mockPrismaService.breeding.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a breeding record successfully', async () => {
      const updateDto = { notes: 'Updated notes' };
      const mockBreeding = {
        id: '1',
        fatherId: 'father-1',
        motherId: 'mother-1',
        notes: 'Updated notes',
      };

      mockPrismaService.breeding.findUnique.mockResolvedValue({
        id: '1',
        fatherId: 'father-1',
        motherId: 'mother-1',
      });
      mockPrismaService.breeding.update.mockResolvedValue(mockBreeding);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockBreeding);
    });
  });

  describe('remove', () => {
    it('should delete a breeding record successfully', async () => {
      const mockBreeding = { id: '1', fatherId: 'father-1' };

      mockPrismaService.breeding.findUnique.mockResolvedValue(mockBreeding);
      mockPrismaService.breeding.delete.mockResolvedValue(mockBreeding);

      await service.remove('1');

      expect(mockPrismaService.breeding.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
