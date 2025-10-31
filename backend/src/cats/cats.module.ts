import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";

import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";

@Module({
  imports: [PrismaModule, AuthModule, EventEmitterModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
