import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PartiesService {
  constructor(private db: DbService) {}

  async create(dto: CreatePartyDto) {
    const check = await this.db.query('SELECT id FROM parties WHERE name = ?', [dto.name]);
    if (check.rows.length > 0) {
      throw new ConflictException(`Party "${dto.name}" already exists`);
    }

    const id = uuidv4();
    await this.db.query(
      'INSERT INTO parties (id, name, contact_no, destination_id) VALUES (?, ?, ?, ?)',
      [id, dto.name, dto.contactNo || null, dto.destinationId || null],
    );
    return { id, name: dto.name, contact_no: dto.contactNo || null, destination_id: dto.destinationId || null };
  }

  async findAll(destinationId?: string) {
    let sql = `
      SELECT p.*, d.name as destination_name, COUNT(t.id) as trip_count,
             COALESCE(SUM(s.gross_freight), 0) as total_gross,
             COALESCE(SUM(s.total_paid), 0) as total_paid,
             COALESCE(SUM(s.outstanding), 0) as total_outstanding
      FROM parties p
      LEFT JOIN destinations d ON p.destination_id = d.id
      LEFT JOIN trips t ON p.id = t.party_id
      LEFT JOIN settlements s ON t.id = s.trip_id
      WHERE p.is_active = true
    `;
    const params: any[] = [];
    if (destinationId) {
      sql += ` AND (p.destination_id = ? OR p.destination_id IS NULL)`;
      params.push(destinationId);
    }
    sql += `
      GROUP BY p.id, p.name, p.contact_no, p.destination_id, p.is_active, p.created_at, d.name
      ORDER BY p.name ASC
    `;
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async getPartyPendingPayments(partyId?: string) {
    let sql = `
      SELECT 
        p.id as party_id, p.name as party_name,
        d.name as destination_name,
        t.id as trip_id, t.trip_no, t.unloading_date,
        trk.truck_no, trk.owner_name,
        t.net_weight, t.rate_per_unit,
        s.id as settlement_id,
        COALESCE(s.gross_freight, t.gross_freight) as gross_freight,
        COALESCE(s.diesel_amount, 0) as diesel_amount,
        COALESCE(s.advance_amount, 0) as advance_amount,
        COALESCE(s.commission, 0) as commission,
        COALESCE(s.net_payable, 0) as net_payable,
        COALESCE(s.total_paid, 0) as total_paid,
        COALESCE(s.outstanding, 0) as outstanding,
        s.status as settlement_status
      FROM trips t
      JOIN parties p ON t.party_id = p.id
      JOIN trucks trk ON t.truck_id = trk.id
      LEFT JOIN destinations d ON t.destination_id = d.id
      LEFT JOIN settlements s ON t.id = s.trip_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (partyId && partyId !== 'ALL') {
      sql += ` AND p.id = ?`;
      params.push(partyId);
    }
    sql += ` ORDER BY s.outstanding DESC, t.created_at DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async findOne(id: string) {
    const partyRes = await this.db.query(
      `SELECT p.*, d.name as destination_name
       FROM parties p
       LEFT JOIN destinations d ON p.destination_id = d.id
       WHERE p.id = ?`,
      [id],
    );
    if (partyRes.rows.length === 0) {
      throw new NotFoundException(`Party ID ${id} not found`);
    }

    const tripsRes = await this.db.query(
      `SELECT t.*, trk.truck_no, trk.owner_name, d.name as destination_name,
              s.id as settlement_id, s.status as settlement_status,
              s.gross_freight as billed_freight, s.diesel_amount, s.advance_amount,
              s.net_payable, s.total_paid, s.outstanding
       FROM trips t
       JOIN trucks trk ON t.truck_id = trk.id
       LEFT JOIN destinations d ON t.destination_id = d.id
       LEFT JOIN settlements s ON t.id = s.trip_id
       WHERE t.party_id = ?
       ORDER BY t.created_at DESC`,
      [id],
    );

    return {
      ...partyRes.rows[0],
      trips: tripsRes.rows,
    };
  }
}
