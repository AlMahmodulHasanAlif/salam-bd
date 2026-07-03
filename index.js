import "dotenv/config";

import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import { initFirebase } from "./config/firebase.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { attachFbData } from "./middlewares/auth.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import pluginOrderRoutes from "./routes/pluginOrderRoutes.js";

initFirebase();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://salambd.com",
  "https://www.salambd.com",
  "https://server.salambd.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(attachFbData); // ← ADD THIS (after cookieParser, before routes)

// ─── ROUTES ───────────────────────────────────────────────────────────────
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/pluginorder", pluginOrderRoutes);
app.get("/", (_req, res) => res.send("Salam BD API is running! 🕌"));

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ─── START ────────────────────────────────────────────────────────────────
connectDB()
  .then(() =>
    app.listen(port, () => console.log(`✅ Server running on port ${port}`)),
  )
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });
