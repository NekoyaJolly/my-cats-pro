import { Test, TestingModule } from '@nestjs/testing';

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoatColorsController],
      providers: [
        {
          provide: CoatColorsService,
          useValue: mockCoatColorsService,
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
});
