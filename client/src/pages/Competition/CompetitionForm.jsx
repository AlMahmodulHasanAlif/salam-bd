import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  MapPin,
  Users,
  Ticket,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Phone,
  Globe,
  Info,
  Headset,
} from "lucide-react";
import logo from "../../assets/SalamBDLogo.png";
import { DISTRICTS, BD_LOCATIONS } from "../../utils/bdLocations";

const API_URL = import.meta.env.VITE_API_URL;

const GRADE_OPTIONS = [
  "প্লে",
  "নার্সারি",
  "কেজি",
  "প্রথম শ্রেণি",
  "দ্বিতীয় শ্রেণি",
  "অন্যান্য",
];

const VALID_PHONE = /^01[3-9]\d{8}$/;
const MAX_IMAGE_KB = 30;
const MAX_IMAGE_BYTES = MAX_IMAGE_KB * 1024; // 30 KB

const STEPS = [
  { id: 1, label: "শিক্ষার্থীর তথ্য", icon: User },
  { id: 2, label: "ঠিকানা", icon: MapPin },
  { id: 3, label: "অভিভাবকের তথ্য", icon: Users },
  { id: 4, label: "কাস্টমার কোড", icon: Ticket },
  { id: 5, label: "সম্মতি", icon: ShieldCheck },
];

const INSTRUCTIONS = [
  "রেজিস্ট্রেশন ফরমটি সঠিকভাবে পূরণ করুন।",
  "শিক্ষার্থীর সাম্প্রতিক পরিষ্কার ছবি আপলোড করুন (সর্বোচ্চ ৩০KB)।",
  "সঠিক জন্ম তারিখ ও তথ্য প্রদান করুন।",
  "অভিভাবকের সচল মোবাইল নম্বর দিন।",
  "প্রতিযোগিতার সময় জন্মনিবন্ধন ফরম সাথে রাখতে হবে।",
  "একটি Coding Book দিয়ে একজন শিক্ষার্থী নিবন্ধন করতে পারবেন।",
  "ভুল তথ্য প্রদান করলে নিবন্ধন বাতিল বলে গণ্য হবে।",
];

const inputBase =
  "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors text-gray-800 placeholder-gray-400";
const inputNormal = `${inputBase} border-orange-200 focus:border-orange-500 bg-white`;
const inputError = `${inputBase} border-red-400 bg-red-50`;
const inputDisabled = `${inputBase} border-gray-200 bg-gray-50 text-gray-400`;

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-emerald-800 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Render only the active layout (mobile wizard vs. desktop single page).
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

async function uploadImage(fileOrBlob, filename = "upload.png") {
  const fd = new FormData();
  fd.append("image", fileOrBlob, filename);
  const res = await fetch(`${API_URL}/api/competition/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "ছবি আপলোড ব্যর্থ হয়েছে");
  return data.url;
}


const MobileStepper = ({ step }) => (
  <div className="flex items-center justify-between px-1 mb-6">
    {STEPS.map((s, i) => {
      const done = s.id < step;
      const active = s.id === step;
      return (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              active
                ? "bg-orange-500 text-white ring-4 ring-orange-100"
                : done
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {done ? <CheckCircle2 className="w-4 h-4" /> : s.id}
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-1 flex-1 mx-1.5 rounded-full ${
                s.id < step ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// 8-pointed Islamic star (Rub el Hizb style) badge with a gold outline.
const StarBadge = ({ children }) => (
  <span className="relative inline-flex items-center justify-center w-11 h-11 shrink-0">
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
      <path
        d="M50 4 L61.48 22.28 L82.53 17.47 L77.72 38.52 L96 50 L77.72 61.48 L82.53 82.53 L61.48 77.72 L50 96 L38.52 77.72 L17.47 82.53 L22.28 61.48 L4 50 L22.28 38.52 L17.47 17.47 L38.52 22.28 Z"
        className="fill-amber-400/15 stroke-amber-400"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
    <span className="relative text-amber-300">{children}</span>
  </span>
);

// Faint decorative mosque silhouette for the instructions card background.
const MosqueSilhouette = (props) => (
  <svg viewBox="0 0 220 140" fill="currentColor" {...props}>
    <rect x="34" y="40" width="11" height="90" rx="2" />
    <path d="M34 40 q5.5 -14 5.5 -14 q5.5 14 5.5 14 z" />
    <circle cx="39.5" cy="38" r="6" />
    <rect x="175" y="40" width="11" height="90" rx="2" />
    <path d="M175 40 q5.5 -14 5.5 -14 q5.5 14 5.5 14 z" />
    <circle cx="180.5" cy="38" r="6" />
    <rect x="60" y="72" width="100" height="58" rx="3" />
    <path d="M78 72 C78 44 92 30 110 24 C128 30 142 44 142 72 Z" />
    <rect x="107" y="10" width="6" height="16" rx="2" />
    <circle cx="110" cy="8" r="5" />
    <path d="M60 72 C60 58 66 52 74 50 C82 52 88 58 88 72 Z" />
    <path d="M132 72 C132 58 138 52 146 50 C154 52 160 58 160 72 Z" />
  </svg>
);

const SectionHead = ({ icon: Icon, title, hint }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-5 h-5 text-emerald-600" />
    <h3 className="font-bold text-emerald-800 whitespace-nowrap">
      {title}
      {hint && <span className="text-xs font-normal text-gray-400 ml-1">{hint}</span>}
    </h3>
    <div className="flex-1 border-t border-dashed border-orange-200 ml-1" />
  </div>
);

export default function CompetitionForm() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    grade: "",
    institution: "",
    village: "",
    thana: "",
    district: "",
    guardianName: "",
    mobile: "",
    customerCode: "",
    referral: "",
  });
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const thanaList = form.district ? BD_LOCATIONS[form.district] : [];

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((er) => ({ ...er, photo: "ছবির সাইজ সর্বোচ্চ ৩০KB হতে পারবে" }));
      return;
    }
    setPhotoUploading(true);
    setErrors((er) => ({ ...er, photo: "" }));
    try {
      const url = await uploadImage(file, file.name);
      setPhotoUrl(url);
    } catch (err) {
      setErrors((er) => ({ ...er, photo: err.message }));
    } finally {
      setPhotoUploading(false);
    }
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = "শিক্ষার্থীর নাম দিন";
      if (!form.dob.trim()) e.dob = "জন্ম তারিখ দিন";
      if (!form.grade.trim()) e.grade = "শ্রেণি নির্বাচন করুন";
      if (!form.institution.trim()) e.institution = "প্রতিষ্ঠানের নাম দিন";
    }
    if (s === 2) {
      if (!form.village.trim()) e.village = "গ্রাম / এলাকা লিখুন";
      if (!form.district.trim()) e.district = "জেলা নির্বাচন করুন";
      if (!form.thana.trim()) e.thana = "থানা নির্বাচন করুন";
    }
    if (s === 3) {
      if (!form.guardianName.trim()) e.guardianName = "অভিভাবকের নাম দিন";
      if (!VALID_PHONE.test(form.mobile)) e.mobile = "সঠিক মোবাইল নম্বর দিন";
    }
    if (s === 5) {
      if (!agreed) e.agreed = "সম্মতি প্রদান করুন";
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors((er) => ({ ...er, ...e }));
      return;
    }
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({
      top: (document.getElementById("reg-form")?.offsetTop || 40) - 20,
      behavior: "smooth",
    });
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    const allErrors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(5),
    };
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      // On the mobile wizard, jump to the first step that has an error.
      if (!isDesktop) {
        if (Object.keys(validateStep(1)).length) setStep(1);
        else if (Object.keys(validateStep(2)).length) setStep(2);
        else if (Object.keys(validateStep(3)).length) setStep(3);
        else setStep(5);
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/competition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: {
            name: form.name,
            dob: form.dob,
            grade: form.grade,
            institution: form.institution,
            photo: photoUrl || null,
          },
          address: {
            village: form.village,
            thana: form.thana,
            district: form.district,
          },
          guardian: { name: form.guardianName, mobile: form.mobile },
          customer: { code: form.customerCode, referral: form.referral },
          signature: null,
          agreed: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      navigate("/competition/success", { state: { regNo: data.regNo } });
    } catch (err) {
      alert(err.message || "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Reusable field pieces — shared by the mobile wizard and the
  // desktop single-page layout so the two never drift apart.
  // ─────────────────────────────────────────────────────────────
  const renderPhoto = (variant = "circle") => (
    <div
      className={
        variant === "square"
          ? "flex flex-col items-center"
          : "flex flex-col items-center"
      }
    >
      <label className="cursor-pointer group">
        <div
          className={`${
            variant === "square"
              ? "w-40 h-40 rounded-2xl"
              : "w-28 h-28 rounded-full"
          } border-2 border-dashed border-orange-300 bg-orange-50 flex flex-col items-center justify-center overflow-hidden group-hover:border-orange-500 transition-colors`}
        >
          {photoUploading ? (
            <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
          ) : photoUrl ? (
            <img
              src={photoUrl}
              alt="student"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <Camera className="w-8 h-8 text-orange-400" />
              {variant === "square" && (
                <span className="text-xs text-gray-500 mt-2">
                  ছবি নির্বাচন করুন
                </span>
              )}
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handlePhoto}
        />
      </label>
      <p className="text-xs text-gray-500 mt-2 text-center">
        ছবি আপলোড করুন <span className="text-gray-400">(JPG/PNG)</span>
      </p>
      <p className="text-[11px] font-semibold text-red-500 mt-0.5 text-center">
        ⚠️ ছবির সাইজ সর্বোচ্চ ৩০KB
      </p>
      {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
    </div>
  );

  const fName = () => (
    <Field label="শিক্ষার্থীর নাম" required error={errors.name}>
      <input
        type="text"
        placeholder="শিক্ষার্থীর নাম লিখুন"
        value={form.name}
        onChange={set("name")}
        className={errors.name ? inputError : inputNormal}
      />
    </Field>
  );
  const fDob = () => (
    <Field label="জন্ম তারিখ" required error={errors.dob}>
      <input
        type="date"
        value={form.dob}
        onChange={set("dob")}
        // Cap the year to 4 digits (native pickers otherwise allow 5+).
        min="1950-01-01"
        max="2100-12-31"
        className={errors.dob ? inputError : inputNormal}
      />
    </Field>
  );
  const fGrade = () => (
    <Field label="শ্রেণি" required error={errors.grade}>
      <select
        value={form.grade}
        onChange={set("grade")}
        className={errors.grade ? inputError : inputNormal}
      >
        <option value="">শ্রেণি নির্বাচন করুন</option>
        {GRADE_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    </Field>
  );
  const fInstitution = () => (
    <Field label="শিক্ষা প্রতিষ্ঠানের নাম" required error={errors.institution}>
      <input
        type="text"
        placeholder="প্রতিষ্ঠানের নাম লিখুন"
        value={form.institution}
        onChange={set("institution")}
        className={errors.institution ? inputError : inputNormal}
      />
    </Field>
  );
  const fVillage = () => (
    <Field label="গ্রাম / এলাকা" required error={errors.village}>
      <input
        type="text"
        placeholder="গ্রাম / এলাকা লিখুন"
        value={form.village}
        onChange={set("village")}
        className={errors.village ? inputError : inputNormal}
      />
    </Field>
  );
  const fDistrict = () => (
    <Field label="জেলা" required error={errors.district}>
      <select
        value={form.district}
        onChange={(e) => {
          setForm((f) => ({ ...f, district: e.target.value, thana: "" }));
          setErrors((er) => ({ ...er, district: "", thana: "" }));
        }}
        className={errors.district ? inputError : inputNormal}
      >
        <option value="">জেলা নির্বাচন করুন</option>
        {DISTRICTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </Field>
  );
  const fThana = () => (
    <Field label="থানা" required error={errors.thana}>
      <select
        value={form.thana}
        disabled={!form.district}
        onChange={set("thana")}
        className={
          !form.district ? inputDisabled : errors.thana ? inputError : inputNormal
        }
      >
        <option value="">
          {form.district ? "থানা নির্বাচন করুন" : "আগে জেলা নির্বাচন করুন"}
        </option>
        {thanaList.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </Field>
  );
  const fGuardian = () => (
    <Field label="অভিভাবকের নাম" required error={errors.guardianName}>
      <input
        type="text"
        placeholder="অভিভাবকের নাম লিখুন"
        value={form.guardianName}
        onChange={set("guardianName")}
        className={errors.guardianName ? inputError : inputNormal}
      />
    </Field>
  );
  const fMobile = () => (
    <Field label="মোবাইল নম্বর" required error={errors.mobile}>
      <input
        type="tel"
        placeholder="01XXXXXXXXX"
        value={form.mobile}
        onChange={(e) =>
          set("mobile")(e.target.value.replace(/\D/g, "").slice(0, 11))
        }
        className={errors.mobile ? inputError : inputNormal}
      />
    </Field>
  );
  const fCustomerCode = () => (
    <Field label="কাস্টমার কোড">
      <input
        type="text"
        placeholder="কাস্টমার কোড লিখুন"
        value={form.customerCode}
        onChange={set("customerCode")}
        className={inputNormal}
      />
    </Field>
  );
  const fReferral = () => (
    <Field label="রেফারেল / জরুরি (ঐচ্ছিক)">
      <input
        type="text"
        placeholder="রেফারেল লিখুন"
        value={form.referral}
        onChange={set("referral")}
        className={inputNormal}
      />
    </Field>
  );

  const renderConsent = () => (
    <div>
      <label className="flex items-start gap-3 cursor-pointer bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            if (e.target.checked) setErrors((er) => ({ ...er, agreed: "" }));
          }}
          className="mt-0.5 w-5 h-5 accent-emerald-600"
        />
        <span className="text-sm text-emerald-900">
          আমি প্রতিযোগিতার সকল নিয়ম মেনে নিচ্ছি এবং তথ্যগুলো সঠিক।
        </span>
      </label>
      {errors.agreed && <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // DESKTOP — single-page layout (sidebar + all sections)
  // ─────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div id="reg-form" className="grid grid-cols-[300px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="Salam" className="h-11 w-auto" />
              <div>
                <p className="font-black text-emerald-800 leading-tight">
                  সালাম কোডিং বুক
                </p>
                <p className="text-xs text-gray-500">মেধা যাচাই প্রতিযোগিতা</p>
              </div>
            </div>
            <div className="text-center mb-4">
              <span className="inline-block bg-orange-500 text-white text-sm font-bold px-5 py-1.5 rounded-full">
                রেজিস্ট্রেশন ফরম
              </span>
            </div>
            <ol className="relative pl-1">
              {STEPS.map((s, i) => (
                <li
                  key={s.id}
                  className="relative flex items-center gap-3 pb-5 last:pb-0"
                >
                  {/* vertical connector to the next step */}
                  {i < STEPS.length - 1 && (
                    <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 bg-gray-200" />
                  )}
                  <span
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                      i === 0
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.id}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── Instructions — dark green Islamic-themed card ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d3b24] to-[#062617] shadow-lg p-5">
            <MosqueSilhouette className="pointer-events-none absolute -bottom-1 -right-2 w-44 text-emerald-300/10" />

            {/* header */}
            <div className="relative flex items-center gap-3 mb-4">
              <StarBadge>
                <Info className="w-5 h-5" />
              </StarBadge>
              <h4 className="text-lg font-black text-amber-300">
                বিশেষ নির্দেশনা
              </h4>
            </div>
            <div className="relative flex items-center gap-2 mb-4 text-amber-400/70">
              <span className="h-px flex-1 bg-gradient-to-r from-amber-400/50 to-transparent" />
              <span className="text-xs leading-none">❖</span>
              <span className="h-px flex-1 bg-gradient-to-l from-amber-400/50 to-transparent" />
            </div>

            {/* list */}
            <ol className="relative space-y-3">
              {INSTRUCTIONS.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-md border border-amber-400/60 bg-amber-400/5 text-amber-300 text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-emerald-50/90 text-xs leading-relaxed pt-0.5">
                    {t}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── Contact — light blue support card ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-full bg-white ring-2 ring-blue-200 shadow flex items-center justify-center shrink-0">
                <Headset className="w-5 h-5 text-blue-700" />
              </span>
              <h4 className="text-sm font-black text-blue-900 leading-snug">
                সহায়তার জন্য যোগাযোগ করুন
              </h4>
            </div>
            <a
              href="tel:01886699883"
              className="flex items-center gap-3 bg-blue-50 rounded-xl p-2.5 mb-2.5 hover:bg-blue-100 transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </span>
              <span className="text-sm font-semibold text-blue-900">
                01886699883
              </span>
            </a>
            <a
              href="https://salambd.com/contact"
              className="flex items-center gap-3 bg-blue-50 rounded-xl p-2.5 hover:bg-blue-100 transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </span>
              <span className="text-sm font-semibold text-blue-900">
                salambd.com/contact
              </span>
            </a>
          </div>
        </aside>

        {/* Main form */}
        <main className="bg-white rounded-2xl border border-orange-100 shadow-sm p-8">
          {/* Student */}
          <SectionHead icon={User} title="শিক্ষার্থীর তথ্য" />
          <div className="grid grid-cols-[auto_1fr] gap-8 mb-8">
            <div>{renderPhoto("square")}</div>
            <div className="grid grid-cols-2 gap-4 content-start">
              {fName()}
              {fDob()}
              {fGrade()}
              {fInstitution()}
            </div>
          </div>

          {/* Address */}
          <SectionHead icon={MapPin} title="ঠিকানা" />
          <div className="grid grid-cols-3 gap-4 mb-8">
            {fDistrict()}
            {fThana()}
            {fVillage()}
          </div>

          {/* Guardian */}
          <SectionHead icon={Users} title="অভিভাবকের তথ্য" />
          <div className="grid grid-cols-2 gap-4 mb-8">
            {fGuardian()}
            {fMobile()}
          </div>

          {/* Customer code */}
          <SectionHead icon={Ticket} title="কাস্টমার কোড" hint="(যদি থাকে)" />
          <div className="grid grid-cols-2 gap-4 mb-8">
            {fCustomerCode()}
            {fReferral()}
          </div>

          {/* Consent */}
          <SectionHead icon={ShieldCheck} title="সম্মতি" />
          <div className="mb-8">{renderConsent()}</div>

          {/* Buttons */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <a
              href="/"
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
            </a>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> প্রসেসিং...
                </>
              ) : (
                <>
                  রেজিস্ট্রেশন সম্পন্ন করুন <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-5">
            <ShieldCheck className="w-3.5 h-3.5" /> আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে
            | আমরা আপনার তথ্য কারো সাথে শেয়ার করি না।
          </p>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MOBILE — 5-step wizard
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      id="reg-form"
      className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-5 flex items-center gap-3">
        <img
          src={logo}
          alt="Salam"
          className="h-11 w-auto bg-white/95 rounded-lg p-1"
        />
        <div className="text-white">
          <p className="font-black text-lg leading-tight">সালাম কোডিং বুক</p>
          <p className="text-emerald-100 text-xs">মেধা যাচাই প্রতিযোগিতা</p>
        </div>
        <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          ধাপ {step}/৫
        </span>
      </div>

      <div className="p-6">
        <div className="text-center mb-4">
          <span className="inline-block bg-orange-500 text-white text-sm font-bold px-6 py-1.5 rounded-full">
            রেজিস্ট্রেশন ফরম
          </span>
        </div>

        <MobileStepper step={step} />

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold">
              <User className="w-5 h-5 text-orange-500" /> শিক্ষার্থীর তথ্য
            </h3>
            {renderPhoto("circle")}
            {fName()}
            {fDob()}
            {fGrade()}
            {fInstitution()}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold">
              <MapPin className="w-5 h-5 text-orange-500" /> ঠিকানা
            </h3>
            {fDistrict()}
            {fThana()}
            {fVillage()}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold">
              <Users className="w-5 h-5 text-orange-500" /> অভিভাবকের তথ্য
            </h3>
            {fGuardian()}
            {fMobile()}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold">
              <Ticket className="w-5 h-5 text-orange-500" /> কাস্টমার কোড{" "}
              <span className="text-xs font-normal text-gray-400">(যদি থাকে)</span>
            </h3>
            {fCustomerCode()}
            {fReferral()}
            <p className="text-xs text-gray-400">
              কোডিং বুকের সাথে প্রদত্ত কাস্টমার কোড থাকলে এখানে দিন। না থাকলে এই ধাপ
              এড়িয়ে যেতে পারেন।
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-emerald-800 font-bold">
              <ShieldCheck className="w-5 h-5 text-orange-500" /> সম্মতি
            </h3>
            {renderConsent()}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-7">
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
            >
              পরবর্তী <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> প্রসেসিং...
                </>
              ) : (
                <>
                  রেজিস্ট্রেশন সম্পন্ন করুন <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4">
          <ShieldCheck className="w-3.5 h-3.5" /> আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে
        </p>
      </div>
    </div>
  );
}
