import { Clock, ShieldCheck, Headphones } from "lucide-react";
import SupportForm from "./SupportForm";

const TRUST = [
  {
    icon: Clock,
    title: "দ্রুত সাড়া নিশ্চয়তা",
    text: "২৪ ঘন্টার মধ্যে সাড়া দেওয়ার প্রতিশ্রুতি",
    badge: "24h",
  },
  {
    icon: ShieldCheck,
    title: "১০০ দিনের নিশ্চিত গ্যারান্টি",
    text: "১০০ দিনের রিপ্লেসমেন্ট ও সাপোর্ট গ্যারান্টি",
  },
  {
    icon: Headphones,
    title: "সাপোর্ট টিম সর্বদা সাথে আছে",
    text: "আমরা আপনার সমস্যা সমাধানে প্রতিশ্রুতিবদ্ধ",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <SupportForm />

        {/* Trust bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST.map((t) => (
            <div
              key={t.title}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="relative w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <t.icon className="w-5 h-5" />
                {t.badge && (
                  <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-emerald-600 text-white rounded-full px-1.5 py-0.5">
                    {t.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{t.title}</p>
                <p className="text-xs text-gray-500">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
