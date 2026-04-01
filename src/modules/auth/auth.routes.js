import { Router } from "express";
import * as authController from "./auth.controller.js";
import validate from "../../middlewares/validate.js";
import authenticate from "../../middlewares/authenticate.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register",  validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);

export default router;