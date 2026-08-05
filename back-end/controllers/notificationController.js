// Admin new-order notification counts.
//
// Rather than writing a duplicate notification document per order, counts are
// derived live from the order collections against a per-admin "last seen"
// timestamp. Nothing to keep in sync, and it works retroactively for orders
// that were placed before this feature existed.

import asyncHandler from "express-async-handler";
import { collections } from "../config/db.js";

// section key → the collection its unseen count is counted from
const SECTIONS = {
  orders: () => collections.orders,
  pluginOrders: () => collections.pluginOrders,
  codingOrders: () => collections.codingOrders,
  incompleteOrders: () => collections.incompleteOrders,
};

// Returns the admin's seen-marker doc, creating it stamped "now" on first call
// so a brand-new admin starts at zero instead of seeing every historical order.
const getSeenDoc = async (adminEmail) => {
  const now = new Date();
  const keys = Object.keys(SECTIONS);

  const doc = await collections.notificationSeen.findOneAndUpdate(
    { adminEmail },
    {
      $setOnInsert: {
        adminEmail,
        ...Object.fromEntries(keys.map((k) => [k, now])),
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  // Never return a missing timestamp — a `$gt: undefined` comparison would
  // match every document and report the entire order history as unseen. This
  // also covers sections added after an admin's marker doc was created, whose
  // key simply isn't on the existing document.
  return Object.fromEntries(keys.map((k) => [k, doc?.[k] ?? now]));
};

// GET /api/admin/notifications
// → { orders: 3, pluginOrders: 1, incompleteOrders: 2, total: 6, seenAt: {...} }
export const getNotificationCounts = asyncHandler(async (req, res) => {
  const seen = await getSeenDoc(req.user.email);

  const entries = Object.entries(SECTIONS);
  const counts = await Promise.all(
    entries.map(([key, getCollection]) =>
      getCollection().countDocuments({ createdAt: { $gt: seen[key] } }),
    ),
  );

  const bySection = Object.fromEntries(
    entries.map(([key], i) => [key, counts[i]]),
  );

  res.json({
    ...bySection,
    total: counts.reduce((sum, n) => sum + n, 0),
    seenAt: seen,
  });
});

// POST /api/admin/notifications/seen  { section: "orders" | "pluginOrders" }
// Omit `section` to clear both. Called when an admin opens the relevant page.
export const markNotificationsSeen = asyncHandler(async (req, res) => {
  const { section } = req.body || {};

  if (section && !SECTIONS[section]) {
    return res.status(400).json({
      message: `Invalid section. Expected one of: ${Object.keys(SECTIONS).join(", ")}`,
    });
  }

  const now = new Date();
  const targets = section ? [section] : Object.keys(SECTIONS);

  await collections.notificationSeen.updateOne(
    { adminEmail: req.user.email },
    { $set: Object.fromEntries(targets.map((key) => [key, now])) },
    { upsert: true },
  );

  res.json({ success: true, seenAt: now, sections: targets });
});
