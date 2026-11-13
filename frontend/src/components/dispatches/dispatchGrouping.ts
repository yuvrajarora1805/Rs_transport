import { Dispatch } from '../../types';

export interface DispatchTruckItem {
  id: string;
  truckId: string;
  truckNo: string;
  bales: number;
  mobileNo: string;
  slipImage?: string;
  tripId?: string;
  tripNo?: string;
  loadedWeight?: number;
  subTripNo: string;
  raw: Dispatch;
}

export interface GroupedDispatchOrder {
  id: string;
  orderKey: string;
  date: string;
  srNo: string;
  sourceId: string;
  sourceName: string;
  destination: string;
  material: string;
  remarks?: string;
  totalBales: number;
  trucks: DispatchTruckItem[];
}

export function groupDispatchesByOrder(dispatches: Dispatch[]): GroupedDispatchOrder[] {
  const groups: Record<string, GroupedDispatchOrder> = {};

  for (const d of dispatches) {
    const sr = (d.srNo || (d as any).sr_no || '').trim();
    const dateStr = (d.date || '').split('T')[0];
    const srcId = d.sourceId || (d as any).source_id || '';
    const dest = (d.destination || '').trim();

    // Group dispatches that share the same date, SR number, and source
    const key = sr
      ? `${dateStr}_${sr}_${srcId}_${dest}`
      : `single_${d.id}`;

    if (!groups[key]) {
      groups[key] = {
        id: d.id,
        orderKey: key,
        date: d.date,
        srNo: sr,
        sourceId: srcId,
        sourceName: d.source?.name || (d as any).source_name || '-',
        destination: dest,
        material: (d as any).material || 'Cotton Bales',
        remarks: d.remarks || (d as any).remarks,
        totalBales: 0,
        trucks: [],
      };
    }

    const tId = d.truckId || (d as any).truck_id || '';
    const tNo = d.truck?.truckNo || (d as any).truck_no || '-';
    const bales = Number(d.bales || (d as any).bales || 0);
    const mobile = (d as any).mobile_no || (d as any).driver_mobile || d.truck?.mobileNo || '';

    groups[key].totalBales += bales;
    groups[key].trucks.push({
      id: d.id,
      truckId: tId,
      truckNo: tNo,
      bales,
      mobileNo: mobile,
      slipImage: (d as any).slip_image,
      tripId: (d as any).trip_id,
      tripNo: (d as any).trip_no,
      loadedWeight: (d as any).loaded_weight,
      subTripNo: sr || 'TRIP',
      raw: d,
    });
  }

  // Assign smart sub-trip numbers: if multiple trucks in order, name 10012-A, 10012-B...
  return Object.values(groups).map((group) => {
    if (group.trucks.length > 1 && group.srNo) {
      group.trucks.forEach((truck, idx) => {
        const letter = String.fromCharCode(65 + idx);
        truck.subTripNo = `${group.srNo}-${letter}`;
      });
    }
    return group;
  });
}

