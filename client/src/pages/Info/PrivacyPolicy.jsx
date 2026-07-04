// src/pages/Info/PrivacyPolicy.jsx
import React from "react";
import InfoPageLayout, { Section } from "./InfoPageLayout";

const PrivacyPolicy = () => (
  <InfoPageLayout title="Privacy & Policy" icon="">

    <p>
      <span className="font-bold">সালাম বিডিতে </span>আপনাকে স্বাগতম। আপনার ব্যক্তিগত তথ্যের সুরক্ষা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ।
      এই নীতিটি ব্যাখ্যা করে যে আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সংরক্ষণ করি।
    </p>

    <Section title="তথ্য সংগ্রহ">
      <p>আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:</p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>নাম, ইমেইল ঠিকানা ও ফোন নম্বর</li>
        <li>ডেলিভারি ঠিকানা ও অর্ডারের বিবরণ</li>
        <li>পেমেন্ট সংক্রান্ত তথ্য (কার্ড নম্বর সংরক্ষণ করা হয় না)</li>
        <li>ওয়েবসাইট ব্রাউজিং কার্যক্রম ও কুকিজ</li>
      </ul>
    </Section>

    <Section title="তথ্যের ব্যবহার">
      <p>আপনার তথ্য আমরা যেভাবে ব্যবহার করি:</p>
      <ul className="list-disc pl-5 space-y-1 mt-1">
        <li>অর্ডার প্রক্রিয়াকরণ ও ডেলিভারি নিশ্চিত করতে</li>
        <li>কাস্টমার সার্ভিস প্রদান করতে</li>
        <li>নতুন পণ্য ও অফার সম্পর্কে জানাতে (আপনার সম্মতিতে)</li>
        <li>ওয়েবসাইটের অভিজ্ঞতা উন্নত করতে</li>
      </ul>
    </Section>

    <Section title="তথ্যের সুরক্ষা">
      <p>
        আমরা আপনার তথ্য সুরক্ষিত রাখতে SSL এনক্রিপশন ও সুরক্ষিত সার্ভার ব্যবহার করি।
        আপনার অনুমতি ছাড়া আমরা কখনো তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি
        বা শেয়ার করি না।
      </p>
    </Section>

    <Section title="কুকিজ নীতি">
      <p>
        আমাদের ওয়েবসাইট আপনার অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করে। আপনি চাইলে
        ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারেন, তবে এতে কিছু ফিচার সঠিকভাবে
        কাজ না-ও করতে পারে।
      </p>
    </Section>


    <Section title="যোগাযোগ">
      <p>
        গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:<br />
        📧 salambd.contact@gmail.com  <br />
        📞 01886699883
      </p>
    </Section>

    <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
      সর্বশেষ আপডেট: মার্চ ২০২৬
    </p>
  </InfoPageLayout>
);

export default PrivacyPolicy;