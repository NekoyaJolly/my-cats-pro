import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

/**
 * CSRFトークン取得コントローラー
 */
@ApiTags('Security')
@Controller('csrf-token')
export class CsrfController {
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
  getCsrfToken(@Req() req: Request): { success: boolean; data: { csrfToken: string } } {
    // csurfミドルウェアがreq.csrfToken()関数を追加
    const csrfToken = (req as any).csrfToken?.() || '';
    
    return {
      success: true,
      data: {
        csrfToken,
      },
    };
  }
}
