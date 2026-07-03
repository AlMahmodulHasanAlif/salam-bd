// src/pages/Cart/Checkout.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { placeOrder } from "../../api/orderApi";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import { getGuestId } from "../../context/AuthProvider";
import toast from "react-hot-toast";
import { Tag, Truck } from "lucide-react";
import { GTM, generateEventId } from "../../utils/gtm";

// All 64 districts with upazilas (thanas)
const BD_LOCATIONS = {
  Bagerhat: [
    "Fakirhat",
    "Bagerhat Sadar",
    "Mollahat",
    "Sarankhola",
    "Rampal",
    "Morrelganj",
    "Kachua",
    "Mongla",
    "Chitalmari",
  ],
  Bandarban: [
    "Bandarban Sadar",
    "Alikadam",
    "Naikhongchhari",
    "Rowangchhari",
    "Lama",
    "Ruma",
    "Thanchi",
  ],
  Barguna: [
    "Amtali",
    "Barguna Sadar",
    "Betagi",
    "Bamna",
    "Pathorghata",
    "Taltali",
  ],
  Barishal: [
    "Barisal Sadar",
    "Bakerganj",
    "Babuganj",
    "Wazirpur",
    "Banaripara",
    "Gournadi",
    "Agailjhara",
    "Mehendiganj",
    "Muladi",
    "Hizla",
    "Barishal City Corporation",
  ],
  Bhola: [
    "Bhola Sadar",
    "Borhanuddin",
    "Charfesson",
    "Doulatkhan",
    "Monpura",
    "Tazumuddin",
    "Lalmohan",
  ],
  Bogura: [
    "Kahaloo",
    "Bogra Sadar",
    "Shariakandi",
    "Shajahanpur",
    "Dupchanchia",
    "Adamdighi",
    "Nondigram",
    "Sonatala",
    "Dhunot",
    "Gabtali",
    "Sherpur",
    "Shibganj",
  ],
  Brahmanbaria: [
    "Brahmanbaria Sadar",
    "Kasba",
    "Nasirnagar",
    "Sarail",
    "Ashuganj",
    "Akhaura",
    "Nabinagar",
    "Bancharampur",
    "Bijoynagar",
  ],
  Chandpur: [
    "Haimchar",
    "Kachua",
    "Shahrasti",
    "Chandpur Sadar",
    "Matlab South",
    "Hajiganj",
    "Matlab North",
    "Faridgonj",
  ],
  Chapainawabganj: [
    "Chapainawabganj Sadar",
    "Gomostapur",
    "Nachol",
    "Bholahat",
    "Shibganj",
  ],
  Chattogram: [
    "Rangunia",
    "Sitakunda",
    "Mirsharai",
    "Patiya",
    "Sandwip",
    "Banshkhali",
    "Boalkhali",
    "Anwara",
    "Chandanaish",
    "Satkania",
    "Lohagara",
    "Hathazari",
    "Fatikchhari",
    "Raozan",
    "Karnafuli",
    "Chittagong City Corporation",
  ],
  Chuadanga: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
  Comilla: [
    "Debidwar",
    "Barura",
    "Brahmanpara",
    "Chandina",
    "Chauddagram",
    "Daudkandi",
    "Homna",
    "Laksam",
    "Muradnagar",
    "Nangalkot",
    "Comilla Sadar",
    "Meghna",
    "Monohargonj",
    "Sadarsouth",
    "Titas",
    "Burichang",
    "Lalmai",
    "Cumilla City Corporation",
  ],
  Coxsbazar: [
    "Coxsbazar Sadar",
    "Chakaria",
    "Kutubdia",
    "Ukhiya",
    "Moheshkhali",
    "Pekua",
    "Ramu",
    "Teknaf",
  ],
  "Dhaka City": [
    "Adabor",
    "Badda",
    "Banani",
    "Bangshal",
    "Bhashantek",
    "Biman Bandar",
    "Cantonment",
    "Chawkbazar",
    "Dakshinkhan",
    "Darus Salam",
    "Demra",
    "Dhanmondi",
    "Gendaria",
    "Gulshan",
    "Hatirjheel",
    "Hazaribagh",
    "Jatrabari",
    "Kadamtali",
    "Kafrul",
    "Kalabagan",
    "Kamrangirchar",
    "Khilgaon",
    "Khilkhet",
    "Kotwali",
    "Lalbagh",
    "Mirpur",
    "Mohammadpur",
    "Motijheel",
    "Mugda",
    "New Market",
    "Pallabi",
    "Paltan",
    "Ramna",
    "Rampura",
    "Rupnagar",
    "Sabujbagh",
    "Shah Ali",
    "Shahbagh",
    "Shahjahanpur",
    "Sher-e-Bangla Nagar",
    "Shyampur",
    "Sutrapur",
    "Tejgaon",
    "Tejgaon Industrial Area",
    "Turag",
    "Uttara East",
    "Uttara West",
    "Uttarkhan",
    "Vatara",
    "Wari",
  ],
  "Dhaka Sub-Urban": [
    "Ashulia",
    "Dhamrai",
    "Dohar",
    "Hemayetpur",
    "Keraniganj Model",
    "Nawabganj",
    "Savar",
    "South Keraniganj",
  ],
  Dinajpur: [
    "Nawabganj",
    "Birganj",
    "Ghoraghat",
    "Birampur",
    "Parbatipur",
    "Bochaganj",
    "Kaharol",
    "Fulbari",
    "Dinajpur Sadar",
    "Hakimpur",
    "Khansama",
    "Birol",
    "Chirirbandar",
  ],
  Faridpur: [
    "Faridpur Sadar",
    "Alfadanga",
    "Boalmari",
    "Sadarpur",
    "Nagarkanda",
    "Bhanga",
    "Charbhadrasan",
    "Madhukhali",
    "Saltha",
  ],
  Feni: [
    "Chhagalnaiya",
    "Feni Sadar",
    "Sonagazi",
    "Fulgazi",
    "Parshuram",
    "Daganbhuiyan",
  ],
  Gaibandha: [
    "Sadullapur",
    "Gaibandha Sadar",
    "Palashbari",
    "Saghata",
    "Gobindaganj",
    "Sundarganj",
    "Phulchari",
  ],
  Gazipur: [
    "Kaliganj",
    "Kaliakair",
    "Kapasia",
    "Gazipur Sadar",
    "Sreepur",
    "Gazipur City Corporation",
  ],
  Gopalganj: [
    "Gopalganj Sadar",
    "Kashiani",
    "Tungipara",
    "Kotalipara",
    "Muksudpur",
  ],
  Habiganj: [
    "Nabiganj",
    "Bahubal",
    "Ajmiriganj",
    "Baniachong",
    "Lakhai",
    "Chunarughat",
    "Habiganj Sadar",
    "Madhabpur",
    "Shayestagonj",
  ],
  Jamalpur: [
    "Jamalpur Sadar",
    "Melandah",
    "Islampur",
    "Dewangonj",
    "Sarishabari",
    "Madarganj",
    "Bokshiganj",
  ],
  Jashore: [
    "Manirampur",
    "Abhaynagar",
    "Bagherpara",
    "Chougachha",
    "Jhikargacha",
    "Keshabpur",
    "Jessore Sadar",
    "Sharsha",
  ],
  Jhalakathi: ["Jhalakathi Sadar", "Kathalia", "Nalchity", "Rajapur"],
  Jhenaidah: [
    "Jhenaidah Sadar",
    "Shailkupa",
    "Harinakundu",
    "Kaliganj",
    "Kotchandpur",
    "Moheshpur",
  ],
  Joypurhat: ["Akkelpur", "Kalai", "Khetlal", "Panchbibi", "Joypurhat Sadar"],
  Khagrachhari: [
    "Khagrachhari Sadar",
    "Dighinala",
    "Panchari",
    "Laxmichhari",
    "Mohalchari",
    "Manikchari",
    "Ramgarh",
    "Matiranga",
    "Guimara",
  ],
  Khulna: [
    "Paikgasa",
    "Fultola",
    "Digholia",
    "Rupsha",
    "Terokhada",
    "Dumuria",
    "Botiaghata",
    "Dakop",
    "Koyra",
    "Khulna City Corporation",
  ],
  Kishoreganj: [
    "Itna",
    "Katiadi",
    "Bhairab",
    "Tarail",
    "Hossainpur",
    "Pakundia",
    "Kuliarchar",
    "Kishoreganj Sadar",
    "Karimgonj",
    "Bajitpur",
    "Austagram",
    "Mithamoin",
    "Nikli",
  ],
  Kurigram: [
    "Kurigram Sadar",
    "Nageshwari",
    "Bhurungamari",
    "Phulbari",
    "Rajarhat",
    "Ulipur",
    "Chilmari",
    "Rowmari",
    "Charrajibpur",
  ],
  Kushtia: [
    "Kushtia Sadar",
    "Kumarkhali",
    "Khoksa",
    "Mirpur",
    "Daulatpur",
    "Bheramara",
  ],
  Lakshmipur: [
    "Lakshmipur Sadar",
    "Kamalnagar",
    "Raipur",
    "Ramgati",
    "Ramganj",
  ],
  Lalmonirhat: [
    "Lalmonirhat Sadar",
    "Kaliganj",
    "Hatibandha",
    "Patgram",
    "Aditmari",
  ],
  Madaripur: ["Madaripur Sadar", "Shibchar", "Kalkini", "Rajoir"],
  Magura: ["Shalikha", "Sreepur", "Magura Sadar", "Mohammadpur"],
  Manikganj: [
    "Harirampur",
    "Saturia",
    "Manikganj Sadar",
    "Gior",
    "Shibaloy",
    "Doulatpur",
    "Singiar",
  ],
  Meherpur: ["Mujibnagar", "Meherpur Sadar", "Gangni"],
  Moulvibazar: [
    "Barlekha",
    "Kamolganj",
    "Kulaura",
    "Moulvibazar Sadar",
    "Rajnagar",
    "Sreemangal",
    "Juri",
  ],
  Munshiganj: [
    "Munshiganj Sadar",
    "Sreenagar",
    "Sirajdikhan",
    "Louhajanj",
    "Gajaria",
    "Tongibari",
  ],
  Mymensingh: [
    "Fulbaria",
    "Trishal",
    "Bhaluka",
    "Muktagacha",
    "Mymensingh Sadar",
    "Dhobaura",
    "Phulpur",
    "Haluaghat",
    "Gouripur",
    "Gafargaon",
    "Iswarganj",
    "Nandail",
    "Tarakanda",
    "Mymensingh City Corporation",
  ],
  Naogaon: [
    "Mohadevpur",
    "Badalgachi",
    "Patnitala",
    "Dhamoirhat",
    "Niamatpur",
    "Manda",
    "Atrai",
    "Raninagar",
    "Naogaon Sadar",
    "Porsha",
    "Sapahar",
  ],
  Narail: ["Narail Sadar", "Lohagara", "Kalia"],
  Narayanganj: [
    "Araihazar",
    "Bandar",
    "Narayanganj Sadar",
    "Rupganj",
    "Sonargaon",
    "Narayanganj City Corporation",
  ],
  Narsingdi: [
    "Belabo",
    "Monohardi",
    "Narsingdi Sadar",
    "Palash",
    "Raipura",
    "Shibpur",
  ],
  Natore: [
    "Natore Sadar",
    "Singra",
    "Baraigram",
    "Bagatipara",
    "Lalpur",
    "Gurudaspur",
    "Naldanga",
  ],
  Netrokona: [
    "Barhatta",
    "Durgapur",
    "Kendua",
    "Atpara",
    "Madan",
    "Khaliajuri",
    "Kalmakanda",
    "Mohongonj",
    "Purbadhala",
    "Netrokona Sadar",
  ],
  Nilphamari: [
    "Syedpur",
    "Domar",
    "Dimla",
    "Jaldhaka",
    "Kishorganj",
    "Nilphamari Sadar",
  ],
  Noakhali: [
    "Noakhali Sadar",
    "Companiganj",
    "Begumganj",
    "Hatia",
    "Subarnachar",
    "Kabirhat",
    "Senbug",
    "Chatkhil",
    "Sonaimori",
  ],
  Pabna: [
    "Sujanagar",
    "Ishurdi",
    "Bhangura",
    "Pabna Sadar",
    "Bera",
    "Atghoria",
    "Chatmohar",
    "Santhia",
    "Faridpur",
  ],
  Panchagarh: ["Panchagarh Sadar", "Debiganj", "Boda", "Atwari", "Tetulia"],
  Patuakhali: [
    "Bauphal",
    "Patuakhali Sadar",
    "Dumki",
    "Dashmina",
    "Kalapara",
    "Mirzaganj",
    "Galachipa",
    "Rangabali",
  ],
  Pirojpur: [
    "Pirojpur Sadar",
    "Nazirpur",
    "Kawkhali",
    "Zianagar",
    "Bhandaria",
    "Mathbaria",
    "Nesarabad",
  ],
  Rajbari: ["Rajbari Sadar", "Goalanda", "Pangsa", "Baliakandi", "Kalukhali"],
  Rajshahi: [
    "Paba",
    "Durgapur",
    "Mohonpur",
    "Charghat",
    "Puthia",
    "Bagha",
    "Godagari",
    "Tanore",
    "Bagmara",
    "Rajshahi City Corporation",
  ],
  Rangamati: [
    "Rangamati Sadar",
    "Kaptai",
    "Kawkhali",
    "Baghaichari",
    "Barkal",
    "Langadu",
    "Rajasthali",
    "Belaichari",
    "Juraichari",
    "Naniarchar",
  ],
  Rangpur: [
    "Rangpur Sadar",
    "Gangachara",
    "Taragonj",
    "Badargonj",
    "Mithapukur",
    "Pirgonj",
    "Kaunia",
    "Pirgacha",
    "Rangpur City Corporation",
  ],
  Satkhira: [
    "Assasuni",
    "Debhata",
    "Kalaroa",
    "Satkhira Sadar",
    "Shyamnagar",
    "Tala",
    "Kaliganj",
  ],
  Shariatpur: [
    "Shariatpur Sadar",
    "Naria",
    "Zajira",
    "Gosairhat",
    "Bhedarganj",
    "Damudya",
  ],
  Sherpur: ["Sherpur Sadar", "Nalitabari", "Sreebordi", "Nokla", "Jhenaigati"],
  Sirajganj: [
    "Belkuchi",
    "Chauhali",
    "Kamarkhand",
    "Kazipur",
    "Raigonj",
    "Shahjadpur",
    "Sirajganj Sadar",
    "Tarash",
    "Ullapara",
  ],
  Sunamganj: [
    "Sunamganj Sadar",
    "South Sunamganj",
    "Bishwambarpur",
    "Chhatak",
    "Jagannathpur",
    "Dowarabazar",
    "Tahirpur",
    "Dharmapasha",
    "Jamalganj",
    "Shalla",
    "Derai",
  ],
  Sylhet: [
    "Balaganj",
    "Beanibazar",
    "Bishwanath",
    "Companiganj",
    "Fenchuganj",
    "Golapganj",
    "Gowainghat",
    "Jaintiapur",
    "Kanaighat",
    "Sylhet Sadar",
    "Zakiganj",
    "Dakshinsurma",
    "Osmaninagar",
    "Sylhet City Corporation",
  ],
  Tangail: [
    "Basail",
    "Bhuapur",
    "Delduar",
    "Ghatail",
    "Gopalpur",
    "Madhupur",
    "Mirzapur",
    "Nagarpur",
    "Sakhipur",
    "Tangail Sadar",
    "Kalihati",
    "Dhanbari",
  ],
  Thakurgaon: [
    "Thakurgaon Sadar",
    "Pirganj",
    "Ranisankail",
    "Haripur",
    "Baliadangi",
  ],
};

// Districts inside Dhaka city area for shipping zone auto-detection
const DHAKA_CITY_DISTRICTS = [
  "Dhaka City",
  "Narayanganj",
  "Gazipur",
  "Manikganj",
  "Munshiganj",
  "Narsingdi",
];

const SHIPPING_ZONES = [
  { id: "inside_dhaka", label: "Inside Dhaka City", charge: 80 },
  { id: "outside_dhaka", label: "Outside Dhaka City", charge: 120 },
];

const ALL_DISTRICTS = Object.keys(BD_LOCATIONS).sort();

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { items, emptyCart, updateQty, removeItem, fetchCart } = useCart();

  // Buy Now → isolated single-product checkout (passed via navigation state).
  const buyNowProduct = location.state?.buyNowProduct || null;
  const isBuyNow = !!buyNowProduct;
  const buyNowItem = isBuyNow
    ? {
        _id: buyNowProduct._id,
        productId: buyNowProduct._id,
        name: buyNowProduct.name,
        image: buyNowProduct.image || null,
        price: buyNowProduct.price,
        quantity: location.state?.quantity || 1,
        variantLabel: buyNowProduct.variantLabel || null,
        selectedVariant: buyNowProduct.selectedVariant || null,
        freeDelivery: buyNowProduct.freeDelivery || false,
      }
    : null;

  // The items actually being checked out: just the Buy Now product, or the whole cart.
  const checkoutItems = isBuyNow ? [buyNowItem] : items;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    thana: "",
  });
  const [shippingZone, setShippingZone] = useState(SHIPPING_ZONES[1]); // default: outside dhaka
  const [loading, setLoading] = useState(false);
  const isSubmitting = React.useRef(false);

  if (!checkoutItems.length && !isSubmitting.current) {
    navigate("/cart");
    return null;
  }

  const allFreeDelivery =
    checkoutItems.length > 0 && checkoutItems.every((i) => i.freeDelivery);
  const thanas = form.district ? BD_LOCATIONS[form.district] : [];
  const shippingCharge = allFreeDelivery ? 0 : shippingZone.charge;
  const itemsTotal = checkoutItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  );
  const grandTotal = itemsTotal + shippingCharge;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "district") {
      // Auto-select shipping zone based on district
      const zone = DHAKA_CITY_DISTRICTS.includes(value)
        ? SHIPPING_ZONES[0]
        : SHIPPING_ZONES[1];
      setShippingZone(zone);
      setForm((prev) => ({ ...prev, district: value, thana: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard against the auth-loading race: if Firebase hasn't resolved yet, a
    // logged-in user would be treated as a guest and their order would vanish
    // from their /orders page. Wait for auth before submitting.
    if (authLoading) {
      toast.error("Please wait — verifying your session…");
      return;
    }

    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.district ||
      !form.thana
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    GTM.initiateCheckout({
      value: grandTotal,
      currency: "BDT",
      content_ids: checkoutItems.map((item) => item.productId),
      content_type: "product",
    });

    setLoading(true);
    isSubmitting.current = true;
    try {
      const userEmail = user?.email || getGuestId();
      const purchaseEventId = generateEventId();
      const orderData = {
        userEmail,
        isGuest: !user,
        fbEventId: purchaseEventId,
        // Buy Now → backend removes only this product from the cart
        isBuyNow,
        buyNowProductId: isBuyNow ? buyNowItem.productId : null,
        buyNowVariantLabel: isBuyNow ? buyNowItem.variantLabel : null,
        items: checkoutItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          variantLabel: item.variantLabel || null,
          selectedVariant: item.selectedVariant || null,
        })),
        totalPrice: grandTotal,
        shippingInfo: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          district: form.district,
          thana: form.thana,
          shippingZone: shippingZone.id,
          shippingCharge,
        },
      };

      const response = await placeOrder(orderData);

      if (!user) {
        const prev = JSON.parse(localStorage.getItem("guestOrders") || "[]");
        prev.unshift({
          ...orderData,
          status: "Pending",
          createdAt: new Date(),
        });
        localStorage.setItem("guestOrders", JSON.stringify(prev));
      }

      // Buy Now removed only the purchased product server-side → re-sync the
      // cart so any other items remain. Normal checkout clears the whole cart.
      if (isBuyNow) {
        await fetchCart();
      } else {
        await emptyCart();
      }
      GTM.purchase(
        {
          value: grandTotal,
          currency: "BDT",
          content_ids: checkoutItems.map((item) => item.productId),
          content_type: "product",
        },
        purchaseEventId,
      );

      toast.success("Order placed! 🎉");

      navigate("/order-success", {
        state: {
          order: {
            orderId: response?.data?._id || response?._id || null,
            items: checkoutItems,
            totalPrice: grandTotal,
            shippingInfo: {
              name: form.name,
              phone: form.phone,
              address: form.address,
              district: form.district,
              thana: form.thana,
              shippingZone: shippingZone.id,
              shippingCharge,
            },
            placedAt: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              Shipping Information
            </h2>

            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
                Checking out as <strong>Guest</strong>.{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="underline text-green-700 font-medium"
                >
                  Sign in
                </button>{" "}
                to track your orders later.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setForm((prev) => ({ ...prev, phone: val }));
                  }}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition bg-white"
                >
                  <option value="">Select District</option>
                  {ALL_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thana / Upazila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thana / Upazila <span className="text-red-500">*</span>
                </label>
                <select
                  name="thana"
                  value={form.thana}
                  onChange={handleChange}
                  required
                  disabled={!form.district}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {form.district ? "Select Thana" : "Select district first"}
                  </option>
                  {thanas.map((thana) => (
                    <option key={thana} value={thana}>
                      {thana}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="House no, Road, Area"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-600 transition resize-none"
                />
              </div>

              {/* Delivery Option */}
              {allFreeDelivery ? (
                <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-700 text-center">
                  ডেলিভারি চার্জ সম্পূর্ণ ফ্রি 🎉
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    <Truck size={14} className="text-green-700" />
                    Delivery Option <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {SHIPPING_ZONES.map((zone) => (
                      <label
                        key={zone.id}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                          shippingZone.id === zone.id
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              shippingZone.id === zone.id
                                ? "border-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {shippingZone.id === zone.id && (
                              <div className="w-2 h-2 rounded-full bg-green-600" />
                            )}
                          </div>
                          <input
                            type="radio"
                            className="sr-only"
                            checked={shippingZone.id === zone.id}
                            onChange={() => setShippingZone(zone)}
                          />
                          <span className="text-sm text-gray-700">
                            {zone.label}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-green-700">
                          ৳{zone.charge}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition text-base mt-2"
              >
                {loading
                  ? "Placing Order..."
                  : authLoading
                    ? "Verifying session…"
                    : `Place Order — ৳${grandTotal.toFixed(0)}`}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-4">
              Items ({checkoutItems.length})
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {checkoutItems.map((item) => {
                const variantLabel =
                  item.variantLabel ||
                  item.selectedVariant?.label ||
                  item.selectedVariant?.name ||
                  item.selectedVariant?.size ||
                  item.selectedVariant?.color ||
                  null;
                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.name}
                      </p>
                      {variantLabel && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 mt-0.5">
                          <Tag size={8} />
                          {variantLabel}
                        </span>
                      )}
                      {isBuyNow ? (
                        <div className="mt-1.5 text-xs font-semibold text-gray-600">
                          Qty: {item.quantity}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity === 1
                                ? removeItem(item._id)
                                : updateQty(item._id, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500 text-base leading-none transition"
                          >
                            −
                          </button>
                          <span className="text-xs font-semibold text-gray-700 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item._id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600 text-base leading-none transition"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-green-700 shrink-0">
                      ৳{(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>৳{itemsTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery {allFreeDelivery ? "" : `(${shippingZone.label})`}</span>
                <span>{allFreeDelivery ? "ফ্রি" : `৳${shippingCharge}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-1.5 border-t">
                <span>Total</span>
                <span className="text-green-700 text-lg">
                  ৳{grandTotal.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
