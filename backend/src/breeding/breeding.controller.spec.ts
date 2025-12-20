import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { BreedingController } from './breeding.controller';
import { BreedingService } from './breeding.service';

describe('BreedingController', () => {
  let controller: BreedingController;
  let service: BreedingService;

  const mockBreedingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findNgRules: jest.fn(),
    createNgRule: jest.fn(),
    updateNgRule: jest.fn(),
    removeNgRule: jest.fn(),
    findAllPregnancyChecks: jest.fn(),
    createPregnancyCheck: jest.fn(),
    updatePregnancyCheck: jest.fn(),
    removePregnancyCheck: jest.fn(),
    findAllBirthPlans: jest.fn(),
    createBirthPlan: jest.fn(),
    updateBirthPlan: jest.fn(),
    removeBirthPlan: jest.fn(),
    findAllKittenDispositions: jest.fn(),
    createKittenDisposition: jest.fn(),
    updateKittenDisposition: jest.fn(),
    removeKittenDisposition: jest.fn(),
    completeBirthRecord: jest.fn(),
    findAllBreedingSchedules: jest.fn(),
    createBreedingSchedule: jest.fn(),
    updateBreedingSchedule: jest.fn(),
    removeBreedingSchedule: jest.fn(),
    findMatingChecksBySchedule: jest.fn(),
    createMatingCheck: jest.fn(),
    updateMatingCheck: jest.fn(),
    removeMatingCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [BreedingController],
      providers: [
        ...getTestModuleProviders(),
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
        femaleId: 'mother-1',
        maleId: 'father-1',
        breedingDate: '2024-01-15',
      };
      const mockBreeding = { id: '1', ...createDto };

      mockBreedingService.create.mockResolvedValue(mockBreeding);

      const result = await controller.create(createDto, undefined);

      expect(result).toEqual(mockBreeding);
      expect(service.create).toHaveBeenCalledWith(createDto, undefined);
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


});
