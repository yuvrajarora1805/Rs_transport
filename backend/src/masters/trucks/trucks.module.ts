import { Module } from '@nestjs/common';
import { TrucksService } from './trucks.service';
import { TrucksController } from './trucks.controller';
import { TrucksReconciliationService } from './trucks-reconciliation.service';
import { TrucksPartyLookupService } from './trucks-party-lookup.service';
import { TrucksReconciliationController } from './trucks-reconciliation.controller';

@Module({
  controllers: [TrucksController, TrucksReconciliationController],
  providers: [TrucksService, TrucksReconciliationService, TrucksPartyLookupService],
  exports: [TrucksService, TrucksReconciliationService, TrucksPartyLookupService],
})
export class TrucksModule {}
