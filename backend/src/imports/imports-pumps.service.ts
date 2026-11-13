import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';

@Injectable()
export class ImportsPumpsService {
  private readonly logger = new Logger(ImportsPumpsService.name);

  constructor(private db: DbService) {}

  async importPumpDetails(): Promise<{ success: boolean; imported: number; payments: number }> {
    const filePath = path.join(process.cwd(), '..', 'pump details.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File pump details.xlsx not found at ${filePath}`);
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);
    let totalFuel = 0;
    let totalPayments = 0;

    for (const ws of wb.worksheets) {
      const pumpName = ws.name.trim().toUpperCase();
      let pumpRes = await this.db.query('SELECT id FROM pumps WHERE name = ?', [pumpName]);
      let pumpId = pumpRes.rows[0]?.id;
      if (!pumpId) {
        pumpId = uuidv4();
        await this.db.query(
          'INSERT INTO pumps (id, name, opening_balance) VALUES (?, ?, 0)',
          [pumpId, pumpName],
        );
      }

      for (let rowIdx = 4; rowIdx <= ws.rowCount; rowIdx++) {
        const row = ws.getRow(rowIdx);
        const dateVal = row.getCell(1).value || row.getCell(2).value;
        const truckVal = String(row.getCell(2).value || row.getCell(3).value || '').trim();
        const fuelVal = row.getCell(3).value || row.getCell(4).value;
        const pmtVal = row.getCell(4).value || row.getCell(5).value;

        const date = dateVal instanceof Date ? dateVal : new Date('2026-10-01');
        const truckNo = truckVal.toUpperCase().replace(/\s+/g, '');
        const fuelAmt = typeof fuelVal === 'number' ? fuelVal : parseFloat(String(fuelVal)) || 0;
        const pmtAmt = typeof pmtVal === 'number' ? pmtVal : parseFloat(String(pmtVal)) || 0;

        if (truckNo && fuelAmt > 0) {
          let truckRes = await this.db.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
          let truckId = truckRes.rows[0]?.id;
          if (!truckId) {
            truckId = uuidv4();
            await this.db.query('INSERT INTO trucks (id, truck_no) VALUES (?, ?)', [truckId, truckNo]);
          }

          const fId = uuidv4();
          await this.db.query(
            `INSERT INTO fuel_transactions (id, date, truck_id, pump_id, amount)
             VALUES (?, ?, ?, ?, ?)`,
            [fId, date, truckId, pumpId, fuelAmt],
          );

          await this.db.query(
            `INSERT INTO pump_ledger (id, pump_id, date, description, debit, credit, balance)
             VALUES (?, ?, ?, ?, ?, 0, ?)`,
            [uuidv4(), pumpId, date, `Fuel slip for ${truckNo}`, fuelAmt, fuelAmt],
          );
          totalFuel++;
        }

        if (pmtAmt > 0) {
          const pId = uuidv4();
          await this.db.query(
            `INSERT INTO pump_payments (id, pump_id, date, amount, method)
             VALUES (?, ?, ?, ?, 'BANK_TRANSFER')`,
            [pId, pumpId, date, pmtAmt],
          );

          await this.db.query(
            `INSERT INTO pump_ledger (id, pump_id, date, description, debit, credit, balance)
             VALUES (?, ?, ?, ?, 0, ?, ?)`,
            [uuidv4(), pumpId, date, 'Bank Payment to Petrol Pump', pmtAmt, -pmtAmt],
          );
          totalPayments++;
        }
      }
    }

    this.logger.log(`Pump details import: ${totalFuel} fuel slips, ${totalPayments} payments`);
    return { success: true, imported: totalFuel, payments: totalPayments };
  }
}

