import { Injectable, ConflictException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransportersService {
  constructor(private db: DbService) {}

  async create(dto: CreateTransporterDto) {
    const check = await this.db.query('SELECT id FROM transporters WHERE name = ?', [dto.name]);
    if (check.rows.length > 0) {
      throw new ConflictException(`Transporter "${dto.name}" already exists`);
    }

    const id = uuidv4();
    await this.db.query(
      'INSERT INTO transporters (id, name, contact_no, address) VALUES (?, ?, ?, ?)',
      [id, dto.name, dto.contactNo || null, dto.address || null],
    );
    return { id, name: dto.name, contact_no: dto.contactNo || null, address: dto.address || null };
  }

  async findAll() {
    const res = await this.db.query(`
      SELECT tr.*, COUNT(t.id) as truck_count
      FROM transporters tr
      LEFT JOIN trucks t ON tr.id = t.transporter_id
      WHERE tr.is_active = true
      GROUP BY tr.id, tr.name, tr.contact_no, tr.address, tr.is_active, tr.created_at
      ORDER BY tr.name ASC
    `);
    return res.rows;
  }

  async remove(id: string) {
    const check = await this.db.query('SELECT COUNT(*) as trip_count FROM trips WHERE transporter_id = ?', [id]);
    if (Number(check.rows[0]?.trip_count || 0) > 0) {
      throw new ConflictException(`Cannot delete transporter because it is linked to ${check.rows[0].trip_count} trip(s)`);
    }
    await this.db.query('DELETE FROM transporters WHERE id = ?', [id]);
    return { success: true };
  }
}
