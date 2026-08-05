import express from "express";
import {
  createCodingOrder,
  getAllCodingOrders,
  getCodingOrderById,
  updateCodingOrderStatus,
  deleteCodingOrder,
} from "../controllers/CodingOrderController.js";
import {
  sendCodingOrderToSteadfast,
  bulkSendCodingToSteadfast,
} from "../controllers/steadfastController.js";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public — anyone can place an order
router.post("/", createCodingOrder);

// Admin — protect these with your auth middleware
router.get("/", verifyFBToken, verifyAdmin, getAllCodingOrders);

// Steadfast courier — send coding order(s) to the courier. Declared before
// "/:id" routes so "steadfast" isn't captured as an :id param.
router.post(
  "/steadfast/send",
  verifyFBToken,
  verifyAdmin,
  bulkSendCodingToSteadfast,
);
router.post(
  "/:id/steadfast",
  verifyFBToken,
  verifyAdmin,
  sendCodingOrderToSteadfast,
);

router.get("/:id", verifyFBToken, verifyAdmin, getCodingOrderById);
router.patch(
  "/:id/status",
  verifyFBToken,
  verifyAdmin,
  updateCodingOrderStatus,
);
router.delete("/:id", verifyFBToken, verifyAdmin, deleteCodingOrder);

export default router;
