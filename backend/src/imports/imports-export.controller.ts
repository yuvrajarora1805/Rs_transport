import { Controller, Get, Param, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('imports/download')
export class ImportsExportController {
  private readonly fileMap: Record<string, string> = {
    'truck-details': 'TRUCK DETAILS (2).xlsx',
    'truck-details-v1': 'TRUCK DETAILS.xlsx',
    'pump-details': 'pump details.xlsx',
    'rs-transport': 'RS TRANSPORT COMPANY (1).xlsx',
    'ranbir-logistics': 'RANBIR LOGISTICS.xlsx',
  };

  @Get(':key')
  downloadFile(@Param('key') key: string, @Res() res: Response) {
    const filename = this.fileMap[key] || this.fileMap[key.toLowerCase()];
    if (!filename) {
      throw new NotFoundException(`Workbook '${key}' not registered for download`);
    }

    const filePath = path.join(process.cwd(), '..', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found on server`);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    const fileStream = fs.createReadStream(filePath);
    return fileStream.pipe(res);
  }
}
