import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TagAutomationEventType, TagAutomationTriggerType } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateTagAutomationRuleDto {
  @ApiPropertyOptional({ description: "ルールの一意なキー（自動生成可能）" })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({ description: "ルール名" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: "ルールの説明" })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    enum: TagAutomationTriggerType,
    description: "トリガータイプ",
    example: "EVENT",
  })
  @IsEnum(TagAutomationTriggerType)
  triggerType!: TagAutomationTriggerType;

  @ApiProperty({
    enum: TagAutomationEventType,
    description: "イベントタイプ",
    example: "BREEDING_PLANNED",
  })
  @IsEnum(TagAutomationEventType)
  eventType!: TagAutomationEventType;

  @ApiPropertyOptional({ description: "適用範囲（スコープ）", example: "breeding" })
  @IsOptional()
  @IsString()
  scope?: string | null;

  @ApiPropertyOptional({ description: "ルールが有効かどうか", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "優先度（-100から100、大きいほど優先）",
    minimum: -100,
    maximum: 100,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({
    description: "ルール設定（JSON）",
    example: { tagIds: ["tag-id-1", "tag-id-2"] },
  })
  @IsOptional()
  config?: Record<string, unknown> | null;
}
