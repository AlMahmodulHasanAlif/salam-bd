import { Router } from "express";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = Router();

// ── Public — guests + logged-in users ─────────────────────────────────────────
router.post("/", createOrder);

// ── Protected — logged-in users ───────────────────────────────────────────────
router.get("/user/:email", verifyFBToken, getUserOrders);  // ⚠ before /:id
router.get("/:id",         verifyFBToken, getOrderById);

// ── Admin only ────────────────────────────────────────────────────────────────
router.get(   "/",        verifyFBToken, verifyAdmin, getAllOrders);
router.patch( "/:id",     verifyFBToken, verifyAdmin, updateOrderStatus);
router.delete("/:id",     verifyFBToken, verifyAdmin, deleteOrder);

export default router;