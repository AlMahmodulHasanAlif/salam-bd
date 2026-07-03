// src/pages/Cart/OrderSuccess.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { CheckCircle, MapPin, Phone, Package, ShoppingBag, Calendar } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

  // If someone lands here without order state, redirect home
  useEffect(() => {
    if (!order) {
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <div>
          <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-400 text-sm">Redirecting you to home...</p>
        </div>
      </div>
    );
  }

  const {
    orderId,
    items = [],
    totalPrice,
    shippingInfo = {},
    placedAt,
  } = order;

  // Receipt breakdown: items subtotal + real delivery charge = grand total.
  const itemsSubtotal = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0,
  );
  const shippingCharge = Number(shippingInfo.shippingCharge) || 0;
  const grandTotal =
    totalPrice != null ? Number(totalPrice) : itemsSubtotal + shippingCharge;

  const formattedDate = placedAt
    ? new Date(placedAt).toLocaleString("en-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
            Order Placed! 🎉
          </h1>
          <p className="text-gray-500 text-sm">
            Thank you! We'll process your order shortly.
          </p>
          {orderId && (
            <p className="mt-2 text-xs text-gray-400">
              Order ID:{" "}
              <span className="font-mono text-gray-600 font-semibold">
                #{typeof orderId === "string" ? orderId.slice(-8).toUpperCase() : orderId}
              </span>
            </p>
          )}
          {formattedDate && (
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
              <Calendar size={11} />
              {formattedDate}
            </p>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">

          {/* Shipping Info */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-green-600" />
              Delivery Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <Phone size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <span>{shippingInfo.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <span>
                  {shippingInfo.address}
                  {shippingInfo.thana && `, ${shippingInfo.thana}`}
                  {shippingInfo.district && `, ${shippingInfo.district}`}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package size={16} className="text-green-600" />
              Items Ordered ({items.length})
            </h2>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="flex items-center gap-3 text-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-xl bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      ৳{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-green-700 shrink-0">
                    ৳{(item.price * item.quantity).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="p-5 bg-gray-50">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{itemsSubtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {shippingCharge === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="font-medium text-gray-700">
                    ৳{shippingCharge.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-medium text-gray-700">Cash on Delivery</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-base">
                <span>Total Paid</span>
                <span className="text-green-700 text-lg">
                  ৳{grandTotal.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Delivery Note */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mb-6 flex items-start gap-2">
          <ShoppingBag size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Estimated Delivery:</strong> 3–5 business days. Our team
            will contact you on{" "}
            <strong>{shippingInfo.phone}</strong> before delivery.
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 bg-green-700 text-white py-3 rounded-xl hover:bg-green-800 transition font-semibold text-sm"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition font-semibold text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;