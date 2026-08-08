import { motion } from "framer-motion";
import { Languages, BookOpen, Calculator, SpellCheck } from "lucide-react";

const SUBJECTS = [
  { name: "বাংলা", color: "bg-emerald-500", ring: "ring-emerald-200", Icon: Languages },
  { name: "ইংরেজি", color: "bg-blue-500", ring: "ring-blue-200", Icon: BookOpen },
  { name: "অঙ্ক", color: "bg-orange-500", ring: "ring-orange-200", Icon: Calculator },
  { name: "আরবি", color: "bg-purple-500", ring: "ring-purple-200", arabic: true },
  { name: "ওয়ার্ড মিনিং", color: "bg-red-500", ring: "ring-red-200", Icon: SpellCheck },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export default function CLSubjects() {
  return (
    <section className="bg-[#0d1b2a] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
        
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
            একই ডিভাইসে শিখবে{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              ৫টি বিষয়
            </span>
          </h2>

        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {SUBJECTS.map((s) => (
            <motion.div
              key={s.name}
              variants={itemVariants}
              className={`group bg-white/5 border border-white/10 hover:border-white/25 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 ${s.ring} hover:ring-2`}
            >
              <div
                className={`mx-auto w-16 h-16 rounded-2xl ${s.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {s.arabic ? (
                  <span className="text-4xl font-black text-white leading-none">
                    ع
                  </span>
                ) : (
                  <s.Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
                )}
              </div>
              <div className={`mx-auto w-10 h-1.5 rounded-full ${s.color} mb-3`} />
              <h3 className="text-white font-bold text-lg">{s.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
