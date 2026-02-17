import express from "express";
import * as companyController from "../controllers/company.controller.js";
import * as authController from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  companySchemaZod,
  companyUpdateSchemaZod,
  contactSchemaZod,
} from "../models/company.model.js";

const router = express.Router();

/* =========================================================
   Protected routes (require login)
========================================================= */

router.use(authController.protect);

/* =========================================================
   COMPANY ROUTES
========================================================= */

router
  .route("/")
  .get(companyController.getAllCompanies)
  .post(validateBody(companySchemaZod), companyController.createCompany);

router
  .route("/:id")
  .get(companyController.getCompany)
  .patch(validateBody(companyUpdateSchemaZod), companyController.updateCompany)
  .delete(companyController.deleteCompany);

/* =========================================================
   CONTACT ROUTES (inside company)
========================================================= */

// Add contact
router.post(
  "/:companyId/contacts",
  validateBody(contactSchemaZod),
  companyController.addContact
);

// Update contact
router.patch(
  "/:companyId/contacts/:contactId",
  validateBody(contactSchemaZod.partial()),
  companyController.updateContact
);

// Delete contact
router.delete(
  "/:companyId/contacts/:contactId",
  companyController.deleteContact
);

/* =========================================================
   OPTIONAL: Admin only restrictions
   (uncomment if needed)
========================================================= */

// router.use(authController.restrictTo("admin"));
// router.delete("/:id", companyController.deleteCompany);

export default router;
