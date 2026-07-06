import { MongoClient, ServerApiVersion } from "mongodb";

let db = null;
// Cache the in-flight connection so concurrent/serverless invocations reuse a
// single MongoClient instead of racing (or opening a new pool per request).
let connectionPromise = null;

export const connectDB = async () => {
  if (db) return db;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas!");

    db = client.db("salam-bd");

    await ensureIndexes(db);
    return db;
  })();

  try {
    return await connectionPromise;
  } catch (err) {
    // Reset so the next request can retry instead of caching a failed promise.
    connectionPromise = null;
    throw err;
  }
};

// Create indexes for hot query paths. Uses allSettled so a pre-existing
// duplicate (e.g. on the unique email index) logs a warning instead of
// crashing startup.
const ensureIndexes = async (database) => {
  const jobs = [
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("orders").createIndex({ userEmail: 1, createdAt: -1 }),
    database.collection("orders").createIndex({ status: 1, createdAt: -1 }),
    database.collection("cart").createIndex({ userEmail: 1 }),
    database
      .collection("cart")
      .createIndex({ userEmail: 1, productId: 1, variantLabel: 1 }),
    database.collection("products").createIndex({ slug: 1 }),
    database.collection("products").createIndex({ category: 1 }),
    database.collection("reviews").createIndex({ productId: 1 }),
    database.collection("reviews").createIndex({ productId: 1, userEmail: 1 }),
    database.collection("pluginorders").createIndex({ createdAt: -1 }),
    database.collection("pluginorders").createIndex({ status: 1 }),
    database.collection("blogs").createIndex({ slug: 1 }),
    database.collection("blogs").createIndex({ published: 1, createdAt: -1 }),
    database.collection("blogComments").createIndex({ blogId: 1 }),
    database.collection("blogComments").createIndex({ blogSlug: 1 }),
    database.collection("blogComments").createIndex({ parentId: 1 }),
  ];

  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    console.warn(
      `⚠️  ${failed.length} index(es) could not be created:`,
      failed.map((f) => f.reason?.message),
    );
  } else {
    console.log("✅ MongoDB indexes ensured");
  }
};

export const getDB = () => {
  if (!db) throw new Error("Database not initialized. Call connectDB() first.");
  return db;
};

// Convenience collection accessors
export const collections = {
  get users()        { return getDB().collection("users");        },
  get products()     { return getDB().collection("products");     },
  get cart()         { return getDB().collection("cart");         },
  get orders()       { return getDB().collection("orders");       },
  get reviews()      { return getDB().collection("reviews");      },
  get blogs()        { return getDB().collection("blogs");        },
  get blogComments() { return getDB().collection("blogComments"); },
};