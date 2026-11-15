import { Injectable, ConflictException, OnModuleInit } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransportersService implements OnModuleInit {
  constructor(private db: DbService) {}

  async onModuleInit() {
    try {
      // Self-healing: link historical trips with NULL transporter_id to matching transporter via company_code
      await this.db.query(`
        UPDATE trips trp
        JOIN transporters tr ON (
          REPLACE(REPLACE(UPPER(tr.name), '.', ''), ' ', '_') = trp.company_code
        )
        SET trp.transporter_id = tr.id
        WHERE trp.transporter_id IS NULL
      `);
    } catch (err) {
      console.warn('Transporter self-healing note:', err);
    }
  }

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
    const transportersRes = await this.db.query(
      'SELECT * FROM transporters WHERE is_active = true ORDER BY name ASC',
    );
    const transporters = transportersRes.rows || [];
    if (transporters.length === 0) return [];

    try {
      const truckCountsRes = await this.db.query(`
        SELECT transporter_id, COUNT(DISTINCT truck_id) as count
        FROM (
          SELECT id as truck_id, transporter_id FROM trucks WHERE transporter_id IS NOT NULL
          UNION
          SELECT t.truck_id, COALESCE(t.transporter_id, tr.id) as transporter_id
          FROM trips t
          LEFT JOIN transporters tr ON REPLACE(REPLACE(UPPER(tr.name), '.', ''), ' ', '_') = t.company_code
          WHERE t.transporter_id IS NOT NULL OR t.company_code IS NOT NULL
        ) combined
        WHERE transporter_id IS NOT NULL
        GROUP BY transporter_id
      `);

      const countMap = new Map<string, number>();
      for (const row of truckCountsRes.rows || []) {
        countMap.set(row.transporter_id, Number(row.count || 0));
      }

      return transporters.map((tr: any) => ({
        ...tr,
        truck_count: countMap.get(tr.id) || 0,
      }));
    } catch (err) {
      console.warn('Transporter truck count query fallback:', err);
      return transporters.map((tr: any) => ({ ...tr, truck_count: 0 }));
    }
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
