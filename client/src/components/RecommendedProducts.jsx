// src/components/RecommendedProducts.jsx
import React, { useEffect, useState } from "react";
import { getRecommendations } from "../api/productApi";
import ProductCard from "./ProductCard";

const RecommendedProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!productId) return;

    getRecommendations(productId)
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]));
  }, [productId]);

  if (!products.length) return null;

  return (
    <div className="mt-12 ">
      <h2 className="text-[2rem] font-bold text-gray-800 mb-5 border-l-4 border-green-700 pl-3 ">
        Related Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-3 ">
        {products
          .filter((p) => p && p._id) // 🔥 prevents undefined crash
          .map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;