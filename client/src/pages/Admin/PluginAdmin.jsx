import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "../../hooks/useAxios";
import {
  Package,
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";

const ENDPOINT = "/pluginorder";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    selectColor: "bg-amber-50 text-amber-700 border-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    selectColor: "bg-blue-50 text-blue-700 border-blue-300",
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    selectColor: "bg-purple-50 text-purple-700 border-purple-300",
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    selectColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    selectColor: "bg-red-50 text-red-700 border-red-300",
  },
};

// billing.address is stored as "<thana/upazila>, <detail address>"
function parseAddress(address) {
  if (!address) return { thana: "", detail: "" };
  const idx = address.indexOf(",");
  if (idx === -1) return { thana: address.trim(), detail: "" };
  return {
    thana: address.slice(0, idx).trim(),
    detail: address.slice(idx + 1).trim(),
  };
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
};

function InlineStatusSelect({ orderId, currentStatus, axios, onStatusChange }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (newStatus) => {
    if (newStatus === status) return;
    setSaving(true);
    try {
      await axios.patch(`${ENDPOINT}/${orderId}/status`, { status: newStatus });
      setStatus(newStatus);
      onStatusChange(orderId, newStatus);
    } catch {
      alert("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div className="relative flex items-center gap-1.5">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className={`
          text-xs font-medium rounded-full border px-2.5 py-0.5 pr-5
          appearance-none cursor-pointer outline-none transition-colors
          disabled:opacity-60 disabled:cursor-not-allowed
          ${cfg.selectColor}
        `}
        style={{ backgroundImage: "none" }}
      >
        {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      {saving ? (
        <Loader2 className="w-3 h-3 text-gray-400 animate-spin shrink-0" />
      ) : (
        <svg
          className="w-3 h-3 text-current opacity-50 pointer-events-none shrink-0"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange, axios }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const { thana, detail } = parseAddress(order.billing.address);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await axios.patch(`${ENDPOINT}/${order._id}/status`, { status });
      onStatusChange(order._id, status);
      onClose();
    } catch {
      alert("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Order Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-5">
          {/* Product */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Product
            </p>
            <div className="flex items-center gap-3">
              {order.product.image && (
                <img
                  src={order.product.image}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {order.product.name}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {order.product.quantity} × ৳
                  {order.product.price.toLocaleString()}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-gray-800">
                  ৳{order.pricing.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Customer &amp; Address
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="text-gray-800 font-medium">
                  {order.billing.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>{" "}
                {order.billing.phone ? (
                  <a
                    href={`tel:${order.billing.phone}`}
                    className="text-orange-600 font-medium"
                  >
                    {order.billing.phone}
                  </a>
                ) : (
                  <span className="text-gray-800">—</span>
                )}
              </div>
              <div>
                <span className="text-gray-500">District:</span>{" "}
                <span className="text-gray-800 font-medium">
                  {order.billing.district || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Thana / উপজেলা:</span>{" "}
                <span className="text-gray-800 font-medium">{thana || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">Country:</span>{" "}
                <span className="text-gray-800">{order.billing.country}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500">Detail address:</span>{" "}
                <span className="text-gray-800">{detail || "—"}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Shipping
              </p>
              <p className="text-sm text-gray-800 capitalize">
                {order.shipping.zone.replace("_", " ")}
              </p>
              <p className="text-xs text-gray-500">৳{order.shipping.charge}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Payment
              </p>
              <p className="text-sm text-gray-800">
                {order.payment.method === "cod" ? "Cash on Delivery" : "bKash"}
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>৳{order.pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>৳{order.shipping.charge}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-800 pt-1.5 border-t border-gray-200">
              <span>Total</span>
              <span>৳{order.pricing.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Update Status
            </p>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 bg-white"
              >
                {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={saving || status === order.status}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Ordered:{" "}
            {new Date(order.createdAt).toLocaleString("en-BD", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Mobile card — shows every field (table columns are hidden on small screens)
function OrderCard({
  order,
  axios,
  onView,
  onDelete,
  deleting,
  onStatusChange,
}) {
  const { thana, detail } = parseAddress(order.billing.address);
  const rows = [
    ["Product", `${order.product.name}  ×${order.product.quantity}`],
    ["District", order.billing.district || "—"],
    ["Thana / উপজেলা", thana || "—"],
    ["Address", detail || "—"],
    ["Shipping", order.shipping.zone.replace("_", " ")],
  ];

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 break-words">
            {order.billing.name}
          </p>
          {order.billing.phone ? (
            <a
              href={`tel:${order.billing.phone}`}
              className="text-xs font-medium text-orange-600"
            >
              {order.billing.phone}
            </a>
          ) : (
            <span className="text-xs text-gray-400">No phone</span>
          )}
        </div>
        <div className="flex-shrink-0">
          <InlineStatusSelect
            orderId={order._id}
            currentStatus={order.status}
            axios={axios}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-2 text-sm">
            <span className="w-24 flex-shrink-0 text-gray-400">{label}</span>
            <span className="min-w-0 break-words font-medium text-gray-800">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div>
          <p className="text-base font-bold text-gray-800">
            ৳{order.pricing.total.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleString("en-BD", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(order)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onDelete(order._id)}
            disabled={deleting === order._id}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
            title="Delete order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PluginAdmin() {
  const axiosSecure = useAxiosSecure();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await axiosSecure.get(`${ENDPOINT}?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, axiosSecure]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    setDeleting(id);
    try {
      await axiosSecure.delete(`${ENDPOINT}/${id}`);
      setOrders((o) => o.filter((x) => x._id !== id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = (id, status) => {
    setOrders((o) => o.map((x) => (x._id === id ? { ...x, status } : x)));
    setSelectedOrder((prev) =>
      prev && prev._id === id ? { ...prev, status } : prev,
    );
  };

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.billing.name.toLowerCase().includes(search.toLowerCase()) ||
      o.billing.phone?.includes(search) ||
      o.billing.district?.toLowerCase().includes(search.toLowerCase()) ||
      o._id.includes(search),
  );

  const stats = {
    total: pagination.total,
    pending: orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.pricing.total, 0),
    soldPieces: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + (o.product.quantity || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Plugin Orders</h1>
              <p className="text-xs text-gray-500">Plug In Quran sales</p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded-xl border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Total Sold in Pieces */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-5 mb-4 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-100">
                Total Sold in Pieces
              </p>
              <p className="text-3xl font-bold leading-tight">
                {stats.soldPieces.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-orange-200 hidden sm:block">
            Excludes cancelled orders
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              icon: Package,
              color: "text-blue-500",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock,
              color: "text-amber-500",
            },
            {
              label: "Delivered",
              value: stats.delivered,
              icon: CheckCircle,
              color: "text-emerald-500",
            },
            {
              label: "Revenue",
              value: `৳${stats.revenue.toLocaleString()}`,
              icon: TrendingUp,
              color: "text-orange-500",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, district, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 bg-white transition-colors appearance-none cursor-pointer"
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No orders found</p>
            </div>
          ) : (
            <>
              {/* Mobile: card list (all details visible) */}
              <div className="md:hidden divide-y divide-gray-100">
                {filtered.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    axios={axiosSecure}
                    onView={setSelectedOrder}
                    onDelete={handleDelete}
                    deleting={deleting}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                      District / Thana
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                      Shipping
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {order.billing.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.billing.phone || "No phone"}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700 truncate max-w-[160px]">
                          {order.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ×{order.product.quantity}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm font-medium text-gray-700">
                          {order.billing.district || "—"}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">
                          {order.billing.address || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-600 capitalize">
                          {order.shipping.zone.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        ৳{order.pricing.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <InlineStatusSelect
                          orderId={order._id}
                          currentStatus={order.status}
                          axios={axiosSecure}
                          onStatusChange={handleStatusChange}
                        />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            disabled={deleting === order._id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page} of {pagination.pages} · {pagination.total} orders
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page === pagination.pages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          axios={axiosSecure}
        />
      )}
    </div>
  );
}
