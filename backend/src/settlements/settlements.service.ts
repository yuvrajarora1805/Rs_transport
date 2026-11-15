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

    let gross = new Decimal(trip.gross_freight || 0);
    if (gross.isZero() && trip.net_weight && trip.rate_per_unit) {
      gross = new Decimal(trip.net_weight).mul(new Decimal(trip.rate_per_unit)).toDecimalPlaces(2);
    }
    const advance = new Decimal(dto.advanceAmount || 0);
    const diesel = new Decimal(dto.dieselAmount || 0);
    const commission = new Decimal(dto.commission || 0);
    const other = new Decimal(dto.otherDeductions || 0);
    const priorDeficit = new Decimal(dto.priorDeficitRecovery || 0);

    const totalDeductions = advance.add(diesel).add(commission).add(other).add(priorDeficit);
    const netPayable = gross.sub(totalDeductions);
    const status = netPayable.isNegative() ? 'OVERDRAWN' : 'APPROVED';

    const id = uuidv4();
    const companyCode = trip.company_code || 'RS_TRANSPORT';
    const insertSql = `INSERT INTO settlements (
        id, trip_id, settlement_date, gross_freight, advance_amount, diesel_amount,
        commission, other_deductions, prior_deficit_offset, net_payable, total_paid, outstanding, status, company_code, slip_image
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertParams = [
      id,
      dto.tripId,
      new Date(),
      gross.toNumber(),
      advance.toNumber(),
      diesel.toNumber(),
      commission.toNumber(),
      other.toNumber(),
      priorDeficit.toNumber(),
      netPayable.toNumber(),
      0,
      netPayable.toNumber(),
      status,
      companyCode,
      dto.slipImage || null,
    ];

    try {
      await this.db.query(insertSql, insertParams);
    } catch (err: any) {
      if (err?.code === 'ER_BAD_FIELD_ERROR' || err?.message?.includes('Unknown column')) {
        try {
          await this.db.rawQuery("ALTER TABLE settlements ADD COLUMN company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT'");
          await this.db.rawQuery('ALTER TABLE settlements ADD COLUMN slip_image LONGTEXT NULL');
          await this.db.rawQuery('ALTER TABLE settlements ADD COLUMN prior_deficit_offset DECIMAL(12,2) NOT NULL DEFAULT 0.00');
          await this.db.query(insertSql, insertParams);
        } catch {
          await this.db.query(
            `INSERT INTO settlements (
              id, trip_id, settlement_date, gross_freight, advance_amount, diesel_amount,
              commission, other_deductions, net_payable, total_paid, outstanding, status
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              dto.tripId,
              new Date(),
              gross.toNumber(),
              advance.toNumber(),
              diesel.toNumber(),
              commission.toNumber(),
              other.add(priorDeficit).toNumber(),
              netPayable.toNumber(),
              0,
              netPayable.toNumber(),
              status,
            ],
          );
        }
      } else {
        throw err;
      }
    }

    // Offset prior overdrawn/excess diesel settlements for this truck
    if (priorDeficit.gt(0)) {
      try {
        let remainingToOffset = priorDeficit.toNumber();
        const deficits = await this.getDeficits(trip.truck_id, trip.transporter_id, companyCode);
        for (const item of deficits) {
          if (remainingToOffset <= 0) break;
          const currentOut = Number(item.outstanding || 0);
          if (currentOut < 0) {
            const deficitAmt = Math.abs(currentOut);
            const applied = Math.min(remainingToOffset, deficitAmt);
            const newOutstanding = currentOut + applied;
            const newStatus = newOutstanding >= 0 ? 'RECOVERED' : 'OVERDRAWN';
            await this.db.query(
              'UPDATE settlements SET outstanding = ?, status = ? WHERE id = ?',
              [newOutstanding, newStatus, item.id],
            );
            remainingToOffset -= applied;
          }
        }
      } catch (offsetErr) {
        console.warn('Notice while updating prior deficit offsets:', offsetErr);
      }
    }

    return this.findOne(id);
  }

  async getDeficits(truckId?: string, transporterId?: string, companyCode?: string) {
    let sql = `
      SELECT s.id, s.trip_id, t.trip_no, trk.truck_no, trk.owner_name,
             COALESCE(transp.name, s.company_code) as transporter_name,
             s.settlement_date, s.gross_freight, s.diesel_amount, s.net_payable,
             CASE WHEN s.outstanding < 0 THEN s.outstanding ELSE s.net_payable END as outstanding,
             s.status
      FROM settlements s
      JOIN trips t ON s.trip_id = t.id
      JOIN trucks trk ON t.truck_id = trk.id
      LEFT JOIN transporters transp ON (t.transporter_id = transp.id OR REPLACE(REPLACE(UPPER(transp.name), '.', ''), ' ', '_') = s.company_code)
      WHERE (s.outstanding < 0 OR (s.net_payable < 0 AND s.status != 'RECOVERED'))
    `;
    const params: any[] = [];
    const orClauses: string[] = [];

    if (truckId) {
      orClauses.push('(t.truck_id = ? OR trk.truck_no = (SELECT truck_no FROM trucks WHERE id = ? LIMIT 1))');
      params.push(truckId, truckId);
    }
    if (transporterId) {
      orClauses.push('(t.transporter_id = ? OR transp.id = ?)');
      params.push(transporterId, transporterId);
    }
    if (companyCode) {
      orClauses.push('s.company_code = ?');
      params.push(companyCode);
    }

    if (orClauses.length > 0) {
      sql += ` AND (${orClauses.join(' OR ')})`;
    }

    sql += ` ORDER BY s.settlement_date ASC, s.created_at ASC`;
    const res = await this.db.query(sql, params);
    return res.rows || [];
  }

  async findAll(status?: string, companyCode?: string) {
    let sql = `
      SELECT s.*, t.trip_no, t.unloading_date, trk.truck_no, trk.owner_name,
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
    const querySql = `SELECT s.*, t.trip_no, t.unloading_date, trk.truck_no, trk.owner_name,
              d.name as destination_name, p.name as party_name, transp.name as transporter_name
       FROM settlements s
       JOIN trips t ON s.trip_id = t.id
       JOIN trucks trk ON t.truck_id = trk.id
       LEFT JOIN destinations d ON t.destination_id = d.id
       LEFT JOIN parties p ON t.party_id = p.id
       LEFT JOIN transporters transp ON t.transporter_id = transp.id
       WHERE s.id = ?`;

    const res = await this.db.query(querySql, [id]);
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
