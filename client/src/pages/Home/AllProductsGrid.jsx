// src/pages/Home/AllProductsGrid.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard";

const SkeletonCard = () => (
  <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
    <div className="bg-gray-100 animate-pulse h-40 sm:h-52" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 animate-pulse rounded w-4/5" />
      <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
      <div className="h-7 bg-gray-100 animate-pulse rounded" />
    </div>
  </div>
);

const AllProductsGrid = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["all-products-grid"],
    queryFn: async () => {
      const res = await getProducts();
      return res.data || [];
    },
  });

  const products = data || [];

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      {/* Heading */}
      <div className="mb-5 sm:mb-8 text-center">
        <h2 className="text-xl sm:text-3xl font-extrabold text-gray-800">
          All Products
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Browse our full collection
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {isLoading ? (
          [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
        ) : products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-300">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm">No products yet</p>
          </div>
        ) : (
          products.map((p) => <ProductCard key={p._id} product={p} />)
        )}
      </div>
    </section>
  );
};

export default AllProductsGrid;
