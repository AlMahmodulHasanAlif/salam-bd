import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import codingBookImg from "./assets/p2-codingbook.webp";
import learningBookImg from "./assets/p4-learningbook.webp";
import flashCardImg from "./assets/p3-flashcard.webp";
import chargingCableImg from "./assets/p1-charging-cable.jpg";

const ITEMS = [
  {
    img: codingBookImg,
    title: "Salam Coding Book ডিজিটাল",
    badge: "মূল পণ্য",
  },
  {
    img: learningBookImg,
    title: "Learning Books",
   
    badge: "ফ্রি",
  },
  {
    img: flashCardImg,
    title: "৫০টি Flash Card",
    badge: "ফ্রি",
  },
  {
    img: chargingCableImg,
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

const PackageCard = ({ item }) => (
  <div className="text-center">
    {item.badge && (
      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full z-10">
        {item.badge}
      </span>
    )}
    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
      <img
        src={item.img}
        alt={item.title}
        className="w-full h-full object-contain"
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
  </div>
);

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const MobilePackageSlider = ({ items }) => {
  const [[index, dir], setIndex] = useState([0, 0]);
  const count = items.length;

  const paginate = (newDir) => {
    setIndex(([i]) => [(i + newDir + count) % count, newDir]);
  };

  useEffect(() => {
    const id = setInterval(() => paginate(1), 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, index]);

  return (
    <div className="relative sm:hidden max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white p-5">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <PackageCard item={items[index]} />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => paginate(-1)}
          aria-label="আগের ছবি"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-md transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => paginate(1)}
          aria-label="পরের ছবি"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-md transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center gap-1.5 mt-4">
        {items.map((item, i) => (
          <button
            key={item.title}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            aria-label={`ছবি ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-emerald-600" : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
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

        <MobilePackageSlider items={ITEMS} />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {ITEMS.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="relative bg-white border border-slate-100 hover:border-emerald-300 rounded-3xl p-5 text-center shadow-sm hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
            >
              <PackageCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
