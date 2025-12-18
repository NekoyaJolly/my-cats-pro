import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { PedigreePdfService } from './pdf/pedigree-pdf.service';
import { PrintSettingsService } from './pdf/print-settings.service';
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

  const mockPedigreePdfService = {
    generatePdf: jest.fn(),
  };

  const mockPrintSettingsService = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    resetToDefault: jest.fn(),
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
        {
          provide: PedigreePdfService,
          useValue: mockPedigreePdfService,
        },
        {
          provide: PrintSettingsService,
          useValue: mockPrintSettingsService,
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

  describe('getPrintSettings', () => {
    it('should return print settings', async () => {
      const mockSettings = {
        offsetX: 0,
        offsetY: 0,
        breed: { x: 50, y: 50 },
        sex: { x: 50, y: 60 },
        dateOfBirth: { x: 77, y: 60 },
        catName: { x: 170, y: 55 },
        fontSizes: { catName: 13 },
      };

      mockPrintSettingsService.getSettings.mockResolvedValue(mockSettings);

      const result = await controller.getPrintSettings();

      expect(result).toEqual(mockSettings);
      expect(mockPrintSettingsService.getSettings).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockPrintSettingsService.getSettings.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getPrintSettings()).rejects.toThrow();
    });
  });

  describe('updatePrintSettings', () => {
    const validSettings = {
      offsetX: 10,
      offsetY: 20,
      breed: { x: 55, y: 55 },
      sex: { x: 55, y: 65 },
      dateOfBirth: { x: 80, y: 65 },
      eyeColor: { x: 55, y: 74 },
      color: { x: 80, y: 74 },
      catName: { x: 175, y: 60, align: 'center' as const },
      wcaNo: { x: 175, y: 74, align: 'center' as const },
      owner: { x: 325, y: 55, align: 'right' as const },
      breeder: { x: 325, y: 65, align: 'right' as const },
      dateOfRegistration: { x: 245, y: 74 },
      littersM: { x: 280, y: 74 },
      littersF: { x: 290, y: 74 },
      sire: {
        name: { x: 55, y: 115 },
        color: { x: 55, y: 132 },
        eyeColor: { x: 55, y: 137 },
        jcu: { x: 55, y: 142 },
      },
      dam: {
        name: { x: 55, y: 165 },
        color: { x: 55, y: 182 },
        eyeColor: { x: 55, y: 187 },
        jcu: { x: 55, y: 193 },
      },
      grandParents: {
        ff: { name: { x: 145, y: 106 }, color: { x: 145, y: 111 }, jcu: { x: 145, y: 116 } },
        fm: { name: { x: 145, y: 132 }, color: { x: 145, y: 137 }, jcu: { x: 145, y: 142 } },
        mf: { name: { x: 145, y: 157 }, color: { x: 145, y: 162 }, jcu: { x: 145, y: 167 } },
        mm: { name: { x: 145, y: 183 }, color: { x: 145, y: 188 }, jcu: { x: 145, y: 193 } },
      },
      greatGrandParents: {
        fff: { name: { x: 237, y: 99 }, jcu: { x: 237, y: 103 } },
        ffm: { name: { x: 237, y: 112 }, jcu: { x: 237, y: 116 } },
        fmf: { name: { x: 237, y: 125 }, jcu: { x: 237, y: 129 } },
        fmm: { name: { x: 237, y: 138 }, jcu: { x: 237, y: 142 } },
        mff: { name: { x: 237, y: 151 }, jcu: { x: 237, y: 155 } },
        mfm: { name: { x: 237, y: 163 }, jcu: { x: 237, y: 167 } },
        mmf: { name: { x: 237, y: 176 }, jcu: { x: 237, y: 180 } },
        mmm: { name: { x: 237, y: 189 }, jcu: { x: 237, y: 193 } },
      },
      otherOrganizationsNo: { x: 90, y: 215 },
      fontSizes: {
        catName: 14,
        wcaNo: 13,
        headerInfo: 12,
        parentName: 13,
        parentDetail: 12,
        grandParentName: 12,
        grandParentDetail: 12,
        greatGrandParent: 11,
        footer: 8,
      },
    };

    it('should update print settings with valid data', async () => {
      mockPrintSettingsService.updateSettings.mockResolvedValue(validSettings);

      const result = await controller.updatePrintSettings(validSettings);

      expect(result).toEqual(validSettings);
      expect(mockPrintSettingsService.updateSettings).toHaveBeenCalledWith(validSettings);
    });

    it('should reject invalid settings (missing required fields)', async () => {
      const invalidSettings = {
        offsetX: 10,
        offsetY: 20,
        breed: { x: 55, y: 55 },
        // Missing required fields
      };

      await expect(controller.updatePrintSettings(invalidSettings as any)).rejects.toThrow(
        '無効な設定データです',
      );
      expect(mockPrintSettingsService.updateSettings).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockPrintSettingsService.updateSettings.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.updatePrintSettings(validSettings)).rejects.toThrow();
    });
  });

  describe('resetPrintSettings', () => {
    it('should reset print settings to default', async () => {
      const defaultSettings = {
        offsetX: 0,
        offsetY: 0,
        breed: { x: 50, y: 50 },
        fontSizes: { catName: 13 },
      };

      mockPrintSettingsService.resetToDefault.mockResolvedValue(defaultSettings);

      const result = await controller.resetPrintSettings();

      expect(result).toEqual(defaultSettings);
      expect(mockPrintSettingsService.resetToDefault).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockPrintSettingsService.resetToDefault.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.resetPrintSettings()).rejects.toThrow();
    });
  });
});
