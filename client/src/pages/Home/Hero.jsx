import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import img1 from "../../assets/Wall Frame Cover.webp";
import img3 from "../../assets/Wall Frame Cover.webp";

const SLIDES = [img1, img3];
const INTERVAL = 4000;
const TRANSITION = { duration: 0.8, ease: [0.77, 0, 0.18, 1] };

export default function HeroSection() {
  const [cur, setCur] = useState(0);
  const controls = useAnimation();
  const timer = useRef(null);
  const curRef = useRef(0); // ✅ always holds latest cur
  const total = SLIDES.length;

  const slideTo = (index) => {
    const next = ((index % total) + total) % total;
    curRef.current = next;
    setCur(next);
    controls.start({
      x: `-${(next * 100) / total}%`, // ✅ adjust to container width
      transition: TRANSITION,
    });
  };

  const startTimer = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      slideTo(curRef.current + 1); // ✅ reads latest value via ref
    }, INTERVAL);
  };

  const go = (index) => {
    slideTo(index);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timer.current);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-black">
      {/* Slides */}
      <motion.div
        className="flex w-full"
        style={{ width: `${total * 100}%` }}
        animate={controls}
        initial={{ x: "0%" }}
      >
        {SLIDES.map((src, i) => (
          <div
            key={i}
            className="relative flex-shrink-0"
            style={{ width: `${100 / total}%` }}
          >
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="w-full h-41 md:h-full object-cover"
            />
          </div>
        ))}
      </motion.div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {/* Arrows */}
      {/* <button
        onClick={() => go(cur - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white text-2xl flex items-center justify-center hover:bg-[#1a6b3a] transition-colors"
      >
        ‹
      </button>
      <button
        onClick={() => go(cur + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white text-2xl flex items-center justify-center hover:bg-[#1a6b3a] transition-colors"
      >
        ›
      </button> */}

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 ">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 ${
              i === cur
                ? "w-6 h-2 bg-[#c9a84c]"
                : "w-2 h-2 bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
