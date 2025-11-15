import { Test, TestingModule } from '@nestjs/testing';
import { BreedingController } from './breeding.controller';
import { BreedingService } from './breeding.service';

describe('BreedingController', () => {
  let controller: BreedingController;
  let service: BreedingService;

  const mockBreedingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createNgRule: jest.fn(),
    findAllNgRules: jest.fn(),
    removeNgRule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BreedingController],
      providers: [
        {
          provide: BreedingService,
          useValue: mockBreedingService,
        },
      ],
    }).compile();

    controller = module.get<BreedingController>(BreedingController);
    service = module.get<BreedingService>(BreedingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a breeding record', async () => {
      const createDto = {
        fatherId: 'father-1',
        motherId: 'mother-1',
        matingDate: '2024-01-15',
      };
      const mockBreeding = { id: '1', ...createDto };

      mockBreedingService.create.mockResolvedValue(mockBreeding);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockBreeding);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated breeding records', async () => {
      const mockResponse = {
        data: [{ id: '1', fatherId: 'father-1' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockBreedingService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a breeding record by id', async () => {
      const mockBreeding = { id: '1', fatherId: 'father-1' };

      mockBreedingService.findOne.mockResolvedValue(mockBreeding);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockBreeding);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a breeding record', async () => {
      const updateDto = { notes: 'Updated notes' };
      const mockBreeding = { id: '1', notes: 'Updated notes' };

      mockBreedingService.update.mockResolvedValue(mockBreeding);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockBreeding);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a breeding record', async () => {
      mockBreedingService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
