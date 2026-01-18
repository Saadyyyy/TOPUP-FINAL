import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/ProductService";
import { z } from "zod";

const productSchema = z.object({
  category_id: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === "string") return parseInt(val);
    return val;
  }),
  name: z.string().min(1),
  price: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === "string") return parseFloat(val);
    return val;
  }),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  box: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  image_url: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  is_active: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => (val === "true" || val === true ? true : false)),
});

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.active === "true";
      const categoryId = req.query.category_id
        ? parseInt(req.query.category_id as string)
        : undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = (req.query.search as string) || "";

      let result;
      // We will unify the service call to support all filters
      result = await ProductService.getAllProducts({
        activeOnly,
        categoryId,
        page,
        limit,
        search,
      });

      res.json({ success: true, ...result }); // result contains { data, pagination }
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const product = await ProductService.getProductById(id);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Create Product Body:", req.body);
      const parsed = productSchema.parse(req.body);
      console.log("Parsed Product Data:", parsed);
      // Prioritize req.file (if multipart), then body.image_url
      const image_url = req.file
        ? `/uploads/${req.file.filename}`
        : parsed.image_url || "";

      const product = await ProductService.createProduct({
        ...parsed,
        image_url,
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      console.log("Update Product Body:", req.body);
      const parsed = productSchema.parse(req.body);
      console.log("Parsed Update Data:", parsed);

      const updateData: any = { ...parsed };
      if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;
      } else if (parsed.image_url) {
        updateData.image_url = parsed.image_url;
      }

      const product = await ProductService.updateProduct(id, updateData);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await ProductService.deleteProduct(id);
      res.json({ success: true, message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  }
}
