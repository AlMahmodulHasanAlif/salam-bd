// src/pages/Cart/Cart.jsx
import React from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, Tag } from "lucide-react";
import useCart from "../../hooks/useCart";

const Cart = () => {
  const navigate = useNavigate();
  const { items, cartTotal, cartLoading, updateQty, removeItem } = useCart();

  if (cartLoading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );

  if (!items.length)
    return (
      <div className="text-center py-24">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-gray-500 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Add products to get started
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-700 text-white px-6 py-2.5 rounded-xl hover:bg-green-800 transition font-semibold"
        >
          Shop Now
        </button>
      </div>
    );

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateQty(itemId, newQty);
    } catch (err) {
      console.error("Qty update failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Shopping Cart{" "}
        <span className="text-gray-400 font-normal text-lg">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => {
            // Support both stored final price and legacy items without variant
            const displayPrice = item.price;
            const variantLabel =
              item.variantLabel ||
              item.selectedVariant?.label ||
              item.selectedVariant?.name ||
              item.selectedVariant?.size ||
              item.selectedVariant?.color ||
              null;

            return (
              <div
                key={item._id}
                className="flex gap-4 bg-white rounded-xl shadow-sm p-4 border border-gray-100"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onClick={() => navigate(`/product/${item.productId}`)}
                  className="w-20 h-20 object-cover rounded-xl cursor-pointer bg-gray-50 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                    {item.name}
                  </h3>

                  {/* Variant badge */}
                  {variantLabel && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-0.5 mb-1.5">
                      <Tag size={10} />
                      {variantLabel}
                    </span>
                  )}

                  <p className="text-green-700 font-bold">
                    ৳{Number(displayPrice).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item._id?.toString())}
                    className="text-red-400 hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQtyChange(item._id?.toString(), item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2 py-1.5 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm font-semibold min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item._id, item.quantity + 1)}
                      className="px-2 py-1.5 hover:bg-gray-100 transition"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-gray-700">
                    ৳{(Number(displayPrice) * item.quantity).toFixed(0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span>৳{cartTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-green-700 text-lg">
                  ৳{cartTotal.toFixed(0)}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-[#f28705] hover:bg-green-600 text-white py-3 rounded-xl font-semibold active:scale-[0.98] transition-all duration-200 animate-cta-shake"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;