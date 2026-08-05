import { motion } from "framer-motion";
import { Link } from "react-router";
import { Trophy } from "lucide-react";

const PRIZES = [
  { icon: "🎁", title: "আকর্ষণীয় পুরস্কার" },
  { icon: "📜", title: "সার্টিফিকেট" },
  { icon: "🏅", title: "বিশেষ সম্মাননা" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CLPrize() {
  return (
    <section className="bg-gradient-to-b from-amber-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block bg-amber-400/10 border border-amber-500/30 text-amber-600 font-bold px-5 py-2 rounded-full text-sm uppercase tracking-widest mb-4"
          >
            🏆 পুরস্কার / Achievement
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 leading-snug">
            শেখার সাথে থাকছে{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              পুরস্কারের সুযোগ!
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            নিয়মিত মেধা যাচাই প্রতিযোগিতায় অংশ নিয়ে জিতে নিন আকর্ষণীয় গিফট
            পুরস্কার
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
        >
          {PRIZES.map((p) => (
            <motion.div
              key={p.title}
              variants={itemVariants}
              className="relative bg-white border border-amber-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="text-slate-800 font-bold text-lg">{p.title}</h3>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/competition"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-amber-900/20 transition-all duration-300 hover:scale-105"
          >
            <Trophy className="w-5 h-5" />
            মেধা যাচাই প্রতিযোগিতায় অংশ নিন
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
