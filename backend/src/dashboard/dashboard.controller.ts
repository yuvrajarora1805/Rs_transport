import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKpis(@Query('companyCode') companyCode?: string) {
    return this.dashboardService.getKpis(companyCode);
  }

  @Get('recent')
  getRecentActivity(@Query('companyCode') companyCode?: string) {
    return this.dashboardService.getRecentActivity(companyCode);
  }
}

