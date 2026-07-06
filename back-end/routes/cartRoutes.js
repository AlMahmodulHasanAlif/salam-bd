import { Router } from "express";
import { getCart, addToCart, updateCartItem, deleteCartItem, clearCart } from "../controllers/Cartcontroller.js";

const router = Router();

// Public — guests + logged-in users
router.get("/:email",        getCart);
router.post("/",             addToCart);
router.delete("/clear", clearCart);  // ⚠ before /:id
router.patch("/:id",         updateCartItem);
router.delete("/:id",        deleteCartItem);

export default router;