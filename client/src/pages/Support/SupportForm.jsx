import { useState, useEffect } from "react";
import {
  User,
  Phone,
  FileText,
  Calendar,
  MessageSquare,
  Volume2,
  Volume1,
  Plug,
  BatteryLow,
  Code2,
  MoreHorizontal,
  ImageIcon,
  Video,
  ShieldCheck,
  Send,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ClipboardList,
  X,
} from "lucide-react";
import logo from "../../assets/SalamBDLogo.png";

const API_URL = import.meta.env.VITE_API_URL;
const VALID_PHONE = /^01[3-9]\d{8}$/;
const IMAGE_MAX = 5 * 1024 * 1024; // 5 MB
const VIDEO_MAX = 20 * 1024 * 1024; // 20 MB
const DETAILS_MAX = 1000;

const COMPLAINT_TYPES = [
  { id: "speaker", no: "০১", label: "স্পিকার নষ্ট", icon: Volume2 },
  { id: "charging", no: "০২", label: "চার্জ নেয় না", icon: Plug },
  { id: "sound", no: "০৩", label: "সাউন্ড ক্লিয়ার না", icon: Volume1 },
  { id: "battery", no: "০৪", label: "ব্যাটারি চার্জ থাকে না", icon: BatteryLow },
  { id: "coding", no: "০৫", label: "কোডিং কাজ করছে না", icon: Code2 },
  { id: "other", no: "০৬", label: "অন্যান্য", icon: MoreHorizontal },
];

const COMMITMENTS = [
  "আপনার অভিযোগ সর্বোচ্চ গুরুত্ব দিয়ে দেখা হবে",
  "২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করা হবে",
  "প্রয়োজনে রিপ্লেসমেন্ট / সমাধান নিশ্চিত করা হবে",
  "আপনার তথ্য সম্পূর্ণ নিরাপদ ও গোপন রাখা হবে",
];

// Only one layout mounts at a time (mobile wizard vs. desktop two-column).
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

async function uploadMedia(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_URL}/api/support/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "ফাইল আপলোড ব্যর্থ হয়েছে");
  return data.url;
}

const IconField = ({ icon: Icon, label, required, error, children }) => (
  <div>
    <div
      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 bg-white transition-colors ${
        error
          ? "border-red-400 bg-red-50"
          : "border-gray-200 focus-within:border-emerald-500"
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-[11px] font-medium text-gray-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
      </div>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputCls =
  "w-full text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent";

export default function SupportForm() {
  const isDesktop = useIsDesktop();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    orderId: "",
    purchaseDate: "",
    type: "",
    typeLabel: "",
    details: "",
  });
  const [image, setImage] = useState({ url: "", name: "", uploading: false });
  const [video, setVideo] = useState({ url: "", name: "", uploading: false });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const selectType = (t) => {
    setForm((f) => ({ ...f, type: t.id, typeLabel: t.label }));
    setErrors((er) => ({ ...er, type: "" }));
  };

  const handleFile = async (e, kind) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setter = kind === "image" ? setImage : setVideo;
    const max = kind === "image" ? IMAGE_MAX : VIDEO_MAX;
    const label = kind === "image" ? "ছবি সর্বোচ্চ ৫MB" : "ভিডিও সর্বোচ্চ ২০MB";
    if (file.size > max) {
      setErrors((er) => ({ ...er, [kind]: label }));
      return;
    }
    setErrors((er) => ({ ...er, [kind]: "" }));
    setter({ url: "", name: file.name, uploading: true });
    try {
      const url = await uploadMedia(file);
      setter({ url, name: file.name, uploading: false });
    } catch (err) {
      setter({ url: "", name: "", uploading: false });
      setErrors((er) => ({ ...er, [kind]: err.message }));
    }
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = "আপনার নাম দিন";
      if (!VALID_PHONE.test(form.mobile)) e.mobile = "সঠিক মোবাইল নম্বর দিন";
    }
    if (s === 2) {
      if (!form.type) e.type = "অভিযোগের ধরন নির্বাচন করুন";
      if (!form.details.trim()) e.details = "সমস্যার বিস্তারিত লিখুন";
      if (!agreed) e.agreed = "সম্মতি প্রদান করুন";
    }
    return e;
  };

  const next = () => {
    const e = validateStep(1);
    if (Object.keys(e).length) return setErrors((er) => ({ ...er, ...e }));
    if (!isDesktop) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document
        .getElementById("complaint-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async () => {
    const e = { ...validateStep(1), ...validateStep(2) };
    if (Object.keys(e).length) {
      setErrors(e);
      if (!isDesktop && (e.name || e.mobile)) setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            mobile: form.mobile,
            orderId: form.orderId,
            purchaseDate: form.purchaseDate,
          },
          complaint: {
            type: form.type,
            typeLabel: form.typeLabel,
            details: form.details,
            image: image.url || null,
            video: video.url || null,
          },
          agreed: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "অভিযোগ জমা ব্যর্থ হয়েছে");
      setResult({ ticketNo: data.ticketNo });
    } catch (err) {
      alert(err.message || "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared field renderers ──
  const fName = () => (
    <IconField icon={User} label="আপনার নাম" required error={errors.name}>
      <input
        type="text"
        placeholder="আপনার পূর্ণ নাম লিখুন"
        value={form.name}
        onChange={set("name")}
        className={inputCls}
      />
    </IconField>
  );
  const fMobile = () => (
    <IconField icon={Phone} label="মোবাইল নম্বর" required error={errors.mobile}>
      <input
        type="tel"
        placeholder="01XXXXXXXXX"
        value={form.mobile}
        onChange={(e) =>
          set("mobile")(e.target.value.replace(/\D/g, "").slice(0, 11))
        }
        className={inputCls}
      />
    </IconField>
  );
  const fOrderId = () => (
    <IconField icon={FileText} label="অর্ডার আইডি">
      <input
        type="text"
        placeholder="যেমন: SCB123456"
        value={form.orderId}
        onChange={set("orderId")}
        className={inputCls}
      />
    </IconField>
  );
  const fDate = () => (
    <IconField icon={Calendar} label="ক্রয়ের তারিখ">
      <input
        type="date"
        value={form.purchaseDate}
        onChange={set("purchaseDate")}
        className={inputCls}
      />
    </IconField>
  );

  const typeGrid = () => (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">
        অভিযোগের ধরন নির্বাচন করুন <span className="text-red-500">*</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {COMPLAINT_TYPES.map((t) => {
          const active = form.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectType(t)}
              className={`relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                active
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 text-gray-500"
                }`}
              >
                <t.icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-medium text-gray-700 flex-1 leading-tight">
                {t.no}. {t.label}
              </span>
              <span
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  active ? "border-emerald-500" : "border-gray-300"
                }`}
              >
                {active && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </span>
            </button>
          );
        })}
      </div>
      {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
    </div>
  );

  const detailsField = () => (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">
        সমস্যার বিস্তারিত লিখুন <span className="text-red-500">*</span>
      </p>
      <div className="relative">
        <textarea
          rows={4}
          maxLength={DETAILS_MAX}
          placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন..."
          value={form.details}
          onChange={set("details")}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors resize-none ${
            errors.details
              ? "border-red-400 bg-red-50"
              : "border-gray-200 focus:border-emerald-500 bg-white"
          }`}
        />
        <span className="absolute bottom-2 right-3 text-[11px] text-gray-400">
          {form.details.length}/{DETAILS_MAX}
        </span>
      </div>
      {errors.details && (
        <p className="text-xs text-red-500 mt-1">{errors.details}</p>
      )}
    </div>
  );

  const mediaButtons = (showVideo = true) => (
    <div className={`grid gap-3 ${showVideo ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
      {/* Image */}
      <div>
        <label className="cursor-pointer flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 px-4 py-3 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-emerald-600 flex-shrink-0">
            {image.uploading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <ImageIcon className="w-4.5 h-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">
              {image.url ? "✓ ছবি যুক্ত হয়েছে" : "ছবি আপলোড করুন"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {image.name || "JPG, PNG (Max 5MB)"}
            </p>
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e, "image")}
          />
        </label>
        {image.url && (
          <button
            type="button"
            onClick={() => setImage({ url: "", name: "", uploading: false })}
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-500 hover:underline"
          >
            <X className="w-3 h-3" /> সরান
          </button>
        )}
        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
      </div>

      {/* Video */}
      {showVideo && (
      <div>
        <label className="cursor-pointer flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 px-4 py-3 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-orange-500 flex-shrink-0">
            {video.uploading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <Video className="w-4.5 h-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">
              {video.url ? "✓ ভিডিও যুক্ত হয়েছে" : "ভিডিও আপলোড করুন"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {video.name || "MP4 (Max 20MB)"}
            </p>
          </div>
          <input
            type="file"
            accept="video/mp4"
            className="hidden"
            onChange={(e) => handleFile(e, "video")}
          />
        </label>
        {video.url && (
          <button
            type="button"
            onClick={() => setVideo({ url: "", name: "", uploading: false })}
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-500 hover:underline"
          >
            <X className="w-3 h-3" /> সরান
          </button>
        )}
        {errors.video && <p className="text-xs text-red-500 mt-1">{errors.video}</p>}
      </div>
      )}
    </div>
  );

  const summaryBox = () => (
    <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-orange-500" />
        <p className="text-sm font-bold text-gray-700">অভিযোগের সারাংশ</p>
        <span className="text-[11px] text-gray-400">
          সব তথ্য যাচাই করে সাবমিট করুন
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { icon: User, label: "নাম", value: form.name || "আপনার নাম" },
          { icon: Phone, label: "মোবাইল", value: form.mobile || "01XXXXXXXXX" },
          { icon: FileText, label: "অর্ডার আইডি", value: form.orderId || "SCB123456" },
          {
            icon: Calendar,
            label: "তারিখ",
            value: form.purchaseDate || "নির্বাচন করুন",
          },
          {
            icon: MoreHorizontal,
            label: "অভিযোগের ধরন",
            value: form.typeLabel || "নির্বাচিত হবে",
          },
        ].map((s) => (
          <div key={s.label} className="flex items-start gap-2">
            <s.icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400">{s.label}</p>
              <p className="text-xs font-medium text-gray-700 truncate">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const consentBox = () => (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            if (e.target.checked) setErrors((er) => ({ ...er, agreed: "" }));
          }}
          className="mt-0.5 w-5 h-5 accent-emerald-600 flex-shrink-0"
        />
        <span className="text-sm text-gray-600">
          আমি নিশ্চিত যে, প্রদত্ত তথ্য সঠিক এবং আমি ১০০ দিনের গ্যারান্টি নীতিমালা
          পড়েছি ও সম্মত হয়েছি। <span className="text-red-500">*</span>
        </span>
      </label>
      {errors.agreed && <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>}
    </div>
  );

  const submitBtn = () => (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={submitting}
      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-base px-6 py-3.5 rounded-xl transition-colors"
    >
      {submitting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" /> প্রসেসিং...
        </>
      ) : (
        <>
          অভিযোগ জমা দিন <Send className="w-4.5 h-4.5" />
        </>
      )}
    </button>
  );

  const commitmentCard = () => (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <p className="font-bold text-emerald-800">আমাদের অঙ্গীকার</p>
      </div>
      <ul className="space-y-2">
        {COMMITMENTS.map((c) => (
          <li key={c} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  // ── Success screen ──
  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 md:p-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-emerald-500 w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          অভিযোগ জমা হয়েছে! ✅
        </h2>
        <p className="text-gray-500 mb-4">
          আমরা ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব।
        </p>
        <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-6 py-3 mb-6">
          <p className="text-xs text-gray-500">টিকিট নম্বর</p>
          <p className="text-xl font-black text-orange-600 tracking-wide">
            {result.ticketNo}
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          এই নম্বরটি সংরক্ষণ করুন — যোগাযোগের সময় প্রয়োজন হবে।
        </p>
        <a
          href="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          হোমে ফিরে যান
        </a>
      </div>
    );
  }

  const Header = () => (
    <div className="flex items-center justify-between gap-4 mb-6">
      <img src={logo} alt="Salam Coding Book" className="h-11 w-auto" />
      <div className="text-center flex-1">
        <h1 className="text-xl sm:text-3xl font-black text-emerald-800 leading-tight">
          ১০০ দিনের গ্যারান্টি সাপোর্ট
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          আপনার সমস্যা দ্রুত সমাধানের জন্য অভিযোগ জমা দিন
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <div className="leading-none">
          <p className="text-sm font-black text-emerald-700">100 DAYS</p>
          <p className="text-[10px] text-emerald-600 tracking-wide">GUARANTEE</p>
        </div>
      </div>
    </div>
  );

  const Stepper = () => (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 || isDesktop
              ? "bg-emerald-600 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          1
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-gray-400">Step 1</p>
          <p className="text-sm font-semibold text-gray-700">
            Customer Information
          </p>
        </div>
      </div>
      <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: step >= 2 || isDesktop ? "100%" : "0%" }}
        />
      </div>
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 || isDesktop
              ? "bg-emerald-600 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          2
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-gray-400">Step 2</p>
          <p className="text-sm font-semibold text-gray-700">Complaint Details</p>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // DESKTOP — two-column single page
  // ─────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div>
        <Header />
        <Stepper />
        <div className="grid grid-cols-[380px_1fr] gap-6 items-start">
          {/* Left — customer info + commitment */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800">গ্রাহকের তথ্য</p>
                  <p className="text-xs text-gray-400">আপনার সঠিক তথ্য দিন</p>
                </div>
              </div>
              <div className="space-y-3">
                {fName()}
                {fMobile()}
                {fOrderId()}
                {fDate()}
              </div>
            </div>
            {commitmentCard()}
          </div>

          {/* Right — complaint details */}
          <div
            id="complaint-section"
            className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-emerald-800">অভিযোগের বিস্তারিত</p>
                <p className="text-xs text-gray-400">
                  আপনার সমস্যার বিস্তারিত জানান
                </p>
              </div>
            </div>
            {typeGrid()}
            {detailsField()}
            {mediaButtons(false)}
            {summaryBox()}
            {consentBox()}
            {submitBtn()}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MOBILE — 2-step wizard
  // ─────────────────────────────────────────────────────────────
  return (
    <div>
      <Header />
      <Stepper />

      {step === 1 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-800">গ্রাহকের তথ্য</p>
              <p className="text-xs text-gray-400">আপনার সঠিক তথ্য দিন</p>
            </div>
          </div>
          {fName()}
          {fMobile()}
          {fOrderId()}
          {fDate()}
          <button
            type="button"
            onClick={next}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            পরবর্তী ধাপ <ArrowRight className="w-4 h-4" />
          </button>
          <div className="pt-1">{commitmentCard()}</div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-800">অভিযোগের বিস্তারিত</p>
              <p className="text-xs text-gray-400">আপনার সমস্যার বিস্তারিত জানান</p>
            </div>
          </div>
          {typeGrid()}
          {detailsField()}
          {mediaButtons()}
          {summaryBox()}
          {consentBox()}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              পূর্ববর্তী
            </button>
            <div className="flex-1">{submitBtn()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
