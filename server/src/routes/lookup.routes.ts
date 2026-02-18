import { Router } from "express";
import * as lookupController from "../controllers/lookup.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router: Router = Router();

router.use(authController.protect);

router
  .route("/")
  .post(lookupController.createLookup);

router
  .route("/type/:type")
  .get(lookupController.getLookupsByType);

router
  .route("/:id")
  .patch(lookupController.updateLookup)
  .delete(lookupController.deleteLookup);

export default router;
