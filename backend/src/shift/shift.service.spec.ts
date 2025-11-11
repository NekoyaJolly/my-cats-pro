import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { ShiftService } from './shift.service';

describe('ShiftService', () => {
  let service: ShiftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftService,
        {
          provide: PrismaService,
          useValue: {
            shift: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            staff: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ShiftService>(ShiftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
