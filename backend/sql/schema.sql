-- RS Transport ERP: Fixed Centralized Relational PostgreSQL Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'DISPATCH_OPERATOR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Transporter Master
CREATE TABLE IF NOT EXISTS transporters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Truck Master
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  truck_no VARCHAR(20) UNIQUE NOT NULL,
  owner_name VARCHAR(100),
  mobile_no VARCHAR(20),
  truck_type VARCHAR(50),
  capacity NUMERIC(10, 2),
  transporter_id UUID REFERENCES transporters(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Source Master (Booking Agents)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Destination Master
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  state VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Party Master
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Petrol Pump Master
CREATE TABLE IF NOT EXISTS pumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  address TEXT,
  opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Dispatches
CREATE TABLE IF NOT EXISTS dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sr_no VARCHAR(50),
  date DATE NOT NULL,
  truck_id UUID NOT NULL REFERENCES trucks(id),
  source_id UUID NOT NULL REFERENCES sources(id),
  bales NUMERIC(10, 2),
  destination VARCHAR(100),
  remarks TEXT,
  driver_mobile VARCHAR(20),
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Trips
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_no VARCHAR(50) UNIQUE NOT NULL,
  dispatch_id UUID REFERENCES dispatches(id) ON DELETE SET NULL,
  truck_id UUID NOT NULL REFERENCES trucks(id),
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  transporter_id UUID REFERENCES transporters(id) ON DELETE SET NULL,
  unloading_date DATE,
  net_weight NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
  rate_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  gross_freight NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Fuel Transactions
CREATE TABLE IF NOT EXISTS fuel_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  truck_id UUID NOT NULL REFERENCES trucks(id),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  pump_id UUID NOT NULL REFERENCES pumps(id),
  litres NUMERIC(10, 2),
  rate NUMERIC(10, 2),
  amount NUMERIC(12, 2) NOT NULL,
  is_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Advances
CREATE TABLE IF NOT EXISTS advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  truck_id UUID NOT NULL REFERENCES trucks(id),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'CASH',
  remarks TEXT,
  is_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Commissions
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gross_freight NUMERIC(12, 2) NOT NULL,
  advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  diesel_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  commission NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  other_deductions NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  net_payable NUMERIC(12, 2) NOT NULL,
  total_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  outstanding NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER',
  ref_no VARCHAR(100),
  paid_to VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Pump Payments & Ledger
CREATE TABLE IF NOT EXISTS pump_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pump_id UUID NOT NULL REFERENCES pumps(id),
  date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER',
  ref_no VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pump_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pump_id UUID NOT NULL REFERENCES pumps(id),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  credit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_dispatches_date ON dispatches(date);
CREATE INDEX IF NOT EXISTS idx_dispatches_truck ON dispatches(truck_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_source ON dispatches(source_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck ON trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_dest ON trips(destination_id);
CREATE INDEX IF NOT EXISTS idx_trips_party ON trips(party_id);
CREATE INDEX IF NOT EXISTS idx_fuel_truck ON fuel_transactions(truck_id);
CREATE INDEX IF NOT EXISTS idx_fuel_pump ON fuel_transactions(pump_id);
CREATE INDEX IF NOT EXISTS idx_settlements_trip ON settlements(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_settlement ON payments(settlement_id);

