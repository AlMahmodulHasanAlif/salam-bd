import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const variants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function CLSlider({ images, interval = 4000, aspectClass = "aspect-square", maxWidthClass = "max-w-md" }) {
  const [[index, dir], setIndex] = useState([0, 0]);
  const [loadedSet, setLoadedSet] = useState(() => new Set());
  const count = images.length;
  const cancelledRef = useRef(false);

  const paginate = (newDir) => {
    setIndex(([i]) => [(i + newDir + count) % count, newDir]);
  };

  // Auto-advance carousel
  useEffect(() => {
    const id = setInterval(() => paginate(1), interval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, interval, index]);

  // Sequentially preload images one at a time so each one finishes
  // loading properly before the next starts (avoids bandwidth contention
  // and half-loaded images).
  useEffect(() => {
    cancelledRef.current = false;

    const loadOne = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // don't block the queue on a broken image
      });

    (async () => {
      for (let i = 0; i < images.length; i++) {
        if (cancelledRef.current) return;
        await loadOne(images[i].src);
        if (cancelledRef.current) return;
        setLoadedSet((prev) => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
      }
    })();

    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const isCurrentLoaded = loadedSet.has(index);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-white shadow-[0_-10px_40px_-8px_rgba(15,118,110,0.3),0_24px_50px_-12px_rgba(15,118,110,0.25)] w-full ${maxWidthClass} ${aspectClass} bg-white`}>
      {/* Loading indicator — shown until the current image has loaded */}
      {!isCurrentLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      )}

      <AnimatePresence initial={false} custom={dir}>
        {isCurrentLoaded && (
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
            className="absolute inset-0 w-full h-full p-4 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => paginate(-1)}
        aria-label="আগের ছবি"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-md transition-colors z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="পরের ছবি"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-md transition-colors z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            aria-label={`ছবি ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-emerald-600" : "w-2 bg-white/70 hover:bg-white"
            } ${loadedSet.has(i) ? "" : "opacity-40"}`}
          />
        ))}
      </div>
    </div>
  );
}