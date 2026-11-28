import { Controller, Get, Post, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ActivityService } from './activity.service';
import { MailService } from './mail.service';
import { WhatsappService } from './whatsapp.service';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly mailService: MailService,
    private readonly whatsappService: WhatsappService,
  ) {}

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

  @Get('alerts')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAlerts() {
    return this.activityService.getAlerts();
  }

  @Post('alerts/send-eod-email')
  @Roles('SUPER_ADMIN', 'ADMIN')
  sendEodEmail(@Body('to') to?: string) {
    return this.mailService.sendEodEmail(to);
  }

  @Get('alerts/emails')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getNotificationEmails() {
    return this.activityService.getNotificationEmails();
  }

  @Post('alerts/emails')
  @Roles('SUPER_ADMIN', 'ADMIN')
  addNotificationEmail(@Body('email') email: string) {
    return this.activityService.addNotificationEmail(email);
  }

  @Delete('alerts/emails/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  removeNotificationEmail(@Param('id') id: string) {
    return this.activityService.removeNotificationEmail(id);
  }

  @Get('alerts/whatsapp')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getWhatsappPhones() {
    return this.whatsappService.getPhones();
  }

  @Post('alerts/whatsapp')
  @Roles('SUPER_ADMIN', 'ADMIN')
  addWhatsappPhone(@Body('phone') phone: string) {
    return this.whatsappService.addPhone(phone);
  }

  @Delete('alerts/whatsapp/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  removeWhatsappPhone(@Param('id') id: string) {
    return this.whatsappService.removePhone(id);
  }
}

