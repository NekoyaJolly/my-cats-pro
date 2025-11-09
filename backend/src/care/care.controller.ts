import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Post,
  Query, UseGuards 
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CareService } from "./care.service";
import {
  CareCompleteResponseDto,
  CareQueryDto,
  CareScheduleListResponseDto,
  CareScheduleResponseDto,
  CompleteCareDto,
  CreateCareScheduleDto,
  CreateMedicalRecordDto,
  MedicalRecordListResponseDto,
  MedicalRecordQueryDto,
  MedicalRecordResponseDto,
} from "./dto";

@ApiTags("Care")
@Controller("care")
export class CareController {
  constructor(private readonly careService: CareService) {}

  @Get("schedules")
  @ApiOperation({ summary: "ケアスケジュール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK, type: CareScheduleListResponseDto })
  findSchedules(@Query() query: CareQueryDto) {
    return this.careService.findSchedules(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("schedules")
  @ApiOperation({ summary: "ケアスケジュールの追加" })
  @ApiResponse({ status: HttpStatus.CREATED, type: CareScheduleResponseDto })
  addSchedule(
    @Body() dto: CreateCareScheduleDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.addSchedule(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("schedules/:id/complete")
  @Put("schedules/:id/complete")
  @ApiOperation({ summary: "ケア完了処理（PATCH/PUT対応）" })
  @ApiResponse({ status: HttpStatus.OK, type: CareCompleteResponseDto })
  @ApiParam({ name: "id" })
  complete(
    @Param("id") id: string,
    @Body() dto: CompleteCareDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.complete(id, dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("schedules/:id")
  @ApiOperation({ summary: "ケアスケジュールの更新" })
  @ApiResponse({ status: HttpStatus.OK, type: CareScheduleResponseDto })
  @ApiParam({ name: "id", description: "スケジュールID" })
  updateSchedule(
    @Param("id") id: string,
    @Body() dto: CreateCareScheduleDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.updateSchedule(id, dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("schedules/:id")
  @ApiOperation({ summary: "ケアスケジュールの削除" })
  @ApiResponse({ status: HttpStatus.OK, description: "削除成功" })
  @ApiParam({ name: "id", description: "スケジュールID" })
  deleteSchedule(@Param("id") id: string) {
    return this.careService.deleteSchedule(id);
  }

  @Get("medical-records")
  @ApiOperation({ summary: "医療記録一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK, type: MedicalRecordListResponseDto })
  findMedicalRecords(@Query() query: MedicalRecordQueryDto) {
    return this.careService.findMedicalRecords(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("medical-records")
  @ApiOperation({ summary: "医療記録の追加" })
  @ApiResponse({ status: HttpStatus.CREATED, type: MedicalRecordResponseDto })
  addMedicalRecord(
    @Body() dto: CreateMedicalRecordDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.addMedicalRecord(dto, user?.userId);
  }
}
