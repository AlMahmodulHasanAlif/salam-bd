// src/pages/Info/AboutUs.jsx
import React from "react";
import InfoPageLayout, { Section } from "./InfoPageLayout";

const AboutUs = () => (
  <InfoPageLayout title="আমাদের সম্পর্কে" icon="🕌">

    <div className="bg-green-800 text-white rounded-xl p-5 text-center">
      <p className="text-2xl font-bold mb-1">بَارَكَ اللّٰهُ</p>
      <p className="text-green-200 text-sm">প্রতিটি ঘরে পৌঁছে যাক কুরআনের ধ্বনি।</p>
    </div>

    <Section title="আমাদের পরিচয়">
      <p>
        সালাম বিডি একটি বিশ্বস্ত ইসলামিক প্রতিষ্ঠান, যারা প্লাগইন কুরআন ডিভাইস
        নিয়ে কাজ করে। একটি ছোট্ট ডিভাইসেই পাচ্ছেন পবিত্র কুরআনের তিলাওয়াত,
        শক্তিশালী রুকাইয়াহ, জিকিরসহ আরও অনেক কিছু — যা আপনার ঘরকে করে তুলবে
        বরকতময় ও প্রশান্তিময়।
      </p>
    </Section>

    <Section title="আমাদের লক্ষ্য">
      <p>
        বাংলাদেশের প্রতিটি মুসলিম পরিবারের ঘরে সাশ্রয়ী মূল্যে কুরআনের ধ্বনি পৌঁছে
        দেওয়াই আমাদের মূল লক্ষ্য। আমরা চাই প্রতিটি ঘর হোক আল্লাহর স্মরণে
        আলোকিত ও বদনজর-জাদু থেকে সুরক্ষিত।
      </p>
    </Section>

    <Section title="আমাদের প্লাগইন কুরআন ডিভাইসের বিশেষত্ব">
      <ul className="list-none space-y-2">
        {[
          { icon: "📖", text: "৬৪ সূরার সম্পূর্ণ তিলাওয়াত বিশ্বসেরা ক্বারীর কণ্ঠে" },
          { icon: "🛡️", text: "৫ ঘণ্টার শক্তিশালী রুকাইয়াহ তিলাওয়াত" },
          { icon: "🔊", text: "লাউড ও ক্রিস্টাল ক্লিয়ার HD সাউন্ড, ভলিউম কন্ট্রোল সহ" },
          { icon: "💡", text: "মাল্টি-ফাংশনাল ডিম লাইট ও ব্রাইটনেস কন্ট্রোল" },
          { icon: "📋", text: "সহজ পরিচালনার জন্য পূর্ণাঙ্গ বাংলা ইউজার ম্যানুয়েল" },
        ].map(({ icon, text }) => (
          <li key={text} className="flex items-start gap-2">
            <span className="text-lg leading-snug">{icon}</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </Section>

    <Section title="কেন আমাদের বেছে নেবেন">
      <ul className="list-disc pl-5 space-y-1">
        <li>৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি</li>
        <li>জীন-যাদু ও বদনজরের সমস্যায় ২৪/৭ লাইভ রুকাইয়াহ সাপোর্ট</li>
        <li>সারাদেশে দ্রুত ডেলিভারি</li>
        <li>ক্যাশ অন ডেলিভারির সুবিধা</li>
        <li>সহজ রিটার্ন ও রিফান্ড নীতি</li>
      </ul>
    </Section>

    <Section title="আমাদের প্রতিশ্রুতি">
      <p>
        আমরা শুধু একটি ডিভাইস বিক্রি করি না — আমরা প্রতিটি ঘরে কুরআনের প্রশান্তি
        পৌঁছে দিতে চাই। প্রতিটি অর্ডারে আমরা নিশ্চিত করি যে পণ্যটি সঠিক, মানসম্পন্ন
        এবং সঠিক সময়ে আপনার কাছে পৌঁছাবে।{" "}
        <strong>আল্লাহ আমাদের সবাইকে কবুল করুন। আমীন।</strong>
      </p>
    </Section>

    <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
      © ২০২৬ সালাম বিডি। সর্বস্বত্ব সংরক্ষিত।
    </p>
  </InfoPageLayout>
);

export default AboutUs;