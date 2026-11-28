import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PumpsService {
  constructor(private db: DbService) {}

  async create(dto: CreatePumpDto) {
    const check = await this.db.query('SELECT id FROM pumps WHERE name = ?', [dto.name]);
    if (check.rows.length > 0) {
      throw new ConflictException(`Pump "${dto.name}" already exists`);
    }

    const id = uuidv4();
    await this.db.query(
      `INSERT INTO pumps (id, name, contact_no, address, opening_balance)
       VALUES (?, ?, ?, ?, ?)`,
      [id, dto.name, dto.contactNo || null, dto.address || null, dto.openingBalance || 0],
    );
    return this.findOne(id);
  }

  async findAll() {
    const res = await this.db.query(`
      SELECT p.*,
        COALESCE(SUM(pl.debit), 0) as total_fuel,
        COALESCE(SUM(pl.credit), 0) as total_paid,
        (p.opening_balance + COALESCE(SUM(pl.debit), 0) - COALESCE(SUM(pl.credit), 0)) as current_balance
      FROM pumps p
      LEFT JOIN pump_ledger pl ON p.id = pl.pump_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.contact_no, p.address, p.opening_balance, p.is_active, p.created_at
      ORDER BY p.name ASC
    `);
    return res.rows;
  }

  async findOne(id: string) {
    const pumpRes = await this.db.query('SELECT * FROM pumps WHERE id = ?', [id]);
    if (pumpRes.rows.length === 0) {
      throw new NotFoundException(`Pump ID ${id} not found`);
    }

    const [fuel, payments, ledger] = await Promise.all([
      this.db.query(
        `SELECT f.*, t.truck_no FROM fuel_transactions f
         JOIN trucks t ON f.truck_id = t.id
         WHERE f.pump_id = ? ORDER BY f.date DESC LIMIT 20`,
        [id],
      ),
      this.db.query('SELECT * FROM pump_payments WHERE pump_id = ? ORDER BY date DESC LIMIT 20', [id]),
      this.db.query('SELECT * FROM pump_ledger WHERE pump_id = ? ORDER BY date DESC, created_at DESC LIMIT 20', [id]),
    ]);

    return {
      ...pumpRes.rows[0],
      fuelRecords: fuel.rows,
      pumpPayments: payments.rows,
      ledgerEntries: ledger.rows,
    };
  }

  async settlePump(id: string, body: { amount: number; date?: string; description?: string }) {
    const lastBalRes = await this.db.query(
      'SELECT balance FROM pump_ledger WHERE pump_id = ? ORDER BY created_at DESC LIMIT 1',
      [id],
    );
    const currBal = lastBalRes.rows.length > 0 ? Number((lastBalRes.rows[0] as any).balance) : 0;
    const amt = Number(body.amount || 0);
    const newBal = currBal - amt;
    await this.db.query(
      `INSERT INTO pump_ledger (id, pump_id, date, description, debit, credit, balance)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      [
        uuidv4(),
        id,
        body.date ? new Date(body.date) : new Date(),
        body.description || 'Pump Payment Settlement',
        amt,
        newBal,
      ],
    );
    return { success: true, pumpId: id, amount: amt, newBalance: newBal };
  }
}
