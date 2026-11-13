-- RS Transport ERP: Fixed Centralized Relational MySQL / MariaDB Schema (XAMPP Ready)

CREATE DATABASE IF NOT EXISTS rs_transport_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rs_transport_db;

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'DISPATCH_OPERATOR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Transporter Master
CREATE TABLE IF NOT EXISTS transporters (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Truck Master
CREATE TABLE IF NOT EXISTS trucks (
  id VARCHAR(36) PRIMARY KEY,
  truck_no VARCHAR(20) UNIQUE NOT NULL,
  owner_name VARCHAR(100),
  mobile_no VARCHAR(20),
  truck_type VARCHAR(50),
  capacity DECIMAL(10, 2),
  transporter_id VARCHAR(36),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transporter_id) REFERENCES transporters(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Source Master (Booking Agents)
CREATE TABLE IF NOT EXISTS sources (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Destination Master
CREATE TABLE IF NOT EXISTS destinations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  state VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Party Master
CREATE TABLE IF NOT EXISTS parties (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  destination_id VARCHAR(36),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Petrol Pump Master
CREATE TABLE IF NOT EXISTS pumps (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  address TEXT,
  opening_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Dispatches
CREATE TABLE IF NOT EXISTS dispatches (
  id VARCHAR(36) PRIMARY KEY,
  sr_no VARCHAR(50),
  date DATE NOT NULL,
  truck_id VARCHAR(36) NOT NULL,
  source_id VARCHAR(36) NOT NULL,
  bales DECIMAL(10, 2),
  tare_weight DECIMAL(10, 3) NULL DEFAULT 0.000,
  gross_weight DECIMAL(10, 3) NULL DEFAULT 0.000,
  net_weight DECIMAL(10, 3) NULL DEFAULT 0.000,
  destination VARCHAR(100),
  remarks TEXT,
  driver_mobile VARCHAR(20),
  slip_image LONGTEXT NULL,
  company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT',
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (source_id) REFERENCES sources(id)
) ENGINE=InnoDB;

-- 9. Trips
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(36) PRIMARY KEY,
  trip_no VARCHAR(50) UNIQUE NOT NULL,
  dispatch_id VARCHAR(36),
  truck_id VARCHAR(36) NOT NULL,
  destination_id VARCHAR(36),
  party_id VARCHAR(36),
  transporter_id VARCHAR(36),
  unloading_date DATE,
  gross_weight DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  tare_weight DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  net_weight DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  rate_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  gross_freight DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  slip_image LONGTEXT NULL,
  company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT',
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dispatch_id) REFERENCES dispatches(id) ON DELETE SET NULL,
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL,
  FOREIGN KEY (transporter_id) REFERENCES transporters(id) ON DELETE SET NULL
) ENGINE=InnoDB;
-- 10. Fuel Transactions
CREATE TABLE IF NOT EXISTS fuel_transactions (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  truck_id VARCHAR(36) NOT NULL,
  trip_id VARCHAR(36),
  pump_id VARCHAR(36) NOT NULL,
  litres DECIMAL(10, 2),
  rate DECIMAL(10, 2),
  amount DECIMAL(12, 2) NOT NULL,
  slip_image LONGTEXT NULL,
  is_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  FOREIGN KEY (pump_id) REFERENCES pumps(id)
) ENGINE=InnoDB;
-- 11. Advances
CREATE TABLE IF NOT EXISTS advances (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  truck_id VARCHAR(36) NOT NULL,
  trip_id VARCHAR(36),
  amount DECIMAL(12, 2) NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'CASH',
  remarks TEXT,
  is_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
) ENGINE=InnoDB;
-- 12. Commissions
CREATE TABLE IF NOT EXISTS commissions (
  id VARCHAR(36) PRIMARY KEY,
  trip_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- 13. Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id VARCHAR(36) PRIMARY KEY,
  trip_id VARCHAR(36) UNIQUE NOT NULL,
  settlement_date DATE NOT NULL,
  gross_freight DECIMAL(12, 2) NOT NULL,
  advance_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  diesel_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  commission DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  other_deductions DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  net_payable DECIMAL(12, 2) NOT NULL,
  total_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  outstanding DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  slip_image LONGTEXT NULL,
  company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT',
  status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Payments
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  settlement_id VARCHAR(36) NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER',
  ref_no VARCHAR(100),
  paid_to VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (settlement_id) REFERENCES settlements(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Pump Payments & Ledger
CREATE TABLE IF NOT EXISTS pump_payments (
  id VARCHAR(36) PRIMARY KEY,
  pump_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER',
  ref_no VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pump_id) REFERENCES pumps(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS pump_ledger (
  id VARCHAR(36) PRIMARY KEY,
  pump_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  credit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pump_id) REFERENCES pumps(id)
) ENGINE=InnoDB;
-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  old_values JSON,
  new_values JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Key Indexes
CREATE INDEX idx_disp_date ON dispatches(date);
CREATE INDEX idx_disp_truck ON dispatches(truck_id);
CREATE INDEX idx_disp_src ON dispatches(source_id);
CREATE INDEX idx_trip_trk ON trips(truck_id);
CREATE INDEX idx_trip_dest ON trips(destination_id);
CREATE INDEX idx_fuel_trk ON fuel_transactions(truck_id);
CREATE INDEX idx_fuel_pmp ON fuel_transactions(pump_id);
CREATE INDEX idx_settle_trp ON settlements(trip_id);
CREATE INDEX idx_pmt_stl ON payments(settlement_id);

