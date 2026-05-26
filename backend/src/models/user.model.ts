import { query, queryOne } from "../config/database";
import { User } from "../types";

export class UserModel {
  static async findAll(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit;
    const like = `%${search}%`;

    const rows = await query<User>(
      `SELECT
        u.id,
        u.email,
        cp.full_name,
        u.role,
        u.status,
        u.last_login_at,
        u.created_at,
        u.updated_at
       FROM users u
       LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
       WHERE cp.full_name LIKE ? OR u.email LIKE ?
       ORDER BY u.created_at DESC
       LIMIT ?
       OFFSET ?`,
      [like, like, limit, offset],
    );

    const cnt = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM users u
       LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
       WHERE cp.full_name LIKE ? OR u.email LIKE ?`,
      [like, like],
    );

    return {
      users: rows,
      total: Number(cnt?.total ?? 0),
    };
  }

  static async findById(id: number): Promise<User | null> {
    return queryOne<User>(
      `SELECT
        u.id,
        u.email,
        cp.full_name,
        u.role,
        u.status,
        u.last_login_at,
        u.created_at,
        u.updated_at
       FROM users u
       LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
       WHERE u.id = ?`,
      [id],
    );
  }

  static async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(`SELECT * FROM users WHERE email = ?`, [email]);
  }

  static async findAuthByEmail(email: string): Promise<User | null> {
    return queryOne<User>(`SELECT * FROM users WHERE email = ?`, [email]);
  }

  static async findAuthByCitizenId(citizenId: number): Promise<User | null> {
    return queryOne<User>(
      `SELECT u.* FROM users u
       JOIN candidate_profiles cp ON u.id = cp.user_id
       WHERE cp.citizen_id = ?`,
      [citizenId],
    );
  }

  static async existsByEmail(email: string): Promise<boolean> {
    const user = await queryOne(`SELECT id FROM users WHERE email = ?`, [
      email,
    ]);

    return !!user;
  }

  static async existsCandidateByCitizenId(citizenId: number): Promise<boolean> {
    const row = await queryOne(
      `SELECT citizen_id
       FROM candidate_profiles
       WHERE citizen_id = ?`,
      [citizenId],
    );

    return !!row;
  }

  static async findByResetToken(token: string): Promise<User | null> {
    return queryOne<User>(
      `SELECT u.*
       FROM users u
       JOIN password_reset_tokens t
         ON t.user_id = u.id
       WHERE t.token = ?
         AND t.expires_at > NOW()
         AND t.used_at IS NULL`,
      [token],
    );
  }

  static async create(data: {
    email: string;
    password_hash: string;
    full_name?: string;
    role: string;
  }): Promise<User> {
    await query(
      `INSERT INTO users (
        email,
        password_hash,
        full_name,
        role
      )
      VALUES (?, ?, ?, ?)`,
      [data.email, data.password_hash, data.full_name ?? null, data.role],
    );

    const user = await queryOne<User>(
      `SELECT
        u.id,
        u.email,
        cp.full_name,
        u.role,
        u.status,
        u.created_at,
        u.updated_at
       FROM users u
       LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
       WHERE u.email = ?`,
      [data.email],
    );

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  static async createCandidateWithProfile(data: any): Promise<User> {
    await query(
      `INSERT INTO users (
        email,
        password_hash,
        role
      )
      VALUES (?, ?, ?)`,
      [data.email, data.password_hash, "CANDIDATE"],
    );

    const user = await queryOne<User>(`SELECT * FROM users WHERE email = ?`, [
      data.email,
    ]);

    if (!user) {
      throw new Error("Cannot create user");
    }

    await query(
      `INSERT INTO candidate_profiles (
        user_id,
        citizen_id,
        full_name,
        phone,
        address
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        user.id,
        data.citizen_id,
        data.full_name,
        data.phone ?? null,
        data.address ?? null,
      ],
    );

    return user;
  }

  static async update(
    id: number,
    data: Record<string, any>,
  ): Promise<User | null> {
    const allowed = ["full_name", "status", "password_hash", "last_login_at"];

    const fields = Object.keys(data).filter((k) => allowed.includes(k));

    if (!fields.length) {
      return this.findById(id);
    }

    const sets = fields.map((f) => `${f} = ?`).join(", ");
    const vals = fields.map((f) => data[f]);

    await query(
      `UPDATE users
       SET ${sets},
           updated_at = NOW()
       WHERE id = ?`,
      [...vals, id],
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const user = await this.findById(id);

    if (!user) {
      return false;
    }

    await query(`DELETE FROM users WHERE id = ?`, [id]);

    return true;
  }

  static async touchLastLoginAt(userId: number): Promise<void> {
    await query(
      `UPDATE users
       SET last_login_at = NOW()
       WHERE id = ?`,
      [userId],
    );
  }

  static async saveResetToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = ?
         AND used_at IS NULL`,
      [userId],
    );

    await query(
      `INSERT INTO password_reset_tokens (
        user_id,
        token,
        expires_at
      )
      VALUES (?, ?, ?)`,
      [userId, token, expiresAt],
    );
  }

  static async markResetTokenUsed(token: string): Promise<void> {
    await query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE token = ?`,
      [token],
    );
  }
}
