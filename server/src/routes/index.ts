import { Router } from "express";

// Route Modules
// import authRoutes from "./auth.routes";
import userRoutes from "./user.routes.js";
import companyRoutes from "./company.routes.js";
import lookupRoutes from "./lookup.routes.js";
// import profileRoutes from "./profile.routes";
// import categoryRoutes from "./category.routes";
// import subCategoryRoutes from "./subcategory.routes";
// import itemRoutes from "./items.routes";
// import uomRoutes from "./uom.routes";
// import vendorRoutes from "./vendor.routes";
// import searchRoutes from "./search.routes";
// import pinnedRoutes from "./pinned.routes";
// import rfqRoutes from "./rfq.routes";

// Middleware
// import { authMiddleware } from "../middlewares/auth.middleware";

// ✅ Create Router Instance
const router: Router = Router();

/* ---------------------- Public Routes ---------------------- */

// ✅ Authentication Routes (No login needed)
// router.use("/auth", authRoutes);

/* ---------------------- Protected Routes ---------------------- */

// ✅ Apply Auth Middleware globally after /auth
// router.use(authMiddleware);

/* ---------------------- User Routes ---------------------- */

router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/lookups", lookupRoutes);
// router.use("/profile", profileRoutes);

/* ---------------------- Item Routes ---------------------- */

// router.use("/categories", categoryRoutes);
// router.use("/subcategories", subCategoryRoutes);
// router.use("/items", itemRoutes);
// router.use("/uoms", uomRoutes);

/* ---------------------- Vendor Routes ---------------------- */

// router.use("/vendors", vendorRoutes);

/* ---------------------- Search Routes ---------------------- */

// router.use("/search", searchRoutes);

/* ---------------------- Pinned Routes ---------------------- */

// router.use("/pinned", pinnedRoutes);

/* ---------------------- RFQ Routes ---------------------- */

// router.use("/rfqs", rfqRoutes);

export default router;
