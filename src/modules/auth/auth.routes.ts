import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authLimiter } from "../../middleware/rateLimiter";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schema";

const router = Router();
const controller = new AuthController();

router.post("/register", authLimiter, validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refresh);
router.post("/logout", authenticate, controller.logout);
router.delete("/account", authenticate, controller.deleteAccount);

export default router;
