import { Router } from "express";
import { verifyFBToken } from "../middlewares/auth.js";
import { getUser, getUserRole, createUser, updateUser } from "../controllers/userController.js";

const router = Router();

router.get("/:email",      verifyFBToken, getUser); // full user doc → auth + self/admin only
router.get("/:email/role", getUserRole);            // role only (non-PII), used by login flow
router.post("/",           createUser);
router.patch("/:email",    verifyFBToken, updateUser);

export default router;