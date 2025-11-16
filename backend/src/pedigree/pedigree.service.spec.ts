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
        pedigreeId: '700545',
        catName: 'Test Cat',
        breedCode: 92,
      };

      const mockPedigree = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
      };

      mockPrismaService.pedigree.create.mockResolvedValue(mockPedigree);

      const result = await service.create(createDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPedigree);
      expect(mockPrismaService.pedigree.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid pedigree id', async () => {
      const createDto = {
        pedigreeId: '',
      };

      mockPrismaService.pedigree.create.mockRejectedValue(new Error('Invalid pedigreeId'));

      await expect(service.create(createDto)).rejects.toThrow();
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
      const updateDto = { catName: 'Updated Cat Name', title: 'Champion' };
      const mockPedigree = {
        id: '1',
        pedigreeId: '700545',
        catName: 'Updated Cat Name',
        title: 'Champion',
      };

      mockPrismaService.pedigree.findUnique.mockResolvedValue({
        id: '1',
        pedigreeId: '700545',
      });
      mockPrismaService.pedigree.update.mockResolvedValue(mockPedigree);

      const result = await service.update('1', updateDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPedigree);
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
