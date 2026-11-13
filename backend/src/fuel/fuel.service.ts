import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateFuelDto } from './dto/create-fuel.dto';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FuelService {
  constructor(private db: DbService) {}

  async create(dto: CreateFuelDto) {
    const pumpCheck = await this.db.query('SELECT opening_balance FROM pumps WHERE id = ?', [dto.pumpId]);
    if (pumpCheck.rows.length === 0) {
      throw new NotFoundException(`Pump ID ${dto.pumpId} not found`);
    }

    const truckCheck = await this.db.query('SELECT truck_no FROM trucks WHERE id = ?', [dto.truckId]);
    if (truckCheck.rows.length === 0) {
      throw new NotFoundException(`Truck ID ${dto.truckId} not found`);
    }
    const truckNo = (truckCheck.rows[0] as any).truck_no;
    const fuelAmount = new Decimal(dto.amount);
    const fuelId = uuidv4();
    const ledgerId = uuidv4();

    // If dispatchId was provided but no tripId, check if a trip already exists for this dispatch
    let resolvedTripId = dto.tripId || null;
    if (!resolvedTripId && dto.dispatchId) {
      const tripMatch = await this.db.query('SELECT id FROM trips WHERE dispatch_id = ? LIMIT 1', [dto.dispatchId]);
      if (tripMatch.rows.length > 0) {
        resolvedTripId = (tripMatch.rows[0] as any).id;
      }
    }

    return this.db.transaction(async (conn) => {
      // 1. Insert Fuel Record
      try {
        await conn.execute(
          `INSERT INTO fuel_transactions (id, date, truck_id, trip_id, pump_id, litres, rate, amount, slip_image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fuelId,
            new Date(dto.date),
            dto.truckId,
            resolvedTripId,
            dto.pumpId,
            dto.litres || null,
            dto.rate || null,
            fuelAmount.toNumber(),
            dto.slipImage || null,
          ],
        );
      } catch (err: any) {
        if (err?.code === 'ER_BAD_FIELD_ERROR' || err?.message?.includes('Unknown column')) {
          try {
            await this.db.rawQuery('ALTER TABLE fuel_transactions ADD COLUMN slip_image LONGTEXT NULL');
            await conn.execute(
              `INSERT INTO fuel_transactions (id, date, truck_id, trip_id, pump_id, litres, rate, amount, slip_image)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                fuelId,
                new Date(dto.date),
                dto.truckId,
                resolvedTripId,
                dto.pumpId,
                dto.litres || null,
                dto.rate || null,
                fuelAmount.toNumber(),
                dto.slipImage || null,
              ],
            );
          } catch {
            await conn.execute(
              `INSERT INTO fuel_transactions (id, date, truck_id, trip_id, pump_id, litres, rate, amount)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                fuelId,
                new Date(dto.date),
                dto.truckId,
                resolvedTripId,
                dto.pumpId,
                dto.litres || null,
                dto.rate || null,
                fuelAmount.toNumber(),
              ],
            );
          }
        } else {
          throw err;
        }
      }

      // 2. Compute closing balance
      const [ledgerRows]: any = await conn.execute(
        'SELECT balance FROM pump_ledger WHERE pump_id = ? ORDER BY created_at DESC LIMIT 1',
        [dto.pumpId],
      );
      const currentBalance =
        ledgerRows.length > 0
          ? new Decimal(ledgerRows[0].balance)
          : new Decimal((pumpCheck.rows[0] as any).opening_balance);

      const newBalance = currentBalance.add(fuelAmount);

      // 3. Insert into pump ledger
      await conn.execute(
        `INSERT INTO pump_ledger (id, pump_id, date, description, debit, credit, balance)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ledgerId,
          dto.pumpId,
          new Date(dto.date),
          `Fuel issued for Truck: ${truckNo}`,
          fuelAmount.toNumber(),
          0,
          newBalance.toNumber(),
        ],
      );

      return { id: fuelId, truck_no: truckNo, amount: fuelAmount.toNumber() };
    });
  }

  async findAll(truckId?: string, pumpId?: string) {
    let sql = `
      SELECT f.*, t.truck_no, p.name as pump_name, tr.trip_no
      FROM fuel_transactions f
      JOIN trucks t ON f.truck_id = t.id
      JOIN pumps p ON f.pump_id = p.id
      LEFT JOIN trips tr ON f.trip_id = tr.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (truckId) {
      params.push(truckId);
      sql += ` AND f.truck_id = ?`;
    }
    if (pumpId) {
      params.push(pumpId);
      sql += ` AND f.pump_id = ?`;
    }

    sql += ` ORDER BY f.date DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async remove(id: string) {
    const fuel = await this.db.query('SELECT * FROM fuel_transactions WHERE id = ?', [id]);
    if (fuel.rows.length === 0) {
      throw new NotFoundException(`Fuel record ${id} not found`);
    }
    await this.db.query('DELETE FROM fuel_transactions WHERE id = ?', [id]);
    return { success: true, message: 'Fuel entry deleted' };
  }
}
