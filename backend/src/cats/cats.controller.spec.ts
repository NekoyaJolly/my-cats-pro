import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  const mockCatsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStatistics: jest.fn(),
    assignTags: jest.fn(),
    removeTags: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        {
          provide: CatsService,
          useValue: mockCatsService,
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cat', async () => {
      const createDto = {
        name: 'Test Cat',
        gender: 'FEMALE' as const,
        birthDate: '2024-01-01',
        isInHouse: true,
      };
      const mockCat = { id: '1', ...createDto };

      mockCatsService.create.mockResolvedValue(mockCat);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCat);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated cats', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Cat 1' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCatsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a cat by id', async () => {
      const mockCat = { id: '1', name: 'Test Cat' };

      mockCatsService.findOne.mockResolvedValue(mockCat);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCat);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a cat', async () => {
      const updateDto = { name: 'Updated Cat' };
      const mockCat = { id: '1', name: 'Updated Cat' };

      mockCatsService.update.mockResolvedValue(mockCat);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockCat);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a cat', async () => {
      mockCatsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getStatistics', () => {
    it('should return cat statistics', async () => {
      const mockStats = {
        total: 18,
        female: 10,
        male: 8,
        inHouse: 15,
        graduated: 3,
      };

      mockCatsService.getStatistics.mockResolvedValue(mockStats);

      const result = await controller.getStatistics();

      expect(result).toEqual(mockStats);
      expect(service.getStatistics).toHaveBeenCalled();
    });
  });
});
