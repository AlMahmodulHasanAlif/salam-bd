import React, { useState } from "react";
import { NavLink } from "react-router";

const Navbar = () => {
  const [kidsOpen, setKidsOpen] = useState(false);

  const linkStyle = ({ isActive }) =>
    `px-4 py-2 rounded-md transition-all duration-200 ${
      isActive ? "bg-white text-primary" : "hover:bg-white hover:text-primary"
    }`;

  const kidsLinkStyle = ({ isActive }) =>
    `flex items-center gap-1 px-4 py-2 rounded-md transition-all duration-200 ${
      isActive ? "bg-white text-primary" : "hover:bg-white hover:text-primary"
    }`;

  const subLinkStyle = ({ isActive }) =>
    `block px-4 py-2 text-sm transition-all duration-200 ${
      isActive
        ? "bg-primary text-white"
        : "text-gray-800 hover:bg-primary hover:text-white"
    }`;

  return (
    // 👇 Hidden on mobile, visible on md and larger screens
    <div className="hidden md:block bg-primary-dark text-white">
      <div className="flex justify-center">
        <div className="px-6 py-3 flex items-center gap-3 text-[1rem] font-medium">
          <NavLink to="/" end className={linkStyle}>
            Home
          </NavLink>

          <NavLink to="/books" className={linkStyle}>
            Islamic Books
          </NavLink>

          <NavLink to="/wallframe" className={linkStyle}>
            WallFrame
          </NavLink>
          <NavLink to="/Islamic-Products" className={linkStyle}>
            Islamic Products
          </NavLink>

          <NavLink to="/attar" className={linkStyle}>
            Attar/Perfume
          </NavLink>
          {/* <NavLink to="/gallery" className={linkStyle}>
            Gallery
          </NavLink> */}

          {/* Kids Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setKidsOpen(true)}
            onMouseLeave={() => setKidsOpen(false)}
          >
            {/* <NavLink to="/kids" className={kidsLinkStyle}>
              Kids Item
              <svg
                className={`w-3 h-3 mt-0.5 transition-transform duration-200 ${
                  kidsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </NavLink> */}

            {/* <div
              className={`absolute left-0 top-full mt-1 w-40 bg-white text-gray-800 rounded-md shadow-lg z-50 transition-all duration-200 ${
                kidsOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-1"
              }`}
            >
              <NavLink to="/kids/toys" className={subLinkStyle}>
                Toys
              </NavLink>
              <NavLink to="/kids/clothes" className={subLinkStyle}>
                Clothes
              </NavLink>
              <NavLink to="/kids/books" className={subLinkStyle}>
                Books
              </NavLink>
            </div> */}
          </div>

          {/* <NavLink to="/hajj-item" className={linkStyle}>
            Hajj Item
          </NavLink> */}
          <NavLink to="/blog" className={linkStyle}>
            Blog
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
