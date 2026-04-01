import { Router } from "express";
import * as recordController from "./record.controller.js";
import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { createRecordSchema, updateRecordSchema } from "./record.validation.js";

const router = Router();

// All record routes require authentication
router.use(authenticate);

// Viewer and above can read
router.get("/", authorize("viewer", "analyst", "admin"), recordController.getRecords);
router.get("/:id", authorize("viewer", "analyst", "admin"), recordController.getRecord);

// Only admin can write
router.post("/", authorize("admin"), validate(createRecordSchema), recordController.createRecord);
router.patch("/:id", authorize("admin"), validate(updateRecordSchema), recordController.updateRecord);
router.delete("/:id", authorize("admin"), recordController.deleteRecord);

export default router;