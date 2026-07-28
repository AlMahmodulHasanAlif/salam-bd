import express from "express";
import {
  saveIncompleteOrder,
  getAllIncompleteOrders,
  getIncompleteOrderStats,
  updateIncompleteOrderStatus,
  deleteIncompleteOrder,
  bulkDeleteIncompleteOrders,
} from "../controllers/incompleteOrderController.js";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";

const router = express.Router();

// The final save happens on page-hide via `navigator.sendBeacon`, which cannot
// set an `application/json` content type without triggering a CORS preflight
// the browser will not wait for while unloading. Beacons are therefore sent as
// `text/plain` and re-parsed here; normal fetch/axios saves are already parsed
// by the global express.json().
const parseBeaconBody = (req, _res, next) => {
  if (typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      req.body = {}; // controller treats an unusable body as "nothing to save"
    }
  }
  next();
};

// Public — any order form saves its draft here while the customer types.
router.post(
  "/",
  express.text({ type: "text/plain", limit: "64kb" }),
  parseBeaconBody,
  saveIncompleteOrder,
);

// Admin
// "stats" and "bulk" are declared before the "/:id" routes so they aren't
// captured as an :id param.
router.get("/stats", verifyFBToken, verifyAdmin, getIncompleteOrderStats);
router.delete("/bulk", verifyFBToken, verifyAdmin, bulkDeleteIncompleteOrders);

router.get("/", verifyFBToken, verifyAdmin, getAllIncompleteOrders);
router.patch(
  "/:id/status",
  verifyFBToken,
  verifyAdmin,
  updateIncompleteOrderStatus,
);
router.delete("/:id", verifyFBToken, verifyAdmin, deleteIncompleteOrder);

export default router;
