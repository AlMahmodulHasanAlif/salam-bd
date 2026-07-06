import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";
import { sendServerEvent } from "../utils/facebookCAPI.js";

// GET CART
export const getCart = async (req, res) => {
  try {
    const items = await collections.cart
      .find({ userEmail: req.params.email })
      .toArray();

    res.send(items);
  } catch (error) {
    console.error("Get cart error:", error.message);
    res.status(500).send({ message: error.message });
  }
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const {
      userEmail,
      productId,
      name,
      image,
      price,
      quantity,
      variantLabel,
      selectedVariant,
      freeDelivery,
    } = req.body;

    if (!userEmail || !productId || !price) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const matchQuery = {
      userEmail,
      productId,
      variantLabel: variantLabel || null,
    };

    const existing = await collections.cart.findOne(matchQuery);

    if (existing) {
      const result = await collections.cart.updateOne(
        matchQuery,
        {
          $inc: { quantity: quantity || 1 },
          $set: { updatedAt: new Date() },
        }
      );

      try {
        await sendServerEvent("AddToCart", req, {
          value: price,
          currency: "BDT",
          content_ids: [String(productId)],
          num_items: quantity || 1,
          content_type: "product",
        });
      } catch (e) {
        console.log("Pixel error:", e.message);
      }

      return res.send(result);
    }

    const result = await collections.cart.insertOne({
      userEmail,
      productId,
      name,
      image,
      price,
      quantity: quantity || 1,
      variantLabel: variantLabel || null,
      selectedVariant: selectedVariant || null,
      freeDelivery: freeDelivery || false,
      addedAt: new Date(),
    });

    try {
      await sendServerEvent("AddToCart", req, {
        value: price,
        currency: "BDT",
        content_ids: [String(productId)],
        num_items: quantity || 1,
        content_type: "product",
      });
    } catch (e) {
      console.log("Pixel error:", e.message);
    }

    res.send(result);
  } catch (error) {
    console.error("Add cart error:", error.message);
    res.status(500).send({ message: error.message });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid cart item ID" });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).send({ message: "Quantity must be at least 1" });
  }

  try {
    const result = await collections.cart.updateOne(
      { _id: new ObjectId(id) },
      { $set: { quantity, updatedAt: new Date() } }
    );

    res.send(result);
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).send({ message: error.message });
  }
};

// DELETE CART ITEM
export const deleteCartItem = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid cart item ID" });
  }

  try {
    const result = await collections.cart.deleteOne({
      _id: new ObjectId(id),
    });

    try {
      await sendServerEvent("CustomEvent_RemovedFromCart", req);
    } catch (e) {
      console.log("Pixel error:", e.message);
    }

    res.send(result);
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).send({ message: error.message });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const result = await collections.cart.deleteMany({
      userEmail: req.params.email,
    });

    res.send(result);
  } catch (error) {
    console.error("Clear cart error:", error.message);
    res.status(500).send({ message: error.message });
  }
};