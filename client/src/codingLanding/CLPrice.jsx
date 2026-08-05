import { motion } from "framer-motion";

const scrollToOrder = () =>
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });

export default function CLPrice() {
  return (
    <section className="bg-gradient-to-b from-white to-emerald-50/70 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">
            অফার
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            আমাদের <span className="text-emerald-600">মূল্য</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white border-2 border-emerald-200 rounded-3xl p-8 md:p-10 text-center shadow-xl shadow-emerald-900/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />
          <span className="inline-block bg-red-50 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-5">
            🔥 সীমিত সময়ের অফার
          </span>

          {/* Prices */}
          <div className="flex items-center justify-center gap-5 mb-6 flex-wrap">
            <div className="text-center">
              <p className="text-slate-400 text-xl line-through font-semibold">
                ৳৩৫০০
              </p>
              <p className="text-slate-400 text-xs">মূল্য</p>
            </div>
            <div className="text-3xl font-black text-emerald-500">→</div>
            <div className="text-center">
              <motion.p
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500"
              >
                ৳২৫০০
              </motion.p>
              <p className="text-emerald-600 text-xs font-semibold">এখন মাত্র</p>
            </div>
          </div>

          <p className="text-amber-600 font-bold text-lg mb-8">
            অফারে সাশ্রয় করুন ৳১০০০ 🎉
          </p>

          {/* CTA */}
          <button
            onClick={scrollToOrder}
            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl shadow-emerald-900/30 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            <span>🟢</span> এখনই অর্ডার করুন
            <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              HOT
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
                className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-3 py-1.5 rounded-full"
              >
                <span>{b.icon}</span> {b.text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
