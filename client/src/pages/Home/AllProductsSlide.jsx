// src/components/AllProductsSlide.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard";

const CATEGORIES = [
  // {
  //   key: "islamic-books",
  //   label: "Islamic Books",
  //   emoji: "",
  //   route: "/books",
  //   match: (cat) => cat?.toLowerCase().includes("book"), // ← "book" only
  // },
  {
    key: "wallframe",
    label: "Wall Frame",
    emoji: "",
    route: "/wallframe",
    match: (cat) => cat?.toLowerCase().includes("wall"),
  },
  // {
  //   key: "attar",
  //   label: "Attar / Perfume",
  //   emoji: "",
  //   route: "/attar",
  //   match: (cat) =>
  //     cat?.toLowerCase().includes("attar") ||
  //     cat?.toLowerCase().includes("perfume"),
  // },
  // {
  //   key: "kids",
  //   label: "Kids Item",
  //   emoji: "",
  //   route: "/kids",
  //   match: (cat) => cat?.toLowerCase().includes("kid"),
  // },
  // {
  //   key: "hajj",
  //   label: "Hajj Item",
  //   emoji: "",
  //   route: "/hajj-item",
  //   match: (cat) => cat?.toLowerCase().includes("hajj"),
  // },
  {
    key: "islamic-products",
    label: "Islamic Products",
    emoji: "",
    route: "/Islamic-Products",
    match: (cat) => cat?.toLowerCase() === "islamic-products", // ← exact match
  },
];

const CARD_W_DESKTOP = 210;

// ── Skeleton ──────────────────────────────────────────────────────────────
const SkeletonCard = ({ style, className }) => (
  <div
    className={`flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-white ${className ?? ""}`}
    style={style}
  >
    <div className="bg-gray-100 animate-pulse h-36 sm:h-44" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 animate-pulse rounded w-4/5" />
      <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
      <div className="h-7 bg-gray-100 animate-pulse rounded" />
    </div>
  </div>
);

// ── MOBILE slider: exactly 2 cards visible, snap per card ─────────────────
const MobileSlider = ({ products, loading }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.offsetWidth / 2 + 8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
                   w-7 h-7 bg-white rounded-full shadow border border-gray-200
                   flex items-center justify-center
                   hover:bg-green-50 hover:border-green-300 transition-all duration-200"
      >
        <ChevronLeft size={14} className="text-gray-500" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 mobile-snap-scroll mx-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        <style>{`.mobile-snap-scroll::-webkit-scrollbar { display: none; }`}</style>

        {loading ? (
          [0, 1].map((i) => (
            <SkeletonCard
              key={i}
              style={{
                width: "calc(50% - 8px)",
                flexShrink: 0,
                scrollSnapAlign: "start",
              }}
            />
          ))
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center w-full py-10 text-gray-300">
            <div className="text-center">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-xs">No products yet</p>
            </div>
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              style={{
                width: "calc(50% - 5px)",
                flexShrink: 0,
                scrollSnapAlign: "start",
              }}
            >
              <ProductCard product={p} />
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
                   w-7 h-7 bg-white rounded-full shadow border border-gray-200
                   flex items-center justify-center
                   hover:bg-green-50 hover:border-green-300 transition-all duration-200"
      >
        <ChevronRight size={14} className="text-gray-500" />
      </button>
    </div>
  );
};

// ── DESKTOP slider: free scroll, fixed card width ─────────────────────────
const DesktopSlider = ({ products, loading }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) =>
    scrollRef.current?.scrollBy({
      left: dir * (CARD_W_DESKTOP + 16),
      behavior: "smooth",
    });

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                   w-8 h-8 bg-white rounded-full shadow-md border border-gray-200
                   flex items-center justify-center
                   hover:bg-green-50 hover:border-green-300 transition-all duration-200"
      >
        <ChevronLeft size={16} className="text-gray-600" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-7 overflow-x-auto pb-1 desktop-scroll mx-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.desktop-scroll::-webkit-scrollbar { display: none; }`}</style>

        {loading ? (
          [...Array(5)].map((_, i) => (
            <SkeletonCard key={i} style={{ width: CARD_W_DESKTOP }} />
          ))
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center w-full py-12 text-gray-300">
            <div className="text-center">
              <p className="text-4xl mb-2">📦</p>
              <p className="text-sm">No products yet in this category</p>
            </div>
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              className="flex-shrink-0"
              style={{ width: CARD_W_DESKTOP }}
            >
              <ProductCard product={p} />
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                   w-8 h-8 bg-white rounded-full shadow-md border border-gray-200
                   flex items-center justify-center
                   hover:bg-green-50 hover:border-green-300 transition-all duration-200"
      >
        <ChevronRight size={16} className="text-gray-600" />
      </button>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const AllProductsSlide = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["all-products-slide"],
    queryFn: async () => {
      const res = await getProducts();
      const all = res.data || [];
      const map = {};
      CATEGORIES.forEach(({ key, match }) => {
        map[key] = all.filter((p) => match(p.category));
      });
      return map;
    },
  });

  const productMap = data || {};

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-5">
      {CATEGORIES.map(({ key, label, emoji, route }) => {
        const products = productMap[key] || [];
        return (
          <div
            key={key}
            className="bg-white rounded-sm border border-gray-100 shadow-sm p-4 sm:p-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 gap-5">
              <div className="flex items-center gap-2 pl-2 md:pl-7">
                {emoji && <span className="text-xl">{emoji}</span>}
                <div>
                  <h3 className="font-bold text-gray-700 text-sm sm:text-base leading-tight">
                    {label}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => navigate(route)}
                className="flex items-center gap-1 text-xs font-semibold text-green-700
                           hover:text-green-800 border border-green-200 hover:border-green-400
                           px-2.5 py-1.5 rounded-lg transition-all duration-200 group whitespace-nowrap"
              >
                সবগুলো দেখুন
                <ArrowRight
                  size={12}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>

            {/* Mobile: 2-cards-visible snap slider */}
            <div className="sm:hidden">
              <MobileSlider products={products} loading={isLoading} />
            </div>

            {/* Desktop: free horizontal slider */}
            <div className="hidden sm:block">
              <DesktopSlider products={products} loading={isLoading} />
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default AllProductsSlide;
