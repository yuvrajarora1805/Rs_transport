import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';

@Controller('masters/parties')
@UseGuards(AuthGuard('jwt'))
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Post()
  create(@Body() dto: CreatePartyDto) {
    return this.partiesService.create(dto);
  }

  @Get()
  findAll(@Query('destinationId') destinationId?: string) {
    return this.partiesService.findAll(destinationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partiesService.findOne(id);
  }
}

