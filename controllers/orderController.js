import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";
import asyncHandler from "express-async-handler";
import  {sendServerEvent}  from "../utils/facebookCAPI.js"; // ADD THIS
import { notifyNewOrder } from "../utils/telegram.js";

// Resolve the authoritative price of an item from the DB product, mirroring the
// frontend variant logic — NEVER trust a client-supplied price.
const resolveServerPrice = (product, variantLabel) => {
  const base = Number(product?.price) || 0;
  if (!variantLabel || !Array.isArray(product?.variants)) return base;
  const v = product.variants.find(
    (x) => (x.label || x.name || x.size || x.color) === variantLabel,
  );
  if (!v) return base;
  if (v.price != null && v.price !== "") return Number(v.price);
  if (v.priceAdjustment != null) return base + Number(v.priceAdjustment);
  return base;
};

// Legit paid-delivery charges (inside / outside Dhaka). Free delivery (0) is
// only valid when every ordered product is flagged freeDelivery.
const PAID_SHIPPING = [80, 120];

export const createOrder = async (req, res) => {
  const { fbEventId, isBuyNow, buyNowProductId, buyNowVariantLabel, ...orderBody } =
    req.body;

  const clientItems = Array.isArray(orderBody.items) ? orderBody.items : [];
  if (!clientItems.length) {
    return res
      .status(400)
      .send({ message: "Order must contain at least one item" });
  }

  // Load the real products in one query and re-price everything server-side.
  const objectIds = clientItems
    .map((i) => i.productId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const products = await collections.products
    .find({ _id: { $in: objectIds } })
    .toArray();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let itemsSubtotal = 0;
  const items = [];
  for (const ci of clientItems) {
    const product = productMap.get(String(ci.productId));
    if (!product) {
      return res
        .status(400)
        .send({ message: `Product not found: ${ci.productId}` });
    }
    const price = resolveServerPrice(product, ci.variantLabel);
    const quantity = Math.max(1, parseInt(ci.quantity, 10) || 1);
    itemsSubtotal += price * quantity;
    items.push({
      productId: ci.productId,
      name: product.name,
      image: ci.image || null,
      price, // server price, not the client's
      quantity,
      variantLabel: ci.variantLabel || null,
      selectedVariant: ci.selectedVariant || null,
    });
  }

  // Shipping: free only if every ordered product is freeDelivery; otherwise it
  // must be one of the allowed zone charges (guards against tampered/negative values).
  const allFree = items.every(
    (it) => productMap.get(String(it.productId))?.freeDelivery,
  );
  let shippingCharge = Number(orderBody.shippingInfo?.shippingCharge) || 0;
  if (allFree) shippingCharge = 0;
  else if (!PAID_SHIPPING.includes(shippingCharge)) shippingCharge = 120; // reject 0/tampered → standard charge

  const order = {
    ...orderBody,
    items,
    totalPrice: itemsSubtotal + shippingCharge, // authoritative total
    shippingInfo: { ...orderBody.shippingInfo, shippingCharge },
    status: "Pending",
    createdAt: new Date(),
  };
  const result = await collections.orders.insertOne(order);

  // Cart cleanup:
  //  • Buy Now  → remove ONLY the purchased product, keep the rest of the cart
  //  • Checkout → clear the whole cart
  if (isBuyNow && buyNowProductId) {
    await collections.cart.deleteMany({
      userEmail: order.userEmail,
      productId: buyNowProductId,
      variantLabel: buyNowVariantLabel || null,
    });
  } else {
    await collections.cart.deleteMany({ userEmail: order.userEmail });
  }

  // Telegram: instant new-order alert (non-blocking)
  notifyNewOrder({ ...order, _id: result.insertedId }, { source: "Order" });

  // CAPI: Purchase — deduplicates with frontend GTM event via shared eventId
  await sendServerEvent('Purchase', req, {
    value: order.totalPrice || order.totalAmount || order.total || 0,
    currency: 'BDT',
    content_ids: order.items?.map(i => String(i.productId || i._id)) || [],
    num_items: order.items?.length || 1,
    content_type: 'product',
  }, fbEventId || null);

  res.send(result);
};

export const getUserOrders = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const requester = req.user;

  if (requester.email !== email && requester.role !== "admin") {
    return res.status(403).json({ message: "Forbidden access" });
  }

  const orders = await collections.orders
    .find({ userEmail: email })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(orders);
  // no pixel here — just a data fetch, not a user action
});

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).send({ message: "Invalid order ID" });

  const order = await collections.orders.findOne({ _id: new ObjectId(id) });
  if (!order) return res.status(404).send({ message: "Order not found" });

  // Ownership check — only the order's owner or an admin may view it (prevents IDOR)
  const requester = req.user;
  if (order.userEmail !== requester?.email && requester?.role !== "admin") {
    return res.status(403).send({ message: "Forbidden access" });
  }

  res.send(order);
  // no pixel here — admin/user viewing order detail, not a conversion
};

// ── Admin ────────────────────────────────────────────────────────────────

export const getAllOrders = async (req, res) => {
  const { status, search, method, startDate, endDate, limit } = req.query;

  const query = {};
  if (status && status !== "all")  query.status = status;
  if (method && method !== "All")  query.method = method;
  if (search) {
    query.$or = [
      { "shippingInfo.name": { $regex: search, $options: "i" } },
      { userEmail: { $regex: search, $options: "i" } },
    ];
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const orders = await collections.orders
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit ? parseInt(limit) : 0)
    .toArray();

  res.send(orders);
  // no pixel here — admin dashboard fetch only
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).send({ message: "Invalid order ID" });

  const result = await collections.orders.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0)
    return res.status(404).send({ message: "Order not found" });

  // PIXEL: custom — admin deleted an order (useful for tracking cancellations)
  await sendServerEvent('CustomEvent_OrderDeleted', req);

  res.send({ message: "Order deleted", deleted: true });
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const VALID_STATUSES = [
    "Pending",
    "Processing",
    "Shipped",
    "Out-For-Delivery",
    "Delivered",
    "Cancel",
  ];

  if (!VALID_STATUSES.includes(status))
    return res.status(400).send({ message: "Invalid status" });

  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send({ message: "Invalid order ID" });

  const result = await collections.orders.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { status, updatedAt: new Date() } }
  );

  // PIXEL: fire different events based on what status changed to
  if (status === 'Delivered') {
    await sendServerEvent('Subscribe', req); // signals completed revenue
  }

  if (status === 'Cancel') {
    await sendServerEvent('CustomEvent_OrderCancelled', req);
  }

  if (status === 'Shipped') {
    await sendServerEvent('CustomEvent_OrderShipped', req);
  }

  res.send(result);
};