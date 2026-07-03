// src/pages/Orders/Orders.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserOrders } from "../../api/orderApi";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxios";
import { Package, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";

const STATUS = {
  Pending:    { color: "bg-yellow-100 text-yellow-700", icon: <Clock size={13} /> },
  Processing: { color: "bg-blue-100 text-blue-700",    icon: <Package size={13} /> },
  Shipped:    { color: "bg-purple-100 text-purple-700", icon: <Truck size={13} /> },
  Delivered:  { color: "bg-green-100 text-green-700",  icon: <CheckCircle size={13} /> },
};

const OrderCard = ({ order }) => {
  const s = STATUS[order.status] || STATUS.Pending;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
          <p className="font-mono text-sm text-gray-700 font-semibold">
            #{(order._id || "").slice(-8).toUpperCase()}
          </p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${s.color}`}>
          {s.icon} {order.status}
        </span>
      </div>

      {/* Item thumbnails + names */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {order.items?.map((item, i) => (
          <div key={i} className="shrink-0 text-center">
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 object-cover rounded-xl bg-gray-50"
            />
            <p className="text-[10px] text-gray-400 mt-1 w-14 truncate">{item.name}</p>
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between text-sm border-t border-gray-50 pt-3">
        <div>
          <p className="text-gray-500 text-xs font-medium">
            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {order.shippingInfo?.phone} · {order.shippingInfo?.address}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-BD") : ""}
          </p>
        </div>
        <p className="font-bold text-green-700 text-base">৳{order.totalPrice}</p>
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate            = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const axiosSecure         = useAxiosSecure();

  const [orders, setOrders]           = useState([]);
  const [guestOrders, setGuestOrders] = useState([]);
  const [loading, setLoading]         = useState(false);

  // Load guest orders always
  useEffect(() => {
    setGuestOrders(JSON.parse(localStorage.getItem("guestOrders") || "[]"));
  }, []);

  // Load user orders only after Firebase auth is resolved
  useEffect(() => {
    // Wait for Firebase to finish checking auth state
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserOrders(axiosSecure, user.email)
      .then((res) => setOrders(res.data || []))
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));

  // axiosSecure intentionally omitted — it's a stable axios instance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading]);

  const hasOrders = orders.length > 0 || guestOrders.length > 0;
  const isLoading = authLoading || loading;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !hasOrders ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No orders yet</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-green-700 text-white px-6 py-2.5 rounded-xl hover:bg-green-800 transition font-semibold"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => <OrderCard key={o._id} order={o} />)}

          {guestOrders.length > 0 && (
            <>
              {orders.length > 0 && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400">Guest Orders</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              )}
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    These are your guest orders.{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="underline font-semibold"
                    >
                      Sign in
                    </button>{" "}
                    to track orders permanently.
                  </p>
                </div>
              )}
              {guestOrders.map((o, i) => <OrderCard key={i} order={o} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;