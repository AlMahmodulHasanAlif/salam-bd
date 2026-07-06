// middlewares/auth.js
import asyncHandler from "express-async-handler";
import { getAuth } from "firebase-admin/auth";
import { collections } from "../config/db.js";

// Verify Firebase token
export const verifyFBToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await getAuth().verifyIdToken(token);

    // Attach user info to req
    req.user = {
      email: decoded.email,
      uid: decoded.uid,
      role: null, // will fetch below
    };

    // Fetch role from DB (optional, can skip if you store role in token)
    const userDoc = await collections.users.findOne({ email: decoded.email });
    req.user.role = userDoc?.role || "user";

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
});

// Verify admin (optional, for routes only admins can access)
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
});

export const attachFbData = (req, res, next) => {
  req.fbData = {
    fbp:       req.headers['x-fbp'] || req.cookies?._fbp || null,
    fbc:       req.headers['x-fbc'] || req.cookies?._fbc || null,
    userAgent: req.headers['user-agent'] || '',
    ip:        req.headers['x-forwarded-for'] || req.ip || '',
    referer:   req.headers.referer || req.headers.origin || '',
  };
  next();
};