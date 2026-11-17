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

      // Scan rows 1..5 to find header
      let headerRowIdx = 1;
      let truckColIdx = -1;
      let dateColIdx = -1;
      let balesColIdx = -1;
      let destColIdx = -1;
      let contactColIdx = -1;

      for (let scanR = 1; scanR <= Math.min(5, ws.rowCount); scanR++) {
        const row = ws.getRow(scanR);
        for (let col = 1; col <= 20; col++) {
          const val = String(row.getCell(col).value || '').trim().toUpperCase();
          if ((val.includes('TRUCK') || val.includes('VEHICLE')) && !val.includes('TYPE')) {
            truckColIdx = col;
            headerRowIdx = scanR;
          }
          if (val === 'DATE' || val.includes('UN. DATE') || val.includes('DISPATCH DATE')) dateColIdx = col;
          if (val.includes('BALE') || val.includes('WEIGHT') || val.includes('QTY')) balesColIdx = col;
          if (val.includes('PLACE') || val.includes('DEST') || val.includes('PARTY')) destColIdx = col;
          if (val.includes('MOBILE') || val.includes('CONTACT') || val.includes('MALIK') || val.includes('OWNER')) contactColIdx = col;
        }
        if (truckColIdx > 0) break;
      }

      // Fallback defaults if no header text found
      if (truckColIdx === -1) {
        truckColIdx = 3;
        dateColIdx = 2;
        balesColIdx = 4;
        contactColIdx = 5;
        destColIdx = 6;
        headerRowIdx = 2;
      }

      for (let r = headerRowIdx + 1; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const truckCellVal = row.getCell(truckColIdx).value;
        if (!truckCellVal) continue;

        // Skip Date objects or timestamps that landed in truck column
        if (truckCellVal instanceof Date) continue;

        let truckNoRaw = String(truckCellVal).trim();
        if (truckNoRaw.includes('GMT+') || truckNoRaw.includes('Standard Time') || truckNoRaw.includes('T00:00:00')) {
          continue;
        }

        const truckNo = truckNoRaw.toUpperCase().replace(/\s+/g, '');
        if (truckNo === 'TOTAL' || truckNo === 'SRNO' || truckNo === 'TRUCKNO' || !/[0-9]/.test(truckNo)) continue;

        const dateVal = dateColIdx > 0 ? row.getCell(dateColIdx).value : null;
        const balesVal = balesColIdx > 0 ? row.getCell(balesColIdx).value : null;
        const contactVal = contactColIdx > 0 ? String(row.getCell(contactColIdx).value || '').trim() : '';
        const destVal = destColIdx > 0 ? String(row.getCell(destColIdx).value || '').trim() : '';

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
        let dateStr = '-';
        if (dateVal instanceof Date) {
          dateStr = dateVal.toISOString().split('T')[0];
        } else if (dateVal) {
          dateStr = String(dateVal).split('T')[0];
        }

        items.push({
          truckNo,
          mobileNo: contactVal,
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
