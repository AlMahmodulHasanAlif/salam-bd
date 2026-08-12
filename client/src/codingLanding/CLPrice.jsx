import { motion } from "framer-motion";

const scrollToOrder = () =>
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });

export default function CLPrice() {
  return (
    <section className="bg-gradient-to-b from-white to-emerald-50/70 py-5 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 border border-emerald-700/50 rounded-3xl px-6 py-10 md:px-10 md:py-12 shadow-xl shadow-emerald-900/30 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-amber-400/20 blur-2xl" />

          <div className="relative">
            <p className="text-xl md:text-3xl font-black text-emerald-100 tracking-wide mb-4">
              জাফর সাদেক ও গাজী আনাস রোশনের আবিষ্কৃত
            </p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 text-white text-3xl md:text-5xl font-black px-10 md:px-14 py-4 md:py-6 rounded-full shadow-xl shadow-emerald-900/50 border-2 border-emerald-300/50 mb-3 cursor-pointer"
            >
              <span className="text-2xl md:text-4xl">📘</span>
              Salam Coding Book
            </motion.button>
            <p className="text-xl md:text-3xl font-extrabold text-emerald-50 max-w-3xl mx-auto mb-5">
              দুই থেকে ছয় বছরের শিশুদের চমৎকার শিক্ষনীয় ডিভাইস
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm md:text-base font-bold px-5 py-2 rounded-full shadow-md shadow-amber-200/60">
              🔥 এখন অফার মূল্যে সাশ্রয়ী দামে
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-emerald-800 via-green-900 to-teal-900 border-2 border-emerald-700/50 rounded-3xl p-8 md:p-10 text-center shadow-xl shadow-emerald-900/30 overflow-hidden"
        >
          {/* glow layer — sits behind content, clipped to card */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full bg-emerald-400/30 blur-3xl"
            />
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-20 -right-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl"
            />
            <motion.div
              animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.15, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-teal-400/25 blur-3xl"
            />
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute top-1/2 -translate-y-1/2 -right-10 w-56 h-56 rounded-full bg-rose-300/20 blur-3xl"
            />
          </div>

          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

          {/* content wrapper so it stays above the glow */}
          <div className="relative z-10">
            <span className="inline-block bg-red-50 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-5">
              🔥 সীমিত সময়ের অফার
            </span>

            {/* Prices */}
            <div className="flex items-center justify-center gap-5 mb-6 flex-wrap">
              <div className="text-center">
                <p className="text-white/50 text-xl line-through font-semibold">
                  ৳৩৫০০
                </p>
                <p className="text-white/50 text-xs">মূল্য</p>
              </div>
              <div className="text-3xl font-black text-emerald-300">→</div>
              <div className="text-center">
                <motion.p
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl md:text-6xl font-black text-white"
                >
                  ৳২৫০০
                </motion.p>
                <p className="text-emerald-200 text-xs font-semibold">এখন মাত্র</p>
              </div>
            </div>

            <p className="text-amber-300 font-bold text-lg mb-8">
              অফারে সাশ্রয় করুন ৳১০০০ 🎉
            </p>

            {/* CTA */}
            <button
              onClick={scrollToOrder}
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl shadow-emerald-900/30 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <span>🟢</span> এখনই অর্ডার করুন
              <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                Special Offer
              </span>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {[
                { icon: "🛡️", text: "১ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি" },
                { icon: "🚚", text: "সারা বাংলাদেশে হোম ডেলিভারি" },
                { icon: "💳", text: "ক্যাশ অন ডেলিভারি" },
              ].map((b) => (
                <span
                  key={b.text}
                  className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-full"
                >
                  <span>{b.icon}</span> {b.text}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}