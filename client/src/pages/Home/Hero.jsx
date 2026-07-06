import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import img1 from "../../assets/cover1.webp";
import img3 from "../../assets/cover2.jpg";

import codingbook2 from "../../assets/codingbook2.webp";

const SLIDES = [img1, img3, codingbook2];
const INTERVAL = 4000;
const FADE = { duration: 0.9, ease: "easeInOut" };

export default function HeroSection() {
  const [cur, setCur] = useState(0);
  const timer = useRef(null);
  const total = SLIDES.length;

  const startTimer = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCur((c) => (c + 1) % total);
    }, INTERVAL);
  };

  const go = (index) => {
    setCur(((index % total) + total) % total);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timer.current);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-black">
      {/* Sizer — keeps the container height (invisible) */}
      <img
        src={SLIDES[0]}
        alt=""
        aria-hidden="true"
        className="w-full h-41 md:h-full object-cover opacity-0 pointer-events-none"
      />

      {/* Cross-fading slides */}
      {SLIDES.map((src, i) => (
        <motion.img
          key={i}
          src={src}
          alt={`Slide ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={false}
          animate={{ opacity: i === cur ? 1 : 0 }}
          transition={FADE}
        />
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />

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
