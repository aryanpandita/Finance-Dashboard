import { Router } from "express";
import * as userController from "./user.controller.js";
import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { updateRoleSchema, updateStatusSchema } from "./user.validation.js";

const router = Router();

// All routes require auth + admin role
router.use(authenticate, authorize("admin"));

router.get("/", userController.getUsers);
router.patch("/:id/role", validate(updateRoleSchema), userController.updateRole);
router.patch("/:id/status", validate(updateStatusSchema), userController.updateStatus);

export default router;