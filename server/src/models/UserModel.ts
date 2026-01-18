import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  created_at?: Date;
}

export class UserModel {
  static async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  static async create(user: User): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [user.username, user.email, user.password_hash],
    );
    return { ...user, id: result.insertId };
  }
}
