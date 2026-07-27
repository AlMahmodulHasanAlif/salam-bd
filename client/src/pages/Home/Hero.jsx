import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
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
import button1 from "../../assets/button1.png";
import button2 from "../../assets/button2.png";

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

      {/* ── Banner CTAs under the hero ── */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="mt-5 sm:mt-7 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
      >
        {/* মেধা যাচাই — competition banner (button sits in the banner's empty space) */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link
            to="/competition"
            className="@container relative block overflow-hidden rounded-2xl shadow-sm"
          >
            <img
              src={button1}
              alt="আপনার সন্তানের মেধা যাচাই করুন"
              className="w-full h-auto"
            />
            {/* Button sized in cqw so it scales proportionally with the banner. */}
            <span className="absolute left-[44.5%] top-[80%] -translate-y-1/2 inline-flex items-center gap-[1.2cqw] rounded-[1.2cqw] bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 text-blue-950 font-black text-[2.8cqw] px-[4cqw] py-[1.5cqw] shadow-lg ring-1 ring-white/40 whitespace-nowrap transition-colors">
              এখনই নিবন্ধন করুন <ArrowRight className="w-[3.6cqw] h-[3.6cqw]" />
            </span>
          </Link>
        </motion.div>

        {/* গ্যারান্টি সাপোর্ট — guarantee support banner */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link
            to="/guarantee-support"
            className="@container relative block overflow-hidden rounded-2xl shadow-sm"
          >
            <img
              src={button2}
              alt="১০০ দিনের গ্যারান্টি সাপোর্ট"
              className="w-full h-auto"
            />
            {/* Button sized in cqw so it scales proportionally with the banner. */}
            <span className="absolute left-1/2 top-[80%] -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-[1.2cqw] rounded-[1.2cqw] bg-gradient-to-b from-lime-400 to-green-600 hover:from-lime-300 hover:to-green-500 text-white font-black text-[2.8cqw] px-[4cqw] py-[1.5cqw] shadow-lg ring-1 ring-white/30 whitespace-nowrap transition-colors">
              অভিযোগ করুন <ArrowRight className="w-[3.6cqw] h-[3.6cqw]" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
