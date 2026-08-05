import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Minus,
  Plus,
} from "lucide-react";
import productImg from "./assets/placeholder-product.svg";
import { GTM } from "../utils/gtm";
import { getAttribution } from "../utils/attribution";
import useIncompleteOrder from "../hooks/useIncompleteOrder";
import { BD_LOCATIONS, DISTRICTS } from "../utils/bdLocations";

// ── Product config ─────────────────────────────────────────────────────────
// Server re-prices from its own copy (back-end/controllers/CodingOrderController.js)
// — keep the two in sync. Change image/name here and swap the SVG placeholder
// in ./assets for a real product image when ready.
const PRODUCT = {
  name: "Salam Coding Book",
  price: 1500,
  image: productImg,
  freeDelivery: true,
};

const SHIPPING_ZONES = [
  { id: "outside_dhaka", label: "ঢাকা সিটির বাইরে", charge: 120 },
  { id: "inside_dhaka", label: "ঢাকা সিটি", charge: 80 },
];

const VALID_PHONE = /^01[3-9]\d{8}$/;

const inputBase =
  "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors text-gray-800 placeholder-gray-400";
const inputNormal = `${inputBase} border-orange-300 focus:border-orange-500 bg-white`;
const inputError = `${inputBase} border-red-400 bg-red-50`;
const inputDisabled = `${inputBase} border-gray-200 bg-gray-50 text-gray-400`;

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default function CodingOrderForm() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState(SHIPPING_ZONES[0]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    detailAddress: "",
    district: "",
    country: "Bangladesh",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const checkoutFired = useRef(false);

  const subtotal = PRODUCT.price * quantity;
  const total = PRODUCT.freeDelivery ? subtotal : subtotal + shipping.charge;

  const thanaList = form.district ? BD_LOCATIONS[form.district] : [];

  // Capture the form as an "incomplete order" so a visitor who fills it in but
  // never submits still shows up in the admin panel for follow-up.
  const { draftId, clearDraft } = useIncompleteOrder({
    source: "coding",
    data: {
      customer: {
        name: form.name,
        phone: form.phone,
        address: [form.address, form.detailAddress].filter(Boolean).join(", "),
        thana: form.address,
        district: form.district,
        country: form.country,
      },
      items: [
        {
          name: PRODUCT.name,
          image: PRODUCT.image,
          price: PRODUCT.price,
          quantity,
        },
      ],
      estimatedTotal: total,
      attribution: getAttribution(),
    },
  });

  const handleFormFocus = () => {
    if (checkoutFired.current) return;
    checkoutFired.current = true;
    GTM.initiateCheckout({
      content_ids: [PRODUCT.name],
      content_type: "product",
      value: total,
      currency: "BDT",
      num_items: quantity,
    });
  };

  const handleDistrictChange = (value) => {
    setForm((f) => ({ ...f, district: value, address: "" }));
    setErrors((er) => ({ ...er, district: "", address: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "নাম দিন";
    if (!form.phone.trim()) e.phone = "ফোন নাম্বার দিন";
    else if (!VALID_PHONE.test(form.phone))
      e.phone = "সঠিক ফোন নাম্বার দিন (use valid phone number)";
    if (!form.district) e.district = "জেলা নির্বাচন করুন";
    if (!form.address.trim()) e.address = "থানা / উপজেলা নির্বাচন করুন";
    if (!form.detailAddress.trim()) e.detailAddress = "বিস্তারিত ঠিকানা দিন";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) throw new Error("VITE_API_URL is not defined");
      const response = await fetch(`${API_URL}/api/codingorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product: {
            name: PRODUCT.name,
            price: PRODUCT.price,
            quantity,
            image: PRODUCT.image,
          },
          billing: {
            name: form.name,
            phone: form.phone,
            address: `${form.address}, ${form.detailAddress}`,
            district: form.district,
            country: form.country,
          },
          shipping: PRODUCT.freeDelivery
            ? { zone: "free", charge: 0 }
            : { zone: shipping.id, charge: shipping.charge },
          payment: { method: "cod" },
          pricing: { subtotal, total },
          attribution: getAttribution(),
          draftId,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Failed to place order");

      clearDraft();

      GTM.purchase({
        content_ids: [PRODUCT.name],
        content_type: "product",
        value: total,
        currency: "BDT",
        num_items: quantity,
      });

      navigate("/codingLanding/success", {
        state: {
          order: {
            orderId: data.orderId,
            placedAt: new Date().toISOString(),
            product: {
              name: PRODUCT.name,
              price: PRODUCT.price,
              image: PRODUCT.image,
            },
            quantity,
            subtotal,
            total,
            freeDelivery: PRODUCT.freeDelivery,
            shippingCharge: 0,
            billing: {
              name: form.name,
              phone: form.phone,
              address: form.address,
              detailAddress: form.detailAddress,
              district: form.district,
              country: form.country,
            },
          },
        },
      });
    } catch (err) {
      console.error("Coding order error:", err);
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="order-section" className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            অর্ডার করতে নিচের ফর্মটি পুরন করুন
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
          {/* Product Row */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-orange-500" />
              Your Products
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 bg-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-5 h-5 rounded border-2 border-orange-400 bg-orange-400 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <img
                    src={PRODUCT.image}
                    alt={PRODUCT.name}
                    className="w-10 md:w-22 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span className="text-sm md:text-xl font-medium text-gray-700 leading-tight min-w-0">
                    {PRODUCT.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 pl-8 sm:pl-0 flex-shrink-0">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-20 text-right">
                    ৳ {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Grid */}
          <div className="grid md:grid-cols-2 gap-0">
            {/* LEFT — Billing + Shipping */}
            <div
              className="p-6 border-b md:border-b-0 md:border-r border-gray-100"
              onFocus={handleFormFocus}
            >
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Billing Details
              </h2>

              <div className="space-y-4">
                <Field
                  label={
                    <>
                      Name (নাম) <span className="text-red-500">*</span>
                    </>
                  }
                  error={errors.name}
                >
                  <input
                    type="text"
                    placeholder="আপনার নাম লিখুন"
                    value={form.name}
                    onChange={(e) => {
                      const v = e.target.value.replace(
                        /[^a-zA-Z\u0980-\u09FF ]/g,
                        "",
                      );
                      setForm((f) => ({ ...f, name: v }));
                      if (v.trim()) setErrors((er) => ({ ...er, name: "" }));
                    }}
                    className={errors.name ? inputError : inputNormal}
                  />
                </Field>

                <Field
                  label={
                    <>
                      Phone Number (ফোন নাম্বার){" "}
                      <span className="text-red-500">*</span>
                    </>
                  }
                  error={errors.phone}
                >
                  <input
                    type="tel"
                    placeholder="আপনার সঠিক মোবাইল নাম্বার লিখুন"
                    value={form.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setForm((f) => ({ ...f, phone: v }));
                      if (VALID_PHONE.test(v)) {
                        setErrors((er) => ({ ...er, phone: "" }));
                      }
                    }}
                    className={errors.phone ? inputError : inputNormal}
                  />
                </Field>

                <Field
                  label={
                    <>
                      District (জেলা) <span className="text-red-500">*</span>
                    </>
                  }
                  error={errors.district}
                >
                  <select
                    value={form.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
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

                <Field
                  label={
                    <>
                      Thana / উপজেলা <span className="text-red-500">*</span>
                    </>
                  }
                  error={errors.address}
                >
                  <select
                    value={form.address}
                    disabled={!form.district}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, address: e.target.value }));
                      setErrors((er) => ({ ...er, address: "" }));
                    }}
                    className={
                      !form.district
                        ? inputDisabled
                        : errors.address
                          ? inputError
                          : inputNormal
                    }
                  >
                    <option value="">
                      {form.district
                        ? "থানা / উপজেলা নির্বাচন করুন"
                        : "আগে জেলা নির্বাচন করুন"}
                    </option>
                    {thanaList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={
                    <>
                      Detail Address / বিস্তারিত ঠিকানা{" "}
                      <span className="text-red-500">*</span>
                    </>
                  }
                  error={errors.detailAddress}
                >
                  <textarea
                    rows={3}
                    placeholder="বাড়ি নং, রাস্তা নং, গ্রাম, পোস্ট অফিস ইত্যাদি"
                    value={form.detailAddress}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, detailAddress: e.target.value }));
                      if (e.target.value.trim())
                        setErrors((er) => ({ ...er, detailAddress: "" }));
                    }}
                    className={`${errors.detailAddress ? inputError : inputNormal} resize-none`}
                  />
                </Field>
              </div>

              {/* Shipping */}
              {PRODUCT.freeDelivery ? (
                <div className="mt-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-700 text-center">
                  ডেলিভারি চার্জ সম্পূর্ণ ফ্রি 🎉
                </div>
              ) : (
                <>
                  <h2 className="text-sm font-semibold text-gray-700 mt-6 mb-3">
                    Shipping
                  </h2>
                  <div className="space-y-2">
                    {SHIPPING_ZONES.map((zone) => (
                      <label
                        key={zone.id}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                          shipping.id === zone.id
                            ? "border-orange-400 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              shipping.id === zone.id
                                ? "border-orange-500"
                                : "border-gray-300"
                            }`}
                          >
                            {shipping.id === zone.id && (
                              <div className="w-2 h-2 rounded-full bg-orange-500" />
                            )}
                          </div>
                          <input
                            type="radio"
                            className="sr-only"
                            checked={shipping.id === zone.id}
                            onChange={() => setShipping(zone)}
                          />
                          <span className="text-sm text-gray-700">
                            {zone.label}:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          ৳ {zone.charge}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — Order Summary + Payment */}
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Your Order
              </h2>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <img
                    src={PRODUCT.image}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 leading-tight">
                      {PRODUCT.name}
                    </p>
                    <p className="text-xs text-gray-500">×{quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                    ৳ {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 pt-3 pb-2">
                  <span>Subtotal</span>
                  <span>৳ {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>৳ {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment — COD only */}
              <div className="mb-5">
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-400 bg-orange-50 cursor-default">
                  <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Cash on delivery
                  </span>
                </label>
                <div className="mx-1 mt-2 px-4 py-2.5 bg-gray-100 rounded-lg text-xs text-gray-500">
                  পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Your personal data will be used to process your order, support
                your experience throughout this website, and for other purposes
                described in our{" "}
                <a href="/privacy-policy" className="text-orange-500 underline">
                  privacy policy
                </a>
                .
              </p>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Place Order ৳ {total.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
