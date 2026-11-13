import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';

@Controller('trips')
@UseGuards(AuthGuard('jwt'))
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  async create(@Body() body: any) {
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        results.push(await this.tripsService.create(item));
      }
      return results;
    }
    return this.tripsService.create(body);
  }

  @Get()
  findAll(
    @Query('destinationId') destinationId?: string,
    @Query('partyId') partyId?: string,
    @Query('companyCode') companyCode?: string,
  ) {
    return this.tripsService.findAll(destinationId, partyId, companyCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }
}
