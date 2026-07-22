import asyncHandler from "express-async-handler";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { sendTelegramMessage } from "../utils/telegram.js";

const COLLECTION = "competitionregistrations";

// Application review lifecycle for a merit-competition entry.
const VALID_STATUSES = ["pending", "verified", "shortlisted", "winner", "rejected"];

const VALID_PHONE = /^01[3-9]\d{8}$/;

// A short, human-friendly registration code derived from the Mongo _id so it's
// stable and collision-free without a separate counter collection.
const makeRegNo = (id) => `SCB-${id.toString().slice(-6).toUpperCase()}`;

// Cloudinary is already used elsewhere (product uploads); reuse the same config.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "salam-bd/competition",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 1200, crop: "limit", quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });

// ─────────────────────────────────────────────────────────────────────────
// POST /api/competition/upload   (public)
// Field: "image" (single). Used by the registration form for the student
// photo and signature, so documents store lightweight URLs instead of base64.
// ─────────────────────────────────────────────────────────────────────────
export const uploadCompetitionImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image uploaded");
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

  const result = await uploadBufferToCloudinary(req.file.buffer);
  res.status(201).json({ success: true, ...result });
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/competition   (public)
// Creates a merit-competition registration.
// ─────────────────────────────────────────────────────────────────────────
export const createRegistration = asyncHandler(async (req, res) => {
  const { student, address, guardian, customer, signature, agreed } = req.body;

  // ── Server-side validation (never trust the client) ──
  const errors = [];
  if (!student?.name?.trim()) errors.push("student.name");
  if (!student?.dob?.trim()) errors.push("student.dob");
  if (!student?.grade?.trim()) errors.push("student.grade");
  if (!student?.institution?.trim()) errors.push("student.institution");
  if (!address?.village?.trim()) errors.push("address.village");
  if (!address?.thana?.trim()) errors.push("address.thana");
  if (!address?.district?.trim()) errors.push("address.district");
  if (!guardian?.name?.trim()) errors.push("guardian.name");
  if (!VALID_PHONE.test(guardian?.mobile || "")) errors.push("guardian.mobile");
  if (agreed !== true) errors.push("agreed");

  if (errors.length) {
    res.status(400);
    throw new Error(`Missing or invalid fields: ${errors.join(", ")}`);
  }

  const doc = {
    student: {
      name: student.name.trim(),
      dob: student.dob.trim(),
      grade: student.grade.trim(),
      institution: student.institution.trim(),
      photo: student.photo || null,
    },
    address: {
      village: address.village.trim(),
      thana: address.thana.trim(),
      district: address.district.trim(),
    },
    guardian: {
      name: guardian.name.trim(),
      mobile: guardian.mobile.trim(),
    },
    customer: {
      code: customer?.code?.trim() || null,
      referral: customer?.referral?.trim() || null,
    },
    signature: signature || null,
    agreed: true,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne(doc);
  const regNo = makeRegNo(result.insertedId);

  // Persist the derived reg number so the admin list can show/search it.
  await db
    .collection(COLLECTION)
    .updateOne({ _id: result.insertedId }, { $set: { regNo } });

  // Fire-and-forget Telegram alert (never blocks the response).
  sendTelegramMessage(
    [
      "🧠 <b>নতুন মেধা যাচাই রেজিস্ট্রেশন</b>",
      `<b>Reg No:</b> ${regNo}`,
      `<b>শিক্ষার্থী:</b> ${doc.student.name}`,
      `<b>শ্রেণি:</b> ${doc.student.grade}`,
      `<b>প্রতিষ্ঠান:</b> ${doc.student.institution}`,
      `<b>জেলা:</b> ${doc.address.district}, ${doc.address.thana}`,
      `<b>অভিভাবক:</b> ${doc.guardian.name} — ${doc.guardian.mobile}`,
    ].join("\n"),
  ).catch(() => {});

  res.status(201).json({ success: true, id: result.insertedId, regNo });
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/competition   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const getAllRegistrations = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { "student.name": rx },
      { "guardian.mobile": rx },
      { "guardian.name": rx },
      { regNo: rx },
      { "address.district": rx },
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
    registrations: items,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/competition/stats   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const getRegistrationStats = asyncHandler(async (_req, res) => {
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
// GET /api/competition/:id   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const getRegistrationById = asyncHandler(async (req, res) => {
  const db = getDB();
  const reg = await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!reg) {
    res.status(404);
    throw new Error("Registration not found");
  }
  res.json({ success: true, registration: reg });
});

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/competition/:id/status   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const updateRegistrationStatus = asyncHandler(async (req, res) => {
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
    throw new Error("Registration not found");
  }
  res.json({ success: true, registration: result });
});

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/competition/:id   (admin)
// ─────────────────────────────────────────────────────────────────────────
export const deleteRegistration = asyncHandler(async (req, res) => {
  const db = getDB();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error("Registration not found");
  }
  res.json({ success: true, message: "Registration deleted" });
});
