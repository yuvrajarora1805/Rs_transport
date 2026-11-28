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
        `SELECT id, sr_no AS ref_no, date AS record_date, material AS title, created_by, approval_status, created_at
         FROM dispatches WHERE approval_status = 'PENDING' ORDER BY created_at DESC`,
      ),
      this.db.query(
        `SELECT id, trip_no AS ref_no, unloading_date AS record_date, truck_id AS title, created_by, approval_status, created_at
         FROM trips WHERE approval_status = 'PENDING' ORDER BY created_at DESC`,
      ),
      this.db.query(
        `SELECT id, name AS ref_no, created_at AS record_date, name AS title, created_by, approval_status, created_at
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

  async getAlerts() {
    const [fuelWithoutDispatch, dispatchesWithoutFuel, pendingPumps] = await Promise.all([
      this.db.query(`
        SELECT f.id, f.date, f.amount, f.litres, t.truck_no
        FROM fuel_transactions f
        JOIN trucks t ON f.truck_id = t.id
        WHERE f.trip_id IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM dispatches d
            WHERE d.truck_id = f.truck_id
              AND d.is_cancelled = false
              AND ABS(DATEDIFF(DATE(d.date), DATE(f.date))) <= 2
          )
        ORDER BY f.date DESC LIMIT 50
      `),
      this.db.query(`
        SELECT d.id, d.date, d.sr_no, t.truck_no, s.name AS source_name
        FROM dispatches d
        JOIN trucks t ON d.truck_id = t.id
        JOIN sources s ON d.source_id = s.id
        WHERE d.is_cancelled = false
          AND NOT EXISTS (
            SELECT 1 FROM fuel_transactions f WHERE f.truck_id = d.truck_id AND DATE(f.date) >= DATE_SUB(DATE(d.date), INTERVAL 1 DAY)
          )
        ORDER BY d.date DESC LIMIT 50
      `),
      this.db.query(`
        SELECT p.id, p.name, COALESCE((SELECT balance FROM pump_ledger pl WHERE pl.pump_id = p.id ORDER BY pl.created_at DESC LIMIT 1), 0) AS balance
        FROM pumps p
        WHERE p.is_active = true
        HAVING balance > 0
      `),
    ]);

    return {
      fuelWithoutDispatch: fuelWithoutDispatch.rows,
      dispatchesWithoutFuel: dispatchesWithoutFuel.rows,
      pendingPumpSettlements: pendingPumps.rows,
    };
  }

  async getNotificationEmails() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS notification_emails (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const res = await this.db.query('SELECT id, email, created_at FROM notification_emails ORDER BY created_at DESC');
    return res.rows;
  }

  async addNotificationEmail(email: string) {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed) throw new BadRequestException('Email is required');
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS notification_emails (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const id = uuidv4();
    await this.db.query('INSERT IGNORE INTO notification_emails (id, email) VALUES (?, ?)', [id, trimmed]);
    return { success: true, id, email: trimmed };
  }

  async removeNotificationEmail(id: string) {
    await this.db.query('DELETE FROM notification_emails WHERE id = ?', [id]);
    return { success: true, id };
  }
}

