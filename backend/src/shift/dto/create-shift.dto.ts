import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum,
  IsInt,
  IsObject,
} from 'class-validator';
import { ShiftMode, ShiftStatus } from '@prisma/client';

export class CreateShiftDto {
  @IsUUID()
  staffId: string;

  @IsDateString()
  shiftDate: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  breakDuration?: number;

  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @IsOptional()
  @IsDateString()
  actualEndTime?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsEnum(ShiftMode)
  mode?: ShiftMode;
}
