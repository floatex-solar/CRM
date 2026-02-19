import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as siteController from "../controllers/site.controller.js";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

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
