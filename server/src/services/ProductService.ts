import { ProductModel, Product } from "../models/ProductModel";
import { CategoryModel } from "../models/CategoryModel";

export class ProductService {
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
