// src/pages/Admin/AdminLayout.jsx
import React, { useState, Suspense } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import RouteFallback from "../../components/RouteFallback";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  TrendingUp,
  Image,
  BookOpen,
  Trophy,
  LifeBuoy,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const LINKS = [
  {
    to: "/panel",
    label: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    end: true,
  },
  { to: "/panel/products", label: "Products", icon: <Package size={22} /> },
  { to: "/panel/orders", label: "Orders", icon: <ShoppingBag size={22} /> },
  { to: "/panel/users", label: "Users", icon: <Users size={22} /> },
  { to: "/panel/profit", label: "Profit", icon: <TrendingUp size={22} /> },
  { to: "/panel/gallery", label: "Gallery", icon: <Image size={22} /> },
  { to: "/panel/blog", label: "Blog", icon: <BookOpen size={22} /> },
  {
    to: "/panel/pluginadmin",
    label: "Plugin Admin",
    icon: <BookOpen size={22} />,
  },
  {
    to: "/panel/competition",
    label: "মেধা যাচাই",
    icon: <Trophy size={22} />,
  },
  {
    to: "/panel/support",
    label: "গ্যারান্টি সাপোর্ট",
    icon: <LifeBuoy size={22} />,
  },
];

const AdminLayout = () => {
  const { logOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const lStyle = ({ isActive }) =>
    `flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-base font-medium transition ${
      isActive
        ? "bg-green-700 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 lg:static ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b border-gray-100">
          <p className="font-bold text-green-800 text-xl">Salam BD</p>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {LINKS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={lStyle}
              onClick={() => setOpen(false)}
            >
              {icon} {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={async () => {
              await logOut();
              navigate("/");
            }}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-base text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 lg:hidden">
          <button onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <p className="font-bold text-green-800">Admin Panel</p>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
