import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import img1 from "../landing/slider01.png";
import img2 from "../landing/slider02.jpeg";
import img3 from "../landing/slider03.jpeg";
import img4 from "../landing/slider04.jpeg";
import img5 from "../landing/slider05.jpeg";

// Replace these with actual product image URLs
const SLIDES = [
  {
    id: 1,
    src: img1,
    alt: "Plug In Quran - সামনের দিক",
    caption: "প্রিমিয়াম ডিজাইন",
  },
  {
    id: 2,
    src: img2,
    alt: "Plug In Quran - পাশের দিক",
    caption: "",
  },
  {
    id: 3,
    src: img3,
    alt: "Plug In Quran - বক্স সহ",
    caption: "ছোট ও বহনযোগ্য",
  },
  {
    id: 4,
    src: img4,
    alt: "ফ্রি গিফট",
    caption: "",
  },
  {
    id: 5,
    src: img5,
    alt: "ফ্রি গিফট",
    caption: "",
  },
];

export default function LSlider() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  return (
    <section className="bg-[#0d0d0d]  px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          {/* <span className="text-emerald-500 text-4xl font-semibold uppercase tracking-widest">
            কুরআন প্লাগিন
          </span> */}
          {/* <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            দেখুন প্রতিটি কোণ থেকে
          </h2> */}
        </div>

        <div
          className="relative rounded-2xl overflow-hidden border border-emerald-900/40 bg-black shadow-2xl shadow-emerald-900/20"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main image */}
          <div className="relative aspect-[4/3]">
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={SLIDES[current].src}
                alt={SLIDES[current].alt}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Caption overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white font-semibold text-lg">
                {SLIDES[current].caption}
              </p>
            </div>

            {/* Nav arrows */}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-emerald-900/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all border border-white/10"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-emerald-900/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all border border-white/10"
            >
              ›
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 p-3 bg-black/40">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  setCurrent(idx);
                  setIsAutoPlaying(false);
                }}
                className={`flex-1 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                  idx === current
                    ? "border-emerald-500 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current ? "w-8 bg-emerald-500" : "w-1.5 bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-5">
        {/* <button
          onClick={() =>
            document.getElementById("order-section")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className="group relative inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl px-12 py-5 rounded-xl transition-all duration-300 shadow-xl shadow-emerald-900/50 hover:shadow-emerald-700/60 hover:scale-105 w-full sm:w-auto"
        >
          <span>🛒</span> এখনই অর্ডার করুন
          <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            HOT
          </span>
        </button> */}
      </div>
    </section>
  );
}
