import { Global, Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { MailService } from './mail.service';
import { WhatsappService } from './whatsapp.service';

@Global()
@Module({
  controllers: [ActivityController],
  providers: [ActivityService, MailService, WhatsappService],
  exports: [ActivityService, MailService, WhatsappService],
})
export class ActivityModule {}

