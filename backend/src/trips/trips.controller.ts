import { Controller, Get, Post, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';

@Controller('trips')
@UseGuards(AuthGuard('jwt'))
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        results.push(await this.tripsService.create(item, req.user));
      }
      return results;
    }
    return this.tripsService.create(body, req.user);
  }

  @Get()
  findAll(
    @Query('destinationId') destinationId?: string,
    @Query('partyId') partyId?: string,
    @Query('companyCode') companyCode?: string,
    @Req() req?: any,
  ) {
    return this.tripsService.findAll(destinationId, partyId, companyCode, req?.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }
}
