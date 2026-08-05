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

    // Ensure indexes in the BACKGROUND — don't make the first request after a
    // cold start wait on ~18 createIndex round-trips to Atlas. Guarded so it
    // only runs once per warm instance.
    ensureIndexes(db);
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
// crashing startup. Runs at most once per process and never rejects into the
// caller — it's fired without await from connectDB().
let indexesEnsured = false;
const ensureIndexes = async (database) => {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    await createIndexes(database);
  } catch (err) {
    indexesEnsured = false; // allow a retry on a later request
    console.warn("⚠️  ensureIndexes failed:", err?.message);
  }
};

const createIndexes = async (database) => {
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
    database.collection("codingorders").createIndex({ createdAt: -1 }),
    database.collection("codingorders").createIndex({ status: 1 }),
    database
      .collection("competitionregistrations")
      .createIndex({ createdAt: -1 }),
    database
      .collection("competitionregistrations")
      .createIndex({ status: 1, createdAt: -1 }),
    database
      .collection("competitionregistrations")
      .createIndex({ regNo: 1 }),
    database.collection("supportcomplaints").createIndex({ createdAt: -1 }),
    database
      .collection("supportcomplaints")
      .createIndex({ status: 1, createdAt: -1 }),
    database.collection("supportcomplaints").createIndex({ ticketNo: 1 }),
    database.collection("blogs").createIndex({ slug: 1 }),
    database.collection("blogs").createIndex({ published: 1, createdAt: -1 }),
    database.collection("blogComments").createIndex({ blogId: 1 }),
    database.collection("blogComments").createIndex({ blogSlug: 1 }),
    database.collection("blogComments").createIndex({ parentId: 1 }),
    // Incomplete (abandoned) orders — unique draftId so concurrent saves
    // upsert the same lead, sorted by updatedAt in the admin list.
    database
      .collection("incompleteorders")
      .createIndex({ draftId: 1 }, { unique: true }),
    database.collection("incompleteorders").createIndex({ updatedAt: -1 }),
    database.collection("incompleteorders").createIndex({ status: 1 }),
    // Block-list — one entry per value per type.
    database.collection("blockedips").createIndex({ value: 1 }, { unique: true }),
    database
      .collection("blockedphones")
      .createIndex({ value: 1 }, { unique: true }),
    database
      .collection("blockedemails")
      .createIndex({ value: 1 }, { unique: true }),
    // Admin notification "last seen" markers — one doc per admin.
    database
      .collection("notificationseen")
      .createIndex({ adminEmail: 1 }, { unique: true }),
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
  // Landing-page plugin orders (same collection PluginOrderController uses).
  get pluginOrders()     { return getDB().collection("pluginorders");     },
  // Coding-landing orders (same collection CodingOrderController uses).
  get codingOrders()     { return getDB().collection("codingorders");     },
  // Abandoned-cart leads.
  get incompleteOrders() { return getDB().collection("incompleteorders"); },
  // Block-list, one collection per type.
  get blockedIps()       { return getDB().collection("blockedips");       },
  get blockedPhones()    { return getDB().collection("blockedphones");    },
  get blockedEmails()    { return getDB().collection("blockedemails");    },
  // Admin notification "last seen" markers.
  get notificationSeen() { return getDB().collection("notificationseen"); },
};