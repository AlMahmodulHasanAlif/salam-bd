import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "কেন Salam Coding Book আমার সন্তানের জন্য উপযোগী?",
    a: "৩ বছরের শিশুরাও এটি ব্যবহার করতে পারবে। খুব সহজে, খেলতে খেলতেই শিশুরা শেখার শুরু করতে পারে।",
  },
  {
    q: "বাংলা লিখতে শিখতে পারবে?",
    a: "হ্যাঁ, পুরো বাংলাতেই শিখতে পারবে।",
  },
  {
    q: "চার্জ কীভাবে?",
    a: "USB/চার্জিংয়ের মাধ্যমে।",
  },
  {
    q: "ইন্টারনেট লাগবে?",
    a: "না, ইন্টারনেটের প্রয়োজন নেই।",
  },
  {
    q: "ওয়ারেন্টি আছে?",
    a: "১০০ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি।",
  },
  {
    q: "দাম কত?",
    a: "ছবিতে প্রদর্শিত বর্তমান অফার অনুযায়ী — এখন মাত্র ৳২৫০০।",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function CLFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#7a1616] text-sm font-semibold uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            সাধারণ জিজ্ঞাসা
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-4"
        >
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                variants={itemVariants}
                className="rounded-xl overflow-hidden shadow-sm border-2 border-[#e24b4a]"
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-[#7a1616]"
                >
                  <span className="text-white font-bold text-sm md:text-base">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-white flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white"
                    >
                      <p className="px-6 py-4 text-gray-600 text-sm leading-relaxed">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}