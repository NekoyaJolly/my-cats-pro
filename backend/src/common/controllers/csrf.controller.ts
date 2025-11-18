import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { CsrfTokenService } from '../services/csrf-token.service';

/**
 * CSRFトークン取得コントローラー
 */
@ApiTags('Security')
@Controller('csrf-token')
export class CsrfController {
  constructor(private readonly csrfTokenService: CsrfTokenService) {}

  @Get()
  @ApiOperation({ summary: 'CSRFトークンを取得' })
  @ApiResponse({ 
    status: 200, 
    description: 'CSRFトークンを返却',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            csrfToken: { type: 'string', example: 'abc123...' }
          }
        }
      }
    }
  })
  getCsrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { success: boolean; data: { csrfToken: string } } {
    const csrfToken = this.csrfTokenService.issueToken(req);

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    return {
      success: true,
      data: {
        csrfToken,
      },
    };
  }
}
