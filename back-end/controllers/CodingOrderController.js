import asyncHandler from "express-async-handler";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { notifyNewOrder } from "../utils/telegram.js";
import { getClientIp } from "../utils/request.js";
import { findBlock, getBlockedSets } from "./blockController.js";
import { sanitizeAttribution } from "../utils/attribution.js";
import { clearDraftById } from "./incompleteOrderController.js";

const COLLECTION = "codingorders";
const VALID_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

// Authoritative config for the fixed coding-landing product — the server, not
// the client, decides the price. Keep in sync with PRODUCT in the landing form
// (client/src/codingLanding/CodingOrderForm.jsx).
const CODING_PRODUCT = {
  name: "Salam Coding Book",
  price: 1500,
  freeDelivery: true,
};
const PAID_SHIPPING = [80, 120];

// POST /api/codingorder
export const createCodingOrder = asyncHandler(async (req, res) => {
  // NOTE: client-supplied `pricing`/`product.price` are intentionally ignored.
  const { product, billing, shipping, payment, note, attribution, draftId } =
    req.body;

  if (!product || !billing || !shipping || !payment) {
    res.status(400);
    throw new Error("Missing required order fields");
  }

  // ── Block-list gate — reject orders from a blocked IP / phone ──
  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";
  const blockedType = await findBlock({ ip: clientIp, phone: billing?.phone });
  if (blockedType) {
    res.status(403);
    throw new Error(
      "Your order could not be processed. Please contact support.",
    );
  }

  // Re-price server-side to prevent tampering (e.g. ordering for ৳1).
  const quantity = Math.max(1, parseInt(product?.quantity, 10) || 1);
  const subtotal = CODING_PRODUCT.price * quantity;

  let shippingCharge = 0;
  if (!CODING_PRODUCT.freeDelivery) {
    shippingCharge = Number(shipping?.charge) || 0;
    if (!PAID_SHIPPING.includes(shippingCharge)) shippingCharge = 120;
  }
  const total = subtotal + shippingCharge;

  const safeProduct = {
    name: CODING_PRODUCT.name,
    price: CODING_PRODUCT.price,
    quantity,
    image: product?.image || null,
  };
  const safeShipping = CODING_PRODUCT.freeDelivery
    ? { zone: "free", charge: 0 }
    : { zone: shipping?.zone || "outside_dhaka", charge: shippingCharge };
  const pricing = { subtotal, total };

  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    product: safeProduct,
    billing,
    shipping: safeShipping,
    payment,
    pricing,
    note: note || null,
    attribution: sanitizeAttribution(attribution),
    status: "pending",
    ip: clientIp,
    userAgent,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // The lead converted — drop it from the incomplete-orders list.
  await clearDraftById(draftId);

  // Telegram: instant new-order alert (non-blocking)
  notifyNewOrder(
    {
      product: safeProduct,
      billing,
      shipping: safeShipping,
      payment,
      pricing,
      note,
      _id: result.insertedId,
    },
    { source: "Coding Landing Order" },
  );

  res.status(201).json({ success: true, orderId: result.insertedId });
});

// GET /api/codingorder
export const getAllCodingOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const db = getDB();

  const [orders, total] = await Promise.all([
    db
      .collection(COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray(),
    db.collection(COLLECTION).countDocuments(filter),
  ]);

  // Annotate each order with which of its IP / phone are already blocked, so
  // the admin UI can reflect state and disable the right buttons.
  const blocked = await getBlockedSets();
  const annotated = orders.map((o) => ({
    ...o,
    blocked: {
      ip: !!(o.ip && blocked.ip.has(o.ip.trim())),
      phone: !!(o.billing?.phone && blocked.phone.has(o.billing.phone.trim())),
    },
  }));

  res.json({
    success: true,
    orders: annotated,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/codingorder/:id
export const getCodingOrderById = asyncHandler(async (req, res) => {
  const db = getDB();
  const order = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, order });
});

// PATCH /api/codingorder/:id/status
export const updateCodingOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

  if (!result) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, order: result });
});

// DELETE /api/codingorder/:id
export const deleteCodingOrder = asyncHandler(async (req, res) => {
  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, message: "Order deleted" });
});
