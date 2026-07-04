// src/pages/Info/FAQ.jsx
import React, { useState } from "react";
import InfoPageLayout from "./InfoPageLayout";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "সালাম বিডিতে কীভাবে অর্ডার করব?",
    a: "পছন্দের পণ্যটি বাছাই করুন, কার্টে যোগ করুন এবং চেকআউটে গিয়ে ঠিকানা ও পেমেন্ট তথ্য দিন। অর্ডার নিশ্চিত হলে আপনাকে SMS ও ইমেইলে জানানো হবে।",
  },
  {
    q: "ডেলিভারি কতদিনে পাব?",
    a: "ঢাকার ভেতরে সাধারণত ২-৩ কার্যদিবসে এবং ঢাকার বাইরে ৩-৭ কার্যদিবসে ডেলিভারি দেওয়া হয়। বিশেষ পরিস্থিতিতে একটু বেশি সময় লাগতে পারে।",
  },
  {
    q: "কোন কোন পেমেন্ট পদ্ধতি গ্রহণযোগ্য?",
    a: "আমরা ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট এবং ভিসা/মাস্টারকার্ড গ্রহণ করি।",
  },
  {
    q: "পণ্য পছন্দ না হলে কি ফেরত দেওয়া যাবে?",
    a: "হ্যাঁ, ডেলিভারির 1 দিনের মধ্যে পণ্য ফেরত দেওয়া যাবে। পণ্যটি অব্যবহৃত ও মূল প্যাকেজিংসহ থাকতে হবে। বিস্তারিত জানতে আমাদের রিটার্ন পলিসি পড়ুন।",
  },
  {
    q: "অর্ডার ট্র্যাক করব কীভাবে?",
    a: "আপনার অ্যাকাউন্টে লগইন করে 'আমার অর্ডার' সেকশনে গেলে অর্ডারের বর্তমান অবস্থা দেখতে পাবেন।",
  },
  {
    q: "পণ্যগুলো কি হালাল সার্টিফাইড?",
    a: "আমরা শুধুমাত্র হালাল পণ্য বিক্রি করি। ",
  },
  {
    q: "পণ্যের গুণগত মান নিয়ে কোনো সমস্যা হলে কী করব?",
    a: "আমাদের ফোন (01886699883) বা ইমেইল (salambd.contact@gmail.com) এ যোগাযোগ করুন। আমরা দ্রুত সমাধান করব।",
  },
  {
    q: "কি ধরনের পণ্য পাওয়া যায়?",
    a: "ইসলামিক বই, ওয়াল ফ্রেম ও ক্যালিগ্রাফি, আতর ও পারফিউম, শিশুদের ইসলামিক পণ্য (খেলনা, বই, পোশাক) এবং হজ্ব ও ওমরার সামগ্রী পাওয়া যায়।",
  },
  {
    q: "কোনো পণ্য স্টকে না থাকলে কি আগাম বুকিং দেওয়া যায়?",
    a: "হ্যাঁ, স্টকে না থাকা পণ্যের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা পুনরায় স্টক হলে আপনাকে জানাব।",
  },
  {
    q: "ডেলিভারি চার্জ কত?",
    a: "ঢাকার ভেতরে 80Taka এবং ঢাকার বাইরে 120Taka টাকা ডেলিভারি চার্জ। ",
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left
                   hover:bg-green-50 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-green-700 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
};

const FAQ = () => (
  <InfoPageLayout title="সচরাচর জিজ্ঞাসা (FAQ)" icon="❓">
    <p>আপনার মনে যদি কোনো প্রশ্ন থাকে, নিচে উত্তর খুঁজে পেতে পারেন।</p>
    <div className="space-y-3 !mt-6">
      {FAQS.map((item, i) => (
        <FAQItem key={i} {...item} />
      ))}
    </div>
    <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-2">
      <p className="text-sm text-green-800 font-medium">আপনার প্রশ্নের উত্তর পাননি?</p>
      <p className="text-sm text-green-700 mt-1">
        আমাদের সাথে সরাসরি যোগাযোগ করুন: 📞 01886699883 বা 📧 salambd.contact@gmail.com
      </p>
    </div>
  </InfoPageLayout>
);

export default FAQ;