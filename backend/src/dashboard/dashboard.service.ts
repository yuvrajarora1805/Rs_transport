import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class DashboardService {
  constructor(private db: DbService) {}

  async getKpis(companyCode?: string, user?: any) {
    const isManager = user?.role === 'MANAGER';
    const tripFilter = companyCode ? `WHERE company_code = '${companyCode}'` : 'WHERE 1=1';
    const dispatchFilter = companyCode ? `AND company_code = '${companyCode}'` : '';
    const settlementFilter = companyCode ? `WHERE company_code = '${companyCode}'` : '';
    const pendingFilter = companyCode ? `AND company_code = '${companyCode}'` : '';

    const managerDispatchDate = isManager ? 'AND DATE(date) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)' : '';
    const managerTripDate = isManager ? 'AND DATE(COALESCE(unloading_date, created_at)) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)' : '';

    const [counts, sums, pending] = await Promise.all([
      this.db.query(`
        SELECT
          ${isManager
            ? `(SELECT COUNT(DISTINCT truck_id) FROM dispatches WHERE is_cancelled = false ${dispatchFilter} ${managerDispatchDate})`
            : `(SELECT COUNT(*) FROM trucks WHERE is_active = true)`} as total_trucks,
          (SELECT COUNT(*) FROM dispatches WHERE is_cancelled = false ${dispatchFilter} ${managerDispatchDate}) as total_dispatches,
          (SELECT COUNT(*) FROM trips ${tripFilter} ${managerTripDate}) as total_trips
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
      totalGrossFreight: isManager ? 0 : Number(s.total_gross_freight || 0),
      totalDieselAmount: isManager ? 0 : Number(s.total_diesel_amount || 0),
      totalAdvances: isManager ? 0 : Number(s.total_advances || 0),
      totalCommission: isManager ? 0 : Number(s.total_commission || 0),
      totalNetPayable: isManager ? 0 : Number(s.total_net_payable || 0),
      totalPaymentsMade: isManager ? 0 : Number(s.total_payments_made || 0),
      totalOutstanding: isManager ? 0 : Number(s.total_outstanding || 0),
      pendingSettlements: isManager ? 0 : Number(p.pending_count || 0),
    };
  }

  async getRecentActivity(companyCode?: string, user?: any) {
    const isManager = user?.role === 'MANAGER';
    const dFilter = companyCode ? `WHERE d.company_code = '${companyCode}'` : 'WHERE 1=1';
    const tFilter = companyCode ? `WHERE tr.company_code = '${companyCode}'` : 'WHERE 1=1';
    const pFilter = companyCode ? `WHERE s.company_code = '${companyCode}'` : '';

    const managerD = isManager ? 'AND DATE(d.date) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)' : '';
    const managerT = isManager ? 'AND DATE(COALESCE(tr.unloading_date, tr.created_at)) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)' : '';

    const [dispatches, trips, payments] = await Promise.all([
      this.db.query(`
        SELECT d.*, t.truck_no, s.name as source_name
        FROM dispatches d
        JOIN trucks t ON d.truck_id = t.id
        JOIN sources s ON d.source_id = s.id
        ${dFilter} ${managerD}
        ORDER BY d.date DESC LIMIT 5
      `),
      this.db.query(`
        SELECT tr.*, t.truck_no, d.name as destination_name
        FROM trips tr
        JOIN trucks t ON tr.truck_id = t.id
        LEFT JOIN destinations d ON tr.destination_id = d.id
        ${tFilter} ${managerT}
        ORDER BY tr.created_at DESC LIMIT 5
      `),
      isManager
        ? Promise.resolve({ rows: [] })
        : this.db.query(`
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
