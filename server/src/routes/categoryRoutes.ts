import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getOne);

// Protected Routes
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  CategoryController.create,
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  CategoryController.update,
);
router.delete("/:id", authMiddleware, CategoryController.delete);

export default router;
