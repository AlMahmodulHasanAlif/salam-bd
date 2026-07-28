// src/pages/Dashboard/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getUserOrders } from "../../api/orderApi";
import { getMyProfile, updateMyProfile, uploadAvatar } from "../../api/userApi";
import { compressImage } from "../../utils/compressImage";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxios";
import { DISTRICTS, BD_LOCATIONS } from "../../utils/bdLocations";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Package,
  ArrowRight,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Pencil,
  MapPin,
  Camera,
} from "lucide-react";

// Maps the noisy Firebase auth error codes to something a customer can act on.
const passwordErrorMessage = (err) => {
  switch (err?.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect.";
    case "auth/weak-password":
      return "New password is too weak (use at least 6 characters).";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again in a few minutes.";
    case "auth/requires-recent-login":
      return "Please sign out and sign in again, then retry.";
    default:
      return err?.message || "Could not change password. Please try again.";
  }
};

// A single password field with a show/hide toggle.
const PasswordField = ({ label, value, onChange, show, onToggle, autoFocus }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm outline-none focus:border-green-400"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const ChangePasswordModal = ({ onClose }) => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);

  const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (next.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (next === current) {
      toast.error("New password must be different from the current one.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(current, next);
      toast.success("Password changed successfully.");
      onClose();
    } catch (err) {
      toast.error(passwordErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {/* Deliberately no backdrop click-to-close — the user must use the X or
          submit, so a stray outside click can't discard a half-typed password. */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-gray-800">
            <KeyRound size={16} className="text-green-700" /> Change Password
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <PasswordField
            label="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            show={show.current}
            onToggle={() => toggle("current")}
            autoFocus
          />
          <PasswordField
            label="New password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            show={show.next}
            onToggle={() => toggle("next")}
          />
          <PasswordField
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            show={show.confirm}
            onToggle={() => toggle("confirm")}
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-green-700 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

const STATUS_STYLE = {
  Pending:    { color: "bg-yellow-100 text-yellow-700", icon: <Clock size={13} /> },
  Processing: { color: "bg-blue-100 text-blue-700",    icon: <Package size={13} /> },
  Shipped:    { color: "bg-purple-100 text-purple-700", icon: <Truck size={13} /> },
  Delivered:  { color: "bg-green-100 text-green-700",  icon: <CheckCircle size={13} /> },
};

// ── Edit profile (display name + avatar) ─────────────────────────────────────
const EditProfileModal = ({ axiosSecure, user, onClose, onSaved }) => {
  const { updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(user?.photoURL || "");
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    // Compress in the browser so the avatar is always ≤ 50 KB — the user can
    // pick a full-size phone photo and it just works.
    setProcessing(true);
    try {
      const compressed = await compressImage(file, { maxBytes: 50 * 1024 });
      setPhotoFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (err) {
      toast.error(err?.message || "Could not process that image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      let photoURL = user?.photoURL || "";
      if (photoFile) {
        const { data } = await uploadAvatar(axiosSecure, photoFile);
        photoURL = data.url;
      }

      // Firebase profile (drives the avatar/name shown across the app) …
      await updateUserProfile({ displayName: name.trim(), photoURL });
      // … and the backend user document (source of truth for admin views).
      await updateMyProfile(axiosSecure, user.email, {
        name: name.trim(),
        photoURL,
      });

      toast.success("Profile updated.");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {/* No backdrop click-to-close — dismiss via the X or submit only. */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-gray-800">
            <Pencil size={16} className="text-green-700" /> Edit Profile
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar picker */}
          <div className="flex flex-col items-center">
            <label className="relative cursor-pointer group">
              {preview ? (
                <img
                  src={preview}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-green-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl font-bold">
                  {(name || user?.email || "?")[0]?.toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 bg-green-700 text-white rounded-full p-1.5 shadow group-hover:bg-green-800">
                <Camera size={12} />
              </span>
              <input type="file" accept="image/*" onChange={handlePick} className="hidden" />
            </label>
            <p className="text-[11px] text-gray-400 mt-2">
              {processing
                ? "Optimizing image…"
                : photoFile
                  ? `Ready · ${(photoFile.size / 1024).toFixed(0)} KB`
                  : "Tap the camera to change photo (auto-compressed to ≤ 50 KB)"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400"
              placeholder="Your name"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || processing}
            className="w-full rounded-xl bg-green-700 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {submitting ? "Saving…" : processing ? "Processing…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Saved shipping address (auto-fills checkout) ─────────────────────────────
const emptyAddress = { name: "", phone: "", address: "", district: "", thana: "" };

const SavedAddressModal = ({ axiosSecure, user, initial, onClose, onSaved }) => {
  const [addr, setAddr] = useState({ ...emptyAddress, ...(initial || {}) });
  const [submitting, setSubmitting] = useState(false);
  const thanas = addr.district ? BD_LOCATIONS[addr.district] || [] : [];

  const set = (key, value) =>
    setAddr((a) =>
      key === "district" ? { ...a, district: value, thana: "" } : { ...a, [key]: value },
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !addr.name.trim() ||
      !addr.phone.trim() ||
      !addr.address.trim() ||
      !addr.district ||
      !addr.thana
    ) {
      toast.error("Please fill in every field.");
      return;
    }

    setSubmitting(true);
    try {
      await updateMyProfile(axiosSecure, user.email, {
        shippingAddress: addr,
        phone: addr.phone.trim(),
      });
      toast.success("Address saved.");
      onSaved?.(addr);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {/* No backdrop click-to-close — dismiss via the X or submit only. */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-gray-800">
            <MapPin size={16} className="text-green-700" /> Saved Address
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={addr.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Full name" />
          <input value={addr.phone} onChange={(e) => set("phone", e.target.value.replace(/[^\d+]/g, ""))} className={inputCls} placeholder="Phone" />
          <input value={addr.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder="Detailed address" />
          <select value={addr.district} onChange={(e) => set("district", e.target.value)} className={inputCls}>
            <option value="">Select district</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={addr.thana} onChange={(e) => set("thana", e.target.value)} disabled={!addr.district} className={inputCls}>
            <option value="">{addr.district ? "Select thana" : "Select district first"}</option>
            {thanas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-green-700 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const navigate    = useNavigate();
  const { user, logOut, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPwModal, setShowPwModal]     = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [savedAddress, setSavedAddress]   = useState(null);
  // Bumped after a profile edit so the card re-reads the (mutated) Firebase user.
  const [, setProfileVersion] = useState(0);

  // Only email/password accounts can change a password here. Google-only users
  // have no password credential — their password is managed by Google.
  const hasPasswordLogin = user?.providerData?.some(
    (p) => p.providerId === "password",
  );

  useEffect(() => {
    if (authLoading || !user?.email) return;
    getUserOrders(axiosSecure, user.email)
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading]);

  // Load the saved shipping address (if any) for the "Saved Address" modal.
  useEffect(() => {
    if (authLoading || !user?.email) return;
    getMyProfile(axiosSecure, user.email)
      .then((res) => setSavedAddress(res.data?.shippingAddress || null))
      .catch(() => setSavedAddress(null));
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

          <div className="w-full border-t border-gray-100 pt-4 space-y-3">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-green-700 transition group"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={14} /> My Orders
              </span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-green-700 transition group"
            >
              <span className="flex items-center gap-2">
                <Pencil size={14} /> Edit Profile
              </span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowAddrModal(true)}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-green-700 transition group"
            >
              <span className="flex items-center gap-2">
                <MapPin size={14} /> {savedAddress ? "Saved Address" : "Add Address"}
              </span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {hasPasswordLogin ? (
              <button
                onClick={() => setShowPwModal(true)}
                className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-green-700 transition group"
              >
                <span className="flex items-center gap-2">
                  <KeyRound size={14} /> Change Password
                </span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <p className="text-xs text-gray-400 text-left">
                Signed in with Google — password managed by your Google account.
              </p>
            )}
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

      {showPwModal && (
        <ChangePasswordModal onClose={() => setShowPwModal(false)} />
      )}

      {showEditModal && (
        <EditProfileModal
          axiosSecure={axiosSecure}
          user={user}
          onClose={() => setShowEditModal(false)}
          onSaved={() => setProfileVersion((v) => v + 1)}
        />
      )}

      {showAddrModal && (
        <SavedAddressModal
          axiosSecure={axiosSecure}
          user={user}
          initial={savedAddress}
          onClose={() => setShowAddrModal(false)}
          onSaved={(addr) => setSavedAddress(addr)}
        />
      )}
    </div>
  );
};

export default UserDashboard;