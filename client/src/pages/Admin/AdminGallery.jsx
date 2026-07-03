// src/pages/Admin/AdminGallery.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Trash2,
  Loader2,
  ImagePlus,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { auth } from "../../firebase/firebase.init";

// Firebase ID token for admin-protected gallery routes
const authHeader = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white text-sm font-medium ${
      type === "success" ? "bg-green-700" : "bg-red-500"
    }`}
  >
    {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    {message}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
      <X size={14} />
    </button>
  </div>
);

// ─── AdminGallery ─────────────────────────────────────────────────────────────
const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ──
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImages(data); // [{ publicId, secure_url, tags, context, created_at }]
    } catch {
      showToast("Failed to load gallery images", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  // ── File selection ──
  const handleFiles = (selected) => {
    const arr = Array.from(selected).filter((f) => f.type.startsWith("image/"));
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const removePreview = (i) => {
    setFiles((prev) => prev.filter((_, j) => j !== i));
    setPreviews((prev) => prev.filter((_, j) => j !== i));
  };

  // ── Upload ──
  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      if (caption.trim()) formData.append("caption", caption.trim());
      if (tags.trim())    formData.append("tags", tags.trim());

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery/upload`, {
        method: "POST",
        headers: await authHeader(),
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      showToast(`${files.length} image(s) uploaded successfully`);
      setFiles([]);
      setPreviews([]);
      setCaption("");
      setTags("");
      fetchImages();
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (publicId) => {
    if (!window.confirm("Delete this image permanently?")) return;
    setDeletingId(publicId);
    try {
      // encode so slashes in publicId don't break the URL
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery/${encodeURIComponent(publicId)}`, {
        method: "DELETE",
        headers: await authHeader(),
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Image deleted");
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
    } catch {
      showToast("Could not delete image", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gallery Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload and manage your Cloudinary gallery images.
        </p>
      </div>

      {/* ── Upload Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
          <ImagePlus size={18} className="text-green-700" /> Upload New Images
        </h2>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 ${
            dragOver
              ? "border-green-600 bg-green-50"
              : "border-gray-300 hover:border-green-500 hover:bg-green-50/50"
          }`}
        >
          <Upload className="mx-auto mb-2 text-green-700" size={28} />
          <p className="text-sm font-medium text-gray-600">
            Drag & drop images here, or{" "}
            <span className="text-green-700 underline">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 10 MB each</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 hover:bg-red-500 transition"
                >
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Beautiful Quran collection"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
              <Tag size={11} /> Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. books, kids, hajj"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm"
        >
          {uploading ? (
            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
          ) : (
            <><Upload size={16} /> Upload {files.length > 0 ? `(${files.length})` : ""}</>
          )}
        </button>
      </div>

      {/* ── Gallery Grid ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-5">
          Current Images{" "}
          <span className="text-gray-400 font-normal text-sm">({images.length})</span>
        </h2>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-green-700" size={32} />
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ImagePlus size={36} className="mx-auto mb-3 opacity-40" />
            <p>No images uploaded yet.</p>
          </div>
        )}

        {!loading && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.publicId}
                className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square"
              >
                <img
                  src={img.secure_url}
                  alt={img.context?.caption || img.publicId}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(img.publicId)}
                    disabled={deletingId === img.publicId}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm disabled:bg-gray-400"
                    title="Delete"
                  >
                    {deletingId === img.publicId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {/* Caption */}
                {img.context?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-[10px] font-medium line-clamp-1">
                      {img.context.caption}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {img.tags?.length > 0 && (
                  <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {img.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="bg-green-700/90 text-white text-[9px] px-1.5 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default AdminGallery;