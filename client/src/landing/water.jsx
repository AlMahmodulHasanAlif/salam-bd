import { motion } from "framer-motion";
import zamzam1 from "./zamzam1.png";
import zamzam2 from "./zamzam2.png";

export default function Water() {
  return (
    <section className="bg-[#0a0a0a] py-10 md:py-2 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block bg-emerald-400/10 border border-emerald-500/30 text-emerald-400 font-bold px-5 py-2 rounded-full text-sm uppercase tracking-widest mb-4"
          >
            💧 বিশেষ উপহার
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            <span className="text-emerald-400">জমজম মিশ্রিত পানি</span>
          </h2>
          <p className="text-gray-400 mt-3 text-lg">
            প্রতিটি অর্ডারে পাচ্ছেন পবিত্র জমজমের পানি মিশ্রিত একটি বিশেষ বোতল —
            একদম বিনামূল্যে
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-emerald-800/30 shadow-lg shadow-emerald-900/20"
          >
            <img
              src={zamzam1}
              alt="জমজম মিশ্রিত পানি"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-emerald-800/30 shadow-lg shadow-emerald-900/20 hidden md:block"
          >
            <img
              src={zamzam2}
              alt="জমজম মিশ্রিত পানি"
              className="w-full h-full object-cover "
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-r from-emerald-900/30 via-emerald-800/10 to-emerald-900/30 border border-emerald-700/30 rounded-2xl p-5 text-center"
        >
          <motion.p
            className="text-emerald-300 text-lg font-semibold"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            💧 ২৫০ মিলি জমজম মিশ্রিত পানি{" "}
            <span className="text-amber-400 font-bold">সম্পূর্ণ ফ্রি!</span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
