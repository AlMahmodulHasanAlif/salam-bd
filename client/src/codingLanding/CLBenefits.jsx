import { motion } from "framer-motion";

const CHANGES = [
  {
    icon: "🎯",
    title: "মনোযোগ বৃদ্ধি",
    bg: "from-[#154C28] via-[#257339] to-[#4FA66A]",
  },
  {
    icon: "🧠",
    title: "স্মৃতিশক্তি বৃদ্ধি",
    bg: "from-[#123F22] via-[#257339] to-[#3F925B]",
  },
  {
    icon: "📖",
    title: "জ্ঞান শেখার আগ্রহ",
    bg: "from-[#1A542D] via-[#2E8147] to-[#5AAE72]",
  },
  {
    icon: "🗣️",
    title: "উচ্চারণে দক্ষতা",
    bg: "from-[#0E2F1A] via-[#257339] to-[#4FA66A]",
  },
  {
    icon: "🔢",
    title: "সংখ্যা শেখার সহজতা",
    bg: "from-[#154C28] via-[#2D7D45] to-[#62B77C]",
  },
  {
    icon: "💪",
    title: "আত্মবিশ্বাস বৃদ্ধি",
    bg: "from-[#123F22] via-[#287B43] to-[#4FA66A]",
  },
  {
    icon: "🎨",
    title: "সৃজনশীলতা বৃদ্ধি",
    bg: "from-[#0E2F1A] via-[#1F6938] to-[#56A96F]",
  },
  {
    icon: "🏫",
    title: "শিক্ষার প্রতি আগ্রহ",
    bg: "from-[#154C28] via-[#317F49] to-[#6BBC83]",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export default function CLBenefits() {
  return (
    <section className="py-16 bg-[#F8FCF9]">
      <div className="max-w-6xl mx-auto px-4">

        {/* Heading */}
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-4 leading-snug">
            Salam Coding Book আপনার সন্তানের{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              কী পরিবর্তন আনতে পারে?
            </span>
          </h2>
        </div>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-50px",
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {CHANGES.map((c) => (
            <motion.div
              key={c.title}
              variants={itemVariants}
              className={`
                group
                flex flex-col items-center
                justify-center
                gap-3
                bg-gradient-to-br ${c.bg}
                rounded-2xl
                p-6
                text-center
                shadow-[0_8px_25px_rgba(21,76,40,0.18)]
                border border-white/20
                transition-all duration-300
                hover:scale-105
                hover:shadow-[0_12px_35px_rgba(21,76,40,0.28)]
              `}
            >
              {/* Icon */}
              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-white/20
                  backdrop-blur-sm
                  border border-white/30
                  shadow-lg
                  flex items-center justify-center
                  text-3xl
                  group-hover:scale-110
                  group-hover:rotate-3
                  transition-all duration-300
                "
              >
                {c.icon}
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-base md:text-lg drop-shadow-sm">
                {c.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}