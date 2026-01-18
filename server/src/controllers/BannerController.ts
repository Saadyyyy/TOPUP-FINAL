import { Request, Response, NextFunction } from "express";
import { BannerService } from "../services/BannerService";
import { z } from "zod";

const bannerSchema = z.object({
  title: z.string().min(1),
  link: z
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
  display_order: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") return parseInt(val || "0");
      return val || 0;
    }),
});

export class BannerController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.active === "true";
      const banners = await BannerService.getAllBanners(activeOnly);
      res.json({ success: true, data: banners });
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const banner = await BannerService.getBannerById(id);
      res.json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = bannerSchema.parse(req.body);

      // Image is required for new banners (from file OR body url)
      const image_url = req.file
        ? `/uploads/${req.file.filename}`
        : parsed.image_url;

      if (!image_url) {
        throw { statusCode: 400, message: "Image is required" };
      }

      const banner = await BannerService.createBanner({
        ...parsed,
        image_url,
      });

      res.status(201).json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const parsed = bannerSchema.parse(req.body);

      const updateData: any = { ...parsed };
      if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;
      } else if (parsed.image_url) {
        updateData.image_url = parsed.image_url;
      }

      const banner = await BannerService.updateBanner(id, updateData);
      res.json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await BannerService.deleteBanner(id);
      res.json({ success: true, message: "Banner deleted" });
    } catch (error) {
      next(error);
    }
  }
}
