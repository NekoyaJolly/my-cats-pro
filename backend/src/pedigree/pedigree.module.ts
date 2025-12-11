import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { PedigreePdfService } from "./pdf/pedigree-pdf.service";
import { PedigreeController } from "./pedigree.controller";
import { PedigreeService } from "./pedigree.service";

@Module({
  imports: [PrismaModule],
  controllers: [PedigreeController],
  providers: [PedigreeService, PedigreePdfService],
  exports: [PedigreeService],
})
export class PedigreeModule {}
