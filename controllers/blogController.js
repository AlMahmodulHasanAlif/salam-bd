// server/controllers/blogController.js
import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";

// ─────────────────────────────────────────
// GET /api/blogs
// Query: ?category=&page=1&limit=9
// ─────────────────────────────────────────
export const getBlogs = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 9 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { published: true };
  if (category && category !== "All") filter.category = category;

  const [blogs, total] = await Promise.all([
    collections.blogs
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray(),
    collections.blogs.countDocuments(filter),
  ]);

  res.send({ blogs, total, page: parseInt(page), limit: parseInt(limit) });
});

// ─────────────────────────────────────────
// GET /api/blogs/categories
// ─────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const result = await collections.blogs.aggregate([
    { $match: { published: true } },
    { $group: { _id: "$category" } },
    { $sort: { _id: 1 } },
  ]).toArray();
  const categories = result.map((r) => r._id).filter(Boolean);
  res.send(["All", ...categories]);
});

// ─────────────────────────────────────────
// GET /api/blogs/recent
// Returns latest 4 published blogs
// ─────────────────────────────────────────
export const getRecentBlogs = asyncHandler(async (req, res) => {
  const blogs = await collections.blogs
    .find({ published: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .toArray();
  res.send(blogs);
});

// ─────────────────────────────────────────
// GET /api/blogs/:slug
// ─────────────────────────────────────────
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await collections.blogs.findOne({ slug: req.params.slug, published: true });
  if (!blog) return res.status(404).send({ message: "Blog not found" });

  // increment views
  await collections.blogs.updateOne({ _id: blog._id }, { $inc: { views: 1 } });

  res.send({ ...blog, views: (blog.views || 0) + 1 });
});

// ─────────────────────────────────────────
// POST /api/blogs  [admin]
// ─────────────────────────────────────────
export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, coverImage, excerpt, tags } = req.body;
  if (!title || !content || !category)
    return res.status(400).send({ message: "title, content and category are required" });

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    + "-" + Date.now();

  const blog = {
    title,
    slug,
    content,
    category,
    coverImage: coverImage || "",
    excerpt: excerpt || content.replace(/<[^>]+>/g, "").slice(0, 160),
    tags: tags || [],
    published: true,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collections.blogs.insertOne(blog);
  res.status(201).send({ ...blog, _id: result.insertedId });
});

// ─────────────────────────────────────────
// PUT /api/blogs/:id  [admin]
// ─────────────────────────────────────────
export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid id" });

  const result = await collections.blogs.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...req.body, updatedAt: new Date() } }
  );
  res.send(result);
});

// ─────────────────────────────────────────
// DELETE /api/blogs/:id  [admin]
// ─────────────────────────────────────────
export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid id" });

  await collections.blogs.deleteOne({ _id: new ObjectId(id) });
  // also delete all comments for this blog
  await collections.blogComments?.deleteMany({ blogId: id });
  res.send({ message: "Blog deleted" });
});

// ─────────────────────────────────────────
// GET /api/blogs/:slug/comments
// ─────────────────────────────────────────
export const getComments = asyncHandler(async (req, res) => {
  const comments = await collections.blogComments
    .find({ blogSlug: req.params.slug, parentId: null })
    .sort({ createdAt: -1 })
    .toArray();

  // attach replies
  const withReplies = await Promise.all(
    comments.map(async (c) => {
      const replies = await collections.blogComments
        .find({ parentId: c._id.toString() })
        .sort({ createdAt: 1 })
        .toArray();
      return { ...c, replies };
    })
  );

  res.send(withReplies);
});

// ─────────────────────────────────────────
// POST /api/blogs/:slug/comments  [auth]
// Body: { text, parentId? }
// ─────────────────────────────────────────
export const addComment = asyncHandler(async (req, res) => {
  const { text, parentId } = req.body;
  if (!text?.trim()) return res.status(400).send({ message: "Comment text required" });

  const comment = {
    blogSlug: req.params.slug,
    text: text.trim(),
    parentId: parentId || null,
    authorEmail: req.user.email,
    authorName: req.body.authorName || req.user.email.split("@")[0],
    authorPhoto: req.body.authorPhoto || null,
    likes: [],
    createdAt: new Date(),
  };

  const result = await collections.blogComments.insertOne(comment);
  res.status(201).send({ ...comment, _id: result.insertedId, replies: [] });
});

// ─────────────────────────────────────────
// DELETE /api/blogs/comments/:id  [auth — own comment or admin]
// ─────────────────────────────────────────
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid id" });

  const comment = await collections.blogComments.findOne({ _id: new ObjectId(id) });
  if (!comment) return res.status(404).send({ message: "Comment not found" });

  // allow if own comment or admin
  const user = await collections.users.findOne({ email: req.user.email });
  if (comment.authorEmail !== req.user.email && user?.role !== "admin")
    return res.status(403).send({ message: "Forbidden" });

  await collections.blogComments.deleteOne({ _id: new ObjectId(id) });
  // delete replies too
  await collections.blogComments.deleteMany({ parentId: id });
  res.send({ message: "Deleted" });
});

// ─────────────────────────────────────────
// PATCH /api/blogs/comments/:id/like  [auth]
// ─────────────────────────────────────────
export const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid id" });

  const comment = await collections.blogComments.findOne({ _id: new ObjectId(id) });
  if (!comment) return res.status(404).send({ message: "Not found" });

  const email = req.user.email;
  const liked = comment.likes?.includes(email);

  await collections.blogComments.updateOne(
    { _id: new ObjectId(id) },
    liked ? { $pull: { likes: email } } : { $push: { likes: email } }
  );

  res.send({ liked: !liked, count: (comment.likes?.length || 0) + (liked ? -1 : 1) });
});

// ─────────────────────────────────────────
// GET /api/blogs/admin/all  [admin] — includes unpublished
// ─────────────────────────────────────────
export const getAllBlogsAdmin = asyncHandler(async (req, res) => {
  const blogs = await collections.blogs.find({}).sort({ createdAt: -1 }).toArray();
  res.send(blogs);
});