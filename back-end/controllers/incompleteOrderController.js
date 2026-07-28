// Incomplete (abandoned) orders.
//
// Every order form on the site saves a draft here as the customer types, keyed
// by a client-generated `draftId`. When the order is actually placed, the order
// controller deletes the matching draft — so whatever is left in this collection
// is exactly the set of people who filled the form but never ordered.
//
// This is a LEAD record, not an order: prices are stored as an indicative
// estimate and are never used for money. The order controllers remain the sole
// price authority.

import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";
import { getClientIp } from "../utils/request.js";
import { findBlock, getBlockedSets } from "./blockController.js";
import { buildSearchClauses } from "../utils/search.js";
import { sanitizeAttribution } from "../utils/attribution.js";

// Follow-up states an admin moves a lead through. "new" is the initial state.
export const FOLLOWUP_STATUSES = ["new", "contacted", "recovered", "lost"];

// The draftId is generated client-side (crypto.randomUUID), so it is untrusted
// input used directly as a query key — constrain it to a safe slug.
const DRAFT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

// `source` names the form the draft came from ("checkout", "plugin", …). It is
// validated as a slug rather than an allow-list so a new order form can start
// saving drafts without a backend change.
const SOURCE_RE = /^[a-z0-9_-]{2,32}$/;

const MAX_ITEMS = 50;

// Drafts are typed into by hand, so every string is capped before storage —
// this is an unauthenticated write path.
const str = (v, max = 200) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

// A draft is worth keeping once the customer has typed any real delivery detail —
// a name, a phone, an address, or a location. Below this bar the row is noise:
// someone who clicked into a field and left without entering anything.
const hasText = (v, min = 2) => (v || "").trim().length >= min;
const isContactable = (customer) => {
  const phoneDigits = (customer.phone || "").replace(/\D/g, "");
  return (
    phoneDigits.length >= 4 ||
    hasText(customer.name) ||
    hasText(customer.address, 3) ||
    hasText(customer.district) ||
    hasText(customer.thana)
  );
};

const normalizeCustomer = (c = {}) => ({
  name: str(c.name, 120),
  phone: str(c.phone, 30),
  address: str(c.address, 500),
  district: str(c.district, 80),
  thana: str(c.thana, 80),
  country: str(c.country, 80),
});

const normalizeItems = (items) =>
  (Array.isArray(items) ? items : []).slice(0, MAX_ITEMS).map((i) => ({
    productId: str(i?.productId, 50),
    name: str(i?.name, 200),
    image: str(i?.image, 500),
    price: num(i?.price),
    quantity: Math.max(1, parseInt(i?.quantity, 10) || 1),
    variantLabel: str(i?.variantLabel, 120),
  }));

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/incomplete-orders
//
// Upsert-by-draftId, so a customer editing the form for five minutes produces
// one row, not fifty. Called on a debounce while typing and again via
// sendBeacon when the tab is hidden or closed.
//
// This endpoint never fails the caller in a way the form has to handle: a
// rejected or blocked draft returns 204. Draft capture is a background concern
// and must never surface an error over a customer's checkout.
export const saveIncompleteOrder = asyncHandler(async (req, res) => {
  const { draftId, source, customer, items, estimatedTotal, note, attribution } =
    req.body || {};

  if (!DRAFT_ID_RE.test(draftId || "") || !SOURCE_RE.test(source || "")) {
    return res.status(204).end();
  }

  const safeCustomer = normalizeCustomer(customer);
  if (!isContactable(safeCustomer)) return res.status(204).end();

  // Same block-list gate the real order endpoints use — a blocked visitor
  // shouldn't be able to fill the admin's lead list either.
  const clientIp = getClientIp(req);
  const blocked = await findBlock({ ip: clientIp, phone: safeCustomer.phone });
  if (blocked) return res.status(204).end();

  const now = new Date();
  const update = {
    $set: {
      source,
      customer: safeCustomer,
      items: normalizeItems(items),
      estimatedTotal: num(estimatedTotal),
      note: str(note, 500),
      attribution: sanitizeAttribution(attribution),
      ip: clientIp,
      userAgent: req.headers["user-agent"] || "",
      updatedAt: now,
    },
    // createdAt and the follow-up state belong to the first save only —
    // re-saving a draft must not reset an admin's "contacted" marker.
    $setOnInsert: { draftId, status: "new", createdAt: now },
  };

  try {
    await collections.incompleteOrders.updateOne({ draftId }, update, {
      upsert: true,
    });
  } catch (err) {
    // Two saves for the same draft can land together — typically the debounced
    // save and the page-hide beacon — and both decide to insert. The unique
    // draftId index makes the loser fail with E11000; by then the document
    // exists, so the same update applies cleanly as a plain upsert.
    if (err?.code !== 11000) throw err;
    await collections.incompleteOrders.updateOne({ draftId }, update, {
      upsert: true,
    });
  }

  res.status(204).end();
});

// Called by the order controllers once an order is successfully placed: the
// lead converted, so the draft is no longer "incomplete". Deliberately silent —
// a failure here must never fail the order that just succeeded.
export const clearDraftById = async (draftId) => {
  if (!DRAFT_ID_RE.test(draftId || "")) return;
  try {
    await collections.incompleteOrders.deleteOne({ draftId });
  } catch (err) {
    console.warn(`[incomplete-orders] failed to clear draft ${draftId}:`, err?.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/incomplete-orders
export const getAllIncompleteOrders = asyncHandler(async (req, res) => {
  const { status, source, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (source && source !== "all") filter.source = source;

  const term = (search || "").trim();
  if (term) {
    filter.$and = buildSearchClauses(term, [
      "customer.name",
      "customer.phone",
      "customer.district",
      "customer.address",
    ]);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const col = collections.incompleteOrders;

  // Sorted by updatedAt, not createdAt: the most recently *active* abandoned
  // cart is the one worth calling first.
  const [drafts, total, sources] = await Promise.all([
    col.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)).toArray(),
    col.countDocuments(filter),
    col.distinct("source"),
  ]);

  const blocked = await getBlockedSets();
  const annotated = drafts.map((d) => ({
    ...d,
    blocked: {
      ip: !!(d.ip && blocked.ip.has(d.ip.trim())),
      phone: !!(d.customer?.phone && blocked.phone.has(d.customer.phone.trim())),
    },
  }));

  res.json({
    success: true,
    drafts: annotated,
    sources,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/incomplete-orders/stats
export const getIncompleteOrderStats = asyncHandler(async (req, res) => {
  const [row] = await collections.incompleteOrders
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          contacted: { $sum: { $cond: [{ $eq: ["$status", "contacted"] }, 1, 0] } },
          recovered: { $sum: { $cond: [{ $eq: ["$status", "recovered"] }, 1, 0] } },
          // Value still on the table: what the un-recovered leads were worth.
          lostValue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["new", "contacted"]] },
                { $ifNull: ["$estimatedTotal", 0] },
                0,
              ],
            },
          },
        },
      },
    ])
    .toArray();

  res.json({
    success: true,
    stats: {
      total: row?.total || 0,
      new: row?.new || 0,
      contacted: row?.contacted || 0,
      recovered: row?.recovered || 0,
      lostValue: row?.lostValue || 0,
    },
  });
});

// PATCH /api/incomplete-orders/:id/status
export const updateIncompleteOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!FOLLOWUP_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(
      `Invalid status. Expected one of: ${FOLLOWUP_STATUSES.join(", ")}`,
    );
  }

  const result = await collections.incompleteOrders.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { status, followedUpAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) {
    res.status(404);
    throw new Error("Incomplete order not found");
  }
  res.json({ success: true, draft: result });
});

const toObjectIds = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  try {
    return ids.map((id) => new ObjectId(id));
  } catch {
    return undefined; // signals an invalid id in the list
  }
};

// DELETE /api/incomplete-orders/bulk
export const bulkDeleteIncompleteOrders = asyncHandler(async (req, res) => {
  const objectIds = toObjectIds(req.body?.ids);
  if (objectIds === null) {
    res.status(400);
    throw new Error("No ids provided");
  }
  if (objectIds === undefined) {
    res.status(400);
    throw new Error("Invalid id in list");
  }

  const result = await collections.incompleteOrders.deleteMany({
    _id: { $in: objectIds },
  });
  res.json({ success: true, deleted: result.deletedCount });
});

// DELETE /api/incomplete-orders/:id
export const deleteIncompleteOrder = asyncHandler(async (req, res) => {
  const result = await collections.incompleteOrders.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("Incomplete order not found");
  }
  res.json({ success: true, message: "Incomplete order deleted" });
});
