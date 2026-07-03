import { motion } from "framer-motion";
import pluginImg from "../landing/pluginspec.jpg";

const REASONS = [
  {
    icon: "🕌",
    title: "ঘর-অফিসে রহমত ও বরকত",
    desc: "এটি ঘর, অফিস বা প্রতিষ্ঠানকে রহমত ও বরকতময় করতে এবং সকল অশুভ শক্তি ঘর থেকে দূর করতে সাহায্য করবে।",
  },
  {
    icon: "🛡️",
    title: "অশুভ শক্তি থেকে সুরক্ষা",
    desc: "এটির মধ্যে থাকা রুকাইয়া, সুরা'র তেলাওয়াত অশুভ শক্তি, জীন-ভূত, যাদু টোনা থেকে বেঁচে থাকতে সাহায্য করবে।",
  },
  {
    icon: "🌙",
    title: "সন্তানদের নিরাপদ ঘুম",
    desc: "আপনার সন্তানদের জন্য রাতে ঘুমানোর সময় ব্যবহার করতে পারেন, যার ফলে তাঁরা খারাপ স্বপ্ন বা ভয় থেকে বাঁচতে পারবে।",
  },
  {
    icon: "🎁",
    title: "বয়স্কদের জন্য আদর্শ উপহার",
    desc: "বয়স্ক মা-বাবা, শশুর-শাশুড়ি ও আত্মীয় স্বজন যারা চোখে দেখে পড়তে পারেন না, তাদেরকে এটি উপহার দিতে পারেন।",
  },
  {
    icon: "✅",
    title: "৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি",
    desc: "পাচ্ছেন ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি। ফলে কোনো দ্বিধা ছাড়াই কিনতে পারেন।",
  },
  {
    icon: "📖",
    title: "ইবাদত ও আল্লাহর রহমত",
    desc: "কোরআন তিলাওয়াতের মতো মনোযোগ দিয়ে কোরআন তিলাওয়াত শোনাও একটি বড় ইবাদত ও আল্লাহর রহমত লাভের মাধ্যম।",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const imageVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function WhyNeedSection() {
  return (
    <section className="bg-[#0d0d0d] py-5 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          {/* <span className="text-emerald-500 text-sm font-semibold uppercase tracking-widest">
            কেন রাখবেন?
          </span> */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
            কেন এই প্লাগইন কোরআনটি{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              আপনার ঘরে রাখা প্রয়োজন?
            </span>
          </h2>
          {/* <p className="text-gray-2 00 max-w-2xl mx-auto text-lg">
            একটি ডিভাইস — অসংখ্য উপকার। দুনিয়া ও আখিরাতের কল্যাণে।
          </p> */}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT — Product image */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative flex justify-center"
          >
            {/* Glow backdrop */}
            <div className="absolute inset-0 rounded-3xl bg-emerald-700/10 blur-3xl scale-90" />

            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-950/60 w-full max-w-md aspect-[5/5]">
              {/* Replace src with your actual product image */}
              <img
                src={pluginImg}
                alt="Plug In Quran ডিভাইস"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback placeholder when image missing
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Fallback visual if no real image */}
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
                {/* Decorative Arabic calligraphy-style lines */}
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-emerald-600 to-transparent" />
                <div className="text-gray-600 text-xs text-center leading-relaxed max-w-[180px]">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                </div>
              </div>

              {/* Bottom badge overlay */}
              {/* <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-md border border-emerald-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-bold">
                      ৬ মাসের গ্যারান্টি
                    </p>
                    <p className="text-gray-400 text-xs">
                      রিপ্লেসমেন্ট নিশ্চিত
                    </p>
                  </div>
                  <div className="text-2xl">🛡️</div>
                </div>
              </div> */}
            </div>

            {/* Floating stat chip */}
            <div className="absolute -top-4 -right-4 bg-amber-400 text-black text-xs font-black px-3 py-2 rounded-xl shadow-lg rotate-3">
              New Arrival ✓
            </div>
          </motion.div>

          {/* RIGHT — Reasons list */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col gap-4"
          >
            {REASONS.map((reason) => (
              <motion.div
                key={reason.title}
                variants={itemVariants}
                className="group flex gap-4 items-start bg-gradient-to-r from-white/[0.04] to-transparent border border-white/8 hover:border-emerald-700/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/20"
              >
                {/* Icon bubble */}
                <div className="shrink-0 w-11 h-11 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                  {reason.icon}
                </div>

                <div>
                  <h3 className="text-emerald-500 font-bold text-base mb-1 leading-snug">
                    {reason.title}
                  </h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {reason.desc}
                  </p>
                </div>

                {/* Right accent dot */}
                <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-600/0 group-hover:bg-emerald-500 transition-colors duration-300 mt-2" />
              </motion.div>
            ))}

            {/* CTA row */}
            <motion.div variants={itemVariants} className="mt-2">
              <button
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-lg transition-all duration-300 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/50 hover:-translate-y-0.5"
                onClick={() =>
                  document.getElementById("order-section")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                এখনই অর্ডার করুন →
              </button>
              <p className="text-center text-gray-500 text-xs mt-3">
                ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি সহ — কোনো ঝুঁকি নেই
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
