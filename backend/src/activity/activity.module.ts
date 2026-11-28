import { Global, Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { MailService } from './mail.service';

@Global()
@Module({
  controllers: [ActivityController],
  providers: [ActivityService, MailService],
  exports: [ActivityService, MailService],
})
export class ActivityModule {}

