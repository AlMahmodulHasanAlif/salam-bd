import { Router }  from "express";
import multer       from "multer";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import { uploadProductImages, deleteProductImage } from "../controllers/uploadController.js";

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

const router = Router();

// All upload routes are admin-only
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