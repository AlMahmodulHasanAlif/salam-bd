import { motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Cpu,
  ShieldCheck,
  Cable,
  ClipboardList,
  Package,
  Check,
} from "lucide-react";

const ITEMS = [
  {
    num: "০১",
    icon: BookOpen,
    title: "৬টা বই",
    sub: "সম্পূর্ণ শেখার জন্য ছয়টি বই",
  },
  {
    num: "০২",
    icon: Layers,
    title: "৪০টি ফ্লাশকার্ড",
    sub: "দ্রুত শেখার জন্য ৪০টি ফ্লাশকার্ড",
  },
  {
    num: "০৩",
    icon: Cpu,
    title: "কোডিং বুক ডিভাইস",
    sub: "অডিও ভিত্তিক কোডিং বুক ডিভাইস",
  },
  {
    num: "০৪",
    icon: ShieldCheck,
    title: "গ্যারান্টি ও ওয়ারেন্টি কার্ড",
    sub: "সহজ ক্লেইমের জন্য গ্যারান্টি ও ওয়ারেন্টি কার্ড",
  },
  {
    num: "০৫",
    icon: Cable,
    title: "টাইপ C চার্জিং ক্যাবেল",
    sub: "দ্রুত চার্জিংয়ের জন্য টাইপ C ক্যাবেল",
  },
  {
    num: "০৬",
    icon: ClipboardList,
    title: "Registration Form",
    sub: "রেজিস্ট্রেশনের জন্য ফরম",
  },
  {
    num: "০৭",
    icon: Package,
    title: "প্যাকেজ বক্স",
    sub: "নিরাপদ ডেলিভারির জন্য প্যাকেজ বক্স",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CLPackageContents() {
  return (
    <section className="bg-white  px-4">
      <div className="max-w-4xl mx-auto">
       

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-950 p-8 md:p-12 text-center shadow-2xl shadow-emerald-900/30">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl" />
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="inline-block bg-amber-300 text-amber-900 font-bold text-sm md:text-base uppercase tracking-widest px-5 py-2 rounded-full mb-5 shadow-lg"
            >
              🏆 পুরস্কার 
            </motion.span>
            <p className="text-white text-2xl md:text-5xl font-black leading-snug">
              মেধা যাচাইয়ে থাকছে{" "} <br />
              <span className="inline-block bg-white text-emerald-900 text-2xl md:text-7xl font-black px-8 md:px-12 py-3 md:py-4 rounded-3xl shadow-2xl shadow-emerald-900/30 mt-2 md:mt-0 md:ml-3">
                "২ লক্ষ টাকা"
              </span>{" "}
              <span className="block md:inline">পুরস্কার</span>
            </p>
          </div>
        </motion.div>

         <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="inline-block bg-emerald-950 text-white text-2xl md:text-3xl font-bold px-10 py-4 rounded-2xl shadow-lg shadow-emerald-900/20">
            সম্পূর্ণ প্যাকেজে যা পাচ্ছেন
          </span>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-3"
        >
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.num}
                variants={itemVariants}
                className="group flex items-center gap-4 sm:gap-5 bg-slate-50 hover:bg-white border border-slate-100 hover:border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
              >
                <span className="text-emerald-600 font-bold text-lg sm:text-xl w-10 sm:w-12 shrink-0">
                  {item.num}
                </span>

                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-bold text-base sm:text-lg leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {item.sub}
                  </p>
                </div>

                <span className="hidden sm:inline-flex w-8 h-8 rounded-full bg-emerald-600 text-white items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
