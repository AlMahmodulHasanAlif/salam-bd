import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import SupportShield from "../../components/SupportShield";
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

      {/* ── CTA cards under the hero ── */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="mt-5 sm:mt-7 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
      >
        {/* মেধা যাচাই — goes to the competition page */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 flex flex-col items-center gap-3 text-center shadow-sm"
        >
          {/* decorative sparkles */}
          <span className="pointer-events-none absolute top-3 right-5 text-orange-200 text-lg select-none">✦</span>
          <span className="pointer-events-none absolute top-9 right-14 text-amber-200 text-xs select-none">✦</span>
          <span className="pointer-events-none absolute bottom-4 right-8 text-orange-200 text-sm select-none">✦</span>

          <div className="flex-shrink-0 text-5xl sm:text-6xl leading-none drop-shadow-sm">
            🏆
          </div>
          <div className="relative min-w-0">
            <h3 className="text-base sm:text-lg font-black text-gray-800 leading-snug">
              আপনার সন্তানের মেধা যাচাই করুন
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-3 leading-relaxed">
              সারাদেশব্যাপী মেধা যাচাই প্রতিযোগিতায় অংশগ্রহণ করুন এখনই
            </p>
            <Link
              to="/competition"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 shadow-md shadow-orange-500/25 transition-colors"
            >
              মেধা যাচাইয়ে অংশ নিন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* গ্যারান্টি সাপোর্ট — destination to be added later */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 flex flex-col items-center gap-3 text-center shadow-sm"
        >
          <SupportShield className="w-16 h-auto flex-shrink-0" />
          <div className="relative min-w-0">
            <h3 className="text-base sm:text-lg font-black text-gray-800 leading-snug">
              ১০০ দিনের গ্যারান্টি সাপোর্ট
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-3 leading-relaxed">
              পণ্য সংক্রান্ত যেকোনো সমস্যা হলে অভিযোগ করুন, সমাধান নিশ্চিত
            </p>
            <Link
              to="/guarantee-support"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 shadow-md shadow-emerald-600/25 transition-colors"
            >
              অভিযোগ করুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
