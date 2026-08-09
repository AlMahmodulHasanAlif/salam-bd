import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const variants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function CLSlider({ images, interval = 4000, aspectClass = "aspect-square" }) {
  const [[index, dir], setIndex] = useState([0, 0]);
  const count = images.length;

  const paginate = (newDir) => {
    setIndex(([i]) => [(i + newDir + count) % count, newDir]);
  };

  useEffect(() => {
    const id = setInterval(() => paginate(1), interval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, interval, index]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-white shadow-2xl shadow-slate-300/50 w-full max-w-md ${aspectClass} bg-white`}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.img
          key={index}
          src={images[index].src}
          alt={images[index].alt}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
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

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            aria-label={`ছবি ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-emerald-600" : "w-2 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
