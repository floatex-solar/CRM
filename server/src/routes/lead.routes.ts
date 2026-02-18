import express from "express";
import * as leadController from "../controllers/lead.controller.js";
import * as authController from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  leadSchemaZod,
  leadUpdateSchemaZod,
  designConfigurationInputSchemaZod,
} from "../models/lead.model.js";

const router = express.Router();

/* =========================================================
   Protected routes (require login)
========================================================= */

router.use(authController.protect);

/* =========================================================
   LEAD ROUTES
========================================================= */

router
  .route("/")
  .get(leadController.getAllLeads)
  .post(validateBody(leadSchemaZod), leadController.createLead);

// Bulk delete (must be above /:id to avoid route conflict)
router.post("/bulk-delete", leadController.deleteMultipleLeads);

router
  .route("/:id")
  .get(leadController.getLead)
  .patch(validateBody(leadUpdateSchemaZod), leadController.updateLead)
  .delete(leadController.deleteLead);

/* =========================================================
   DESIGN CONFIGURATION ROUTES (inside lead)
========================================================= */

router.post(
  "/:id/design-versions",
  validateBody(designConfigurationInputSchemaZod),
  leadController.addDesignVersion,
);

export default router;
