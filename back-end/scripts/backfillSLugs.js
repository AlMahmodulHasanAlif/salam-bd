// scripts/backfillSlugs.js
import "dotenv/config"; // ← must come first
import { connectDB, getDB } from "../config/db.js";
import { slugify } from "../utils/slugify.js";

await connectDB();
const db = getDB();
const collection = db.collection("products");

const products = await collection.find({}).toArray();
const usedSlugs = new Set();

for (const p of products) {
  let baseSlug = slugify(p.name);
  let slug = baseSlug;
  let counter = 1;

  while (
    usedSlugs.has(slug) ||
    (await collection.findOne({ slug, _id: { $ne: p._id } }))
  ) {
    slug = `${baseSlug}-${counter++}`;
  }

  usedSlugs.add(slug);

  await collection.updateOne(
    { _id: p._id },
    { $set: { slug } }
  );

  console.log(`✅ ${p.name} → ${slug}`);
}

console.log(`Done. Updated ${products.length} products.`);
process.exit(0);