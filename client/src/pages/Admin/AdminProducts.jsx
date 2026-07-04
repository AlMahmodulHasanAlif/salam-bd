// src/pages/Admin/AdminProducts.jsx
import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../../hooks/useAxios";
import { getProducts } from "../../api/productApi";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  Loader2,
  PlusCircle,
  MinusCircle,
  Search,
  Package,
  PackageX,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOW_STOCK = 5;

const EMPTY_FORM = {
  name: "",
  nameBn: "",
  category: "",
  subcategory: "",
  price: "",
  originalPrice: "",
  wholesalePrice: "",
  description: "",
  videoUrl: "",
  stock: "",
  images: [],
  variants: [],
  freeDelivery: false,
};

// Updated EMPTY_VARIANT: each variant has its own price and originalPrice
const EMPTY_VARIANT = { label: "", quantity: "", price: "", originalPrice: "" };

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProductThumb = ({ p, size = "w-10 h-10" }) => {
  const src = p.image || p.images?.[0]?.url;
  return src ? (
    <img
      src={src}
      alt=""
      className={`${size} object-cover rounded-lg bg-gray-100 border border-gray-100 shrink-0`}
    />
  ) : (
    <div
      className={`${size} rounded-lg bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-300 shrink-0`}
    >
      <Package size={18} />
    </div>
  );
};

const ImageUploader = ({ images, onAdd, onRemove, onMakeMain, uploading }) => {
  const inputRef = useRef(null);
  const handleFiles = (files) => {
    if (files.length) onAdd(Array.from(files));
  };
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Product Images
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer
          ${uploading ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-500 hover:bg-green-50"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm font-medium">
              Uploading to Cloudinary…
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImagePlus size={26} />
            <span className="text-sm">
              Drag & drop or{" "}
              <span className="text-green-600 font-semibold">browse</span>
            </span>
            <span className="text-xs">
              PNG, JPG, WEBP — up to 10 MB each, up to 10 images
            </span>
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {images.map((img, i) => (
            <div
              key={img.publicId || i}
              className="relative group aspect-square"
            >
              <img
                src={img.url}
                alt=""
                className={`w-full h-full object-cover rounded-lg border-2 transition
        ${i === 0 ? "border-green-500" : "border-gray-200"}`}
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  MAIN
                </span>
              )}
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => onMakeMain(i)}
                  className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded
          opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                >
                  Set Main
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-0.5
        opacity-0 group-hover:opacity-100 transition shadow"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Updated VariantRow: 5 columns — label, qty, sell price, original price, remove
const VariantRow = ({ v, idx, onChange, onRemove }) => (
  <div className="grid grid-cols-[1fr_70px_90px_90px_32px] gap-2 items-center">
    <input
      type="text"
      placeholder="Label (e.g. 500g, M, Red)"
      value={v.label}
      onChange={(e) => onChange(idx, "label", e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
    />
    <input
      type="number"
      placeholder="Qty"
      min="0"
      value={v.quantity}
      onChange={(e) => onChange(idx, "quantity", e.target.value)}
      className="border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500 text-center"
    />
    <input
      type="number"
      placeholder="Price ৳"
      min="0"
      value={v.price}
      onChange={(e) => onChange(idx, "price", e.target.value)}
      className="border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500 text-center"
    />
    <input
      type="number"
      placeholder="Orig ৳"
      min="0"
      value={v.originalPrice}
      onChange={(e) => onChange(idx, "originalPrice", e.target.value)}
      className="border border-gray-300 rounded-lg px-2 py-2 text-sm outline-none focus:border-green-500 text-center"
    />
    <button
      type="button"
      onClick={() => onRemove(idx)}
      className="text-red-400 hover:text-red-600 transition flex items-center justify-center"
    >
      <MinusCircle size={18} />
    </button>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AdminProducts = () => {
  const axiosSecure = useAxiosSecure();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // List controls
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const load = async () => {
    setLoading(true);
    try {
      const r = await getProducts();
      setProducts(r.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const field = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      nameBn: p.nameBn || "",
      category: p.category || "",
      subcategory: p.subcategory || "",
      price: p.price ?? "",
      originalPrice: p.originalPrice ?? "",
      wholesalePrice: p.wholesalePrice ?? "",
      description: p.description || "",
      videoUrl: p.videoUrl || "",
      stock: p.stock ?? "",
      images: Array.isArray(p.images)
        ? p.images
        : p.image
          ? [{ url: p.image, publicId: "" }]
          : [],
      variants: Array.isArray(p.variants)
        ? p.variants.map((v) => ({
            label: v.label || "",
            quantity: v.quantity ?? "",
            price:
              v.price !== undefined
                ? v.price
                : v.priceAdjustment != null
                  ? p.price + v.priceAdjustment
                  : "",
            originalPrice:
              v.originalPrice !== undefined
                ? v.originalPrice
                : v.priceAdjustment != null && p.originalPrice
                  ? p.originalPrice + v.priceAdjustment
                  : "",
          }))
        : [],
      freeDelivery: p.freeDelivery ?? false,
    });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleAddImages = async (files) => {
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      // Let axios/browser set `multipart/form-data` WITH the boundary from the
      // FormData object — hardcoding the header omits the boundary and multer
      // then parses zero files (400 "No files uploaded").
      const { data } = await axiosSecure.post("/upload/product-images", fd);
      setForm((f) => ({ ...f, images: [...f.images, ...data.images] }));
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (idx) => {
    const img = form.images[idx];
    if (img.publicId) {
      try {
        await axiosSecure.delete("/upload/product-image", {
          data: { publicId: img.publicId },
        });
      } catch {
        // ignore — orphaned Cloudinary image is non-critical
      }
    }
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleMakeMain = (idx) => {
    setForm((f) => {
      const imgs = [...f.images];
      const [chosen] = imgs.splice(idx, 1);
      return { ...f, images: [chosen, ...imgs] };
    });
  };

  // ── Variants ──────────────────────────────────────────────────────────────
  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, { ...EMPTY_VARIANT }] }));
  const changeVariant = (idx, key, val) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[idx] = { ...variants[idx], [key]: val };
      return { ...f, variants };
    });
  const removeVariant = (idx) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (form.images.length === 0)
      return toast.error("Please upload at least one product image");
    setSaving(true);
    try {
      const variants = form.variants
        .filter((v) => v.label.trim() !== "")
        .map((v) => ({
          label: v.label.trim(),
          quantity: Math.max(0, parseInt(v.quantity || 0, 10)),
          price: v.price !== "" ? parseFloat(v.price) : undefined,
          originalPrice:
            v.originalPrice !== "" ? parseFloat(v.originalPrice) : undefined,
        }));

      const computedStock =
        variants.length > 0
          ? variants.reduce((s, v) => s + v.quantity, 0)
          : form.stock !== ""
            ? parseInt(form.stock, 10)
            : 0;

      const data = {
        name: form.name || undefined,
        nameBn: form.nameBn || undefined,
        category: form.category || undefined,
        subcategory: form.subcategory || undefined,
        price: form.price !== "" ? +form.price : undefined,
        originalPrice:
          form.originalPrice !== "" ? +form.originalPrice : undefined,
        wholesalePrice:
          form.wholesalePrice !== "" ? +form.wholesalePrice : undefined,
        description: form.description || undefined,
        videoUrl: form.videoUrl?.trim() || undefined,
        stock: computedStock,
        image: form.images[0]?.url,
        images: form.images,
        variants,
        freeDelivery: form.freeDelivery,
      };

      if (editing) {
        await axiosSecure.put(`/products/${editing._id}`, data);
        toast.success("Product updated");
      } else {
        await axiosSecure.post("/products", data);
        toast.success("Product added");
      }
      closeModal();
      load();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Delete this product and all its reviews?")) return;
    try {
      await axiosSecure.delete(`/products/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ── Derived: stats, filtering, sorting ──────────────────────────────────────
  const stockOf = (p) => Number(p.stock ?? 0);
  const marginOf = (p) =>
    p.wholesalePrice && p.price
      ? (((p.price - p.wholesalePrice) / p.price) * 100).toFixed(0)
      : null;
  const stockBadge = (p) => {
    const s = stockOf(p);
    if (s <= 0) return { cls: "bg-red-100 text-red-600", text: "Out" };
    if (s <= LOW_STOCK)
      return { cls: "bg-amber-100 text-amber-700", text: `Low · ${s}` };
    return { cls: "bg-green-100 text-green-700", text: `${s} in stock` };
  };

  const categoryOptions = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  );

  const stats = {
    total: products.length,
    inStock: products.filter((p) => stockOf(p) > 0).length,
    lowStock: products.filter((p) => stockOf(p) > 0 && stockOf(p) <= LOW_STOCK)
      .length,
    outOfStock: products.filter((p) => stockOf(p) <= 0).length,
  };

  const term = search.trim().toLowerCase();
  const visible = products
    .filter((p) => {
      if (term) {
        const hay =
          `${p.name || ""} ${p.nameBn || ""} ${p.subcategory || ""} ${p.category || ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (categoryFilter !== "all" && p.category !== categoryFilter)
        return false;
      const s = stockOf(p);
      if (stockFilter === "in" && s <= 0) return false;
      if (stockFilter === "low" && !(s > 0 && s <= LOW_STOCK)) return false;
      if (stockFilter === "out" && s > 0) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "stock-low":
          return stockOf(a) - stockOf(b);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0; // newest — keep API order
      }
    });

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
    setSortBy("newest");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your catalog — pricing, stock, images and variants.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 active:scale-[.98] transition shadow-sm"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Total Products",
            value: stats.total,
            icon: Boxes,
            color: "text-gray-600",
            bg: "bg-gray-100",
          },
          {
            label: "In Stock",
            value: stats.inStock,
            icon: Package,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            label: "Low Stock",
            value: stats.lowStock,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Out of Stock",
            value: stats.outOfStock,
            icon: PackageX,
            color: "text-red-500",
            bg: "bg-red-100",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {card.label}
              </span>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}
              >
                <card.icon size={16} className={card.color} />
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4 flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or subcategory…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 bg-white cursor-pointer"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 bg-white cursor-pointer"
        >
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 bg-white cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="price-high">Price: High → Low</option>
          <option value="price-low">Price: Low → High</option>
          <option value="stock-low">Stock: Low → High</option>
        </select>
      </div>

      {/* Result count */}
      {!loading && products.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          Showing{" "}
          <span className="font-semibold text-gray-700">{visible.length}</span>{" "}
          of {products.length} products
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
            <Package className="text-green-600" size={24} />
          </div>
          <p className="font-semibold text-gray-800">No products yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Add your first product to get started.
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition"
          >
            <Plus size={15} /> Add Product
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-center">
          <Search className="text-gray-300 mb-3" size={28} />
          <p className="font-semibold text-gray-700">No matching products</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={clearFilters}
            className="text-sm text-green-700 font-medium hover:text-green-800"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-left text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Cost</th>
                    <th className="px-5 py-3 font-semibold">Margin</th>
                    <th className="px-5 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 font-semibold">Variants</th>
                    <th className="px-5 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.map((p) => {
                    const margin = marginOf(p);
                    const sb = stockBadge(p);
                    return (
                      <tr
                        key={p._id}
                        className="hover:bg-gray-50/60 transition"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <ProductThumb p={p} size="w-11 h-11" />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[220px]">
                                {p.name}
                              </p>
                              {p.subcategory && (
                                <p className="text-xs text-gray-400 truncate max-w-[220px]">
                                  {p.subcategory}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                            {p.category || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-gray-900">
                            ৳{Number(p.price || 0).toLocaleString()}
                          </div>
                          {p.originalPrice > p.price && (
                            <div className="text-xs text-gray-400 line-through">
                              ৳{Number(p.originalPrice).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs">
                          {p.wholesalePrice ? (
                            <span className="bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                              ৳{Number(p.wholesalePrice).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs">
                          {margin !== null ? (
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-full ${+margin >= 20 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}
                            >
                              {margin}%
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${sb.cls}`}
                          >
                            {sb.text}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {p.variants?.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[170px]">
                              {p.variants.slice(0, 3).map((v) => (
                                <span
                                  key={v.label}
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium border
                                  ${v.quantity > 0 ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-100 text-gray-400 border-gray-200 line-through"}`}
                                >
                                  {v.label} ({v.quantity > 0 ? v.quantity : 0})
                                </span>
                              ))}
                              {p.variants.length > 3 && (
                                <span className="text-[10px] text-gray-400 self-center">
                                  +{p.variants.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {visible.map((p) => {
              const margin = marginOf(p);
              const sb = stockBadge(p);
              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3"
                >
                  <div className="flex gap-3">
                    <ProductThumb p={p} size="w-16 h-16" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize truncate">
                            {p.category || "—"}
                            {p.subcategory ? ` · ${p.subcategory}` : ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium ${sb.cls}`}
                        >
                          {sb.text}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-900">
                            ৳{Number(p.price || 0).toLocaleString()}
                          </span>
                          {p.originalPrice > p.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ৳{Number(p.originalPrice).toLocaleString()}
                            </span>
                          )}
                          {margin !== null && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${+margin >= 20 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}
                            >
                              {margin}% margin
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {p.variants?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.variants.slice(0, 4).map((v) => (
                            <span
                              key={v.label}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium border
                              ${v.quantity > 0 ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-100 text-gray-400 border-gray-200 line-through"}`}
                            >
                              {v.label} ({v.quantity > 0 ? v.quantity : 0})
                            </span>
                          ))}
                          {p.variants.length > 4 && (
                            <span className="text-[10px] text-gray-400 self-center">
                              +{p.variants.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <ImageUploader
                images={form.images}
                onAdd={handleAddImages}
                onRemove={handleRemoveImage}
                onMakeMain={handleMakeMain} // ← add this
                uploading={uploading}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name (English)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={field("name")}
                    placeholder="Add name in English"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Name (Bengali)</label>
                  <input
                    type="text"
                    value={form.nameBn}
                    onChange={field("nameBn")}
                    placeholder="Add naam in Bangla"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <input
                    type="text"
                    list="category-options"
                    value={form.category}
                    onChange={field("category")}
                    placeholder="Type a category name"
                    className="input"
                  />
                  <datalist id="category-options">
                    {categoryOptions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  {categoryOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {categoryOptions.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() =>
                            setForm((f) => ({ ...f, category: c }))
                          }
                          className={`text-xs px-2 py-1 rounded-full border transition ${
                            form.category === c
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Subcategory</label>
                  <input
                    type="text"
                    value={form.subcategory}
                    onChange={field("subcategory")}
                    placeholder="Add subcategory"
                    className="input"
                  />
                </div>
              </div>

              {/* Price row — 4 cols when no variants, 3 when variants present */}
              <div
                className={`grid gap-3 ${form.variants.length === 0 ? "grid-cols-4" : "grid-cols-3"}`}
              >
                <div>
                  <label className="label">Sell Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={field("price")}
                    placeholder="0"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Original Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={field("originalPrice")}
                    placeholder="0"
                    className="input"
                  />
                </div>

                {/* ── Wholesale / Cost price — admin only ── */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    Wholesale / Cost (৳)
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      Admin only
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.wholesalePrice}
                    onChange={field("wholesalePrice")}
                    placeholder="Your cost price"
                    className="input border-amber-300 focus:border-amber-500 bg-amber-50/40"
                  />
                  {form.wholesalePrice &&
                    form.price &&
                    +form.wholesalePrice > 0 && (
                      <p className="text-xs mt-1 text-green-600 font-medium">
                        Margin: ৳
                        {(+form.price - +form.wholesalePrice).toFixed(2)} (
                        {(
                          ((+form.price - +form.wholesalePrice) / +form.price) *
                          100
                        ).toFixed(1)}
                        %)
                      </p>
                    )}
                </div>

                {form.variants.length === 0 && (
                  <div>
                    <label className="label">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={field("stock")}
                      placeholder="0"
                      className="input"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={field("description")}
                  rows={3}
                  placeholder="Product details…"
                  className="input resize-none"
                />
              </div>

              {/* Product Video */}
              <div>
                <label className="label">Product Video (YouTube link)</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={field("videoUrl")}
                  placeholder="e.g. https://www.youtube.com/watch?v=xxxxxxxxxxx"
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste a YouTube link — it will show in the product’s “Product
                  Video” tab.
                </p>
              </div>

              {/* Free Delivery toggle */}
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:border-green-300 transition">
                <div
                  onClick={() =>
                    setForm((f) => ({ ...f, freeDelivery: !f.freeDelivery }))
                  }
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.freeDelivery ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.freeDelivery ? "translate-x-5" : "translate-x-1"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    ডেলিভারি বিনামূল্যে (Free Delivery)
                  </p>
                  {form.freeDelivery && (
                    <p className="text-xs text-green-600 mt-0.5">
                      ডেলিভারি সম্পূর্ণ বিনামূল্যে বার্তা দেখাবে
                    </p>
                  )}
                </div>
              </label>

              {/* Variants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Variants
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Size, weight, colour, etc.
                      {form.variants.length > 0 && (
                        <span className="text-green-600 ml-1 font-medium">
                          Total stock ={" "}
                          {form.variants.reduce(
                            (s, v) => s + (parseInt(v.quantity) || 0),
                            0,
                          )}{" "}
                          units
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1.5 text-sm text-green-700 font-medium hover:text-green-800 transition"
                  >
                    <PlusCircle size={16} /> Add variant
                  </button>
                </div>
                {form.variants.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    {/* Updated header: 5 columns */}
                    <div className="grid grid-cols-[1fr_70px_90px_90px_32px] gap-2 px-1">
                      <span className="text-xs text-gray-400 font-medium">
                        Label
                      </span>
                      <span className="text-xs text-gray-400 font-medium text-center">
                        Qty
                      </span>
                      <span className="text-xs text-gray-400 font-medium text-center">
                        Price ৳
                      </span>
                      <span className="text-xs text-gray-400 font-medium text-center">
                        Orig ৳
                      </span>
                      <span />
                    </div>
                    {form.variants.map((v, idx) => (
                      <VariantRow
                        key={idx}
                        v={v}
                        idx={idx}
                        onChange={changeVariant}
                        onRemove={removeVariant}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-xl py-4 text-center text-xs text-gray-400">
                    No variants — single stock applies
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold
                    hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving…
                    </>
                  ) : editing ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .label  { display:block; font-size:.8125rem; font-weight:500; color:#374151; margin-bottom:.25rem; }
        .input  { width:100%; border:1px solid #d1d5db; border-radius:.625rem; padding:.5rem .75rem;
                  font-size:.875rem; outline:none; transition:border-color .15s; }
        .input:focus { border-color:#16a34a; }
      `}</style>
    </div>
  );
};

export default AdminProducts;
