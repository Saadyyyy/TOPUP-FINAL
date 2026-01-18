import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Product {
  id?: number;
  category_id: number;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  is_active?: boolean;
  box?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class ProductModel {
  static async findAll(params: {
    activeOnly?: boolean;
    categoryId?: number;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: Product[]; total: number }> {
    const { activeOnly, categoryId, search, page, limit } = params;
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let queryParams: any[] = [];

    if (activeOnly) {
      whereClauses.push("is_active = 1");
    }

    if (categoryId) {
      whereClauses.push("category_id = ?");
      queryParams.push(categoryId);
    }

    if (search) {
      whereClauses.push("(name LIKE ? OR description LIKE ? OR box LIKE ?)");
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereSql}`;
    const [countRows] = await pool.query<RowDataPacket[]>(
      countQuery,
      queryParams,
    );
    const total = countRows[0].total;

    // Data query
    const dataQuery = `SELECT * FROM products ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, queryParams);

    const products = rows.map((row) => ({
      ...row,
      is_active: Boolean(row.is_active),
    })) as Product[];

    return { data: products, total };
  }

  // findByCategory is likely redundant if findAll handles filtering,
  // but we can keep it for specific simpler use cases or deprecate it.
  // For now I'll leave it as is but ProductService will use findAll.
  static async findByCategory(
    categoryId: number,
    activeOnly = false,
  ): Promise<Product[]> {
    let query = "SELECT * FROM products WHERE category_id = ?";
    if (activeOnly) {
      query += " AND is_active = 1";
    }
    const [rows] = await pool.query<RowDataPacket[]>(query, [categoryId]);
    return rows as Product[];
  }

  static async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE id = ?",
      [id],
    );
    if (rows.length === 0) return null;
    const product = rows[0] as Product;
    return { ...product, is_active: Boolean(product.is_active) };
  }

  static async create(product: Product): Promise<Product> {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO products (category_id, name, price, image_url, description, is_active, box) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        product.category_id,
        product.name,
        product.price,
        product.image_url,
        product.description,
        product.is_active ?? true,
        product.box,
      ],
    );
    return { ...product, id: result.insertId };
  }

  static async update(id: number, product: Partial<Product>): Promise<boolean> {
    // Dynamic update query construction could be better, but keeping it simple for now
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE products SET category_id = ?, name = ?, price = ?, image_url = ?, description = ?, is_active = ?, box = ? WHERE id = ?",
      [
        product.category_id,
        product.name,
        product.price,
        product.image_url,
        product.description,
        product.is_active,
        product.box,
        id,
      ],
    );
    return result.affectedRows > 0;
  }

  static async updateStatus(id: number, isActive: boolean): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE products SET is_active = ? WHERE id = ?",
      [isActive, id],
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM products WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}
