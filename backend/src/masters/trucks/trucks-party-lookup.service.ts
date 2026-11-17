import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

export interface TruckPartyGroup {
  truckNo: string;
  totalTrips: number;
  totalGrossFreight: number;
  totalPaid: number;
  totalOutstanding: number;
  parties: {
    partyName: string;
    tripsCount: number;
    destinationName: string;
    totalWeight: number;
    grossFreight: number;
    dieselAmount: number;
    advanceAmount: number;
    paidAmount: number;
    outstanding: number;
    trips: any[];
  }[];
}

@Injectable()
export class TrucksPartyLookupService {
  private readonly logger = new Logger(TrucksPartyLookupService.name);

  constructor(private db: DbService) {}

  async getTruckPartySummary(truckNo?: string): Promise<TruckPartyGroup[]> {
    let sql = `
      SELECT 
        trk.truck_no, trk.owner_name,
        COALESCE(p.name, 'Direct / Self') as party_name,
        COALESCE(d.name, '-') as destination_name,
        t.id as trip_id, 
        t.trip_no,
        t.unloading_date,
        COALESCE(t.net_weight, 0) as net_weight,
        COALESCE(t.rate_per_unit, 0) as rate_per_unit,
        s_settle.id as settlement_id,
        COALESCE(s_settle.gross_freight, t.gross_freight, 0) as gross_freight,
        COALESCE(s_settle.diesel_amount, 0) as diesel_amount,
        COALESCE(s_settle.advance_amount, 0) as advance_amount,
        COALESCE(s_settle.commission, 0) as commission,
        COALESCE(s_settle.net_payable, 0) as net_payable,
        COALESCE(s_settle.total_paid, 0) as total_paid,
        COALESCE(s_settle.outstanding, 0) as outstanding,
        s_settle.status as settlement_status
      FROM trucks trk
      JOIN trips t ON trk.id = t.truck_id
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN destinations d ON t.destination_id = d.id
      LEFT JOIN settlements s_settle ON t.id = s_settle.trip_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (truckNo && truckNo.trim()) {
      const cleanNo = truckNo.trim().toUpperCase().replace(/\s+/g, '');
      sql += ` AND trk.truck_no LIKE ?`;
      params.push(`%${cleanNo}%`);
    }
    sql += ` ORDER BY trk.truck_no ASC, party_name ASC, unloading_date DESC`;

    const res = await this.db.query(sql, params);
    const rows = res.rows as any[];

    const truckMap = new Map<string, Map<string, any>>();
    for (const r of rows) {
      const tNo = r.truck_no;
      const pName = r.party_name;

      if (!truckMap.has(tNo)) {
        truckMap.set(tNo, new Map<string, any>());
      }
      const pMap = truckMap.get(tNo)!;

      if (!pMap.has(pName)) {
        pMap.set(pName, {
          partyName: pName,
          tripsCount: 0,
          destinationName: r.destination_name,
          totalWeight: 0,
          grossFreight: 0,
          dieselAmount: 0,
          advanceAmount: 0,
          paidAmount: 0,
          outstanding: 0,
          trips: [],
        });
      }

      const pObj = pMap.get(pName)!;
      pObj.tripsCount += 1;
      pObj.totalWeight += Number(r.net_weight || 0);
      pObj.grossFreight += Number(r.gross_freight || 0);
      pObj.dieselAmount += Number(r.diesel_amount || 0);
      pObj.advanceAmount += Number(r.advance_amount || 0);
      pObj.paidAmount += Number(r.total_paid || 0);
      pObj.outstanding += Number(r.outstanding || 0);
      pObj.trips.push(r);
    }

    const result: TruckPartyGroup[] = [];
    for (const [tNo, pMap] of truckMap.entries()) {
      const partyList = Array.from(pMap.values()).sort((a, b) =>
        a.partyName.localeCompare(b.partyName),
      );
      const totalTrips = partyList.reduce((acc, p) => acc + p.tripsCount, 0);
      const totalGross = partyList.reduce((acc, p) => acc + p.grossFreight, 0);
      const totalPaid = partyList.reduce((acc, p) => acc + p.paidAmount, 0);
      const totalOut = partyList.reduce((acc, p) => acc + p.outstanding, 0);

      result.push({
        truckNo: tNo,
        totalTrips,
        totalGrossFreight: totalGross,
        totalPaid,
        totalOutstanding: totalOut,
        parties: partyList,
      });
    }

    return result;
  }
}
