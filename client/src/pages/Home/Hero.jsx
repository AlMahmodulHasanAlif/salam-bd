import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
// import salambdMobile from "../../assets/salambd-mobile.png";
// import salambdMobile1 from "../../assets/salambd-mobile1.png";
import salambdMobile2 from "../../assets/salambd-mobile2.png";
import salabd1 from "../../assets/salabd1.webp";
import salambd2 from "../../assets/salambd2.webp";
import salambd3 from "../../assets/salambd3.webp";
import twoBrother from "../../assets/2Brother.webp";
import mobileNew from "../../assets/Mobile.png";
import mobileNew2 from "../../assets/Mobile 2.png";
import upcomingProduct from "../../assets/UpComingProduct.png";

// Left carousel slides (desktop)
const SLIDES = [salabd1, salambd2, salambd3, twoBrother];
// Right single banner (desktop)
const RIGHT_BANNER = upcomingProduct;
// Mobile-only carousel slides
const MOBILE_SLIDES = [
  // salambdMobile,
  // salambdMobile1,
  salambdMobile2,
  mobileNew,
  mobileNew2,
];

const INTERVAL = 4000;
const FADE = { duration: 0.9, ease: "easeInOut" };

export default function HeroSection() {
  const [cur, setCur] = useState(0);
  const timer = useRef(null);
  const total = SLIDES.length;

  const [mCur, setMCur] = useState(0);
  const mTimer = useRef(null);
  const mTotal = MOBILE_SLIDES.length;

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

  const startMTimer = () => {
    clearInterval(mTimer.current);
    mTimer.current = setInterval(() => {
      setMCur((c) => (c + 1) % mTotal);
    }, INTERVAL);
  };

  const goM = (index) => {
    setMCur(((index % mTotal) + mTotal) % mTotal);
    startMTimer();
  };

  useEffect(() => {
    startTimer();
    startMTimer();
    return () => {
      clearInterval(timer.current);
      clearInterval(mTimer.current);
    };
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* ── Desktop: two-column hero (hidden on mobile) ── */}
      <div className="hidden md:grid grid-cols-3 gap-4 h-[300px] lg:h-[420px]">
        {/* Left — carousel (2/3) */}
        <div className="relative col-span-2 h-full overflow-hidden rounded-2xl bg-black">
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

          {/* Dots — bottom left */}
          <div className="absolute bottom-5 left-6 z-10 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === cur
                    ? "w-6 h-2 bg-[#c9a84c]"
                    : "w-2 h-2 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right — single banner (1/3) */}
        <div className="relative col-span-1 h-full overflow-hidden rounded-2xl bg-black">
          <img
            src={RIGHT_BANNER}
            alt="Featured"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Mobile: crossfading carousel of the two mobile banners ── */}
      <div className="md:hidden relative overflow-hidden rounded-2xl bg-black">
        {/* Sizer — keeps the natural image height (invisible) */}
        <img
          src={MOBILE_SLIDES[0]}
          alt=""
          aria-hidden="true"
          className="w-full h-auto opacity-0 pointer-events-none"
        />

        {MOBILE_SLIDES.map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt={`Mobile slide ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={false}
            animate={{ opacity: i === mCur ? 1 : 0 }}
            transition={FADE}
          />
        ))}

        {/* Dots — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {MOBILE_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goM(i)}
              aria-label={`Go to mobile slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === mCur
                  ? "w-6 h-2 bg-[#c9a84c]"
                  : "w-2 h-2 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
