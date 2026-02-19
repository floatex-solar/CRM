import { Router } from "express";

// Route Modules
// import authRoutes from "./auth.routes";
import userRoutes from "./user.routes.js";
import companyRoutes from "./company.routes.js";
import leadRoutes from "./lead.routes.js";
import lookupRoutes from "./lookup.routes.js";
import { siteRoutes } from "./site.routes.js";

// ✅ Create Router Instance
const router: Router = Router();

// ... existing code ...

/* ---------------------- User Routes ---------------------- */

router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/leads", leadRoutes);
router.use("/lookups", lookupRoutes);
router.use("/sites", siteRoutes);
// router.use("/profile", profileRoutes);

export default router;
