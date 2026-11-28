import { Controller, Get, Post, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DispatchesService } from './dispatches.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';

@Controller('dispatches')
@UseGuards(AuthGuard('jwt'))
export class DispatchesController {
  constructor(private readonly dispatchesService: DispatchesService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    if (Array.isArray(body)) {
      return this.dispatchesService.createMultiple(body, req.user);
    }
    return this.dispatchesService.create(body, req.user);
  }

  @Get()
  findAll(
    @Query('sourceId') sourceId?: string,
    @Query('truckId') truckId?: string,
    @Query('companyCode') companyCode?: string,
    @Req() req?: any,
  ) {
    return this.dispatchesService.findAll(sourceId, truckId, companyCode, req?.user);
  }

  @Get('products')
  getCustomProducts() {
    return this.dispatchesService.getCustomProducts();
  }

  @Post('products')
  addCustomProduct(@Body('name') name: string) {
    return this.dispatchesService.addCustomProduct(name);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.dispatchesService.remove(id);
  }
}

