import asyncHandler from "express-async-handler";
import { getMessaging } from "firebase-admin/messaging";
import { getDB } from "../config/db.js";

// Device tokens live in their own collection, keyed uniquely by the token.
const tokensCol = () => getDB().collection("pushTokens");

/**
 * Reusable helper — send a push to a list of FCM tokens.
 * Call this from anywhere on the server (e.g. after an order status change):
 *   await sendPush({ tokens, title: "Order shipped", body: "...", data: { url: "/orders" } });
 * `data` values must be strings; `url` is read by the app to deep-link on tap.
 */
export const sendPush = async ({ tokens, title, body, data = {} }) => {
  const list = (Array.isArray(tokens) ? tokens : [tokens]).filter(Boolean);
  if (!list.length) return { successCount: 0, failureCount: 0 };

  const res = await getMessaging().sendEachForMulticast({
    tokens: list,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]),
    ),
    android: { priority: "high" },
  });

  // Prune tokens FCM reports as permanently invalid (app uninstalled, etc.).
  const stale = [];
  res.responses.forEach((r, i) => {
    const code = r.error?.code;
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      stale.push(list[i]);
    }
  });
  if (stale.length) {
    await tokensCol().deleteMany({ token: { $in: stale } }).catch(() => {});
  }
  return res;
};

// POST /api/push/token  — the app registers/refreshes its device token here.
export const saveToken = asyncHandler(async (req, res) => {
  const { token, platform = "android", uid = null } = req.body || {};
  if (!token) {
    res.status(400);
    throw new Error("token is required");
  }

  await tokensCol().updateOne(
    { token },
    { $set: { token, platform, uid, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );

  res.json({ ok: true });
});

// POST /api/push/test  (admin) — send a test notification.
// Body: { token?: string, title?: string, body?: string }
// If no token is given, broadcasts to every stored device.
export const sendTest = asyncHandler(async (req, res) => {
  const { token, title = "Salam BD", body = "Test notification 🎉" } = req.body || {};

  let tokens;
  if (token) {
    tokens = [token];
  } else {
    const docs = await tokensCol().find({}, { projection: { token: 1 } }).toArray();
    tokens = docs.map((d) => d.token);
  }

  const result = await sendPush({ tokens, title, body, data: { url: "/" } });
  res.json({
    ok: true,
    sent: tokens.length,
    successCount: result.successCount,
    failureCount: result.failureCount,
  });
});
