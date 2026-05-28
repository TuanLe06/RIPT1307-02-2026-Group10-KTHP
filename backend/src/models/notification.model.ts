import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';

export interface EmailNotification {
  id: number;
  receiver_id: number;
  receiver_email: string;
  subject: string;
  content: string;
  type: 'APPLICATION_SUBMITTED' | 'STATUS_CHANGED' | 'REJECTION' | 'APPROVAL' | 'RESULT' | 'MANUAL' | 'PASSWORD_RESET';
  status: 'PENDING' | 'SENT' | 'FAILED';
  sent_by: number | null;
  sent_at: Date | null;
  error_message: string | null;
  created_at: Date;
}

export interface ApplicationStatusLog {
  id: number;
  application_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: number;
  note: string | null;
  created_at: Date;
}

export interface ApplicationStatusLogWithDetails extends ApplicationStatusLog {
  application_code: string;
  candidate_name: string;
  changed_by_name: string;
}

export class EmailNotificationModel {
  static async create(data: {
    receiver_id: number;
    receiver_email: string;
    subject: string;
    content: string;
    type: string;
    sent_by?: number;
  }): Promise<EmailNotification> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO email_notifications (receiver_id, receiver_email, subject, content, type, status, sent_by)
       VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
      [data.receiver_id, data.receiver_email, data.subject, data.content, data.type, data.sent_by || null]
    );

    const notification = await EmailNotificationModel.findById(result.insertId);
    if (!notification) throw new Error('Failed to fetch created notification');
    return notification;
  }

  static async findById(id: number): Promise<EmailNotification | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, receiver_id, receiver_email, subject, content, type, status, sent_by, sent_at, error_message, created_at
       FROM email_notifications WHERE id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as EmailNotification) : null;
  }

  static async findPending(limit = 50): Promise<EmailNotification[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, receiver_id, receiver_email, subject, content, type, status, sent_by, sent_at, error_message, created_at
       FROM email_notifications WHERE status = 'PENDING'
       ORDER BY created_at ASC LIMIT ?`,
      [limit]
    );
    return rows as EmailNotification[];
  }

  static async updateStatus(
    id: number,
    status: 'SENT' | 'FAILED',
    errorMessage?: string
  ): Promise<EmailNotification | null> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE email_notifications SET status = ?, sent_at = NOW(), error_message = ? WHERE id = ?`,
      [status, errorMessage || null, id]
    );
    return EmailNotificationModel.findById(id);
  }

  static async findByReceiverId(
    receiverId: number,
    page = 1,
    limit = 20
  ): Promise<{ notifications: EmailNotification[]; total: number }> {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, receiver_id, receiver_email, subject, content, type, status, sent_by, sent_at, error_message, created_at
       FROM email_notifications WHERE receiver_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [receiverId, limit, offset]
    );

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM email_notifications WHERE receiver_id = ?`,
      [receiverId]
    );

    return {
      notifications: rows as EmailNotification[],
      total: Number((countRows[0] as { total: number }).total)
    };
  }
}

export class ApplicationStatusLogModel {
  static async create(data: {
    application_id: number;
    old_status: string | null;
    new_status: string;
    changed_by: number;
    note?: string;
  }): Promise<ApplicationStatusLog> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO application_status_logs (application_id, old_status, new_status, changed_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [data.application_id, data.old_status, data.new_status, data.changed_by, data.note || null]
    );

    const log = await ApplicationStatusLogModel.findById(result.insertId);
    if (!log) throw new Error('Failed to fetch created status log');
    return log;
  }

  static async findById(id: number): Promise<ApplicationStatusLog | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, application_id, old_status, new_status, changed_by, note, created_at
       FROM application_status_logs WHERE id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as ApplicationStatusLog) : null;
  }

  static async findByApplicationId(
    applicationId: number
  ): Promise<ApplicationStatusLogWithDetails[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT asl.id, asl.application_id, asl.old_status, asl.new_status, asl.changed_by, asl.note, asl.created_at,
              a.application_code, cp.full_name as candidate_name, u.email as changed_by_name
       FROM application_status_logs asl
       LEFT JOIN applications a ON asl.application_id = a.id
       LEFT JOIN users u ON asl.changed_by = u.id
       LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.user_id
       WHERE asl.application_id = ?
       ORDER BY asl.created_at DESC`,
      [applicationId]
    );
    return rows as ApplicationStatusLogWithDetails[];
  }

  static async findByChangedBy(
    changedBy: number,
    page = 1,
    limit = 20
  ): Promise<{ logs: ApplicationStatusLogWithDetails[]; total: number }> {
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT asl.id, asl.application_id, asl.old_status, asl.new_status, asl.changed_by, asl.note, asl.created_at,
              a.application_code, cp.full_name as candidate_name, u.email as changed_by_name
       FROM application_status_logs asl
       LEFT JOIN applications a ON asl.application_id = a.id
       LEFT JOIN users u ON asl.changed_by = u.id
       LEFT JOIN candidate_profiles cp ON a.candidate_id = cp.user_id
       WHERE asl.changed_by = ?
       ORDER BY asl.created_at DESC
       LIMIT ? OFFSET ?`,
      [changedBy, limit, offset]
    );

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM application_status_logs WHERE changed_by = ?`,
      [changedBy]
    );

    return {
      logs: rows as ApplicationStatusLogWithDetails[],
      total: Number((countRows[0] as { total: number }).total)
    };
  }
}
