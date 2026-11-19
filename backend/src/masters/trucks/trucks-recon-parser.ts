import * as ExcelJS from 'exceljs';

export interface ColumnMapping {
  truckCol?: number;
  dateCol?: number;
  balesCol?: number;
  destCol?: number;
  contactCol?: number;
}

export function isIndianTruckNo(val: string): boolean {
  const clean = val.toUpperCase().replace(/[\s\-\.]+/g, '');
  return /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{3,4}$/.test(clean);
}

export function extractNum(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'object' && val.result !== undefined) {
    const num = Number(val.result);
    return isNaN(num) ? 0 : num;
  }
  const clean = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export function extractStr(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object' && val.result !== undefined) {
    return String(val.result).trim();
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val).trim();
}

export function detectColumnIndices(ws: ExcelJS.Worksheet, manualMapping?: ColumnMapping) {
  let truckColIdx = manualMapping?.truckCol ?? -1;
  let dateColIdx = manualMapping?.dateCol ?? -1;
  let balesColIdx = manualMapping?.balesCol ?? -1;
  let destColIdx = manualMapping?.destCol ?? -1;
  let contactColIdx = manualMapping?.contactCol ?? -1;
  let sourceColIdx = -1;
  let weightColIdx = -1;
  let freightColIdx = -1;
  let dieselColIdx = -1;
  let paidColIdx = -1;
  let pendingColIdx = -1;
  let slipColIdx = -1;
  let headerRowIdx = 1;

  for (let scanR = 1; scanR <= Math.min(5, ws.rowCount); scanR++) {
    const row = ws.getRow(scanR);
    const maxCols = Math.min(45, ws.columnCount || 38);
    for (let col = 1; col <= maxCols; col++) {
      const val = String(row.getCell(col).value || '').trim().toUpperCase();
      if (!val) continue;

      if (truckColIdx === -1 && (val.includes('TRUCK') || val.includes('VEHICLE')) && !val.includes('TYPE')) {
        truckColIdx = col;
        headerRowIdx = scanR;
      }
      if (dateColIdx === -1 && (val === 'DATE' || val.includes('IN DATE') || val.includes('UN. DATE') || val.includes('P. DATE') || val.includes('UNLOADING'))) {
        dateColIdx = col;
      }
      if (destColIdx === -1 && (val.includes('VENDOR') || val.includes('PARTY') || val.includes('CONSIGNEE') || val.includes('CUSTOMER') || val === 'DEST' || val.includes('DESTINATION'))) {
        destColIdx = col;
      }
      if (sourceColIdx === -1 && (val.includes('FROM LOCATION') || val.includes('ORIGIN') || val === 'SOURCE' || val === 'FROM')) {
        sourceColIdx = col;
      }
      if (weightColIdx === -1 && (val.includes('NET_WT') || val.includes('NET WEIGHT') || val.includes('WIEGHT') || val === 'WEIGHT')) {
        weightColIdx = col;
      }
      if (balesColIdx === -1 && (val.includes('BALEQTY') || val.includes('BALES') || val === 'QTY' || val.includes('BALE'))) {
        balesColIdx = col;
      }
      if (freightColIdx === -1 && (val.includes('FREIGHT AMOUNT') || val === 'AMOUNT' || val === 'FREIGHT')) {
        freightColIdx = col;
      }
      if (dieselColIdx === -1 && val.includes('DIESEL')) dieselColIdx = col;
      if (paidColIdx === -1 && (val === 'PAY' || val === 'PAID')) paidColIdx = col;
      if (pendingColIdx === -1 && (val.includes('PENDING') || val.includes('BALANCE'))) pendingColIdx = col;
      if (slipColIdx === -1 && (val.includes('SLIP') || val.includes('SR.NO') || val.includes('SR NO') || val.includes('WEIGH_NO'))) {
        slipColIdx = col;
      }
      if (contactColIdx === -1 && (val.includes('MOBILE') || val.includes('CONTACT') || val.includes('MALIK') || val.includes('PHONE'))) {
        contactColIdx = col;
      }
    }
    if (truckColIdx > 0) break;
  }

  // Fallback: heuristic regex scan for Indian truck plate in data rows
  if (truckColIdx === -1) {
    const colHits = new Map<number, number>();
    for (let r = 2; r <= Math.min(25, ws.rowCount); r++) {
      for (let c = 1; c <= 20; c++) {
        const val = String(ws.getRow(r).getCell(c).value || '').trim();
        if (isIndianTruckNo(val)) colHits.set(c, (colHits.get(c) || 0) + 1);
      }
    }
    let topCol = -1;
    let maxHit = 0;
    for (const [c, h] of colHits.entries()) {
      if (h > maxHit) {
        maxHit = h;
        topCol = c;
      }
    }
    if (topCol !== -1) truckColIdx = topCol;
  }

  return {
    truckColIdx,
    dateColIdx,
    balesColIdx,
    destColIdx,
    sourceColIdx,
    weightColIdx,
    freightColIdx,
    dieselColIdx,
    paidColIdx,
    pendingColIdx,
    slipColIdx,
    contactColIdx,
    headerRowIdx,
  };
}
