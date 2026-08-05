import { motion } from "framer-motion";

const CHANGES = [
  { icon: "🎯", title: "মনোযোগ বৃদ্ধি" },
  { icon: "🧠", title: "স্মৃতিশক্তি বৃদ্ধি" },
  { icon: "📖", title: "জ্ঞান শেখার আগ্রহ" },
  { icon: "🗣️", title: "উচ্চারণে দক্ষতা" },
  { icon: "🔢", title: "সংখ্যা শেখার সহজতা" },
  { icon: "💪", title: "আত্মবিশ্বাস বৃদ্ধি" },
  { icon: "🎨", title: "সৃজনশীলতা বৃদ্ধি" },
  { icon: "🏫", title: "শিক্ষার প্রতি আগ্রহ" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CLBenefits() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-4 leading-snug">
            Salam Coding Book আপনার সন্তানের{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              কী পরিবর্তন আনতে পারে?
            </span>
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {CHANGES.map((c) => (
            <motion.div
              key={c.title}
              variants={itemVariants}
              className="group flex flex-col items-center gap-3 bg-gradient-to-b from-emerald-50 to-transparent border border-emerald-100 hover:border-emerald-300 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                {c.icon}
              </div>
              <h3 className="text-slate-800 font-bold text-base">{c.title}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
