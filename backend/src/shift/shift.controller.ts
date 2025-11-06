import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { CreateShiftTemplateDto } from './dto/create-shift-template.dto';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  // ==========================================
  // Shift Endpoints
  // ==========================================

  @Post()
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftService.create(createShiftDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('staffId') staffId?: string,
  ) {
    return this.shiftService.findAll(startDate, endDate, staffId);
  }

  @Get('calendar')
  getCalendarData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.shiftService.getCalendarData(startDate, endDate);
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.shiftService.getStatistics(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftService.update(id, updateShiftDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftService.remove(id);
  }

  // ==========================================
  // Template Endpoints
  // ==========================================

  @Post('templates')
  createTemplate(@Body() createTemplateDto: CreateShiftTemplateDto) {
    return this.shiftService.createTemplate(createTemplateDto);
  }

  @Get('templates')
  findAllTemplates() {
    return this.shiftService.findAllTemplates();
  }

  @Get('templates/:id')
  findOneTemplate(@Param('id') id: string) {
    return this.shiftService.findOneTemplate(id);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: CreateShiftTemplateDto,
  ) {
    return this.shiftService.updateTemplate(id, updateTemplateDto);
  }

  @Delete('templates/:id')
  removeTemplate(@Param('id') id: string) {
    return this.shiftService.removeTemplate(id);
  }
}
