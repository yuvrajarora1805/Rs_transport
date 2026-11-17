import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrucksService } from './trucks.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { TrucksReconciliationService } from './trucks-reconciliation.service';
import { TrucksPartyLookupService } from './trucks-party-lookup.service';

@Controller('masters/trucks')
@UseGuards(AuthGuard('jwt'))
export class TrucksController {
  constructor(
    private readonly trucksService: TrucksService,
    private readonly reconService: TrucksReconciliationService,
    private readonly partyLookupService: TrucksPartyLookupService,
  ) {}

  @Post()
  create(@Body() createTruckDto: CreateTruckDto) {
    return this.trucksService.create(createTruckDto);
  }

  @Get('reconcile/summary')
  getDefaultSummary() {
    return this.reconService.reconcileDefaultFile();
  }

  @Get('reconcile/party-summary')
  getTruckPartySummary(@Query('truckNo') truckNo?: string) {
    return this.partyLookupService.getTruckPartySummary(truckNo);
  }

  @Post('reconcile/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAndReconcile(@UploadedFile() file: any, @Body() body: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Please provide an Excel file (.xlsx)');
    }
    const origName = file.originalname || 'Uploaded Workbook';
    const mapping = {
      truckCol: body.truckCol ? parseInt(body.truckCol, 10) : undefined,
      dateCol: body.dateCol ? parseInt(body.dateCol, 10) : undefined,
      balesCol: body.balesCol ? parseInt(body.balesCol, 10) : undefined,
      destCol: body.destCol ? parseInt(body.destCol, 10) : undefined,
      contactCol: body.contactCol ? parseInt(body.contactCol, 10) : undefined,
    };
    return this.reconService.reconcileExcelBuffer(file.buffer, origName, mapping);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.trucksService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trucksService.findOne(id);
  }

  @Get(':id/recent-tare')
  getRecentTare(@Param('id') id: string) {
    return this.trucksService.getRecentTare(id);
  }
}
