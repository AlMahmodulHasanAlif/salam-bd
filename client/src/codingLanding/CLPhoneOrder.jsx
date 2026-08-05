import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export default function CLPhoneOrder() {
  return (
    <section className="bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative w-full overflow-hidden border-y border-emerald-200"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#10b98115_0%,_transparent_65%)]" />

        {/* Content row */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-5 px-6">
          <span className="text-emerald-600 text-sm font-semibold tracking-widest uppercase whitespace-nowrap">
            ফোনে অর্ডার করুন
          </span>

          <a
            href="tel:01886699883"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-emerald-900/20 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            <Phone size={16} strokeWidth={2.5} />
            <span>01886699883</span>
          </a>

          <div className="hidden sm:block w-px h-6 bg-emerald-200" />

          <div className="flex items-baseline gap-2">
            <span className="text-slate-400 text-sm whitespace-nowrap">মূল্য</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 whitespace-nowrap">
              ৳১৫০০/=
            </span>
            <span className="text-slate-400 text-sm whitespace-nowrap">
              টাকা মাত্র
            </span>
          </div>
        </div>

        {/* glow lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      </motion.div>
    </section>
  );
}
