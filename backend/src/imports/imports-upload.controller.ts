import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('imports/upload')
@UseGuards(AuthGuard('jwt'))
export class ImportsUploadController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('truck-details')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTruckDetails(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Please provide an Excel file (.xlsx)');
    }

    const targetPath = path.join(process.cwd(), '..', 'TRUCK DETAILS (2).xlsx');
    fs.writeFileSync(targetPath, file.buffer);

    return this.importsService.importTruckDetails();
  }
}
