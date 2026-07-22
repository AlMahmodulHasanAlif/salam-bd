import { useState, useEffect, useCallback, useRef } from "react";
import useAxiosSecure from "../../hooks/useAxios";
import { exportToExcel } from "../../utils/exportExcel";
import {
  LifeBuoy,
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Clock,
  Cog,
  CheckCircle2,
  XCircle,
  Phone,
  Download,
  FileSpreadsheet,
  X,
  ImageIcon,
  Video,
  FileText,
  Calendar,
  MessageSquare,
} from "lucide-react";

const ENDPOINT = "/support";

const STATUS_CONFIG = {
  pending: { label: "Pending", dot: "bg-amber-400", pill: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { label: "Processing", dot: "bg-blue-400", pill: "bg-blue-50 text-blue-700 border-blue-200" },
  resolved: { label: "Resolved", dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", dot: "bg-red-400", pill: "bg-red-50 text-red-700 border-red-200" },
};

const TYPE_LABELS = {
  speaker: "স্পিকার নষ্ট",
  charging: "চার্জ নেয় না",
  sound: "সাউন্ড ক্লিয়ার না",
  battery: "ব্যাটারি চার্জ থাকে না",
  coding: "কোডিং কাজ করছে না",
  other: "অন্যান্য",
};

function attachmentUrl(url, filename) {
  if (!url) return url;
  if (url.includes("/upload/")) {
    const safe = (filename || "download").replace(/[^\w.-]/g, "_");
    return url.replace("/upload/", `/upload/fl_attachment:${safe}/`);
  }
  return url;
}

function triggerDownload(url, filename) {
  if (!url) return;
  const a = document.createElement("a");
  a.href = attachmentUrl(url, filename);
  a.download = filename || "";
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const EXPORT_COLUMNS = [
  { header: "Ticket No", value: (r) => r.ticketNo || "" },
  { header: "Name", value: (r) => r.customer?.name || "" },
  { header: "Mobile", value: (r) => r.customer?.mobile || "" },
  { header: "Order ID", value: (r) => r.customer?.orderId || "" },
  { header: "Purchase Date", value: (r) => r.customer?.purchaseDate || "" },
  {
    header: "Complaint Type",
    value: (r) => r.complaint?.typeLabel || TYPE_LABELS[r.complaint?.type] || "",
  },
  { header: "Details", value: (r) => r.complaint?.details || "" },
  { header: "Image URL", value: (r) => r.complaint?.image || "" },
  { header: "Video URL", value: (r) => r.complaint?.video || "" },
  { header: "Status", value: (r) => r.status || "" },
  {
    header: "Created At",
    value: (r) =>
      r.createdAt ? new Date(r.createdAt).toLocaleString("en-BD") : "",
  },
];

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

function InlineStatusSelect({ id, currentStatus, axios, onChange }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const handle = async (newStatus) => {
    if (newStatus === status) return;
    setSaving(true);
    try {
      await axios.patch(`${ENDPOINT}/${id}/status`, { status: newStatus });
      setStatus(newStatus);
      onChange(id, newStatus);
    } catch {
      alert("Failed to update status");
    } finally {
      setSaving(false);
    }
  };
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <div className="relative inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <select
        value={status}
        onChange={(e) => handle(e.target.value)}
        disabled={saving}
        className="text-xs font-medium rounded-lg border border-gray-200 bg-white px-2 py-1 pr-6 appearance-none cursor-pointer outline-none hover:border-gray-300 focus:border-emerald-400 disabled:opacity-60"
      >
        {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      {saving && <Loader2 className="w-3 h-3 text-gray-400 animate-spin absolute right-1.5" />}
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium text-orange-600">{value}</a>
      ) : (
        <p className="text-sm font-medium text-gray-800 break-words">{value || "—"}</p>
      )}
    </div>
  </div>
);

function DetailModal({ item, onClose, onStatusChange, axios }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-5 rounded-t-3xl">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="text-white">
            <p className="text-xl font-bold leading-tight">{item.customer.name}</p>
            <p className="text-emerald-100 text-sm font-medium">{item.ticketNo}</p>
            <div className="mt-1"><StatusPill status={item.status} /></div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Phone} label="মোবাইল" value={item.customer.mobile} href={`tel:${item.customer.mobile}`} />
            <InfoRow icon={FileText} label="অর্ডার আইডি" value={item.customer.orderId} />
            <InfoRow icon={Calendar} label="ক্রয়ের তারিখ" value={item.customer.purchaseDate} />
            <InfoRow icon={MessageSquare} label="অভিযোগের ধরন" value={item.complaint?.typeLabel || TYPE_LABELS[item.complaint?.type]} />
          </div>

          <div className="rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">সমস্যার বিস্তারিত</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.complaint?.details || "—"}</p>
          </div>

          {/* Media */}
          {(item.complaint?.image || item.complaint?.video) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.complaint?.image && (
                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> ছবি
                    </p>
                    <button onClick={() => triggerDownload(item.complaint.image, `${item.ticketNo}-image.jpg`)} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                  <img src={item.complaint.image} alt="complaint" className="w-full h-44 object-cover rounded-xl bg-gray-50" />
                </div>
              )}
              {item.complaint?.video && (
                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" /> ভিডিও
                    </p>
                    <button onClick={() => triggerDownload(item.complaint.video, `${item.ticketNo}-video.mp4`)} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                  <video src={item.complaint.video} controls className="w-full h-44 rounded-xl bg-black" />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Status</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Submitted {new Date(item.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <InlineStatusSelect id={item._id} currentStatus={item.status} axios={axios} onChange={onStatusChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSupport() {
  const axiosSecure = useAxiosSecure();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [stats, setStats] = useState({ total: 0, byStatus: {} });
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [exporting, setExporting] = useState(false);
  const selectAllRef = useRef(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());
      const { data } = await axiosSecure.get(`${ENDPOINT}?${params}`);
      setItems(data.complaints || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
      setSelected(new Set());
    } catch {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search, axiosSecure]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axiosSecure.get(`${ENDPOINT}/stats`);
      setStats({ total: data.total, byStatus: data.byStatus });
    } catch {
      /* ignore */
    }
  }, [axiosSecure]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    if (selectAllRef.current)
      selectAllRef.current.indeterminate = selected.size > 0 && selected.size < items.length;
  }, [selected, items]);

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((r) => r._id))));

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;
    setDeleting(id);
    try {
      await axiosSecure.delete(`${ENDPOINT}/${id}`);
      setItems((r) => r.filter((x) => x._id !== id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
      fetchStats();
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const deleteSelected = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected complaint(s)?`)) return;
    const ids = [...selected];
    await Promise.all(ids.map((id) => axiosSecure.delete(`${ENDPOINT}/${id}`).catch(() => null)));
    setItems((r) => r.filter((x) => !selected.has(x._id)));
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - ids.length) }));
    setSelected(new Set());
    fetchStats();
  };

  const handleStatusChange = (id, status) => {
    setItems((r) => r.map((x) => (x._id === id ? { ...x, status } : x)));
    setDetail((prev) => (prev && prev._id === id ? { ...prev, status } : prev));
    fetchStats();
  };

  const stamp = new Date().toISOString().slice(0, 10);
  const exportAll = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 10000 });
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());
      const { data } = await axiosSecure.get(`${ENDPOINT}?${params}`);
      const rows = data.complaints || [];
      if (!rows.length) return alert("No complaints to export");
      exportToExcel(EXPORT_COLUMNS, rows, `support-complaints-${stamp}`);
    } catch {
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };
  const exportSelected = async () => {
    const rows = items.filter((r) => selected.has(r._id));
    if (!rows.length) return;
    setExporting(true);
    try {
      exportToExcel(EXPORT_COLUMNS, rows, `support-selected-${stamp}`);
    } catch {
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: LifeBuoy, from: "from-orange-500", to: "to-amber-400" },
    { label: "Pending", value: stats.byStatus.pending || 0, icon: Clock, from: "from-amber-500", to: "to-yellow-400" },
    { label: "Processing", value: stats.byStatus.processing || 0, icon: Cog, from: "from-blue-500", to: "to-sky-400" },
    { label: "Resolved", value: stats.byStatus.resolved || 0, icon: CheckCircle2, from: "from-emerald-500", to: "to-teal-400" },
    { label: "Rejected", value: stats.byStatus.rejected || 0, icon: XCircle, from: "from-red-500", to: "to-rose-400" },
  ];
  const allChecked = items.length > 0 && selected.size === items.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-6 md:p-7 mb-6 shadow-lg shadow-emerald-900/10">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <LifeBuoy className="w-6 h-6 text-amber-300" />
              </div>
              <div className="text-white">
                <h1 className="text-xl md:text-2xl font-bold">গ্যারান্টি সাপোর্ট</h1>
                <p className="text-emerald-100 text-sm">100-day guarantee complaints</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { fetchItems(); fetchStats(); }} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-white bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={exportAll} disabled={exporting} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 bg-white hover:bg-emerald-50 rounded-xl disabled:opacity-70">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {statCards.map(({ label, value, icon: Icon, from, to }) => (
            <div key={label} className="group bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, mobile, order id, ticket…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400 bg-white appearance-none cursor-pointer min-w-[150px]">
              <option value="">All types</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400 bg-white appearance-none cursor-pointer min-w-[150px]">
              <option value="">All statuses</option>
              {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk toolbar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-sm font-semibold text-emerald-800">{selected.size} selected</span>
            <div className="flex-1" />
            <button onClick={exportSelected} disabled={exporting} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-100 disabled:opacity-60">
              <FileSpreadsheet className="w-4 h-4" /> Export selected
            </button>
            <button onClick={deleteSelected} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete selected
            </button>
            <button onClick={() => setSelected(new Set())} className="inline-flex items-center gap-1 px-2 py-2 text-sm text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" /> Clear
            </button>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <LifeBuoy className="w-7 h-7 opacity-40" />
              </div>
              <p className="text-sm font-medium">No complaints found</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {items.map((it) => (
                  <div key={it._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selected.has(it._id)} onChange={() => toggleOne(it._id)} className="mt-1 w-4 h-4 accent-emerald-600" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 truncate">{it.customer.name}</p>
                        <p className="text-xs text-orange-600 font-bold">{it.ticketNo}</p>
                      </div>
                      <StatusPill status={it.status} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mt-3 pl-7">
                      <p className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-gray-400" />{it.complaint?.typeLabel || TYPE_LABELS[it.complaint?.type]}</p>
                      <a href={`tel:${it.customer.mobile}`} className="inline-flex items-center gap-1.5 text-orange-600 font-medium"><Phone className="w-3.5 h-3.5" /> {it.customer.mobile}</a>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                      <InlineStatusSelect id={it._id} currentStatus={it.status} axios={axiosSecure} onChange={handleStatusChange} />
                      <button onClick={() => setDetail(it)} className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"><Eye className="w-4 h-4" /> View</button>
                      <button onClick={() => handleDelete(it._id)} disabled={deleting === it._id} className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="w-10 px-4 py-3">
                        <input ref={selectAllRef} type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 accent-emerald-600 align-middle" />
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ticket</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Order ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Date</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((it) => {
                      const isSel = selected.has(it._id);
                      return (
                        <tr key={it._id} className={`transition-colors ${isSel ? "bg-emerald-50/50" : "hover:bg-gray-50"}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={isSel} onChange={() => toggleOne(it._id)} className="w-4 h-4 accent-emerald-600 align-middle" />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{it.customer.name}</p>
                            <a href={`tel:${it.customer.mobile}`} className="text-xs text-orange-600">{it.customer.mobile}</a>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">{it.ticketNo}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-gray-700">{it.complaint?.typeLabel || TYPE_LABELS[it.complaint?.type]}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{it.customer.orderId || "—"}</td>
                          <td className="px-4 py-3">
                            <InlineStatusSelect id={it._id} currentStatus={it.status} axios={axiosSecure} onChange={handleStatusChange} />
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell text-xs text-gray-500">
                            {new Date(it.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setDetail(it)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500" title="View"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(it._id)} disabled={deleting === it._id} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {page} of {pagination.pages} · {pagination.total} complaints</p>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detail && (
        <DetailModal item={detail} onClose={() => setDetail(null)} onStatusChange={handleStatusChange} axios={axiosSecure} />
      )}
    </div>
  );
}
