import React, { useState } from "react";
import { NavLink } from "react-router";
import { ChevronDown } from "lucide-react";
import logo from "../assets/logo-trim.png";

const MEDIA_LINKS = [
  { label: "Gallery", to: "/gallery" },
  { label: "Video", to: "", external: true },
];

const Navbar = () => {
  // which dropdown is open: "products" | "media" | null
  const [openMenu, setOpenMenu] = useState(null);

  const linkStyle = ({ isActive }) =>
    `px-4 py-2 rounded-md text-[15px] font-medium uppercase tracking-wide transition-all duration-200 ${
      isActive
        ? "bg-[#00AB3D] text-white"
        : "text-gray-700 hover:bg-[#00AB3D] hover:text-white"
    }`;

  const dropTrigger = (isOpen) =>
    `flex items-center gap-1 px-4 py-2 rounded-md text-[15px] font-medium uppercase tracking-wide cursor-pointer transition-all duration-200 ${
      isOpen
        ? "bg-[#00AB3D] text-white"
        : "text-gray-700 hover:bg-[#00AB3D] hover:text-white"
    }`;

  const subBase =
    "block px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-gray-700 hover:bg-[#00AB3D] hover:text-white transition-colors";

  const subLinkStyle = ({ isActive }) =>
    isActive
      ? "block px-4 py-2.5 text-sm font-medium uppercase tracking-wide bg-[#00AB3D] text-white"
      : subBase;

  const dropdownPanel = (isOpen) =>
    `absolute right-0 top-full w-48 bg-white rounded-md shadow-lg border border-gray-100 z-50 overflow-hidden transition-all duration-200 ${
      isOpen
        ? "opacity-100 visible translate-y-0"
        : "opacity-0 invisible -translate-y-1"
    }`;

  return (
    // 👇 Hidden on mobile (handled by Topbar drawer), visible on md and up
    <div className="hidden md:block bg-white border-b border-gray-200 shadow-md">
      <div className="max-w-screen-2xl mx-auto px-6 flex items-center justify-between py-5">
        {/* Logo — left */}
        <NavLink to="/" className="shrink-0">
          <img src={logo} alt="Salam BD" className="h-14" />
        </NavLink>

        {/* Nav — right */}
        <nav className="flex items-center gap-1 py-3">
          <NavLink to="/" end className={linkStyle}>
            Home
          </NavLink>

          {/* All Products */}
          <NavLink to="/products" className={linkStyle}>
            All Products
          </NavLink>

          {/* Media dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("media")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <div className={dropTrigger(openMenu === "media")}>
              Media
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  openMenu === "media" ? "rotate-180" : ""
                }`}
              />
            </div>
            <div className={dropdownPanel(openMenu === "media")}>
              {MEDIA_LINKS.map(({ label, to, external }) =>
                external ? (
                  <a
                    key={label}
                    href={to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={subBase}
                  >
                    {label}
                  </a>
                ) : (
                  <NavLink key={label} to={to} className={subLinkStyle}>
                    {label}
                  </NavLink>
                ),
              )}
            </div>
          </div>

          <NavLink to="/blog" className={linkStyle}>
            Blog
          </NavLink>
          <NavLink to="/about" className={linkStyle}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={linkStyle}>
            Contacts
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
