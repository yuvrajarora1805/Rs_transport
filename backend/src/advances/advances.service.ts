import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdvancesService {
  constructor(private db: DbService) {}

  async create(dto: CreateAdvanceDto) {
    const truck = await this.db.query('SELECT id FROM trucks WHERE id = ?', [dto.truckId]);
    if (truck.rows.length === 0) {
      throw new NotFoundException(`Truck ID ${dto.truckId} not found`);
    }

    const id = uuidv4();
    await this.db.query(
      `INSERT INTO advances (id, date, truck_id, trip_id, amount, method, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        new Date(dto.date),
        dto.truckId,
        dto.tripId || null,
        dto.amount,
        dto.method || 'CASH',
        dto.remarks || null,
      ],
    );
    return { id, amount: dto.amount, truckId: dto.truckId };
  }

  async findAll(truckId?: string, tripId?: string) {
    let sql = `
      SELECT a.*, t.truck_no, t.owner_name, tr.trip_no
      FROM advances a
      JOIN trucks t ON a.truck_id = t.id
      LEFT JOIN trips tr ON a.trip_id = tr.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (truckId) {
      params.push(truckId);
      sql += ` AND a.truck_id = ?`;
    }
    if (tripId) {
      params.push(tripId);
      sql += ` AND a.trip_id = ?`;
    }

    sql += ` ORDER BY a.date DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }
}
