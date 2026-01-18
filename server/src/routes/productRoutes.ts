import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getOne);

// Protected Routes
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  ProductController.create,
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  ProductController.update,
);

// Import Route - Must be before /:id
router.post(
  "/import",
  authMiddleware,
  upload.single("file"), // "file" matches the formData key from client
  ProductController.importProducts,
);

router.delete("/:id", authMiddleware, ProductController.delete);

export default router;
