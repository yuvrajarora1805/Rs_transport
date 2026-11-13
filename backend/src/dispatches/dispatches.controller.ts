import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DispatchesService } from './dispatches.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';

@Controller('dispatches')
@UseGuards(AuthGuard('jwt'))
export class DispatchesController {
  constructor(private readonly dispatchesService: DispatchesService) {}

  @Post()
  create(@Body() body: any) {
    if (Array.isArray(body)) {
      return this.dispatchesService.createMultiple(body);
    }
    return this.dispatchesService.create(body);
  }

  @Get()
  findAll(
    @Query('sourceId') sourceId?: string,
    @Query('truckId') truckId?: string,
    @Query('companyCode') companyCode?: string,
  ) {
    return this.dispatchesService.findAll(sourceId, truckId, companyCode);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispatchesService.remove(id);
  }
}

