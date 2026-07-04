// src/pages/Home/Features.jsx
import React from "react";
import { BookOpenText, Truck, BadgeCheck, Banknote, Phone } from "lucide-react";

const FEATURES = [
  {
    icon: BookOpenText,
    text: "কুরআন ও সুন্নাহভিত্তিক পণ্য",
    // Animated shimmer gradient (slides on hover) — no CSS file needed
    bgClass:
      "bg-[linear-gradient(to_right,#e52d27_0%,#b31217_51%,#e52d27_100%)] bg-[length:200%_auto] bg-left hover:bg-right",
  },
  {
    icon: Truck,
    text: "সারা বাংলাদেশে দ্রুত ডেলিভারি",
    bgClass:
      "bg-[linear-gradient(to_right,#02AAB0_0%,#00CDAC_51%,#02AAB0_100%)] bg-[length:200%_auto] bg-left hover:bg-right",
  },
  {
    icon: BadgeCheck,
    text: "৬ মাস রিপ্লেসমেন্ট গ্যারান্টি",
    bgClass:
      "bg-[linear-gradient(to_right,#DA22FF_0%,#9733EE_51%,#DA22FF_100%)] bg-[length:200%_auto] bg-left hover:bg-right",
  },
  {
    icon: Banknote,
    text: "ক্যাশ অন ডেলিভারি (COD)",
    bgClass:
      "bg-[linear-gradient(to_right,#AA076B_0%,#61045F_51%,#AA076B_100%)] bg-[length:200%_auto] bg-left hover:bg-right",
  },
  {
    icon: Phone,
    text: "বিক্রয়-পরবর্তী সাপোর্ট",
    bgClass:
      "bg-[linear-gradient(to_right,#134E5E_0%,#71B280_51%,#134E5E_100%)] bg-[length:200%_auto] bg-left hover:bg-right",
  },
];

const Features = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50" />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#00AB3D]/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {FEATURES.map(({ icon: Icon, text, gradient, bgClass }) => (
            <div
              key={text}
              className={`group relative flex items-center gap-3 sm:gap-3.5 rounded-xl sm:rounded-2xl
                         border border-white/20 px-3.5 py-2.5 sm:px-4 sm:py-4 text-white
                         shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                         transition-all duration-500 hover:-translate-y-1
                         hover:shadow-[0_16px_40px_rgba(0,171,61,0.28)]
                         ${bgClass ? bgClass : `bg-gradient-to-br ${gradient}`}`}
            >
              {/* Icon chip */}
              <span
                className="relative shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm
                           flex items-center justify-center text-white
                           ring-1 ring-white/30
                           transition-transform duration-300 group-hover:scale-110"
              >
                <Icon size={18} strokeWidth={2.2} className="sm:hidden" />
                <Icon size={22} strokeWidth={2.2} className="hidden sm:block" />
              </span>

              <p className="text-sm font-semibold text-white leading-snug drop-shadow-sm">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
