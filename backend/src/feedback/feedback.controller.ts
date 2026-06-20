import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * フィードバックを送信する（管理者宛メール）
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'フィードバックを送信（管理者宛メール）' })
  async submit(
    @Body() dto: CreateFeedbackDto,
    @GetUser() user?: RequestUser,
  ): Promise<ApiResponse<{ sent: boolean }>> {
    const result = await this.feedbackService.submit(dto, user);
    return ApiResponse.success(result);
  }
}
