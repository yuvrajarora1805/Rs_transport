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

export function detectColumnIndices(ws: ExcelJS.Worksheet, manualMapping?: ColumnMapping) {
  let truckColIdx = manualMapping?.truckCol ?? -1;
  let dateColIdx = manualMapping?.dateCol ?? -1;
  let balesColIdx = manualMapping?.balesCol ?? -1;
  let destColIdx = manualMapping?.destCol ?? -1;
  let contactColIdx = manualMapping?.contactCol ?? -1;
  let headerRowIdx = 1;

  if (truckColIdx === -1) {
    for (let scanR = 1; scanR <= Math.min(5, ws.rowCount); scanR++) {
      const row = ws.getRow(scanR);
      for (let col = 1; col <= 20; col++) {
        const val = String(row.getCell(col).value || '').trim().toUpperCase();
        if ((val.includes('TRUCK') || val.includes('VEHICLE')) && !val.includes('TYPE')) {
          truckColIdx = col;
          headerRowIdx = scanR;
        }
        if (dateColIdx === -1 && (val === 'DATE' || val.includes('UN. DATE') || val.includes('P. DATE') || val.includes('UNLOADING'))) dateColIdx = col;
        if (balesColIdx === -1 && (val.includes('BALE') || val.includes('BALES') || val.includes('WEIGHT') || val.includes('WIEGHT') || val.includes('QTY'))) balesColIdx = col;
        if (destColIdx === -1 && (val.includes('PLACE') || val.includes('DEST') || val.includes('PARTY') || val.includes('CONSIGNEE'))) destColIdx = col;
        if (contactColIdx === -1 && (val.includes('MOBILE') || val.includes('CONTACT') || val.includes('MALIK') || val.includes('OWNER') || val.includes('PHONE'))) contactColIdx = col;
      }
      if (truckColIdx > 0) break;
    }

    if (truckColIdx === -1) {
      const colTruckMatches = new Map<number, number>();
      for (let r = 2; r <= Math.min(25, ws.rowCount); r++) {
        const row = ws.getRow(r);
        for (let c = 1; c <= 15; c++) {
          const val = String(row.getCell(c).value || '').trim();
          if (isIndianTruckNo(val)) {
            colTruckMatches.set(c, (colTruckMatches.get(c) || 0) + 1);
          }
        }
      }
      let bestCol = -1;
      let bestCount = 0;
      for (const [c, count] of colTruckMatches.entries()) {
        if (count > bestCount) {
          bestCount = count;
          bestCol = c;
        }
      }
      if (bestCol !== -1) truckColIdx = bestCol;
    }

    // Secondary scan for Date, Bales/Weight, Party/Dest, and Contact if not yet found
    for (let c = 1; c <= Math.min(15, ws.columnCount || 10); c++) {
      if (c === truckColIdx) continue;
      for (let r = headerRowIdx + 1; r <= Math.min(headerRowIdx + 10, ws.rowCount); r++) {
        const cell = ws.getRow(r).getCell(c).value;
        if (dateColIdx === -1 && cell instanceof Date) {
          dateColIdx = c;
        }
        if (contactColIdx === -1 && typeof cell === 'number' && cell > 6000000000 && cell < 9999999999) {
          contactColIdx = c;
        }
        if (balesColIdx === -1 && typeof cell === 'number' && cell > 0 && cell < 500 && c !== contactColIdx) {
          balesColIdx = c;
        }
      }
    }
  }

  return { truckColIdx, dateColIdx, balesColIdx, destColIdx, contactColIdx, headerRowIdx };
}
