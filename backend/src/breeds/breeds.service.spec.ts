import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { BreedsService } from './breeds.service';


describe('BreedsService', () => {
  let service: BreedsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    breed: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BreedsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BreedsService>(BreedsService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a breed successfully', async () => {
      const createDto = {
        code: 1,
        name: 'Persian',
        description: 'Long-haired cat',
      };

      const mockBreed = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.breed.create.mockResolvedValue(mockBreed);

      const result = await service.create(createDto);

      expect(result).toEqual(mockBreed);
      expect(mockPrismaService.breed.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated breeds', async () => {
      const mockBreeds = [
        { id: '1', name: 'Persian' },
        { id: '2', name: 'Siamese' },
      ];

      mockPrismaService.breed.findMany.mockResolvedValue(mockBreeds);
      mockPrismaService.breed.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockBreeds);
      expect(result.meta.total).toBe(2);
      expect(mockPrismaService.breed.findMany).toHaveBeenCalled();
      expect(mockPrismaService.breed.count).toHaveBeenCalled();
    });

    it('should filter breeds by search term', async () => {
      const mockBreeds = [{ id: '1', name: 'Persian' }];

      mockPrismaService.breed.findMany.mockResolvedValue(mockBreeds);
      mockPrismaService.breed.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'Persian' });

      expect(result.data).toEqual(mockBreeds);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a breed by id', async () => {
      const mockBreed = { id: '1', name: 'Persian' };

      mockPrismaService.breed.findUnique.mockResolvedValue(mockBreed);

      const result = await service.findOne('1');

      expect(result).toEqual(mockBreed);
      expect(mockPrismaService.breed.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { _count: { select: { cats: true } } },
      });
    });

    it('should throw NotFoundException when breed not found', async () => {
      mockPrismaService.breed.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a breed successfully', async () => {
      const updateDto = { name: 'Updated Persian' };
      const mockBreed = { id: '1', name: 'Updated Persian' };

      mockPrismaService.breed.findUnique.mockResolvedValue({ id: '1', name: 'Persian' });
      mockPrismaService.breed.update.mockResolvedValue(mockBreed);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockBreed);
      expect(mockPrismaService.breed.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when updating non-existent breed', async () => {
      mockPrismaService.breed.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a breed successfully', async () => {
      const mockBreed = { id: '1', name: 'Persian' };

      mockPrismaService.breed.findUnique.mockResolvedValue(mockBreed);
      mockPrismaService.breed.delete.mockResolvedValue(mockBreed);

      await service.remove('1');

      expect(mockPrismaService.breed.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent breed', async () => {
      mockPrismaService.breed.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
