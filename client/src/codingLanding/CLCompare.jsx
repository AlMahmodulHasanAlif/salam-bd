import { motion } from "framer-motion";

const WHY_US = [
  "Learning Pen থেকে বহুগুণ উন্নত",
  "আরও মজবুত ও টেকসই",
  "ব্যবহার করা অত্যন্ত সহজ",
  "শিশুদের জন্য নিরাপদ এবং উপযোগী",
  "শিক্ষার্থীদের জন্য বিভিন্ন ধরনের শেখার সুবিধা",
  "ইন্টারঅ্যাক্টিভ ভয়েস সাপোর্ট",
  "দামও ১০০০ টাকা কম",
];

const NORMAL_PEN = [
  "কম ফিচার",
  "মজবুত নয়",
  "ব্যবহার কঠিন",
  "দাম বেশি",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function CLCompare() {
  return (
    <section className="bg-gradient-to-b from-emerald-50/70 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">
            কেন{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Salam Coding Book?
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Why us */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="bg-white border-2 border-emerald-200 rounded-3xl p-6 md:p-8 shadow-lg shadow-emerald-900/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <h3 className="text-xl font-bold text-emerald-700 mb-6">
              Learning Pen থেকে ✨
            </h3>
            <div className="flex flex-col gap-3">
              {WHY_US.map((w) => (
                <motion.div
                  key={w}
                  variants={itemVariants}
                  className="flex items-center gap-3 bg-emerald-50/60 rounded-xl px-4 py-3"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    ✔
                  </span>
                  <span className="text-slate-700 font-medium text-sm">{w}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Normal pen */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-slate-500 mb-6">
              সাধারণ Learning Pen
            </h3>
            <div className="flex flex-col gap-3">
              {NORMAL_PEN.map((n) => (
                <motion.div
                  key={n}
                  variants={itemVariants}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3"
                >
                  <span className="w-6 h-6 rounded-full bg-red-400 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                    ✕
                  </span>
                  <span className="text-slate-500 font-medium text-sm line-through">
                    {n}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm font-semibold text-center">
              অথচ Salam Coding Book-এর দাম ১০০০ টাকা কম! 🎉
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
