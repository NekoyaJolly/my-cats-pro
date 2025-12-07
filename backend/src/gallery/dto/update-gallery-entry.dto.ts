import { PartialType } from '@nestjs/swagger';

import { CreateGalleryEntryDto } from './create-gallery-entry.dto';

/**
 * ギャラリーエントリ更新 DTO
 */
export class UpdateGalleryEntryDto extends PartialType(CreateGalleryEntryDto) {}
