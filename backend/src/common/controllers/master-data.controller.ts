import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { GENDER_MASTER } from "../../cats/constants/gender";

@ApiTags("Master Data")
@Controller("master")
export class MasterDataController {
  @Get("genders")
  @ApiOperation({ summary: "性別マスタデータを取得（認証不要）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "性別マスタデータを返却",
  })
  getGenders() {
    return {
      success: true,
      data: GENDER_MASTER.map(record => ({
        id: parseInt(record.key),
        code: parseInt(record.key),
        name: record.name,
        canonical: record.canonical,
      })),
    };
  }
}
