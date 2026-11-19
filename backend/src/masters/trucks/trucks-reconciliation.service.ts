import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { ColumnMapping, detectColumnIndices, extractNum, extractStr } from './trucks-recon-parser';

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
  totalExcelWeight: number;
  totalErpWeight: number;
  totalErpFreight: number;
  totalErpOutstanding: number;
  sourcesBreakdown: { source: string; entries: number; bales: number }[];
  destinationsBreakdown: { destination: string; count: number }[];
  availableSheets?: SheetPreview[];
  trucks: any[];
}

@Injectable()
export class TrucksReconciliationService {
  private readonly logger = new Logger(TrucksReconciliationService.name);

  constructor(private db: DbService) {}

  async reconcileExcelBuffer(buffer: Buffer, fileName = 'Uploaded Excel', manualMapping?: ColumnMapping): Promise<TruckReconSummary> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);
    return this.processWorkbook(wb, fileName, manualMapping);
  }

  async reconcileDefaultFile(): Promise<TruckReconSummary> {
    const candidates = [
      path.resolve(process.cwd(), 'RS TRANSPORT COMPANY Plant Pass.xlsx'),
      path.resolve(process.cwd(), '..', 'RS TRANSPORT COMPANY Plant Pass.xlsx'),
      '/media/yuvraj/New Volume/xamp/htdocs/Rs_transport/RS TRANSPORT COMPANY Plant Pass.xlsx',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          return await this.reconcileExcelBuffer(fs.readFileSync(p), 'RS TRANSPORT COMPANY Plant Pass.xlsx');
        } catch (err: any) {
          this.logger.warn(`Could not load default workbook: ${err.message}`);
        }
      }
    }
    return {
      uploadedFileName: undefined, totalRows: 0, distinctTrucks: 0, matchedInSystem: 0,
      missingInSystem: 0, totalBales: 0, totalExcelWeight: 0, totalErpWeight: 0,
      totalErpFreight: 0, totalErpOutstanding: 0, sourcesBreakdown: [], destinationsBreakdown: [], trucks: [],
    };
  }

  private async processWorkbook(
    wb: ExcelJS.Workbook,
    fileName: string,
    manualMapping?: ColumnMapping,
  ): Promise<TruckReconSummary> {
    const systemTrucksRes = await this.db.query(`
      SELECT trk.id, trk.truck_no, trk.owner_name, trk.mobile_no,
             COALESCE(disp.dispatch_count, 0) as erp_dispatches,
             COALESCE(disp.total_bales, 0) as erp_bales,
             COALESCE(trp.trip_count, 0) as erp_trips,
             COALESCE(trp.total_net_weight, 0) as erp_net_weight,
             COALESCE(trp.total_gross_freight, 0) as erp_gross_freight,
             COALESCE(trp.total_diesel, 0) as erp_diesel,
             COALESCE(trp.total_paid, 0) as erp_paid,
             COALESCE(trp.total_outstanding, 0) as erp_outstanding
      FROM trucks trk
      LEFT JOIN (
        SELECT truck_id, COUNT(*) as dispatch_count, SUM(bales) as total_bales
        FROM dispatches GROUP BY truck_id
      ) disp ON trk.id = disp.truck_id
      LEFT JOIN (
        SELECT t.truck_id,
               COUNT(DISTINCT t.id) as trip_count,
               SUM(t.net_weight) as total_net_weight,
               SUM(COALESCE(s.gross_freight, t.gross_freight, 0)) as total_gross_freight,
               SUM(COALESCE(s.diesel_amount, 0)) as total_diesel,
               SUM(COALESCE(s.total_paid, 0)) as total_paid,
               SUM(COALESCE(s.outstanding, 0)) as total_outstanding
        FROM trips t
        LEFT JOIN settlements s ON t.id = s.trip_id
        GROUP BY t.truck_id
      ) trp ON trk.id = trp.truck_id
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
    let totalExcelWeight = 0;

    for (const ws of wb.worksheets) {
      const sheetName = ws.name.trim().toUpperCase();
      if (!sheetName || ws.rowCount < 2) continue;

      const idx = detectColumnIndices(ws, manualMapping);
      const colSamples: { colIndex: number; sampleValues: string[] }[] = [];
      for (let c = 1; c <= Math.min(10, ws.columnCount || 8); c++) {
        const samples: string[] = [];
        for (let r = 1; r <= Math.min(5, ws.rowCount); r++) {
          const v = extractStr(ws.getRow(r).getCell(c).value);
          if (v) samples.push(v);
        }
        colSamples.push({ colIndex: c, sampleValues: samples });
      }

      sheetPreviews.push({ sheetName, totalRows: ws.rowCount, headers: colSamples });

      for (let r = idx.headerRowIdx + 1; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const truckVal = idx.truckColIdx > 0 ? row.getCell(idx.truckColIdx).value : null;
        if (!truckVal || truckVal instanceof Date) continue;

        const truckRaw = extractStr(truckVal);
        if (truckRaw.includes('GMT+') || truckRaw.includes('Standard Time')) continue;
        const truckNo = truckRaw.toUpperCase().replace(/\s+/g, '');
        if (truckNo === 'TOTAL' || truckNo === 'SRNO' || truckNo === 'TRUCKNO' || !/[0-9]/.test(truckNo)) continue;

        const dateStr = idx.dateColIdx > 0 ? extractStr(row.getCell(idx.dateColIdx).value) : '-';
        const contact = idx.contactColIdx > 0 ? extractStr(row.getCell(idx.contactColIdx).value) : '';
        const dest = idx.destColIdx > 0 ? extractStr(row.getCell(idx.destColIdx).value) : '';
        const sourceLoc = idx.sourceColIdx > 0 ? extractStr(row.getCell(idx.sourceColIdx).value) : '';
        const finalSource = sourceLoc || sheetName;
        const slipNo = idx.slipColIdx > 0 ? extractStr(row.getCell(idx.slipColIdx).value) : '';

        const excelWeight = idx.weightColIdx > 0 ? extractNum(row.getCell(idx.weightColIdx).value) : 0;
        const excelBales = idx.balesColIdx > 0 ? extractNum(row.getCell(idx.balesColIdx).value) : 0;
        const excelFreight = idx.freightColIdx > 0 ? extractNum(row.getCell(idx.freightColIdx).value) : 0;
        const excelDiesel = idx.dieselColIdx > 0 ? extractNum(row.getCell(idx.dieselColIdx).value) : 0;
        const excelPaid = idx.paidColIdx > 0 ? extractNum(row.getCell(idx.paidColIdx).value) : 0;
        const excelPending = idx.pendingColIdx > 0 ? extractNum(row.getCell(idx.pendingColIdx).value) : 0;

        totalBales += (excelBales || (excelWeight > 0 ? excelWeight : 0));
        totalExcelWeight += excelWeight;
        seenTruckNos.add(truckNo);

        const curSource = sourceStats.get(finalSource) || { entries: 0, bales: 0 };
        curSource.entries += 1;
        curSource.bales += excelBales;
        sourceStats.set(finalSource, curSource);

        const cleanDest = dest ? dest.toUpperCase() : 'UNSPECIFIED';
        destStats.set(cleanDest, (destStats.get(cleanDest) || 0) + 1);

        const sysMatch = systemMap.get(truckNo);

        items.push({
          truckNo,
          mobileNo: contact || sysMatch?.mobile_no || '',
          source: finalSource,
          destination: dest || sysMatch?.owner_name || '-',
          slipNo,
          date: dateStr,
          excelWeight,
          excelBales,
          excelFreight,
          excelDiesel,
          excelPaid,
          excelPending,
          isRegisteredInSystem: !!sysMatch,
          systemTruckId: sysMatch?.id,
          erpDispatches: Number(sysMatch?.erp_dispatches || 0),
          erpBales: Number(sysMatch?.erp_bales || 0),
          erpTrips: Number(sysMatch?.erp_trips || 0),
          erpNetWeight: Number(sysMatch?.erp_net_weight || 0),
          erpGrossFreight: Number(sysMatch?.erp_gross_freight || 0),
          erpDiesel: Number(sysMatch?.erp_diesel || 0),
          erpPaid: Number(sysMatch?.erp_paid || 0),
          erpOutstanding: Number(sysMatch?.erp_outstanding || 0),
          // Backwards-compatible aliases for legacy components
          bales: excelBales || (excelWeight > 0 ? excelWeight : Number(sysMatch?.erp_bales || 0)),
          dbGrossFreight: Number(sysMatch?.erp_gross_freight || 0),
          dbDiesel: Number(sysMatch?.erp_diesel || 0),
          dbPaid: Number(sysMatch?.erp_paid || 0),
          dbOutstanding: Number(sysMatch?.erp_outstanding || 0),
        });
      }
    }

    let matchedCount = 0;
    let totalErpWeight = 0;
    let totalErpFreight = 0;
    let totalErpOutstanding = 0;
    for (const t of seenTruckNos) {
      const match = systemMap.get(t);
      if (match) {
        matchedCount++;
        totalErpWeight += Number(match.erp_net_weight || 0);
        totalErpFreight += Number(match.erp_gross_freight || 0);
        totalErpOutstanding += Number(match.erp_outstanding || 0);
      }
    }

    return {
      uploadedFileName: fileName,
      totalRows: items.length,
      distinctTrucks: seenTruckNos.size,
      matchedInSystem: matchedCount,
      missingInSystem: seenTruckNos.size - matchedCount,
      totalBales,
      totalExcelWeight,
      totalErpWeight,
      totalErpFreight,
      totalErpOutstanding,
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
