import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Banner {
  id?: number;
  title: string;
  image_url: string;
  link?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class BannerModel {
  static async findAll(activeOnly = false): Promise<Banner[]> {
    let query = "SELECT * FROM banners";
    if (activeOnly) {
      query += " WHERE is_active = 1";
    }
    query += " ORDER BY display_order ASC, created_at DESC";
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as Banner[];
  }

  static async findById(id: number): Promise<Banner | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM banners WHERE id = ?",
      [id],
    );
    if (rows.length === 0) return null;
    return rows[0] as Banner;
  }

  static async create(banner: Banner): Promise<Banner> {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO banners (title, image_url, link, is_active, display_order) VALUES (?, ?, ?, ?, ?)",
      [
        banner.title,
        banner.image_url,
        banner.link,
        banner.is_active ?? true,
        banner.display_order ?? 0,
      ],
    );
    return { ...banner, id: result.insertId };
  }

  static async update(id: number, banner: Partial<Banner>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE banners SET title = ?, image_url = ?, link = ?, is_active = ?, display_order = ? WHERE id = ?",
      [
        banner.title,
        banner.image_url,
        banner.link,
        banner.is_active,
        banner.display_order,
        id,
      ],
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM banners WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}
