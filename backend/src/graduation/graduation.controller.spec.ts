import { Test, TestingModule } from '@nestjs/testing';

import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';

describe('GraduationController', () => {
  let controller: GraduationController;
  let service: GraduationService;

  const mockGraduationService = {
    transferCat: jest.fn(),
    findAllGraduationRecords: jest.fn(),
    getGraduatedCats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraduationController],
      providers: [
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
      const transferDto = {
        catId: 'cat-1',
        transferDate: '2024-01-15',
        destination: 'New Home',
      };
      const mockRecord = { id: '1', ...transferDto };

      mockGraduationService.transferCat.mockResolvedValue(mockRecord);

      const result = await controller.transferCat(transferDto);

      expect(result).toEqual(mockRecord);
      expect(service.transferCat).toHaveBeenCalledWith(transferDto);
    });
  });

  describe('findAllGraduationRecords', () => {
    it('should return graduation records', async () => {
      const mockResponse = {
        data: [{ id: '1', catId: 'cat-1' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockGraduationService.findAllGraduationRecords.mockResolvedValue(mockResponse);

      const result = await controller.findAllGraduationRecords({});

      expect(result).toEqual(mockResponse);
      expect(service.findAllGraduationRecords).toHaveBeenCalledWith({});
    });
  });

  describe('getGraduatedCats', () => {
    it('should return graduated cats', async () => {
      const mockResponse = {
        data: [{ id: 'cat-1', name: 'Graduated Cat' }],
      };

      mockGraduationService.getGraduatedCats.mockResolvedValue(mockResponse);

      const result = await controller.getGraduatedCats({});

      expect(result).toEqual(mockResponse);
      expect(service.getGraduatedCats).toHaveBeenCalledWith({});
    });
  });
});
