import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * フィードバック送信 DTO
 */
export class CreateFeedbackDto {
  @ApiProperty({ description: 'フィードバック本文（最大200文字）', maxLength: 200 })
  @IsString()
  @IsNotEmpty({ message: 'フィードバック本文を入力してください' })
  @MaxLength(200, { message: 'フィードバックは200文字以内で入力してください' })
  message: string;
}
