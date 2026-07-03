import { motion } from "framer-motion";

const GIFTS = [
  {
    icon: "🗒️",
title: "১০টি দোয়া স্টিকার",
desc: "দৈনন্দিন আমল ও দোয়া সম্বলিত স্টিকার",
value: "মূল্য ২০০৳",
  },
  {
   icon: "📄",
    title: "রুকিয়াহ লিফলেট",
    desc: "রুকিয়াহর দোয়া ও নির্দেশনা সম্বলিত তথ্যপত্র",
    value: "মূল্য ২০০৳",
  },
  {
icon: "💧",
title: "জমজম মিশ্রিত পানি",
desc: "পবিত্র জমজমের পানি মিশ্রিত একটি বিশেষ বোতল",
value: "মূল্য ২০০৳",
  },
];

export default function Lgift() {
  return (
    <section className="bg-[#0a0a0a] py-5 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block bg-amber-400/10 border border-amber-500/30 text-amber-400 font-bold px-5 py-2 rounded-full text-sm uppercase tracking-widest mb-4"
          >
            🎁 বিশেষ অফার
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            প্রতিটি অর্ডারে <span className="text-amber-400">বিনামূল্যে</span>{" "}
            পাচ্ছেন
          </h2>
          <p className="text-gray-400 text-lg">
            মোট{" "}
            <span className="text-amber-400 font-bold">৪০০৳ মূল্যের গিফট <span className="text-gray-400 ">এবং</span> <span className="text-emerald-400 font-bold">২৫০মিলি জমজম মিশ্রিত পানি</span></span>{" "}
            একদম ফ্রি!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {GIFTS.map((gift, idx) => (
            <motion.div
              key={gift.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-b from-amber-900/20 to-transparent border border-amber-800/30 rounded-2xl p-6 text-center overflow-hidden"
            >
              <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                FREE
              </div>
              <div className="text-5xl mb-4">{gift.icon}</div>
              <h3 className="text-white font-bold text-xl mb-2">
                {gift.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3">{gift.desc}</p>
              <span className="inline-block text-amber-400 text-sm font-semibold line-through opacity-70">
                {gift.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Total savings banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-900/40 via-emerald-800/20 to-amber-900/30 border border-emerald-700/40 rounded-2xl p-6 text-center"
        >
          <p className="text-gray-300 text-lg mb-2">মোট সাশ্রয়</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-gray-50 text-md line-through">1290</div>
              <div className="text-white text-sm">মোট মূল্য</div>
            </div>
            <div className="text-3xl font-bold text-amber-400">→</div>
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-400">990</div>
              <div className="text-emerald-500 text-sm">আপনি পাচ্ছেন</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">300</div>
              <div className="text-amber-500/70 text-sm">সাশ্রয়</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
