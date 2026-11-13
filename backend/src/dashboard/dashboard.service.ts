import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class DashboardService {
  constructor(private db: DbService) {}

  async getKpis(companyCode?: string) {
    const tripFilter = companyCode ? `WHERE company_code = '${companyCode}'` : '';
    const dispatchFilter = companyCode ? `AND company_code = '${companyCode}'` : '';
    const settlementFilter = companyCode ? `WHERE company_code = '${companyCode}'` : '';
    const pendingFilter = companyCode ? `AND company_code = '${companyCode}'` : '';

    const [counts, sums, pending] = await Promise.all([
      this.db.query(`
        SELECT
          (SELECT COUNT(*) FROM trucks WHERE is_active = true) as total_trucks,
          (SELECT COUNT(*) FROM dispatches WHERE is_cancelled = false ${dispatchFilter}) as total_dispatches,
          (SELECT COUNT(*) FROM trips ${tripFilter}) as total_trips
      `),
      this.db.query(`
        SELECT
          COALESCE(SUM(gross_freight), 0) as total_gross_freight,
          COALESCE(SUM(diesel_amount), 0) as total_diesel_amount,
          COALESCE(SUM(advance_amount), 0) as total_advances,
          COALESCE(SUM(commission), 0) as total_commission,
          COALESCE(SUM(net_payable), 0) as total_net_payable,
          COALESCE(SUM(total_paid), 0) as total_payments_made,
          COALESCE(SUM(outstanding), 0) as total_outstanding
        FROM settlements
        ${settlementFilter}
      `),
      this.db.query(`
        SELECT COUNT(*) as pending_count
        FROM settlements
        WHERE status != 'PAID' ${pendingFilter}
      `),
    ]);

    const c: any = counts.rows[0] || {};
    const s: any = sums.rows[0] || {};
    const p: any = pending.rows[0] || {};

    return {
      totalRegisteredTrucks: Number(c.total_trucks || 0),
      totalDispatches: Number(c.total_dispatches || 0),
      totalTrips: Number(c.total_trips || 0),
      totalGrossFreight: Number(s.total_gross_freight || 0),
      totalDieselAmount: Number(s.total_diesel_amount || 0),
      totalAdvances: Number(s.total_advances || 0),
      totalCommission: Number(s.total_commission || 0),
      totalNetPayable: Number(s.total_net_payable || 0),
      totalPaymentsMade: Number(s.total_payments_made || 0),
      totalOutstanding: Number(s.total_outstanding || 0),
      pendingSettlements: Number(p.pending_count || 0),
    };
  }

  async getRecentActivity(companyCode?: string) {
    const dFilter = companyCode ? `WHERE d.company_code = '${companyCode}'` : '';
    const tFilter = companyCode ? `WHERE tr.company_code = '${companyCode}'` : '';
    const pFilter = companyCode ? `WHERE s.company_code = '${companyCode}'` : '';

    const [dispatches, trips, payments] = await Promise.all([
      this.db.query(`
        SELECT d.*, t.truck_no, s.name as source_name
        FROM dispatches d
        JOIN trucks t ON d.truck_id = t.id
        JOIN sources s ON d.source_id = s.id
        ${dFilter}
        ORDER BY d.date DESC LIMIT 5
      `),
      this.db.query(`
        SELECT tr.*, t.truck_no, d.name as destination_name
        FROM trips tr
        JOIN trucks t ON tr.truck_id = t.id
        LEFT JOIN destinations d ON tr.destination_id = d.id
        ${tFilter}
        ORDER BY tr.created_at DESC LIMIT 5
      `),
      this.db.query(`
        SELECT p.*, trk.truck_no
        FROM payments p
        JOIN settlements s ON p.settlement_id = s.id
        JOIN trips t ON s.trip_id = t.id
        JOIN trucks trk ON t.truck_id = trk.id
        ${pFilter}
        ORDER BY p.payment_date DESC LIMIT 5
      `),
    ]);

    return {
      recentDispatches: dispatches.rows,
      recentTrips: trips.rows,
      recentPayments: payments.rows,
    };
  }
}
