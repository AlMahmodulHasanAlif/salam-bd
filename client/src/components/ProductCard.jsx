// src/components/ProductCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Star, X, ShoppingBag } from "lucide-react";
import useCart from "../hooks/useCart";
import { GTM } from '../utils/gtm';

// ── Added-to-cart Modal ───────────────────────────────────────────────────
const AddedToCartModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <ShoppingBag size={28} className="text-green-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Product added to cart!</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Buy More
          </button>
          <button
            onClick={() => { onClose(); navigate("/cart"); }}
            className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition"
          >
            <ShoppingCart size={15} />
            Go to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ProductCard ───────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const { _id, name, image, price, originalPrice, ratings, stock, variants, slug } = product;
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding]   = useState(false);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  // Products with variants need the detail page for variant selection
  const hasVariants = Array.isArray(variants) && variants.length > 0;

  const handleOrder = async (e) => {
    e.stopPropagation();
    // If product has variants, send user to detail page to pick one
    if (hasVariants) {
      navigate(`/product/${slug}`);
      return;
    }
    if (isAdding) return;
    setIsAdding(true);
      try {
      await addItem({
        ...product,
        variantLabel: null,
        selectedVariant: null,
      }, 1);

      GTM.addToCart({
        content_ids: [_id],
        content_name: name,
        content_type: "product",
        value: price,
        currency: "BDT",
      });

      setShowModal(true);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div
        onClick={() => navigate(`/product/${slug}`)}
        className="bg-white rounded-lg p-1 border border-gray-100
                   drop-shadow-[0_6px_12px_rgba(0,0,0,0.15)]
                   hover:-translate-y-0.5
                   transition-all duration-200
                   cursor-pointer overflow-hidden group w-full md:w-[230px]
                   flex flex-col"
      >
        {/* Image */}
        <div className="relative md:h-60 bg-gray-50 overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-40 md:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount && (
            <span className="absolute top-2 left-2 bg-green-800 text-white text-[12px] font-bold px-1.5 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {/* {hasVariants && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Options
            </span>
          )} */}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2 flex flex-col gap-1 flex-1">
          <h3 className="text-xs font-semibold text-gray-800 truncate">{name}</h3>
          <div className="h-4 flex items-center">
            {ratings > 0 && (
              <div className="flex items-center gap-0.5">
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] text-gray-500">{ratings}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-green-700 font-bold text-sm">৳{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-gray-400 text-xs line-through">৳{originalPrice}</span>
            )}
          </div>
        </div>

        {/* Bottom button */}
        <button
          onClick={handleOrder}
          disabled={stock === 0 || isAdding}
          className="w-full flex items-center justify-center gap-1.5
                     bg-green-700 hover:bg-green-800 active:scale-95
                     disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                     text-white text-xs font-semibold py-2 transition-all duration-150
                     flex-shrink-0"
        >
          <ShoppingCart size={13} />
          {stock === 0
            ? "Out of Stock"
            : isAdding
            ? "Adding..."
            : hasVariants
            ? "Select Options"  // ← clear CTA for variant products
            : "Add to Cart"}
        </button>
      </div>

      {/* {showModal && (
        <AddedToCartModal product={product} onClose={() => setShowModal(false)} />
      )} */}
    </>
  );
};

export default ProductCard;