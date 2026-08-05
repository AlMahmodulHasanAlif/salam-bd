import { motion } from "framer-motion";
import { Link } from "react-router";
import logo from "../assets/SalamBDLogo.png";
import heroImg from "./assets/placeholder-hero.svg";

const TRUST_BADGES = [
  { icon: "👁️", text: "স্থায়ী চোখের ক্ষতি কমায়" },
  { icon: "🗣️", text: "নিজের ভাষায় শিখতে পারে" },
  { icon: "🛡️", text: "১০০% শিশু নিরাপদ" },
];

const scrollToOrder = () =>
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });

export default function CLHero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50/40 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl" />

      {/* ── Navbar ── */}
      <nav className="absolute top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none">
            <img src={logo} alt="Salam BD Logo" className="h-10 md:h-14 w-auto" />
          </Link>
          <button
            onClick={scrollToOrder}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm md:text-base px-5 py-2 md:px-6 md:py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-emerald-900/20 hover:scale-105"
          >
            অর্ডার করুন
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="relative max-w-6xl mx-auto px-6 min-h-screen grid lg:grid-cols-2 gap-10 items-center content-center pb-16 pt-24">
        {/* Left — copy */}
        <div className="text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-1.5 rounded-full mb-6"
          >
            📚 SALAM CODING BOOK
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4"
          >
            আপনার সন্তান কি{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              সারাদিন মোবাইল
            </span>{" "}
            নিয়েই ব্যস্ত?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl font-bold text-slate-800 mb-2"
          >
            এখন থেকে খেলতে খেলতেই শিখুক
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-slate-600 text-base md:text-lg mb-8"
          >
            বাংলা, ইংরেজি, অঙ্ক, আরবি, ওয়ার্ড মিনিং ও ছড়া-কবিতা
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
          >
            {TRUST_BADGES.map((b) => (
              <span
                key={b.text}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-sm px-3 py-1.5 rounded-full shadow-sm"
              >
                <span>{b.icon}</span> {b.text}
              </span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <button
              onClick={scrollToOrder}
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xl px-10 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-900/20 hover:scale-105 w-full sm:w-auto"
            >
              <span>🛒</span> এখনই অর্ডার করুন
              <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                HOT
              </span>
            </button>
            <div className="text-center">
              <p className="text-slate-400 text-xs line-through">মূল্য ৳৩৫০০</p>
              <p className="text-slate-800 font-black text-2xl">
                ৳২৫০০ <span className="text-sm font-semibold text-emerald-600">মাত্র</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right — product visual */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="absolute inset-0 rounded-3xl bg-emerald-200/40 blur-3xl scale-90" />
          <div className="relative rounded-3xl overflow-hidden border border-white shadow-2xl shadow-slate-300/60 w-full max-w-md aspect-square">
            <img
              src={heroImg}
              alt="Salam Coding Book"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="absolute -bottom-4 left-4 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 border border-slate-100">
            <span className="text-xl">🧒</span>
            <span className="text-xs font-bold text-slate-700">
              প্রথম Learning Partner
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
