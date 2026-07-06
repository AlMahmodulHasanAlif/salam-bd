import { Router } from "express";
import { verifyFBToken } from "../middlewares/auth.js";
import { checkReview, updateReview, deleteReview } from "../controllers/reviewController.js";

const router = Router();

// ⚠ /check/:productId must come before any /:reviewId pattern
router.get("/check/:productId", verifyFBToken, checkReview);

router.patch("/:reviewId",  verifyFBToken, updateReview);
router.delete("/:reviewId", verifyFBToken, deleteReview);

export default router;