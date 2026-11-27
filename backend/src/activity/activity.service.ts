import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from '../db/db.service';

@Injectable()
export class ActivityService {
  constructor(private db: DbService) {}

  async logAction(
    user: { id?: string; username?: string; role?: string } | undefined,
    action: string,
    module: string,
    recordId?: string,
    details?: string,
  ) {
    if (!user || user.role !== 'MANAGER') return;
    try {
      await this.db.query(
        `INSERT INTO manager_activity_logs (id, user_id, username, action, module, record_id, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          user.id || 'unknown',
          user.username || 'manager',
          action,
          module,
          recordId || null,
          details || null,
        ],
      );
    } catch (_) {
      // Non-blocking audit log
    }
  }

  async getLogs(limit = 100) {
    const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
    const res = await this.db.query(
      `SELECT id, user_id, username, action, module, record_id, details, created_at
       FROM manager_activity_logs
       ORDER BY created_at DESC
       LIMIT ${safeLimit}`,
    );
    return res.rows;
  }

  async getPendingApprovals() {
    const [dispatches, trips, sources] = await Promise.all([
      this.db.query(
        `SELECT id, dispatch_no AS ref_no, dispatch_date AS record_date, material AS title, created_by, approval_status, created_at
         FROM dispatches WHERE approval_status = 'PENDING' ORDER BY created_at DESC`,
      ),
      this.db.query(
        `SELECT id, trip_no AS ref_no, trip_date AS record_date, truck_no AS title, created_by, approval_status, created_at
         FROM trips WHERE approval_status = 'PENDING' ORDER BY created_at DESC`,
      ),
      this.db.query(
        `SELECT id, code AS ref_no, created_at AS record_date, name AS title, created_by, approval_status, created_at
         FROM sources WHERE approval_status = 'PENDING' ORDER BY created_at DESC`,
      ),
    ]);

    return {
      dispatches: dispatches.rows.map((r) => ({ ...r, module: 'dispatches' })),
      trips: trips.rows.map((r) => ({ ...r, module: 'trips' })),
      sources: sources.rows.map((r) => ({ ...r, module: 'sources' })),
      totalPending:
        dispatches.rows.length + trips.rows.length + sources.rows.length,
    };
  }

  private getTableForModule(module: string): string {
    if (module === 'dispatches') return 'dispatches';
    if (module === 'trips') return 'trips';
    if (module === 'sources') return 'sources';
    throw new BadRequestException(`Unsupported approval module: ${module}`);
  }

  async approveRecord(module: string, id: string, adminUser: any) {
    const table = this.getTableForModule(module);
    await this.db.query(
      `UPDATE ${table}
       SET approval_status = 'APPROVED', approved_by = ?, approved_at = NOW(), rejection_reason = NULL
       WHERE id = ?`,
      [adminUser?.id || 'admin', id],
    );
    return { success: true, module, id, status: 'APPROVED' };
  }

  async rejectRecord(module: string, id: string, adminUser: any, reason?: string) {
    const table = this.getTableForModule(module);
    await this.db.query(
      `UPDATE ${table}
       SET approval_status = 'REJECTED', approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [adminUser?.id || 'admin', reason || 'Rejected by Admin', id],
    );
    return { success: true, module, id, status: 'REJECTED' };
  }
}

