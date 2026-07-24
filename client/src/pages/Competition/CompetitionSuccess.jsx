import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

// Official support WhatsApp number (digits only, with country code).
const SUPPORT_WHATSAPP = "8801886699883";
// Human-readable form shown to the user.
const SUPPORT_WHATSAPP_DISPLAY = "+880 1886-699883";

export default function CompetitionSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const regNo = location.state?.regNo;

  // Direct visits (no registration data) have nothing to show — send them back.
  useEffect(() => {
    if (!regNo) navigate("/competition", { replace: true });
  }, [regNo, navigate]);

  if (!regNo) return null;

  const msg =
    `আসসালামু আলাইকুম,\n` +
    `আমি প্রতিযোগিতায় রেজিস্ট্রেশন সম্পন্ন করেছি।\n\n` +
    `📝 রেজিস্ট্রেশন নম্বর: ${regNo}\n`;
  const waLink = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="bg-gradient-to-b from-emerald-50 via-orange-50/30 to-white min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 md:p-10 text-center max-w-2xl w-full">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-emerald-500 w-8 h-8 sm:w-9 sm:h-9" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          রেজিস্ট্রেশন সম্পন্ন হয়েছে! 🎉
        </h1>
        <p className="text-gray-500 mb-4">
          আপনার সন্তানের নিবন্ধন সফলভাবে গ্রহণ করা হয়েছে।
        </p>
        <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-5 sm:px-6 py-3 mb-6 max-w-full">
          <p className="text-xs text-gray-500">রেজিস্ট্রেশন নম্বর</p>
          <p className="text-lg sm:text-xl font-black text-orange-600 tracking-wide break-all">
            {regNo}
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          এই নম্বরটি সংরক্ষণ করুন। প্রতিযোগিতার সময় প্রমাণের জন্য জন্মনিবন্ধন ফরম
          দেখাতে হবে।
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 bg-[#25D366] hover:bg-[#1ebe57] text-white px-4 sm:px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-green-500/25 transition-colors mb-6"
        >
          <FaWhatsapp className="w-5 h-5 shrink-0" />
          <span className="break-all">WhatsApp: {SUPPORT_WHATSAPP_DISPLAY}</span>
        </a>
        <Link
          to="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
