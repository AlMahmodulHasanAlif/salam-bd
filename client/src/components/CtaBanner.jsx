// src/components/CtaBanner.jsx
import footerBg from "../assets/footerbg1.jpg";

export default function CtaBanner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(${footerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Text */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-snug drop-shadow-lg">
          আজ একটি সিদ্ধান্ত নিন।
          <br />
          আগামীকাল আপনার ঘরে কুরআনের ধ্বনি পৌঁছে দিন।
        </h2>
      </div>
    </section>
  );
}
