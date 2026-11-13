import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateTripDto } from './dto/create-trip.dto';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TripsService {
  constructor(private db: DbService) {}

  async create(dto: CreateTripDto) {
    const check = await this.db.query('SELECT id FROM trips WHERE trip_no = ?', [dto.tripNo]);
    if (check.rows.length > 0) {
      throw new ConflictException(`Trip No ${dto.tripNo} already exists`);
    }

    const grossWeight = dto.grossWeight ? new Decimal(dto.grossWeight) : new Decimal(0);
    const tareWeight = dto.tareWeight ? new Decimal(dto.tareWeight) : new Decimal(0);
    const weight = dto.grossWeight && dto.tareWeight
      ? grossWeight.sub(tareWeight)
      : new Decimal(dto.netWeight);
    const rate = new Decimal(dto.ratePerUnit);
    const gross = weight.mul(rate).toDecimalPlaces(2);

    const id = uuidv4();
    const companyCode = dto.companyCode || 'RS_TRANSPORT';
    await this.db.query(
      `INSERT INTO trips (
        id, trip_no, dispatch_id, truck_id, destination_id, party_id,
        transporter_id, unloading_date, gross_weight, tare_weight, net_weight, rate_per_unit, gross_freight, company_code, slip_image
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.tripNo,
        dto.dispatchId || null,
        dto.truckId,
        dto.destinationId || null,
        dto.partyId || null,
        dto.transporterId || null,
        dto.unloadingDate ? new Date(dto.unloadingDate) : null,
        grossWeight.toNumber(),
        tareWeight.toNumber(),
        weight.toNumber(),
        rate.toNumber(),
        gross.toNumber(),
        companyCode,
        dto.slipImage || null,
      ],
    );

    // If trip is created from a dispatch, automatically link only UNLINKED fuel issued specifically for this truck
    if (dto.dispatchId) {
      // Find single unlinked fuel transaction matching this truck if applicable, without grabbing all historical entries
      const unlinkedFuel = await this.db.query(
        `SELECT id FROM fuel_transactions 
         WHERE trip_id IS NULL AND truck_id = ? 
         ORDER BY date DESC LIMIT 1`,
        [dto.truckId],
      );
      if (unlinkedFuel.rows.length > 0) {
        await this.db.query(
          `UPDATE fuel_transactions 
           SET trip_id = ? 
           WHERE id = ?`,
          [id, (unlinkedFuel.rows[0] as any).id],
        );
      }
    }

    // If inline fuel diesel was added directly with this trip
    if (dto.fuelPumpId && dto.fuelAmount && dto.fuelAmount > 0) {
      const fuelId = uuidv4();
      const ledgerId = uuidv4();
      const pumpRes = await this.db.query('SELECT opening_balance FROM pumps WHERE id = ?', [dto.fuelPumpId]);
      const pumpOpening = pumpRes.rows.length > 0 ? Number((pumpRes.rows[0] as any).opening_balance) : 0;
      const truckRes = await this.db.query('SELECT truck_no FROM trucks WHERE id = ?', [dto.truckId]);
      const truckNo = truckRes.rows.length > 0 ? (truckRes.rows[0] as any).truck_no : '';

      await this.db.query(
        `INSERT INTO fuel_transactions (id, date, truck_id, trip_id, pump_id, litres, rate, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fuelId,
          dto.unloadingDate ? new Date(dto.unloadingDate) : new Date(),
          dto.truckId,
          id,
          dto.fuelPumpId,
          dto.fuelLitres || null,
          dto.fuelRate || null,
          dto.fuelAmount,
        ],
      );

      // Update pump ledger
      const lastBalRes = await this.db.query(
        'SELECT balance FROM pump_ledger WHERE pump_id = ? ORDER BY created_at DESC LIMIT 1',
        [dto.fuelPumpId],
      );
      const currBal = lastBalRes.rows.length > 0 ? Number((lastBalRes.rows[0] as any).balance) : pumpOpening;
      const newBal = currBal + Number(dto.fuelAmount);

      await this.db.query(
        `INSERT INTO pump_ledger (id, pump_id, date, description, debit, credit, balance)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ledgerId,
          dto.fuelPumpId,
          dto.unloadingDate ? new Date(dto.unloadingDate) : new Date(),
          `Fuel issued for Trip ${dto.tripNo} (Truck: ${truckNo})`,
          dto.fuelAmount,
          0,
          newBal,
        ],
      );
    }

    return this.findOne(id);
  }

  async findAll(destinationId?: string, partyId?: string, companyCode?: string) {
    let sql = `
      SELECT t.*, trk.truck_no, trk.owner_name, d.name as destination_name,
             p.name as party_name, transp.name as transporter_name,
             s.id as settlement_id, s.status as settlement_status, s.net_payable, s.outstanding,
             GREATEST(
               COALESCE((SELECT SUM(f.amount) FROM fuel_transactions f WHERE f.trip_id = t.id), 0),
               COALESCE(s.diesel_amount, 0)
             ) as total_diesel,
             COALESCE((SELECT COUNT(f.id) FROM fuel_transactions f WHERE f.trip_id = t.id), CASE WHEN s.diesel_amount > 0 THEN 1 ELSE 0 END) as fuel_count
      FROM trips t
      JOIN trucks trk ON t.truck_id = trk.id
      LEFT JOIN destinations d ON t.destination_id = d.id
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN transporters transp ON t.transporter_id = transp.id
      LEFT JOIN settlements s ON t.id = s.trip_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (destinationId) {
      params.push(destinationId);
      sql += ` AND t.destination_id = ?`;
    }
    if (partyId) {
      params.push(partyId);
      sql += ` AND t.party_id = ?`;
    }
    if (companyCode) {
      params.push(companyCode);
      sql += ` AND t.company_code = ?`;
    }

    sql += ` ORDER BY t.created_at DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async findOne(id: string) {
    const tripRes = await this.db.query(
      `SELECT t.*, trk.truck_no, trk.owner_name, d.name as destination_name,
              p.name as party_name, transp.name as transporter_name
       FROM trips t
       JOIN trucks trk ON t.truck_id = trk.id
       LEFT JOIN destinations d ON t.destination_id = d.id
       LEFT JOIN parties p ON t.party_id = p.id
       LEFT JOIN transporters transp ON t.transporter_id = transp.id
       WHERE t.id = ?`,
      [id],
    );
    if (tripRes.rows.length === 0) {
      throw new NotFoundException(`Trip ID ${id} not found`);
    }

    const [fuel, advances, settlement] = await Promise.all([
      this.db.query(
        `SELECT f.*, p.name as pump_name FROM fuel_transactions f
         JOIN pumps p ON f.pump_id = p.id
         WHERE f.trip_id = ?`,
        [id],
      ),
      this.db.query('SELECT * FROM advances WHERE trip_id = ?', [id]),
      this.db.query('SELECT * FROM settlements WHERE trip_id = ?', [id]),
    ]);

    return {
      ...tripRes.rows[0],
      fuelRecords: fuel.rows,
      advances: advances.rows,
      settlement: settlement.rows[0] || null,
    };
  }

  async remove(id: string) {
    const trip = await this.db.query('SELECT * FROM trips WHERE id = ?', [id]);
    if (trip.rows.length === 0) {
      throw new NotFoundException(`Trip ${id} not found`);
    }
    // Delete linked settlements, advances, or cascade
    await this.db.query('DELETE FROM settlements WHERE trip_id = ?', [id]);
    await this.db.query('DELETE FROM advances WHERE trip_id = ?', [id]);
    await this.db.query('UPDATE fuel_transactions SET trip_id = NULL WHERE trip_id = ?', [id]);
    await this.db.query('DELETE FROM trips WHERE id = ?', [id]);
    return { success: true, message: 'Trip deleted' };
  }
}
