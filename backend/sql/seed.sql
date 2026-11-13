-- RS Transport ERP Initial Master Seed Data

-- 1. Default Super Admin (password: admin123)
-- bcrypt hash for 'admin123': $2a$10$wN9a32yS3HkYqR.s07tFbe8/a8Q9f4YnN18g4s2n1mKj8K4k6J7Ce
INSERT INTO users (username, password_hash, full_name, role)
VALUES ('admin', '$2a$10$wN9a32yS3HkYqR.s07tFbe8/a8Q9f4YnN18g4s2n1mKj8K4k6J7Ce', 'Super Administrator', 'SUPER_ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 2. Booking Sources (from TRUCK DETAILS.xlsx)
INSERT INTO sources (name) VALUES
  ('BITTU BRAR'),
  ('SARPANCH AADNIA MAJA'),
  ('HAPPY SARPANCH'),
  ('BHAGTA BHAI'),
  ('JALAJ GIDARPINDI'),
  ('DSBC TARN TARAN')
ON CONFLICT (name) DO NOTHING;

-- 3. Destinations (from RANBIR LOGISTICS.xlsx & RS TRANSPORT COMPANY.xlsx)
INSERT INTO destinations (name) VALUES
  ('BHADRA'),
  ('MANDRELLA'),
  ('CHATTARGARH'),
  ('SARDARSHAHAR'),
  ('JASRASAR'),
  ('BHANIPURA')
ON CONFLICT (name) DO NOTHING;

-- 4. Transporters
INSERT INTO transporters (name) VALUES
  ('R.S TRANSPORT'),
  ('RANBIR LOGISTICS'),
  ('RAJPAL')
ON CONFLICT (name) DO NOTHING;

-- 5. Petrol Pumps (14 Pumps from pump details.xlsx)
INSERT INTO pumps (name, opening_balance) VALUES
  ('AMIYA HP KKP', 0.00),
  ('HAPPY PUMP', 0.00),
  ('SR NAYARA PUMP', 0.00),
  ('SODHI PUMP', 0.00),
  ('IOC PUMP ROMANA', 0.00),
  ('DODA PUMP', 0.00),
  ('JAGJIT DHARAMKOT', 0.00),
  ('USTAT ENERGY MUDKI', 0.00),
  ('RS AULAKH IOC', 0.00),
  ('BAJAJ IOC', 0.00),
  ('RS AULAKH HP', 0.00),
  ('CJ OILS', 0.00),
  ('SAMANDEEP ONENESS', 0.00),
  ('JASKIRAT HP', 0.00)
ON CONFLICT (name) DO NOTHING;

