import { useState } from "react";
import { motion } from "framer-motion";
import CLSlider from "./CLSlider";
import img1 from "../assets/01.webp";
import img2 from "../assets/02.webp";
import img3 from "../assets/03.webp";
import img4 from "../assets/04.webp";
import img5 from "../assets/05.webp";
import img6 from "../assets/06.webp";

const SLIDER_IMAGES = [
  { src: img1, alt: "Salam Coding Book ১" },
  { src: img2, alt: "Salam Coding Book ২" },
  { src: img3, alt: "Salam Coding Book ৩" },
  { src: img4, alt: "Salam Coding Book ৪" },
  { src: img5, alt: "Salam Coding Book ৫" },
  { src: img6, alt: "Salam Coding Book ৬" },
];

const scrollToOrder = () =>
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });

// Drop in a real YouTube ID here when the product video is ready.
// e.g. const VIDEO_ID = "cUOJE5w1cS8";
const VIDEO_ID = null;

export default function CLVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="video" className="bg-[#0d1b2a] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">

          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 leading-snug">
          কিভাবে আপনার সন্তানকে {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              Salam Coding Book
            </span>{" "}
            শিখাবেন ব্যবহারের সঠিক পদ্ধতি জেনে নিন
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            পণ্যটির সমস্ত ফিচার ও শিশুদের জন্য উপযোগিতা সরাসরি দেখুন
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/40"
        >
          {VIDEO_ID ? (
            isPlaying ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                  title="Salam Coding Book Review"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="relative aspect-video bg-black group cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <img
                  src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                  alt="ভিডিও থাম্বনেইল"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-emerald-600 hover:bg-emerald-500 transition-colors w-20 h-20 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                    ▶ ভিডিওটি দেখুন
                  </span>
                </div>
              </div>
            )
          ) : (
            // Placeholder — swap in a VIDEO_ID above or an <img>/<video> here.
            <div
              className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 flex flex-col items-center justify-center gap-5 cursor-pointer"
              onClick={() => alert("ভিডিওটি শীঘ্রই যুক্ত হচ্ছে — পরে আবার দেখুন।")}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-600/80 flex items-center justify-center shadow-2xl animate-pulse">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">ভিডিওটি দেখুন</p>
                <p className="text-slate-400 text-sm mt-1">
                  ভিডিও শীঘ্রই আসছে…
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA — order now under the video */}
        <div className="text-center mt-10">
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all duration-300"
          >
            🛒 অর্ডার করুন
          </button>
        </div>

        {/* Slideshow — how to use */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              Salam Coding Book
            </span>{" "} <br />
            এর সাথে যে ৬টি বই পাবেন
          </h2>
         
          <div className="mt-5 flex justify-center">
            <CLSlider images={SLIDER_IMAGES} aspectClass="aspect-[4/5]" />
          </div>
        </div>

        {/* CTA — order now after the slideshow */}
        <div className="text-center mt-10">
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all duration-300"
          >
            🛒 অর্ডার করুন
          </button>
        </div>
      </div>
    </section>
  );
}
