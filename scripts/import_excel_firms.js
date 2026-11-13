const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const Decimal = require('decimal.js');

async function importWorkbook(filePath, companyCode) {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'rs_transport_db',
  });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  let count = 0;

  for (const ws of wb.worksheets) {
    if (ws.name === 'RAW' || ws.rowCount < 2) continue;
    const destName = ws.name.trim().toUpperCase();

    let [dRows] = await conn.query('SELECT id FROM destinations WHERE name = ?', [destName]);
    let destId = dRows[0] ? dRows[0].id : null;
    if (!destId) {
      destId = uuidv4();
      await conn.query('INSERT INTO destinations (id, name) VALUES (?, ?)', [destId, destName]);
    }

    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const rowVals = [];
      for (let c = 1; c <= 15; c++) {
        let v = row.getCell(c).value;
        if (v && typeof v === 'object' && v.result !== undefined) v = v.result;
        rowVals.push(v);
      }

      let dateVal = rowVals[2] || rowVals[1] || rowVals[0];
      let srVal = String(rowVals[1] || '').trim();
      let truckVal = String(rowVals[3] || '').trim();
      let partyVal = String(rowVals[5] || '').trim();
      let wtVal = rowVals[6];
      let rateVal = rowVals[7];
      let advVal = rowVals[8];
      let dieselVal = rowVals[9];
      let commVal = rowVals[11];
      let pmtVal = String(rowVals[12] || '').trim();

      if (!truckVal || !/[0-9]/.test(truckVal)) {
        for (let col = 0; col < 6; col++) {
          const val = String(rowVals[col] || '').trim();
          if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{3,4}$/i.test(val.replace(/\s+/g, ''))) {
            truckVal = val;
            break;
          }
        }
      }

      if (!truckVal || !/[0-9]/.test(truckVal)) continue;

      const truckNo = truckVal.toUpperCase().replace(/\s+/g, '');
      const weight = typeof wtVal === 'number' ? wtVal : parseFloat(String(wtVal)) || 0;
      const rate = typeof rateVal === 'number' ? rateVal : parseFloat(String(rateVal)) || 0;
      if (weight <= 0 || rate <= 0) continue;

      try {
        let [tRows] = await conn.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
        let truckId = tRows[0] ? tRows[0].id : null;
        if (!truckId) {
          truckId = uuidv4();
          await conn.query('INSERT INTO trucks (id, truck_no) VALUES (?, ?)', [truckId, truckNo]);
        }

        let partyId = null;
        if (partyVal && partyVal !== 'None' && partyVal !== 'null' && partyVal !== '') {
          let [pRows] = await conn.query('SELECT id FROM parties WHERE name = ?', [partyVal]);
          partyId = pRows[0] ? pRows[0].id : null;
          if (!partyId) {
            partyId = uuidv4();
            await conn.query('INSERT INTO parties (id, name, destination_id) VALUES (?, ?, ?)', [partyId, partyVal, destId]);
          }
        }

        const gross = new Decimal(weight).mul(new Decimal(rate)).toNumber();
        const advance = typeof advVal === 'number' ? advVal : parseFloat(String(advVal)) || 0;
        const diesel = typeof dieselVal === 'number' ? dieselVal : parseFloat(String(dieselVal)) || 0;
        const comm = typeof commVal === 'number' ? commVal : parseFloat(String(commVal)) || 0;
        const net = gross - advance - diesel - comm;

        const tripId = uuidv4();
        const prefix = companyCode === 'RANBIR_LOGISTICS' ? 'RL' : 'RS';
        const tripNo = srVal && !isNaN(Number(srVal))
          ? prefix + '-' + Math.round(Number(srVal))
          : prefix + '-' + Math.floor(10000 + Math.random() * 90000);

        const [exist] = await conn.query('SELECT id FROM trips WHERE trip_no = ?', [tripNo]);
        if (exist.length > 0) continue;

        let unloadDate = null;
        if (dateVal instanceof Date) {
          unloadDate = dateVal;
        } else if (typeof dateVal === 'string' && dateVal.trim()) {
          const parsed = new Date(dateVal);
          if (!isNaN(parsed.getTime())) unloadDate = parsed;
        }
        if (!unloadDate) unloadDate = new Date('2026-10-15');

        await conn.query(
          'INSERT INTO trips (id, trip_no, truck_id, destination_id, party_id, unloading_date, gross_weight, tare_weight, net_weight, rate_per_unit, gross_freight, company_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [tripId, tripNo, truckId, destId, partyId, unloadDate, weight, 0, weight, rate, gross, companyCode]
        );

        const settlementId = uuidv4();
        const isPaid = pmtVal && pmtVal !== 'PENDING' && pmtVal !== '0';
        const totalPaid = isPaid ? net : 0;
        const outstanding = net - totalPaid;

        await conn.query(
          'INSERT INTO settlements (id, trip_id, settlement_date, gross_freight, advance_amount, diesel_amount, commission, net_payable, total_paid, outstanding, status, company_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            settlementId,
            tripId,
            unloadDate,
            gross,
            advance,
            diesel,
            comm,
            net,
            totalPaid,
            outstanding,
            isPaid ? 'PAID' : 'APPROVED',
            companyCode,
          ]
        );
        count++;
      } catch (e) {
        // continue
      }
    }
  }
  await conn.end();
  console.log('Imported ' + count + ' records for ' + companyCode);
}

async function main() {
  await importWorkbook('/media/yuvraj/New Volume/xamp/htdocs/Rs_transport/RS TRANSPORT COMPANY (1).xlsx', 'RS_TRANSPORT');
  await importWorkbook('/media/yuvraj/New Volume/xamp/htdocs/Rs_transport/RANBIR LOGISTICS.xlsx', 'RANBIR_LOGISTICS');
}
main();
