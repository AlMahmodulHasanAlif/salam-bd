// src/pages/Blog/BlogPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Calendar, Tag, Eye, ArrowRight, Search, Loader2 } from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import axiosInstance from "../../hooks/axiosInstance";

const BlogPage = () => {
  const [blogs, setBlogs]           = useState([]);
  const [recent, setRecent]         = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const LIMIT = 9;

  // fetch categories + recent once
  useEffect(() => {
    axiosInstance.get("/blogs/categories").then((r) => setCategories(r.data));
    axiosInstance.get("/blogs/recent").then((r) => setRecent(r.data));
  }, []);

  // fetch blogs on filter/page change
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = { page, limit: LIMIT };
        if (activeCategory !== "All") params.category = activeCategory;
        const { data } = await axiosInstance.get("/blogs", { params });
        setBlogs(data.blogs);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [activeCategory, page]);

  const filtered = search.trim()
    ? blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.excerpt?.toLowerCase().includes(search.toLowerCase())
      )
    : blogs;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* ── Hero ── */}
      <div className="bg-primary-dark text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <h1 className="text-5xl font-bold tracking-tight mb-3 relative">Our Blog</h1>
        <p className="text-white/60 text-lg max-w-lg mx-auto relative">
          Insights, guides & stories from the world of Islamic living
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-10">

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">

          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-green-700 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-green-700" size={36} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">No posts found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} featured={i === 0 && page === 1 && activeCategory === "All" && !search} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    page === p
                      ? "bg-green-700 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-green-500"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">

          {/* Recent Posts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">
              Recent Posts
            </h3>
            <div className="space-y-4">
              {recent.map((b) => (
                <Link
                  key={b._id}
                  to={`/blog/${b.slug}`}
                  className="flex gap-3 group"
                >
                  {b.coverImage ? (
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-green-50 shrink-0 flex items-center justify-center">
                      <Tag size={16} className="text-green-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {b.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeCategory === cat
                      ? "bg-green-700 text-white font-medium"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  {cat}
                  <ArrowRight size={13} />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─── Blog Card ───────────────────────────────────────────────────────────────
const BlogCard = ({ blog, featured }) => (
  <Link
    to={`/blog/${blog.slug}`}
    className={`group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col ${
      featured ? "sm:col-span-2 xl:col-span-1" : ""
    }`}
  >
    <div className="relative overflow-hidden h-48">
      {blog.coverImage ? (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center">
          <Tag size={32} className="text-white/40" />
        </div>
      )}
      <span className="absolute top-3 left-3 bg-white/90 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
        {blog.category}
      </span>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h2 className="font-bold text-gray-800 text-base leading-snug mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
        {blog.title}
      </h2>
      <p className="text-gray-500 text-sm line-clamp-2 flex-1">{blog.excerpt}</p>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} />
          {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Eye size={12} /> {blog.views || 0}
        </div>
      </div>
    </div>
  </Link>
);

export default BlogPage;