// server/routes/blogRoutes.js
import { Router } from "express";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import {
  getBlogs,
  getCategories,
  getRecentBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getComments,
  addComment,
  deleteComment,
  toggleLike,
  getAllBlogsAdmin,
} from "../controllers/blogController.js";

const router = Router();

// ── Static routes FIRST (before any /:param routes) ──
router.get("/categories",           getCategories);
router.get("/recent",               getRecentBlogs);
router.get("/admin/all",            verifyFBToken, verifyAdmin, getAllBlogsAdmin);
router.delete("/comments/:id",      verifyFBToken, deleteComment);
router.patch("/comments/:id/like",  verifyFBToken, toggleLike);

// ── Collection + create ──
router.get("/",     getBlogs);
router.post("/",    verifyFBToken, verifyAdmin, createBlog);

// ── Dynamic slug routes LAST ──
router.get("/:slug",              getBlogBySlug);
router.get("/:slug/comments",     getComments);
router.post("/:slug/comments",    verifyFBToken, addComment);
router.put("/:id",                verifyFBToken, verifyAdmin, updateBlog);
router.delete("/:id",             verifyFBToken, verifyAdmin, deleteBlog);

export default router;