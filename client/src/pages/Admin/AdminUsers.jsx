// src/pages/Admin/AdminUsers.jsx
import React, { useEffect, useState, useRef } from "react";
import useAxiosSecure from "../../hooks/useAxios";
import {
  getAllUsers,
  updateUserRole,
  deleteAdminUser,
} from "../../api/orderApi";
import useAuth from "../../hooks/useAuth";
import { Search, Trash2, Pencil, ZoomIn, Users } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const AdminUsers = () => {
  const axiosSecure = useAxiosSecure();
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debounce = useRef(null);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const r = await getAllUsers(axiosSecure, q);
      setUsers(r.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(e.target.value), 400);
  };

  const handleRole = async (email, role) => {
    if (email === me.email) {
      toast.error("Can't change your own role");
      return;
    }
    await updateUserRole(axiosSecure, email, role);
    toast.success(`Role → ${role}`);
    load(search);
  };

  const handleDelete = async (email) => {
    if (email === me.email) {
      toast.error("Can't delete yourself");
      return;
    }
    if (!confirm(`Delete ${email}?`)) return;
    await deleteAdminUser(axiosSecure, email);
    toast.success("Deleted");
    load(search);
  };

  // Shorten MongoDB _id to last 4 hex chars (uppercase) like "361E"
  const shortId = (id = "") => id.slice(-4).toUpperCase();

  const exportExcel = () => {
    if (!users.length) {
      toast.error("No users to export");
      return;
    }
    const rows = users.map((u) => ({
      ID: shortId(u._id),
      "Joining Date": u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "",
      Name: u.name || "",
      Email: u.email || "",
      Phone: u.phone || "",
      Orders: u.orderCount ?? 0,
      Role: u.role || "user",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 22 },
      { wch: 28 },
      { wch: 16 },
      { wch: 8 },
      { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `users_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Exported to Excel!");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="flex items-center gap-1.5 text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats badge */}
      {!loading && (
        <div className="flex items-center gap-2 mb-5">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl">
            <Users size={15} />
            {users.length} Total Users
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-lg">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search by name/email/phone"
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green-500 bg-white"
          />
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
          Filter
        </button>
        <button className="border border-gray-200 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition">
          Reset
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !users.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12 text-gray-400">
          No users found
        </div>
      ) : (
        <>
        {/* Desktop / tablet table */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                <th className="p-4 font-semibold text-xs uppercase tracking-wide">ID</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wide">Joining Date</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wide">Name</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wide">Email</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wide">Phone</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wide">Orders</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wide">Role</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-gray-50 hover:bg-gray-50 group transition"
                >
                  {/* ID */}
                  <td className="p-4 font-mono text-xs font-bold text-gray-500">
                    {shortId(u._id)}
                  </td>

                  {/* Joining Date */}
                  <td className="p-4 text-gray-500 text-xs">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Name with avatar */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          alt=""
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">
                        {u.name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-4 text-gray-400 text-xs">{u.email}</td>

                  {/* Phone */}
                  <td className="p-4 text-gray-500 text-xs">
                    {u.phone || <span className="text-gray-300">—</span>}
                  </td>

                  {/* Orders count */}
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                      {u.orderCount ?? 0}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    <select
                      value={u.role || "user"}
                      onChange={(e) => handleRole(u.email, e.target.value)}
                      disabled={u.email === me.email}
                      className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer font-semibold ${
                        u.role === "admin"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1 relative">
                      {/* View Orders button — visible on hover */}
                      <button
                        onClick={() =>
                          (window.location.href = `/panel/orders?user=${u.email}`)
                        }
                        className="hidden group-hover:flex items-center gap-1 absolute right-20 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition z-10 whitespace-nowrap"
                      >
                        View Order
                      </button>

                      <button
                        onClick={() =>
                          (window.location.href = `/panel/orders?user=${u.email}`)
                        }
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="View Orders"
                      >
                        <ZoomIn size={14} />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.email)}
                        disabled={u.email === me.email}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              {/* Top: avatar + name + role */}
              <div className="flex items-center gap-3">
                {u.photoURL ? (
                  <img
                    src={u.photoURL}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold flex-shrink-0">
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 truncate">
                    {u.name || "—"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <select
                  value={u.role || "user"}
                  onChange={(e) => handleRole(u.email, e.target.value)}
                  disabled={u.email === me.email}
                  className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer font-semibold flex-shrink-0 ${
                    u.role === "admin"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
                <div>
                  <span className="text-gray-400">ID</span>
                  <p className="font-mono font-bold text-gray-600">
                    {shortId(u._id)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Joined</span>
                  <p className="text-gray-600">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Phone</span>
                  <p className="text-gray-600">{u.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-400">Orders</span>
                  <p className="text-gray-600 font-semibold">
                    {u.orderCount ?? 0}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                <button
                  onClick={() =>
                    (window.location.href = `/panel/orders?user=${u.email}`)
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg py-2 transition"
                >
                  <ZoomIn size={14} /> View Orders
                </button>
                <button
                  onClick={() => handleDelete(u.email)}
                  disabled={u.email === me.email}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg py-2 px-4 disabled:opacity-30 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;