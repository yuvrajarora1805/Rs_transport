import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';

@Controller('masters/sources')
@UseGuards(AuthGuard('jwt'))
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  create(@Body() dto: CreateSourceDto, @Req() req: any) {
    return this.sourcesService.create(dto, req.user);
  }

  @Get()
  findAll(@Query('companyCode') companyCode?: string, @Req() req?: any) {
    return this.sourcesService.findAll(companyCode, req?.user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('companyCode') companyCode?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.sourcesService.findOne(id, companyCode, fromDate, toDate);
  }
}

