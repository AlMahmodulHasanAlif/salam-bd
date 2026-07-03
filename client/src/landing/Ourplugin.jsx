import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "📖",
    title: "৬৪ সূরার তিলাওয়াত",
    desc: "পবিত্র কুরআনের ৬৪ সূরার সম্পূর্ণ তিলাওয়াত।",
    badge: "৬৪ সূরা",
  },
  {
    icon: "🎙️",
    title: "সেরা ক্বারী",
    desc: " বিশ্বসেরা ক্বারীর সুললিত কণ্ঠে কুরআন শোনার সুবিধা।",
    badge: "ক্বারী",
  },
  {
    icon: "🛡️",
    title: "শক্তিশালী রুকাইয়াহ",
    desc: "৫ ঘণ্টার ধরনের বিশেষ রুকাইয়াহ তিলাওয়াত।",
    badge: "রুকাইয়াহ",
  },
  {
    icon: "🔊",
    title: "সাউন্ড সিস্টেম",
    desc: "লাউড এবং ক্রিস্টাল ক্লিয়ার সাউন্ড কোয়ালিটি।",
    badge: "HD",
  },
  {
    icon: "🎚️",
    title: "ভলিউম কন্ট্রোল",
    desc: "প্রয়োজন অনুযায়ী সাউন্ড কমানো বা বাড়ানোর সুবিধা।",
    badge: null,
  },
  {
    icon: "💡",
    title: "মাল্টি-ফাংশনাল লাইট",
    desc: "আকর্ষণীয় ডিম লাইট যা ঘরকে করবে আলোকিত।",
    badge: null,
  },
  {
    icon: "🌗",
    title: "লাইট কন্ট্রোল",
    desc: "লাইট অন-অফ এবং আলোর উজ্জ্বলতা (Brightness) কমানো-বাড়ানোর সুবিধা।",
    badge: null,
  },
  {
    icon: "📋",
    title: "সহজ ম্যানুয়েল",
    desc: "ডিভাইসটি সহজে পরিচালনার জন্য পূর্ণাঙ্গ বাংলা ইউজার ম্যানুয়েল।",
    badge: "বাংলা",
  },
  {
    icon: "✅",
    title: "নিশ্চয়তা",
    desc: "দীর্ঘস্থায়ী ব্যবহারের নিশ্চিয়তায় পাচ্ছেন ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি।",
    badge: "৬ মাস",
  },
  {
    icon: "📞",
    title: "লাইভ সাপোর্ট",
    desc: "জীন-যাদু ও বদনজরের সমস্যায় পাচ্ছেন লাইভ রুকাইয়াহ সাপোর্ট।",
    badge: "২৪/৭",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function OurPlugin() {
  return (
    <section className="bg-[#0a120c] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#d4f0da] mt-3 mb-4">
            আমাদের প্লাগইন কোরআনের{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              বিশেষত্বসমূহ
            </span>
          </h2>
          <p className="text-[#6b9c76] max-w-xl mx-auto text-base">
            একটি ডিভাইসে কুরআন, রুকাইয়াহ, জিকির ও আরও অনেক কিছু
          </p>
        </div>

        {/* Feature grid — WhyNeedSection row style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group flex gap-4 items-start bg-gradient-to-r from-white/[0.04] to-transparent border border-white/[0.08] hover:border-emerald-700/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/20"
            >
              {/* Icon bubble */}
              <div className="shrink-0 w-11 h-11 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-emerald-500 font-bold text-base leading-snug">
                    {feature.title}
                  </h3>
                  {feature.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#163020] border border-[#255030] text-emerald-400 shrink-0">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              {/* Right accent dot */}
              <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-600/0 group-hover:bg-emerald-500 transition-colors duration-300 mt-2" />
            </motion.div>
          ))}
        </motion.div>

        {/* Guarantee bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-[#0e1f12] border border-[#255030] rounded-2xl px-5 py-4 flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-[#163020] border border-[#255030] flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div className="flex-1">
            <p className="text-[#d4f0da] font-bold text-sm mb-0.5">
              ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি
            </p>
            <p className="text-[#6b9c76] text-xs leading-relaxed">
              পাচ্ছেন ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি। তাই নিশ্চিন্তে পণ্যটি
              কিনতে পারেন।
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#2a1e06] border border-[#7a5010] text-amber-400">
            নিশ্চিত গ্যারান্টি ✓
          </span>
        </motion.div>
      </div>
    </section>
  );
}