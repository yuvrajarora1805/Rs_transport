import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKpis(@Query('companyCode') companyCode?: string, @Req() req?: any) {
    return this.dashboardService.getKpis(companyCode, req?.user);
  }

  @Get('recent')
  getRecentActivity(@Query('companyCode') companyCode?: string, @Req() req?: any) {
    return this.dashboardService.getRecentActivity(companyCode, req?.user);
  }

  @Get('eod-summary')
  getEodSummary(@Query('date') date?: string) {
    return this.dashboardService.getEodSummary(date);
  }
}

