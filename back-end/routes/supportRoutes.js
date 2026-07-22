import { Router } from "express";
import multer from "multer";
import { verifyFBToken, verifyAdmin } from "../middlewares/auth.js";
import {
  uploadSupportMedia,
  createComplaint,
  getAllComplaints,
  getComplaintStats,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} from "../controllers/supportController.js";

// Memory storage — the buffer is streamed straight to Cloudinary.
// 20 MB covers the largest allowed file (video); the controller enforces the
// tighter 5 MB image limit on top of this.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (!ok) return cb(new Error("Only image or video files are allowed"), false);
    cb(null, true);
  },
});

const handleUpload = (req, res, next) =>
  upload.single("file")(req, res, (err) => {
    if (err) {
      const tooBig = err.code === "LIMIT_FILE_SIZE";
      return res
        .status(400)
        .json({ message: tooBig ? "ফাইল সর্বোচ্চ ২০MB হতে পারবে" : err.message });
    }
    next();
  });

const router = Router();

// ── Public ──
router.post("/upload", handleUpload, uploadSupportMedia);
router.post("/", createComplaint);

// ── Admin ──
router.get("/", verifyFBToken, verifyAdmin, getAllComplaints);
router.get("/stats", verifyFBToken, verifyAdmin, getComplaintStats);
router.get("/:id", verifyFBToken, verifyAdmin, getComplaintById);
router.patch("/:id/status", verifyFBToken, verifyAdmin, updateComplaintStatus);
router.delete("/:id", verifyFBToken, verifyAdmin, deleteComplaint);

export default router;
