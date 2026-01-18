import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authMiddleware, AuthController.getMe);

export default router;
