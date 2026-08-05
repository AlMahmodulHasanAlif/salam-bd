// src/landing/PluginOrderSuccess.jsx
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  MapPin,
  Phone,
  Package,
  ShoppingBag,
  Calendar,
  BookOpen,
  Image,
  CheckCircle,
} from "lucide-react";

import logo from "../assets/SalamBDLogo.png";

const WHATSAPP_LINK = "https://wa.me/8801860989372";

const WhatsAppIcon = ({ className = "w-4 h-4 fill-current" }) => (
  <svg viewBox="0 0 32 32" className={className}>
    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.494 2.027 7.808L0 32l8.418-2.006A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.851l-.486-.29-5 1.192 1.215-4.87-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.906c-.398-.2-2.355-1.162-2.72-1.294-.365-.133-.631-.2-.897.2-.265.398-1.03 1.294-1.263 1.56-.232.266-.465.3-.863.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.056-1.983-2.36-2.216-2.758-.232-.398-.025-.613.175-.811.179-.178.398-.465.598-.698.2-.232.265-.398.398-.664.133-.266.066-.498-.033-.698-.1-.2-.897-2.162-1.23-2.96-.324-.778-.653-.673-.897-.686l-.764-.013c-.266 0-.697.1-1.063.498-.365.398-1.395 1.362-1.395 3.323s1.428 3.855 1.627 4.121c.2.265 2.81 4.29 6.808 6.018.951.41 1.694.655 2.273.839.955.303 1.824.26 2.511.157.766-.114 2.355-.963 2.687-1.893.332-.93.332-1.728.232-1.893-.099-.166-.365-.266-.763-.465z" />
  </svg>
);

const PluginOrderSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

  // Always start at the top of the success page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If someone lands here without order state, redirect back to landing
  useEffect(() => {
    if (!order) {
      const timer = setTimeout(() => navigate("/landing"), 3000);
      return () => clearTimeout(timer);
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <div>
          <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-400 text-sm">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  const {
    orderId,
    placedAt,
    product = {},
    quantity = 1,
    subtotal = 0,
    total = 0,
    freeDelivery = false,
    shippingCharge = 0,
    billing = {},
  } = order;

  const formattedDate = placedAt
    ? new Date(placedAt).toLocaleString("en-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Logo */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-center bg-green-700 py-4">
        <img
          src={logo}
          alt="Salam BD"
          className="h-14 cursor-pointer"
          onClick={() => navigate("/landing")}
        />
      </div>

      {/* Heartfelt Message — navbar width */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8 mb-6 text-center leading-relaxed text-[17px] text-gray-700 w-full">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              জাযাকুমুল্লাহু খাইরান।
            </h1>
            {orderId && (
              <p className="mt-2 text-xs text-gray-400">
                Order ID:{" "}
                <span className="font-mono text-gray-600 font-semibold">
                  #{typeof orderId === "string" ? orderId.slice(-8).toUpperCase() : orderId}
                </span>
              </p>
            )}
            {formattedDate && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
                <Calendar size={11} />
                {formattedDate}
              </p>
            )}
          </div>

          <div className="max-w-2xl mx-auto text-justify space-y-3">
            <p>
              আল্লাহর রহমতে আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
            </p>
            <p>
              📞 কিছুক্ষণের মধ্যেই আমাদের প্রতিনিধি আপনার দেওয়া মোবাইল নম্বরে কল করবেন।
              অনুগ্রহ করে ফোনটি সচল রাখুন।
            </p>
            <p>
              <span className="font-bold">একটি আন্তরিক অনুরোধ:</span> অনুগ্রহ করে অর্ডারটি গ্রহণের ব্যাপারে নিশ্চিত থাকুন। কুরিয়ারে পাঠানোর পর বিনা কারণে অর্ডার বাতিল করলে আমাদের প্রতি অর্ডারে ১৫০ টাকা কুরিয়ার ও প্রসেসিং খরচ বহন করতে হয়। যেহেতু এটি একটি দ্বীনি উদ্যোগ, তাই অপ্রয়োজনীয় ক্ষতি থেকে আমাদের রক্ষা করতে আপনার আন্তরিক সহযোগিতা কামনা করছি। আল্লাহ তাআলা আপনাকে উত্তম প্রতিদান দান করুন। আমীন।
            </p>
          </div>

          {/* Contact & Suggestions */}
          <div className="border-t border-gray-100 pt-4 space-y-3">

            <div className="flex flex-col items-center gap-3 text-gray-700 border border-green-200 rounded-xl p-4 bg-green-50/40">
              <div className="flex items-start justify-center gap-2">
                <BookOpen size={18} className="mt-0.5 shrink-0 text-green-600" />
                <span>
                  রুকইয়াহ, হিংসা, জাদু, বদনজর ও শারঈ চিকিৎসা সম্পর্কে বিস্তারিত জানতে
                  আমাদের রুকইয়াহ বই সংগ্রহ করতে পারেন।
                </span>
              </div>
              <Link
                to="/books"
                className="inline-flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition"
              >
                <BookOpen size={15} />
                এখানে ক্লিক করুন
              </Link>
            </div>

            <div className="flex flex-col items-center gap-3 text-gray-700 border border-green-200 rounded-xl p-4 bg-green-50/40">
              <div className="flex items-start justify-center gap-2">
                <Image size={18} className="mt-0.5 shrink-0 text-green-600" />
                <span>
                  ইসলামিক চোখ দিয়ে  আপনার ঘরকে দেখতে আমাদের Wallframe গুলো দেখতে পারেন।
                </span>
              </div>
              <Link
                to="/wallframe"
                className="inline-flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition"
              >
                <Image size={15} />
                এখানে ক্লিক করুন
              </Link>
            </div>

            {/* WhatsApp */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#25D366] hover:bg-[#1ebe5c] text-white px-2 sm:px-4 py-3 rounded-xl font-bold transition text-xs sm:text-sm"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Invoice — Order Details */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">

          {/* Shipping Info */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-green-600" />
              Delivery Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <Package size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <span>{billing.name}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <Phone size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <span>{billing.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <span>
                  {billing.address}
                  {billing.detailAddress && `, ${billing.detailAddress}`}
                  {billing.district && `, ${billing.district}`}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package size={16} className="text-green-600" />
              Items Ordered (1)
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-xl bg-gray-50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {product.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    ৳{product.price} × {quantity}
                  </p>
                </div>
                <p className="font-semibold text-green-700 shrink-0">
                  ৳{subtotal.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="p-5 bg-gray-50">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {freeDelivery ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="font-medium text-gray-700">
                    ৳{shippingCharge.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-medium text-gray-700">Cash on Delivery</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-base">
                <span>Total Paid</span>
                <span className="text-green-700 text-lg">
                  ৳{total.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Delivery Note */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mb-6 flex items-start gap-2">
          <ShoppingBag size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Estimated Delivery:</strong> 1–3 business days. Our team
            will contact you on <strong>{billing.phone}</strong> before delivery.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PluginOrderSuccess;
