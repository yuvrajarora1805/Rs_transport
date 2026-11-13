import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SettlementsService {
  constructor(private db: DbService) {}

  async create(dto: CreateSettlementDto) {
    const tripRes = await this.db.query('SELECT * FROM trips WHERE id = ?', [dto.tripId]);
    if (tripRes.rows.length === 0) {
      throw new NotFoundException(`Trip ID ${dto.tripId} not found`);
    }
    const trip = tripRes.rows[0] as any;

    const existingCheck = await this.db.query('SELECT id FROM settlements WHERE trip_id = ?', [dto.tripId]);
    if (existingCheck.rows.length > 0) {
      throw new ConflictException(`Settlement for trip ${trip.trip_no} already exists`);
    }

    const gross = new Decimal(trip.gross_freight);
    const advance = new Decimal(dto.advanceAmount || 0);
    const diesel = new Decimal(dto.dieselAmount || 0);
    const commission = new Decimal(dto.commission || 0);
    const other = new Decimal(dto.otherDeductions || 0);

    const totalDeductions = advance.add(diesel).add(commission).add(other);
    const netPayable = gross.sub(totalDeductions);

    const id = uuidv4();
    const companyCode = trip.company_code || 'RS_TRANSPORT';
    await this.db.query(
      `INSERT INTO settlements (
        id, trip_id, settlement_date, gross_freight, advance_amount, diesel_amount,
        commission, other_deductions, net_payable, total_paid, outstanding, status, company_code, slip_image
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.tripId,
        new Date(),
        gross.toNumber(),
        advance.toNumber(),
        diesel.toNumber(),
        commission.toNumber(),
        other.toNumber(),
        netPayable.toNumber(),
        0,
        netPayable.toNumber(),
        'APPROVED',
        companyCode,
        dto.slipImage || null,
      ],
    );

    return this.findOne(id);
  }

  async findAll(status?: string, companyCode?: string) {
    let sql = `
      SELECT s.*, t.trip_no, t.unloading_date, t.slip_image as trip_slip_image, trk.truck_no, trk.owner_name,
             d.name as destination_name, p.name as party_name, transp.name as transporter_name
      FROM settlements s
      JOIN trips t ON s.trip_id = t.id
      JOIN trucks trk ON t.truck_id = trk.id
      LEFT JOIN destinations d ON t.destination_id = d.id
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN transporters transp ON t.transporter_id = transp.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) {
      params.push(status);
      sql += ` AND s.status = ?`;
    }
    if (companyCode) {
      params.push(companyCode);
      sql += ` AND s.company_code = ?`;
    }

    sql += ` ORDER BY s.created_at DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async findOne(id: string) {
    const res = await this.db.query(
      `SELECT s.*, t.trip_no, t.unloading_date, t.slip_image as trip_slip_image, trk.truck_no, trk.owner_name,
              d.name as destination_name, p.name as party_name, transp.name as transporter_name
       FROM settlements s
       JOIN trips t ON s.trip_id = t.id
       JOIN trucks trk ON t.truck_id = trk.id
       LEFT JOIN destinations d ON t.destination_id = d.id
       LEFT JOIN parties p ON t.party_id = p.id
       LEFT JOIN transporters transp ON t.transporter_id = transp.id
       WHERE s.id = ?`,
      [id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Settlement ID ${id} not found`);
    }

    const payments = await this.db.query(
      'SELECT * FROM payments WHERE settlement_id = ? ORDER BY payment_date DESC',
      [id],
    );

    return {
      ...res.rows[0],
      payments: payments.rows,
    };
  }

  async remove(id: string) {
    const settlement = await this.db.query('SELECT * FROM settlements WHERE id = ?', [id]);
    if (settlement.rows.length === 0) {
      throw new NotFoundException(`Settlement ${id} not found`);
    }
    await this.db.query('DELETE FROM payments WHERE settlement_id = ?', [id]);
    await this.db.query('DELETE FROM settlements WHERE id = ?', [id]);
    return { success: true, message: 'Settlement deleted' };
  }
}
