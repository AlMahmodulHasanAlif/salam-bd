// src/pages/Products/ProductDetails/ProductDetails.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import useCart from "../../../hooks/useCart";
import RecommendedProducts from "../../../components/RecommendedProducts";
import { AuthContext } from "../../../context/AuthContext";
import { GTM } from '../../../utils/gtm';
import {
  ShoppingCart,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Phone,
  Zap,
  UserCircle,
  CheckCircle,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api` || "http://localhost:3000/api";

const WHATSAPP_NUMBER = "+8801860989372";
const CALL_NUMBER     = "+8801860989372";

const getAuthHeader = async (user) => {
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const extractImageURLs = (product) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.map((img) =>
      typeof img === "string" ? img : img?.url
    ).filter(Boolean);
  }
  if (product.image) return [product.image];
  return [];
};

const resolvePrice = (product, variant) => {
  if (!variant) return product?.price ?? 0;
  if (variant.price != null && variant.price !== "") return Number(variant.price);
  if (variant.priceAdjustment != null) return (product?.price ?? 0) + variant.priceAdjustment;
  return product?.price ?? 0;
};

const resolveOriginalPrice = (product, variant) => {
  if (!variant) return product?.originalPrice ?? null;
  if (variant.originalPrice != null && variant.originalPrice !== "") return Number(variant.originalPrice);
  if (variant.priceAdjustment != null && product?.originalPrice) {
    return product.originalPrice + variant.priceAdjustment;
  }
  return product?.originalPrice ?? null;
};

const calcDiscount = (price, originalPrice) => {
  if (originalPrice && originalPrice > price) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }
  return null;
};

const StarRow = ({ value, size = 14 }) =>
  [...Array(5)].map((_, i) => (
    <Star
      key={i}
      size={size}
      className={
        i < Math.round(value)
          ? "text-yellow-400 fill-yellow-400"
          : "text-gray-200 fill-gray-200"
      }
    />
  ));

const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={26}
            className={
              s <= (hovered || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 fill-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
};

const Skeleton = () => (
  <div className="max-w-[1500px] mx-auto px-4 py-10 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-72 h-64 sm:h-80 bg-gray-200 rounded-2xl" />
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-1/2" />
        <div className="h-12 bg-gray-200 rounded w-full" />
        <div className="h-12 bg-gray-200 rounded w-full" />
      </div>
    </div>
  </div>
);

const SidebarCard = ({ p, onClick }) => {
  const discount =
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  const thumb = extractImageURLs(p)[0] || "";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 w-full text-left hover:bg-gray-50 transition rounded-lg px-1"
    >
      <img
        src={thumb}
        alt={p.name}
        className="w-14 h-14 object-contain rounded-lg bg-gray-50 flex-shrink-0 border border-gray-100"
      />
      <div className="min-w-0">
        <p className="text-xs text-gray-700 font-medium leading-snug line-clamp-2">
          {p.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-green-700 font-bold text-sm">
            ৳{p.price.toLocaleString()}
          </span>
          {discount && (
            <span className="text-gray-400 line-through text-xs">
              ৳{p.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const ReviewCard = ({ review }) => {
  const date = new Date(review.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
      <div className="flex items-start gap-3">
        {review.userPhoto ? (
          <img
            src={review.userPhoto}
            alt={review.userName}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <UserCircle size={36} className="text-gray-300 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="font-semibold text-sm text-gray-800">
              {review.userName}
            </span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <div className="flex gap-0.5 my-1">
            <StarRow value={review.rating} size={12} />
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {review.comment}
            </p>
          )}
          {review.recommended && (
            <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-medium">
              <CheckCircle size={12} />
              Recommends this product
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WhatsAppIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ImageLightbox = ({ images, initialIndex, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);
  const [zoom, setZoom]       = useState(1);
  const [pan, setPan]         = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart  = useRef(null);
  const lastPan    = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft")   setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    lastPan.current = { x: 0, y: 0 };
  }, [current]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(5, Math.max(1, z - e.deltaY * 0.005)));
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const newPan = { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y };
    lastPan.current = newPan;
    setPan(newPan);
  };

  const handleMouseUp = () => setDragging(false);

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    lastPan.current = { x: 0, y: 0 };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.93)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button onClick={() => setZoom((z) => Math.min(5, z + 0.5))}
          className="bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition" title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
          className="bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition" title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetZoom}
          className="bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition" title="Reset Zoom">
          <RotateCcw size={16} />
        </button>
        <span className="text-white/60 text-xs font-mono bg-white/10 px-2 py-1 rounded-full hidden sm:inline">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={onClose}
          className="bg-white/10 hover:bg-red-500 text-white rounded-full p-2 transition ml-1">
          <X size={16} />
        </button>
      </div>

      {images.length > 1 && (
        <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 sm:p-3 transition z-10">
          <ChevronLeft size={22} />
        </button>
      )}

      <div
        className="overflow-hidden flex items-center justify-center"
        style={{ width: "100vw", height: "100vh" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={images[current]}
          alt={`Product view ${current + 1}`}
          draggable={false}
          onClick={() => zoom === 1 ? setZoom(2.5) : resetZoom()}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: dragging ? "none" : "transform 0.2s ease",
            maxWidth: "92vw",
            maxHeight: "78vh",
            objectFit: "contain",
            userSelect: "none",
            cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
            borderRadius: "12px",
          }}
        />
      </div>

      {images.length > 1 && (
        <button onClick={() => setCurrent((c) => (c + 1) % images.length)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 sm:p-3 transition z-10">
          <ChevronRight size={22} />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((img, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)}
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                current === idx
                  ? "border-orange-400 scale-110 shadow-lg"
                  : "border-white/20 opacity-55 hover:opacity-90"
              }`}>
              <img src={img} alt="" className="w-full h-full object-contain bg-white/10 p-0.5" />
            </button>
          ))}
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 z-10">
        <span className="text-white/50 text-xs font-mono">{current + 1} / {images.length}</span>
      </div>
    </div>
  );
};

const TABS = ["Description", "Product Video", "Customer Reviews"];

const THUMB_HEIGHT = 68;
const VISIBLE_THUMBS = 4;

const ProductDetails = () => {
  const { slug } = useParams(); // ✅ slug only
  const navigate = useNavigate();
  const { addItem, cartLoading } = useCart();
  const { user } = useContext(AuthContext);

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [qty, setQty]             = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  const [activeImage, setActiveImage]   = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [thumbOffset, setThumbOffset] = useState(0);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantError, setVariantError]       = useState(false);

  const [sidebarProducts, setSidebarProducts] = useState([]);

  const [reviewData, setReviewData]         = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [hasReviewed, setHasReviewed]       = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewText, setReviewText]         = useState("");
  const [reviewRating, setReviewRating]     = useState(0);
  const [recommended, setRecommended]       = useState(false);
  const [submitLoading, setSubmitLoading]   = useState(false);
  const [submitError, setSubmitError]       = useState("");
  const [submitSuccess, setSubmitSuccess]   = useState(false);

  const [shakeBuyNow, setShakeBuyNow] = useState(false);
  const shakeTimerRef = useRef(null);

  useEffect(() => {
    const triggerShake = () => {
      setShakeBuyNow(true);
      setTimeout(() => setShakeBuyNow(false), 600);
    };
    shakeTimerRef.current = setInterval(triggerShake, 5000);
    return () => clearInterval(shakeTimerRef.current);
  }, []);

  // ✅ Fetch product by slug
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setQty(1);
    setActiveTab(0);
    setActiveImage(0);
    setThumbOffset(0);
    setReviewData(null);
    setSubmitSuccess(false);
    setSubmitError("");
    setSelectedVariant(null);
    setVariantError(false);

    axios
      .get(`${BASE_URL}/products/slug/${slug}`)
      .then((res) => {
        setProduct(res.data);
        if (Array.isArray(res.data.variants) && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
        GTM.viewContent({
          content_ids: [res.data._id],
          content_name: res.data.name,
          content_type: 'product',
          value: res.data.price,
          currency: 'BDT',
        });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // ✅ Fetch sidebar recommendations by slug
  useEffect(() => {
    if (!slug) return;
    axios
      .get(`${BASE_URL}/products/slug/${slug}/recommendations`)
      .then((res) => setSidebarProducts((res.data || []).slice(0, 8)))
      .catch(() => setSidebarProducts([]));
  }, [slug]);

  useEffect(() => {
    if (activeTab !== 2) return;
    fetchReviews();
  }, [activeTab, slug]);

  useEffect(() => {
    if (!user || !slug) return;
    getAuthHeader(user).then((headers) => {
      axios
        .get(`${BASE_URL}/reviews/check/${slug}`, { headers })
        .then((res) => {
          setHasReviewed(res.data.hasReviewed);
          setExistingReview(res.data.review || null);
        })
        .catch(() => {});
    });
  }, [user, slug]);

  useEffect(() => {
    if (!product) return;
    const images = extractImageURLs(product);
    if (images.length <= VISIBLE_THUMBS) return;
    const maxOffset = images.length - VISIBLE_THUMBS;
    if (activeImage < thumbOffset) {
      setThumbOffset(activeImage);
    } else if (activeImage >= thumbOffset + VISIBLE_THUMBS) {
      setThumbOffset(Math.min(activeImage - VISIBLE_THUMBS + 1, maxOffset));
    }
  }, [activeImage]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/products/slug/${slug}/reviews`);
      setReviewData(res.data);
    } catch {
      setReviewData(null);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitError("");
    if (reviewRating === 0) { setSubmitError("Please select a star rating."); return; }
    if (!reviewText.trim()) { setSubmitError("Please write a review comment."); return; }
    setSubmitLoading(true);
    try {
      const headers = await getAuthHeader(user);
      await axios.post(
        `${BASE_URL}/products/slug/${slug}/reviews`,
        { rating: reviewRating, comment: reviewText.trim(), recommended },
        { headers }
      );
      setSubmitSuccess(true);
      setReviewText("");
      setReviewRating(0);
      setRecommended(false);
      setHasReviewed(true);
      fetchReviews();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) {
      setVariantError(true);
      return;
    }

    const finalPrice = resolvePrice(product, selectedVariant);

    const cartProduct = {
      ...product,
      price: finalPrice,
      image: extractImageURLs(product)[0] || product.image || null,
      selectedVariant: selectedVariant || null,
      variantLabel: selectedVariant?.label || null,
    };

    GTM.initiateCheckout({
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: finalPrice * qty,
      currency: "BDT",
      num_items: qty,
    });

    // Buy Now is an isolated purchase — go straight to checkout WITHOUT
    // adding the product to the cart. Any existing cart items stay untouched.
    navigate("/checkout", {
      state: {
        buyNowProduct: cartProduct,
        quantity: qty,
      },
    });
  };

  const handleWhatsApp = () => {
    const finalPrice = resolvePrice(product, selectedVariant);
    const variantPart = selectedVariant?.label ? ` | Variant: ${selectedVariant.label}` : "";
    const msg = encodeURIComponent(
      `Hi! I want to order: *${product?.name}*${variantPart} (Qty: ${qty}) — ৳${finalPrice.toLocaleString()}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${CALL_NUMBER}`;
  };

  if (loading) return <Skeleton />;

  if (!product)
    return (
      <div className="text-center py-24">
        <p className="text-gray-400 mb-4 text-lg">Product not found.</p>
        <button onClick={() => navigate(-1)} className="text-green-700 hover:underline text-sm">
          ← Go back
        </button>
      </div>
    );

  const images = extractImageURLs(product);
  const discount = calcDiscount(product.price, product.originalPrice);
  const summary = reviewData?.summary;
  const reviews = reviewData?.reviews || [];

  const thumbsScrollable = images.length > VISIBLE_THUMBS;
  const maxOffset = Math.max(0, images.length - VISIBLE_THUMBS);
  const canScrollUp   = thumbOffset > 0;
  const canScrollDown = thumbOffset < maxOffset;

  const scrollThumbsUp   = () => setThumbOffset((o) => Math.max(0, o - 1));
  const scrollThumbsDown = () => setThumbOffset((o) => Math.min(maxOffset, o + 1));

  const shakeKeyframes = `
    @keyframes shake {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      15%       { transform: translateX(-4px) rotate(-2deg); }
      30%       { transform: translateX(4px) rotate(2deg); }
      45%       { transform: translateX(-4px) rotate(-1deg); }
      60%       { transform: translateX(4px) rotate(1deg); }
      75%       { transform: translateX(-2px) rotate(-0.5deg); }
    }
  `;

  return (
    <div className="bg-gray-50 min-h-screen">
      <style>{shakeKeyframes}</style>

      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-green-700 transition">Home</button>
          <span>›</span>
          <button onClick={() => navigate("/products")} className="hover:text-green-700 transition">Products</button>
          <span>›</span>
          <span className="text-gray-700 font-medium truncate max-w-[160px] sm:max-w-[200px] md:max-w-xs">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 pb-14">
        <div className="flex gap-6 mt-2">

          {/* MAIN COLUMN */}
          <div className="flex-1 min-w-0">

            {/* Product card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">

                {/* Image Gallery */}
                <div className="w-full md:w-auto md:shrink-0">

                  {/* MOBILE */}
                  <div className="flex flex-col gap-3 md:hidden">
                    <div
                      className="relative w-full rounded-xl overflow-hidden bg-white border border-gray-200 cursor-zoom-in group"
                      style={{ aspectRatio: "1 / 1" }}
                      onClick={() => images.length > 0 && setLightboxOpen(true)}
                    >
                      {images.length > 0 ? (
                        <img
                          src={images[activeImage]}
                          alt={product.name}
                          className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                          No image
                        </div>
                      )}
                      {discount && (
                        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                          Save {discount}%
                        </span>
                      )}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p - 1 + images.length) % images.length); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition"
                          >
                            <ChevronLeft size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p + 1) % images.length); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition"
                          >
                            <ChevronRight size={16} className="text-gray-600" />
                          </button>
                        </>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ZoomIn size={11} />
                        Tap to zoom
                      </div>
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                        {images.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImage(idx)}
                            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-gray-50 ${
                              activeImage === idx
                                ? "border-orange-400 shadow-sm scale-105"
                                : "border-gray-200 hover:border-orange-300"
                            }`}
                          >
                            <img
                              src={url}
                              alt={`${product.name} view ${idx + 1}`}
                              className="w-full h-full object-contain p-0.5"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden md:flex gap-3">
                    {images.length > 1 && (
                      <div className="flex flex-col items-center gap-1" style={{ height: "480px" }}>
                        <button
                          onClick={scrollThumbsUp}
                          disabled={!canScrollUp}
                          className={`flex items-center justify-center w-16 h-6 rounded-lg transition flex-shrink-0 ${
                            canScrollUp
                              ? "bg-gray-100 hover:bg-orange-100 hover:text-orange-500 text-gray-500"
                              : "text-gray-200 cursor-default"
                          }`}
                        >
                          <ChevronUp size={16} />
                        </button>

                        <div className="flex flex-col gap-2 overflow-hidden flex-1" style={{ width: "64px" }}>
                          <div
                            className="flex flex-col gap-2 transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateY(-${thumbOffset * THUMB_HEIGHT}px)` }}
                          >
                            {images.map((url, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border transition-all duration-200 bg-gray-50 flex-shrink-0 ${
                                  activeImage === idx
                                    ? "border-orange-400 shadow-sm scale-105"
                                    : "border-gray-200 hover:border-orange-300 hover:scale-105"
                                }`}
                              >
                                <img
                                  src={url}
                                  alt={`${product.name} view ${idx + 1}`}
                                  className="w-full h-full object-contain p-1"
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={scrollThumbsDown}
                          disabled={!canScrollDown}
                          className={`flex items-center justify-center w-16 h-6 rounded-lg transition flex-shrink-0 ${
                            canScrollDown
                              ? "bg-gray-100 hover:bg-orange-100 hover:text-orange-500 text-gray-500"
                              : "text-gray-200 cursor-default"
                          }`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    )}

                    <div
                      className="relative rounded-xl overflow-hidden bg-white border border-gray-200 cursor-zoom-in group"
                      style={{ height: "480px", width: "440px" }}
                      onClick={() => images.length > 0 && setLightboxOpen(true)}
                    >
                      {images.length > 0 ? (
                        <img
                          src={images[activeImage]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                          No image
                        </div>
                      )}
                      {discount && (
                        <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                          Save {discount}%
                        </span>
                      )}
                      {images.length > 0 && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                            <ZoomIn size={14} className="text-gray-700" />
                            <span className="text-xs font-semibold text-gray-700">Click to enlarge</span>
                          </div>
                        </div>
                      )}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p - 1 + images.length) % images.length); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition"
                          >
                            <ChevronLeft size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p + 1) % images.length); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition"
                          >
                            <ChevronRight size={16} className="text-gray-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-1">
                    {product.name}
                  </h1>
                  {product.nameBn && (
                    <p className="text-gray-400 text-sm mb-3">{product.nameBn}</p>
                  )}

                  {(() => {
                    const displayPrice    = resolvePrice(product, selectedVariant);
                    const displayOriginal = resolveOriginalPrice(product, selectedVariant);
                    const displayDiscount = calcDiscount(displayPrice, displayOriginal);
                    return (
                      <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                          ৳{displayPrice.toLocaleString()}.00
                        </span>
                        {displayOriginal && displayOriginal > displayPrice && (
                          <span className="text-gray-400 line-through text-base sm:text-lg">
                            ৳{displayOriginal.toLocaleString()}.00
                          </span>
                        )}
                        {displayDiscount && (
                          <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-0.5 rounded-full">
                            Save {displayDiscount}%
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {(product.stock > 0 || (Array.isArray(product.variants) && product.variants.some(v => (v.quantity ?? 1) > 0))) && (
                    <>
                      {Array.isArray(product.variants) && product.variants.length > 0 && (
                        <div className="mb-4 sm:mb-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-600 font-medium text-sm">Variant:</span>
                            {selectedVariant && (
                              <span className="text-xs text-gray-400 font-normal">
                                {selectedVariant.name || selectedVariant.label || selectedVariant.size || selectedVariant.color || ""}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {product.variants.map((v, idx) => {
                              const label = v.name || v.label || v.size || v.color || `Option ${idx + 1}`;
                              const isSelected = selectedVariant === v;
                              const isOutOfStock = v.quantity != null && v.quantity <= 0;
                              const chipPrice = resolvePrice(product, v);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => { setSelectedVariant(v); setVariantError(false); }}
                                  disabled={isOutOfStock}
                                  title={isOutOfStock ? "Out of stock" : label}
                                  className={`relative px-3 sm:px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-150
                                    ${isOutOfStock
                                      ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through"
                                      : isSelected
                                        ? "border-orange-400 bg-orange-50 text-orange-600 shadow-sm scale-105"
                                        : "border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50"
                                    }`}
                                >
                                  {label}
                                  {chipPrice != null && !isOutOfStock && (
                                    <span className={`ml-1.5 text-xs font-bold ${isSelected ? "text-orange-500" : "text-green-600"}`}>
                                      
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                        <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {variantError && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                              ⚠ Please select a variant before continuing.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                        <span className="text-gray-600 font-medium text-sm">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600 transition text-lg leading-none"
                          >
                            −
                          </button>
                          <span className="px-4 sm:px-5 py-2 font-semibold text-gray-800 border-x border-gray-200 min-w-[2.5rem] sm:min-w-[3rem] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => setQty(Math.min(selectedVariant?.quantity ?? product.stock, qty + 1))}
                            className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600 transition text-lg leading-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <button
                            onClick={() => {
                              if (Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) {
                                setVariantError(true); return;
                              }
                              const finalPrice = resolvePrice(product, selectedVariant);
                              addItem({
                                ...product,
                                price: finalPrice,
                                selectedVariant: selectedVariant || null,
                                variantLabel: selectedVariant?.label || null,
                              }, qty);
                            }}
                            disabled={cartLoading}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#f28705] hover:bg-green-600 disabled:bg-gray-300 text-white px-2 sm:px-4 py-3 rounded-xl font-bold transition text-xs sm:text-sm"
                          >
                            <ShoppingCart size={15} />
                            <span>ADD TO CART</span>
                          </button>
                          <button
                            onClick={() => {
                              if (Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant) {
                                setVariantError(true); return;
                              }
                              handleBuyNow();
                            }}
                            disabled={cartLoading}
                            style={{ animation: shakeBuyNow ? "shake 0.6s ease-in-out" : "none" }}
                            className="flex bg-primary items-center justify-center gap-1.5 sm:gap-2 bg-gray-900 hover:bg-green-600 disabled:bg-gray-400 text-white px-2 sm:px-4 py-3 rounded-xl font-bold transition text-xs sm:text-sm"
                          >
                            <Zap size={15} />
                            <span>BUY NOW</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <button
                            onClick={handleWhatsApp}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#25D366] hover:bg-[#1ebe5c] text-white px-2 sm:px-4 py-3 rounded-xl font-bold transition text-xs sm:text-sm"
                          >
                            <WhatsAppIcon size={15} />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={handleCall}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-800 text-white px-2 sm:px-4 py-3 rounded-xl font-bold transition text-xs sm:text-sm"
                          >
                            <Phone size={15} />
                            <span>Call to Order</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {product.stock <= 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center mb-5">
                      <p className="text-red-500 font-semibold text-sm">
                        This product is currently out of stock
                      </p>
                    </div>
                  )}

                  {product.brand && (
                    <div className="inline-flex items-center gap-2 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-white">
                      <span className="text-gray-500 text-sm font-medium">Brand:</span>
                      {product.brandLogo && (
                        <img src={product.brandLogo} alt={product.brand} className="h-5 object-contain" />
                      )}
                      <span className="text-gray-700 text-sm font-semibold">{product.brand}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 sm:mt-5">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(i)}
                    className={`px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
                      activeTab === i
                        ? "border-orange-500 text-orange-500 bg-orange-50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t}
                    {i === 2 && summary?.totalReviews > 0 && (
                      <span className="ml-1 sm:ml-1.5 bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded-full">
                        {summary.totalReviews}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-5 md:p-6">
                {activeTab === 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Product Details</h2>
                    <div className="w-10 h-1 bg-orange-500 rounded mb-4" />
                    {product.description ? (
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No description provided.</p>
                    )}
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="text-center py-12 text-gray-400 text-sm italic">
                    No product video available for this item.
                  </div>
                )}

                {activeTab === 2 && (
                  <div>
                    {reviewsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        <div className="w-full md:w-56 md:shrink-0">
                          <div className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-none">
                            {summary?.averageRating?.toFixed(1) ?? "0.0"}
                          </div>
                          <p className="text-gray-500 text-sm mt-1">Average Rating</p>
                          <div className="flex gap-0.5 my-2">
                            <StarRow value={summary?.averageRating || 0} />
                          </div>
                          <p className="text-xs text-gray-400">({summary?.totalReviews ?? 0} Reviews)</p>
                          <p className="text-2xl font-bold text-gray-900 mt-4 sm:mt-5">
                            {summary?.recommendedPercent ?? 0}%
                          </p>
                          <p className="text-xs text-gray-500">
                            Recommended ({summary?.recommendedCount ?? 0} of {summary?.totalReviews ?? 0})
                          </p>
                          <div className="mt-4 space-y-2">
                            {[5, 4, 3, 2, 1].map((s) => {
                              const count = summary?.distribution?.[s] || 0;
                              const pct = summary?.totalReviews > 0
                                ? Math.round((count / summary.totalReviews) * 100) : 0;
                              return (
                                <div key={s} className="flex items-center gap-2">
                                  <div className="flex gap-0.5 shrink-0">
                                    <StarRow value={s} size={11} />
                                  </div>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-orange-400 rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400 w-7 text-right">{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">Submit Your Review</h3>
                          <div className="w-10 h-1 bg-orange-500 rounded mb-4" />

                          {!user ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
                              Please{" "}
                              <button onClick={() => navigate("/login")} className="font-semibold underline">
                                log in
                              </button>{" "}
                              to submit a review.
                            </div>
                          ) : hasReviewed ? (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 text-sm text-green-700 flex items-center gap-2 flex-wrap">
                              <CheckCircle size={16} className="shrink-0" />
                              <span>
                                You have already reviewed this product.
                                {existingReview && (
                                  <span className="ml-1 font-semibold">
                                    Your rating: {existingReview.rating}/5
                                  </span>
                                )}
                              </span>
                            </div>
                          ) : (
                            <div className="mb-6">
                              <p className="text-xs text-gray-400 mb-4">
                                Your email will not be published. Required fields are marked *
                              </p>
                              <label className="text-sm text-gray-600 block mb-1.5 font-medium">
                                Write your opinion about the product *
                              </label>
                              <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Write Your Review Here..."
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 mb-4"
                              />
                              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
                                <div>
                                  <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                    Your Rating: *
                                  </label>
                                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={recommended}
                                    onChange={(e) => setRecommended(e.target.checked)}
                                    className="accent-green-600 w-4 h-4"
                                  />
                                  I recommend this product
                                </label>
                              </div>
                              {submitError && (
                                <p className="text-red-500 text-xs mb-3 flex items-center gap-1">⚠ {submitError}</p>
                              )}
                              {submitSuccess && (
                                <p className="text-green-600 text-xs mb-3 flex items-center gap-1">
                                  <CheckCircle size={12} /> Review submitted successfully!
                                </p>
                              )}
                              <button
                                onClick={handleSubmitReview}
                                disabled={submitLoading}
                                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-8 py-2.5 rounded-xl text-sm font-bold tracking-wide transition"
                              >
                                {submitLoading ? "Submitting..." : "SUBMIT REVIEW"}
                              </button>
                            </div>
                          )}

                          {reviews.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-bold text-gray-700 mb-3">
                                Customer Reviews ({reviews.length})
                              </h4>
                              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {reviews.map((r) => (
                                  <ReviewCard key={r._id} review={r} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            !reviewsLoading && (
                              <p className="text-sm text-gray-400 italic mt-2">
                                No reviews yet. Be the first to review this product!
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Pass product._id (from fetched data) not the undefined `id` variable */}
            <div className="mt-5 sm:mt-6">
              <RecommendedProducts productId={product._id} />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">More Products</h3>
                <div className="flex gap-1 text-gray-400">
                  <ChevronLeft size={14} />
                  <ChevronRight size={14} />
                </div>
              </div>
              {sidebarProducts.length > 0 ? (
                sidebarProducts.map((p) => (
                  <SidebarCard
                    key={p._id}
                    p={p}
                    onClick={() => navigate(`/product/${p.slug}`)} // ✅ use slug not _id
                  />
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-6 italic">
                  No related products found.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;