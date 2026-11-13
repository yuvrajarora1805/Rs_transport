---
name: rs-transport-erp
description: >-
  Comprehensive architectural, functional, and development reference for RS Transport ERP –
  a centralized transport management, settlement & double-entry petrol pump accounting system.
  Covers Excel workbook mappings, relational database schema, all 17 page modules with detailed workflows,
  financial formulas, multi-truck dispatches, weighbridge integration, responsive design standards,
  and strict modular file guidelines (<250 lines).
---

# 🚛 RS Transport ERP – Centralised Transport & Accounts ERP

Centralised Transport ERP software engineered for **RS Transport Company** and **Ranbir Logistics** to replace manual Excel-based management with an automated, relational, double-entry transport ERP.

---

## 📑 1. Reference Excel Workbooks & Source Mapping

The ERP business logic, data models, and reports are directly derived from 4 core operational workbooks:

### A. TRUCK DETAILS.xlsx (Dispatch Registers by Source)
* **6 Sheet Sources**: `BITTU BRAR`, `SARPANCH AADNIA MAJA`, `HAPPY SARPANCH`, `BHAGTA BHAI`, `JALAJ GIDARPINDI`, `DSBC TARN TARAN`
* **Data Fields**: `SR NO.`, `DATE`, `TRUCK NO.`, `BALES`, `MOBILE NO.`, `PLACE` (Destination)
* **ERP Role**: Mapped to `dispatches` table filtered by `source_id`. Supports single-truck and multi-truck batch dispatches under identical order references.

### B. RANBIR LOGISTICS.xlsx (Transporter Settlement Register)
* **Destination Sheets**: `BHADRA`, `MANDRELLA`, `Sheet3` (unloading weight records)
* **Data Fields**: `S. NO`, `SR.NO.`, `UN. DATE`, `TRUCK NO`, `MALIK`, `PARTY`, `WIEGHT`, `RATE`, `ADVANCE`, `DIESEL`, `PUMP N.`, `COMISION`, `AMOUNT`, `PAY`, `P. date`, `PENDING`
* **ERP Role**: Transporter-filtered freight settlements, partial payment vouchers, and outstanding balances.

### C. RS TRANSPORT COMPANY (1).xlsx (Main Company Settlement Register)
* **Destination Sheets**: `CHATTARGARH`, `SARDARSHAHAR`, `JASRASAR`, `Sheet4`, `Sheet5`, `Sheet6`, `Sheet8`, `Sheet9`, `Sheet10`, `RAW`
* **Data Fields**: `UN. DATE`, `SR.NO.`, `TRUCK NO`, `MALIK`, `PARTY`, `NET WEIGHT`, `RATE`, `ADVANCE/DUE`, `DIESEL`, `PUMP N.`, `COMISION`, `AMOUNT`, `PAY`, `P. date`, `PENDING`, `TO`, `TRANSPORTER`
* **ERP Role**: Central `trips`, weighbridge integration, Dharamkanta gross/tare/net records, freight settlements, and payment vouchers.

### D. pump details.xlsx (14 Petrol Pump Ledgers)
* **14 Pump Sheets**: `AMIYA HP KKP`, `HAPPY PUMP`, `SR NAYARA PUMP`, `SODHI PUMP`, `IOC PUMP ROMANA`, `DODA PUMP`, `JAGJIT DHARAMKOT`, `USTAT ENERGY MUDKI`, `RS AULAKH IOC`, `BAJAJ IOC`, `RS AULAKH HP`, `CJ OILS`, `SAMANDEEP ONENESS`, `JASKIRAT HP`
* **Data Fields**: `SR. NO.`, `DATE`, `TRUCK NO.`, `FUEL`, `PAYMENT`, `REMAINING / DIFFERENCE`, `LITRE`, `1.25 PERCENT`
* **ERP Role**: Double-entry pump accounting (`fuel_transactions`, `pump_payments`, `pump_ledger`).

---

## 🧮 2. Critical Business Formulas & Calculation Rules

### A. Freight Calculation Formula
$$\text{Gross Freight} = \text{Billable Net Weight (MT)} \times \text{Rate (₹/MT)}$$
*Where $\text{Billable Net Weight} = \text{Gross Weight} - \text{Tare Weight}$ (or directly entered from Dharamkanta slip).*

### B. Settlement Net Payable Formula
$$\text{Total Deductions} = \text{Advance} + \text{Diesel} + \text{Commission} + \text{Other Deductions}$$
$$\text{Net Payable} = \text{Gross Freight} - \text{Total Deductions}$$
$$\text{Outstanding Pending Balance} = \text{Net Payable} - \text{Total Payments Made}$$

### C. Double-Entry Petrol Pump Balance Formula
$$\text{Closing Pump Balance} = \text{Opening Balance} + \text{Fuel Purchases (Debits)} - \text{Pump Payments (Credits)}$$
*Note: Fuel purchases issued to trucks debit the petrol pump ledger. When the transport company transfers money to the pump, it credits the pump ledger. Freight deduction from a truck's freight is strictly segregated from pump payouts.*

### D. Tare Weight History & Auto-Populate Formula
When a truck registration is selected in either **Trips & Freight** or **Multi-Truck Dispatch**, the ERP queries:
$$\text{SELECT tare\_weight, unloading\_date FROM trips WHERE truck\_id = ? ORDER BY unloading\_date DESC LIMIT 5}$$
The resulting recent tare weights are rendered as clickable badges that instantly auto-populate the empty tare input.

---

## 🏛️ 3. Complete Relational Database Schema

```sql
-- Core Masters
users (id, username, password_hash, full_name, role, is_active, created_at)
trucks (id, truck_no, owner_name, mobile_no, truck_type, is_active, created_at)
sources (id, name, contact_no, address, is_active, created_at)
destinations (id, name, state, is_active, created_at)
parties (id, name, contact_no, destination_id, is_active, created_at)
transporters (id, name, contact_no, pan_no, created_at)
petrol_pumps (id, name, location, contact_no, opening_balance, current_balance, is_active)

-- Operational & Financial Tables
dispatches (
  id, date, sr_no, source_id, destination, remarks, truck_id, bales,
  tare_weight, gross_weight, net_weight, slip_image, driver_mobile,
  status, company_code, is_deleted, created_at
)

trips (
  id, trip_no, dispatch_id, truck_id, destination_id, party_id,
  unloading_date, gross_weight, tare_weight, net_weight, rate_per_unit,
  gross_freight, slip_image, status, company_code, is_deleted, created_at
)

fuel_transactions (
  id, slip_no, date, truck_id, trip_id, pump_id, amount,
  litres, rate_per_litre, slip_image, status, created_at
)

settlements (
  id, trip_id, gross_freight, advance_amount, diesel_amount,
  commission_amount, other_deductions, net_payable, slip_image, status, created_at
)

payments (
  id, settlement_id, amount, payment_date, payment_mode,
  reference_no, notes, created_at
)

pump_payments (
  id, pump_id, amount, payment_date, payment_mode, reference_no, created_at
)

audit_logs (id, table_name, record_id, action, changed_by, old_values, new_values, created_at)
```

---

## 🖥️ 4. Detailed Page-by-Page Functional Architecture

The ERP features 17 functional page routes divided into 4 primary domains:

### Domain 1: Operations

#### 1. Dashboard (`/dashboard`)
* **Purpose**: Real-time KPI cockpit and executive summary for transport operations.
* **Key Metrics**: Total Dispatches (MT & bales), Active Trips on Road, Unsettled Freight, Today's Diesel Volume & Spend, Outstanding Receivables.
* **Actions**: Quick-action links to New Dispatch, Record Trip, Add Fuel, and Settle Freight. Recent activity feeds.

#### 2. Dispatches Register (`/dispatches`)
* **Purpose**: Source-wise truck booking register mirroring `TRUCK DETAILS.xlsx`.
* **Features**:
  * Filterable by Booking Source (all 6 agents: Bittu Brar, Sarpanch Aadnia, Happy Sarpanch, Bhagta Bhai, Jalaj Gidarpindi, DSBC).
  * Date range and destination search.
  * One-click "Create Trip →" navigation pre-filling truck, source, SR number, and destination into weighbridge intake.
  * Delete action guarded with `ConfirmDeleteModal` ("OK to Approve" confirmation).

#### 3. Add New Dispatch (`/dispatches/new`)
* **Purpose**: Records vehicle departure from dispatch origin.
* **Modes**:
  * **Single Truck Mode**: For standard individual truck departure.
  * **Multiple Trucks Mode (Same Order)**: For high-volume multi-truck orders under identical source and dispatch date.
* **Multi-Truck Independent Features**:
  1. *Independent Truck Selection*: Every row card (`Truck #1`, `Truck #2`...) has its own searchable `TruckSelect` autocomplete.
  2. *Independent Bales & Driver Phone*: Individual cargo count and driver mobile contact per truck.
  3. *Individual Weighing*: Dedicated Tare and Gross weight inputs with auto-calculated Net MT (`Gross − Tare`).
  4. *Tare Weight History*: Clickable pills showing recent past tare weights for each truck to auto-populate tare.
  5. *Independent Weight Slip Photos*: Upload separate Dharamkanta slip photos per vehicle.
* **Quick Add Modals**: Quick modal creators for New Truck, New Source, and New Destination without leaving the page.

#### 4. Trips & Freight (`/trips`)
* **Purpose**: Weighbridge unloading weight register and billable freight management.
* **Features**:
  * Displays Trip/SR No, Unloading Date, Truck No, Destination, Party (Mill), Net MT, Rate (₹/MT), Gross Freight.
  * Shows Attached Diesel amount and slip counts (e.g. ₹22,125.00).
  * Settlement status pills (`SETTLED`, `PARTIAL`, `PAID`, or `Create Settlement →`).
  * Weighbridge Dharamkanta slip preview modal.
  * Safe delete action with confirmation modal.

#### 5. Record New Trip (`/trips/new`)
* **Purpose**: Unloading weight entry upon truck arrival at destination mandi or mill.
* **Features**:
  * Trip / SR Number, Unloading Date.
  * Searchable Truck selector with live tare history retrieval.
  * Destination selector and Party selector (dynamically filtered by destination).
  * **Weighbridge Section**: Loaded Weight (Gross MT), Empty Weight (Tare MT), and Billable Net Weight MT with auto-calculation.
  * Clickable Previous Tare History badges from past trips.
  * Rate per Unit (₹/MT) with live Gross Freight calculation display.
  * Dharamkanta Slip Photo upload (PNG/JPG up to 5MB, stored in database).
  * Quick Add Party modal.

#### 6. Fuel & Diesel (`/fuel`)
* **Purpose**: Centralized diesel slip register linking trucks, trips, and petrol pumps.
* **Features**:
  * Displays Date, Truck No, Petrol Pump, Slip No, Trip No, Amount (₹).
  * Interactive "View Slip" photo preview modal.
  * Deletion with confirmation modal (automatically reverses pump debit balance).

#### 7. Add Diesel Entry (`/fuel/new`)
* **Purpose**: Record fuel slips issued to trucks at affiliated petrol pumps.
* **Features**:
  * Slip Date, Petrol Pump selector (14 pumps), Truck selector (searchable with owner name).
  * If opened from a trip (`?tripId=...`), displays linked trip card (Party, Destination, Net Weight).
  * Net Fuel Amount (₹) input.
  * Receipt / Slip Photo upload and preview.
  * Real-time Pump Statement Impact sidebar showing immediate debit effect.

---

### Domain 2: Accounts & Settlement

#### 8. Settlements Register (`/settlements`)
* **Purpose**: Freight settlement ledger managing truck owner payouts and deductions.
* **Features**:
  * Displays Trip No, Truck No, Destination, Gross Freight, Deductions (Advance, Diesel, Commission, Other), Net Payable, Paid Amount, and Pending Balance.
  * Payment status badges (`PAID`, `PARTIALLY_PAID`, `PENDING`).
  * Interactive "View Slip" photo modal to inspect attached settlement voucher or linked Dharamkanta slip.
  * Delete settlement button with confirmation modal (unlinks partial payments).

#### 9. New Freight Settlement (`/settlements/new`)
* **Purpose**: Automatic settlement engine calculating freight deductions and attaching settlement vouchers.
* **Features**:
  * Select Trip: Displays trip number, truck number, unloaded transporter, and gross freight.
  * Sidebar Trip Inspection: View linked trip Dharamkanta weighbridge slip photo directly to verify weight.
  * Deductions: Enter Cash Advance, Diesel Deductions, Commission, and Other Adjustments.
  * Attach Settlement Voucher: Upload photo of signed settlement voucher / bilty receipt (PNG, JPG, WebP < 5MB).
  * Live net calculation: $\text{Net Payable} = \text{Gross} - \text{Advance} - \text{Diesel} - \text{Commission} - \text{Other}$.
  * Immediate creation of settlement voucher.

#### 10. Payments Register (`/payments`)
* **Purpose**: Payment disbursement ledger recording partial and full vouchers against freight settlements.
* **Features**:
  * Voucher Number, Payment Date, Truck No, Owner / Payee Name, Amount, Mode (NEFT, RTGS, IMPS, Cash, Cheque), Reference No.
  * Link to underlying settlement and remaining balance tracking.

#### 11. Record New Payment (`/payments/new`)
* **Purpose**: Issue payment voucher towards an outstanding settlement.
* **Features**:
  * Select Unpaid/Partially Paid Settlement.
  * View total pending balance.
  * Enter payment amount (validates against pending balance), payment mode, transaction UTR/reference, and payment date.

#### 12. Outstanding Register (`/outstanding`)
* **Purpose**: Real-time debtor and creditor balance sheets with aging analysis.
* **Features**:
  * Grouped by Truck Owner and Transporter (RS Transport vs Ranbir Logistics).
  * Shows Total Billable Freight, Total Deductions, Total Paid, and Net Outstanding Balance.
  * Aging buckets: 0–15 Days, 16–30 Days, 31–60 Days, >60 Days.

#### 13. Pump Accounts (`/masters/pumps` & `/masters/pumps/[id]`)
* **Purpose**: Complete double-entry ledger for all 14 affiliated petrol pumps.
* **Features**:
  * Pump List: Name, Location, Current Ledger Balance (Debit/Credit).
  * Pump Detail Page:
    * Statement table of all diesel slips debited.
    * Record Payment to Pump (bank transfer credits).
    * Running balance ledger matching `pump details.xlsx`.

#### 14. Reports & Analytics (`/reports`)
* **Purpose**: Comprehensive registers and exportable statements for tax, auditing, and owner settlement.
* **Reports Available**:
  * Source Dispatch Register (filtered by source agent).
  * Destination Mandi Register (filtered by mandi/mill).
  * Petrol Pump Ledger Statements.
  * Transporter Freight & Settlement Summary (Ranbir Logistics vs RS Transport).
  * Export options: Download CSV, Export Excel, Print-ready PDF.

---

### Domain 3: Master Data

#### 15. Truck Master (`/masters/trucks`, `/masters/trucks/new`, `/masters/trucks/[id]`)
* **Purpose**: Vehicle fleet directory.
* **Fields**: Registration Number (e.g. `RJ07GD2004`), Owner Name, Mobile No, Truck Type (14 Tyre, 18 Tyre, 22 Tyre, 10 Tyre).
* **Detail View**: Vehicle trip history, past tare weight records, and settlement history.

#### 16. Sources, Destinations & Parties Masters
* **Sources Master (`/masters/sources`)**: 6 booking agents with contact numbers.
* **Destinations Master (`/masters/destinations`)**: Delivery mandis, cities, and states (Rajasthan, Punjab, Haryana, Gujarat).
* **Parties Master (`/masters/parties`)**: Unloading mills and consigned parties mapped by destination.

---

### Domain 4: System & Administration

#### 17. Excel Migration Engine (`/migration`)
* **Purpose**: Bulk data intake from historical workbooks (`TRUCK DETAILS.xlsx`, `RANBIR LOGISTICS.xlsx`, `RS TRANSPORT COMPANY (1).xlsx`, `pump details.xlsx`).
* **Features**:
  * Workbook sheet parser and validation preview.
  * Deduplication engine matching existing trucks and sources.
  * Live import progress and verified import statistics.

#### 18. Settings & Company Switcher (`/settings`)
* **Purpose**: System configuration and multi-firm context switcher.
* **Dual Firm Engine**: Toggle between **RS Transport Company** (Blue theme) and **Ranbir Logistics** (Emerald theme) via the header pill or settings. All queries and dispatches partition data by `company_code`.

---

## 📱 5. Responsive Design Standards Across All Resolutions

The software is engineered with a mobile-first, multi-breakpoint responsive architecture:

| Breakpoint | Target Devices | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile (< 640px)** | iPhone, Android phones | Sidebar hidden in slide-in drawer toggled via header hamburger menu (`Menu` icon); forms collapse to 1 column; table horizontal scroll with touch momentum; padding `p-4`. |
| **Tablet (640px – 1023px)** | iPad, Android tablets | Drawer navigation with backdrop blur; 2-column form grids; stat cards 2-column; table horizontal scroll; padding `p-6`. |
| **Desktop (1024px – 1439px)** | Laptops, standard monitors | Permanent fixed sticky sidebar (`w-72`); 2 to 3 column form grids; top search bar visible; padding `p-8`. |
| **Ultra-Wide ($\ge$ 1440px)** | 2K, 4K, 1440p+ displays | Centered maximum container width (`max-w-7xl` or `max-w-6xl`) preventing excessive horizontal stretching; high-density 4-column stat cards. |

### Mobile Design Best Practices Implemented:
1. **Drawer Navigation**: [MobileNavContext.tsx](file:///media/yuvraj/New%20Volume/xamp/htdocs/Rs_transport/frontend/src/context/MobileNavContext.tsx) provides global drawer state. Navigating to any link automatically closes the drawer.
2. **Horizontal Table Scroll**: [DataTable.tsx](file:///media/yuvraj/New%20Volume/xamp/htdocs/Rs_transport/frontend/src/components/ui/DataTable.tsx) wraps all tabular views in `overflow-x-auto` to prevent viewport breakages.
3. **Touch Targets**: All buttons, select menus, and inputs maintain a minimum height of `44px` (`h-11` or `h-12`) with ample tap targets.
4. **Adaptive Containers**: Main page containers utilize responsive padding (`p-4 sm:p-6 lg:p-8`).

---

## 📏 6. Strict Code Modular File Guidelines (< 250 Lines)

To maintain long-term maintainability, avoid monolithic code creep, and ensure optimal LLM context efficiency, the following rule is strictly enforced:

> [!IMPORTANT]
> **No code file in `frontend/src` or `backend/src` may exceed 200–250 lines.**
> If a file approaches 230 lines, it must be proactively decomposed into modular subcomponents or helper services.

### Decomposition Patterns:
1. **Forms**: Split into `HeaderFields.tsx`, `TruckSection.tsx`, `SummarySidebar.tsx`, and `SubmitHandler.ts`.
2. **Modals**: Move each dialog (`QuickAddTruckModal`, `QuickAddSourceModal`, `QuickAddPartyModal`, `ConfirmDeleteModal`) into dedicated component files under `components/<module>/`.
3. **Data Tables**: Encapsulate table column definitions and actions cleanly.
4. **Services**: Split backend controller routes and services by operational subdomain.
5. **Delete Confirmation**: Always prompt with `ConfirmDeleteModal` before performing DELETE actions.
