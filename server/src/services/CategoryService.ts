import { CategoryModel, Category } from "../models/CategoryModel";

export class CategoryService {
  static async getAllCategories() {
    return await CategoryModel.findAll();
  }

  static async getCategoryById(id: number) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw { statusCode: 404, message: "Category not found" };
    }
    return category;
  }

  static async createCategory(data: Category) {
    return await CategoryModel.create(data);
  }

  static async updateCategory(id: number, data: Partial<Category>) {
    const exists = await CategoryModel.findById(id);
    if (!exists) {
      throw { statusCode: 404, message: "Category not found" };
    }
    await CategoryModel.update(id, data);
    return { id, ...data };
  }

  static async deleteCategory(id: number) {
    const exists = await CategoryModel.findById(id);
    if (!exists) {
      throw { statusCode: 404, message: "Category not found" };
    }
    await CategoryModel.delete(id);
    return { success: true };
  }
}
