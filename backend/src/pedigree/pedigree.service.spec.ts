import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { PedigreeService } from './pedigree.service';


describe('PedigreeService', () => {
  let service: PedigreeService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    pedigree: {
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
        PedigreeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PedigreeService>(PedigreeService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a pedigree record successfully', async () => {
      const createDto = {
        catId: 'cat-1',
        registrationNumber: 'PED-001',
        organization: 'CFA',
      };

      const mockCat = { id: 'cat-1', name: 'Test Cat' };
      const mockPedigree = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.pedigree.create.mockResolvedValue(mockPedigree);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPedigree);
      expect(mockPrismaService.pedigree.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid cat', async () => {
      const createDto = {
        catId: 'invalid-cat',
        registrationNumber: 'PED-001',
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated pedigree records', async () => {
      const mockPedigrees = [
        {
          id: '1',
          catId: 'cat-1',
          registrationNumber: 'PED-001',
        },
      ];

      mockPrismaService.pedigree.findMany.mockResolvedValue(mockPedigrees);
      mockPrismaService.pedigree.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockPedigrees);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a pedigree record by id', async () => {
      const mockPedigree = {
        id: '1',
        catId: 'cat-1',
        registrationNumber: 'PED-001',
      };

      mockPrismaService.pedigree.findUnique.mockResolvedValue(mockPedigree);

      const result = await service.findOne('1');

      expect(result).toEqual(mockPedigree);
    });

    it('should throw NotFoundException when pedigree not found', async () => {
      mockPrismaService.pedigree.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a pedigree record successfully', async () => {
      const updateDto = { organization: 'TICA' };
      const mockPedigree = {
        id: '1',
        catId: 'cat-1',
        organization: 'TICA',
      };

      mockPrismaService.pedigree.findUnique.mockResolvedValue({
        id: '1',
        catId: 'cat-1',
      });
      mockPrismaService.pedigree.update.mockResolvedValue(mockPedigree);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockPedigree);
    });
  });

  describe('remove', () => {
    it('should delete a pedigree record successfully', async () => {
      const mockPedigree = { id: '1', catId: 'cat-1' };

      mockPrismaService.pedigree.findUnique.mockResolvedValue(mockPedigree);
      mockPrismaService.pedigree.delete.mockResolvedValue(mockPedigree);

      await service.remove('1');

      expect(mockPrismaService.pedigree.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
