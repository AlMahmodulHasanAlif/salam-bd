// src/pages/Auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const Login = () => {
  const { signInUser, signInGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resetMode, setReset] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInUser(form.email, form.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Sign-in failed:", err.code, err.message);
      toast.error(
        err.code === "auth/operation-not-allowed"
          ? "Email/Password sign-in is not enabled in Firebase"
          : "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInGoogle();
      toast.success("Signed in with Google!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google sign-in failed:", err.code, err.message);
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error("Enter your email first");
      return;
    }
    try {
      await resetPassword(form.email);
      toast.success("Reset email sent!");
      setReset(false);
    } catch {
      toast.error("Failed to send reset email");
    }
  };

  return (
    <div className=" bg-gray-50 px-4 flex justify-center py-10 bg-green-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 ">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-green-800">Salam BD</h1>
          <p className="text-gray-400 text-sm mt-1">
            {resetMode ? "Reset your password" : "Sign in to your account"}
          </p>
        </div>

        {resetMode ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2.5 rounded-xl font-semibold hover:bg-green-800 transition"
            >
              Send Reset Email
            </button>
            <button
              type="button"
              onClick={() => setReset(false)}
              className="w-full text-sm text-gray-400 hover:text-green-700 transition"
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setReset(true)}
                  className="text-xs text-green-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold transition"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
                alt=""
              />
              Continue with Google
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
  );
};

export default Login;
