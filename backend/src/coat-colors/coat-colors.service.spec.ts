import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { CoatColorsService } from './coat-colors.service';


describe('CoatColorsService', () => {
  let service: CoatColorsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    coatColor: {
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
        CoatColorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoatColorsService>(CoatColorsService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a coat color successfully', async () => {
      const createDto = {
        code: 1,
        name: 'Black',
        description: 'Solid black coat',
      };

      const mockColor = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coatColor.create.mockResolvedValue(mockColor);

      const result = await service.create(createDto);

      expect(result).toEqual(mockColor);
      expect(mockPrismaService.coatColor.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated coat colors', async () => {
      const mockColors = [
        { id: '1', name: 'Black' },
        { id: '2', name: 'White' },
      ];

      mockPrismaService.coatColor.findMany.mockResolvedValue(mockColors);
      mockPrismaService.coatColor.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockColors);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a coat color by id', async () => {
      const mockColor = { id: '1', name: 'Black' };

      mockPrismaService.coatColor.findUnique.mockResolvedValue(mockColor);

      const result = await service.findOne('1');

      expect(result).toEqual(mockColor);
    });

    it('should throw NotFoundException when coat color not found', async () => {
      mockPrismaService.coatColor.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a coat color successfully', async () => {
      const updateDto = { name: 'Updated Black' };
      const mockColor = { id: '1', name: 'Updated Black' };

      mockPrismaService.coatColor.findUnique.mockResolvedValue({ id: '1', name: 'Black' });
      mockPrismaService.coatColor.update.mockResolvedValue(mockColor);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockColor);
      expect(mockPrismaService.coatColor.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a coat color successfully', async () => {
      const mockColor = { id: '1', name: 'Black' };

      mockPrismaService.coatColor.findUnique.mockResolvedValue(mockColor);
      mockPrismaService.coatColor.delete.mockResolvedValue(mockColor);

      await service.remove('1');

      expect(mockPrismaService.coatColor.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
