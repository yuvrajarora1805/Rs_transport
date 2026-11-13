import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DispatchesService {
  constructor(private db: DbService) {}

  async create(dto: CreateDispatchDto) {
    const truck = await this.db.query('SELECT id FROM trucks WHERE id = ?', [dto.truckId]);
    if (truck.rows.length === 0) {
      throw new NotFoundException(`Truck with ID ${dto.truckId} not found`);
    }

    const id = uuidv4();
    const companyCode = dto.companyCode || 'RS_TRANSPORT';
    const insertSql = `INSERT INTO dispatches (id, sr_no, date, truck_id, source_id, bales, destination, remarks, driver_mobile, company_code, slip_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertParams = [
      id,
      dto.srNo || null,
      new Date(dto.date),
      dto.truckId,
      dto.sourceId,
      dto.bales || null,
      dto.destination || null,
      dto.remarks || null,
      dto.driverMobile || null,
      companyCode,
      dto.slipImage || null,
    ];

    try {
      await this.db.query(insertSql, insertParams);
    } catch (err: any) {
      if (err?.code === 'ER_BAD_FIELD_ERROR' || err?.message?.includes('Unknown column')) {
        try {
          await this.db.rawQuery("ALTER TABLE dispatches ADD COLUMN company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT'");
          await this.db.rawQuery('ALTER TABLE dispatches ADD COLUMN driver_mobile VARCHAR(20) NULL');
          await this.db.rawQuery('ALTER TABLE dispatches ADD COLUMN slip_image LONGTEXT NULL');
          await this.db.query(insertSql, insertParams);
        } catch {
          await this.db.query(
            `INSERT INTO dispatches (id, sr_no, date, truck_id, source_id, bales, destination, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              dto.srNo || null,
              new Date(dto.date),
              dto.truckId,
              dto.sourceId,
              dto.bales || null,
              dto.destination || null,
              dto.remarks || null,
            ],
          );
        }
      } else {
        throw err;
      }
    }

    const res = await this.db.query(
      `SELECT d.*, t.truck_no, s.name as source_name,
              COALESCE(d.driver_mobile, t.mobile_no) as mobile_no
       FROM dispatches d
       JOIN trucks t ON d.truck_id = t.id
       JOIN sources s ON d.source_id = s.id
       WHERE d.id = ?`,
      [id],
    );
    return res.rows[0];
  }

  async createMultiple(dtos: CreateDispatchDto[]) {
    const results = [];
    for (const dto of dtos) {
      const created = await this.create(dto);
      results.push(created);
    }
    return results;
  }

  async findAll(sourceId?: string, truckId?: string, companyCode?: string) {
    let sql = `
      SELECT d.*, t.truck_no, t.owner_name, 
             COALESCE(d.driver_mobile, t.mobile_no) as mobile_no, 
             s.name as source_name,
             trp.id as trip_id,
             trp.trip_no,
             trp.net_weight as loaded_weight
      FROM dispatches d
      JOIN trucks t ON d.truck_id = t.id
      JOIN sources s ON d.source_id = s.id
      LEFT JOIN trips trp ON trp.dispatch_id = d.id
      WHERE d.is_cancelled = false
    `;
    const params: any[] = [];

    if (sourceId) {
      params.push(sourceId);
      sql += ` AND d.source_id = ?`;
    }
    if (truckId) {
      params.push(truckId);
      sql += ` AND d.truck_id = ?`;
    }
    if (companyCode && companyCode !== 'ALL') {
      params.push(companyCode);
      sql += ` AND d.company_code = ?`;
    }

    sql += ` ORDER BY d.date DESC, d.created_at DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async remove(id: string) {
    const dispatch = await this.db.query('SELECT * FROM dispatches WHERE id = ?', [id]);
    if (dispatch.rows.length === 0) {
      throw new NotFoundException(`Dispatch ${id} not found`);
    }
    // Hard delete or cancel dispatch
    await this.db.query('DELETE FROM dispatches WHERE id = ?', [id]);
    return { success: true, message: 'Dispatch entry deleted' };
  }
}
