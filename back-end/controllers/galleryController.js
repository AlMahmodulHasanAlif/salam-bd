// server/controllers/galleryController.js
import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ─────────────────────────────────────────
// GET /api/gallery
// Returns all images from salam-bd/gallery folder
// ─────────────────────────────────────────
export const getGalleryImages = asyncHandler(async (req, res) => {
  const result = await cloudinary.api.resources({
    type:        "upload",
    prefix:      "salam-bd/gallery/",
    max_results: 100,
    context:     true,
    tags:        true,
  });

  const images = result.resources.map((r) => ({
    publicId:   r.public_id,
    secure_url: r.secure_url,
    tags:       r.tags || [],
    context:    r.context?.custom || {},
    created_at: r.created_at,
  }));

  res.send(images);
});

// ─────────────────────────────────────────
// POST /api/gallery/upload
// Accepts: multipart/form-data  field: "images"  (1–10 files)
// Body fields: caption (optional), tags (optional, comma-separated)
// ─────────────────────────────────────────
export const uploadGalleryImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).send({ message: "No files uploaded" });

  const { caption, tags } = req.body;
  const tagArray = tags
    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const uploads = await Promise.all(
    req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder:        "salam-bd/gallery",
              resource_type: "image",
              context:       caption ? `caption=${caption}` : undefined,
              tags:          tagArray.length ? tagArray : undefined,
              transformation: [
                { width: 1200, height: 1200, crop: "limit", quality: "auto:good" },
                { fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                console.error("❌ Cloudinary gallery upload error:", error);
                return reject(error);
              }
              resolve({
                publicId:   result.public_id,
                secure_url: result.secure_url,
                tags:       result.tags || [],
                context:    { caption: caption || "" },
              });
            }
          );
          stream.end(file.buffer);
        })
    )
  );

  res.status(201).send({ uploaded: uploads.length, images: uploads });
});

// ─────────────────────────────────────────
// DELETE /api/gallery/:publicId
// Param: publicId (URL-encoded, e.g. salam-bd%2Fgallery%2Fxyz)
// ─────────────────────────────────────────
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const publicId = req.params[0] || req.params.publicId;
  if (!publicId)
    return res.status(400).send({ message: "publicId is required" });

  const result = await cloudinary.uploader.destroy(publicId);
  res.send({ result });
});