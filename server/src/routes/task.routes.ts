import express from "express";
import multer from "multer";
import * as taskController from "../controllers/task.controller.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

/* =========================================================
   Multer config: memory storage for Drive upload
========================================================= */

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = [
  // Documents
  "application/pdf",
  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
  // Audio
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  // Video
  "video/webm",
  "video/mp4",
  "video/ogg",
];

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Only PDF, images, audio, and video files are allowed.`,
        ),
      );
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max per file
});

const uploadFields = upload.fields([
  { name: "attachments", maxCount: 10 },
  { name: "voiceNote", maxCount: 1 },
  { name: "videoNote", maxCount: 1 },
]);

/* =========================================================
   Protected routes (require login)
========================================================= */

router.use(authController.protect);

/* =========================================================
   TASK ROUTES
========================================================= */

router
  .route("/")
  .get(taskController.getAllTasks)
  .post(uploadFields, taskController.createTask);

// Bulk delete (must be above /:id to avoid route conflict)
router.post("/bulk-delete", taskController.deleteMultipleTasks);

router
  .route("/:id")
  .get(taskController.getTask)
  .patch(uploadFields, taskController.updateTask)
  .delete(taskController.deleteTask);

// Task status update (timeline entry)
router.post("/:id/updates", uploadFields, taskController.addTaskUpdate);

export default router;
