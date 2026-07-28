// src/pages/Admin/AdminIncompleteOrders.jsx
//
// Abandoned order forms — customers who filled in their details but never
// placed the order. Every order form on the site feeds this list (see
// hooks/useIncompleteOrder.jsx); a draft disappears the moment its order lands,
// so everything here is a live follow-up opportunity.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  RefreshCw,
  Download,
  Search,
  Trash2,
  Phone,
  Clock,
  TrendingDown,
} from "lucide-react";
import useAxiosSecure from "../../hooks/useAxios";
import useAdminNotifications from "../../hooks/useAdminNotifications";
import {
  getIncompleteOrders,
  getIncompleteOrderStats,
  updateIncompleteOrderStatus,
  deleteIncompleteOrder,
  bulkDeleteIncompleteOrders,
} from "../../api/incompleteOrderApi";

// Must stay in sync with FOLLOWUP_STATUSES in the backend controller.
const STATUS_CONFIG = {
  new: { label: "New", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  contacted: {
    label: "Contacted",
    cls: "bg-blue-100 text-blue-700 border-blue-200",
  },
  recovered: {
    label: "Recovered",
    cls: "bg-green-100 text-green-700 border-green-200",
  },
  lost: { label: "Lost", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};
const STATUSES = Object.keys(STATUS_CONFIG);

// Friendly names for the form each draft came from. Unknown sources (a form
// added later) fall back to their raw slug rather than disappearing.
const SOURCE_LABELS = {
  checkout: "Shop Checkout",
  plugin: "Plugin Quran",
};
const sourceLabel = (s) => SOURCE_LABELS[s] || s || "—";

const PAGE_SIZE = 20;

// "3h ago" reads better than a timestamp when the whole point is recency —
// a lead abandoned 10 minutes ago is worth calling, one from last week isn't.
const timeAgo = (date) => {
  if (!date) return "—";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : new Date(date).toLocaleDateString("en-BD");
};

const StatusSelect = ({ value, onChange, disabled }) => {
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.new;
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`px-2.5 py-1 rounded-lg border text-xs font-medium outline-none cursor-pointer disabled:opacity-50 ${cfg.cls}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_CONFIG[s].label}
        </option>
      ))}
    </select>
  );
};

// Written out in full rather than interpolated — Tailwind only ships classes it
// can find as literal strings, so `text-${tone}-700` would be purged.
const TONE_TEXT = {
  gray: "text-gray-700",
  amber: "text-amber-700",
  blue: "text-blue-700",
  green: "text-green-700",
};

const StatCard = ({ label, value, tone = "gray" }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${TONE_TEXT[tone]}`}>{value}</p>
  </div>
);

export default function AdminIncompleteOrders() {
  const axiosSecure = useAxiosSecure();
  const { markSeen } = useAdminNotifications();

  const [drafts, setDrafts] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState(() => new Set());
  const [busyId, setBusyId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    recovered: 0,
    lostValue: 0,
  });

  const clearSelection = () => setSelected(new Set());

  // Opening the page clears its sidebar badge.
  useEffect(() => {
    markSeen("incompleteOrders");
  }, [markSeen]);

  // Search is server-side, so debounce it rather than firing per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getIncompleteOrders(axiosSecure, {
        status: statusFilter,
        source: sourceFilter,
        search: debouncedSearch,
        page,
        limit: PAGE_SIZE,
      });
      setDrafts(data?.drafts || []);
      setSources(data?.sources || []);
      setPagination(data?.pagination || { total: 0, pages: 1 });
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, statusFilter, sourceFilter, debouncedSearch, page]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await getIncompleteOrderStats(axiosSecure);
      if (data?.stats) setStats(data.stats);
    } catch {
      // Stats are decorative — a failure here shouldn't blank the page.
    }
  }, [axiosSecure]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleStatus = async (id, status) => {
    setBusyId(id);
    const previous = drafts;
    setDrafts((d) => d.map((x) => (x._id === id ? { ...x, status } : x)));
    try {
      await updateIncompleteOrderStatus(axiosSecure, id, status);
      loadStats();
    } catch {
      setDrafts(previous); // roll back to server truth
      alert("Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this incomplete order? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await deleteIncompleteOrder(axiosSecure, id);
      setDrafts((d) => d.filter((x) => x._id !== id));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
      loadStats();
    } catch {
      alert("Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} incomplete order(s)? This cannot be undone.`))
      return;
    setBulkDeleting(true);
    try {
      const ids = [...selected];
      await bulkDeleteIncompleteOrders(axiosSecure, ids);
      const idSet = new Set(ids);
      setDrafts((d) => d.filter((x) => !idSet.has(x._id)));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - ids.length) }));
      clearSelection();
      loadStats();
    } catch {
      alert("Failed to delete selected");
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected =
    drafts.length > 0 && drafts.every((d) => selected.has(d._id));

  const toggleSelectAll = () =>
    setSelected((prev) =>
      drafts.length > 0 && drafts.every((d) => prev.has(d._id))
        ? new Set()
        : new Set(drafts.map((d) => d._id)),
    );

  // Exports the selection, or the whole current page when nothing is selected.
  const exportCSV = () => {
    const rowsSource = selected.size
      ? drafts.filter((d) => selected.has(d._id))
      : drafts;
    if (rowsSource.length === 0) return;

    const headers = [
      "Name",
      "Phone",
      "District",
      "Thana",
      "Address",
      "Items",
      "Estimated Total",
      "Source",
      "Status",
      "Started",
      "Last Activity",
    ];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = rowsSource.map((d) =>
      [
        d.customer?.name,
        d.customer?.phone,
        d.customer?.district,
        d.customer?.thana,
        d.customer?.address,
        (d.items || []).map((i) => `${i.name} x${i.quantity}`).join(" | "),
        d.estimatedTotal,
        sourceLabel(d.source),
        d.status,
        d.createdAt ? new Date(d.createdAt).toLocaleString("en-BD") : "",
        d.updatedAt ? new Date(d.updatedAt).toLocaleString("en-BD") : "",
      ]
        .map(esc)
        .join(","),
    );
    const csv = [headers.map(esc).join(","), ...rows].join("\n");
    // BOM so Excel opens Bangla text correctly.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incomplete-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sourceOptions = useMemo(
    () => ["all", ...sources.filter(Boolean)],
    [sources],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Incomplete Orders
              </h1>
              <p className="text-xs text-gray-500">
                Customers who filled a form but never ordered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={drafts.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded-xl border border-gray-200 transition-colors disabled:opacity-40"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => {
                load();
                loadStats();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded-xl border border-gray-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Value left on the table */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-400 rounded-xl p-5 mb-4 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-100">
                Recoverable Value
              </p>
              <p className="text-3xl font-bold leading-tight">
                ৳{(stats.lostValue || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-100 hidden sm:block">
            From leads not yet recovered
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} tone="gray" />
          <StatCard label="New" value={stats.new} tone="amber" />
          <StatCard label="Contacted" value={stats.contacted} tone="blue" />
          <StatCard label="Recovered" value={stats.recovered} tone="green" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, district…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-white"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-white"
          >
            {sourceOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All forms" : sourceLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <p className="text-sm text-amber-800 font-medium">
              {selected.size} selected
            </p>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {bulkDeleting ? "Deleting…" : "Delete"}
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500">
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Est. Total</th>
                  <th className="p-3">Form</th>
                  <th className="p-3">Last Activity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-gray-400">
                      Loading…
                    </td>
                  </tr>
                ) : drafts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-gray-400">
                      No incomplete orders. Everyone who started a form finished it.
                    </td>
                  </tr>
                ) : (
                  drafts.map((d) => (
                    <tr
                      key={d._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(d._id)}
                          onChange={() => toggleSelect(d._id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-800">
                          {d.customer?.name || (
                            <span className="text-gray-400 italic">No name</span>
                          )}
                        </p>
                        {d.customer?.phone ? (
                          <a
                            href={`tel:${d.customer.phone}`}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {d.customer.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No phone
                          </span>
                        )}
                        {d.blocked?.phone && (
                          <span className="text-[10px] text-red-500 block mt-0.5">
                            blocked
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-[220px]">
                        <p className="text-gray-700 truncate" title={d.customer?.address || ""}>
                          {d.customer?.address || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {[d.customer?.thana, d.customer?.district]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </td>
                      <td className="p-3 max-w-[200px]">
                        {(d.items || []).length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <p
                            className="text-gray-600 text-xs truncate"
                            title={(d.items || [])
                              .map((i) => `${i.name} ×${i.quantity}`)
                              .join(", ")}
                          >
                            {d.items[0].name} ×{d.items[0].quantity}
                            {d.items.length > 1 && (
                              <span className="text-gray-400">
                                {" "}
                                +{d.items.length - 1} more
                              </span>
                            )}
                          </p>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-gray-800 whitespace-nowrap">
                        ৳{(d.estimatedTotal || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs whitespace-nowrap">
                          {sourceLabel(d.source)}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(d.updatedAt)}
                        </span>
                      </td>
                      <td className="p-3">
                        <StatusSelect
                          value={d.status}
                          disabled={busyId === d._id}
                          onChange={(s) => handleStatus(d._id, s)}
                        />
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete(d._id)}
                          disabled={busyId === d._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total}{" "}
              total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
