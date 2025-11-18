import { Module } from "@nestjs/common";

import { DisplayPreferencesModule } from "../display-preferences/display-preferences.module";
import { PrismaModule } from "../prisma/prisma.module";

import { CoatColorsController } from "./coat-colors.controller";
import { CoatColorsService } from "./coat-colors.service";

@Module({
  imports: [PrismaModule, DisplayPreferencesModule],
  controllers: [CoatColorsController],
  providers: [CoatColorsService],
  exports: [CoatColorsService],
})
export class CoatColorsModule {}
