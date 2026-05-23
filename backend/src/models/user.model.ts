import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { CandidateProfile, User } from '../types';

type UserPublic = Omit<User, 'password_hash'>;

const USER_PUBLIC_FIELDS = `
  id, email, full_name, role, status, last_login_at, created_at, updated_at
`;

export class UserModel {
  static async findAll(page = 1, limit = 10): Promise<{ users: UserPublic[]; total: number }> {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${USER_PUBLIC_FIELDS} FROM users LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [countRows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM users');
    return { users: rows as UserPublic[], total: Number(countRows[0].total) };
  }

  static async findById(id: number): Promise<UserPublic | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${USER_PUBLIC_FIELDS} FROM users WHERE id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as UserPublic) : null;
  }

  static async findAuthByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length ? (rows[0] as User) : null;
  }

  static async existsByEmail(email: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows.length > 0;
  }

  static async existsCandidateByCitizenId(citizenId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM candidate_profiles WHERE citizen_id = ? LIMIT 1',
      [citizenId]
    );
    return rows.length > 0;
  }

  static async createCandidateWithProfile(data: {
    citizenId: number;
    fullName: string;
    email: string;
    passwordHash: string;
  }): Promise<UserPublic> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const userId = await this.insertCandidateUser(connection, data);
      await this.insertCandidateProfile(connection, {
        citizen_id: data.citizenId,
        user_id: userId,
        full_name: data.fullName,
      });
      await connection.commit();
      const user = await this.findById(userId);
      if (!user) throw new Error('Unable to fetch created user');
      return user;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async touchLastLoginAt(userId: number): Promise<void> {
    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);
  }

  static async update(
    id: number,
    data: Partial<Pick<User, 'full_name' | 'role' | 'status'>>
  ): Promise<UserPublic | null> {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    if (entries.length === 0) return this.findById(id);

    const fields = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    await pool.execute(`UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`, [...values, id]);
    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  private static async insertCandidateUser(
    connection: PoolConnection,
    data: { fullName: string; email: string; passwordHash: string }
  ): Promise<number> {
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, full_name, role, status)
       VALUES (?, ?, ?, 'CANDIDATE', 'ACTIVE')`,
      [data.email, data.passwordHash, data.fullName]
    );
    return result.insertId;
  }

  private static async insertCandidateProfile(
    connection: PoolConnection,
    profile: Pick<CandidateProfile, 'citizen_id' | 'user_id' | 'full_name'>
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO candidate_profiles (citizen_id, user_id, full_name)
       VALUES (?, ?, ?)`,
      [profile.citizen_id, profile.user_id, profile.full_name]
    );
  }
}
