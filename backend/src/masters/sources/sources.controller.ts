import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';

@Controller('masters/sources')
@UseGuards(AuthGuard('jwt'))
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  create(@Body() dto: CreateSourceDto) {
    return this.sourcesService.create(dto);
  }

  @Get()
  findAll(@Query('companyCode') companyCode?: string) {
    return this.sourcesService.findAll(companyCode);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('companyCode') companyCode?: string,
  ) {
    return this.sourcesService.findOne(id, companyCode);
  }
}

