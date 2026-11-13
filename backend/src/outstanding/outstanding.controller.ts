import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OutstandingService } from './outstanding.service';

@Controller('outstanding')
@UseGuards(AuthGuard('jwt'))
export class OutstandingController {
  constructor(private readonly outstandingService: OutstandingService) {}

  @Get('summary')
  getSummary() {
    return this.outstandingService.getSummary();
  }

  @Get('ageing')
  getAgeingReport() {
    return this.outstandingService.getAgeingReport();
  }
}

