import flash1 from "./assets/flash1.webp";
import flash2 from "./assets/flash2.webp";
import flash3 from "./assets/flash3.webp";
import flash4 from "./assets/flash4.webp";
import CLSlider from "./CLSlider";
import codingbookImg from "./assets/codingbook.jpeg";

import arabic1 from "./assets/books/Arabic/Arabic-1.webp";
import arabic2 from "./assets/books/Arabic/Arabic-2.webp";
import arabic3 from "./assets/books/Arabic/Arabic-3.webp";
import arabic4 from "./assets/books/Arabic/Arabic-4.webp";
import arabic5 from "./assets/books/Arabic/Arabic-5.webp";

import bangla1 from "./assets/books/Bangla/Bangla-1.webp";
import bangla2 from "./assets/books/Bangla/Bangla-2.webp";
import bangla3 from "./assets/books/Bangla/Bangla-3.webp";
import bangla4 from "./assets/books/Bangla/Bangla-4.webp";
import bangla5 from "./assets/books/Bangla/Bangla-5.webp";

import chora1 from "./assets/books/Chora/Chora-1.webp";
import chora2 from "./assets/books/Chora/Chora-2.webp";
import chora3 from "./assets/books/Chora/Chora-3.webp";
import chora4 from "./assets/books/Chora/Chora-4.webp";
import chora5 from "./assets/books/Chora/Chora-5.webp";

import eng1 from "./assets/books/english/Eng-1.webp";
import eng2 from "./assets/books/english/Eng-2.webp";
import eng3 from "./assets/books/english/Eng-3.webp";
import eng4 from "./assets/books/english/Eng-4.webp";
import eng5 from "./assets/books/english/Eng-5.webp";

import math1 from "./assets/books/Math/Math-1.webp";
import math2 from "./assets/books/Math/Math-2.webp";
import math3 from "./assets/books/Math/Math-3.webp";
import math4 from "./assets/books/Math/Math-4.webp";
import math5 from "./assets/books/Math/Math-5.webp";

import word1 from "./assets/books/WordMeaning/Word-1.webp";
import word2 from "./assets/books/WordMeaning/Word-2.webp";
import word3 from "./assets/books/WordMeaning/Word-3.webp";
import word4 from "./assets/books/WordMeaning/Word-4.webp";
import word5 from "./assets/books/WordMeaning/Word-5.webp";
import CLDocuments from "./CLDocuments";
import CLPackageContents from "./CLPackageContents";

const FLASH_CARDS = [
  { src: flash1, alt: "Flash Card ১" },
  { src: flash2, alt: "Flash Card ২" },
  { src: flash3, alt: "Flash Card ৩" },
  { src: flash4, alt: "Flash Card ৪" },
];

const BOOK_SECTIONS = [
  {
    title: "আরবি",
    images: [
      { src: arabic1, alt: "আরবি ১" },
      { src: arabic2, alt: "আরবি ২" },
      { src: arabic3, alt: "আরবি ৩" },
      { src: arabic4, alt: "আরবি ৪" },
      { src: arabic5, alt: "আরবি ৫" },
    ],
  },
  {
    title: "বাংলা",
    images: [
      { src: bangla1, alt: "বাংলা ১" },
      { src: bangla2, alt: "বাংলা ২" },
      { src: bangla3, alt: "বাংলা ৩" },
      { src: bangla4, alt: "বাংলা ৪" },
      { src: bangla5, alt: "বাংলা ৫" },
    ],
  },
  {
    title: "ছড়া",
    images: [
      { src: chora1, alt: "ছড়া ১" },
      { src: chora2, alt: "ছড়া ২" },
      { src: chora3, alt: "ছড়া ৩" },
      { src: chora4, alt: "ছড়া ৪" },
      { src: chora5, alt: "ছড়া ৫" },
    ],
  },
  {
    title: "ইংরেজি",
    images: [
      { src: eng1, alt: "ইংরেজি ১" },
      { src: eng2, alt: "ইংরেজি ২" },
      { src: eng3, alt: "ইংরেজি ৩" },
      { src: eng4, alt: "ইংরেজি ৪" },
      { src: eng5, alt: "ইংরেজি ৫" },
    ],
  },
  {
    title: "গণিত",
    images: [
      { src: math1, alt: "গণিত ১" },
      { src: math2, alt: "গণিত ২" },
      { src: math3, alt: "গণিত ৩" },
      { src: math4, alt: "গণিত ৪" },
      { src: math5, alt: "গণিত ৫" },
    ],
  },
  {
    title: "শব্দার্থ",
    images: [
      { src: word1, alt: "শব্দার্থ ১" },
      { src: word2, alt: "শব্দার্থ ২" },
      { src: word3, alt: "শব্দার্থ ৩" },
      { src: word4, alt: "শব্দার্থ ৪" },
      { src: word5, alt: "শব্দার্থ ৫" },
    ],
  },
];

const scrollToOrder = () =>
  document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });

export default function CLPackage() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <span className="text-emerald-600 text-sm font-semibold uppercase tracking-widest">
            প্যাকেজ
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-3 mb-4">
            "কোডিং বুক"{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              প্যাকেজে কি কি পাচ্ছেন
            </span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            এক অর্ডারেই — সম্পূর্ণ শেখার কিট
          </p>
        </div>

        <div className="mt-2 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
              Salam Coding Book
            </span>{" "} <br />
            এর সাথে যে ৬টি বই পাবেন
          </h2>

          <div className="mt-8 flex justify-center">
            <img
              src={codingbookImg}
              alt="Salam Coding Book"
              className="w-full max-w-sm rounded-2xl shadow-[0_-12px_50px_-10px_rgba(6,78,59,0.25)]"
            />
          </div>
        </div>

        {BOOK_SECTIONS.map((section) => (
          <div key={section.title} className="mt-14 text-center">
            <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-2xl md:text-3xl font-bold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-900/20">
              {section.title}
            </div>
            <div className="mt-6 flex justify-center">
              <CLSlider images={section.images} aspectClass="aspect-[4/5]" />
            </div>
          </div>
        ))}

        

        {/* Flashcards — 40 cards on 4 topics */}
        <div className="mt-10 text-center">
          <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xl md:text-2xl font-bold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-900/20 mt-3">
            চারটি বিষয়ে ৪০ টি ফ্লাশকার্ড
          </div>

          <div className="mt-5 flex justify-center">
            <CLSlider images={FLASH_CARDS} aspectClass="aspect-[5/4]" maxWidthClass="max-w-md md:max-w-lg" />
          </div>
        </div>

        <CLDocuments />
        <CLPackageContents />

        {/* CTA — order now after the slideshow */}
        <div className="text-center mt-10">
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all duration-300"
          >
            🛒 অর্ডার করুন
          </button>
        </div>
      </div>
    </section>
  );
}
