// src/components/BottomNav.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router";
import { Home, ClipboardList, ShoppingCart, User } from "lucide-react";
import useCart from "../hooks/useCart";
import useAuth from "../hooks/useAuth";

const BottomNav = () => {
  const { cartCount } = useCart();
  const { user } = useAuth();

  // Account tab lands on the dashboard when signed in, otherwise the login page.
  const accountTo = user ? "/dashboard" : "/login";

  const linkStyle = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors ${
      isActive ? "text-green-700" : "text-gray-500 hover:text-green-700"
    }`;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">

        <NavLink to="/" end className={linkStyle}>
          <Home size={22} strokeWidth={1.8} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/orders" className={linkStyle}>
          <ClipboardList size={22} strokeWidth={1.8} />
          <span>Orders</span>
        </NavLink>

        <NavLink to="/cart" className={linkStyle}>
          {({ isActive }) => (
            <>
              <div className="relative">
                <ShoppingCart size={22} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-green-700 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className={isActive ? "text-green-700" : "text-gray-500"}>Cart</span>
            </>
          )}
        </NavLink>

        <NavLink to={accountTo} className={linkStyle}>
          <User size={22} strokeWidth={1.8} />
          <span>Account</span>
        </NavLink>

      </div>
    </nav>
  );
};

export default BottomNav;