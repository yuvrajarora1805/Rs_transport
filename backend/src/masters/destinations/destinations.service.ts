import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DestinationsService {
  constructor(private db: DbService) {}

  async create(dto: CreateDestinationDto) {
    const check = await this.db.query('SELECT id FROM destinations WHERE name = ?', [dto.name]);
    if (check.rows.length > 0) {
      throw new ConflictException(`Destination "${dto.name}" already exists`);
    }

    const id = uuidv4();
    await this.db.query(
      'INSERT INTO destinations (id, name, state) VALUES (?, ?, ?)',
      [id, dto.name, dto.state || null],
    );
    return { id, name: dto.name, state: dto.state || null };
  }

  async findAll() {
    const res = await this.db.query(`
      SELECT d.*, 
             COUNT(DISTINCT t.id) as trip_count,
             COUNT(DISTINCT p.id) as party_count
      FROM destinations d
      LEFT JOIN trips t ON d.id = t.destination_id
      LEFT JOIN parties p ON d.id = p.destination_id
      WHERE d.is_active = true
      GROUP BY d.id, d.name, d.state, d.is_active, d.created_at
      ORDER BY d.name ASC
    `);
    return res.rows;
  }

  async findOne(id: string) {
    const dest = await this.db.query('SELECT * FROM destinations WHERE id = ?', [id]);
    if (dest.rows.length === 0) {
      throw new NotFoundException(`Destination ID ${id} not found`);
    }

    const [parties, trips] = await Promise.all([
      this.db.query('SELECT * FROM parties WHERE destination_id = ? AND is_active = true ORDER BY name ASC', [id]),
      this.db.query(
        `SELECT t.*, trk.truck_no, trk.owner_name, p.name as party_name
         FROM trips t
         JOIN trucks trk ON t.truck_id = trk.id
         LEFT JOIN parties p ON t.party_id = p.id
         WHERE t.destination_id = ?
         ORDER BY t.created_at DESC LIMIT 50`,
        [id],
      ),
    ]);

    return {
      ...dest.rows[0],
      parties: parties.rows,
      trips: trips.rows,
    };
  }
}
