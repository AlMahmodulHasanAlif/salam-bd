import { motion } from "framer-motion";
import codingBookImg from "./assets/p2-codingbook.webp";

const BENEFITS = [
  { icon: "🧑‍🏫", title: "নিজে নিজে শিখতে পারে", desc: "বাবা-মায়ের সাহায্য ছাড়াই খেলতে খেলতে শেখা", bg: "bg-emerald-400", glow: "shadow-[0_0_25px_rgba(52,211,153,0.7)]" },
  { icon: "📱", title: "মোবাইলের বিকল্প", desc: "স্ক্রিন-নির্ভরতা কমিয়ে স্মার্ট শেখার অভ্যাস", bg: "bg-cyan-400", glow: "shadow-[0_0_25px_rgba(34,211,238,0.7)]" },
  { icon: "🎮", title: "খেলতে খেলতেই শেখা", desc: "শিশুর মনোযোগ ধরে রাখে মজার ইন্টারঅ্যাক্টিভ পদ্ধতিতে", bg: "bg-fuchsia-500", glow: "shadow-[0_0_25px_rgba(217,70,239,0.7)]" },
  { icon: "🎒", title: "স্কুলের প্রস্তুতি", desc: "স্কুলে যাওয়ার আগেই বেসিক জ্ঞানে এগিয়ে থাকা", bg: "bg-amber-400", glow: "shadow-[0_0_25px_rgba(251,191,36,0.7)]" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CLIntro() {
  return (
    <section className="bg-gradient-to-b from-white to-emerald-50/60 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Copy top */}
          <div className="text-center lg:text-left lg:col-start-2 lg:row-start-1">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-emerald-100 text-emerald-700 text-xl md:text-2xl font-bold px-4 py-1.5 rounded-full mb-4"
            >
              📘 Salam Coding Book
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[16px] md:text-4xl font-bold text-slate-900 mb-4 leading-snug"
            >
              সন্তানকে শেখাতে কি বারবার মোবাইলের সাহায্য নিতে হচ্ছে?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                এবার মোবাইল নয়—খেলতে খেলতেই শেখার আনন্দে গড়ে উঠুক তার প্রথম শিক্ষার অভ্যাস।
              </span>
            </motion.h2>
          </div>

          {/* Product visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center w-full lg:col-start-1 lg:row-start-1 lg:row-span-2"
          >
            <div className="absolute inset-0 rounded-3xl bg-violet-200/40 blur-3xl scale-90" />
            <img
              src={codingBookImg}
              alt="Salam Coding Book"
              className="relative w-full max-w-[85%] sm:max-w-lg rounded-2xl shadow-2xl shadow-emerald-900/20"
            />
            <div className="absolute -top-4 -right-4 bg-amber-400 text-black text-xs font-black px-3 py-2 rounded-xl shadow-lg rotate-3">
              New Arrival ✓
            </div>
          </motion.div>

          {/* Benefits list */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-2 gap-4 lg:col-start-2 lg:row-start-2"
            >
             {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              variants={itemVariants}
              className="group flex flex-col items-center text-center gap-3 bg-gradient-to-br from-emerald-600 to-green-900 rounded-2xl p-6 shadow-lg shadow-green-900/30 transition-all duration-300 hover:scale-[1.03]"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {b.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">
                  {b.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </motion.div>
          ))}
            </motion.div>
        </div>
      </div>
    </section>
  );
}
