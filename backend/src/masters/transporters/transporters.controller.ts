import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransportersService } from './transporters.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';

@Controller('masters/transporters')
@UseGuards(AuthGuard('jwt'))
export class TransportersController {
  constructor(private readonly transportersService: TransportersService) {}

  @Post()
  create(@Body() dto: CreateTransporterDto) {
    return this.transportersService.create(dto);
  }

  @Get()
  findAll() {
    return this.transportersService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transportersService.remove(id);
  }
}

