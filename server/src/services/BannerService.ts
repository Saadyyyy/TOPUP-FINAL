import { BannerModel, Banner } from "../models/BannerModel";

export class BannerService {
  static async getAllBanners(activeOnly = false) {
    return await BannerModel.findAll(activeOnly);
  }

  static async getBannerById(id: number) {
    const banner = await BannerModel.findById(id);
    if (!banner) {
      throw { statusCode: 404, message: "Banner not found" };
    }
    return banner;
  }

  static async createBanner(data: Banner) {
    return await BannerModel.create(data);
  }

  static async updateBanner(id: number, data: Partial<Banner>) {
    const banner = await BannerModel.findById(id);
    if (!banner) {
      throw { statusCode: 404, message: "Banner not found" };
    }
    const updatedData = { ...banner, ...data };
    await BannerModel.update(id, updatedData);
    return updatedData;
  }

  static async deleteBanner(id: number) {
    const banner = await BannerModel.findById(id);
    if (!banner) {
      throw { statusCode: 404, message: "Banner not found" };
    }
    await BannerModel.delete(id);
    return { success: true };
  }
}
