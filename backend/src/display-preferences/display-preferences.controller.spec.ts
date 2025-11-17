import { UnauthorizedException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { DisplayNameMode } from "@prisma/client";

import type { RequestUser } from "../auth/auth.types";

import { DisplayPreferencesController } from "./display-preferences.controller";
import { DisplayPreferencesService } from "./display-preferences.service";
import type { DisplayPreferenceView } from "./display-preferences.types";
import { UpdateDisplayPreferenceDto } from "./dto/update-display-preference.dto";

describe("DisplayPreferencesController", () => {
  let controller: DisplayPreferencesController;
  let service: {
    getPreferences: jest.Mock;
    upsertPreferences: jest.Mock;
  };

  const basePreference: DisplayPreferenceView = {
    userId: "user-1",
    breedNameMode: DisplayNameMode.CANONICAL,
    coatColorNameMode: DisplayNameMode.CANONICAL,
    breedLabelOverrides: {},
    coatColorLabelOverrides: {},
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(async () => {
    service = {
      getPreferences: jest.fn().mockResolvedValue(basePreference),
      upsertPreferences: jest.fn().mockResolvedValue(basePreference),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisplayPreferencesController],
      providers: [
        {
          provide: DisplayPreferencesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(DisplayPreferencesController);
  });

  describe("getMine", () => {
    it("returns current user's preferences", async () => {
      const user: RequestUser = {
        userId: "user-1",
        role: "USER",
        email: "user@example.com",
      } as RequestUser;

      const result = await controller.getMine(user);

      expect(result).toBe(basePreference);
      expect(service.getPreferences).toHaveBeenCalledWith("user-1");
    });

    it("throws when user is missing", async () => {
      await expect(controller.getMine(undefined)).rejects.toThrow(UnauthorizedException);
      expect(service.getPreferences).not.toHaveBeenCalled();
    });
  });

  describe("updateMine", () => {
    it("updates preferences for the authenticated user", async () => {
      const user: RequestUser = {
        userId: "user-2",
        role: "USER",
        email: "user2@example.com",
      } as RequestUser;
      const dto: UpdateDisplayPreferenceDto = {
        breedNameMode: DisplayNameMode.CUSTOM,
      };

      await controller.updateMine(user, dto);

      expect(service.upsertPreferences).toHaveBeenCalledWith("user-2", dto);
    });

    it("rejects updates when user is missing", async () => {
      await expect(controller.updateMine(undefined, {} as UpdateDisplayPreferenceDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.upsertPreferences).not.toHaveBeenCalled();
    });
  });
});
