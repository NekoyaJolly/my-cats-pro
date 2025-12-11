import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { PedigreeController } from "./pedigree.controller";
import { PedigreeService } from "./pedigree.service";
import { PedigreePdfService } from "./pdf/pedigree-pdf.service";

@Module({
  imports: [PrismaModule],
  controllers: [PedigreeController],
  providers: [PedigreeService, PedigreePdfService],
  exports: [PedigreeService],
})
export class PedigreeModule {}
