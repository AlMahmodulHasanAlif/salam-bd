import { Router }  from "express";
import multer       from "multer";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import { uploadProductImages, deleteProductImage, uploadAvatar } from "../controllers/uploadController.js";

// Memory storage — files go straight to Cloudinary, never touch disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },   // 10 MB per file
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only image files are allowed"), false);
    cb(null, true);
  },
});

// Avatars are compressed client-side to ≤ 50 KB; enforce that as a hard cap
// server-side too, so the limit holds even if the upload bypasses the browser.
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 }, // 50 KB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only image files are allowed"), false);
    cb(null, true);
  },
});

// Translate multer's raw errors (esp. the 50 KB overflow) into a clean 400.
const handleAvatarUpload = (req, res, next) =>
  avatarUpload.single("image")(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Profile image must be 50 KB or smaller."
          : err.message || "Upload failed";
      return res.status(400).send({ message });
    }
    next();
  });

const router = Router();

// Profile avatar — any signed-in user (NOT admin-only), so it must be declared
// before the admin gate below.
router.post("/avatar", verifyFBToken, handleAvatarUpload, uploadAvatar);

// All remaining upload routes are admin-only
router.use(verifyFBToken, verifyAdmin);

// POST /upload/product-images  — up to 10 images at once
router.post(
  "/product-images",
  upload.array("images", 10),
  uploadProductImages
);

// DELETE /upload/product-image  — remove a single image by publicId
router.delete("/product-image", deleteProductImage);

export default router;