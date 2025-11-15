import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CatsService } from './cats.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatDto } from './dto';

describe('CatsService', () => {
  let service: CatsService;
  let prismaService: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrismaService = {
    cat: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    breed: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    coatColor: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
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

    service = module.get<CatsService>(CatsService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a cat successfully', async () => {
      const createCatDto: CreateCatDto = {
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: '2024-01-01',
        isInHouse: true,
      };

      const mockCat = {
        id: '1',
        ...createCatDto,
        birthDate: new Date(createCatDto.birthDate),
        breed: null,
        coatColor: null,
        tags: [],
      };

      mockPrismaService.cat.create.mockResolvedValue(mockCat);

      const result = await service.create(createCatDto);

      expect(result).toEqual(mockCat);
      expect(mockPrismaService.cat.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException for invalid breed', async () => {
      const createCatDto: CreateCatDto = {
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: '2024-01-01',
        breedId: 'invalid-breed-id',
        isInHouse: true,
      };

      mockPrismaService.breed.findUnique.mockResolvedValue(null);
      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.create(createCatDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid coat color', async () => {
      const createCatDto: CreateCatDto = {
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: '2024-01-01',
        coatColorId: 'invalid-color-id',
        isInHouse: true,
      };

      mockPrismaService.coatColor.findUnique.mockResolvedValue(null);
      mockPrismaService.coatColor.findFirst.mockResolvedValue(null);

      await expect(service.create(createCatDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated cats', async () => {
      const mockCats = [
        { id: '1', name: 'Cat 1', gender: 'FEMALE', birthDate: new Date() },
        { id: '2', name: 'Cat 2', gender: 'MALE', birthDate: new Date() },
      ];

      mockPrismaService.cat.findMany.mockResolvedValue(mockCats);
      mockPrismaService.cat.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockCats);
      expect(result.meta.total).toBe(2);
      expect(mockPrismaService.cat.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.cat.count).toHaveBeenCalledTimes(1);
    });

    it('should filter cats by gender', async () => {
      const mockCats = [
        { id: '1', name: 'Cat 1', gender: 'FEMALE', birthDate: new Date() },
      ];

      mockPrismaService.cat.findMany.mockResolvedValue(mockCats);
      mockPrismaService.cat.count.mockResolvedValue(1);

      const result = await service.findAll({ gender: 'FEMALE' as any });

      expect(result.data).toEqual(mockCats);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a cat by id', async () => {
      const mockCat = {
        id: '1',
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCat);
      expect(mockPrismaService.cat.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when cat not found', async () => {
      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cat successfully', async () => {
      const updateDto = { name: 'Updated Cat' };
      const mockCat = {
        id: '1',
        name: 'Updated Cat',
        gender: 'FEMALE',
        birthDate: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.cat.update.mockResolvedValue(mockCat);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockCat);
      expect(mockPrismaService.cat.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating non-existent cat', async () => {
      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a cat successfully', async () => {
      const mockCat = {
        id: '1',
        name: 'Test Cat',
        gender: 'FEMALE',
        birthDate: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.cat.delete.mockResolvedValue(mockCat);

      await service.remove('1');

      expect(mockPrismaService.cat.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent cat', async () => {
      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('should return cat statistics', async () => {
      mockPrismaService.cat.count.mockImplementation(({ where }) => {
        if (where.gender === 'FEMALE') return Promise.resolve(10);
        if (where.gender === 'MALE') return Promise.resolve(8);
        if (where.isInHouse === true) return Promise.resolve(15);
        return Promise.resolve(18);
      });

      const result = await service.getStatistics();

      expect(result.total).toBe(18);
      expect(result.female).toBe(10);
      expect(result.male).toBe(8);
      expect(result.inHouse).toBe(15);
    });
  });
});
