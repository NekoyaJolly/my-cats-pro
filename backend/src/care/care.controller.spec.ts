import { Test, TestingModule } from '@nestjs/testing';

import { CareController } from './care.controller';
import { CareService } from './care.service';

describe('CareController', () => {
  let controller: CareController;
  let service: CareService;

  const mockCareService = {
    addSchedule: jest.fn(),
    findSchedules: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
    complete: jest.fn(),
    addMedicalRecord: jest.fn(),
    findMedicalRecords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareController],
      providers: [
        {
          provide: CareService,
          useValue: mockCareService,
        },
      ],
    }).compile();

    controller = module.get<CareController>(CareController);
    service = module.get<CareService>(CareService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addSchedule', () => {
    it('should create a care schedule', async () => {
      const createDto = {
        catIds: ['cat-1'],
        name: 'Vaccine',
        scheduledDate: '2024-12-01',
        careType: 'HEALTH_CHECK' as const,
      };
      const mockSchedule = { id: '1', ...createDto };

      mockCareService.addSchedule.mockResolvedValue(mockSchedule);

      const result = await controller.addSchedule(createDto, undefined);

      expect(result).toEqual(mockSchedule);
      expect(service.addSchedule).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('findSchedules', () => {
    it('should return paginated schedules', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Vaccine' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCareService.findSchedules.mockResolvedValue(mockResponse);

      const result = await controller.findSchedules({});

      expect(result).toEqual(mockResponse);
      expect(service.findSchedules).toHaveBeenCalledWith({});
    });
  });

  describe('complete', () => {
    it('should complete a care schedule', async () => {
      const completeDto = { notes: 'Completed successfully' };
      const mockSchedule = { success: true, data: { scheduleId: '1', recordId: 'record-1' } };

      mockCareService.complete.mockResolvedValue(mockSchedule);

      const result = await controller.complete('1', completeDto, undefined);

      expect(result).toEqual(mockSchedule);
      expect(service.complete).toHaveBeenCalledWith('1', completeDto, undefined);
    });
  });

  describe('addMedicalRecord', () => {
    it('should create a medical record', async () => {
      const createDto = {
        catId: 'cat-1',
        visitDate: '2024-01-15',
        diagnosis: 'Healthy',
      };
      const mockRecord = { id: '1', ...createDto };

      mockCareService.addMedicalRecord.mockResolvedValue(mockRecord);

      const result = await controller.addMedicalRecord(createDto, undefined);

      expect(result).toEqual(mockRecord);
      expect(service.addMedicalRecord).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('findMedicalRecords', () => {
    it('should return paginated medical records', async () => {
      const mockResponse = {
        data: [{ id: '1', diagnosis: 'Healthy' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCareService.findMedicalRecords.mockResolvedValue(mockResponse);

      const result = await controller.findMedicalRecords({});

      expect(result).toEqual(mockResponse);
      expect(service.findMedicalRecords).toHaveBeenCalledWith({});
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule', async () => {
      const mockResponse = { success: true, message: 'Schedule deleted' };

      mockCareService.deleteSchedule.mockResolvedValue(mockResponse);

      const result = await controller.deleteSchedule('1');

      expect(result).toEqual(mockResponse);
      expect(service.deleteSchedule).toHaveBeenCalledWith('1');
    });
  });
});
