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

// Ensure the DB is connected before any route runs. In serverless (Vercel) a
// request can hit a cold start before the connection is ready, so we await the
// cached connection here rather than relying on a one-time startup call.
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

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
// On Vercel the app is invoked as a serverless function via the default export
// below — there is no long-lived process, so we only listen() during local dev.
if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(() =>
      app.listen(port, () => console.log(`✅ Server running on port ${port}`)),
    )
    .catch((err) => {
      console.error("❌ Failed to connect to MongoDB:", err);
      process.exit(1);
    });
}

// Vercel (@vercel/node) needs the Express app exported as the request handler.
export default app;
