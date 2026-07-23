import { Router } from "express";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import { saveToken, sendTest } from "../controllers/pushController.js";

const router = Router();

// ── Public ── the app posts its FCM device token here after registering.
router.post("/token", saveToken);

// ── Admin ── fire a test notification (all devices, or a specific token).
router.post("/test", verifyFBToken, verifyAdmin, sendTest);

export default router;
