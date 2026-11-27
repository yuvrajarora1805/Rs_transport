import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { ActivityService } from '../../activity/activity.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SourcesService {
  constructor(
    private db: DbService,
    private activityService: ActivityService,
  ) {}

  async create(dto: CreateSourceDto, user?: any) {
    const check = await this.db.query('SELECT id FROM sources WHERE name = ?', [dto.name]);
    if (check.rows.length > 0) {
      throw new ConflictException(`Source "${dto.name}" already exists`);
    }

    const id = uuidv4();
    const approvalStatus = user?.role === 'MANAGER' ? 'PENDING' : 'APPROVED';
    const createdBy = user?.id || null;
    await this.db.query(
      'INSERT INTO sources (id, name, contact_no, approval_status, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, dto.name, dto.contactNo || null, approvalStatus, createdBy],
    );
    await this.activityService.logAction(user, 'CREATE', 'sources', id, `Created source: ${dto.name}`);
    return { id, name: dto.name, contact_no: dto.contactNo || null, approval_status: approvalStatus };
  }

  async findAll(companyCode?: string, user?: any) {
    await this.activityService.logAction(user, 'VIEW', 'sources', undefined, 'Viewed Source Master list');
    const dispatchFilter = companyCode ? `AND d.company_code = '${companyCode}'` : '';
    const managerDateFilter = user?.role === 'MANAGER' ? 'AND DATE(d.date) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)' : '';
    const res = await this.db.query(`
      SELECT s.*,
             COUNT(CASE WHEN d.is_cancelled = false ${dispatchFilter} ${managerDateFilter} THEN d.id END) as dispatch_count,
             COUNT(CASE WHEN d.is_cancelled = false ${managerDateFilter} THEN d.id END) as total_dispatch_count
      FROM sources s
      LEFT JOIN dispatches d ON s.id = d.source_id
      WHERE s.is_active = true AND COALESCE(s.approval_status, 'APPROVED') = 'APPROVED'
      GROUP BY s.id, s.name, s.contact_no, s.is_active, s.created_at
      ORDER BY s.name ASC
    `);
    return res.rows;
  }

  async findOne(id: string, companyCode?: string) {
    const source = await this.db.query('SELECT * FROM sources WHERE id = ?', [id]);
    if (source.rows.length === 0) {
      throw new NotFoundException(`Source ID ${id} not found`);
    }

    const dispatchFilter = companyCode && companyCode !== 'ALL' ? `AND d.company_code = '${companyCode}'` : '';
    const dispatches = await this.db.query(
      `SELECT d.*, trk.truck_no, trk.owner_name
       FROM dispatches d
       JOIN trucks trk ON d.truck_id = trk.id
       WHERE d.source_id = ? AND d.is_cancelled = false ${dispatchFilter}
       ORDER BY d.date DESC LIMIT 100`,
      [id],
    );

    return {
      ...source.rows[0],
      dispatches: dispatches.rows,
    };
  }
}
