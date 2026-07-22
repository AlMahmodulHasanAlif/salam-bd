import { useState, useEffect, useCallback, useRef } from "react";
import useAxiosSecure from "../../hooks/useAxios";
import {
  Trophy,
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Clock,
  ShieldCheck,
  Star,
  Crown,
  Phone,
  Download,
  FileSpreadsheet,
  X,
  ImageIcon,
  PenLine,
  Calendar,
  GraduationCap,
  MapPin,
} from "lucide-react";

const ENDPOINT = "/competition";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  verified: {
    label: "Verified",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  shortlisted: {
    label: "Shortlisted",
    dot: "bg-purple-400",
    pill: "bg-purple-50 text-purple-700 border-purple-200",
  },
  winner: {
    label: "Winner",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-400",
    pill: "bg-red-50 text-red-700 border-red-200",
  },
};

// ── Cloudinary: force a download (with a proper filename) via fl_attachment ──
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

// ── Build an .xlsx from registration rows (xlsx loaded lazily) ──
async function exportToExcel(rows, filenameBase) {
  const XLSX = await import("xlsx");
  const data = rows.map((r) => ({
    "Reg No": r.regNo || "",
    "Student Name": r.student?.name || "",
    "Date of Birth": r.student?.dob || "",
    Class: r.student?.grade || "",
    Institution: r.student?.institution || "",
    "Village / Area": r.address?.village || "",
    Thana: r.address?.thana || "",
    District: r.address?.district || "",
    Guardian: r.guardian?.name || "",
    Mobile: r.guardian?.mobile || "",
    "Customer Code": r.customer?.code || "",
    Referral: r.customer?.referral || "",
    Status: r.status || "",
    "Photo URL": r.student?.photo || "",
    "Signature URL": r.signature || "",
    "Registered At": r.createdAt
      ? new Date(r.createdAt).toLocaleString("en-BD")
      : "",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [
    14, 20, 14, 14, 24, 18, 16, 16, 20, 14, 16, 16, 12, 40, 40, 20,
  ].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Registrations");
  XLSX.writeFile(wb, `${filenameBase}.xlsx`);
}

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.pill}`}
    >
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
        className="text-xs font-medium rounded-lg border border-gray-200 bg-white px-2 py-1 pr-6 appearance-none cursor-pointer outline-none transition-colors hover:border-gray-300 focus:border-emerald-400 disabled:opacity-60"
      >
        {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      {saving ? (
        <Loader2 className="w-3 h-3 text-gray-400 animate-spin absolute right-1.5" />
      ) : (
        <svg
          className="w-3 h-3 text-gray-400 pointer-events-none absolute right-1.5"
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

const InfoRow = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium text-orange-600">
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-gray-800 break-words">
          {value || "—"}
        </p>
      )}
    </div>
  </div>
);

function DetailModal({ reg, onClose, onStatusChange, axios }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-5 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            {reg.student.photo ? (
              <img
                src={reg.student.photo}
                alt={reg.student.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-white/70">
                <Trophy className="w-7 h-7" />
              </div>
            )}
            <div className="text-white">
              <p className="text-xl font-bold leading-tight">
                {reg.student.name}
              </p>
              <p className="text-emerald-100 text-sm font-medium">
                {reg.regNo}
              </p>
              <div className="mt-1">
                <StatusPill status={reg.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={GraduationCap} label="শ্রেণি" value={reg.student.grade} />
            <InfoRow icon={Calendar} label="জন্ম তারিখ" value={reg.student.dob} />
            <InfoRow
              icon={Trophy}
              label="প্রতিষ্ঠান"
              value={reg.student.institution}
            />
            <InfoRow
              icon={MapPin}
              label="ঠিকানা"
              value={`${reg.address.village}, ${reg.address.thana}, ${reg.address.district}`}
            />
            <InfoRow icon={Phone} label="অভিভাবক" value={reg.guardian.name} />
            <InfoRow
              icon={Phone}
              label="মোবাইল"
              value={reg.guardian.mobile}
              href={`tel:${reg.guardian.mobile}`}
            />
            {reg.customer?.code && (
              <InfoRow
                icon={ShieldCheck}
                label="কাস্টমার কোড"
                value={reg.customer.code}
              />
            )}
            {reg.customer?.referral && (
              <InfoRow
                icon={Star}
                label="রেফারেল"
                value={reg.customer.referral}
              />
            )}
          </div>

          {/* Images with download */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> শিক্ষার্থীর ছবি
                </p>
                {reg.student.photo && (
                  <button
                    onClick={() =>
                      triggerDownload(
                        reg.student.photo,
                        `${reg.regNo}-photo.jpg`,
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
              {reg.student.photo ? (
                <img
                  src={reg.student.photo}
                  alt="student"
                  className="w-full h-40 object-cover rounded-xl bg-gray-50"
                />
              ) : (
                <div className="w-full h-40 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5" /> স্বাক্ষর
                </p>
                {reg.signature && (
                  <button
                    onClick={() =>
                      triggerDownload(reg.signature, `${reg.regNo}-signature.png`)
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
              {reg.signature ? (
                <img
                  src={reg.signature}
                  alt="signature"
                  className="w-full h-40 object-contain rounded-xl bg-gray-50 p-2"
                />
              ) : (
                <div className="w-full h-40 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                  <PenLine className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>

          {/* Status control */}
          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Update Status
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Registered{" "}
                {new Date(reg.createdAt).toLocaleString("en-BD", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <InlineStatusSelect
              id={reg._id}
              currentStatus={reg.status}
              axios={axios}
              onChange={onStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCompetition() {
  const axiosSecure = useAxiosSecure();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [stats, setStats] = useState({ total: 0, byStatus: {} });
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [exporting, setExporting] = useState(false);
  const selectAllRef = useRef(null);

  const fetchRegs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const { data } = await axiosSecure.get(`${ENDPOINT}?${params}`);
      setRegs(data.registrations || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
      setSelected(new Set()); // selection is per-page; reset on any refetch
    } catch {
      console.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, axiosSecure]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axiosSecure.get(`${ENDPOINT}/stats`);
      setStats({ total: data.total, byStatus: data.byStatus });
    } catch {
      /* ignore */
    }
  }, [axiosSecure]);

  useEffect(() => {
    fetchRegs();
  }, [fetchRegs]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Keep the select-all box in its indeterminate visual state.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selected.size > 0 && selected.size < regs.length;
    }
  }, [selected, regs]);

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === regs.length ? new Set() : new Set(regs.map((r) => r._id)),
    );

  const handleDelete = async (id) => {
    if (!confirm("Delete this registration?")) return;
    setDeleting(id);
    try {
      await axiosSecure.delete(`${ENDPOINT}/${id}`);
      setRegs((r) => r.filter((x) => x._id !== id));
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
    if (!confirm(`Delete ${selected.size} selected registration(s)?`)) return;
    const ids = [...selected];
    await Promise.all(
      ids.map((id) => axiosSecure.delete(`${ENDPOINT}/${id}`).catch(() => null)),
    );
    setRegs((r) => r.filter((x) => !selected.has(x._id)));
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - ids.length) }));
    setSelected(new Set());
    fetchStats();
  };

  const handleStatusChange = (id, status) => {
    setRegs((r) => r.map((x) => (x._id === id ? { ...x, status } : x)));
    setDetail((prev) => (prev && prev._id === id ? { ...prev, status } : prev));
    fetchStats();
  };

  const stamp = new Date().toISOString().slice(0, 10);

  const exportAll = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 10000 });
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const { data } = await axiosSecure.get(`${ENDPOINT}?${params}`);
      const rows = data.registrations || [];
      if (!rows.length) {
        alert("No registrations to export");
        return;
      }
      await exportToExcel(rows, `medha-registrations-${stamp}`);
    } catch {
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const exportSelected = async () => {
    const rows = regs.filter((r) => selected.has(r._id));
    if (!rows.length) return;
    setExporting(true);
    try {
      await exportToExcel(rows, `medha-selected-${stamp}`);
    } catch {
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: Trophy, from: "from-orange-500", to: "to-amber-400" },
    { label: "Pending", value: stats.byStatus.pending || 0, icon: Clock, from: "from-amber-500", to: "to-yellow-400" },
    { label: "Verified", value: stats.byStatus.verified || 0, icon: ShieldCheck, from: "from-blue-500", to: "to-sky-400" },
    { label: "Shortlisted", value: stats.byStatus.shortlisted || 0, icon: Star, from: "from-purple-500", to: "to-fuchsia-400" },
    { label: "Winner", value: stats.byStatus.winner || 0, icon: Crown, from: "from-emerald-500", to: "to-teal-400" },
  ];

  const allChecked = regs.length > 0 && selected.size === regs.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ── Hero header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-6 md:p-7 mb-6 shadow-lg shadow-emerald-900/10">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-300" />
              </div>
              <div className="text-white">
                <h1 className="text-xl md:text-2xl font-bold">
                  মেধা যাচাই প্রতিযোগিতা
                </h1>
                <p className="text-emerald-100 text-sm">
                  Competition registrations & entries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchRegs();
                  fetchStats();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-white bg-white/15 hover:bg-white/25 rounded-xl transition-colors backdrop-blur"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button
                onClick={exportAll}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 bg-white hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-70"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {statCards.map(({ label, value, icon: Icon, from, to }) => (
            <div
              key={label}
              className="group bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center mb-3 shadow-sm`}
              >
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800 leading-none">
                {value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, reg no, district…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400 bg-white transition appearance-none cursor-pointer min-w-[160px]"
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

        {/* ── Bulk toolbar ── */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-sm font-semibold text-emerald-800">
              {selected.size} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={exportSelected}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-60"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export selected
            </button>
            <button
              onClick={deleteSelected}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="inline-flex items-center gap-1 px-2 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          </div>
        )}

        {/* ── List ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : regs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <Trophy className="w-7 h-7 opacity-40" />
              </div>
              <p className="text-sm font-medium">No registrations found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {regs.map((reg) => (
                  <div key={reg._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected.has(reg._id)}
                        onChange={() => toggleOne(reg._id)}
                        className="mt-1 w-4 h-4 accent-emerald-600"
                      />
                      {reg.student.photo ? (
                        <img
                          src={reg.student.photo}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
                          <Trophy className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 truncate">
                          {reg.student.name}
                        </p>
                        <p className="text-xs text-orange-600 font-bold">
                          {reg.regNo}
                        </p>
                      </div>
                      <StatusPill status={reg.status} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mt-3 pl-7">
                      <p className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                        {reg.student.grade}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {reg.address.district}, {reg.address.thana}
                      </p>
                      <a
                        href={`tel:${reg.guardian.mobile}`}
                        className="inline-flex items-center gap-1.5 text-orange-600 font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" /> {reg.guardian.mobile}
                      </a>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                      <InlineStatusSelect
                        id={reg._id}
                        currentStatus={reg.status}
                        axios={axiosSecure}
                        onChange={handleStatusChange}
                      />
                      <button
                        onClick={() => setDetail(reg)}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={() => handleDelete(reg._id)}
                        disabled={deleting === reg._id}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allChecked}
                          onChange={toggleAll}
                          className="w-4 h-4 accent-emerald-600 align-middle"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Student
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Reg No
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                        Class
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                        District
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Guardian
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {regs.map((reg) => {
                      const isSel = selected.has(reg._id);
                      return (
                        <tr
                          key={reg._id}
                          className={`transition-colors ${
                            isSel ? "bg-emerald-50/50" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={() => toggleOne(reg._id)}
                              className="w-4 h-4 accent-emerald-600 align-middle"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {reg.student.photo ? (
                                <img
                                  src={reg.student.photo}
                                  alt=""
                                  className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
                                  <Trophy className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-800">
                                  {reg.student.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate max-w-[160px]">
                                  {reg.student.institution}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">
                              {reg.regNo}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-gray-700">
                            {reg.student.grade}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-gray-700">{reg.address.district}</p>
                            <p className="text-xs text-gray-400">
                              {reg.address.thana}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700">{reg.guardian.name}</p>
                            <a
                              href={`tel:${reg.guardian.mobile}`}
                              className="text-xs text-orange-600"
                            >
                              {reg.guardian.mobile}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <InlineStatusSelect
                              id={reg._id}
                              currentStatus={reg.status}
                              axios={axiosSecure}
                              onChange={handleStatusChange}
                            />
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell text-xs text-gray-500">
                            {new Date(reg.createdAt).toLocaleDateString("en-BD", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {reg.student.photo && (
                                <button
                                  onClick={() =>
                                    triggerDownload(
                                      reg.student.photo,
                                      `${reg.regNo}-photo.jpg`,
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                                  title="Download photo"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setDetail(reg)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(reg._id)}
                                disabled={deleting === reg._id}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
              <p className="text-xs text-gray-500">
                Page {page} of {pagination.pages} · {pagination.total} entries
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
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
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

      {detail && (
        <DetailModal
          reg={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
          axios={axiosSecure}
        />
      )}
    </div>
  );
}
