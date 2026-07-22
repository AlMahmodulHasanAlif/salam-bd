// src/pages/Auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

// Firebase auth calls normally settle in well under a second, but a blocked
// network, an ad-blocker sitting on identitytoolkit, or App Check can leave the
// promise pending indefinitely — which is what made the button spin forever.
// Racing every auth call against a timeout guarantees the UI always recovers.
const AUTH_TIMEOUT_MS = 20000;
const withTimeout = (promise, ms = AUTH_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject({ code: "app/timeout" }), ms),
    ),
  ]);

// Map raw Firebase error codes to friendly, professional copy.
const messageForError = (err) => {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
    case "app/timeout":
      return "Network problem — check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is currently disabled.";
    case "auth/popup-blocked":
      return "Popup blocked. Allow popups for this site and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
};

const Login = () => {
  const { signInUser, signInGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMode, setReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const busy = loading || googleLoading || resetLoading;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError(""); // clear stale error as soon as the user edits
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (busy) return; // guard against double-submit
    setError("");
    setLoading(true);
    try {
      await withTimeout(signInUser(form.email.trim(), form.password));
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Sign-in failed:", err?.code, err?.message);
      const msg = messageForError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false); // ALWAYS reset — the button can never stay stuck
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setError("");
    setGoogleLoading(true);
    try {
      await withTimeout(signInGoogle());
      toast.success("Signed in with Google!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google sign-in failed:", err?.code, err?.message);
      // User simply dismissed the popup — not an error worth shouting about.
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      const msg = messageForError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!form.email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setError("");
    setResetLoading(true);
    try {
      await withTimeout(resetPassword(form.email.trim()));
      toast.success("Password reset email sent!");
      setReset(false);
    } catch (err) {
      console.error("Reset failed:", err?.code, err?.message);
      const msg =
        err?.code === "auth/user-not-found"
          ? "No account found with that email."
          : messageForError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setResetLoading(false);
    }
  };

  const inputWrap =
    "relative flex items-center rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-green-600/20";
  const inputBox =
    "w-full bg-transparent py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-green-900/5 border border-gray-100 p-7 sm:p-9">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-green-700 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">Salam BD</h1>
            <p className="text-gray-400 text-sm mt-1">
              {resetMode
                ? "Reset your password"
                : "Sign in to continue to your account"}
            </p>
          </div>

          {/* Inline error banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetMode ? (
            /* ── Reset password ── */
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div
                  className={`${inputWrap} ${
                    error ? "border-red-300" : "border-gray-300 focus-within:border-green-600"
                  }`}
                >
                  <Mail className="absolute left-3.5 w-4.5 h-4.5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className={inputBox}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 disabled:bg-green-700/60 disabled:cursor-not-allowed transition"
              >
                {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {resetLoading ? "Sending…" : "Send Reset Email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReset(false);
                  setError("");
                }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-green-700 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </form>
          ) : (
            /* ── Sign in ── */
            <>
              <form onSubmit={handleLogin} className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div
                    className={`${inputWrap} ${
                      error ? "border-red-300" : "border-gray-300 focus-within:border-green-600"
                    }`}
                  >
                    <Mail className="absolute left-3.5 w-4.5 h-4.5 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                      className={inputBox}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div
                    className={`${inputWrap} ${
                      error ? "border-red-300" : "border-gray-300 focus-within:border-green-600"
                    }`}
                  >
                    <Lock className="absolute left-3.5 w-4.5 h-4.5 text-gray-400" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className={`${inputBox} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setReset(true);
                      setError("");
                    }}
                    className="text-xs font-medium text-green-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-700/60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <button
                onClick={handleGoogle}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="w-5 h-5"
                    alt=""
                  />
                )}
                {googleLoading ? "Please wait…" : "Continue with Google"}
              </button>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-green-700 font-semibold hover:underline"
                >
                  Register
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
