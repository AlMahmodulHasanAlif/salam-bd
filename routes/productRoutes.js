import { Router } from "express";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import {
  getProducts,
  searchProducts,
  getProductById,
  getProductRecommendations,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
} from "../controllers/productController.js";
import { getProductReviews, createReview } from "../controllers/reviewController.js";

const router = Router();

// Public
router.get("/",                    getProducts);
router.get("/slug/:slug", getProductBySlug); 
router.get("/search",              searchProducts);            // ⚠ before /:id
router.get("/:id",                 getProductById);
router.get("/:id/recommendations", getProductRecommendations);
router.get("/:id/reviews",         getProductReviews);

// Protected
router.post("/:id/reviews", verifyFBToken, createReview);

// Admin
router.post("/",    verifyFBToken, verifyAdmin, createProduct);
router.put("/:id",  verifyFBToken, verifyAdmin, updateProduct);
router.delete("/:id", verifyFBToken, verifyAdmin, deleteProduct);

export default router;