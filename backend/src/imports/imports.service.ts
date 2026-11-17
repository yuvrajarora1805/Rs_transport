import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(private db: DbService) {}

  private resolveTruckFilePath(): string {
    const p2 = path.join(process.cwd(), '..', 'TRUCK DETAILS (2).xlsx');
    if (fs.existsSync(p2)) return p2;
    const p1 = path.join(process.cwd(), '..', 'TRUCK DETAILS.xlsx');
    if (fs.existsSync(p1)) return p1;
    throw new Error('Neither TRUCK DETAILS (2).xlsx nor TRUCK DETAILS.xlsx found');
  }

  async importTruckDetails(): Promise<{ success: boolean; imported: number; errors: number }> {
    const filePath = this.resolveTruckFilePath();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);
    let imported = 0;
    let errors = 0;

    for (const ws of wb.worksheets) {
      const sourceName = ws.name.trim().toUpperCase();
      if (!sourceName || ws.rowCount < 2) continue;

      let sourceRes = await this.db.query('SELECT id FROM sources WHERE name = ?', [sourceName]);
      let sourceId = sourceRes.rows[0]?.id;
      if (!sourceId) {
        sourceId = uuidv4();
        await this.db.query('INSERT INTO sources (id, name) VALUES (?, ?)', [sourceId, sourceName]);
      }

      // Check header row (row 1 or 2)
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

      for (let rowIdx = startRow; rowIdx <= ws.rowCount; rowIdx++) {
        const row = ws.getRow(rowIdx);
        let srNo = '';
        let dateVal: any = null;
        let truckNoRaw = '';
        let balesVal: any = null;
        let mobileVal = '';
        let destVal = '';

        if (hasSrCol) {
          srNo = String(row.getCell(1).value || '').trim();
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

        try {
          let truckRes = await this.db.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
          let truckId = truckRes.rows[0]?.id;
          if (!truckId) {
            truckId = uuidv4();
            await this.db.query(
              'INSERT INTO trucks (id, truck_no, mobile_no) VALUES (?, ?, ?)',
              [truckId, truckNo, mobileVal || null],
            );
          }

          const dispatchDate = dateVal instanceof Date ? dateVal : new Date();
          const bales = typeof balesVal === 'number' ? balesVal : parseFloat(String(balesVal)) || null;

          await this.db.query(
            `INSERT INTO dispatches (id, sr_no, date, truck_id, source_id, bales, destination)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), srNo || null, dispatchDate, truckId, sourceId, bales, destVal || null],
          );
          imported++;
        } catch (e) {
          errors++;
        }
      }
    }

    this.logger.log(`Truck details import: ${imported} dispatches imported, ${errors} errors from ${filePath}`);
    return { success: true, imported, errors };
  }

  async getImportStatus() {
    const [dispatches, trucks, trips, settlements, fuel] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM dispatches'),
      this.db.query('SELECT COUNT(*) as count FROM trucks'),
      this.db.query('SELECT COUNT(*) as count FROM trips'),
      this.db.query('SELECT COUNT(*) as count FROM settlements'),
      this.db.query('SELECT COUNT(*) as count FROM fuel_transactions'),
    ]);

    return {
      dispatchesCount: Number((dispatches.rows[0] as any).count || 0),
      trucksCount: Number((trucks.rows[0] as any).count || 0),
      tripsCount: Number((trips.rows[0] as any).count || 0),
      settlementsCount: Number((settlements.rows[0] as any).count || 0),
      fuelCount: Number((fuel.rows[0] as any).count || 0),
    };
  }
}
