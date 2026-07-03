import { motion } from "framer-motion";
import pluginImg from "../assets/pluginquran.webp";

const STEPS = [
  {
    num: "১",
    btn: null,
    action: "প্লাগ ইন করুন",
    desc: "ইলেকট্রিক সকেটের সাথে প্লাগ ইন করুন।",
    color: "from-emerald-500 to-emerald-400",
  },
  {
    num: "২",
    btn: "বাটন ১",
    action: "কুরআন তিলাওয়াত",
    desc: "কুরআন শুনতে ১নং বাটন লং প্রেস করুন।",
    color: "from-emerald-600 to-emerald-500",
  },
  {
    num: "৩",
    btn: "বাটন ২",
    action: "রুকইয়া — হোম বারাকাহ",
    desc: "রুকইয়া (হোম বারাকাহ) আয়াত ও জিকির শুনতে ২ নং বাটন লং প্রেস করুন।",
    color: "from-teal-600 to-teal-500",
  },
  {
    num: "৪",
    btn: "বাটন ২",
    action: "ভলিউম কন্ট্রোল",
    desc: "সাউন্ড বাড়াতে বা কমাতে ২ নং বাটন বার বার প্রেস করুন।",
    color: "from-teal-600 to-emerald-500",
  },
  {
    num: "৫",
    btn: "বাটন ২",
    action: "শিশু সুরক্ষা রুকইয়া",
    desc: "রুকইয়া (শিশুদের সুরক্ষা সম্পর্কিত) আয়াত শুনতে ২ নং বাটন শর্ট প্রেস করুন।",
    color: "from-cyan-700 to-teal-600",
  },
  {
    num: "৬",
    btn: "বাটন ২",
    action: "ঘর পাহারার রুকইয়া",
    desc: "অদৃশ্য বা অশুভ শক্তি থেকে আপনার ঘরকে পাহাড়া দেবার আয়াত শুনতে ২ নং বাটন শর্ট প্রেস করুন।",
    color: "from-emerald-700 to-cyan-700",
  },
  {
    num: "৭",
    btn: "বাটন ৩",
    action: "জিকির",
    desc: "জিকির শুনতে ৩ নং বাটন লং প্রেস করুন।",
    color: "from-amber-600 to-amber-500",
  },
  {
    num: "৮",
    btn: "বাটন ৪",
    action: "ড্রিম লাইট ও ন্যাচারাল সাউন্ড",
    desc: "৪ নং বাটনে ড্রিম লাইট জ্বলবে — ঘুমানোর সময় লাইটের আলো কম/বেশি এডজাস্ট করুন। লং প্রেসে ন্যাচারাল সাউন্ড শুনতে পাবেন।",
    color: "from-amber-500 to-yellow-400",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45 } },
};

const imageVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function Usage() {
  return (
    <section className="bg-[#0d0d0d] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-emerald-500 text-sm font-semibold uppercase tracking-widest">
            ব্যবহারবিধি
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
            সম্পূর্ণ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              ব্যবহারবিধি
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            মাত্র কয়েকটি বাটনে নিয়ন্ত্রণ করুন পুরো ডিভাইসটি
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT — Steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col gap-3"
          >
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                variants={itemVariants}
                className="group flex gap-3 items-start bg-gradient-to-r from-white/[0.04] to-transparent border border-white/8 hover:border-emerald-700/50 rounded-2xl px-4 py-3.5 transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/20"
              >
                {/* Step number circle */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-black text-sm shadow-md`}
                >
                  {step.num}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h3 className="text-white font-bold text-sm leading-snug">
                      {step.action}
                    </h3>
                    {step.btn && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-700/40 text-emerald-400">
                        {step.btn}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Guarantee strip */}
            <motion.div
              variants={itemVariants}
              className="mt-2 flex items-center gap-4 bg-emerald-900/20 border border-emerald-800/40 rounded-2xl px-5 py-4"
            >
              <div className="text-3xl shrink-0">🛡️</div>
              <div>
                <p className="text-white font-bold text-sm">
                  ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  পাচ্ছেন ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি। তাই নিশ্চিন্তে পণ্যটি
                  কিনতে পারেন।
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Product image */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative flex justify-center"
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-3xl bg-emerald-700/10 blur-3xl scale-90" />

            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-950/60 w-full max-w-md aspect-[4/5]">
              {/* Replace src with your actual Cloudinary product image URL */}
              <img
                src={pluginImg}
                alt="Plug In Quran ডিভাইস"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Fallback placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-[#0d1a12] to-[#0d0d0d] flex flex-col items-center justify-center gap-6 p-8">
                <div className="text-8xl">🕌</div>
                <div className="text-center">
                  <p className="text-emerald-400 font-bold text-xl tracking-wide">
                    Plug In Quran
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    পণ্যের ছবি এখানে দিন
                  </p>
                </div>
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-emerald-600 to-transparent" />
                <p className="text-gray-600 text-sm text-center leading-relaxed">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                </p>

                {/* Button legend visual */}
                <div className="w-full max-w-[200px] bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                  {["বাটন ১", "বাটন ২", "বাটন ৩", "বাটন ৪"].map((btn, i) => (
                    <div key={btn} className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black ${
                          i === 0
                            ? "bg-emerald-600"
                            : i === 1
                              ? "bg-teal-600"
                              : i === 2
                                ? "bg-cyan-700"
                                : "bg-amber-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="text-gray-400 text-xs">{btn}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom badge */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-md border border-emerald-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-bold">
                      সহজ ৪ বাটন কন্ট্রোল
                    </p>
                    <p className="text-gray-400 text-xs">
                      যে কেউ ব্যবহার করতে পারবেন
                    </p>
                  </div>
                  <div className="text-2xl">🔘</div>
                </div>
              </div>
            </div>

            {/* Floating chip */}
            <div className="absolute -top-4 -left-4 bg-amber-400 text-black text-xs font-black px-3 py-2 rounded-xl shadow-lg -rotate-3">
              ৮টি ফিচার ✓
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
