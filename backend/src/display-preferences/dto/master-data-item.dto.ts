import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DisplayNameMode } from "@prisma/client";

export class MasterDataItemDto {
  @ApiProperty({ description: "マスターデータのコード", example: 26 })
  code!: number;

  @ApiProperty({ description: "CSV 定義のデフォルト名称", example: "Maine Coon" })
  name!: string;

  @ApiPropertyOptional({
    description: "画面に表示される名称。個別設定が無い場合は name と同一。",
    example: "26 - Maine Coon",
  })
  displayName?: string;

  @ApiPropertyOptional({
    enum: DisplayNameMode,
    description: "このレコードに適用された表示モード",
    example: DisplayNameMode.CODE_AND_NAME,
  })
  displayNameMode?: DisplayNameMode;

  @ApiPropertyOptional({ description: "ユーザー上書きが適用された場合に true", example: true })
  isOverridden?: boolean;
}
