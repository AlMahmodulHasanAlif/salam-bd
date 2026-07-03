// src/pages/Info/ReturnPolicy.jsx
import React from "react";
import InfoPageLayout, { Section } from "./InfoPageLayout";

const ReturnPolicy = () => (
  <InfoPageLayout title="রিটার্ন পলিসি" icon="">

    <p>
       <span className="font-bold">সালাম বিডি </span> সর্বদা আপনার সন্তুষ্টি নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। পণ্যে কোনো সমস্যা
      হলে আমরা <span className="font-bold">রিটার্ন ও রিফান্ডের</span> সুবিধা প্রদান করি।
    </p>

    <Section title="রিটার্নের শর্তাবলী">
      <ul className="list-disc pl-5 space-y-1">
        <li>পণ্য ডেলিভারির <strong>১ দিনের মধ্যে</strong> রিটার্নের আবেদন করতে হবে</li>
        <li>পণ্যটি অব্যবহৃত ও মূল প্যাকেজিংসহ থাকতে হবে</li>
        <li>পণ্যের ট্যাগ ও লেবেল অক্ষত থাকতে হবে</li>
        <li>ক্রয়ের রসিদ বা অর্ডার নম্বর থাকতে হবে</li>
      </ul>
    </Section>

    <Section title="যেসব ক্ষেত্রে রিটার্ন গ্রহণযোগ্য">
      <ul className="list-disc pl-5 space-y-1">
        <li>ত্রুটিপূর্ণ বা ক্ষতিগ্রস্ত পণ্য প্রাপ্তি</li>
        <li>ভুল পণ্য ডেলিভারি</li>
        <li>পণ্যের বিবরণের সাথে অমিল</li>
        <li>অর্ডার করা সাইজ বা রঙ ভুল হলে</li>
      </ul>
    </Section>

    <Section title="যেসব পণ্য রিটার্নযোগ্য নয়">
      <ul className="list-disc pl-5 space-y-1">
        <li>আতর ও পারফিউম (ব্যবহার করা হলে)</li>
        <li>ডিজিটাল পণ্য বা ডাউনলোডযোগ্য আইটেম</li>
        <li>সেল বা ডিসকাউন্টে কেনা পণ্য (বিশেষ ক্ষেত্রে ব্যতীত)</li>
        <li>কাস্টমাইজড বা বিশেষভাবে তৈরি পণ্য</li>
      </ul>
    </Section>

    <Section title="রিফান্ড প্রক্রিয়া">
      <p>রিটার্ন অনুমোদনের পর রিফান্ড নিম্নোক্ত উপায়ে প্রদান করা হবে:</p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>বিকাশ / নগদ / রকেটে <strong>৩-৫ কার্যদিবসের</strong> মধ্যে</li>
        <li>ব্যাংক ট্রান্সফারে <strong>৫-৭ কার্যদিবসের</strong> মধ্যে</li>
        <li>স্টোর ক্রেডিট হিসেবে তাৎক্ষণিকভাবে</li>
      </ul>
    </Section>

    <Section title="কীভাবে রিটার্ন করবেন">
      <ol className="list-decimal pl-5 space-y-1">
        <li>আমাদের ফোন বা ইমেইলে যোগাযোগ করুন</li>
        <li>অর্ডার নম্বর ও সমস্যার বিবরণ জানান</li>
        <li>পণ্যের ছবি পাঠান</li>
        <li>আমাদের নির্দেশনা অনুযায়ী পণ্য পাঠান</li>
      </ol>
    </Section>

    <Section title="যোগাযোগ">
      <p>
        রিটার্ন সংক্রান্ত যেকোনো সহায়তার জন্য:<br />
        📧 info@salambd.com <br /> 📞 +880 1860-989372
      </p>
    </Section>

    <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
      সর্বশেষ আপডেট: মার্চ ২০২৬
    </p>
  </InfoPageLayout>
);

export default ReturnPolicy;