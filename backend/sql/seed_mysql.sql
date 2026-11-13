-- RS Transport ERP Initial Master Seed Data for MySQL / MariaDB

USE rs_transport_db;

-- 1. Default Super Admin (password: admin123)
INSERT INTO users (id, username, password_hash, full_name, role)
SELECT UUID(), 'admin', '$2a$10$wN9a32yS3HkYqR.s07tFbe8/a8Q9f4YnN18g4s2n1mKj8K4k6J7Ce', 'Super Administrator', 'SUPER_ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- 2. Booking Sources (from TRUCK DETAILS.xlsx)
INSERT INTO sources (id, name)
SELECT UUID(), 'BITTU BRAR' WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'BITTU BRAR');
INSERT INTO sources (id, name)
SELECT UUID(), 'SARPANCH AADNIA MAJA' WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'SARPANCH AADNIA MAJA');
INSERT INTO sources (id, name)
SELECT UUID(), 'HAPPY SARPANCH' WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'HAPPY SARPANCH');
INSERT INTO sources (id, name)
SELECT UUID(), 'BHAGTA BHAI' WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'BHAGTA BHAI');
INSERT INTO sources (id, name)
SELECT UUID(), 'JALAJ GIDARPINDI' WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'JALAJ GIDARPINDI');
INSERT INTO sources (id, name)
SELECT UUID(), 'DSBC TARN TARAN' WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'DSBC TARN TARAN');

-- 3. Destinations
INSERT INTO destinations (id, name)
SELECT UUID(), 'BHADRA' WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'BHADRA');
INSERT INTO destinations (id, name)
SELECT UUID(), 'MANDRELLA' WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'MANDRELLA');
INSERT INTO destinations (id, name)
SELECT UUID(), 'CHATTARGARH' WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'CHATTARGARH');
INSERT INTO destinations (id, name)
SELECT UUID(), 'SARDARSHAHAR' WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'SARDARSHAHAR');
INSERT INTO destinations (id, name)
SELECT UUID(), 'JASRASAR' WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'JASRASAR');
INSERT INTO destinations (id, name)
SELECT UUID(), 'BHANIPURA' WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = 'BHANIPURA');

-- 4. Transporters
INSERT INTO transporters (id, name)
SELECT UUID(), 'R.S TRANSPORT' WHERE NOT EXISTS (SELECT 1 FROM transporters WHERE name = 'R.S TRANSPORT');
INSERT INTO transporters (id, name)
SELECT UUID(), 'RANBIR LOGISTICS' WHERE NOT EXISTS (SELECT 1 FROM transporters WHERE name = 'RANBIR LOGISTICS');
INSERT INTO transporters (id, name)
SELECT UUID(), 'RAJPAL' WHERE NOT EXISTS (SELECT 1 FROM transporters WHERE name = 'RAJPAL');

-- 5. Petrol Pumps (14 Pumps from pump details.xlsx)
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'AMIYA HP KKP', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'AMIYA HP KKP');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'HAPPY PUMP', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'HAPPY PUMP');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'SR NAYARA PUMP', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'SR NAYARA PUMP');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'SODHI PUMP', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'SODHI PUMP');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'IOC PUMP ROMANA', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'IOC PUMP ROMANA');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'DODA PUMP', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'DODA PUMP');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'JAGJIT DHARAMKOT', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'JAGJIT DHARAMKOT');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'USTAT ENERGY MUDKI', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'USTAT ENERGY MUDKI');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'RS AULAKH IOC', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'RS AULAKH IOC');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'BAJAJ IOC', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'BAJAJ IOC');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'RS AULAKH HP', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'RS AULAKH HP');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'CJ OILS', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'CJ OILS');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'SAMANDEEP ONENESS', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'SAMANDEEP ONENESS');
INSERT INTO pumps (id, name, opening_balance)
SELECT UUID(), 'JASKIRAT HP', 0.00 WHERE NOT EXISTS (SELECT 1 FROM pumps WHERE name = 'JASKIRAT HP');

