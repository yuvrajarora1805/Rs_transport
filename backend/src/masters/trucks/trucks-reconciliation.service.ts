import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

export interface TruckReconSummary {
  uploadedFileName?: string;
  totalRows: number;
  distinctTrucks: number;
  matchedInSystem: number;
  missingInSystem: number;
  totalBales: number;
  sourcesBreakdown: { source: string; entries: number; bales: number }[];
  destinationsBreakdown: { destination: string; count: number }[];
  trucks: {
    truckNo: string;
    mobileNo: string;
    source: string;
    destination: string;
    bales: number;
    date: string;
    isRegisteredInSystem: boolean;
    systemTruckId?: string;
    totalSystemDispatches: number;
    totalSystemTrips: number;
  }[];
}

@Injectable()
export class TrucksReconciliationService {
  private readonly logger = new Logger(TrucksReconciliationService.name);

  constructor(private db: DbService) {}

  /**
   * Parses uploaded Excel in memory without saving to disk.
   */
  async reconcileExcelBuffer(buffer: Buffer, fileName: string = 'Uploaded Excel'): Promise<TruckReconSummary> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);
    return this.processWorkbook(wb, fileName);
  }

  async reconcileDefaultFile(): Promise<TruckReconSummary> {
    const p2 = path.join(process.cwd(), '..', 'TRUCK DETAILS (2).xlsx');
    const p1 = path.join(process.cwd(), '..', 'TRUCK DETAILS.xlsx');
    const filePath = fs.existsSync(p2) ? p2 : p1;
    if (!fs.existsSync(filePath)) {
      return {
        uploadedFileName: 'No default workbook found',
        totalRows: 0,
        distinctTrucks: 0,
        matchedInSystem: 0,
        missingInSystem: 0,
        totalBales: 0,
        sourcesBreakdown: [],
        destinationsBreakdown: [],
        trucks: [],
      };
    }
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);
    return this.processWorkbook(wb, path.basename(filePath));
  }

  private async processWorkbook(wb: ExcelJS.Workbook, fileName: string): Promise<TruckReconSummary> {
    const systemTrucksRes = await this.db.query(`
      SELECT trk.id, trk.truck_no, trk.owner_name, trk.mobile_no,
             COUNT(DISTINCT d.id) as dispatch_count,
             COUNT(DISTINCT t.id) as trip_count
      FROM trucks trk
      LEFT JOIN dispatches d ON trk.id = d.truck_id
      LEFT JOIN trips t ON trk.id = t.truck_id
      GROUP BY trk.id, trk.truck_no, trk.owner_name, trk.mobile_no
    `);

    const systemMap = new Map<string, any>();
    for (const row of systemTrucksRes.rows as any[]) {
      const norm = String(row.truck_no || '').trim().toUpperCase().replace(/\s+/g, '');
      systemMap.set(norm, row);
    }

    const items: any[] = [];
    const sourceStats = new Map<string, { entries: number; bales: number }>();
    const destStats = new Map<string, number>();
    const seenTruckNos = new Set<string>();
    let totalBales = 0;

    for (const ws of wb.worksheets) {
      const sourceName = ws.name.trim().toUpperCase();
      if (!sourceName || ws.rowCount < 2) continue;

      let startRow = 3;
      let hasSrCol = true;
      const r1c1 = String(ws.getRow(1).getCell(1).value || '').trim().toUpperCase();
      const r2c1 = String(ws.getRow(2).getCell(1).value || '').trim().toUpperCase();

      if (r1c1 === 'DATE' || r1c1 === 'TRUCK NO.' || r1c1 === 'TRUCK NO') {
        startRow = 2;
        hasSrCol = false;
      } else if (r2c1 === 'DATE') {
        startRow = 3;
        hasSrCol = false;
      }

      for (let r = startRow; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        let dateVal: any = null;
        let truckNoRaw = '';
        let balesVal: any = null;
        let mobileVal = '';
        let destVal = '';

        if (hasSrCol) {
          dateVal = row.getCell(2).value;
          truckNoRaw = String(row.getCell(3).value || '').trim();
          balesVal = row.getCell(4).value;
          mobileVal = String(row.getCell(5).value || '').trim();
          destVal = String(row.getCell(6).value || '').trim();
        } else {
          dateVal = row.getCell(1).value;
          truckNoRaw = String(row.getCell(2).value || '').trim();
          balesVal = row.getCell(3).value;
          mobileVal = String(row.getCell(4).value || '').trim();
          destVal = String(row.getCell(5).value || '').trim();
        }

        if (!truckNoRaw) continue;
        const truckNo = truckNoRaw.toUpperCase().replace(/\s+/g, '');
        if (truckNo === 'TOTAL' || truckNo === 'SRNO' || !/[0-9]/.test(truckNo)) continue;

        const bales = typeof balesVal === 'number' ? balesVal : parseFloat(String(balesVal)) || 0;
        totalBales += bales;
        seenTruckNos.add(truckNo);

        const currentSource = sourceStats.get(sourceName) || { entries: 0, bales: 0 };
        currentSource.entries += 1;
        currentSource.bales += bales;
        sourceStats.set(sourceName, currentSource);

        const cleanDest = destVal ? destVal.toUpperCase() : 'UNSPECIFIED';
        destStats.set(cleanDest, (destStats.get(cleanDest) || 0) + 1);

        const systemMatch = systemMap.get(truckNo);
        const dateStr = dateVal instanceof Date ? dateVal.toISOString().split('T')[0] : String(dateVal || '');

        items.push({
          truckNo,
          mobileNo: mobileVal,
          source: sourceName,
          destination: destVal || '-',
          bales,
          date: dateStr,
          isRegisteredInSystem: !!systemMatch,
          systemTruckId: systemMatch?.id,
          totalSystemDispatches: Number(systemMatch?.dispatch_count || 0),
          totalSystemTrips: Number(systemMatch?.trip_count || 0),
        });
      }
    }

    let matchedCount = 0;
    for (const t of seenTruckNos) {
      if (systemMap.has(t)) matchedCount++;
    }

    return {
      uploadedFileName: fileName,
      totalRows: items.length,
      distinctTrucks: seenTruckNos.size,
      matchedInSystem: matchedCount,
      missingInSystem: seenTruckNos.size - matchedCount,
      totalBales,
      sourcesBreakdown: Array.from(sourceStats.entries()).map(([source, data]) => ({
        source,
        entries: data.entries,
        bales: data.bales,
      })),
      destinationsBreakdown: Array.from(destStats.entries())
        .map(([destination, count]) => ({ destination, count }))
        .sort((a, b) => b.count - a.count),
      trucks: items,
    };
  }
}
