import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

/* =========================================================
   Protected routes (require login)
========================================================= */

router.use(authController.protect);

/* =========================================================
   NOTIFICATION ROUTES
========================================================= */

router.get("/", notificationController.getMyNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
