// src/pages/Products/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { searchProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard";

const SearchResults = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    setLoading(true);
    searchProducts(q)
      .then((res) => setResults(res.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-green-700 pl-3">
        Results for: <span className="text-green-700">"{q}"</span>
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-56 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No products found for "{q}"</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{results.length} results</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
