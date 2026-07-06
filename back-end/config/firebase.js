import { createRequire } from "module";
import { initializeApp, cert, getApps } from "firebase-admin/app";

// Resolve the service-account credential. In production (Vercel) the JSON file
// is not deployed — it's a secret — so we read it from an env var. Locally we
// fall back to the gitignored fbtoken.json file for convenience.
//
// FIREBASE_SERVICE_ACCOUNT may hold either the raw JSON or a base64-encoded
// version of it (base64 avoids newline/escaping issues in dashboards).
const loadServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(json);
  }

  // Local dev fallback: load the file only if the env var isn't set.
  const require = createRequire(import.meta.url);
  return require("../fbtoken.json");
};

export const initFirebase = () => {
  // Guard against re-initialization across warm serverless invocations.
  if (getApps().length) return;

  initializeApp({
    credential: cert(loadServiceAccount()),
  });
  console.log("✅ Firebase Admin initialized!");
};
