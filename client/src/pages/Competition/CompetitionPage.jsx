import {
  Trophy,
  BookOpen,
  Gift,
  CheckCircle2,
  MessageCircle,
  Award,
} from "lucide-react";
import CompetitionForm from "./CompetitionForm";

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

const PRIZES = [
  { medal: "🥇", place: "১ম পুরস্কার", amount: "৩০,০০০/- টাকা" },
  { medal: "🥈", place: "২য় পুরস্কার", amount: "১০,০০০/- টাকা" },
  { medal: "🥉", place: "৩য় পুরস্কার", amount: "৮,০০০/- টাকা" },
  { medal: "🏅", place: "৪র্থ পুরস্কার", amount: "৩,০০০/- টাকা" },
  { medal: "🎖️", place: "৫ম পুরস্কার", amount: "২,০০০/- টাকা" },
];

export default function CompetitionPage() {
  return (
    <div className="bg-gradient-to-b from-emerald-50 via-orange-50/30 to-white min-h-screen">
      {/* ── Top banner ── */}
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-600 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4 text-amber-300" /> সালাম কোডিং বুক
          </span>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">
            মেধা যাচাই প্রতিযোগিতা
          </h1>
          <div className="inline-block bg-amber-400 text-emerald-950 font-black text-2xl md:text-4xl px-6 py-3 rounded-2xl shadow-lg my-3">
            ২ লক্ষ টাকার পুরস্কার
          </div>
          <p className="text-emerald-100 max-w-2xl mx-auto mt-4 text-sm md:text-base">
            ২–৫ বছরের শিশুরা এই প্রতিযোগিতায় অংশগ্রহণ করে জিতে নিতে পারে নগদ
            অর্থ, ক্রেস্ট ও সার্টিফিকেট।
          </p>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* ── Rules ── */}
        <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 md:p-8">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-emerald-800 mb-5">
            <CheckCircle2 className="w-6 h-6 text-orange-500" />
            প্রতিযোগিতায় অংশগ্রহণের নিয়ম
          </h2>
          <ol className="space-y-3">
            {RULES.map((rule, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {rule}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800">
              অফিসিয়াল WhatsApp: +88 018 411 411 07
            </p>
          </div>
        </section>

        {/* ── Syllabus ── */}
        <section>
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-emerald-800 mb-5">
            <BookOpen className="w-6 h-6 text-orange-500" /> সিলেবাস
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SYLLABUS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Prizes ── */}
        <section>
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-emerald-800 mb-5">
            <Gift className="w-6 h-6 text-orange-500" /> পুরস্কার
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIZES.map((p) => (
              <div
                key={p.place}
                className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 flex items-center gap-4"
              >
                <span className="text-4xl">{p.medal}</span>
                <div>
                  <p className="font-bold text-gray-800">{p.place}</p>
                  <p className="text-orange-600 font-black text-lg">
                    {p.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-2xl px-6 py-4 font-semibold">
            <Award className="w-5 h-5 text-amber-300" />
            সাথে রয়েছে ক্রেস্ট ও সার্টিফিকেট।
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
