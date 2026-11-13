import { Module } from '@nestjs/common';
import { OutstandingService } from './outstanding.service';
import { OutstandingController } from './outstanding.controller';

@Module({
  controllers: [OutstandingController],
  providers: [OutstandingService],
  exports: [OutstandingService],
})
export class OutstandingModule {}

