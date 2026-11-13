import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;
  private readonly logger = new Logger(DbService.name);

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'rs_transport_db',
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      multipleStatements: true,
      decimalNumbers: true,
    });
  }

  async onModuleInit() {
    try {
      // 1. Ensure database exists
      const host = process.env.DB_HOST || 'localhost';
      const port = parseInt(process.env.DB_PORT || '3306', 10);
      const user = process.env.DB_USER || 'root';
      const password = process.env.DB_PASSWORD || '';
      const dbName = process.env.DB_NAME || 'rs_transport_db';

      const rootConn = await mysql.createConnection({ host, port, user, password });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await rootConn.end();

      // 2. Connect pool
      const conn = await this.pool.getConnection();
      this.logger.log('Connected to MySQL / MariaDB (XAMPP)');
      conn.release();
      await this.initSchema();
    } catch (err: any) {
      this.logger.warn(`MySQL connection notice: ${err.message}. (Ensure XAMPP MySQL is started on port 3306)`);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> {
    const start = Date.now();
    const [results] = await this.pool.execute(sql, params);
    const duration = Date.now() - start;
    if (duration > 500) {
      this.logger.warn(`Slow query (${duration}ms): ${sql}`);
    }
    return { rows: (results as T[]) || [] };
  }

  async rawQuery<T = any>(sql: string): Promise<any> {
    return this.pool.query(sql);
  }

  async transaction<T>(callback: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await callback(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  private async initSchema() {
    const migrations = [
      'ALTER TABLE dispatches ADD COLUMN driver_mobile VARCHAR(20) NULL',
      "ALTER TABLE dispatches ADD COLUMN company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT'",
      'ALTER TABLE dispatches ADD COLUMN slip_image LONGTEXT NULL',
      'ALTER TABLE parties ADD COLUMN destination_id VARCHAR(36) NULL',
      'ALTER TABLE trips ADD COLUMN gross_weight DECIMAL(10, 3) NOT NULL DEFAULT 0.000',
      'ALTER TABLE trips ADD COLUMN tare_weight DECIMAL(10, 3) NOT NULL DEFAULT 0.000',
      "ALTER TABLE trips ADD COLUMN company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT'",
      'ALTER TABLE trips ADD COLUMN slip_image LONGTEXT NULL',
      "ALTER TABLE settlements ADD COLUMN company_code VARCHAR(30) NOT NULL DEFAULT 'RS_TRANSPORT'",
      'ALTER TABLE settlements ADD COLUMN slip_image LONGTEXT NULL',
      'ALTER TABLE fuel_transactions MODIFY COLUMN pump_id VARCHAR(36) NULL',
      'ALTER TABLE fuel_transactions ADD COLUMN slip_image LONGTEXT NULL',
    ];

    for (const sql of migrations) {
      try {
        await this.pool.query(sql);
      } catch (e: any) {}
    }

    try {
      const schemaPath = path.join(process.cwd(), 'sql', 'schema_mysql.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await this.pool.query(sql);
        this.logger.log('MySQL schema verified/initialized successfully');
      }
    } catch (err: any) {}

    for (const sql of migrations) {
      try {
        await this.pool.query(sql);
      } catch (e: any) {}
    }

    try {
      const seedPath = path.join(process.cwd(), 'sql', 'seed_mysql.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await this.pool.query(seedSql);
        this.logger.log('MySQL master records seeded successfully');
      }
    } catch (err: any) {}
  }
}
