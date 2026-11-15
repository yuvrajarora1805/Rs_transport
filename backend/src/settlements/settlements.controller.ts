import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Controller('settlements')
@UseGuards(AuthGuard('jwt'))
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  create(@Body() dto: CreateSettlementDto) {
    return this.settlementsService.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('companyCode') companyCode?: string,
  ) {
    return this.settlementsService.findAll(status, companyCode);
  }

  @Get('deficits')
  getDeficits(
    @Query('truckId') truckId?: string,
    @Query('truckNo') truckNo?: string,
  ) {
    return this.settlementsService.getDeficits(truckId, truckNo);
  }

  @Get('truck-deficits/:truckId')
  getTruckDeficits(@Param('truckId') truckId: string) {
    return this.settlementsService.getDeficits(truckId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settlementsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settlementsService.remove(id);
  }
}
