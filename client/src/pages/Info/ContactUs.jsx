// src/pages/Info/ContactUs.jsx
import React, { useState } from "react";
import InfoPageLayout from "./InfoPageLayout";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import contactBg from "../../assets/Cont.webp";

/* ring icon wrapper */
const CardIcon = ({ children }) => (
  <div className="w-16 h-16 rounded-full border border-white/40 flex items-center justify-center mx-auto mb-4">
    {children}
  </div>
);

const infoCards = [
  {
    icon: <Phone size={24} className="text-white" strokeWidth={1.8} />,
    label: "ফোন নম্বর",
    lines: ["01886699883"],
    href: "tel:+8801886699883",
  },
  {
    icon: <Mail size={24} className="text-white" strokeWidth={1.8} />,
    label: "ইমেইল ঠিকানা",
    lines: ["salambd.contact@gmail.com"],
    href: "mailto:salambd.contact@gmail.com",
  },
  {
    icon: <MapPin size={24} className="text-white" strokeWidth={1.8} />,
    label: "আমাদের ঠিকানা",
    lines: [
      "37 Ma Amena Plaza, (6th floor of Sundarban Courier),",
      "falpatti area, Mirpur-10, Dhaka-1216",
    ],
  },
  {
    icon: <Clock size={24} className="text-white" strokeWidth={1.8} />,
    label: "সেবার সময়",
    lines: ["24/7"],
  },
];

const subjects = [
  "অর্ডার সম্পর্কিত",
  "পণ্য সম্পর্কিত",
  "ডেলিভারি সম্পর্কিত",
  "অন্যান্য",
];

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    agree: false,
  });

  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim()) e.email = true;
    if (!form.phone.trim()) e.phone = true;
    if (!form.message.trim()) e.message = true;
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }

    setErrors({});
    setSent(true);

    setTimeout(() => setSent(false), 5000);

    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      agree: false,
    });
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm({ ...form, [key]: e.target.value });
      setErrors({ ...errors, [key]: false });
    },
  });

  const inputCls = (key) =>
    `w-full border rounded-lg px-4 py-3 text-sm bg-[#f5f5f0] placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
      errors[key]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-green-400 focus:ring-green-100"
    }`;

  return (
    <InfoPageLayout title="যোগাযোগ করুন" icon="📞">
      
      {/* Info strip */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 border border-white/20"
        style={{
          backgroundImage: `url(${contactBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Green glass overlay */}
        <div className="absolute inset-0 bg-[#1a6b3a]/75 backdrop-blur-[1.5px]" />

        {/* Columns */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {infoCards.map(({ icon, label, lines, href }, i) => (
            <div
              key={label}
              className={`relative flex flex-col items-center text-center px-6 py-10 md:py-14 ${
                i > 0
                  ? "md:before:content-[''] md:before:absolute md:before:left-0 md:before:top-1/2 md:before:-translate-y-1/2 md:before:h-40 md:before:w-px md:before:bg-white/25"
                  : ""
              }`}
            >
              <CardIcon>{icon}</CardIcon>

              <h3 className="font-serif text-xl font-semibold text-white mb-3">
                {label}
              </h3>

              <div className="space-y-1">
                {lines.map((ln, j) =>
                  href && j === 0 ? (
                    <a
                      key={j}
                      href={href}
                      className="block text-sm text-white/80 hover:text-white hover:underline"
                    >
                      {ln}
                    </a>
                  ) : (
                    <p key={j} className="text-sm text-white/70">
                      {ln}
                    </p>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form section */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">

        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-300 opacity-40"></div>

        <div className="relative z-10 bg-white/90 backdrop-blur-md p-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6">
            যোগাযোগ করুন
          </h2>

          {sent && (
            <div className="bg-green-50 border border-green-300 text-green-900 text-sm rounded-lg px-4 py-3 mb-5">
              ✅ আপনার বার্তা পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <input
                placeholder="পুরো নাম"
                className={inputCls("name")}
                {...field("name")}
              />

              <input
                type="email"
                placeholder="ইমেইল ঠিকানা"
                className={inputCls("email")}
                {...field("email")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <input
                placeholder="ফোন নম্বর"
                className={inputCls("phone")}
                {...field("phone")}
              />

              <select
                className={inputCls("subject")}
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
              >
                <option value="" disabled hidden>
                  বিষয় নির্বাচন করুন
                </option>

                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <textarea
              rows={5}
              placeholder="আপনার বার্তা এখানে লিখুন..."
              className={`${inputCls("message")} resize-none mb-4`}
              {...field("message")}
            />

            <label className="flex items-center gap-2 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) =>
                  setForm({ ...form, agree: e.target.checked })
                }
                className="w-4 h-4 accent-green-700"
              />
              <span className="text-sm text-gray-500">
                আমি সম্মত যে আমার তথ্য যোগাযোগের উদ্দেশ্যে ব্যবহার করা হবে।
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold text-sm py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
            >
              এখনই পাঠান <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Social */}
      <div className="flex gap-3 mt-6">
        <a
          href="#"
          className="bg-[#1877f2] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90"
        >
          Facebook
        </a>

        <a
          href="#"
          className="bg-[#25d366] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90"
        >
          WhatsApp
        </a>
      </div>
    </InfoPageLayout>
  );
};

export default ContactUs;