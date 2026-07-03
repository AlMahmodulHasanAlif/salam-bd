import express from "express";
import {
  createPluginOrder,
  getAllPluginOrders,
  getPluginOrderById,
  updatePluginOrderStatus,
  deletePluginOrder,
} from "../controllers/PluginOrderController.js";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";

// Import your existing admin auth middleware here, e.g.:
// import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public — anyone can place an order
router.post("/", createPluginOrder);

// Admin — protect these with your auth middleware

router.get("/", verifyFBToken, verifyAdmin, getAllPluginOrders);
router.get("/:id", verifyFBToken, verifyAdmin, getPluginOrderById);
router.patch(
  "/:id/status",
  verifyFBToken,
  verifyAdmin,
  updatePluginOrderStatus,
);
router.delete("/:id", verifyFBToken, verifyAdmin, deletePluginOrder);

export default router;
