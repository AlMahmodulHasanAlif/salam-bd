// Sanitizes the Facebook/Meta ad attribution a client sends with an order.
//
// The client already trims and caps these values, but it is untrusted input
// that lands directly in Mongo — so the same limits are enforced here. Anything
// unrecognised is dropped rather than stored.

const ALLOWED_FIELDS = [
  "source",
  "campaign",
  "adset",
  "ad",
  "campaignId",
  "adsetId",
  "adId",
  "fbclid",
  "utmCampaign",
  "utmContent",
  "capturedAt",
];

const MAX_LEN = 200;

// Returns a clean attribution object, or null when there is nothing worth
// storing. Never throws — a malformed payload must not fail order creation.
export const sanitizeAttribution = (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const clean = {};
  for (const field of ALLOWED_FIELDS) {
    const value = raw[field];
    // Ignore nested objects/arrays — these fields are always scalar.
    if (value == null || typeof value === "object") continue;

    const str = String(value).trim().slice(0, MAX_LEN);
    if (str) clean[field] = str;
  }

  // capturedAt alone carries no marketing signal.
  const hasSignal = Object.keys(clean).some((k) => k !== "capturedAt");
  return hasSignal ? clean : null;
};
