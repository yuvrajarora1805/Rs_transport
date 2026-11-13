import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { TrucksModule } from './masters/trucks/trucks.module';
import { SourcesModule } from './masters/sources/sources.module';
import { DestinationsModule } from './masters/destinations/destinations.module';
import { PartiesModule } from './masters/parties/parties.module';
import { TransportersModule } from './masters/transporters/transporters.module';
import { PumpsModule } from './masters/pumps/pumps.module';
import { DispatchesModule } from './dispatches/dispatches.module';
import { TripsModule } from './trips/trips.module';
import { FuelModule } from './fuel/fuel.module';
import { SettlementsModule } from './settlements/settlements.module';
import { PaymentsModule } from './payments/payments.module';
import { AdvancesModule } from './advances/advances.module';
import { OutstandingModule } from './outstanding/outstanding.module';
import { ImportsModule } from './imports/imports.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
    TrucksModule,
    SourcesModule,
    DestinationsModule,
    PartiesModule,
    TransportersModule,
    PumpsModule,
    DispatchesModule,
    TripsModule,
    FuelModule,
    SettlementsModule,
    PaymentsModule,
    AdvancesModule,
    OutstandingModule,
    ImportsModule,
    DashboardModule,
  ],
})
export class AppModule {}
