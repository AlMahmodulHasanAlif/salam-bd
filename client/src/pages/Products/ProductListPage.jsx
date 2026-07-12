// src/pages/Products/ProductListPage.jsx
import React, { useEffect, useState } from "react";
import { getProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard";
import { SlidersHorizontal } from "lucide-react";

const ProductListPage = ({ category, subcategory, title, emoji }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("");

  const load = async (sortVal = sort) => {
    setLoading(true);
    try {
      const params = { category };
      if (subcategory) params.subcategory = subcategory;
      if (sortVal) params.sort = sortVal;
      const res = await getProducts(params);
      setProducts(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategory]);

  const handleSort = (e) => {
    setSort(e.target.value);
    load(e.target.value);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {emoji && <span className="text-xl sm:text-2xl flex-shrink-0">{emoji}</span>}
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 border-l-4 border-green-700 pl-3 line-clamp-1">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal size={15} className="text-gray-400 hidden sm:block" />
          <select value={sort} onChange={handleSort}
            className="border border-gray-300 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2
                       text-xs sm:text-sm outline-none focus:border-green-600
                       text-gray-700 bg-white cursor-pointer">
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
              <div className="bg-gray-100 animate-pulse" style={{ aspectRatio: "1/1" }} />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 animate-pulse rounded w-4/5" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
                <div className="h-7 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 sm:py-24">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400 font-medium text-sm sm:text-base">
            No products found in this category yet.
          </p>
        </div>
      ) : (
        <>
          {/* <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p> */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListPage;