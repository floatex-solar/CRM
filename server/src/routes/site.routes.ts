import express from "express";
import multer from "multer";
import * as siteController from "../controllers/site.controller.js";

const router = express.Router();

// Multer: memory storage for Drive upload (no disk writes)
const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = ["application/pdf", "image/png", "image/jpeg"];

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Only PDF, PNG, and JPG are allowed.`,
        ),
      );
    }
  },
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

const uploadFields = upload.fields([
  { name: "bathymetryFile", maxCount: 1 },
  { name: "geotechnicalFile", maxCount: 1 },
  { name: "pfrFile", maxCount: 1 },
  { name: "dprFile", maxCount: 1 },
]);

// Routes
router
  .route("/")
  .get(siteController.getAllSites)
  .post(uploadFields, siteController.createSite);

router
  .route("/:id")
  .get(siteController.getSite)
  .patch(uploadFields, siteController.updateSite)
  .delete(siteController.deleteSite);

export const siteRoutes = router;
