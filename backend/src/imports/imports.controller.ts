import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ImportsService } from './imports.service';
import { ImportsPumpsService } from './imports-pumps.service';
import { ImportsSettlementsService } from './imports-settlements.service';

@Controller('imports')
@UseGuards(AuthGuard('jwt'))
export class ImportsController {
  constructor(
    private readonly importsService: ImportsService,
    private readonly pumpsImport: ImportsPumpsService,
    private readonly settlementsImport: ImportsSettlementsService,
  ) {}

  @Post('truck-details')
  importTruckDetails() {
    return this.importsService.importTruckDetails();
  }

  @Post('pump-details')
  importPumpDetails() {
    return this.pumpsImport.importPumpDetails();
  }

  @Post('rs-transport')
  importRsTransport() {
    return this.settlementsImport.importSettlementsFile('RS TRANSPORT COMPANY (1).xlsx', 'RS_TRANSPORT');
  }

  @Post('ranbir-logistics')
  importRanbirLogistics() {
    return this.settlementsImport.importSettlementsFile('RANBIR LOGISTICS.xlsx', 'RANBIR_LOGISTICS');
  }

  @Get('status')
  getStatus() {
    return this.importsService.getImportStatus();
  }
}
