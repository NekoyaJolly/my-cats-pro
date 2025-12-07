import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';

describe('GraduationController', () => {
  let controller: GraduationController;
  let service: GraduationService;

  const mockGraduationService = {
    transferCat: jest.fn(),
    findAllGraduations: jest.fn(),
    findOneGraduation: jest.fn(),
    cancelGraduation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [GraduationController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: GraduationService,
          useValue: mockGraduationService,
        },
      ],
    }).compile();

    controller = module.get<GraduationController>(GraduationController);
    service = module.get<GraduationService>(GraduationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transferCat', () => {
    it('should transfer a cat', async () => {
      const catId = 'cat-1';
      const transferDto = {
        transferDate: '2024-01-15',
        destination: 'New Home',
      };
      const mockRecord = { success: true, data: { id: '1', catId, ...transferDto } };

      mockGraduationService.transferCat.mockResolvedValue(mockRecord);

      const result = await controller.transferCat(catId, transferDto);

      expect(result).toEqual(mockRecord);
      expect(service.transferCat).toHaveBeenCalledWith(catId, transferDto);
    });
  });

  describe('findAllGraduations', () => {
    it('should return graduation records', async () => {
      const mockResponse = {
        data: [{ id: '1', catId: 'cat-1' }],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      };

      mockGraduationService.findAllGraduations.mockResolvedValue(mockResponse);

      const result = await controller.findAllGraduations('1', '50');

      expect(result).toEqual(mockResponse);
      expect(service.findAllGraduations).toHaveBeenCalledWith(1, 50);
    });
  });

  describe('findOneGraduation', () => {
    it('should return a graduation record', async () => {
      const mockGraduation = { id: '1', catId: 'cat-1', transferDate: new Date() };

      mockGraduationService.findOneGraduation.mockResolvedValue(mockGraduation);

      const result = await controller.findOneGraduation('1');

      expect(result).toEqual(mockGraduation);
      expect(service.findOneGraduation).toHaveBeenCalledWith('1');
    });
  });

  describe('cancelGraduation', () => {
    it('should cancel a graduation', async () => {
      const mockResponse = { success: true, message: 'Graduation cancelled' };

      mockGraduationService.cancelGraduation.mockResolvedValue(mockResponse);

      const result = await controller.cancelGraduation('1');

      expect(result).toEqual(mockResponse);
      expect(service.cancelGraduation).toHaveBeenCalledWith('1');
    });
  });
});
