// server/routes/galleryRoutes.js
import { Router } from "express";
import multer from "multer";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import {
  getGalleryImages,
  uploadGalleryImages,
  deleteGalleryImage,
} from "../controllers/galleryController.js";

// Same multer config as uploadRoutes.js
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only image files are allowed"), false);
    cb(null, true);
  },
});

const router = Router();

// All gallery routes are admin-only except GET
router.get("/", getGalleryImages);

router.post(
  "/upload",
  verifyFBToken,
  verifyAdmin,
  upload.array("images", 10),
  uploadGalleryImages,
);
router.delete("/*publicId", verifyFBToken, verifyAdmin, deleteGalleryImage);

export default router;