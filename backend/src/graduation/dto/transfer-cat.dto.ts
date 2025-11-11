import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class TransferCatDto {
  @ApiProperty({
    description: '譲渡日',
    example: '2025-11-11',
  })
  @IsDateString()
  transferDate: string;

  @ApiProperty({
    description: '譲渡先',
    example: '山田家',
  })
  @IsString()
  destination: string;

  @ApiProperty({
    description: '備考',
    example: '譲渡先は愛情深い家庭です',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
