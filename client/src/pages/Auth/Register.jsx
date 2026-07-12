// src/pages/Auth/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxios";

const Register = () => {
  const { registerUser, updateUserProfile, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const axiosSecure = useAxiosSecure();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
  e.preventDefault();

  if (form.password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setLoading(true);

  try {
    const result = await registerUser(form.email, form.password);

    await updateUserProfile({ displayName: form.name });

    const userData = {
      name: form.name,
      email: form.email,
      role: "user",
      createdAt: new Date(),
    };

    await axiosSecure.post("/users", userData);

    toast.success("Welcome to Salam BD! 🕌");

    navigate("/");
  } catch (err) {
    toast.error(
      err.code === "auth/email-already-in-use"
        ? "Email already registered"
        : "Registration failed"
    );
  } finally {
    setLoading(false);
  }
};

 const handleGoogle = async () => {
  setLoading(true);

  try {
    const result = await signInGoogle();

    const user = {
      name: result.user.displayName,
      email: result.user.email,
      photo: result.user.photoURL,
      role: "user",
      createdAt: new Date(),
    };

    await axiosSecure.post("/users", user);

    toast.success("Signed in with Google!");

    navigate("/");
  } catch {
    toast.error("Google sign-in failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="py-10 bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-green-800">Salam BD</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 mb-5">
          {[
            {
              name: "name",
              type: "text",
              label: "Full Name",
              placeholder: "Your Name",
            },
            {
              name: "email",
              type: "email",
              label: "Email",
              placeholder: "your@email.com",
            },
            {
              name: "password",
              type: "password",
              label: "Password",
              placeholder: "Min. 6 characters",
            },
          ].map(({ name, type, label, placeholder }) => {
            const isPassword = name === "password";
            return (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <div className="relative">
                  <input
                    name={name}
                    type={isPassword && showPassword ? "text" : type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required
                    className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition ${
                      isPassword ? "pr-11" : ""
                    }`}
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold transition mt-1"
          >
            {loading ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
