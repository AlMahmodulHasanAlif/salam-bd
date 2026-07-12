// src/components/Topbar.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  Menu,
  X,
  ChevronRight,
  Baby,
  UserPlus,
  Home,
  BookOpen,
  Image,
  Sparkles,
  Star,
  Shirt,
  Blocks,
  Youtube,
  Info,
  Phone,
  Package,
} from "lucide-react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router";
import { searchProducts } from "../api/productApi";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import logo from "../assets/SalamBDLogo.png";
import logoTrim from "../assets/logo-trim.png";
import toast from "react-hot-toast";
import { GTM } from "../utils/gtm";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/salam.com3", icon: FaFacebookF },
  { label: "YouTube", href: "https://www.youtube.com/@Salambdofficial", icon: FaYoutube },
  { label: "Instagram", href: "https://www.instagram.com/", icon: FaInstagram },
  { label: "WhatsApp", href: "https://wa.me/+8801886699883", icon: FaWhatsapp },
];

const NAV_LINKS = [
  { label: "Home", to: "/", end: true, icon: Home },
  { label: "All Products", to: "/products", icon: Package },
  { label: "Gallery", to: "/gallery", icon: Image },
  {
    label: "Video",
    to: "https://www.youtube.com/quraneralotv",
    icon: Youtube,
    external: true,
  },
  { label: "Blog", to: "/blog", icon: BookOpen },
  { label: "About Us", to: "/about", icon: Info },
  { label: "Contacts", to: "/contact", icon: Phone },
];

// const KIDS_SUB = [
//   { label: "Toys",    to: "/kids/toys",    icon: Blocks },
//   { label: "Clothes", to: "/kids/clothes", icon: Shirt  },
//   { label: "Books",   to: "/kids/books",   icon: BookOpen },
// ];

const Topbar = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const { cartCount } = useCart();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [kidsOpen, setKidsOpen] = useState(false);

  const searchRef = useRef(null);
  const userRef = useRef(null);
  const menuRef = useRef(null);
  const modalInputRef = useRef(null);
  const debounce = useRef(null);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setResults([]);
      setShowDrop(false);
      return;
    }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchProducts(query);
        const data = res.data || [];
        setResults(data);
        setShowDrop(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 380);
    return () => clearTimeout(debounce.current);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowDrop(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setShowUser(false);
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchModalOpen]);

  useEffect(() => {
    if (searchModalOpen && modalInputRef.current) {
      setTimeout(() => modalInputRef.current?.focus(), 50);
    }
    if (!searchModalOpen) {
      setQuery("");
      setResults([]);
      setShowDrop(false);
    }
  }, [searchModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    GTM.search(trimmedQuery);

    setShowDrop(false);
    setSearchModalOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handlePick = (product) => {
    setShowDrop(false);
    setQuery("");
    setSearchModalOpen(false);
    // Product route is /product/:slug — navigate by slug (fall back to _id)
    navigate(`/product/${product.slug || product._id}`);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setShowUser(false);
      toast.success("Logout successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to logout!");
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const openSearchModal = () => {
    setSearchModalOpen(true);
    setMenuOpen(false);
  };

  const closeSearchModal = () => {
    setSearchModalOpen(false);
  };

  const mobileNavLink = ({ isActive }) =>
    `flex items-center w-full px-5 py-3.5 text-[15px] font-medium border-b border-gray-100 transition-colors ${
      isActive ? "text-green-700 bg-green-50" : "text-gray-800 hover:bg-gray-50"
    }`;

  return (
    <>
      <div
        className={`bg-white shadow-sm sticky top-0 ${
          showUser ? "z-[60]" : "z-50"
        }`}
      >
        {/* ══ MOBILE top strip ══ */}
        <div className="md:hidden bg-gradient-to-r from-green-600 via-green-800 to-green-900 text-white px-4 py-2">
          <p className="text-center text-[13px] font-semibold tracking-wide">
            Welcome To Salam BD
          </p>
        </div>

        {/* ══ MOBILE navbar: logo + hamburger ══ */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white">
          <img
            src={logoTrim}
            alt="Salam BD"
            className="h-10 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <button
            onClick={() => {
              setMenuOpen(true);
              setSearchModalOpen(false);
            }}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* ══ DESKTOP top strip ══ */}
        <div className="hidden md:block bg-gradient-to-r from-green-600 via-green-800 to-green-900 text-white">
          <div className="max-w-screen-2xl mx-auto px-6 py-2 flex items-center justify-between text-[13px]">
            {/* Welcome greeting — left */}
            <p className="font-semibold tracking-wide">Welcome To Salam BD</p>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Social icons */}
              <div className="flex items-center gap-1.5">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition"
                  >
                    <Icon size={13} />
                  </a>
                ))}
              </div>

              {user ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUser(!showUser)}
                    className="flex items-center gap-2 text-white hover:text-green-200 transition"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-white/40"
                        alt=""
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold">
                        {user.displayName?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium max-w-[90px] truncate">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${showUser ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showUser && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden text-gray-700">
                      <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.displayName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/dashboard");
                          setShowUser(false);
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <LayoutDashboard size={15} className="text-green-700" />{" "}
                        My Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate("/orders");
                          setShowUser(false);
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <ClipboardList size={15} className="text-green-700" /> My
                        Orders
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1.5 text-white hover:text-green-200 transition font-medium"
                >
                  <User size={15} /> My Account
                </button>
              )}

              <button
                onClick={() => navigate("/cart")}
                className="relative text-white hover:text-green-200 transition"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-green-800 text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FULL-SCREEN SEARCH MODAL
      ══════════════════════════════════════════ */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeSearchModal}
          />
          <div className="relative z-10 bg-white w-full shadow-xl animate-slideDown">
            <div className="flex items-center justify-between px-4 py-1 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-800">
                Search Products
              </h2>
              <button
                onClick={closeSearchModal}
                className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-600 transition flex items-center justify-center text-red-400"
                aria-label="Close search"
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-4 py-3">
              <form
                onSubmit={handleSubmit}
                className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-green-600 transition shadow-sm"
              >
                <input
                  ref={modalInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search in..."
                  className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 transition px-4 flex items-center justify-center text-white shrink-0"
                >
                  <Search size={17} />
                </button>
              </form>
            </div>
            {(searching ||
              results.length > 0 ||
              (query.trim().length >= 2 && !searching)) && (
              <div className="max-h-[60vh] overflow-y-auto border-t border-gray-100">
                {searching ? (
                  <div className="flex items-center gap-3 px-4 py-4">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Searching...</p>
                  </div>
                ) : results.length === 0 && query.trim().length >= 2 ? (
                  <p className="px-4 py-4 text-sm text-gray-400">
                    No results found for &quot;{query}&quot;
                  </p>
                ) : (
                  results.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handlePick(p)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer transition border-b border-gray-50 last:border-0"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-green-700 font-semibold mt-0.5">
                          ৳{p.price}
                        </p>
                      </div>
                      <ChevronRight
                        size={15}
                        className="text-gray-300 shrink-0"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] flex items-center justify-around">
        <NavLink
          to="/"
          end
          onClick={() => {
            setSearchModalOpen(false);
            setMenuOpen(false);
          }}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 transition ${isActive ? "text-white" : "text-white"}`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[11px]">HOME</span>
        </NavLink>

        <button
          onClick={() => {
            setMenuOpen(true);
            setSearchModalOpen(false);
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-white transition"
        >
          <Menu size={17} />
          <span className="text-[11px]">MENU</span>
        </button>

        <button
          onClick={() => {
            navigate("/cart");
            setSearchModalOpen(false);
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-white transition"
        >
          <div className="relative">
            <ShoppingCart size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-green-700 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">CART</span>
        </button>

        <button
          onClick={openSearchModal}
          className="flex flex-col items-center gap-0.5 p-2 text-white hover:text-green-700 transition"
          aria-label="Search"
        >
          <Search size={17} />
          <span className="text-[11px]">SEARCH</span>
        </button>

        <button
          onClick={() => {
            user ? navigate("/dashboard") : navigate("/login");
            setSearchModalOpen(false);
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-white hover:text-green-700 transition"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              className="w-6 h-6 rounded-full object-cover"
              alt=""
            />
          ) : (
            <User size={17} />
          )}
          <span className="text-[12px]">ACCOUNT</span>
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />

        <div
          ref={menuRef}
          className={`absolute top-0 left-0 h-full w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex bg-green-800 items-center justify-between px-4 py-3 border-b border-gray-100">
            <img
              src={logo}
              alt="Salam BD"
              className="h-10 mx-auto md:mx-0"
            />
            <button
              onClick={closeMenu}
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <X size={22} />
            </button>
          </div>

          {user && (
            <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-green-200"
                  alt=""
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {user.displayName?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user.displayName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto">
            <p className="px-5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 ">
              Menu
            </p>

            {NAV_LINKS.map(({ label, to, end, icon: Icon, external }) =>
              external ? (
                <a
                  key={label}
                  href={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex items-center w-full px-5 py-3.5 text-[15px] font-medium border-b border-gray-100 text-gray-800 hover:bg-gray-50 transition"
                >
                  {Icon && <Icon size={17} className="mr-3 text-green-700" />}{" "}
                  {label}
                </a>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={mobileNavLink}
                  onClick={closeMenu}
                >
                  {Icon && <Icon size={17} className="mr-3 text-green-700" />}{" "}
                  {label}
                </NavLink>
              ),
            )}

            {/* <button
              onClick={() => setKidsOpen((p) => !p)}
              className="flex items-center justify-between w-full px-5 py-3.5 text-[15px] font-medium border-b border-gray-100 text-gray-800 hover:bg-gray-50 transition"
            >
              <span className="flex items-center gap-3">
                <Baby size={17} className="text-green-700" /> Kids Item
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${kidsOpen ? "rotate-180" : ""}`}
              />
            </button> */}
            {kidsOpen && (
              <div className="bg-gray-50 border-b border-gray-100">
                {KIDS_SUB.map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-8 py-3 text-sm border-b border-gray-100 last:border-0 transition ${
                        isActive
                          ? "text-green-700 font-semibold"
                          : "text-gray-600 hover:text-green-700"
                      }`
                    }
                  >
                    {Icon ? (
                      <Icon size={14} className="opacity-60" />
                    ) : (
                      <ChevronRight size={13} className="opacity-40" />
                    )}{" "}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            <p className="px-5 pt-4 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 ">
              Account
            </p>
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    closeMenu();
                  }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-[15px] font-medium border-b border-gray-100 text-gray-800 hover:bg-gray-50 transition"
                >
                  <LayoutDashboard size={17} className="text-green-700" /> My
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate("/orders");
                    closeMenu();
                  }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-[15px] font-medium border-b border-gray-100 text-gray-800 hover:bg-gray-50 transition"
                >
                  <ClipboardList size={17} className="text-green-700" /> My
                  Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-[15px] font-medium border-b border-gray-100 text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut size={17} /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  closeMenu();
                }}
                className="flex items-center gap-1.5 w-full px-5 py-3.5 text-[15px] font-medium border-b border-gray-100 text-green-800 hover:text-green-700 transition"
              >
                <LogIn size={17} /> Sign In
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default Topbar;
