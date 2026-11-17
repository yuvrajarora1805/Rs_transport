import { Module } from '@nestjs/common';
import { TrucksService } from './trucks.service';
import { TrucksController } from './trucks.controller';
import { TrucksReconciliationService } from './trucks-reconciliation.service';
import { TrucksReconciliationController } from './trucks-reconciliation.controller';

@Module({
  controllers: [TrucksController, TrucksReconciliationController],
  providers: [TrucksService, TrucksReconciliationService],
  exports: [TrucksService, TrucksReconciliationService],
})
export class TrucksModule {}
