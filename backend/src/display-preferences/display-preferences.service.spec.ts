import { BadRequestException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { DisplayNameMode, Prisma, type DisplayPreference } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { DisplayPreferencesService } from "./display-preferences.service";
import type { DisplayPreferenceView } from "./display-preferences.types";

describe("DisplayPreferencesService", () => {
  let service: DisplayPreferencesService;
  let prisma: {
    displayPreference: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
    breed: {
      findMany: jest.Mock;
    };
    coatColor: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      displayPreference: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      breed: {
        findMany: jest.fn().mockResolvedValue([
          { code: 26, name: "Maine Coon" },
          { code: 1, name: "Abyssinian" },
        ]),
      },
      coatColor: {
        findMany: jest.fn().mockResolvedValue([
          { code: 1, name: "White" },
          { code: 2, name: "Blue" },
        ]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisplayPreferencesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(DisplayPreferencesService);
  });

  describe("getPreferences", () => {
    it("should build default view when record is absent", async () => {
      prisma.displayPreference.findUnique.mockResolvedValue(null);

      const result = await service.getPreferences("user-1");

      expect(result).toMatchObject({
        userId: "user-1",
        breedNameMode: DisplayNameMode.CANONICAL,
        coatColorNameMode: DisplayNameMode.CANONICAL,
        breedLabelOverrides: {},
        coatColorLabelOverrides: {},
      });
      expect(result.updatedAt.getTime()).toBe(0);
      expect(prisma.displayPreference.findUnique).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
    });

    it("should map persisted entity to view format", async () => {
      const timestamp = new Date("2024-02-01T00:00:00.000Z");
      const breedOverrides: Prisma.JsonObject = { "26": "和名メインクーン" };
      const entity: DisplayPreference = {
        id: "pref-1",
        userId: "user-1",
        breedNameMode: DisplayNameMode.CUSTOM,
        coatColorNameMode: DisplayNameMode.CODE_AND_NAME,
        breedNameOverrides: breedOverrides,
  coatColorNameOverrides: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      prisma.displayPreference.findUnique.mockResolvedValue(entity);

      const result = await service.getPreferences("user-1");

      expect(result).toEqual({
        userId: "user-1",
        breedNameMode: DisplayNameMode.CUSTOM,
        coatColorNameMode: DisplayNameMode.CODE_AND_NAME,
        breedLabelOverrides: { 26: "和名メインクーン" },
        coatColorLabelOverrides: {},
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });
  });

  describe("buildPersonalized*Records", () => {
    const baseView: DisplayPreferenceView = {
      userId: "user-1",
      breedNameMode: DisplayNameMode.CANONICAL,
      coatColorNameMode: DisplayNameMode.CANONICAL,
      breedLabelOverrides: {},
      coatColorLabelOverrides: {},
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    };

    it("should reflect custom breed overrides when mode is CUSTOM", async () => {
      const preference: DisplayPreferenceView = {
        ...baseView,
        breedNameMode: DisplayNameMode.CUSTOM,
        breedLabelOverrides: {
          26: "メインクーン様",
        },
      };

      const records = await service.buildPersonalizedBreedRecords(preference);
      const target = records.find((record) => record.code === 26);

      expect(target).toEqual({
        code: 26,
        canonicalName: "Maine Coon",
        displayName: "メインクーン様",
        displayNameMode: DisplayNameMode.CUSTOM,
        isOverridden: true,
      });
    });

    it("should compose coat color labels when mode is CODE_AND_NAME", async () => {
      const preference: DisplayPreferenceView = {
        ...baseView,
        coatColorNameMode: DisplayNameMode.CODE_AND_NAME,
      };

      const records = await service.buildPersonalizedCoatColorRecords(preference);
      const target = records.find((record) => record.code === 1);

      expect(target).toEqual({
        code: 1,
        canonicalName: "White",
        displayName: "1 - White",
        displayNameMode: DisplayNameMode.CODE_AND_NAME,
        isOverridden: false,
      });
    });
  });

  describe("upsertPreferences", () => {
    it("should upsert preferences with trimmed overrides", async () => {
      const timestamp = new Date("2024-03-01T00:00:00.000Z");
      const persisted: DisplayPreference = {
        id: "pref-1",
        userId: "user-1",
        breedNameMode: DisplayNameMode.CUSTOM,
        coatColorNameMode: DisplayNameMode.CANONICAL,
        breedNameOverrides: { "26": "王様" },
  coatColorNameOverrides: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      prisma.displayPreference.upsert.mockResolvedValue(persisted);

      const result = await service.upsertPreferences("user-1", {
        breedNameMode: DisplayNameMode.CUSTOM,
        breedLabelOverrides: [{ code: 26, label: " 王様 " }],
      });

      expect(prisma.breed.findMany).toHaveBeenCalled();
      expect(prisma.displayPreference.upsert).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          breedNameMode: DisplayNameMode.CUSTOM,
          breedNameOverrides: { "26": "王様" },
        }),
        update: expect.objectContaining({
          breedNameMode: DisplayNameMode.CUSTOM,
          breedNameOverrides: { "26": "王様" },
        }),
      });

      expect(result.breedLabelOverrides).toEqual({ 26: "王様" });
      expect(result.breedNameMode).toBe(DisplayNameMode.CUSTOM);
    });

    it("should throw when overrides reference unknown codes", async () => {
      prisma.breed.findMany.mockResolvedValue([{ code: 1, name: "Abyssinian" }]);

      await expect(
        service.upsertPreferences("user-1", {
          breedLabelOverrides: [{ code: 9999, label: "??" }],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.breed.findMany).toHaveBeenCalled();
      expect(prisma.displayPreference.upsert).not.toHaveBeenCalled();
    });
  });
});
