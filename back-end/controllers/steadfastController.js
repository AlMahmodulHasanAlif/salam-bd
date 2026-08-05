import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";

const BASE_URL =
  process.env.STEADFAST_BASE_URL || "https://portal.packzy.com/api/v1";
const API_KEY = process.env.STEADFAST_API_KEY;
const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

// Payment methods that are already collected up-front → no cash to collect on
// delivery. Everything else (Cash / COD) collects the full order total.
const PREPAID_METHODS = ["Card", "Online", "bKash", "Nagad", "SSLCommerz"];

// Build a single-line recipient address from a regular order's shippingInfo.
const buildAddress = (info = {}) =>
  [
    info.address || info.street,
    info.thana,
    info.district,
    info.city,
    info.zip || info.postcode,
    info.country,
  ]
    .filter(Boolean)
    .join(", ");

// ── Order-type mappers → Steadfast /create_order payload ────────────────────

// Regular Cart order (collection: orders, uses shippingInfo).
const mapRegularOrder = (order) => {
  const info = order.shippingInfo || {};
  const items = order.items || order.products || [];
  const prepaid = PREPAID_METHODS.includes(order.method);

  const itemDescription = items
    .map((i) => `${i.name || i.productName || "Item"} x${i.quantity || 1}`)
    .join(", ");

  return {
    invoice: String(order._id),
    recipient_name: (info.name || "Customer").slice(0, 100),
    recipient_phone: String(info.phone || "").replace(/\D/g, ""),
    recipient_address: (buildAddress(info) || "N/A").slice(0, 250),
    cod_amount: prepaid ? 0 : Number(order.totalPrice) || 0,
    note: (order.note || info.note || "").slice(0, 250) || undefined,
    item_description: itemDescription || undefined,
  };
};

// Landing-page plugin order (collection: pluginorders, uses billing/pricing).
// Its billing.address already bakes in the thana ("thana, detail address"),
// so we append district/country to complete the line. All plugin orders are COD.
const mapPluginOrder = (order) => {
  const b = order.billing || {};
  const p = order.product || {};
  const address = [b.address, b.district, b.country]
    .filter(Boolean)
    .join(", ");

  return {
    invoice: String(order._id),
    recipient_name: (b.name || "Customer").slice(0, 100),
    recipient_phone: String(b.phone || "").replace(/\D/g, ""),
    recipient_address: (address || "N/A").slice(0, 250),
    cod_amount: Number(order.pricing?.total) || 0,
    note: (order.note || "").slice(0, 250) || undefined,
    item_description:
      `${p.name || "Item"} x${p.quantity || 1}`.slice(0, 250) || undefined,
  };
};

// Coding-landing order (collection: codingorders) — same shape as plugin orders.
const mapCodingOrder = mapPluginOrder;

// ── Core: send one order to Steadfast and persist the result ─────────────────

const createConsignment = async (order, { mapper, collection }) => {
  const payload = mapper(order);

  // Guard: phone must be 11 digits, address/name present.
  if (payload.recipient_phone.length !== 11) {
    return {
      ok: false,
      orderId: String(order._id),
      error: `Invalid phone (${payload.recipient_phone || "empty"}) — must be 11 digits`,
    };
  }

  let res, body;
  try {
    res = await fetch(`${BASE_URL}/create_order`, {
      method: "POST",
      headers: {
        "Api-Key": API_KEY,
        "Secret-Key": SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    body = await res.json();
  } catch (err) {
    return { ok: false, orderId: String(order._id), error: err.message };
  }

  const c = body?.consignment;
  if (!res.ok || !c) {
    return {
      ok: false,
      orderId: String(order._id),
      error: body?.message || `Steadfast error (HTTP ${res.status})`,
    };
  }

  const steadfast = {
    consignmentId: c.consignment_id,
    trackingCode: c.tracking_code,
    status: c.status,
    codAmount: c.cod_amount,
    sentAt: new Date(),
  };

  await collection.updateOne(
    { _id: order._id },
    { $set: { steadfast, updatedAt: new Date() } },
  );

  return { ok: true, orderId: String(order._id), steadfast };
};

// ── Generic request handlers, parametrized by order type ─────────────────────

const keysConfigured = (res) => {
  if (!API_KEY || !SECRET_KEY) {
    res.status(500).send({ message: "Steadfast API keys are not configured" });
    return false;
  }
  return true;
};

const handleSingle = async (req, res, { collection, mapper }) => {
  if (!keysConfigured(res)) return;

  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).send({ message: "Invalid order ID" });

  const order = await collection.findOne({ _id: new ObjectId(id) });
  if (!order) return res.status(404).send({ message: "Order not found" });

  if (order.steadfast?.trackingCode && !req.body?.force)
    return res.status(409).send({
      message: "Order already sent to Steadfast",
      steadfast: order.steadfast,
    });

  const result = await createConsignment(order, { mapper, collection });
  if (!result.ok) return res.status(422).send({ message: result.error });

  res.send({
    message: `Sent to Steadfast — ${result.steadfast.trackingCode}`,
    steadfast: result.steadfast,
  });
};

const handleBulk = async (req, res, { collection, mapper }) => {
  if (!keysConfigured(res)) return;

  const { ids, force } = req.body;
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).send({ message: "No order IDs provided" });

  const objectIds = ids
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const orders = await collection.find({ _id: { $in: objectIds } }).toArray();

  const results = [];
  for (const order of orders) {
    if (order.steadfast?.trackingCode && !force) {
      results.push({
        ok: true,
        orderId: String(order._id),
        skipped: true,
        steadfast: order.steadfast,
      });
      continue;
    }
    // Sequential (not Promise.all) to stay gentle on the courier API.
    results.push(await createConsignment(order, { mapper, collection }));
  }

  const sent = results.filter((r) => r.ok && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.ok);

  res.send({
    message: `Sent ${sent}, skipped ${skipped} already-sent, ${failed.length} failed`,
    sent,
    skipped,
    failed,
    results,
  });
};

// ── Regular Cart orders ──────────────────────────────────────────────────────
const regularCfg = () => ({ collection: collections.orders, mapper: mapRegularOrder });

export const sendOrderToSteadfast = (req, res) =>
  handleSingle(req, res, regularCfg());

export const bulkSendToSteadfast = (req, res) =>
  handleBulk(req, res, regularCfg());

// ── Landing-page plugin orders ───────────────────────────────────────────────
const pluginCfg = () => ({
  collection: collections.pluginOrders,
  mapper: mapPluginOrder,
});

export const sendPluginOrderToSteadfast = (req, res) =>
  handleSingle(req, res, pluginCfg());

export const bulkSendPluginToSteadfast = (req, res) =>
  handleBulk(req, res, pluginCfg());

// ── Coding-landing orders ────────────────────────────────────────────────────
const codingCfg = () => ({
  collection: collections.codingOrders,
  mapper: mapCodingOrder,
});

export const sendCodingOrderToSteadfast = (req, res) =>
  handleSingle(req, res, codingCfg());

export const bulkSendCodingToSteadfast = (req, res) =>
  handleBulk(req, res, codingCfg());
