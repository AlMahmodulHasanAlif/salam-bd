// src/pages/Dashboard/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserOrders } from "../../api/orderApi";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxios";
import {
  User,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Package,
  ArrowRight,
  LogOut,
} from "lucide-react";

const STATUS_STYLE = {
  Pending:    { color: "bg-yellow-100 text-yellow-700", icon: <Clock size={13} /> },
  Processing: { color: "bg-blue-100 text-blue-700",    icon: <Package size={13} /> },
  Shipped:    { color: "bg-purple-100 text-purple-700", icon: <Truck size={13} /> },
  Delivered:  { color: "bg-green-100 text-green-700",  icon: <CheckCircle size={13} /> },
};

const UserDashboard = () => {
  const navigate    = useNavigate();
  const { user, logOut, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user?.email) return;
    getUserOrders(axiosSecure, user.email)
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading]);

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  // Stats derived from orders
  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "Pending").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    spent:     orders.reduce((s, o) => s + (o.totalPrice || 0), 0),
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {/* ── Profile card ──────────────────────────────────────────────── */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
          {/* Avatar */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-20 h-20 rounded-full object-cover ring-4 ring-green-100 mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl font-bold mb-3">
              {user?.displayName?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase()}
            </div>
          )}

          <h2 className="font-bold text-gray-800 text-lg leading-tight">
            {user?.displayName || "User"}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5 mb-4 break-all">{user?.email}</p>

          <div className="w-full border-t border-gray-100 pt-4 space-y-2">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-green-700 transition group"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={14} /> My Orders
              </span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-xl py-2 transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* ── Stats grid ────────────────────────────────────────────────── */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 content-start">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              icon: <ShoppingBag size={20} className="text-green-700" />,
              bg: "bg-green-50",
            },
            {
              label: "Total Spent",
              value: `৳${stats.spent.toLocaleString()}`,
              icon: <CheckCircle size={20} className="text-blue-600" />,
              bg: "bg-blue-50",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: <Clock size={20} className="text-yellow-600" />,
              bg: "bg-yellow-50",
            },
            {
              label: "Delivered",
              value: stats.delivered,
              icon: <Truck size={20} className="text-purple-600" />,
              bg: "bg-purple-50",
            },
          ].map(({ label, value, icon, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent orders ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          {orders.length > 5 && (
            <button
              onClick={() => navigate("/orders")}
              className="text-sm text-green-700 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No orders yet</p>
            <button
              onClick={() => navigate("/")}
              className="mt-3 text-green-700 text-sm font-medium hover:underline"
            >
              Start shopping →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const s = STATUS_STYLE[order.status] || STATUS_STYLE.Pending;
              return (
                <div
                  key={order._id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Item thumbnails */}
                  <div className="flex gap-1 shrink-0">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <img
                        key={i}
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                      />
                    ))}
                    {order.items?.length > 2 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                        +{order.items.length - 2}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-mono">
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      ৳{order.totalPrice}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${s.color}`}
                  >
                    {s.icon}
                    {order.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;