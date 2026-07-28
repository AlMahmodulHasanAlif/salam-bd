// Captures Facebook/Meta ad attribution from the landing URL and keeps it
// until the visitor orders (they usually browse for a while before checking
// out, so the params are long gone from the URL by then).
//
// Meta ad URL setup this expects — the {{...}} macros are filled in by Meta:
//   ?utm_source=facebook
//   &utm_campaign={{campaign.name}}&utm_content={{ad.name}}
//   &campaign_name={{campaign.name}}&adset_name={{adset.name}}&ad_name={{ad.name}}
//   &campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}
// Any subset works; missing values are simply omitted.
//
// Cost is a single synchronous localStorage read/write at startup — no network,
// no observers, nothing on the order path.

const STORAGE_KEY = "mkt_attribution_v1";

// Meta's click attribution window is 7 days; 30 gives comfortable headroom
// without letting a months-old click take credit for an unrelated order.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Ad names are author-controlled and can be long; cap so a crafted URL can't
// push megabytes into the order document.
const MAX_LEN = 200;

// Each output field reads the first URL param that has a value.
// Named fields prefer Meta's explicit params and fall back to the UTM
// equivalent; utmCampaign/utmContent are always kept raw and separate.
const FIELD_SOURCES = {
  source: ["utm_source"],
  campaign: ["campaign_name", "utm_campaign"],
  adset: ["adset_name"],
  ad: ["ad_name", "utm_content"],
  campaignId: ["campaign_id"],
  adsetId: ["adset_id"],
  adId: ["ad_id"],
  fbclid: ["fbclid"],
  utmCampaign: ["utm_campaign"],
  utmContent: ["utm_content"],
};

// A macro that Meta never filled in ("{{campaign.name}}") is noise, not data.
const isUnresolvedMacro = (v) => /^\{\{.*\}\}$/.test(v);

const clean = (raw) => {
  const v = String(raw ?? "").trim();
  if (!v || isUnresolvedMacro(v)) return null;
  return v.slice(0, MAX_LEN);
};

// Reads attribution out of a query string. Returns null when the URL carries
// no ad data at all, so ordinary navigation never overwrites a real ad click.
const parseFromSearch = (search) => {
  const params = new URLSearchParams(search);
  const found = {};

  for (const [field, keys] of Object.entries(FIELD_SOURCES)) {
    for (const key of keys) {
      const value = clean(params.get(key));
      if (value) {
        found[field] = value;
        break;
      }
    }
  }

  if (!Object.keys(found).length) return null;

  // A bare fbclid still tells us the visitor arrived from Facebook.
  if (!found.source && found.fbclid) found.source = "facebook";

  return found;
};

// localStorage throws in private-mode Safari and when quota is exhausted.
// Attribution is nice-to-have, so every access degrades to "no data".
const safeRead = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const safeWrite = (value) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore — the order still goes through, just unattributed */
  }
};

// Call once at app startup. Last-touch: a fresh ad click replaces whatever was
// stored, because the most recent ad is the one that drove the purchase.
export const captureAttribution = () => {
  if (typeof window === "undefined") return;

  const found = parseFromSearch(window.location.search);
  if (!found) return;

  safeWrite({ ...found, capturedAt: new Date().toISOString() });
};

// Returns the stored attribution for sending with an order, or null.
export const getAttribution = () => {
  const stored = safeRead();
  if (!stored) return null;

  const age = Date.now() - new Date(stored.capturedAt || 0).getTime();
  if (!Number.isFinite(age) || age > MAX_AGE_MS) return null;

  return stored;
};

export const __test = { parseFromSearch, clean };
