import { Module } from "@nestjs/common";

import { DisplayPreferencesModule } from "../display-preferences/display-preferences.module";
import { PrismaModule } from "../prisma/prisma.module";

import { BreedsController } from "./breeds.controller";
import { BreedsService } from "./breeds.service";

@Module({
  imports: [PrismaModule, DisplayPreferencesModule],
  controllers: [BreedsController],
  providers: [BreedsService],
  exports: [BreedsService],
})
export class BreedsModule {}
