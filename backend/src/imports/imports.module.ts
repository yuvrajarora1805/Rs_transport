import { Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ImportsPumpsService } from './imports-pumps.service';
import { ImportsSettlementsService } from './imports-settlements.service';
import { ImportsController } from './imports.controller';

@Module({
  controllers: [ImportsController],
  providers: [ImportsService, ImportsPumpsService, ImportsSettlementsService],
  exports: [ImportsService, ImportsPumpsService, ImportsSettlementsService],
})
export class ImportsModule {}
