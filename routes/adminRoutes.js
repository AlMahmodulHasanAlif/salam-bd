import { Router } from "express";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getAllUsers, updateUserRole, deleteUser, getAllReviews, adminDeleteReview } from "../controllers/adminController.js";

const router = Router();

// All admin routes are double-protected
router.use(verifyFBToken, verifyAdmin);

// Orders
router.get("/orders",              getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Users
router.get("/users",               getAllUsers);
router.patch("/users/:email/role", updateUserRole);
router.delete("/users/:email",     deleteUser);

// Reviews
router.get("/reviews",              getAllReviews);
router.delete("/reviews/:reviewId", adminDeleteReview);

export default router;