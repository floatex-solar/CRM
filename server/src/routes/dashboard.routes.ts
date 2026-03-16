import express from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

/* =========================================================
   Protected routes (require login)
========================================================= */

router.use(authController.protect);

router.get("/stats", dashboardController.getDashboardStats);

export default router;
