import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { PedigreeController } from './pedigree.controller';
import { PedigreeService } from './pedigree.service';

describe('PedigreeController', () => {
  let controller: PedigreeController;
  let service: PedigreeService;

  const mockPedigreeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [PedigreeController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: PedigreeService,
          useValue: mockPedigreeService,
        },
      ],
    }).compile();

    controller = module.get<PedigreeController>(PedigreeController);
    service = module.get<PedigreeService>(PedigreeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pedigree record', async () => {
      const createDto = {
        pedigreeId: '700545',
        catName: 'Test Cat',
        breedCode: 92,
      };
      const mockPedigree = { id: '1', ...createDto };

      mockPedigreeService.create.mockResolvedValue(mockPedigree);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPedigree);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated pedigree records', async () => {
      const mockResponse = {
        data: [{ id: '1', registrationNumber: 'PED-001' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockPedigreeService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a pedigree record by id', async () => {
      const mockPedigree = { id: '1', registrationNumber: 'PED-001' };

      mockPedigreeService.findOne.mockResolvedValue(mockPedigree);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockPedigree);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a pedigree record', async () => {
      const updateDto = { catName: 'Updated Cat Name', title: 'Champion' };
      const mockPedigree = { id: '1', ...updateDto };

      mockPedigreeService.update.mockResolvedValue(mockPedigree);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockPedigree);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a pedigree record', async () => {
      mockPedigreeService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
