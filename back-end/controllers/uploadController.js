import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";

// ─────────────────────────────────────────
// Cloudinary configured from .env:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// ─────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// Quick check so you get a clear error instead of a cryptic 500
const checkConfig = () => {
  const missing = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
    .filter((k) => !process.env[k]);
  if (missing.length)
    throw new Error(`Missing Cloudinary env vars: ${missing.join(", ")}`);
};

// ─────────────────────────────────────────
// POST /upload/product-images
// Accepts: multipart/form-data  field: "images"  (1–10 files)
// Returns: { images: [{ url, publicId }] }
// ─────────────────────────────────────────
export const uploadProductImages = asyncHandler(async (req, res) => {
  checkConfig();

  if (!req.files || req.files.length === 0)
    return res.status(400).send({ message: "No files uploaded" });

  try {
    const uploads = await Promise.all(
      req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder:        "salam-bd/products",
                resource_type: "image",
                transformation: [
                  { width: 1000, height: 1000, crop: "limit", quality: "auto:good" },
                  { fetch_format: "auto" },
                ],
              },
              (error, result) => {
                if (error) {
                  console.error("❌ Cloudinary upload error:", error);
                  return reject(error);
                }
                resolve({ url: result.secure_url, publicId: result.public_id });
              }
            );
            stream.end(file.buffer);
          })
      )
    );

    res.send({ images: uploads });
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    res.status(500).send({ message: err.message || "Upload failed" });
  }
});

// ─────────────────────────────────────────
// DELETE /upload/product-image
// Body: { publicId }
// ─────────────────────────────────────────
export const deleteProductImage = asyncHandler(async (req, res) => {
  checkConfig();

  const { publicId } = req.body;
  if (!publicId)
    return res.status(400).send({ message: "publicId is required" });

  const result = await cloudinary.uploader.destroy(publicId);
  res.send({ result });
});