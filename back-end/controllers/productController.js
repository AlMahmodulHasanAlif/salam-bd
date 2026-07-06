import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";
import { sendServerEvent } from "../utils/facebookCAPI.js";
import { slugify } from "../utils/slugify.js";

// ─── Helper ────────────────────────────────────────────────────────────────

const stripSensitive = (product) => {
  if (!product) return product;
  const { wholesalePrice, ...safe } = product;
  return safe;
};

// ─── Public routes ─────────────────────────────────────────────────────────

export const getProducts = async (req, res, next) => {
  try {
    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const { category, subcategory, sort, minPrice, maxPrice } = req.query;
    const query = {};

    if (category && category !== "all")
      query.category = { $regex: category, $options: "i" };

    if (subcategory && subcategory !== "all")
      query.subcategory = { $regex: subcategory, $options: "i" };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    const products = await collections.products
      .find(query)
      .sort(sortOption)
      .toArray();

    res.send(products.map(stripSensitive));
  } catch (err) {
    console.error("❌ getProducts error:", err);
    next(err);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const { q } = req.query;
    if (!q?.trim()) return res.send([]);

    const regex = { $regex: q.trim(), $options: "i" };

    const products = await collections.products
      .find({
        $or: [
          { name: regex },
          { nameBn: regex },
          { category: regex },
          { subcategory: regex },
        ],
      })
      .limit(20)
      .toArray();

    await sendServerEvent("Search", req);

    res.send(products.map(stripSensitive));
  } catch (err) {
    console.error("❌ searchProducts error:", err);
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: "Invalid product ID" });
    }

    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const product = await collections.products.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    await sendServerEvent("ViewContent", req, {
      value: product.price,
      currency: "BDT",
      content_ids: [String(product._id)],
      content_type: "product",
    });

    res.send(stripSensitive(product));
  } catch (err) {
    console.error("❌ getProductById error:", err);
    next(err);
  }
};

// ✅ New — fetch product by slug
export const getProductBySlug = async (req, res, next) => {
  try {
    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const product = await collections.products.findOne({
      slug: req.params.slug,
    });

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    await sendServerEvent("ViewContent", req, {
      value: product.price,
      currency: "BDT",
      content_ids: [String(product._id)],
      content_type: "product",
    });

    res.send(stripSensitive(product));
  } catch (err) {
    console.error("❌ getProductBySlug error:", err);
    next(err);
  }
};

export const getProductRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid product ID" });
    }

    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const current = await collections.products.findOne({
      _id: new ObjectId(id),
    });

    if (!current) {
      console.warn("⚠️ Product not found for recommendations:", id);
      return res.send([]);
    }

    let recs = await collections.products
      .find({
        _id: { $ne: new ObjectId(id) },
        subcategory: current.subcategory,
      })
      .limit(8)
      .toArray();

    if (recs.length < 8) {
      const usedIds = recs.map((p) => p?._id).filter(Boolean);

      const more = await collections.products
        .find({
          _id: { $ne: new ObjectId(id), $nin: usedIds },
          category: current.category,
        })
        .limit(8 - recs.length)
        .toArray();

      recs = [...recs, ...more];
    }

    res.send(recs.map(stripSensitive));
  } catch (err) {
    console.error("❌ getProductRecommendations error:", err);
    next(err);
  }
};

// ─── Admin routes ──────────────────────────────────────────────────────────

export const getProductsAdmin = async (req, res, next) => {
  try {
    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const { category, subcategory, sort, minPrice, maxPrice } = req.query;
    const query = {};

    if (category && category !== "all")
      query.category = { $regex: category, $options: "i" };

    if (subcategory && subcategory !== "all")
      query.subcategory = { $regex: subcategory, $options: "i" };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    const products = await collections.products
      .find(query)
      .sort(sortOption)
      .toArray();

    res.send(products);
  } catch (err) {
    console.error("❌ getProductsAdmin error:", err);
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const product = {
      ...req.body,
      slug: slugify(req.body.name), // ✅ generate slug on create
      ratings: 0,
      reviewCount: 0,
      createdAt: new Date(),
    };

    const result = await collections.products.insertOne(product);

    await sendServerEvent("CustomEvent_ProductListed", req);

    res.send(result);
  } catch (err) {
    console.error("❌ createProduct error:", err);
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: "Invalid product ID" });
    }

    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    const body = { ...req.body };
    delete body._id;
    delete body.ratings;
    delete body.reviewCount;

    // ✅ regenerate slug if name changed
    if (body.name) {
      body.slug = slugify(body.name);
    }

    const result = await collections.products.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    res.send(result);
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ message: "Invalid product ID" });
    }

    if (!collections?.products) {
      throw new Error("Products collection not initialized");
    }

    await collections.reviews.deleteMany({ productId: req.params.id });

    const result = await collections.products.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    await sendServerEvent("CustomEvent_ProductDeleted", req);

    res.send(result);
  } catch (err) {
    console.error("❌ deleteProduct error:", err);
    next(err);
  }
};