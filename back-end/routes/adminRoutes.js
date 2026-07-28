import { Router } from "express";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getAllUsers, updateUserRole, deleteUser, getAllReviews, adminDeleteReview } from "../controllers/adminController.js";
import { createBlock, deleteBlock } from "../controllers/blockController.js";
import { sendOrderToSteadfast, bulkSendToSteadfast } from "../controllers/steadfastController.js";
import { getNotificationCounts, markNotificationsSeen } from "../controllers/notificationController.js";

const router = Router();

// All admin routes are double-protected
router.use(verifyFBToken, verifyAdmin);

// Block-list — block / unblock an order's IP / phone / email
router.post("/blocks",   createBlock);
router.delete("/blocks", deleteBlock);

// Orders
router.get("/orders",              getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Steadfast courier — send order(s) to the courier
router.post("/orders/steadfast/send", bulkSendToSteadfast); // ⚠ before /:id/steadfast
router.post("/orders/:id/steadfast",  sendOrderToSteadfast);

// Notifications — unseen new-order counts for the admin sidebar badges
router.get("/notifications",       getNotificationCounts);
router.post("/notifications/seen", markNotificationsSeen);

// Users
router.get("/users",               getAllUsers);
router.patch("/users/:email/role", updateUserRole);
router.delete("/users/:email",     deleteUser);

// Reviews
router.get("/reviews",              getAllReviews);
router.delete("/reviews/:reviewId", adminDeleteReview);

export default router;