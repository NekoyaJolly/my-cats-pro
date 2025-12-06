import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

import { MediaTypeDto } from './create-gallery-entry.dto';

/**
 * メディア追加 DTO
 */
export class AddMediaDto {
  @ApiProperty({ enum: MediaTypeDto, description: 'メディアタイプ' })
  @IsEnum(MediaTypeDto)
  type: MediaTypeDto;

  @ApiProperty({ description: 'メディアURL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'サムネイルURL（YouTube用）' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
