import { Module } from '@nestjs/common';
import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GraduationController],
  providers: [GraduationService],
  exports: [GraduationService],
})
export class GraduationModule {}
