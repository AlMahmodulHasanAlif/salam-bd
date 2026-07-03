// src/pages/Admin/AdminBlog.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  PenLine, Trash2, Eye, EyeOff, Plus, Loader2,
  CheckCircle2, AlertCircle, X, Tag, Upload, ImageIcon,
} from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white text-sm font-medium ${type === "success" ? "bg-green-700" : "bg-red-500"}`}>
    {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    {message}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
  </div>
);

const EMPTY_FORM = { title: "", category: "", excerpt: "", content: "", coverImage: "", tags: "", published: true };

const AdminBlog = () => {
  const axiosSecure       = useAxiosSecure();
  const coverInputRef     = useRef();

  const [blogs, setBlogs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [toast, setToast]               = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [editId, setEditId]             = useState(null);
  const [showForm, setShowForm]         = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch blogs ──
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get("/blogs/admin/all");
      setBlogs(data);
    } catch {
      showToast("Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  // ── Cover image upload to Cloudinary ──
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", file);
      // Don't hardcode Content-Type — let axios derive it (with boundary) from
      // the FormData, otherwise multer parses zero files (400 "No files uploaded").
      const { data } = await axiosSecure.post("/upload/product-images", formData);
      setForm((f) => ({ ...f, coverImage: data.images[0].url }));
      showToast("Cover image uploaded");
    } catch {
      showToast("Cover image upload failed", "error");
    } finally {
      setCoverUploading(false);
      // reset so same file can be re-selected
      e.target.value = "";
    }
  };

  const removeCover = () => setForm((f) => ({ ...f, coverImage: "" }));

  // ── Open create / edit ──
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (blog) => {
    setForm({
      title:      blog.title,
      category:   blog.category,
      excerpt:    blog.excerpt || "",
      content:    blog.content,
      coverImage: blog.coverImage || "",
      tags:       (blog.tags || []).join(", "),
      published:  blog.published,
    });
    setEditId(blog._id);
    setShowForm(true);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
      showToast("Title, category and content are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (editId) {
        await axiosSecure.put(`/blogs/${editId}`, payload);
        showToast("Blog updated");
      } else {
        await axiosSecure.post("/blogs", payload);
        showToast("Blog created");
      }
      setShowForm(false);
      fetchBlogs();
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog post permanently?")) return;
    try {
      await axiosSecure.delete(`/blogs/${id}`);
      showToast("Blog deleted");
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch {
      showToast("Delete failed", "error");
    }
  };

  // ── Toggle publish ──
  const togglePublish = async (blog) => {
    await axiosSecure.put(`/blogs/${blog._id}`, { published: !blog.published });
    setBlogs((prev) =>
      prev.map((b) => b._id === blog._id ? { ...b, published: !b.published } : b)
    );
    showToast(blog.published ? "Post unpublished" : "Post published");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage blog posts.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* ── Blog Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-green-700" size={32} />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <PenLine size={36} className="mx-auto mb-3 opacity-40" />
            <p>No blog posts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {blog.coverImage ? (
                          <img src={blog.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-green-50 shrink-0 flex items-center justify-center">
                            <ImageIcon size={14} className="text-green-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800 line-clamp-1">{blog.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{blog.views || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${blog.published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {blog.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(blog)}
                          title={blog.published ? "Unpublish" : "Publish"}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                        >
                          {blog.published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => openEdit(blog)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-700 transition"
                        >
                          <PenLine size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">
                {editId ? "Edit Post" : "New Post"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* ── Cover Image Upload ── */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                  <ImageIcon size={11} /> Cover Image
                </label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                {form.coverImage ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 group">
                    <img
                      src={form.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2">
                      <button
                        onClick={() => coverInputRef.current.click()}
                        className="opacity-0 group-hover:opacity-100 transition bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow"
                      >
                        <Upload size={12} /> Replace
                      </button>
                      <button
                        onClick={removeCover}
                        className="opacity-0 group-hover:opacity-100 transition bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => coverInputRef.current.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
                  >
                    {coverUploading ? (
                      <Loader2 className="animate-spin text-green-700" size={24} />
                    ) : (
                      <>
                        <Upload size={22} className="text-green-700" />
                        <p className="text-sm text-gray-500">
                          Click to upload cover image
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP — uploaded to Cloudinary</p>
                      </>
                    )}
                  </div>
                )}
                {/* Show spinner overlay on top of preview while uploading */}
                {coverUploading && form.coverImage && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-green-700">
                    <Loader2 size={13} className="animate-spin" /> Uploading...
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Post title"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Islamic Tips"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Short description (auto-generated if left empty)"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Content * (HTML supported)</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write your blog content here... HTML tags are supported."
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                />
              </div>

              {/* Tags + Published */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <Tag size={11} /> Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="hajj, quran, kids"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.published ? "bg-green-600" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? "translate-x-5" : ""}`} />
                    </div>
                    <span className="text-sm text-gray-600">{form.published ? "Published" : "Draft"}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || coverUploading}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <PenLine size={15} />}
                {editId ? "Save Changes" : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminBlog;