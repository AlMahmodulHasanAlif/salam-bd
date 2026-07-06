import "dotenv/config";
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../fbtoken.json");

const slugify = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

// ── Primary demo account ─────────────────────────────────────────────────────
const MAIN = {
  name: "Alif Rahman",
  email: "alifrk404@gmail.com",
  password: "janinabhai12",
  phone: "+8801712345678",
  address: "House 12, Road 5, Dhanmondi, Dhaka-1205",
};

// ── 1. Firebase Auth account ─────────────────────────────────────────────────
initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();

let fbUid = null;
try {
  const rec = await auth.createUser({
    email: MAIN.email,
    password: MAIN.password,
    displayName: MAIN.name,
    emailVerified: true,
  });
  fbUid = rec.uid;
  console.log(`✅ Firebase user created: ${MAIN.email} (uid ${fbUid})`);
} catch (e) {
  if (e.code === "auth/email-already-exists") {
    const rec = await auth.getUserByEmail(MAIN.email);
    fbUid = rec.uid;
    await auth.updateUser(fbUid, { password: MAIN.password, displayName: MAIN.name });
    console.log(`ℹ️  Firebase user already existed — password reset to the requested one (uid ${fbUid})`);
  } else if (e.code === "auth/configuration-not-found") {
    console.warn(
      "⚠️  Firebase Authentication is NOT enabled for project 'salam-bd' — " +
        "cannot create the login account. Enable Email/Password sign-in in the " +
        "Firebase console (Authentication → Sign-in method), then re-run. " +
        "Seeding the database anyway…",
    );
  } else {
    console.warn(`⚠️  Firebase user step failed (${e.code || e.message}). Seeding database anyway…`);
  }
}

// ── 2. Mongo connection ──────────────────────────────────────────────────────
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});
await client.connect();
const db = client.db("salam-bd");
console.log("✅ Connected to MongoDB");

const users = db.collection("users");
const products = db.collection("products");
const reviews = db.collection("reviews");
const cart = db.collection("cart");
const orders = db.collection("orders");
const blogs = db.collection("blogs");
const blogComments = db.collection("blogComments");
const pluginorders = db.collection("pluginorders");

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

// ── 3. Products ──────────────────────────────────────────────────────────────
const productSeed = [
  {
    name: "Premium Arabian Attar - Musk Al Tahara",
    nameBn: "প্রিমিয়াম আরবি আতর - মুস্ক আল তাহারা",
    price: 650,
    wholesalePrice: 420,
    category: "Fragrance",
    subcategory: "Attar",
    stock: 40,
    freeDelivery: false,
    description: "Long-lasting alcohol-free premium attar with a rich musk base. 12ml roll-on bottle.",
    image: "https://res.cloudinary.com/viel4mbs/image/upload/attar-musk.jpg",
    images: ["https://res.cloudinary.com/viel4mbs/image/upload/attar-musk.jpg"],
    variants: [
      { label: "6ml", priceAdjustment: -200 },
      { label: "12ml", priceAdjustment: 0 },
      { label: "20ml", priceAdjustment: 250 },
    ],
  },
  {
    name: "Turkish Prayer Mat - Velvet Mihrab",
    nameBn: "তুর্কি জায়নামাজ - ভেলভেট মিহরাব",
    price: 1200,
    wholesalePrice: 850,
    category: "Prayer Essentials",
    subcategory: "Prayer Mat",
    stock: 25,
    freeDelivery: true,
    description: "Thick padded velvet prayer mat with memory-foam kneeling area and gold mihrab design.",
    image: "https://res.cloudinary.com/viel4mbs/image/upload/prayer-mat.jpg",
    images: ["https://res.cloudinary.com/viel4mbs/image/upload/prayer-mat.jpg"],
    variants: [
      { label: "Maroon", priceAdjustment: 0 },
      { label: "Navy Blue", priceAdjustment: 0 },
      { label: "Emerald Green", priceAdjustment: 0 },
    ],
  },
  {
    name: "Men's Cotton Panjabi - Off White",
    nameBn: "পুরুষদের সুতির পাঞ্জাবি - অফ হোয়াইট",
    price: 1450,
    wholesalePrice: 980,
    category: "Clothing",
    subcategory: "Panjabi",
    stock: 60,
    freeDelivery: false,
    description: "Premium cotton panjabi with subtle chikan embroidery. Perfect for Jummah and Eid.",
    image: "https://res.cloudinary.com/viel4mbs/image/upload/panjabi.jpg",
    images: ["https://res.cloudinary.com/viel4mbs/image/upload/panjabi.jpg"],
    variants: [
      { label: "M", priceAdjustment: 0 },
      { label: "L", priceAdjustment: 0 },
      { label: "XL", priceAdjustment: 100 },
      { label: "XXL", priceAdjustment: 200 },
    ],
  },
  {
    name: "Digital Tasbih Counter Ring - Zikr",
    nameBn: "ডিজিটাল তাসবিহ কাউন্টার রিং - জিকির",
    price: 320,
    wholesalePrice: 180,
    category: "Prayer Essentials",
    subcategory: "Tasbih",
    stock: 120,
    freeDelivery: false,
    description: "Rechargeable smart tasbih ring with OLED display and vibration count. USB-C charging.",
    image: "https://res.cloudinary.com/viel4mbs/image/upload/tasbih-ring.jpg",
    images: ["https://res.cloudinary.com/viel4mbs/image/upload/tasbih-ring.jpg"],
    variants: [],
  },
  {
    name: "Premium Ajwa Dates - 500g Box",
    nameBn: "প্রিমিয়াম আজওয়া খেজুর - ৫০০গ্রাম বক্স",
    price: 900,
    wholesalePrice: 700,
    category: "Food",
    subcategory: "Dates",
    stock: 80,
    freeDelivery: true,
    description: "Authentic Madinah Ajwa dates, soft and premium grade. Vacuum-sealed 500g gift box.",
    image: "https://res.cloudinary.com/viel4mbs/image/upload/ajwa-dates.jpg",
    images: ["https://res.cloudinary.com/viel4mbs/image/upload/ajwa-dates.jpg"],
    variants: [
      { label: "250g", priceAdjustment: -400 },
      { label: "500g", priceAdjustment: 0 },
      { label: "1kg", priceAdjustment: 750 },
    ],
  },
  {
    name: "Women's Georgette Hijab - Set of 3",
    nameBn: "মহিলাদের জর্জেট হিজাব - ৩টির সেট",
    price: 780,
    wholesalePrice: 520,
    category: "Clothing",
    subcategory: "Hijab",
    stock: 45,
    freeDelivery: false,
    description: "Breathable premium georgette hijabs, set of 3 assorted colours. Non-slip and lightweight.",
    image: "https://res.cloudinary.com/viel4mbs/image/upload/hijab-set.jpg",
    images: ["https://res.cloudinary.com/viel4mbs/image/upload/hijab-set.jpg"],
    variants: [
      { label: "Pastel Set", priceAdjustment: 0 },
      { label: "Earth Tones", priceAdjustment: 0 },
    ],
  },
];

// clear prior seed products by slug so re-runs stay idempotent
const seededSlugs = productSeed.map((p) => slugify(p.name));
await products.deleteMany({ slug: { $in: seededSlugs } });

const productDocs = productSeed.map((p) => ({
  _id: new ObjectId(),
  ...p,
  slug: slugify(p.name),
  ratings: 0,
  reviewCount: 0,
  createdAt: daysAgo(30),
}));
await products.insertMany(productDocs);
console.log(`✅ Inserted ${productDocs.length} products`);

const P = Object.fromEntries(productDocs.map((p) => [p.subcategory, p]));

// ── 4. Users ─────────────────────────────────────────────────────────────────
const userSeed = [
  { name: MAIN.name, email: MAIN.email, role: "user", phone: MAIN.phone, address: MAIN.address, firebaseUid: fbUid },
  { name: "Fatima Akter", email: "fatima.akter@example.com", role: "user", phone: "+8801811223344", address: "Flat 3B, Uttara Sector 7, Dhaka" },
  { name: "Site Admin", email: "admin@salambd.com", role: "admin", phone: "+8801999888777", address: "Salam BD HQ, Motijheel, Dhaka" },
];
for (const u of userSeed) {
  await users.updateOne(
    { email: u.email },
    { $set: { ...u, updatedAt: now }, $setOnInsert: { createdAt: daysAgo(20) } },
    { upsert: true },
  );
}
console.log(`✅ Upserted ${userSeed.length} users`);

// ── 5. Reviews (from main user + others) ─────────────────────────────────────
await reviews.deleteMany({ userEmail: { $in: userSeed.map((u) => u.email) } });
const reviewSeed = [
  { product: P.Attar, user: userSeed[0], rating: 5, comment: "MashaAllah, the fragrance lasts all day. Highly recommended!", recommended: true, ago: 8 },
  { product: P["Prayer Mat"], user: userSeed[0], rating: 4, comment: "Very soft and comfortable for sujood. Delivery was quick.", recommended: true, ago: 5 },
  { product: P.Dates, user: userSeed[1], rating: 5, comment: "Fresh and premium Ajwa. Loved it for iftar.", recommended: true, ago: 3 },
  { product: P.Attar, user: userSeed[1], rating: 4, comment: "Nice scent but the bottle is a bit small.", recommended: true, ago: 2 },
];
for (const r of reviewSeed) {
  await reviews.insertOne({
    productId: r.product._id.toString(),
    userEmail: r.user.email,
    userName: r.user.name,
    userPhoto: null,
    rating: r.rating,
    comment: r.comment,
    recommended: r.recommended,
    createdAt: daysAgo(r.ago),
  });
}
// recalc product ratings
for (const prod of productDocs) {
  const all = await reviews.find({ productId: prod._id.toString() }).toArray();
  const count = all.length;
  const avg = count ? Math.round((all.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  await products.updateOne({ _id: prod._id }, { $set: { ratings: avg, reviewCount: count } });
}
console.log(`✅ Inserted ${reviewSeed.length} reviews + recalculated ratings`);

// ── 6. Cart items for main user ──────────────────────────────────────────────
await cart.deleteMany({ userEmail: MAIN.email });
await cart.insertMany([
  {
    userEmail: MAIN.email,
    productId: P.Panjabi._id.toString(),
    name: P.Panjabi.name,
    image: P.Panjabi.image,
    price: P.Panjabi.price,
    quantity: 1,
    variantLabel: "L",
    selectedVariant: { label: "L" },
    freeDelivery: P.Panjabi.freeDelivery,
    addedAt: daysAgo(1),
  },
  {
    userEmail: MAIN.email,
    productId: P.Tasbih._id.toString(),
    name: P.Tasbih.name,
    image: P.Tasbih.image,
    price: P.Tasbih.price,
    quantity: 2,
    variantLabel: null,
    selectedVariant: null,
    freeDelivery: P.Tasbih.freeDelivery,
    addedAt: daysAgo(1),
  },
]);
console.log("✅ Inserted 2 cart items for main user");

// ── 7. Orders for main user ──────────────────────────────────────────────────
await orders.deleteMany({ userEmail: MAIN.email });
const makeItem = (prod, qty, variant, price) => ({
  productId: prod._id.toString(),
  name: prod.name,
  image: prod.image,
  price: price ?? prod.price,
  quantity: qty,
  variantLabel: variant ?? null,
  selectedVariant: variant ? { label: variant } : null,
});
const shippingInfo = {
  name: MAIN.name,
  phone: MAIN.phone,
  address: MAIN.address,
  city: "Dhaka",
  area: "Dhanmondi",
};

const order1Items = [makeItem(P.Attar, 1, "12ml", 650), makeItem(P.Dates, 1, "500g", 900)];
const order1Sub = order1Items.reduce((s, i) => s + i.price * i.quantity, 0);
const order2Items = [makeItem(P["Prayer Mat"], 1, "Emerald Green", 1200)];
const order2Sub = order2Items.reduce((s, i) => s + i.price * i.quantity, 0);

await orders.insertMany([
  {
    userEmail: MAIN.email,
    items: order1Items,
    shippingInfo: { ...shippingInfo, shippingCharge: 80 },
    method: "Cash on Delivery",
    totalPrice: order1Sub + 80,
    status: "Delivered",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(7),
  },
  {
    userEmail: MAIN.email,
    items: order2Items,
    shippingInfo: { ...shippingInfo, shippingCharge: 0 }, // prayer mat = freeDelivery
    method: "bKash",
    totalPrice: order2Sub,
    status: "Processing",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]);
console.log("✅ Inserted 2 orders for main user");

// ── 8. Blog + comment ────────────────────────────────────────────────────────
const blogSlug = "5-sunnah-fragrances-every-muslim-should-know-" + daysAgo(4).getTime();
await blogs.deleteMany({ title: "5 Sunnah Fragrances Every Muslim Should Know" });
const blogRes = await blogs.insertOne({
  title: "5 Sunnah Fragrances Every Muslim Should Know",
  slug: blogSlug,
  content: "<p>Fragrance holds a special place in Islam. The Prophet ﷺ loved good scents...</p>",
  category: "Islamic Lifestyle",
  coverImage: "https://res.cloudinary.com/viel4mbs/image/upload/blog-attar.jpg",
  excerpt: "Fragrance holds a special place in Islam. The Prophet loved good scents — here are 5 timeless ones.",
  tags: ["attar", "sunnah", "fragrance"],
  published: true,
  views: 134,
  createdAt: daysAgo(4),
  updatedAt: daysAgo(4),
});
await blogComments.deleteMany({ blogSlug });
await blogComments.insertOne({
  blogSlug,
  text: "JazakAllah khair for this beneficial article!",
  parentId: null,
  authorEmail: MAIN.email,
  authorName: MAIN.name,
  authorPhoto: null,
  likes: [userSeed[1].email],
  createdAt: daysAgo(3),
});
console.log(`✅ Inserted 1 blog (id ${blogRes.insertedId}) + 1 comment`);

// ── 9. Plugin order ──────────────────────────────────────────────────────────
await pluginorders.deleteMany({ "billing.email": MAIN.email });
await pluginorders.insertOne({
  product: { name: "Plug In Quran New V-2", price: 990, quantity: 1, image: null },
  billing: { name: MAIN.name, email: MAIN.email, phone: MAIN.phone },
  shipping: { zone: "free", charge: 0 },
  payment: { method: "Cash on Delivery" },
  pricing: { subtotal: 990, total: 990 },
  note: "Please deliver after Asr.",
  status: "confirmed",
  createdAt: daysAgo(6),
  updatedAt: daysAgo(5),
});
console.log("✅ Inserted 1 plugin order");

// ── Summary ──────────────────────────────────────────────────────────────────
console.log("\n──────── SEED SUMMARY ────────");
for (const [n, c] of [
  ["users", users], ["products", products], ["reviews", reviews],
  ["cart", cart], ["orders", orders], ["blogs", blogs],
  ["blogComments", blogComments], ["pluginorders", pluginorders],
]) {
  console.log(`${n.padEnd(14)}: ${await c.countDocuments()}`);
}
console.log(`\n🔑 Login → ${MAIN.email} / ${MAIN.password}`);

await client.close();
process.exit(0);
