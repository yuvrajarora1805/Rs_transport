import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FuelService } from './fuel.service';
import { CreateFuelDto } from './dto/create-fuel.dto';

@Controller('fuel')
@UseGuards(AuthGuard('jwt'))
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  create(@Body() dto: CreateFuelDto) {
    return this.fuelService.create(dto);
  }

  @Get()
  findAll(
    @Query('truckId') truckId?: string,
    @Query('pumpId') pumpId?: string,
  ) {
    return this.fuelService.findAll(truckId, pumpId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fuelService.remove(id);
  }
}

