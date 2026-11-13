import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdvancesService } from './advances.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';

@Controller('advances')
@UseGuards(AuthGuard('jwt'))
export class AdvancesController {
  constructor(private readonly advancesService: AdvancesService) {}

  @Post()
  create(@Body() dto: CreateAdvanceDto) {
    return this.advancesService.create(dto);
  }

  @Get()
  findAll(
    @Query('truckId') truckId?: string,
    @Query('tripId') tripId?: string,
  ) {
    return this.advancesService.findAll(truckId, tripId);
  }
}

