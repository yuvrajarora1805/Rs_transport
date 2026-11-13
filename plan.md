# RS Transport ERP – Development Plan

## Excel Data Analysis Summary

### 1. TRUCK DETAILS.xlsx (Dispatch Records by Source)
- **6 sheets = 6 booking sources**: Bittu Brar, Sarpanch Aadnia Maja, Happy Sarpanch, Bhagta Bhai, Jalaj Gidarpindi, DSBC Tarn Taran
- **Fields**: SR NO, DATE, TRUCK NO, BALES, MOBILE NO, PLACE (destination)
- This is the **dispatch register** — records truck departures from each source

### 2. RANBIR LOGISTICS.xlsx (Destination-wise Settlement Register)
- **Sheets**: BHADRA (132 rows), MANDRELLA (232 rows), Sheet3 (weight data)
- **Fields**: S.NO, SR.NO, UN.DATE, TRUCK NO, MALIK, PARTY, WEIGHT, RATE, ADVANCE, DIESEL, PUMP N., COMISION, AMOUNT, PAY, P.date, PENDING
- This is a **transporter-specific settlement register** organized by destination

### 3. RS TRANSPORT COMPANY (1).xlsx (Main Settlement Register)
- **Sheets**: CHATTARGARH, SARDARSHAHAR, JASRASAR, Sheet4-Sheet10, RAW
- **Fields**: UN.DATE, SR.NO, TRUCK NO, MALIK, PARTY, NET WEIGHT, RATE, ADVANCE/DUE, DIESEL, PUMP N., COMISION, AMOUNT, PAY, P.date, PENDING, TO (destination), TRANSPORTER
- This is the **main company settlement register** organized by destination
- RAW sheet contains dispatch data (date, truck, bales, mobile, place)

### 4. pump details.xlsx (Petrol Pump Accounts)
- **14 pump sheets**: AMIYA HP KKP, HAPPY PUMP, SR NAYARA PUMP, SODHI PUMP, IOC PUMP ROMANA, DODA PUMP, JAGJIT DHARAMKOT, USTAT ENERGY MUDKI, RS AULAKH IOC, BAJAJ IOC, RS AULAKH HP, CJ OILS, SAMANDEEP ONENESS, JASKIRAT HP
- **Fields**: SR.NO, DATE, TRUCK NO, FUEL, PAYMENT, REMAINING/DIFFERENCE, LITRE, 1.25 PERCENT
- Each sheet = one pump's ledger (fuel purchases + payments)

## Key Business Formula (Verified from Excel)

```
Gross Freight = Weight × Rate
AMOUNT = Gross Freight - Advance - Diesel - Commission
```

Example: Weight=16.89, Rate=1600, Advance=0, Diesel=22000, Commission=700
→ Gross = 16.89 × 1600 = 27024
→ AMOUNT = 27024 - 0 - 22000 - 700 = 4324 ✓

## Discovered Entities

### Sources (Booking Agents)
- Bittu Brar, Sarpanch Aadnia Maja, Happy Sarpanch, Bhagta Bhai, Jalaj Gidarpindi, DSBC Tarn Taran

### Destinations
- Bhadra, Mandrella, Chattargarh, Sardarshahar, Jasrasar, Bhanipura

### Transporters
- R.S Transport, Ranbir Logistics, Rajpal

### Parties
- Sukhwant Kaur, Balwinder Singh, Parmeet Singh, Harmander Singh, Randhir Singh, Sukhraj Kaur, Rajvinder Singh, etc.

### Petrol Pumps (14)
- AMIYA HP KKP, HAPPY PUMP, SR NAYARA PUMP, SODHI PUMP, IOC PUMP ROMANA, DODA PUMP, JAGJIT DHARAMKOT, USTAT ENERGY MUDKI, RS AULAKH IOC, BAJAJ IOC, RS AULAKH HP, CJ OILS, SAMANDEEP ONENESS, JASKIRAT HP

## Phase 1 Implementation Plan (Current)

### Backend Setup
1. Initialize NestJS project with TypeScript
2. Configure PostgreSQL with Prisma ORM
3. Create complete database schema
4. Implement authentication (JWT)
5. Implement role-based access control
6. Create all master management modules
7. Seed initial data

### Frontend Setup  
1. Initialize Next.js project with TypeScript + Tailwind CSS
2. Create professional sidebar layout
3. Build dashboard with KPI cards and charts
4. Create master management CRUD pages
5. Implement authentication pages

### Database Schema Highlights
- 25+ interconnected tables
- DECIMAL precision for money/weight
- Proper foreign keys and constraints
- Audit trail on all financial tables
- Soft-delete for financial records
