import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { ColumnMapping, detectColumnIndices } from './trucks-recon-parser';

export interface SheetPreview {
  sheetName: string;
  totalRows: number;
  headers: { colIndex: number; sampleValues: string[] }[];
}

export interface TruckReconSummary {
  uploadedFileName?: string;
  totalRows: number;
  distinctTrucks: number;
  matchedInSystem: number;
  missingInSystem: number;
  totalBales: number;
  sourcesBreakdown: { source: string; entries: number; bales: number }[];
  destinationsBreakdown: { destination: string; count: number }[];
  availableSheets?: SheetPreview[];
  trucks: {
    truckNo: string;
    mobileNo: string;
    source: string;
    destination: string;
    date: string;
    isRegisteredInSystem: boolean;
    systemTruckId?: string;
    totalSystemDispatches: number;
    totalSystemTrips: number;
    dbGrossFreight: number;
    dbDiesel: number;
    dbPaid: number;
    dbOutstanding: number;
  }[];
}

@Injectable()
export class TrucksReconciliationService {
  private readonly logger = new Logger(TrucksReconciliationService.name);

  constructor(private db: DbService) {}

  async reconcileExcelBuffer(
    buffer: Buffer,
    fileName: string = 'Uploaded Excel',
    manualMapping?: ColumnMapping,
  ): Promise<TruckReconSummary> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);
    return this.processWorkbook(wb, fileName, manualMapping);
  }

  async reconcileDefaultFile(): Promise<TruckReconSummary> {
    return {
      uploadedFileName: undefined,
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

  private async processWorkbook(
    wb: ExcelJS.Workbook,
    fileName: string,
    manualMapping?: ColumnMapping,
  ): Promise<TruckReconSummary> {
    const systemTrucksRes = await this.db.query(`
      SELECT trk.id, trk.truck_no, trk.owner_name, trk.mobile_no,
             COUNT(DISTINCT d.id) as dispatch_count,
             COUNT(DISTINCT t.id) as trip_count,
             COALESCE(SUM(s_settle.gross_freight), SUM(t.gross_freight), 0) as total_gross_freight,
             COALESCE(SUM(s_settle.diesel_amount), 0) as total_diesel,
             COALESCE(SUM(s_settle.total_paid), 0) as total_paid,
             COALESCE(SUM(s_settle.outstanding), 0) as total_outstanding
      FROM trucks trk
      LEFT JOIN dispatches d ON trk.id = d.truck_id
      LEFT JOIN trips t ON trk.id = t.truck_id
      LEFT JOIN settlements s_settle ON t.id = s_settle.trip_id
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
    const sheetPreviews: SheetPreview[] = [];
    let totalBales = 0;

    for (const ws of wb.worksheets) {
      const sourceName = ws.name.trim().toUpperCase();
      if (!sourceName || ws.rowCount < 2) continue;

      const { truckColIdx, dateColIdx, balesColIdx, destColIdx, contactColIdx, headerRowIdx } =
        detectColumnIndices(ws, manualMapping);

      const colSamples: { colIndex: number; sampleValues: string[] }[] = [];
      for (let c = 1; c <= Math.min(10, ws.columnCount || 8); c++) {
        const samples: string[] = [];
        for (let r = 1; r <= Math.min(5, ws.rowCount); r++) {
          const v = ws.getRow(r).getCell(c).value;
          if (v !== null && v !== undefined && v !== '') {
            samples.push(v instanceof Date ? v.toISOString().split('T')[0] : String(v).trim());
          }
        }
        colSamples.push({ colIndex: c, sampleValues: samples });
      }

      sheetPreviews.push({
        sheetName: sourceName,
        totalRows: ws.rowCount,
        headers: colSamples,
      });

      for (let r = headerRowIdx + 1; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const truckCellVal = truckColIdx > 0 ? row.getCell(truckColIdx).value : null;
        if (!truckCellVal || truckCellVal instanceof Date) continue;

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
          date: dateStr,
          isRegisteredInSystem: !!systemMatch,
          systemTruckId: systemMatch?.id,
          totalSystemDispatches: Number(systemMatch?.dispatch_count || 0),
          totalSystemTrips: Number(systemMatch?.trip_count || 0),
          dbGrossFreight: Number(systemMatch?.total_gross_freight || 0),
          dbDiesel: Number(systemMatch?.total_diesel || 0),
          dbPaid: Number(systemMatch?.total_paid || 0),
          dbOutstanding: Number(systemMatch?.total_outstanding || 0),
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
      availableSheets: sheetPreviews,
      trucks: items,
    };
  }
}
