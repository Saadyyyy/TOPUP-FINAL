import { Router } from "express";
import { BannerController } from "../controllers/BannerController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/", BannerController.getAll);
router.get("/:id", BannerController.getOne);

// Protected Routes
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  BannerController.create,
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  BannerController.update,
);
router.delete("/:id", authMiddleware, BannerController.delete);

export default router;
