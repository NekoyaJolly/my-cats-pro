import { PartialType } from '@nestjs/swagger';

import { TransferCatDto } from './transfer-cat.dto';

/**
 * 卒業記録更新DTO
 *
 * 譲渡日・譲渡先・備考を部分更新するためのDTO。
 */
export class UpdateGraduationDto extends PartialType(TransferCatDto) {}
