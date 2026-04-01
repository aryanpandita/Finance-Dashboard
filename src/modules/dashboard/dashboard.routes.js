import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import authenticate from "../../middlewares/authenticate.js";
import authorize from "../../middlewares/authorize.js";

const router = Router();

router.use(authenticate);

// Summary — viewer and above
router.get("/summary", authorize("viewer", "analyst", "admin"), dashboardController.getSummary);

// Trends + categories — analyst and above
router.get("/trends", authorize("analyst", "admin"), dashboardController.getTrends);
router.get("/categories", authorize("analyst", "admin"), dashboardController.getCategoryTotals);

export default router;