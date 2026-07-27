import { BookOpen, Gift, Calculator, Lightbulb, Trophy } from "lucide-react";
import CompetitionForm from "./CompetitionForm";
import prizeDesktop from "../../assets/prize.png";
import prizeMobile from "../../assets/prizemobile.png";

const RULES = [
  "শুধুমাত্র যারা সালাম কোডিং বুক (Grade-1) ক্রয় করবেন এবং এর নিবন্ধিত ব্যবহারকারী, তারাই এই প্রতিযোগিতায় অংশগ্রহণ করতে পারবেন।",
  "প্রতিযোগিতার প্রাথমিক সিলেবাস হবে অনলাইনে।",
  "কোডিং বুকের সাথে প্রদত্ত ৬টি সম্পূর্ণ পিডিএফ থাকবে। এই ৬টি বই থেকেই মৌলিক ৫০টি প্রশ্ন করা হবে।",
  "আগ্রহীরা আমাদের Website বা Salam Apps-এ নিবন্ধন সম্পন্ন করতে পারবেন।",
  "প্রতিটি কোডিং বুকের ভেতরে রেজিস্ট্রেশন ফরম দেওয়া থাকবে। ফরমটি পূরণ করে মোবাইলে ছবি তুলে আমাদের অফিসিয়াল WhatsApp নম্বরে পাঠাতে হবে।",
  "প্রতিযোগিতার সময় প্রমাণের জন্য জন্মনিবন্ধন ফরম দেখাতে হবে।",
];

const SYLLABUS = [
  {
    title: "ছোটদের বাংলা শিক্ষা",
    body: "স্বরবর্ণ, ব্যঞ্জনবর্ণ। স্বরবর্ণ ও ব্যঞ্জনবর্ণ দিয়ে শব্দ গঠন (১০টি)। যেমন: অ-তে অজগর, ই-তে ইঁদুর।",
  },
  {
    title: "ছোটদের ইংলিশ",
    body: "Alphabet, Alphabet দিয়ে ১০টি শব্দ গঠন। যেমন: A is for Ant, B is for Bird।",
  },
  {
    title: "ছোটদের অঙ্ক শিক্ষা",
    body: "১–৫০ পর্যন্ত গণনা, ১–৫০ পর্যন্ত ইংরেজিতে গণনা।",
  },
  {
    title: "ছোটদের আরবি শিক্ষা",
    body: "সঠিক উচ্চারণে আরবি বর্ণমালা, ৪টি হরকত, ১০টি দৈনন্দিন দোয়া, ২টি কালিমা।",
  },
  {
    title: "ছোটদের সাধারণ জ্ঞান",
    body: "৫টি ফুলের নাম, ৫টি মাছের নাম, ৫টি পাখির নাম, ৫টি ফলের নাম, ৫টি পশুর নাম।",
  },
  {
    title: "ছোটদের সংখ্যা চেনা",
    body: "৩টি বাংলা ছড়া ও ৩টি ইংরেজি ছড়া।",
  },
];

// Right-side illustrative icon for each syllabus card (matches SYLLABUS order).
const SYLLABUS_ICONS = [
  <span className="text-3xl font-bold text-emerald-800">অ</span>,
  <div className="flex items-center -space-x-1.5">
    {["A", "B", "C"].map((c) => (
      <span
        key={c}
        className="w-6 h-6 rounded-full bg-white border-2 border-emerald-600 text-emerald-700 text-[11px] font-bold flex items-center justify-center"
      >
        {c}
      </span>
    ))}
  </div>,
  <Calculator className="w-8 h-8 text-emerald-700" strokeWidth={1.75} />,
  <span className="text-3xl font-bold text-emerald-800">أ</span>,
  <Lightbulb className="w-8 h-8 text-emerald-700" strokeWidth={1.75} />,
  <span className="text-xl font-black text-emerald-800">123</span>,
];

// Each prize has its own metallic gradient theme (gold, silver, bronze, green, teal)
const PRIZES = [
  {
    place: "১ম পুরস্কার",
    amount: "৩০,০০০/-",
    unit: "টাকা",
    card: "from-yellow-50 to-amber-100 border-amber-300",
    trophy: "from-amber-300 to-yellow-600",
    ribbon: "from-amber-400 to-yellow-600",
    swoosh: "from-amber-300 to-yellow-500",
  },
  {
    place: "২য় পুরস্কার",
    amount: "১০,০০০/-",
    unit: "টাকা",
    card: "from-slate-50 to-slate-200 border-slate-300",
    trophy: "from-slate-300 to-slate-500",
    ribbon: "from-slate-400 to-slate-500",
    swoosh: "from-slate-300 to-slate-400",
  },
  {
    place: "৩য় পুরস্কার",
    amount: "৮,০০০/-",
    unit: "টাকা",
    card: "from-orange-50 to-orange-100 border-orange-300",
    trophy: "from-orange-400 to-amber-700",
    ribbon: "from-orange-500 to-amber-700",
    swoosh: "from-orange-400 to-amber-600",
  },
  {
    place: "৪র্থ পুরস্কার",
    amount: "৩,০০০/-",
    unit: "টাকা",
    card: "from-green-50 to-green-100 border-green-300",
    trophy: "from-lime-400 to-green-600",
    ribbon: "from-lime-500 to-green-600",
    swoosh: "from-lime-400 to-green-500",
  },
  {
    place: "৫ম পুরস্কার",
    amount: "২,০০০/-",
    unit: "টাকা",
    card: "from-teal-50 to-teal-100 border-teal-300",
    trophy: "from-teal-300 to-teal-600",
    ribbon: "from-teal-400 to-teal-600",
    swoosh: "from-teal-300 to-teal-500",
  },
];

export default function CompetitionPage() {
  return (
    <div className="bg-gradient-to-b from-emerald-50 via-orange-50/30 to-white min-h-screen">
      {/* ── Prize banner (separate art for desktop vs mobile) ── */}
      <img
        src={prizeMobile}
        alt="মেধা যাচাই প্রতিযোগিতা — ২ লক্ষ টাকার পুরস্কার"
        className="block md:hidden w-full h-auto"
      />
      <img
        src={prizeDesktop}
        alt="মেধা যাচাই প্রতিযোগিতা — ২ লক্ষ টাকার পুরস্কার"
        className="hidden md:block w-full h-auto"
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* ── Rules ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-emerald-100/70 border-4 border-[#12592f] shadow-lg">
          {/* gold corner brackets */}
          <span className="pointer-events-none absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-400 rounded-tl-lg z-10" />
          <span className="pointer-events-none absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-400 rounded-tr-lg z-10" />
          {/* gold swoosh at the bottom */}
          <span className="pointer-events-none absolute -bottom-12 -right-6 w-64 h-28 border-b-4 border-amber-400/70 rounded-[100%] rotate-[-8deg]" />

          {/* ── dark green header bar ── */}
          <div className="bg-gradient-to-r from-[#0b3d21] via-[#12592f] to-[#0b3d21] flex items-center justify-center gap-3 py-4 px-4">
            <span className="text-amber-400 text-2xl leading-none tracking-tighter select-none">
              ❮❮
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-amber-50 text-center px-2">
              প্রতিযোগিতায় অংশগ্রহণের নিয়ম
            </h2>
            <span className="text-amber-400 text-2xl leading-none tracking-tighter select-none">
              ❯❯
            </span>
          </div>

          {/* ── body ── */}
          <div className="relative p-6 md:p-8">
            <ol className="space-y-4">
              {RULES.map((rule, i) => (
                <li key={i} className="flex gap-3 md:gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-[#12592f] text-white font-bold text-sm flex items-center justify-center shadow-md">
                    {i + 1}
                  </span>
                  <p className="text-[#0f4d2a] text-base md:text-lg leading-relaxed pt-0.5">
                    {rule}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Syllabus ── */}
        <section>
          {/* centered header with ornamental divider */}
          <div className="text-center mb-8">
            <h2 className="inline-flex items-center gap-2.5 text-2xl md:text-3xl font-bold text-emerald-800">
              <BookOpen className="w-7 h-7 text-amber-500" /> সিলেবাস
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-amber-400">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-sm tracking-[0.3em] leading-none">
                ❖❖❖
              </span>
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SYLLABUS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow p-5 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-b from-emerald-500 to-[#12592f] text-white font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-emerald-800">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-amber-50 ring-4 ring-amber-100 border border-amber-200 flex items-center justify-center">
                  {SYLLABUS_ICONS[i]}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Prizes ── */}
        <section>
          {/* header: title left, crest note right */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-emerald-800">
              <Gift className="w-6 h-6 text-orange-500" /> পুরস্কার
            </h2>
            <p className="flex items-center gap-2 text-amber-600 font-semibold text-sm md:text-base">
              <Trophy className="w-5 h-5 text-amber-500" />
              সাথে রয়েছে ক্রেস্ট ও সার্টিফিকেট
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PRIZES.map((p) => (
              <div
                key={p.place}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b ${p.card}
                           shadow-md hover:shadow-xl transition-shadow pt-6 pb-9 px-3
                           flex flex-col items-center text-center`}
              >
                {/* Trophy badge */}
                <div
                  className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b ${p.trophy}
                             flex items-center justify-center ring-4 ring-white/60 shadow-lg mb-4`}
                >
                  <Trophy
                    className="w-9 h-9 sm:w-12 sm:h-12 text-white drop-shadow"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Ribbon banner */}
                <div
                  className={`relative z-10 mb-4 px-6 py-1.5 text-white font-bold text-xs sm:text-sm shadow
                             bg-gradient-to-r ${p.ribbon}
                             [clip-path:polygon(0_0,100%_0,90%_50%,100%_100%,0_100%,10%_50%)]`}
                >
                  {p.place}
                </div>

                {/* Amount */}
                <p className="relative z-10 text-xl sm:text-2xl font-black text-emerald-900 leading-none">
                  {p.amount}
                </p>
                <p className="relative z-10 text-base sm:text-lg font-bold text-emerald-900">
                  {p.unit}
                </p>

                {/* bottom metallic swoosh */}
                <div
                  className={`pointer-events-none absolute -bottom-8 -inset-x-8 h-16 rounded-[100%]
                             bg-gradient-to-r ${p.swoosh}`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Registration form ── */}
        <section id="register" className="scroll-mt-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-800">
              এখনই রেজিস্ট্রেশন করুন
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              নিচের ফরমটি পূরণ করে আপনার সন্তানের মেধা যাচাই করুন
            </p>
          </div>
          <div className="max-w-2xl lg:max-w-none mx-auto">
            <CompetitionForm />
          </div>
        </section>
      </div>
    </div>
  );
}
