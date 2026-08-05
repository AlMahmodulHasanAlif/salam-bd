import { motion } from "framer-motion";
import productImg from "./assets/placeholder-product.svg";
import bookImg from "./assets/placeholder-book.svg";
import cardImg from "./assets/placeholder-card.svg";
import cableImg from "./assets/placeholder-cable.svg";

const ITEMS = [
  {
    img: productImg,
    title: "Salam Coding Book ডিজিটাল",
    badge: "মূল পণ্য",
  },
  {
    img: bookImg,
    title: "Learning Materials",
    sub: "বই ও কার্ডসমূহ",
    badge: "ফ্রি",
  },
  {
    img: cardImg,
    title: "৫০টি Flash Card",
    badge: "ফ্রি",
  },
  {
    img: cableImg,
    title: "Charging Cable",
    badge: "ফ্রি",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CLPackage() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">
            প্যাকেজ
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">
            প্যাকেজে{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              যা থাকছে
            </span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            এক অর্ডারেই — সম্পূর্ণ শেখার কিট
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {ITEMS.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="relative bg-white border border-slate-100 hover:border-emerald-300 rounded-3xl p-5 text-center shadow-sm hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
            >
              {item.badge && (
                <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <h3 className="text-slate-800 font-bold text-base leading-snug">
                {item.title}
              </h3>
              {item.sub && (
                <p className="text-slate-400 text-sm mt-1">{item.sub}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
