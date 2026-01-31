import { ApiProperty } from '@nestjs/swagger';

/**
 * インポート結果DTO
 * 
 * ファイルのインポート完了後に返却される結果情報
 */
export class ImportResultDto {
  @ApiProperty({ description: 'インポート成功件数' })
  successCount: number;

  @ApiProperty({ description: 'インポート失敗件数' })
  errorCount: number;

  @ApiProperty({ description: '処理総件数' })
  totalCount: number;

  @ApiProperty({ 
    description: 'エラー詳細（最初の10件）', 
    type: [String], 
    required: false 
  })
  errors?: string[];
}

/**
 * プレビュー用DTO
 * 
 * ファイルアップロード時にデータをプレビューするための情報
 */
export class ImportPreviewDto {
  @ApiProperty({ description: 'プレビューデータ件数' })
  previewCount: number;

  @ApiProperty({ 
    description: 'サンプルデータ（最初の5件）',
    type: 'array'
  })
  sampleData: Record<string, unknown>[];

  @ApiProperty({ description: '検出されたカラム' })
  columns: string[];

  @ApiProperty({ description: 'データ総件数' })
  totalCount: number;
}
