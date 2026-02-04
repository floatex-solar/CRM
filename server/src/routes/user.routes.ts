// routes/user.routes.ts
import express from "express";
import * as authController from "../controllers/auth.controller.js";
import * as userController from "../controllers/user.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { userSchemaZod } from "../models/user.model.js";

const router = express.Router();

// ────────────────────────────────────────────────
// Public routes (no auth required)
// ────────────────────────────────────────────────
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// ────────────────────────────────────────────────
// Protected routes (require login)
// ────────────────────────────────────────────────
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

// ────────────────────────────────────────────────
// Admin only routes
// ────────────────────────────────────────────────
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(validateBody(userSchemaZod), userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;

// import { Router } from "express";
// import * as userController from "../controllers/user.controller.js";
// import { validateBody } from "../middlewares/validate.middleware.js";
// import { userSchemaZod } from "../models/user.model.js";
// // import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router: Router = Router();

// // Protect these routes
// // router.use(authMiddleware);

// // Routes
// // router.get("/", userController.listUsers);
// // router.get("/:id", userController.getUser);
// router.post("/", validateBody(userSchemaZod), userController.createUser);
// // router.put("/:id", userController.updateUser);
// // router.delete("/:id", userController.deleteUser);

// export default router;
