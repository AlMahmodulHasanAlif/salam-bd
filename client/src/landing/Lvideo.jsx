import { useState } from "react";
import { motion } from "framer-motion";

// Replace VIDEO_ID with actual YouTube video ID
const VIDEO_ID = "BekT-eDGZjI";

export default function LVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="video" className="bg-[#0a0a0a] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-emerald-500 text-sm font-semibold uppercase tracking-widest">
            পণ্যের রিভিউ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            নিজে দেখুন, নিজে যাচাই করুন
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Plug In Quran এর সমস্ত ফিচার ও সাউন্ড কোয়ালিটি সরাসরি দেখুন
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-emerald-900/40 shadow-2xl shadow-emerald-900/20"
        >
          {!isPlaying ? (
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
                  ▶ প্লে করুন — Plug In Quran পূর্ণ রিভিউ
                </span>
              </div>
            </div>
          ) : (
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                title="Plug In Quran Review"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </motion.div>

        {/* Video features callout */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { emoji: "🎙️", text: "সাউন্ড কোয়ালিটি দেখুন" },
            { emoji: "📱", text: "ব্যবহার কতটা সহজ" },
            { emoji: "🎁", text: "বক্সে কী কী আছে" },
          ].map((item) => (
            <div
              key={item.text}
              className="text-center bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <p className="text-gray-400 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
