import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private db: DbService) {}

  async create(dto: CreatePaymentDto) {
    const setRes = await this.db.query('SELECT * FROM settlements WHERE id = ?', [dto.settlementId]);
    if (setRes.rows.length === 0) {
      throw new NotFoundException(`Settlement ID ${dto.settlementId} not found`);
    }
    const settlement = setRes.rows[0] as any;

    const payAmount = new Decimal(dto.amount);
    const outstanding = new Decimal(settlement.outstanding);

    if (payAmount.gt(outstanding)) {
      throw new BadRequestException(
        `Payment amount (₹${payAmount}) exceeds current outstanding (₹${outstanding})`,
      );
    }

    const paymentId = uuidv4();

    return this.db.transaction(async (conn) => {
      // 1. Insert Payment
      await conn.execute(
        `INSERT INTO payments (id, settlement_id, payment_date, amount, method, ref_no, paid_to, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentId,
          dto.settlementId,
          new Date(dto.paymentDate),
          payAmount.toNumber(),
          dto.method || 'BANK_TRANSFER',
          dto.refNo || null,
          dto.paidTo || null,
          dto.remarks || null,
        ],
      );

      // 2. Recalculate settlement
      const newTotalPaid = new Decimal(settlement.total_paid).add(payAmount);
      const newOutstanding = outstanding.sub(payAmount);
      const newStatus = newOutstanding.isZero() ? 'PAID' : 'PARTIALLY_PAID';

      await conn.execute(
        `UPDATE settlements
         SET total_paid = ?, outstanding = ?, status = ?
         WHERE id = ?`,
        [newTotalPaid.toNumber(), newOutstanding.toNumber(), newStatus, dto.settlementId],
      );

      return { id: paymentId, amount: payAmount.toNumber(), status: newStatus };
    });
  }

  async findAll(settlementId?: string) {
    let sql = `
      SELECT p.*, s.net_payable, s.outstanding, trk.truck_no, trk.owner_name
      FROM payments p
      JOIN settlements s ON p.settlement_id = s.id
      JOIN trips t ON s.trip_id = t.id
      JOIN trucks trk ON t.truck_id = trk.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (settlementId) {
      params.push(settlementId);
      sql += ` AND p.settlement_id = ?`;
    }

    sql += ` ORDER BY p.payment_date DESC`;
    const res = await this.db.query(sql, params);
    return res.rows;
  }
}
