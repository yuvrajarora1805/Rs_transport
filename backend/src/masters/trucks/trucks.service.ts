import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TrucksService {
  constructor(private db: DbService) {}

  async create(dto: CreateTruckDto) {
    const normalizedNo = dto.truckNo.trim().toUpperCase().replace(/\s+/g, '');
    const check = await this.db.query('SELECT id FROM trucks WHERE truck_no = ?', [normalizedNo]);
    if (check.rows.length > 0) {
      throw new ConflictException(`Truck ${normalizedNo} already registered`);
    }

    const id = uuidv4();
    await this.db.query(
      `INSERT INTO trucks (id, truck_no, owner_name, mobile_no, truck_type, capacity, transporter_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        normalizedNo,
        dto.ownerName || null,
        dto.mobileNo || null,
        dto.truckType || null,
        dto.capacity || null,
        dto.transporterId || null,
      ],
    );

    return this.findOne(id);
  }

  async findAll(search?: string) {
    let sql = `
      SELECT t.*, tr.name as transporter_name
      FROM trucks t
      LEFT JOIN transporters tr ON t.transporter_id = tr.id
    `;
    const params: any[] = [];

    if (search) {
      sql += ` WHERE t.truck_no LIKE ? OR t.owner_name LIKE ? OR t.mobile_no LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY t.created_at DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async findOne(id: string) {
    const truckRes = await this.db.query(
      `SELECT t.*, tr.name as transporter_name
       FROM trucks t
       LEFT JOIN transporters tr ON t.transporter_id = tr.id
       WHERE t.id = ?`,
      [id],
    );
    if (truckRes.rows.length === 0) {
      throw new NotFoundException(`Truck ID ${id} not found`);
    }

    const [dispatches, trips, fuel] = await Promise.all([
      this.db.query(
        `SELECT d.*, s.name as source_name
         FROM dispatches d
         LEFT JOIN sources s ON d.source_id = s.id
         WHERE d.truck_id = ?
         ORDER BY d.date DESC LIMIT 30`,
        [id],
      ),
      this.db.query(
        `SELECT t.*, d.name as destination_name, p.name as party_name,
                s.id as settlement_id, s.status as settlement_status
         FROM trips t
         LEFT JOIN destinations d ON t.destination_id = d.id
         LEFT JOIN parties p ON t.party_id = p.id
         LEFT JOIN settlements s ON t.id = s.trip_id
         WHERE t.truck_id = ?
         ORDER BY t.created_at DESC LIMIT 30`,
        [id],
      ),
      this.db.query(
        `SELECT f.*, p.name as pump_name
         FROM fuel_transactions f
         LEFT JOIN pumps p ON f.pump_id = p.id
         WHERE f.truck_id = ?
         ORDER BY f.date DESC LIMIT 30`,
        [id],
      ),
    ]);

    return {
      ...truckRes.rows[0],
      dispatches: dispatches.rows,
      trips: trips.rows,
      fuelRecords: fuel.rows,
    };
  }

  async getRecentTare(truckId: string) {
    const res = await this.db.query(
      `SELECT tare_weight, unloading_date, trip_no, created_at 
       FROM trips 
       WHERE truck_id = ? AND tare_weight > 0 
       ORDER BY unloading_date DESC, created_at DESC 
       LIMIT 5`,
      [truckId],
    );
    return res.rows;
  }
}
