import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

describe('ShiftController', () => {
  let controller: ShiftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [ShiftController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: ShiftService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getCalendarShifts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShiftController>(ShiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
