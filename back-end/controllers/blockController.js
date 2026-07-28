import asyncHandler from "express-async-handler";
import { collections } from "../config/db.js";

// Map a block type to its backing collection.
const BLOCK_COLLECTIONS = {
  ip: () => collections.blockedIps,
  phone: () => collections.blockedPhones,
  email: () => collections.blockedEmails,
};

// Normalize a value so matching is consistent (trim everything; lowercase email).
const normalizeValue = (type, value) => {
  const v = String(value ?? "").trim();
  return type === "email" ? v.toLowerCase() : v;
};

// POST /api/admin/blocks  { type: "ip" | "phone" | "email", value, reason? }
// Admin-only (enforced by the router). Idempotent — duplicates are ignored.
export const createBlock = asyncHandler(async (req, res) => {
  const { type, reason } = req.body;
  const getCol = BLOCK_COLLECTIONS[type];
  if (!getCol) {
    res.status(400);
    throw new Error("Invalid block type");
  }

  const value = normalizeValue(type, req.body.value);
  if (!value) {
    res.status(400);
    throw new Error("Missing value to block");
  }

  const col = getCol();

  // Prevent duplicate entries.
  const existing = await col.findOne({ value });
  if (existing) {
    return res.json({ success: true, alreadyBlocked: true, type, value });
  }

  try {
    await col.insertOne({
      value,
      reason: reason?.trim() || null,
      blockedBy: req.user?.email || null,
      blockedAt: new Date(),
    });
  } catch (err) {
    // Unique-index race — treat as already blocked rather than an error.
    if (err?.code === 11000) {
      return res.json({ success: true, alreadyBlocked: true, type, value });
    }
    throw err;
  }

  res.status(201).json({ success: true, alreadyBlocked: false, type, value });
});

// DELETE /api/admin/blocks  { type: "ip" | "phone" | "email", value }
// Admin-only (enforced by the router). Idempotent — removing an entry that is
// not blocked succeeds, so a stale UI can't produce an error.
export const deleteBlock = asyncHandler(async (req, res) => {
  const { type } = req.body || {};
  const getCol = BLOCK_COLLECTIONS[type];
  if (!getCol) {
    return res.status(400).json({ message: "Invalid block type" });
  }

  const value = normalizeValue(type, req.body.value);
  if (!value) {
    return res.status(400).json({ message: "Missing value to unblock" });
  }

  const { deletedCount } = await getCol().deleteOne({ value });

  res.json({ success: true, wasBlocked: deletedCount > 0, type, value });
});

// Loads every blocked value into a Set per type — used to annotate order lists
// so the admin UI knows which entries are already blocked.
export const getBlockedSets = async () => {
  const [ips, phones, emails] = await Promise.all([
    collections.blockedIps.find({}, { projection: { value: 1 } }).toArray(),
    collections.blockedPhones.find({}, { projection: { value: 1 } }).toArray(),
    collections.blockedEmails.find({}, { projection: { value: 1 } }).toArray(),
  ]);
  return {
    ip: new Set(ips.map((d) => d.value)),
    phone: new Set(phones.map((d) => d.value)),
    email: new Set(emails.map((d) => d.value)),
  };
};

// Returns the first matching block type ("ip" | "phone" | "email") or null.
// Used to reject orders before they are created.
export const findBlock = async ({ ip, phone, email }) => {
  const checks = [];
  const nIp = normalizeValue("ip", ip);
  const nPhone = normalizeValue("phone", phone);
  const nEmail = normalizeValue("email", email);

  if (nIp)
    checks.push(
      collections.blockedIps.findOne({ value: nIp }).then((d) => (d ? "ip" : null)),
    );
  if (nPhone)
    checks.push(
      collections.blockedPhones
        .findOne({ value: nPhone })
        .then((d) => (d ? "phone" : null)),
    );
  if (nEmail)
    checks.push(
      collections.blockedEmails
        .findOne({ value: nEmail })
        .then((d) => (d ? "email" : null)),
    );

  const results = await Promise.all(checks);
  return results.find(Boolean) || null;
};
