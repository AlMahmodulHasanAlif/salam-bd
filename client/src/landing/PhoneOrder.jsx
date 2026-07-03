import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export default function PhoneOrder() {
  return (
    <section className="bg-[#0d0d0d]">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative w-full overflow-hidden border-y border-emerald-900/40"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060e08] via-[#0e1f12] to-[#060e08]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a4a2230_0%,_transparent_65%)]" />

        {/* Vertical stripes */}
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-emerald-900/15"
            style={{ left: `${i * 7.5}%` }}
          />
        ))}

        {/* Content row */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-5 px-6">
          {/* Label */}
          <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase whitespace-nowrap">
            ফোনে অর্ডার করুন
          </span>

          {/* Phone button */}
          <a
            href="tel:01860989372"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-emerald-900/50 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            <Phone size={16} strokeWidth={2.5} />
            <span>018-609-89372</span>
          </a>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-emerald-900/60" />

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 text-sm whitespace-nowrap">
              হাদিয়া
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300 whitespace-nowrap">
              ৯৯০/=
            </span>
            <span className="text-gray-400 text-sm whitespace-nowrap">
              টাকা মাত্র
            </span>
          </div>
        </div>

        {/* Top & bottom glow lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-600/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-600/40 to-transparent" />
      </motion.div>
    </section>
  );
}
