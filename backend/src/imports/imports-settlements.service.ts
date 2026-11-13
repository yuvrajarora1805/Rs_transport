import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../db/db.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';

@Injectable()
export class ImportsSettlementsService {
  private readonly logger = new Logger(ImportsSettlementsService.name);

  constructor(private db: DbService) {}

  async importSettlementsFile(filename: string, companyCode: string = 'RS_TRANSPORT'): Promise<{ success: boolean; imported: number }> {
    const filePath = path.join(process.cwd(), '..', filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filename} not found at ${filePath}`);
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);
    let count = 0;

    for (const ws of wb.worksheets) {
      if (ws.name === 'RAW' || ws.rowCount < 2) continue;
      const destName = ws.name.trim().toUpperCase();

      // Destination
      let dRes = await this.db.query('SELECT id FROM destinations WHERE name = ?', [destName]);
      let destId = dRes.rows[0]?.id;
      if (!destId) {
        destId = uuidv4();
        await this.db.query('INSERT INTO destinations (id, name) VALUES (?, ?)', [destId, destName]);
      }

      for (let r = 2; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const dateVal = row.getCell(1).value || row.getCell(3).value;
        const srVal = String(row.getCell(2).value || '').trim();
        const truckVal = String(row.getCell(3).value || row.getCell(4).value || '').trim();
        const partyVal = String(row.getCell(5).value || '').trim();
        const wtVal = row.getCell(6).value || row.getCell(7).value;
        const rateVal = row.getCell(7).value || row.getCell(8).value;
        const advVal = row.getCell(8).value || row.getCell(9).value;
        const dieselVal = row.getCell(9).value || row.getCell(10).value;
        const commVal = row.getCell(11).value || row.getCell(12).value;
        const pmtVal = String(row.getCell(13).value || row.getCell(14).value || '').trim();

        if (!truckVal) continue;
        const truckNo = truckVal.toUpperCase().replace(/\s+/g, '');
        const weight = typeof wtVal === 'number' ? wtVal : parseFloat(String(wtVal)) || 0;
        const rate = typeof rateVal === 'number' ? rateVal : parseFloat(String(rateVal)) || 0;
        if (weight <= 0 || rate <= 0) continue;

        try {
          // Truck
          let tRes = await this.db.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
          let truckId = tRes.rows[0]?.id;
          if (!truckId) {
            truckId = uuidv4();
            await this.db.query('INSERT INTO trucks (id, truck_no) VALUES (?, ?)', [truckId, truckNo]);
          }

          // Party
          let partyId: string | null = null;
          if (partyVal) {
            let pRes = await this.db.query('SELECT id FROM parties WHERE name = ?', [partyVal]);
            partyId = pRes.rows[0]?.id;
            if (!partyId) {
              partyId = uuidv4();
              await this.db.query('INSERT INTO parties (id, name) VALUES (?, ?)', [partyId, partyVal]);
            }
          }

          const gross = new Decimal(weight).mul(new Decimal(rate)).toNumber();
          const advance = typeof advVal === 'number' ? advVal : parseFloat(String(advVal)) || 0;
          const diesel = typeof dieselVal === 'number' ? dieselVal : parseFloat(String(dieselVal)) || 0;
          const comm = typeof commVal === 'number' ? commVal : parseFloat(String(commVal)) || 0;
          const net = gross - advance - diesel - comm;

          const tripId = uuidv4();
          const tripNo = srVal ? `SR-${srVal}` : `TRP-${Math.floor(10000 + Math.random() * 90000)}`;

          await this.db.query(
            `INSERT INTO trips (id, trip_no, truck_id, destination_id, party_id, net_weight, rate_per_unit, gross_freight, company_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tripId, tripNo, truckId, destId, partyId, weight, rate, gross, companyCode],
          );

          const settlementId = uuidv4();
          const isPaid = pmtVal && pmtVal !== 'PENDING';
          const totalPaid = isPaid ? net : 0;
          const outstanding = net - totalPaid;

          await this.db.query(
            `INSERT INTO settlements (id, trip_id, settlement_date, gross_freight, advance_amount, diesel_amount, commission, net_payable, total_paid, outstanding, status, company_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              settlementId,
              tripId,
              dateVal instanceof Date ? dateVal : new Date('2026-10-01'),
              gross,
              advance,
              diesel,
              comm,
              net,
              totalPaid,
              outstanding,
              isPaid ? 'PAID' : 'APPROVED',
              companyCode,
            ],
          );

          if (isPaid && totalPaid > 0) {
            await this.db.query(
              `INSERT INTO payments (id, settlement_id, payment_date, amount, paid_to)
               VALUES (?, ?, ?, ?, ?)`,
              [uuidv4(), settlementId, new Date(), totalPaid, pmtVal],
            );
          }
          count++;
        } catch (e) {
          // ignore row collisions
        }
      }
    }

    this.logger.log(`Imported ${count} trip settlements from ${filename}`);
    return { success: true, imported: count };
  }
}

