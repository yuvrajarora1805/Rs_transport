import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PumpsService } from './pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';

@Controller('masters/pumps')
@UseGuards(AuthGuard('jwt'))
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Post()
  create(@Body() dto: CreatePumpDto) {
    return this.pumpsService.create(dto);
  }

  @Get()
  findAll() {
    return this.pumpsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pumpsService.findOne(id);
  }
}

