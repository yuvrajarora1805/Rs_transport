import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ActivityService } from './activity.service';
import { DbService } from '../db/db.service';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private lastSentDate = '';

  constructor(
    private readonly activityService: ActivityService,
    private readonly db: DbService,
  ) {}

  onModuleInit() {
    this.logger.log('MailService initialized (SMTP: mail.omvky.com:587, EOD scheduled at 19:00)');
    // Check every minute if it's 19:00 (7:00 PM) to send daily EOD summary
    setInterval(() => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      if (now.getHours() === 19 && now.getMinutes() === 0 && this.lastSentDate !== today) {
        this.lastSentDate = today;
        this.sendEodEmail().catch((err) =>
          this.logger.warn(`Scheduled 7PM EOD email failed: ${err.message}`),
        );
      }
    }, 60 * 1000);
  }

  private createTransport() {
    const user = process.env.SMTP_USER || 'rs@omvky.com';
    const pass = process.env.SMTP_PASS || '33,bErgaRyaNdAlsablESSFEGURsOMernAl,?';
    const host = process.env.SMTP_HOST || 'mail.omvky.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 90000,
      greetingTimeout: 90000,
      socketTimeout: 90000,
    });
  }

  async sendEodEmail(toEmail?: string) {
    const targetDate = new Date().toISOString().split('T')[0];
    const [disp, trips, sett, pay, alerts] = await Promise.all([
      this.db.query(
        'SELECT COUNT(*) as total_dispatches, COUNT(DISTINCT truck_id) as total_trucks FROM dispatches WHERE is_cancelled = false AND DATE(date) = ?',
        [targetDate],
      ),
      this.db.query(
        'SELECT COUNT(*) as total_trips, COUNT(DISTINCT party_id) as parties_done FROM trips WHERE DATE(COALESCE(unloading_date, created_at)) = ?',
        [targetDate],
      ),
      this.db.query(
        "SELECT COUNT(CASE WHEN status = 'PAID' THEN 1 END) as settled_count, COUNT(CASE WHEN status != 'PAID' THEN 1 END) as pending_settlements, COALESCE(SUM(outstanding), 0) as pending_amount FROM settlements WHERE DATE(created_at) = ?",
        [targetDate],
      ),
      this.db.query(
        'SELECT COALESCE(SUM(amount), 0) as payments_resolved FROM payments WHERE DATE(payment_date) = ?',
        [targetDate],
      ),
      this.activityService.getAlerts(),
    ]);

    const dRow: any = disp.rows[0] || {};
    const tRow: any = trips.rows[0] || {};
    const sRow: any = sett.rows[0] || {};
    const pRow: any = pay.rows[0] || {};

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:24px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:#1e3a8a;color:#ffffff;padding:20px 24px;">
            <h1 style="margin:0;font-size:20px;">RS Transport ERP — Daily EOD Summary</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#bfdbfe;">Report Date: ${targetDate} • Automated 7:00 PM Digest</p>
          </div>
          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr>
                <td style="padding:10px;border:1px solid #e2e8f0;background:#f8fafc;"><b>Total Dispatches</b><br/><span style="font-size:18px;color:#1e40af;">${dRow.total_dispatches || 0}</span></td>
                <td style="padding:10px;border:1px solid #e2e8f0;background:#f8fafc;"><b>Trucks Dispatched</b><br/><span style="font-size:18px;color:#1e40af;">${dRow.total_trucks || 0}</span></td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid #e2e8f0;"><b>Total Trips</b><br/><span style="font-size:18px;">${tRow.total_trips || 0}</span></td>
                <td style="padding:10px;border:1px solid #e2e8f0;"><b>Parties Done</b><br/><span style="font-size:18px;">${tRow.parties_done || 0}</span></td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid #e2e8f0;background:#f0fdf4;"><b>Payments Resolved</b><br/><span style="font-size:18px;color:#15803d;">₹${pRow.payments_resolved || 0}</span></td>
                <td style="padding:10px;border:1px solid #e2e8f0;background:#fef2f2;"><b>Pending Payments</b><br/><span style="font-size:18px;color:#b91c1c;">₹${sRow.pending_amount || 0}</span></td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid #e2e8f0;"><b>Settlements Completed</b><br/><span style="font-size:18px;">${sRow.settled_count || 0}</span></td>
                <td style="padding:10px;border:1px solid #e2e8f0;"><b>Pending Settlements</b><br/><span style="font-size:18px;color:#b45309;">${sRow.pending_settlements || 0}</span></td>
              </tr>
            </table>
            <h3 style="margin:0 0 10px;font-size:15px;color:#0f172a;">Operational Alerts & Truck Details</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
              <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;">Dispatches Without Diesel Slip</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:bold;color:#b45309;">${alerts.dispatchesWithoutFuel.length}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;">Diesel Entries Without Dispatch</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:bold;color:#b91c1c;">${alerts.fuelWithoutDispatch.length}</td></tr>
              <tr><td style="padding:8px;">Pending Pump Settlements</td><td style="padding:8px;text-align:right;font-weight:bold;color:#1e40af;">${alerts.pendingPumpSettlements.length}</td></tr>
            </table>
            ${alerts.dispatchesWithoutFuel.length > 0 ? `
              <h4 style="margin:12px 0 6px;font-size:13px;color:#b45309;">Dispatches Missing Diesel Slip</h4>
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <tr style="background:#fef3c7;"><th style="padding:6px;text-align:left;">Truck No</th><th style="padding:6px;text-align:left;">Source</th><th style="padding:6px;text-align:left;">SR No</th></tr>
                ${alerts.dispatchesWithoutFuel.slice(0, 15).map((d: any) => `<tr><td style="padding:6px;border-bottom:1px solid #f1f5f9;"><b>${d.truck_no}</b></td><td style="padding:6px;border-bottom:1px solid #f1f5f9;">${d.source_name || '-'}</td><td style="padding:6px;border-bottom:1px solid #f1f5f9;">${d.sr_no || '-'}</td></tr>`).join('')}
              </table>
            ` : ''}
            ${alerts.fuelWithoutDispatch.length > 0 ? `
              <h4 style="margin:12px 0 6px;font-size:13px;color:#b91c1c;">Diesel Entries Without Active Dispatch</h4>
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <tr style="background:#fee2e2;"><th style="padding:6px;text-align:left;">Truck No</th><th style="padding:6px;text-align:left;">Litres</th><th style="padding:6px;text-align:right;">Amount</th></tr>
                ${alerts.fuelWithoutDispatch.slice(0, 15).map((f: any) => `<tr><td style="padding:6px;border-bottom:1px solid #f1f5f9;"><b>${f.truck_no}</b></td><td style="padding:6px;border-bottom:1px solid #f1f5f9;">${f.litres || 0} L</td><td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:right;">₹${f.amount || 0}</td></tr>`).join('')}
              </table>
            ` : ''}
          </div>
          <div style="background:#f8fafc;padding:12px 24px;font-size:11px;color:#64748b;text-align:center;">
            RS Transport & Ranbir Logistics ERP • Automated System Notification
          </div>
        </div>
      </div>
    `;

    const transporter = this.createTransport();
    let recipients = toEmail || '';
    if (!recipients) {
      const emailRows = await this.db.query('SELECT email FROM notification_emails');
      const list = emailRows.rows.map((r: any) => r.email).filter(Boolean);
      recipients = list.length > 0 ? list.join(', ') : (process.env.ADMIN_EMAIL || 'rs@omvky.com');
    }
    await transporter.sendMail({
      from: `"RS Transport ERP" <${process.env.SMTP_USER || 'rs@omvky.com'}>`,
      to: recipients,
      subject: `RS Transport EOD Summary & Alerts — ${targetDate}`,
      html,
    });
    return { success: true, to: recipients, date: targetDate };
  }

  private async getRecipients(): Promise<string> {
    const emailRows = await this.db.query('SELECT email FROM notification_emails');
    const list = emailRows.rows.map((r: any) => r.email).filter(Boolean);
    return list.length > 0 ? list.join(', ') : (process.env.ADMIN_EMAIL || 'rs@omvky.com');
  }

  async sendDispatchNotification(dispatch: any) {
    try {
      const to = await this.getRecipients();
      const attachments: any[] = [];
      let slipHtml = '';
      if (dispatch?.slip_image && typeof dispatch.slip_image === 'string' && dispatch.slip_image.startsWith('data:')) {
        attachments.push({
          filename: `dispatch-slip-${dispatch.sr_no || dispatch.id}.png`,
          path: dispatch.slip_image,
          cid: 'dispatch-slip',
        });
        slipHtml = `<div style="margin-top:16px;"><p style="font-size:12px;font-weight:bold;color:#475569;margin-bottom:6px;">Attached Dispatch Slip:</p><img src="cid:dispatch-slip" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;" /></div>`;
      }
      const html = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:24px;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#1e3a8a;color:#ffffff;padding:18px 24px;">
              <h2 style="margin:0;font-size:18px;">RS Transport ERP — New Dispatch Created</h2>
              <p style="margin:4px 0 0;font-size:12px;color:#bfdbfe;">SR No: ${dispatch.sr_no || '-'} • ${dispatch.truck_no || '-'}</p>
            </div>
            <div style="padding:20px 24px;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#64748b;">Truck No</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;font-weight:bold;">${dispatch.truck_no || '-'}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#64748b;">Source</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;">${dispatch.source_name || '-'}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#64748b;">Destination</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;font-weight:bold;">${dispatch.destination || '-'}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#64748b;">Commodity & Bales</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;">${dispatch.bales || 0} (${dispatch.material || 'Cotton Bales'})</td></tr>
                <tr><td style="padding:8px;color:#64748b;">Driver Mobile</td><td style="padding:8px;">${dispatch.mobile_no || dispatch.driver_mobile || '-'}</td></tr>
              </table>
              ${slipHtml}
            </div>
            <div style="background:#f8fafc;padding:12px 24px;font-size:11px;color:#64748b;text-align:center;">
              RS Transport & Ranbir Logistics ERP • Automated Dispatch Notification
            </div>
          </div>
        </div>
      `;
      const info = await this.createTransport().sendMail({
        from: `"RS Transport ERP" <${process.env.SMTP_USER || 'rs@omvky.com'}>`,
        to,
        subject: `New Dispatch: ${dispatch.truck_no || 'Truck'} → ${dispatch.destination || '-'} (SR ${dispatch.sr_no || '-'})`,
        html,
        attachments,
      });
      this.logger.log(`Dispatch email sent to ${to}: ${info.messageId}`);
    } catch (err: any) {
      this.logger.warn(`Dispatch email failed: ${err.message}`);
    }
  }

  async sendUnlockRequestEmail(username: string, reason?: string) {
    try {
      const to = await this.getRecipients();
      await this.createTransport().sendMail({
        from: `"RS Transport ERP" <${process.env.SMTP_USER || 'rs@omvky.com'}>`,
        to,
        subject: `Manager Unlock Request: @${username}`,
        html: `<div style="font-family:Segoe UI,Arial,sans-serif;padding:16px;"><h3>Manager Access Unlock Request</h3><p>Manager <b>@${username}</b> requested dashboard access.</p><p><b>Reason:</b> ${reason || 'Outside office hours'}</p></div>`,
      });
    } catch (err: any) {
      this.logger.warn(`Unlock request email failed: ${err.message}`);
    }
  }
}

