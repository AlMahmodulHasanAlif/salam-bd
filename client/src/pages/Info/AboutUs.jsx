// src/pages/Info/AboutUs.jsx
import React from "react";
import InfoPageLayout, { Section } from "./InfoPageLayout";

const AboutUs = () => (
  <InfoPageLayout title="আমাদের সম্পর্কে" icon="🕌">

    <div className="bg-green-800 text-white rounded-xl p-5 text-center">
      <p className="text-2xl font-bold mb-1">بَارَكَ اللّٰهُ</p>
      <p className="text-green-200 text-sm">বিশ্বাসের পথে, হালালের সাথে।</p>
    </div>

    <Section title="আমাদের পরিচয়">
      <p>
        সালাম বিডি একটি বিশ্বস্ত ইসলামিক পণ্যের অনলাইন শপ। আমরা বিশ্বাস করি যে
        একজন মুসলিম তার দৈনন্দিন জীবনে যে পণ্য ব্যবহার করেন, তা হওয়া উচিত হালাল,
        বিশুদ্ধ এবং আল্লাহর সন্তুষ্টি অর্জনের উপযোগী।
      </p>
    </Section>

    <Section title="আমাদের লক্ষ্য">
      <p>
        বাংলাদেশের প্রতিটি মুসলিম পরিবারের কাছে সাশ্রয়ী মূল্যে মানসম্পন্ন ইসলামিক পণ্য
        পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য। আমরা চাই প্রতিটি ঘর হোক বরকতময় ও ইসলামিক পরিবেশ।
      </p>
    </Section>

    <Section title="আমাদের পণ্য সমূহ">
      <ul className="list-none space-y-2">
        {[
          { icon: "📚", text: "ইসলামিক বই — কুরআন, হাদিস, তাফসির, দোয়ার বই" },
          { icon: "🖼️", text: "ওয়াল ফ্রেম ও ক্যালিগ্রাফি — ঘর সাজানোর ইসলামিক শিল্প" },
          { icon: "🌹", text: "আতর ও পারফিউম — হালাল, অ্যালকোহলমুক্ত সুগন্ধি" },
          { icon: "🧸", text: "শিশু পণ্য — ইসলামিক শিক্ষামূলক খেলনা, পোশাক ও বই" },
          { icon: "🕌", text: "হজ্ব ও ওমরা — ইহরাম, জমজম বোতল, গাইডবুক" },
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
        <li>100% হালাল ও বিশ্বাসযোগ্য পণ্য</li>
        <li>সারাদেশে দ্রুত ডেলিভারি</li>
        <li>ক্যাশ অন ডেলিভারির সুবিধা</li>
        <li>সহজ রিটার্ন ও রিফান্ড নীতি</li>
        <li>সার্বক্ষণিক কাস্টমার সাপোর্ট</li>
      
      </ul>
    </Section>

    <Section title="আমাদের প্রতিশ্রুতি">
      <p>
        আমরা শুধু পণ্য বিক্রি করি না — আমরা একটি ইসলামিক জীবনযাপনের সহচর হতে চাই।
        প্রতিটি অর্ডারে আমরা নিশ্চিত করি যে পণ্যটি সঠিক, মানসম্পন্ন এবং সঠিক সময়ে
        আপনার কাছে পৌঁছাবে। <strong>আল্লাহ আমাদের সবাইকে কবুল করুন। আমীন।</strong>
        
      </p>
    </Section>

    <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
      © ২০২৬ সালাম বিডি। সর্বস্বত্ব সংরক্ষিত।
    </p>
  </InfoPageLayout>
);

export default AboutUs;