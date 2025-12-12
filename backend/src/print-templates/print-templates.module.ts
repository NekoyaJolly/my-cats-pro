import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { PrintTemplatesController } from './print-templates.controller';
import { PrintTemplatesService } from './print-templates.service';

@Module({
  imports: [PrismaModule],
  controllers: [PrintTemplatesController],
  providers: [PrintTemplatesService],
  exports: [PrintTemplatesService],
})
export class PrintTemplatesModule {}
