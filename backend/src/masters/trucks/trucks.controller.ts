import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrucksService } from './trucks.service';
import { CreateTruckDto } from './dto/create-truck.dto';

@Controller('masters/trucks')
@UseGuards(AuthGuard('jwt'))
export class TrucksController {
  constructor(private readonly trucksService: TrucksService) {}

  @Post()
  create(@Body() createTruckDto: CreateTruckDto) {
    return this.trucksService.create(createTruckDto);
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

