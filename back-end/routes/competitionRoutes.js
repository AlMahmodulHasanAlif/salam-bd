import { Router } from "express";
import multer from "multer";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import {
  uploadCompetitionImage,
  createRegistration,
  getAllRegistrations,
  getRegistrationStats,
  getRegistrationById,
  updateRegistrationStatus,
  deleteRegistration,
} from "../controllers/competitionController.js";

// Memory storage — the buffer is streamed straight to Cloudinary.
const MAX_IMAGE_BYTES = 30 * 1024; // 30 KB (photo/signature)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/"))
      return cb(new Error("Only image files are allowed"), false);
    cb(null, true);
  },
});

// Wrap multer so an oversized file returns a clean 400 with a friendly message
// instead of falling through to the generic 500 error handler.
const handleImageUpload = (req, res, next) =>
  upload.single("image")(req, res, (err) => {
    if (err) {
      const tooBig = err.code === "LIMIT_FILE_SIZE";
      return res
        .status(400)
        .json({ message: tooBig ? "ছবির সাইজ সর্বোচ্চ ৩০KB হতে পারবে" : err.message });
    }
    next();
  });

const router = Router();

// ── Public ──
router.post("/upload", handleImageUpload, uploadCompetitionImage);
router.post("/", createRegistration);

// ── Admin ──
router.get("/", verifyFBToken, verifyAdmin, getAllRegistrations);
router.get("/stats", verifyFBToken, verifyAdmin, getRegistrationStats);
router.get("/:id", verifyFBToken, verifyAdmin, getRegistrationById);
router.patch("/:id/status", verifyFBToken, verifyAdmin, updateRegistrationStatus);
router.delete("/:id", verifyFBToken, verifyAdmin, deleteRegistration);

export default router;
