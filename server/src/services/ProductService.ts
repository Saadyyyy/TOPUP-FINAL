import { ProductModel, Product } from "../models/ProductModel";
import { CategoryModel } from "../models/CategoryModel";
import * as XLSX from "xlsx";
import fs from "fs";

export class ProductService {
  static async importProducts(filePath: string) {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Pre-fetch all categories for lookup
    const categories = await CategoryModel.findAll();
    const categoryMap = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id]),
    );

    for (const row of data) {
      try {
        const name = row.Name || row.name;
        const price = row.Price || row.price;
        const box = row.Box || row.box;
        const categoryName = row.Category || row.category;
        const description = row.Description || row.description;

        if (!name || !price) {
          failedCount++;
          errors.push(`Row missing name or price: ${JSON.stringify(row)}`);
          continue;
        }

        let categoryId = 4; // Default fallback ID if needed, or null? Let's use logic.

        if (categoryName) {
          const foundId = categoryMap.get(String(categoryName).toLowerCase());
          if (foundId) {
            categoryId = foundId;
          } else {
            // Option: Create category if not exists? For now, fallback or skip.
            // Let's fallback to "General" or similar if we had it, or just use a default category ID
            // For safety, let's use the first category if not found, or explicit check.
            // Assuming ID 1 exists or using valid ID from DB.
            // Actually, if we don't have a valid category, the FK constraint will fail.
            // Let's try to default to the first available category.
            if (categories.length > 0) categoryId = categories[0].id!;
          }
        } else {
          if (categories.length > 0) categoryId = categories[0].id!;
        }

        await ProductModel.create({
          name,
          price: Number(price),
          box: box ? String(box) : undefined,
          category_id: categoryId,
          description: description,
          image_url: "", // No image for imported products usually
          is_active: true,
        });
        successCount++;
      } catch (error: any) {
        failedCount++;
        errors.push(
          `Failed to import ${row.Name || "unknown"}: ${error.message}`,
        );
      }
    }

    // Clean up file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Failed to delete temp file", e);
    }

    return { success: successCount, failed: failedCount, errors };
  }

  static async getAllProducts(params: {
    activeOnly?: boolean;
    categoryId?: number;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { data, total } = await ProductModel.findAll(params);
    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  // Deprecated or can be removed if not used, but keeping for compatibility if referenced elsewhere
  static async getProductsByCategory(categoryId: number, activeOnly = false) {
    return await ProductModel.findByCategory(categoryId, activeOnly);
  }

  static async getProductById(id: number) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }
    return product;
  }

  static async createProduct(data: Product) {
    const category = await CategoryModel.findById(data.category_id);
    if (!category) {
      throw { statusCode: 400, message: "Invalid category ID" };
    }
    return await ProductModel.create(data);
  }

  static async updateProduct(id: number, data: Partial<Product>) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }

    // If updating category, check if it exists
    if (data.category_id) {
      const category = await CategoryModel.findById(data.category_id);
      if (!category) {
        throw { statusCode: 400, message: "Invalid category ID" };
      }
    }

    // Merge existing data with updates for the update call if needed,
    // or just pass partial if Model handles it (my Model impl expects all fields currently in the simple UPDATE query,
    // so I should probably fetch and merge in the service or improve Model.
    // I'll update the Model usage in Service to merge data)

    const updatedData = { ...product, ...data };

    await ProductModel.update(id, updatedData);
    return updatedData;
  }

  static async deleteProduct(id: number) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw { statusCode: 404, message: "Product not found" };
    }
    await ProductModel.delete(id);
    return { success: true };
  }
}
