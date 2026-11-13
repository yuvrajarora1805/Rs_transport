const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const Decimal = require('decimal.js');
const path = require('path');
const fs = require('fs');

async function fullResetAndImport() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'rs_transport_db',
  });

  console.log('--- 1. Resetting database tables (preserving users) ---');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const tablesToTruncate = [
    'payments',
    'pump_payments',
    'pump_ledger',
    'fuel_transactions',
    'settlements',
    'advances',
    'commissions',
    'trips',
    'dispatches',
    'parties',
    'destinations',
    'sources',
    'transporters',
    'pumps',
    'trucks',
    'audit_logs',
  ];

  for (const t of tablesToTruncate) {
    try {
      await conn.query(`TRUNCATE TABLE \`${t}\``);
      console.log(`Truncated table: ${t}`);
    } catch (e) {
      console.warn(`Could not truncate ${t}: ${e.message}`);
    }
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Database cleaned successfully.');

  // --- 2. Import TRUCK DETAILS.xlsx (Dispatches & Sources & Trucks) ---
  const truckDetailsPath = path.resolve('TRUCK DETAILS.xlsx');
  if (fs.existsSync(truckDetailsPath)) {
    console.log('\n--- 2. Importing TRUCK DETAILS.xlsx ---');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(truckDetailsPath);
    let dispCount = 0;

    for (const ws of wb.worksheets) {
      const sourceName = ws.name.trim().toUpperCase();
      let [sRows] = await conn.query('SELECT id FROM sources WHERE name = ?', [sourceName]);
      let sourceId = sRows[0]?.id;
      if (!sourceId) {
        sourceId = uuidv4();
        await conn.query('INSERT INTO sources (id, name) VALUES (?, ?)', [sourceId, sourceName]);
      }

      for (let rowIdx = 3; rowIdx <= ws.rowCount; rowIdx++) {
        const row = ws.getRow(rowIdx);
        const srNo = String(row.getCell(1).value || '').trim();
        const dateVal = row.getCell(2).value;
        const truckNoRaw = String(row.getCell(3).value || '').trim();
        const balesVal = row.getCell(4).value;
        const mobileVal = String(row.getCell(5).value || '').trim();
        const destVal = String(row.getCell(6).value || '').trim();

        if (!truckNoRaw) continue;
        const truckNo = truckNoRaw.toUpperCase().replace(/\s+/g, '');
        // Filter out summary/total rows or headers
        if (truckNo === 'TOTAL' || truckNo === 'SRNO' || !/[0-9]/.test(truckNo)) continue;

        try {
          let [tRows] = await conn.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
          let truckId = tRows[0]?.id;
          if (!truckId) {
            truckId = uuidv4();
            await conn.query(
              'INSERT INTO trucks (id, truck_no, mobile_no) VALUES (?, ?, ?)',
              [truckId, truckNo, mobileVal || null]
            );
          }

          const dispatchDate = dateVal instanceof Date ? dateVal : new Date();
          const bales = typeof balesVal === 'number' ? balesVal : parseFloat(String(balesVal)) || null;

          await conn.query(
            `INSERT INTO dispatches (id, sr_no, date, truck_id, source_id, bales, destination, driver_mobile, company_code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RS_TRANSPORT')`,
            [uuidv4(), srNo || null, dispatchDate, truckId, sourceId, bales, destVal || null, mobileVal || null]
          );
          dispCount++;
        } catch (e) {
          // ignore
        }
      }
    }
    console.log(`Imported ${dispCount} dispatches from TRUCK DETAILS.xlsx`);
  }

  // --- 3. Import pump details.xlsx (Dynamic Column Header Detection) ---
  const pumpDetailsPath = path.resolve('pump details.xlsx');
  if (fs.existsSync(pumpDetailsPath)) {
    console.log('\n--- 3. Importing pump details.xlsx ---');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(pumpDetailsPath);
    let fuelCount = 0;
    let pmtCount = 0;

    for (const ws of wb.worksheets) {
      const pumpName = ws.name.trim().toUpperCase();
      let [pRows] = await conn.query('SELECT id FROM pumps WHERE name = ?', [pumpName]);
      let pumpId = pRows[0]?.id;
      if (!pumpId) {
        pumpId = uuidv4();
        await conn.query('INSERT INTO pumps (id, name, opening_balance) VALUES (?, ?, 0)', [pumpId, pumpName]);
      }

      // Detect header row
      let hdrRowIdx = 3;
      let colMap = { date: -1, truck: -1, fuel: -1, pmt: -1 };
      for (let r = 1; r <= 5; r++) {
        const row = ws.getRow(r);
        for (let c = 1; c <= 12; c++) {
          const val = String(row.getCell(c).value || '').trim().toUpperCase();
          if (val.includes('TRUCK') && colMap.truck === -1) {
            colMap.truck = c;
            hdrRowIdx = r;
          }
          if (val === 'DATE' || val === 'DATE' || val.includes('DATE') && colMap.date === -1) {
            colMap.date = c;
          }
          if (val === 'FUEL' && colMap.fuel === -1) {
            colMap.fuel = c;
          }
          if ((val === 'PAYMENT' || val.includes('PAYMENT')) && colMap.pmt === -1) {
            colMap.pmt = c;
          }
        }
        if (colMap.truck !== -1 && colMap.fuel !== -1) break;
      }

      // Fallback defaults if header detection missed
      if (colMap.truck === -1) colMap.truck = 3;
      if (colMap.date === -1) colMap.date = 2;
      if (colMap.fuel === -1) colMap.fuel = 4;
      if (colMap.pmt === -1) colMap.pmt = 5;

      for (let rowIdx = hdrRowIdx + 1; rowIdx <= ws.rowCount; rowIdx++) {
        const row = ws.getRow(rowIdx);
        const dateVal = row.getCell(colMap.date).value;
        const truckVal = String(row.getCell(colMap.truck).value || '').trim();
        const fuelVal = row.getCell(colMap.fuel).value;
        const pmtVal = colMap.pmt !== -1 ? row.getCell(colMap.pmt).value : null;

        const date = dateVal instanceof Date ? dateVal : new Date('2026-10-01');
        const truckNo = truckVal.toUpperCase().replace(/\s+/g, '');
        if (truckNo === 'TOTAL' || !/[0-9]/.test(truckNo)) continue;

        const fuelAmt = typeof fuelVal === 'number' ? fuelVal : parseFloat(String(fuelVal)) || 0;
        const pmtAmt = typeof pmtVal === 'number' ? pmtVal : parseFloat(String(pmtVal)) || 0;

        try {
          if (truckNo && fuelAmt > 0) {
            let [tRows] = await conn.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
            let truckId = tRows[0]?.id;
            if (!truckId) {
              truckId = uuidv4();
              await conn.query('INSERT INTO trucks (id, truck_no) VALUES (?, ?)', [truckId, truckNo]);
            }

            await conn.query(
              'INSERT INTO fuel_transactions (id, date, truck_id, pump_id, amount) VALUES (?, ?, ?, ?, ?)',
              [uuidv4(), date, truckId, pumpId, fuelAmt]
            );
            fuelCount++;
          }

          if (pmtAmt > 0) {
            await conn.query(
              'INSERT INTO pump_payments (id, pump_id, payment_date, amount, payment_mode) VALUES (?, ?, ?, ?, ?)',
              [uuidv4(), pumpId, date, pmtAmt, 'BANK_TRANSFER']
            );
            pmtCount++;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    console.log(`Imported ${fuelCount} fuel entries and ${pmtCount} pump payments from pump details.xlsx`);
  }

  // --- Helper for Trips & Settlements workbook with Dynamic Header Detection ---
  async function importTripsWorkbook(filePath, companyCode) {
    console.log(`\n--- Importing ${path.basename(filePath)} for ${companyCode} ---`);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);
    let count = 0;

    for (const ws of wb.worksheets) {
      if (ws.name === 'RAW' || ws.rowCount < 2) continue;
      // If sheet is a duplicate (like Sheet9 which is a subset of Sheet6), skip
      if (ws.name === 'Sheet9') continue;

      const fallbackDestName = ws.name.trim().toUpperCase();

      // Dynamic header mapping for this sheet
      let colMap = {
        srNo: -1,
        date: -1,
        truck: -1,
        party: -1,
        weight: -1,
        rate: -1,
        advance: -1,
        diesel: -1,
        pump: -1,
        comm: -1,
        amount: -1,
        pay: -1,
        to: -1,
      };

      let hdrRowIdx = 1;
      for (let r = 1; r <= 3; r++) {
        const row = ws.getRow(r);
        let foundTruck = false;
        for (let c = 1; c <= 25; c++) {
          const val = String(row.getCell(c).value || '').trim().toUpperCase();
          if (val.includes('TRUCK')) {
            colMap.truck = c;
            foundTruck = true;
            hdrRowIdx = r;
          }
          if (val === 'SR.NO.' || val === 'SR NO' || val === 'SR.NO') colMap.srNo = c;
          if (val.includes('DATE')) colMap.date = c;
          if (val === 'PARTY') colMap.party = c;
          if (val.includes('WIEGHT') || val.includes('WEIGHT')) colMap.weight = c;
          if (val === 'RATE') colMap.rate = c;
          if (val.includes('ADVANCE')) colMap.advance = c;
          if (val.includes('DIESEL')) colMap.diesel = c;
          if (val.includes('PUMP')) colMap.pump = c;
          if (val.includes('COMISION') || val.includes('COMMISSION')) colMap.comm = c;
          if (val === 'PAY' || val === 'AMOUNT') colMap.pay = c;
          if (val === 'TO') colMap.to = c;
        }
        if (foundTruck) break;
      }

      // If truck col not found, skip
      if (colMap.truck === -1) continue;

      for (let r = hdrRowIdx + 1; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const truckRaw = String(row.getCell(colMap.truck).value || '').trim();
        if (!truckRaw) continue;
        const truckNo = truckRaw.toUpperCase().replace(/\s+/g, '');
        if (truckNo === 'TOTAL' || !/[0-9]/.test(truckNo)) continue;

        const dateVal = colMap.date !== -1 ? row.getCell(colMap.date).value : null;
        const srVal = colMap.srNo !== -1 ? String(row.getCell(colMap.srNo).value || '').trim() : '';
        const partyVal = colMap.party !== -1 ? String(row.getCell(colMap.party).value || '').trim() : '';
        const wtVal = colMap.weight !== -1 ? row.getCell(colMap.weight).value : null;
        const rateVal = colMap.rate !== -1 ? row.getCell(colMap.rate).value : null;
        const advVal = colMap.advance !== -1 ? row.getCell(colMap.advance).value : null;
        const dieselVal = colMap.diesel !== -1 ? row.getCell(colMap.diesel).value : null;
        const commVal = colMap.comm !== -1 ? row.getCell(colMap.comm).value : null;
        const pmtVal = colMap.pay !== -1 ? String(row.getCell(colMap.pay).value || '').trim() : '';
        const toVal = colMap.to !== -1 ? String(row.getCell(colMap.to).value || '').trim().toUpperCase() : '';

        // Destination name: Prefer row's "TO" column if present (e.g. JASRASAR, BHANIPURA), else fallback to sheet name
        let destName = toVal && toVal !== 'N/L' ? toVal : (fallbackDestName.startsWith('SHEET') ? 'JASRASAR' : fallbackDestName);
        if (destName === 'SARDARSHAR') destName = 'SARDARSHAHAR';

        const weight = typeof wtVal === 'number' ? wtVal : parseFloat(String(wtVal)) || 0;
        const rate = typeof rateVal === 'number' ? rateVal : parseFloat(String(rateVal)) || 0;
        if (weight <= 0 || rate <= 0) continue;

        try {
          let [dRows] = await conn.query('SELECT id FROM destinations WHERE name = ?', [destName]);
          let destId = dRows[0]?.id;
          if (!destId) {
            destId = uuidv4();
            await conn.query('INSERT INTO destinations (id, name) VALUES (?, ?)', [destId, destName]);
          }
          let [tRows] = await conn.query('SELECT id FROM trucks WHERE truck_no = ?', [truckNo]);
          let truckId = tRows[0]?.id;
          if (!truckId) {
            truckId = uuidv4();
            await conn.query('INSERT INTO trucks (id, truck_no) VALUES (?, ?)', [truckId, truckNo]);
          }

          let partyId = null;
          if (partyVal && partyVal !== 'None' && partyVal !== 'null' && partyVal !== '') {
            let [pRows] = await conn.query('SELECT id FROM parties WHERE name = ?', [partyVal]);
            partyId = pRows[0]?.id;
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

          // If company is RANBIR_LOGISTICS, auto-create a matching dispatch record if not already existing
          let dispatchId = null;
          if (companyCode === 'RANBIR_LOGISTICS') {
            // Find or create a default source for Ranbir Logistics (or use matching sheet source)
            let [sRows] = await conn.query('SELECT id FROM sources WHERE name = ?', ['RANBIR LOGISTICS']);
            let ranbirSourceId = sRows[0]?.id;
            if (!ranbirSourceId) {
              ranbirSourceId = uuidv4();
              await conn.query('INSERT INTO sources (id, name, is_active) VALUES (?, ?, 1)', [ranbirSourceId, 'RANBIR LOGISTICS']);
            }

            dispatchId = uuidv4();
            const dispatchSrNo = srVal ? String(srVal) : null;
            await conn.query(
              `INSERT INTO dispatches (id, sr_no, date, truck_id, source_id, destination, remarks, company_code)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'RANBIR_LOGISTICS')`,
              [dispatchId, dispatchSrNo, unloadDate, truckId, ranbirSourceId, destName, partyVal ? `Party: ${partyVal}` : null]
            );
          }

          await conn.query(
            'INSERT INTO trips (id, trip_no, dispatch_id, truck_id, destination_id, party_id, unloading_date, gross_weight, tare_weight, net_weight, rate_per_unit, gross_freight, company_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [tripId, tripNo, dispatchId, truckId, destId, partyId, unloadDate, weight, 0, weight, rate, gross, companyCode]
          );

          // If diesel was specified in the Excel row, create a linked fuel transaction
          if (diesel > 0) {
            await conn.query(
              'INSERT INTO fuel_transactions (id, date, truck_id, trip_id, amount) VALUES (?, ?, ?, ?, ?)',
              [uuidv4(), unloadDate, truckId, tripId, diesel]
            );
          }

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

          if (isPaid && totalPaid > 0) {
            await conn.query(
              'INSERT INTO payments (id, settlement_id, payment_date, amount, paid_to) VALUES (?, ?, ?, ?, ?)',
              [uuidv4(), settlementId, unloadDate, totalPaid, pmtVal || 'OWNER']
            );
          }

          count++;
        } catch (e) {
          // ignore row
        }
      }
    }
    console.log(`Imported ${count} trip settlements for ${companyCode}`);
  }

  // --- 4. Import RS TRANSPORT COMPANY (1).xlsx ---
  const rsFilePath = path.resolve('RS TRANSPORT COMPANY (1).xlsx');
  if (fs.existsSync(rsFilePath)) {
    await importTripsWorkbook(rsFilePath, 'RS_TRANSPORT');
  }

  // --- 5. Import RANBIR LOGISTICS.xlsx ---
  const rlFilePath = path.resolve('RANBIR LOGISTICS.xlsx');
  if (fs.existsSync(rlFilePath)) {
    await importTripsWorkbook(rlFilePath, 'RANBIR_LOGISTICS');
  }

  // --- Print Final DB Counts ---
  console.log('\n--- Final Database Record Summary ---');
  for (const t of ['trucks', 'sources', 'destinations', 'parties', 'pumps', 'dispatches', 'trips', 'settlements', 'payments', 'fuel_transactions']) {
    const [res] = await conn.query(`SELECT COUNT(*) as count FROM \`${t}\``);
    console.log(`${t.padEnd(20)}: ${res[0].count}`);
  }

  await conn.end();
  console.log('\nAll done cleanly!');
}

fullResetAndImport().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
