import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrucksReconciliationService } from './trucks-reconciliation.service';

@Controller('masters/trucks/reconcile')
@UseGuards(AuthGuard('jwt'))
export class TrucksReconciliationController {
  constructor(private readonly reconService: TrucksReconciliationService) {}

  @Get('summary')
  getDefaultSummary() {
    return this.reconService.reconcileDefaultFile();
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
