import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from '../db/db.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly db: DbService) {}

  private async ensureTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS notification_whatsapp (
        id VARCHAR(36) PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getPhones() {
    await this.ensureTable();
    const res = await this.db.query('SELECT id, phone, created_at FROM notification_whatsapp ORDER BY created_at DESC');
    return res.rows;
  }

  async addPhone(phone: string) {
    const digits = (phone || '').replace(/\D/g, '');
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    if (!normalized) return { success: false };
    await this.ensureTable();
    const id = uuidv4();
    await this.db.query('INSERT IGNORE INTO notification_whatsapp (id, phone) VALUES (?, ?)', [id, normalized]);
    return { success: true, id, phone: normalized };
  }

  async removePhone(id: string) {
    await this.db.query('DELETE FROM notification_whatsapp WHERE id = ?', [id]);
    return { success: true, id };
  }

  async sendText(message: string, overridePhone?: string) {
    const baseUrl = (process.env.OPENWA_URL || 'https://wa.omvky.com').replace(/\/+$/, '');
    const apiKey = process.env.OPENWA_API_KEY || 'owa_k1_6ce08c708d353c302008fa31e4b4b2018ffa524bc593c9f774aa79415e851f06';
    let targets: string[] = [];
    if (overridePhone) {
      const digits = overridePhone.replace(/\D/g, '');
      targets = [digits.length === 10 ? `91${digits}` : digits];
    } else {
      const rows = await this.getPhones();
      targets = rows.map((r: any) => r.phone).filter(Boolean);
    }

    for (const phone of targets) {
      const chatId = phone.includes('@') ? phone : `${phone}@c.us`;
      try {
        const res = await fetch(`${baseUrl}/sendText`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'x-api-key': apiKey,
          },
          body: JSON.stringify({ args: { to: chatId, content: message } }),
        });
        if (!res.ok) {
          this.logger.warn(`WhatsApp send to ${chatId} failed: HTTP ${res.status}`);
        } else {
          this.logger.log(`WhatsApp sent to ${chatId}`);
        }
      } catch (err: any) {
        this.logger.warn(`WhatsApp error (${chatId}): ${err.message}`);
      }
    }
    return { success: true, sentTo: targets.length };
  }
}
