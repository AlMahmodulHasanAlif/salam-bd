// src/components/FloatingActions.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ShoppingBag, MessageCircle, X, Phone } from "lucide-react";
import useCart from "../hooks/useCart";


// ── Config ─────────────────────────────────────────
const CONTACT = {
  messenger: "https://m.me/1785147118470415",
  whatsapp: "https://wa.me/8801860989372",
  phone: "tel:+8801700000000",
};

// ── Icons ──────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.494 2.027 7.808L0 32l8.418-2.006A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.851l-.486-.29-5 1.192 1.215-4.87-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.906c-.398-.2-2.355-1.162-2.72-1.294-.365-.133-.631-.2-.897.2-.265.398-1.03 1.294-1.263 1.56-.232.266-.465.3-.863.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.056-1.983-2.36-2.216-2.758-.232-.398-.025-.613.175-.811.179-.178.398-.465.598-.698.2-.232.265-.398.398-.664.133-.266.066-.498-.033-.698-.1-.2-.897-2.162-1.23-2.96-.324-.778-.653-.673-.897-.686l-.764-.013c-.266 0-.697.1-1.063.498-.365.398-1.395 1.362-1.395 3.323s1.428 3.855 1.627 4.121c.2.265 2.81 4.29 6.808 6.018.951.41 1.694.655 2.273.839.955.303 1.824.26 2.511.157.766-.114 2.355-.963 2.687-1.893.332-.93.332-1.728.232-1.893-.099-.166-.365-.266-.763-.465z" />
  </svg>
);

const MessengerIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
    <path d="M16 0C7.164 0 0 6.716 0 15.001c0 4.718 2.348 8.92 6.012 11.666V32l5.487-3.017C12.91 29.29 14.42 29.5 16 29.5c8.836 0 16-6.716 16-15C32 6.716 24.836 0 16 0zm1.586 20.217l-4.066-4.335-7.937 4.335 8.733-9.272 4.167 4.335 7.836-4.335-8.733 9.272z" />
  </svg>
);

// ── Floating Cart ──────────────────────────────────
const FloatingCart = ({ cartCount, cartTotal, onClick, bumping, flashing }) => {
  return (
    <div className="fixed hidden md:block right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end">
      
      {/* Cart Button */}
      <button
        onClick={onClick}
        className={`flex flex-col items-center bg-[#F28705] hover:bg-[#F2A71B] 
                   rounded-tl-2xl px-3 pt-3 pb-2.5
                   shadow-xl min-w-[68px] ${bumping ? "cart-bump" : ""}`}
      >
        <div className="relative mb-1">
          <ShoppingBag size={22} className="cart-icon text-white " />

          <span
            className="badge-count absolute -top-2 -right-2 bg-white text-green-700
                       text-[9px] font-black w-[18px] h-[18px] rounded-full
                       flex items-center justify-center"
          >
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        </div>

        <span className="text-white text-[11px] font-semibold ">
          {cartCount} Item{cartCount !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Price Strip (Always Visible) */}
      <button
        onClick={onClick}
        className={`font-extrabold text-xs
                   px-3 py-1.5 rounded-bl-2xl
                   shadow-lg border-t border-green-100
                   w-full text-center ${flashing ? "price-flash" : "bg-white text-green-700"}`}
      >
        ৳{(cartTotal || 0).toLocaleString()}
      </button>
    </div>
  );
};

// ── Animation styles ───────────────────────────────
const animationStyles = `
  @keyframes popUp {
    0% {
      opacity: 0;
      transform: scale(0.4) translateY(12px);
    }
    70% {
      transform: scale(1.1) translateY(-2px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .contact-btn {
    animation: popUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .contact-btn:nth-child(1) { animation-delay: 0.08s; }
  .contact-btn:nth-child(2) { animation-delay: 0.04s; }
  .contact-btn:nth-child(3) { animation-delay: 0s; }

  @keyframes cartBump {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.22) rotate(-8deg); }
    55%  { transform: scale(0.95) rotate(5deg); }
    75%  { transform: scale(1.08) rotate(-3deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  @keyframes badgePop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.6); }
    70%  { transform: scale(0.85); }
    100% { transform: scale(1); }
  }

  @keyframes priceFlash {
    0%   { background-color: white; color: #15803d; }
    40%  { background-color: #15803d; color: white; }
    100% { background-color: white; color: #15803d; }
  }

  .cart-bump .cart-icon   { animation: cartBump 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
  .cart-bump .badge-count { animation: badgePop 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
  .price-flash            { animation: priceFlash 0.5s ease both; }
`;

// ── Main Component ─────────────────────────────────
const FloatingActions = () => {
  const navigate = useNavigate();
  const { cartCount, cartTotal } = useCart();
  const [open, setOpen] = useState(false);
  const [bumping, setBumping] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setBumping(true);
      setFlashing(true);
      const t = setTimeout(() => {
        setBumping(false);
        setFlashing(false);
      }, 520);
      return () => clearTimeout(t);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <>
      <style>{animationStyles}</style>

      {/* Floating Cart */}
      <FloatingCart
        cartCount={cartCount || 0}
        cartTotal={cartTotal || 0}
        onClick={() => navigate("/cart")}
        bumping={bumping}
        flashing={flashing}
      />

      {/* Contact Buttons */}
      <div className="fixed mb-15 bottom-6 right-5 z-40 flex flex-col items-center gap-3">

        {open && (
          <>
            <a
              href={CONTACT.messenger}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600
                         flex items-center justify-center shadow-lg"
            >
              <MessengerIcon />
            </a>

            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#1ebe5d]
                         flex items-center justify-center shadow-lg"
            >
              <WhatsAppIcon />
            </a>

            <a
              href={CONTACT.phone}
              className="contact-btn w-12 h-12 rounded-full bg-green-700 hover:bg-green-800
                         flex items-center justify-center shadow-lg"
            >
              <Phone size={18} className="text-white" />
            </a>
          </>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="w-[52px] h-[52px] rounded-full bg-[#25D366] hover:bg-green-400
                     flex items-center justify-center shadow-xl"
        >
          {open ? (
            <X size={22} className="text-white" />
          ) : (
            <MessageCircle size={22} className="text-white" />
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingActions;