import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/CategoryService";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  image_url: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
});

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const category = await CategoryService.getCategoryById(id);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = categorySchema.parse(req.body);
      const image_url = req.file
        ? `/uploads/${req.file.filename}`
        : parsed.image_url || "";

      const category = await CategoryService.createCategory({
        ...parsed,
        description: parsed.description || "",
        image_url,
      });

      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const parsed = categorySchema.parse(req.body);

      const updateData: any = { ...parsed };
      if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;
      } else if (parsed.image_url) {
        updateData.image_url = parsed.image_url;
      }

      const category = await CategoryService.updateCategory(id, updateData);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await CategoryService.deleteCategory(id);
      res.json({ success: true, message: "Category deleted" });
    } catch (error) {
      next(error);
    }
  }
}
