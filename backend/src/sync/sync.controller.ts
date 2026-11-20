import { Controller, Get, Post } from '@nestjs/common';
import { SyncService, SyncStatus } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  async getStatus(): Promise<SyncStatus> {
    return this.syncService.getSyncStatus();
  }

  @Post('trigger')
  async triggerSync() {
    return this.syncService.triggerSync();
  }
}

