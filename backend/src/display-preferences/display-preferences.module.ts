import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { DisplayPreferencesController } from "./display-preferences.controller";
import { DisplayPreferencesService } from "./display-preferences.service";

@Module({
  imports: [PrismaModule],
  controllers: [DisplayPreferencesController],
  providers: [DisplayPreferencesService],
  exports: [DisplayPreferencesService],
})
export class DisplayPreferencesModule {}
