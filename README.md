# 🚛 RS Transport ERP – Enterprise System Guide

**RS Transport ERP** is a centralized Transport Management, Freight Settlement, Weighbridge Integration & Petrol Pump Double-Entry Accounting Platform.

---

## 📌 Table of Contents
1. [Why "Offline Mode" Appeared & How to Connect Live](#1-why-offline-mode-appeared--how-to-connect-live)
2. [Desktop Execution Options (.exe & Linux)](#2-desktop-execution-options-exe--linux)
3. [Complete System Scan: Modules, Data Entry & Upload Options](#3-complete-system-scan-modules-data-entry--upload-options)
   - [A. Dispatches & Gate Passes](#a-dispatches--gate-passes)
   - [B. Weighbridge & Delivery Trips](#b-weighbridge--delivery-trips)
   - [C. Petrol Pumps & Fuel Ledger](#c-petrol-pumps--fuel-ledger)
   - [D. Driver Freight Settlements](#d-driver-freight-settlements)
   - [E. Plant Pass Excel Intake & Reconciliation](#e-plant-pass-excel-intake--reconciliation)
   - [F. Masters & Fleet Registry](#f-masters--fleet-registry)
   - [G. Multi-Firm Switching](#g-multi-firm-switching)
4. [Quick Start: Running Web & Desktop](#4-quick-start-running-web--desktop)

---

## 1. Why "Offline Mode" Appeared & How to Connect Live

The system is designed with an **Offline-First Outbox Engine**:
- When the frontend/desktop client cannot reach the NestJS Backend (`http://127.0.0.1:4000`), it automatically falls back to **Offline Mode** so users at remote weighbridges or petrol pumps can continue operating without crashing.
- **To switch to Live Online Mode**, simply start the backend server:
  ```bash
  cd "/media/yuvraj/New Volume/xamp/htdocs/Rs_transport/backend"
  npm run start:dev
  ```
  *(Verify MySQL is active on port `3306` in XAMPP).*
- Once the backend is running, the top navigation pill instantly changes from `🟡 Offline Mode` to `🟢 Local Offline DB` or `🟢 Online Synced`.

---

## 2. Desktop Execution Options (.exe & Linux)

### Option A: The Full-Featured Dedicated Desktop App (Recommended)
This packages **100% of all 28 pages, modals, Excel uploaders, and image attachment features** into a standalone window without browser toolbars:

- **Linux Desktop**:
  ```bash
  "/media/yuvraj/New Volume/xamp/htdocs/Rs_transport/desktop/launch_rs_transport_linux.sh"
  ```
- **Windows Desktop (`.exe`)**:
  - Run `desktop\Launch_RS_Transport_ERP.bat`
  - Or generate the standalone installer `.exe`:
    ```bash
    cd desktop && npm install && npm run dist:win
    ```
    *(Outputs `RS Transport ERP Setup.exe` in `desktop/dist-electron/`)*.

### Option B: The Mobile/Desktop Flutter Client (`flutter_app/`)
- Best for Android handhelds or driver tablets.
- Run via: `cd flutter_app && flutter run -d linux` (or `-d android` / `-d windows`).

---

## 3. Complete System Scan: Modules, Data Entry & Upload Options

### A. Dispatches & Gate Passes (`/dispatches` & `/dispatches/new`)
* **Entry Modes**:
  * **Single Truck Dispatch**: Quick single-vehicle gate pass.
  * **Multi-Truck Dispatch (Same Order)**: Dispatches multiple vehicles under one master contract with shared commodity and destination.
* **Data Entry Fields**:
  * **Order Header**: Dispatch Date, Commodity Select (`Cotton Bales`, `Paddy`, `Mustard`, `Wheat`, `Custom`), Source Hub, Destination Mill.
  * **Per-Truck Fields**: Independent searchable `TruckSelect` autocomplete, Owner name & contact auto-fill, Bales count, Driver mobile.
  * **Weighing Fields**: Gross Weight, Tare Weight, Auto-computed Net Weight (`Gross − Tare`).
  * **Tare History**: Clickable previous tare weight pills (`GET /masters/trucks/:id/recent-tare`).
* **Upload & Media Options**:
  * **Dharamkanta Slip Photo Upload**: Upload independent scale slip photos per truck (up to 50MB base64).
* **On-the-Fly Modals**:
  * `+ Add Truck` modal, `+ Add Source` modal, `+ Add Destination` modal.
* **Sidebars & Summaries**:
  * Sticky `DispatchSummarySidebar`: Displays total trucks, aggregate bales, total weight, and contract details.
* **Row Actions**: View slip modal, Print gate pass, Delete with `ConfirmDeleteModal`.

---

### B. Weighbridge & Delivery Trips (`/trips` & `/trips/new`)
* **Entry Modes**:
  * **Single Trip**: Unloading of a single vehicle.
  * **Multi-Truck Unloading**: Multiple vehicles delivering under one party consignment.
* **Data Entry Fields**:
  * **Consignment Header**: Unloading Date, Party / Customer Select, "Unloaded on Transporter" dropdown.
  * **Per-Trip Fields**: Truck selection, Linked Dispatch Slip (optional auto-link), Rate per Unit (MT / Quintal / Bale).
  * **Weighbridge Weights**: Gross Weight, Tare Weight, Auto-computed Net Weight MT.
  * **Financial Formula**: `Gross Freight = Net Weight × Rate per Unit`.
* **Upload & Media Options**:
  * **Weighbridge Dharamkanta Slip Photo**: Upload factory scale slip per vehicle with instant preview.
* **On-the-Fly Modals**:
  * `+ Add Party` modal, `+ Add Transporter` modal.
* **Sidebars & Summaries**:
  * Sticky `TripFreightSidebar`: Real-time Gross Freight calculation, weight summaries, and rate validation.
* **Row Actions**: Fullscreen slip photo modal, Delete trip with linked settlement cleanup.

---

### C. Petrol Pumps & Fuel Ledger (`/fuel` & `/fuel/new`)
* **Data Entry Fields**:
  * **Pump Selection**: Select from registered petrol pumps (e.g. Nayara, Reliance, HPCL, IOCL).
  * **Truck Selection**: Searchable `TruckSelect` autocomplete.
  * **Transaction Info**: Slip Date, Slip Number, Fuel Type (Diesel, Petrol, DEF/AdBlue).
  * **Amounts**: Quantity (Liters), Rate per Liter, Total Amount (`Liters × Rate`).
  * **Trip Linkage**: Option to link fuel slip as advance deduction on an active trip.
* **Upload & Media Options**:
  * **Fuel Receipt Photo**: Image upload for stamped pump cash memo with preview & remove buttons.
* **Sidebars & Summaries**:
  * Sticky `FuelImpactSidebar`: Shows real-time ledger impact and updated balance on the selected petrol pump.
* **Row Actions**: View fuel receipt photo modal, Delete fuel slip with pump balance reversal.

---

### D. Driver Freight Settlements (`/settlements` & `/settlements/new`)
* **Data Entry Fields**:
  * **Trip Selection**: Dropdown displaying `Trip # | Truck # | Transporter | Gross Freight`.
  * **Transporter Card**: Auto-displays the transporter who unloaded the vehicle.
  * **Settlement Date & Payment Method**: Cash, Bank Transfer, Cheque, Petrol Pump Adjustment.
  * **Automatic Deductions**:
    * Diesel Advance: Auto-fetched from linked pump fuel slips.
    * Cash Advances: Additional cash given during transit.
    * Brokerage / Commission: Fixed or percentage commission.
    * Other Deductions / Shortage: Penalties for tare loss or moisture cuts.
  * **Financial Formulas**:
    * `Net Payable = Gross Freight − Diesel Advance − Cash Advance − Commission − Other Deductions`
    * `Outstanding Balance = Net Payable − Total Paid`
* **Deficit Alert**:
  * `PriorDeficitAlert`: Warns operator if the vehicle owner carries negative balance from previous trips.
* **Upload & Media Options**:
  * **Settlement Voucher / Bilty Photo**: Attach physical signed settlement voucher.
  * **Sidebar Inspector**: Inspect the linked trip's Dharamkanta scale slip while calculating deductions!
* **Row Actions**: View settlement voucher modal, Delete settlement with payment link cleanup.

---

### E. Plant Pass Excel Intake & Reconciliation (`/masters/trucks/reconcile`)
* **Reference Intake Support**: Directly parses weighbridge workbooks (e.g. `RS TRANSPORT COMPANY Plant Pass.xlsx`).
* **Column Mapping Drawer**: Customizable column mapping (`VEHICLE_NUMBER`, `IN DATE`, `VENDOR`, `NET_WT`, `BALEQTY`, `From Location`, `Freight rate`, `Freight Amount`).
* **Filters**:
  * Source Sheet filter.
  * Party / Vendor filter.
  * Match Status filter (`All Statuses`, `Matched in ERP`, `Missing in ERP`).
* **Data Table Features**:
  * Smooth continuous scrolling without pagination breaks (`disablePagination={true}`, `maxHeight="650px"`).
  * Sticky table header.
* **Side-by-Side Comparison Columns**:
  1. **Truck No**: Vehicle registration plate.
  2. **Source / From**: Dispatch origin or gate pass location.
  3. **Destination / Party**: Vendor / party name.
  4. **Excel Qty / Wt**: Gate pass weight (Quintals / MT).
  5. **ERP Activity**: Live system trips and bales.
  6. **Freight (ERP)**: Live gross freight in database.
  7. **Diesel (ERP)**: Live fuel advances in database.
  8. **Paid Amount (ERP)**: Payments released.
  9. **Outstanding Balance**: Live remaining balance (**Bold Red** if $> 0$, **Green ₹0.00** if settled).
  10. **Registry Status**: `REGISTERED` badge vs. `MISSING IN DB` (+ Register link).
  11. **Action**: `Party Breakdown →` drilldown into all trip slips for that truck.
* **Summary Bar**:
  * Filtered Rows & Trucks count.
  * Registered in ERP vs. Missing in ERP count.
  * Total Excel Intake Net Weight (Quintals).
  * Total ERP Gross Freight & Paid amounts.
  * Total System Outstanding Balance.

---

### F. Masters & Fleet Registry
* **Trucks Master (`/masters/trucks` & `/new`)**: Vehicle plates, owner details, mobile, recent tare history, detail views.
* **Transporters Master (`/masters/transporters`)**: Transporter agencies, contact person, primary hubs, linked truck count.
* **Parties Master (`/masters/parties`)**: Customer mills, billing addresses, credit limits, outstanding party balances.
* **Pumps Master (`/masters/pumps`)**: Petrol pump stations, diesel rates, running pump ledger balances.
* **Sources & Destinations (`/masters/sources`, `/masters/destinations`)**: Geographic hubs and textile mill destinations.

---

### G. Multi-Firm Switching
* Click the Company Switcher in the top header to toggle between:
  * **RS Transport Company** (`RS_TRANSPORT`)
  * **Ranbir Logistics** (`RANBIR_LOGISTICS`)
* Automatically scopes dispatches, trips, ledger entries, and settlements to the active firm.

---

## 4. Quick Start: Running Web & Desktop

### Start Local MySQL (Port 3306)
Ensure MySQL is started in XAMPP (`127.0.0.1:3306`).

### Start Web Backend & Frontend:
```bash
# Terminal 1: Backend API
cd backend && npm run start:dev

# Terminal 2: Frontend Web UI
cd frontend && npm run dev
```
* **Web UI:** `http://localhost:3000`
* **API Server:** `http://localhost:4000`

### Start Dedicated Desktop App:
- **Linux**: `./desktop/launch_rs_transport_linux.sh`
- **Windows**: `desktop\Launch_RS_Transport_ERP.bat`
