import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";

// ─────────────────────────────────────────
// HELPER — recalculate product ratings after any review change
// ─────────────────────────────────────────
export const recalcProductRating = async (productId) => {
  const allReviews = await collections.reviews.find({ productId }).toArray();

  const reviewCount = allReviews.length;
  const avgRating =
    reviewCount > 0
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

  await collections.products.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { ratings: avgRating, reviewCount, updatedAt: new Date() } }
  );
};

// ─────────────────────────────────────────
// GET /reviews/check/:productId  — PROTECTED
// ─────────────────────────────────────────
export const checkReview = async (req, res) => {
  const { productId } = req.params;
  if (!ObjectId.isValid(productId))
    return res.status(400).send({ message: "Invalid product ID" });

  const review = await collections.reviews.findOne({
    productId,
    userEmail: req.user.email,
  });
  res.send({ hasReviewed: !!review, review: review || null });
};

// ─────────────────────────────────────────
// GET /products/:id/reviews  — PUBLIC
// ─────────────────────────────────────────
export const getProductReviews = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).send({ message: "Invalid product ID" });

  const reviews = await collections.reviews
    .find({ productId: id })
    .sort({ createdAt: -1 })
    .toArray();

  const totalReviews   = reviews.length;
  const distribution   = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum        = 0;
  let recommendedCount = 0;

  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star]++;
    ratingSum += r.rating;
    if (r.recommended) recommendedCount++;
  });

  const averageRating =
    totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;
  const recommendedPercent =
    totalReviews > 0 ? Math.round((recommendedCount / totalReviews) * 100) : 0;

  res.send({
    reviews,
    summary: { averageRating, totalReviews, distribution, recommendedCount, recommendedPercent },
  });
};

// ─────────────────────────────────────────
// POST /products/:id/reviews  — PROTECTED
// ─────────────────────────────────────────
export const createReview = async (req, res) => {
  const productId = req.params.id;
  const userEmail = req.user.email;

  if (!ObjectId.isValid(productId))
    return res.status(400).send({ message: "Invalid product ID" });

  const product = await collections.products.findOne({ _id: new ObjectId(productId) });
  if (!product) return res.status(404).send({ message: "Product not found" });

  const existing = await collections.reviews.findOne({ productId, userEmail });
  if (existing)
    return res.status(409).send({ message: "You have already reviewed this product" });

  const { rating, comment, recommended = false } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).send({ message: "Rating must be between 1 and 5" });

  const user = await collections.users.findOne({ email: userEmail });

  const review = {
    productId,
    userEmail,
    userName:    user?.name  || "Anonymous",
    userPhoto:   user?.photo || null,
    rating:      parseFloat(rating),
    comment:     comment?.trim() || "",
    recommended: Boolean(recommended),
    createdAt:   new Date(),
  };

  const result = await collections.reviews.insertOne(review);
  await recalcProductRating(productId);

  res.send({ insertedId: result.insertedId, review });
};

// ─────────────────────────────────────────
// PATCH /reviews/:reviewId  — PROTECTED (owner only)
// ─────────────────────────────────────────
export const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  if (!ObjectId.isValid(reviewId))
    return res.status(400).send({ message: "Invalid review ID" });

  const review = await collections.reviews.findOne({ _id: new ObjectId(reviewId) });
  if (!review) return res.status(404).send({ message: "Review not found" });
  if (review.userEmail !== req.user.email)
    return res.status(403).send({ message: "Forbidden" });

  const { rating, comment, recommended } = req.body;
  const updates = { updatedAt: new Date() };

  if (rating !== undefined) {
    if (rating < 1 || rating > 5)
      return res.status(400).send({ message: "Rating must be between 1 and 5" });
    updates.rating = parseFloat(rating);
  }
  if (comment     !== undefined) updates.comment     = comment.trim();
  if (recommended !== undefined) updates.recommended = Boolean(recommended);

  await collections.reviews.updateOne({ _id: new ObjectId(reviewId) }, { $set: updates });
  await recalcProductRating(review.productId);

  res.send({ message: "Review updated" });
};

// ─────────────────────────────────────────
// DELETE /reviews/:reviewId  — PROTECTED (owner or admin)
// ─────────────────────────────────────────
export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  if (!ObjectId.isValid(reviewId))
    return res.status(400).send({ message: "Invalid review ID" });

  const review = await collections.reviews.findOne({ _id: new ObjectId(reviewId) });
  if (!review) return res.status(404).send({ message: "Review not found" });

  const requestingUser = await collections.users.findOne({ email: req.user.email });
  const isAdmin = requestingUser?.role === "admin";

  if (review.userEmail !== req.user.email && !isAdmin)
    return res.status(403).send({ message: "Forbidden" });

  await collections.reviews.deleteOne({ _id: new ObjectId(reviewId) });
  await recalcProductRating(review.productId);

  res.send({ message: "Review deleted" });
};