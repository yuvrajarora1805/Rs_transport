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
      SELECT p.*, d.name as destination_name, COUNT(t.id) as trip_count
      FROM parties p
      LEFT JOIN destinations d ON p.destination_id = d.id
      LEFT JOIN trips t ON p.id = t.party_id
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
              s.id as settlement_id, s.status as settlement_status
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
