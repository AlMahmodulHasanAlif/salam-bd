import { motion } from "framer-motion";
import CLSlider from "./CLSlider";
import guranteeCard from "./assets/gurantecard.webp";
import userMenu from "./assets/usermenu.webp";
import syllabus from "./assets/syllabus.webp";
import registrationForm from "./assets/registrationform.webp";

const DOCUMENTS = [
  { src: guranteeCard, alt: "গ্যারান্টি কার্ড" },
  { src: userMenu, alt: "ইউজার মেনু" },
  { src: syllabus, alt: "সিলেবাস" },
  { src: registrationForm, alt: "মেধা যাচাই ফরম" },
];

export default function CLDocuments() {
  return (
    <section className="bg-gradient-to-b from-emerald-50/60 to-white py-14 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            গুরুত্বপূর্ণ ডকুমেন্ট
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900">
            গ্যারান্টি কার্ড, ইউজার মেনু, সিলেবাস, মেধা যাচাই ফরম
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <CLSlider images={DOCUMENTS} maxWidthClass="max-w-[90%] sm:max-w-lg" />
        </motion.div>
      </div>
    </section>
  );
}
