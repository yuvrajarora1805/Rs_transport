import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrucksReconciliationService } from './trucks-reconciliation.service';
import { TrucksPartyLookupService } from './trucks-party-lookup.service';

@Controller('masters/trucks/reconcile')
@UseGuards(AuthGuard('jwt'))
export class TrucksReconciliationController {
  constructor(
    private readonly reconService: TrucksReconciliationService,
    private readonly partyLookupService: TrucksPartyLookupService,
  ) {}

  @Get('summary')
  getDefaultSummary() {
    return this.reconService.reconcileDefaultFile();
  }

  @Get('party-summary')
  getTruckPartySummary(@Query('truckNo') truckNo?: string) {
    return this.partyLookupService.getTruckPartySummary(truckNo);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAndReconcile(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Please provide an Excel file (.xlsx)');
    }
    return this.reconService.reconcileExcelBuffer(file.buffer);
  }
}
