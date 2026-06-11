import { ApiProperty } from "@nestjs/swagger";
import { ScheduleStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

/**
 * ケアスケジュールのステータス変更DTO
 *
 * 一覧画面の有効/無効スイッチ等から、ステータスのみを変更するために使用する。
 */
export class UpdateCareStatusDto {
  @ApiProperty({ enum: ScheduleStatus, example: ScheduleStatus.PENDING })
  @IsEnum(ScheduleStatus)
  status!: ScheduleStatus;
}
