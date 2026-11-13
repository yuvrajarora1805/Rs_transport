import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class OutstandingService {
  constructor(private db: DbService) {}

  async getSummary() {
    const [trucks, transporters, parties, pumps] = await Promise.all([
      this.db.query(`
        SELECT trk.id as truck_id, trk.truck_no, trk.owner_name,
               COALESCE(SUM(s.outstanding), 0) as outstanding_amount,
               COUNT(s.id) as pending_settlements
        FROM settlements s
        JOIN trips t ON s.trip_id = t.id
        JOIN trucks trk ON t.truck_id = trk.id
        WHERE s.outstanding > 0
        GROUP BY trk.id, trk.truck_no, trk.owner_name
        ORDER BY outstanding_amount DESC
      `),
      this.db.query(`
        SELECT tr.id as transporter_id, tr.name as transporter_name,
               COALESCE(SUM(s.outstanding), 0) as outstanding_amount
        FROM settlements s
        JOIN trips t ON s.trip_id = t.id
        JOIN transporters tr ON t.transporter_id = tr.id
        WHERE s.outstanding > 0
        GROUP BY tr.id, tr.name
        ORDER BY outstanding_amount DESC
      `),
      this.db.query(`
        SELECT p.id as party_id, p.name as party_name,
               COALESCE(SUM(s.outstanding), 0) as outstanding_amount
        FROM settlements s
        JOIN trips t ON s.trip_id = t.id
        JOIN parties p ON t.party_id = p.id
        WHERE s.outstanding > 0
        GROUP BY p.id, p.name
        ORDER BY outstanding_amount DESC
      `),
      this.db.query(`
        SELECT p.id as pump_id, p.name as pump_name,
               (p.opening_balance + COALESCE(SUM(pl.debit), 0) - COALESCE(SUM(pl.credit), 0)) as pump_outstanding
        FROM pumps p
        LEFT JOIN pump_ledger pl ON p.id = pl.pump_id
        WHERE p.is_active = true
        GROUP BY p.id, p.name, p.opening_balance
        HAVING (p.opening_balance + COALESCE(SUM(pl.debit), 0) - COALESCE(SUM(pl.credit), 0)) > 0
        ORDER BY pump_outstanding DESC
      `),
    ]);

    return {
      truckOutstanding: trucks.rows,
      transporterOutstanding: transporters.rows,
      partyOutstanding: parties.rows,
      pumpOutstanding: pumps.rows,
    };
  }

  async getAgeingReport() {
    const res = await this.db.query(`
      SELECT
        s.id, s.settlement_date, s.net_payable, s.total_paid, s.outstanding,
        trk.truck_no, trk.owner_name, t.trip_no,
        DATEDIFF(CURRENT_DATE, s.settlement_date) as days_overdue,
        CASE
          WHEN DATEDIFF(CURRENT_DATE, s.settlement_date) <= 7 THEN '0-7 days'
          WHEN DATEDIFF(CURRENT_DATE, s.settlement_date) <= 15 THEN '8-15 days'
          WHEN DATEDIFF(CURRENT_DATE, s.settlement_date) <= 30 THEN '16-30 days'
          WHEN DATEDIFF(CURRENT_DATE, s.settlement_date) <= 60 THEN '31-60 days'
          ELSE '60+ days'
        END as ageing_bracket
      FROM settlements s
      JOIN trips t ON s.trip_id = t.id
      JOIN trucks trk ON t.truck_id = trk.id
      WHERE s.outstanding > 0
      ORDER BY s.settlement_date ASC
    `);

    const brackets: Record<string, any[]> = {
      '0-7 days': [],
      '8-15 days': [],
      '16-30 days': [],
      '31-60 days': [],
      '60+ days': [],
    };

    for (const row of res.rows as any[]) {
      if (brackets[row.ageing_bracket]) {
        brackets[row.ageing_bracket].push(row);
      }
    }

    return {
      brackets,
      allPending: res.rows,
    };
  }
}
