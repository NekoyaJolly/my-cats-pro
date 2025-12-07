import { Test, TestingModule } from '@nestjs/testing';

import { DisplayPreferencesService } from '../display-preferences/display-preferences.service';
import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { CoatColorsController } from './coat-colors.controller';
import { CoatColorsService } from './coat-colors.service';

describe('CoatColorsController', () => {
  let controller: CoatColorsController;
  let service: CoatColorsService;

  const mockCoatColorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getMasterData: jest.fn(),
  };
  const mockDisplayPreferencesService = {
    getPreferences: jest.fn(),
    buildPersonalizedCoatColorRecords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [CoatColorsController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: CoatColorsService,
          useValue: mockCoatColorsService,
        },
        {
          provide: DisplayPreferencesService,
          useValue: mockDisplayPreferencesService,
        },
      ],
    }).compile();

    controller = module.get<CoatColorsController>(CoatColorsController);
    service = module.get<CoatColorsService>(CoatColorsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a coat color', async () => {
      const createDto = { code: 1, name: 'Black', description: 'Solid black' };
      const mockColor = { id: '1', ...createDto };

      mockCoatColorsService.create.mockResolvedValue(mockColor);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockColor);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated coat colors', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Black' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCoatColorsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a coat color by id', async () => {
      const mockColor = { id: '1', name: 'Black' };

      mockCoatColorsService.findOne.mockResolvedValue(mockColor);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockColor);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a coat color', async () => {
      const updateDto = { name: 'Updated Black' };
      const mockColor = { id: '1', name: 'Updated Black' };

      mockCoatColorsService.update.mockResolvedValue(mockColor);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockColor);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a coat color', async () => {
      mockCoatColorsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getMasterData', () => {
    it('should return master data via service', async () => {
      const mockMaster = [{ code: 1, name: 'White' }];
      mockCoatColorsService.getMasterData.mockResolvedValue(mockMaster);

      const result = await controller.getMasterData(undefined);

      expect(result).toEqual(mockMaster);
      expect(service.getMasterData).toHaveBeenCalled();
    });
  });
});
