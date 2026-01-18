import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Category {
  id?: number;
  name: string;
  image_url: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM categories ORDER BY created_at DESC",
    );
    return rows as Category[];
  }

  static async findById(id: number): Promise<Category | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );
    if (rows.length === 0) return null;
    return rows[0] as Category;
  }

  static async create(category: Category): Promise<Category> {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO categories (name, image_url, description) VALUES (?, ?, ?)",
      [category.name, category.image_url, category.description],
    );
    return { ...category, id: result.insertId };
  }

  static async update(
    id: number,
    category: Partial<Category>,
  ): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE categories SET name = ?, image_url = ?, description = ? WHERE id = ?",
      [category.name, category.image_url, category.description, id],
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM categories WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}
