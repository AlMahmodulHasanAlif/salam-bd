import { motion } from "framer-motion";

const BAD_HABITS = ["মোবাইলে", "ইউটিউবে", "গেমসে"];

const BAD_OUTCOMES = [
  "মনোযোগ কমছে",
  "শেখার আগ্রহ কমছে",
  "চোখের ক্ষতি হচ্ছে",
  "ঘুমের সমস্যা হচ্ছে",
];

const GOOD_GOALS = [
  "মোবাইলের উপর নির্ভরশীল না হোক",
  "স্কুলে যাওয়ার আগেই আত্মবিশ্বাসী হয়ে উঠুক",
  "সঠিক উচ্চারণ ও বানান শিখুক",
  "ভালো মানুষ হয়ে বড় হোক",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CLProblem() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
         
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">
            সন্তান বড় হচ্ছে...{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              কিন্তু সে কী শিখছে?
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            বাচ্চারা এখন আগের চেয়ে অনেক বেশি সময় কাটাচ্ছে —
          </p>
        </div>

        {/* What kids spend time on */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {BAD_HABITS.map((h) => (
            <motion.span
              key={h}
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 font-bold text-lg px-6 py-3 rounded-2xl"
            >
              ❌ {h}
            </motion.span>
          ))}
        </motion.div>

        {/* Bad vs Good */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Bad outcomes */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="bg-red-500 border border-red-600 rounded-3xl p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-5">
              ফল যা হচ্ছে ⚠️
            </h3>
            <div className="flex flex-col gap-3">
              {BAD_OUTCOMES.map((o) => (
                <motion.div
                  key={o}
                  variants={itemVariants}
                  className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-red-100 shadow-sm"
                >
                  <span className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                    ✕
                  </span>
                  <span className="text-slate-700 font-medium">{o}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Good goals */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="bg-[#154C28] border border-emerald-900/40 rounded-3xl p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-5">
              আমরা চাই 💚
            </h3>
            <div className="flex flex-col gap-3">
              {GOOD_GOALS.map((g) => (
                <motion.div
                  key={g}
                  variants={itemVariants}
                  className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-emerald-100 shadow-sm"
                >
                  <span className="w-7 h-7 rounded-full bg-[#154C28] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-slate-700 font-medium">{g}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
