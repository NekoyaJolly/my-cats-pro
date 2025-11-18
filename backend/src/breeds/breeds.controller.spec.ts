import { Test, TestingModule } from '@nestjs/testing';

import { DisplayPreferencesService } from '../display-preferences/display-preferences.service';

import { BreedsController } from './breeds.controller';
import { BreedsService } from './breeds.service';

describe('BreedsController', () => {
  let controller: BreedsController;
  let service: BreedsService;

  const mockBreedsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getMasterData: jest.fn(),
  };
  const mockDisplayPreferencesService = {
    getPreferences: jest.fn(),
    buildPersonalizedBreedRecords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BreedsController],
      providers: [
        {
          provide: BreedsService,
          useValue: mockBreedsService,
        },
        {
          provide: DisplayPreferencesService,
          useValue: mockDisplayPreferencesService,
        },
      ],
    }).compile();

    controller = module.get<BreedsController>(BreedsController);
    service = module.get<BreedsService>(BreedsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a breed', async () => {
      const createDto = { code: 1, name: 'Persian', description: 'Long-haired' };
      const mockBreed = { id: '1', ...createDto };

      mockBreedsService.create.mockResolvedValue(mockBreed);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockBreed);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated breeds', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Persian' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockBreedsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a breed by id', async () => {
      const mockBreed = { id: '1', name: 'Persian' };

      mockBreedsService.findOne.mockResolvedValue(mockBreed);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockBreed);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a breed', async () => {
      const updateDto = { name: 'Updated Persian' };
      const mockBreed = { id: '1', name: 'Updated Persian' };

      mockBreedsService.update.mockResolvedValue(mockBreed);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockBreed);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a breed', async () => {
      mockBreedsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getMasterData', () => {
    it('should return master data via service', async () => {
      const mockMaster = [{ code: 1, name: 'Abyssinian' }];
      mockBreedsService.getMasterData.mockResolvedValue(mockMaster);

      const result = await controller.getMasterData(undefined);

      expect(result).toEqual(mockMaster);
      expect(service.getMasterData).toHaveBeenCalled();
    });
  });
});
