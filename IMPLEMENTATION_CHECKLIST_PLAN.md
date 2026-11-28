# RS Transport ERP — Comprehensive Feature & Fix Checklist Plan

This document details the architecture, database changes, backend endpoints, and UI/UX updates across **Backend (NestJS)**, **Web Frontend (Next.js)**, and **Mobile/Desktop (Flutter)** to implement all requested features and fixes.

---

## 1. Custom Product Item & SR/Ref Number (6-Digit)
### What Will Be Done
- Persist custom-added commodities/products in the database (in addition to `localStorage`) so they appear in the dropdown across all browsers and mobile devices.
- Support **SR / Ref Number** up to **6 digits** (`maxLength={6}`, numeric/alphanumeric validation).

### Interface & Implementation
- **Database (`db.service.ts`)**:
  - Create `custom_products` table (`id`, `name`, `created_at`).
- **Backend (`masters/products` or `dispatches`)**:
  - `GET /masters/products` & `POST /masters/products` to list and save custom products.
  - Update `CreateDispatchDto` to validate `srNo` up to 6 characters/digits.
- **Web (`CommoditySelect.tsx`, `DispatchHeaderFields.tsx`) & Flutter (`order_setup_card.dart`)**:
  - [ ] Fetch custom products from `GET /masters/products` on mount and save new ones via `POST /masters/products`.
  - [ ] Set `maxLength={6}` on the SR / Ref Number input.

---

## 2. Dispatch vs. Unloading Slip & Weight Rules
### What Will Be Done
- **At Dispatch Creation**: Attachment slip (`slip_image`) and loading weight are **optional**; only **number of bales** per truck is required.
- **At Unloading / Trip Recording**: **Unloading slip**, **loading weight**, and **unloading weight slip** are **compulsory**.
- **Workflow Prompt**: When a dispatch is marked fixed/loaded, automatically prompt the user to enter the **unloading slip entry**.

### Interface & Implementation
- **Backend (`CreateDispatchDto`, `CreateTripDto`)**:
  - [ ] Ensure `slipImage` and `weight` are `@IsOptional()` in `CreateDispatchDto`; `bales` is `@IsNotEmpty()`.
  - [ ] Enforce `slipImage`, `grossWeight` (loading weight), and `tareWeight`/unloading slip as required in `CreateTripDto`.
- **Web (`dispatches/new/page.tsx`, `trips/new/page.tsx`) & Flutter (`new_dispatch_form.dart`, `new_trip_form.dart`)**:
  - [ ] Remove required asterisks/validation from Dispatch slip & loading weight; keep Bales required.
  - [ ] Add required validation on Unloading Slip + Loading/Unloading Weight in New Trip form.
  - [ ] After Dispatch is fixed/saved, show an inline modal/CTA: **"Record Unloading Slip Now →"** routing to `/trips/new?dispatchId=...`.

---

## 3. Diesel Entry vs. Dispatch Mismatch & Smart Alerts
### What Will Be Done
- **Diesel Entry Without Dispatch**: If a diesel/fuel entry has a `truck_no` that is **not** in any active dispatch entry, highlight that row in red/amber with a warning badge.
- **Dispatch Without Diesel Slip**: If a truck has an active dispatch/trip entry but **no** diesel slip entry for that trip, raise an alert.
- **Admin Alerts Center**: Centralize all operational alerts (Missing Diesel Slip, Unmatched Diesel Entry, Pending Pump Settlements).

### Interface & Implementation
- **Backend (`fuel.service.ts`, `activity.service.ts`)**:
  - [ ] In `GET /fuel`, join/check `dispatches` to return `has_active_dispatch: boolean`.
  - [ ] Add `GET /alerts` endpoint returning:
    1. `dispatches_without_fuel`: Dispatched trucks missing a diesel slip.
    2. `fuel_without_dispatch`: Diesel entries whose truck has no matching dispatch.
    3. `pending_pump_settlements`: Unpaid pump ledger balances.
- **Web (`fuel/page.tsx`, `dashboard/page.tsx`) & Flutter (`fuel_screen.dart`, `fuel_mobile_card.dart`)**:
  - [ ] Highlight unmatched diesel rows (`!has_active_dispatch`) with an amber/red border and `"No Dispatch Found"` badge.
  - [ ] Display an **Alerts Banner / Bell** in Admin Dashboard & Header.

---

## 4. Dedicated Manager Endpoints, Company Assignment & Time-Slot Fix
### What Will Be Done
- **Dedicated Manager Endpoints**: Create `/manager/*` endpoints (or strict JWT-enforced filters) so **every** Manager view strictly returns **Today & Yesterday** data only—fixing any page currently returning older records.
- **Hide Pump Accounts**: Remove Pump Accounts from Manager dashboard, sidebar, and API access.
- **Company Assignment**: Admin can assign each Manager to **`RS_TRANSPORT`**, **`RANBIR_LOGISTICS`**, or **`ALL`**, locking the Manager to their assigned firm.
- **Custom Time-Slot Fix**: Fix Admin's custom time-limit (`access_start` to `access_end`) and daily approval/unlock so Manager access is strictly governed by Admin's configured slot + daily approval.

### Interface & Implementation
- **Database (`db.service.ts`)**:
  - [ ] Add `assigned_company VARCHAR(30) NOT NULL DEFAULT 'ALL'` to `users`.
- **Backend (`manager.controller.ts` / `auth.service.ts`)**:
  - [ ] Create dedicated `/manager/dashboard`, `/manager/dispatches`, `/manager/trips`, `/manager/trucks`, `/manager/sources` endpoints that enforce `DATE(...) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)` and `company_code = user.assigned_company` (when not `ALL`).
  - [ ] Fix `updateUser` & `getAccessStatus` so Admin's custom `access_start` / `access_end` and daily unlock work reliably.
- **Web (`approvals/page.tsx`, `Sidebar.tsx`) & Flutter (`approvals_screen.dart`, `erp_sidebar.dart`)**:
  - [ ] Add **Assigned Company** dropdown (`RS_TRANSPORT`, `RANBIR_LOGISTICS`, `ALL`) in Admin → Users.
  - [ ] Lock Manager company switcher if assigned to a single company.

---

## 5. Source Master Advanced Date Filter & Station Breakdown
### What Will Be Done
- Filter Source Master by **From Date A** to **To Date B**.
- For each Source / Party, show:
  - Stations unloaded at
  - Number of trips/entries per station
  - Total vehicles gone
  - Total bales so far / shifted till date
  - Total weight shifted in **Tons (MT)**

### Interface & Implementation
- **Backend (`sources.service.ts`)**:
  - [ ] Update `GET /masters/sources` and `GET /masters/sources/:id` to accept `fromDate` and `toDate` query params.
  - [ ] Aggregate `trips` + `dispatches` grouped by `destination_id` (`station_name`): `trip_count`, `total_vehicles`, `total_bales`, `total_weight_mt`.
- **Web (`masters/sources/page.tsx`, `masters/sources/[id]/page.tsx`) & Flutter (`sources_screen.dart`)**:
  - [ ] Add `From Date` and `To Date` pickers.
  - [ ] Render expandable/detailed Station Breakdown table/cards showing Station, Trips, Vehicles, Bales, and Weight (MT).

---

## 6. Pump Section Payment Settlement Upload
### What Will Be Done
- Allow Admin to upload/record a **Payment Settlement** (amount, UTR/ref, date, slip image) directly against Pump Accounts.

### Interface & Implementation
- **Backend (`pumps.controller.ts`, `pumps.service.ts`)**:
  - [ ] Add `POST /masters/pumps/:id/settle` to record a credit/payment entry in `pump_ledger` with optional `slip_image` and update balance.
- **Web (`masters/pumps/[id]/page.tsx`) & Flutter (`pumps_screen.dart`)**:
  - [ ] Add **"Upload Pump Settlement"** modal/form with amount, UTR/Ref, date, and slip attachment.

---

## 7. 7:00 PM Daily End-of-Day (EOD) Summary
### What Will Be Done
- Provide a complete **7:00 PM Daily Summary** covering:
  - Payments Resolved
  - Pending Payments
  - Pending Settlements
  - Parties Done
  - Total Dispatches & Total Trucks Dispatched
  - Settlements Completed Today

### Interface & Implementation
- **Backend (`dashboard.service.ts` / `reports`)**:
  - [ ] Add `GET /dashboard/eod-summary?date=YYYY-MM-DD` aggregating all today's counts and totals.
- **Web (`dashboard/page.tsx` / `reports/page.tsx`) & Flutter (`reports_screen.dart`)**:
  - [ ] Add **"7:00 PM EOD Summary"** card/modal with one-click refresh and export/print.

---

## 8. Internal Content Auto-Refresh
### What Will Be Done
- Automatically refresh internal table/card data after any create, edit, approve, reject, or settlement action—without requiring a full browser reload.

### Interface & Implementation
- **Web & Flutter**:
  - [ ] Ensure every mutation callback (`onSaved`, `handleApprove`, `handleReject`, `handleCreateUser`, `handleSettle`) triggers a state re-fetch of the active list/KPIs.

