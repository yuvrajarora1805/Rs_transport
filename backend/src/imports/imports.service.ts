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

  async importTruckDetails(): Promise<{ success: boolean; imported: number; errors: number }> {
    const filePath = path.join(process.cwd(), '..', 'TRUCK DETAILS.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File TRUCK DETAILS.xlsx not found at ${filePath}`);
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);
    let imported = 0;
    let errors = 0;

    for (const ws of wb.worksheets) {
      const sourceName = ws.name.trim().toUpperCase();
      // Ensure source exists
      let sourceRes = await this.db.query('SELECT id FROM sources WHERE name = ?', [sourceName]);
      let sourceId = sourceRes.rows[0]?.id;
      if (!sourceId) {
        sourceId = uuidv4();
        await this.db.query('INSERT INTO sources (id, name) VALUES (?, ?)', [sourceId, sourceName]);
      }

      for (let rowIdx = 3; rowIdx <= ws.rowCount; rowIdx++) {
        const row = ws.getRow(rowIdx);
        const srNo = String(row.getCell(1).value || '').trim();
        const dateVal = row.getCell(2).value;
        const truckNoRaw = String(row.getCell(3).value || '').trim();
        const balesVal = row.getCell(4).value;
        const mobileVal = String(row.getCell(5).value || '').trim();
        const destVal = String(row.getCell(6).value || '').trim();

        if (!truckNoRaw) continue;
        const truckNo = truckNoRaw.toUpperCase().replace(/\s+/g, '');
        // Filter out summary/total rows or headers
        if (truckNo === 'TOTAL' || truckNo === 'SRNO' || !/[0-9]/.test(truckNo)) continue;

        try {
          // 1. Ensure truck exists
          let truckRes = await this.db.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
          let truckId = truckRes.rows[0]?.id;
          if (!truckId) {
            truckId = uuidv4();
            await this.db.query(
              'INSERT INTO trucks (id, truck_no, mobile_no) VALUES (?, ?, ?)',
              [truckId, truckNo, mobileVal || null],
            );
          }

          // 2. Insert dispatch
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

    this.logger.log(`Truck details import: ${imported} dispatches imported, ${errors} errors`);
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

