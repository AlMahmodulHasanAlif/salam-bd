import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";
import { recalcProductRating } from "./reviewController.js";

export const getAllUsers = async (req, res) => {
  const { searchText } = req.query;
  const query = searchText
    ? {
        $or: [
          { name:  { $regex: searchText, $options: "i" } },
          { email: { $regex: searchText, $options: "i" } },
          { phone: { $regex: searchText, $options: "i" } },
        ],
      }
    : {};
  const users = await collections.users.find(query).sort({ createdAt: -1 }).toArray();
  res.send(users);
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role))
    return res.status(400).send({ message: "Role must be 'user' or 'admin'" });

  const result = await collections.users.updateOne(
    { email: req.params.email },
    { $set: { role, updatedAt: new Date() } }
  );
  res.send(result);
};

export const deleteUser = async (req, res) => {
  const result = await collections.users.deleteOne({ email: req.params.email });
  res.send(result);
};

export const getAllReviews = async (req, res) => {
  const query = req.query.productId ? { productId: req.query.productId } : {};
  const reviews = await collections.reviews.find(query).sort({ createdAt: -1 }).toArray();
  res.send(reviews);
};

export const adminDeleteReview = async (req, res) => {
  const { reviewId } = req.params;
  if (!ObjectId.isValid(reviewId))
    return res.status(400).send({ message: "Invalid review ID" });

  const review = await collections.reviews.findOne({ _id: new ObjectId(reviewId) });
  if (!review) return res.status(404).send({ message: "Review not found" });

  await collections.reviews.deleteOne({ _id: new ObjectId(reviewId) });
  await recalcProductRating(review.productId);

  res.send({ message: "Review deleted" });
};