import { motion } from "framer-motion";

// Review copy: the picture's resolution was too low to read the full quotes,
// so these are placeholders — replace `text` with the real testimonials.
const REVIEWS = [
  {
    name: "অভিভাবক ইঞ্জিনিয়ার",
    location: "ঢাকা",
    initials: "ই",
    color: "bg-emerald-500",
    text: "আমার সন্তান এখন মোবাইলের বদলে নিজে নিজে শিখছে — Salam Coding Book সত্যিই অসাধারণ!",
  },
  {
    name: "মোঃ সাইফুল ইসলাম",
    location: "চট্টগ্রাম",
    initials: "স",
    color: "bg-blue-500",
    text: "খেলতে খেলতেই বাংলা ও ইংরেজি শিখে যাচ্ছে। দামও খুব যুক্তিসঙ্গত।",
  },
  {
    name: "সামিরা আক্তার",
    location: "সিলেট",
    initials: "সা",
    color: "bg-purple-500",
    text: "আরবি ও ওয়ার্ড মিনিং শেখার সুবিধা থাকায় ছোট বেলাতেই অনেক কিছু শিখে ফেলছে।",
  },
  {
    name: "নাজমা আক্তার",
    location: "রাজশাহী",
    initials: "না",
    color: "bg-amber-500",
    text: "চোখের ক্ষতির ভয় ছাড়াই নিরাপদে শেখার অভ্যাস গড়ে তুলেছে। ১০০% শিশু নিরাপদ।",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CLReviews() {
  return (
    <section className="bg-gradient-to-b from-emerald-50/60 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">
            Reviews
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">
            অভিভাবকদের{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
              ভালোবাসা
            </span>
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {REVIEWS.map((r) => (
            <motion.div
              key={r.name}
              variants={itemVariants}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-amber-400 text-lg tracking-widest mb-3">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                "{r.text}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full ${r.color} text-white flex items-center justify-center font-bold`}
                >
                  {r.initials}
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-sm">{r.name}</p>
                  <p className="text-slate-400 text-xs">{r.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
