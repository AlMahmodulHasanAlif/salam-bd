import asyncHandler from "express-async-handler";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { sendTelegramMessage } from "../utils/telegram.js";

const COLLECTION = "supportcomplaints";

// Complaint review lifecycle for a 100-day guarantee ticket.
const VALID_STATUSES = ["pending", "processing", "resolved", "rejected"];

const VALID_PHONE = /^01[3-9]\d{8}$/;

// Allowed complaint categories (id must match the client's COMPLAINT_TYPES).
const VALID_TYPES = [
  "speaker",
  "charging",
  "sound",
  "battery",
  "coding",
  "other",
];

const IMAGE_MAX = 5 * 1024 * 1024; // 5 MB
const VIDEO_MAX = 20 * 1024 * 1024; // 20 MB

const makeTicketNo = (id) => `GS-${id.toString().slice(-6).toUpperCase()}`;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadBufferToCloudinary = (buffer, resourceType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "salam-bd/support", resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type,
        });
      },
    );
    stream.end(buffer);
  });

// ─────────────────────────────────────────────────────────────────────────
// POST /api/support/upload   (public)
// Field: "file" (single). Accepts an image (≤5 MB) or MP4 video (≤20 MB).
// ─────────────────────────────────────────────────────────────────────────
export const uploadSupportMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  const missing = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((k) => !process.env[k]);
  if (missing.length) {
    res.status(500);
    throw new Error(`Missing Cloudinary env vars: ${missing.join(", ")}`);
  }

  const isImage = req.file.mimetype.startsWith("image/");
  const isVideo = req.file.mimetype.startsWith("video/");
  if (!isImage && !isVideo) {
    res.status(400);
    throw new Error("Only image or video files are allowed");
  }
  if (isImage && req.file.size > IMAGE_MAX) {
    res.status(400);
    throw new Error("ছবি সর্বোচ্চ ৫MB হতে পারবে");
  }
  if (isVideo && req.file.size > VIDEO_MAX) {
    res.status(400);
    throw new Error("ভিডিও সর্বোচ্চ ২০MB হতে পারবে");
  }

  const result = await uploadBufferToCloudinary(
    req.file.buffer,
    isVideo ? "video" : "image",
  );
  res.status(201).json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/support   (public)
// ─────────────────────────────────────────────────────────────────────────
export const createComplaint = asyncHandler(async (req, res) => {
  const { customer, complaint, agreed } = req.body;

  const errors = [];
  if (!customer?.name?.trim()) errors.push("customer.name");
  if (!VALID_PHONE.test(customer?.mobile || "")) errors.push("customer.mobile");
  if (!VALID_TYPES.includes(complaint?.type)) errors.push("complaint.type");
  if (!complaint?.details?.trim()) errors.push("complaint.details");
  if (agreed !== true) errors.push("agreed");

  if (errors.length) {
    res.status(400);
    throw new Error(`Missing or invalid fields: ${errors.join(", ")}`);
  }

  const doc = {
    customer: {
      name: customer.name.trim(),
      mobile: customer.mobile.trim(),
      orderId: customer.orderId?.trim() || null,
      purchaseDate: customer.purchaseDate?.trim() || null,
    },
    complaint: {
      type: complaint.type,
      typeLabel: complaint.typeLabel?.trim() || complaint.type,
      details: complaint.details.trim().slice(0, 2000),
      image: complaint.image || null,
      video: complaint.video || null,
    },
    agreed: true,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne(doc);
  const ticketNo = makeTicketNo(result.insertedId);
  await db
    .collection(COLLECTION)
    .updateOne({ _id: result.insertedId }, { $set: { ticketNo } });

  sendTelegramMessage(
    [
      "🛠️ <b>নতুন গ্যারান্টি অভিযোগ</b>",
      `<b>Ticket:</b> ${ticketNo}`,
      `<b>গ্রাহক:</b> ${doc.customer.name} — ${doc.customer.mobile}`,
      `<b>অর্ডার আইডি:</b> ${doc.customer.orderId || "—"}`,
      `<b>ধরন:</b> ${doc.complaint.typeLabel}`,
      `<b>বিস্তারিত:</b> ${doc.complaint.details}`,
    ].join("\n"),
  ).catch(() => {});

  res.status(201).json({ success: true, id: result.insertedId, ticketNo });
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/support   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, type, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter["complaint.type"] = type;
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { "customer.name": rx },
      { "customer.mobile": rx },
      { "customer.orderId": rx },
      { ticketNo: rx },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const db = getDB();
  const [items, total] = await Promise.all([
    db
      .collection(COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray(),
    db.collection(COLLECTION).countDocuments(filter),
  ]);

  res.json({
    success: true,
    complaints: items,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/support/stats   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const getComplaintStats = asyncHandler(async (_req, res) => {
  const db = getDB();
  const rows = await db
    .collection(COLLECTION)
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  const byStatus = Object.fromEntries(VALID_STATUSES.map((s) => [s, 0]));
  let total = 0;
  for (const r of rows) {
    if (r._id in byStatus) byStatus[r._id] = r.count;
    total += r.count;
  }
  res.json({ success: true, total, byStatus });
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/support/:id   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const getComplaintById = asyncHandler(async (req, res) => {
  const db = getDB();
  const complaint = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }
  res.json({ success: true, complaint });
});

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/support/:id/status   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const updateComplaintStatus = asyncHandler(async (req, res) => {
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
    throw new Error("Complaint not found");
  }
  res.json({ success: true, complaint: result });
});

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/support/:id   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const deleteComplaint = asyncHandler(async (req, res) => {
  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("Complaint not found");
  }
  res.json({ success: true, message: "Complaint deleted" });
});
