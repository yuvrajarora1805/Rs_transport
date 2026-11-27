import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from '../db/db.service';
import { ActivityService } from '../activity/activity.service';
import { UserRow } from '../db/db.types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DbService,
    private jwtService: JwtService,
    private activityService: ActivityService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const res = await this.db.query<UserRow>(
      'SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE username = ?',
      [username],
    );
    const user = res.rows[0];

    if (user && user.is_active) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (isMatch) {
        const { password_hash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    await this.activityService.logAction(user, 'LOGIN', 'auth', user.id, `Manager ${user.username} logged in`);
    return {
      success: true,
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
      },
    };
  }

  async listUsers() {
    const res = await this.db.query(
      'SELECT id, username, full_name, role, is_active, access_start, access_end, temp_unlocked_until FROM users ORDER BY username ASC',
    );
    return res.rows;
  }

  async createUser(body: { username: string; password: string; fullName?: string; role?: string }) {
    const existing = await this.db.query('SELECT id FROM users WHERE username = ?', [body.username]);
    if (existing.rows.length > 0) {
      throw new ConflictException(`Username "${body.username}" already exists`);
    }
    const id = uuidv4();
    const hash = await bcrypt.hash(body.password, 10);
    const role = body.role === 'ADMIN' || body.role === 'SUPER_ADMIN' ? body.role : 'MANAGER';
    await this.db.query(
      'INSERT INTO users (id, username, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [id, body.username, hash, body.fullName || body.username, role],
    );
    return { id, username: body.username, fullName: body.fullName || body.username, role };
  }

  async updateUser(id: string, body: { fullName?: string; role?: string; password?: string; accessStart?: string; accessEnd?: string }) {
    const role = body.role === 'ADMIN' || body.role === 'SUPER_ADMIN' ? body.role : 'MANAGER';
    const start = body.accessStart || '09:00';
    const end = body.accessEnd || '19:00';
    if (body.password && body.password.trim().length >= 6) {
      const hash = await bcrypt.hash(body.password.trim(), 10);
      await this.db.query(
        'UPDATE users SET full_name = ?, role = ?, password_hash = ?, access_start = ?, access_end = ? WHERE id = ?',
        [body.fullName || '', role, hash, start, end, id],
      );
    } else {
      await this.db.query(
        'UPDATE users SET full_name = ?, role = ?, access_start = ?, access_end = ? WHERE id = ?',
        [body.fullName || '', role, start, end, id],
      );
    }
    return { success: true, id };
  }

  async deleteUser(id: string) {
    await this.db.query('DELETE FROM users WHERE id = ?', [id]);
    return { success: true, id };
  }

  async getAccessStatus(user: any) {
    if (!user || user.role !== 'MANAGER') {
      return { locked: false };
    }
    const res = await this.db.query(
      'SELECT access_start, access_end, temp_unlocked_until FROM users WHERE id = ?',
      [user.id],
    );
    const row: any = res.rows[0] || {};
    const start = row.access_start || '09:00';
    const end = row.access_end || '19:00';
    const tempUntil = row.temp_unlocked_until ? new Date(row.temp_unlocked_until) : null;
    if (tempUntil && tempUntil > new Date()) {
      return { locked: false, accessStart: start, accessEnd: end, tempUnlockedUntil: tempUntil };
    }
    return { locked: true, accessStart: start, accessEnd: end };
  }

  async requestAccess(user: any, reason?: string) {
    const id = uuidv4();
    await this.db.query(
      'INSERT INTO access_requests (id, user_id, username, reason, status) VALUES (?, ?, ?, ?, ?)',
      [id, user.id, user.username, reason || 'Outside office hours access request', 'PENDING'],
    );
    await this.activityService.logAction(user, 'ACCESS_REQUEST', 'auth', id, 'Requested outside-hours dashboard unlock');
    return { success: true, id };
  }

  async getAccessRequests() {
    const res = await this.db.query(
      "SELECT * FROM access_requests WHERE status = 'PENDING' ORDER BY created_at DESC",
    );
    return res.rows;
  }

  async unlockManager(requestId: string) {
    const reqRes = await this.db.query('SELECT user_id FROM access_requests WHERE id = ?', [requestId]);
    const userId = (reqRes.rows[0] as any)?.user_id;
    if (userId) {
      await this.db.query(
        'UPDATE users SET temp_unlocked_until = DATE_ADD(NOW(), INTERVAL 4 HOUR) WHERE id = ?',
        [userId],
      );
    }
    await this.db.query("UPDATE access_requests SET status = 'APPROVED' WHERE id = ?", [requestId]);
    return { success: true };
  }

  async lockManager(userId: string) {
    await this.db.query('UPDATE users SET temp_unlocked_until = NULL WHERE id = ?', [userId]);
    return { success: true };
  }
}
