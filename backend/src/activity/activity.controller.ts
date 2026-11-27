import { Controller, Get, Post, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ActivityService } from './activity.service';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('activity-logs')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getLogs(@Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 100;
    return this.activityService.getLogs(Number.isNaN(parsed) ? 100 : parsed);
  }

  @Get('approvals/pending')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getPendingApprovals() {
    return this.activityService.getPendingApprovals();
  }

  @Post('approvals/:module/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN')
  approveRecord(
    @Param('module') module: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.activityService.approveRecord(module, id, req.user);
  }

  @Post('approvals/:module/:id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN')
  rejectRecord(
    @Param('module') module: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.activityService.rejectRecord(module, id, req.user, reason);
  }
}

