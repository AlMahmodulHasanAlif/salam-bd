// src/components/AllProductsCategory.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard";

const CATEGORIES = [
  { key: "islamic-books", label: "Islamic Books", emoji: "📚", route: "/books",
    match: (cat) => cat?.toLowerCase().includes("islamic") || cat?.toLowerCase().includes("book") },
  { key: "wallframe", label: "Wall Frame", emoji: "🖼️", route: "/wallframe",
    match: (cat) => cat?.toLowerCase().includes("wall") },
  { key: "attar", label: "Attar / Perfume", emoji: "🌹", route: "/attar",
    match: (cat) => cat?.toLowerCase().includes("attar") || cat?.toLowerCase().includes("perfume") },
  { key: "kids", label: "Kids Item", emoji: "🧸", route: "/kids",
    match: (cat) => cat?.toLowerCase().includes("kid") },
  { key: "hajj", label: "Hajj Item", emoji: "🕌", route: "/hajj-item",
    match: (cat) => cat?.toLowerCase().includes("hajj") },
];

const CARD_W = 160; // px, uniform card width

const SkeletonCard = () => (
  <div className="flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-white"
       style={{ width: CARD_W }}>
    <div className="bg-gray-100 animate-pulse" style={{ height: CARD_W }} />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 animate-pulse rounded w-4/5" />
      <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
      <div className="h-7 bg-gray-100 animate-pulse rounded" />
    </div>
  </div>
);

const ProductSlider = ({ products, loading }) => {
  const scrollRef = useRef(null);
  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir * (CARD_W + 12), behavior: "smooth" });

  return (
    <div className="relative group/slider">
      <button onClick={() => scroll(-1)} aria-label="left"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
                   w-8 h-8 bg-white rounded-full shadow-md border border-gray-200
                   hidden sm:flex items-center justify-center
                   opacity-0 group-hover/slider:opacity-100
                   hover:bg-green-50 hover:border-green-300 transition-all duration-200">
        <ChevronLeft size={16} className="text-gray-600" />
      </button>

      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 cat-scroll"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <style>{`.cat-scroll::-webkit-scrollbar { display: none; }`}</style>

        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center w-full py-12 text-gray-300">
            <div className="text-center"><p className="text-4xl mb-2">📦</p>
              <p className="text-sm">No products yet</p></div>
          </div>
        ) : (
          products.map((p) => (
            <div key={p._id} className="flex-shrink-0" style={{ width: CARD_W }}>
              <ProductCard product={p} />
            </div>
          ))
        )}
      </div>

      <button onClick={() => scroll(1)} aria-label="right"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
                   w-8 h-8 bg-white rounded-full shadow-md border border-gray-200
                   hidden sm:flex items-center justify-center
                   opacity-0 group-hover/slider:opacity-100
                   hover:bg-green-50 hover:border-green-300 transition-all duration-200">
        <ChevronRight size={16} className="text-gray-600" />
      </button>
    </div>
  );
};

const AllProductsCategory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await getProducts();
        const all = res.data || [];
        const map = {};
        CATEGORIES.forEach(({ key, match }) => {
          map[key] = all.filter((p) => match(p.category));
        });
        setProductMap(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const active = CATEGORIES[activeTab];
  const products = productMap[active.key] || [];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      {/* Heading */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Shop by Category</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Browse our handpicked Islamic products</p>
        </div>
        <button onClick={() => navigate(active.route)}
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold
                     text-green-700 hover:text-green-800 group transition-all duration-200">
          View all {active.label}
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 tab-bar-scroll"
           style={{ scrollbarWidth: "none" }}>
        <style>{`.tab-bar-scroll::-webkit-scrollbar { display: none; }`}</style>
        {CATEGORIES.map(({ key, label, emoji }, idx) => {
          const isActive = idx === activeTab;
          const count = productMap[key]?.length ?? 0;
          return (
            <button key={key} onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5
                rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0
                transition-all duration-200 border
                ${isActive
                  ? "bg-green-700 text-white border-green-700 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700"
                }`}>
              <span className="text-sm leading-none">{emoji}</span>
              {label}
              {!loading && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${isActive ? "bg-white/25 text-white" : "bg-green-50 text-green-700"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{active.emoji}</span>
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight">{active.label}</h3>
              {!loading && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {products.length} product{products.length !== 1 ? "s" : ""} available
                </p>
              )}
            </div>
          </div>
          <button onClick={() => navigate(active.route)}
            className="flex items-center gap-1 text-xs font-semibold text-green-700
                       hover:text-green-800 border border-green-200 hover:border-green-400
                       px-2.5 py-1.5 rounded-lg transition-all duration-200 group whitespace-nowrap">
            View More
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <ProductSlider products={products} loading={loading} />
      </div>

      {/* Mobile view more */}
      <div className="mt-4 flex sm:hidden justify-center">
        <button onClick={() => navigate(active.route)}
          className="flex items-center gap-2 bg-green-700 text-white px-6 py-2.5
                     rounded-xl text-sm font-semibold hover:bg-green-800 transition">
          View all {active.label}
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};

export default AllProductsCategory;