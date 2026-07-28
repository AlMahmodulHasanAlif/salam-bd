// src/hooks/useIncompleteOrder.jsx
//
// Captures an order form's contents as an "incomplete order" while the customer
// fills it in, so the admin panel can follow up on people who typed their
// details but never placed the order.
//
// Drop it into any order form:
//
//   const { draftId, clearDraft } = useIncompleteOrder({
//     source: "checkout",
//     data: { customer: {...}, items: [...], estimatedTotal },
//   });
//
// then send `draftId` with the order payload — the backend deletes the draft
// when the order is created, so only genuinely abandoned forms remain.
//
// Nothing here is allowed to disrupt checkout: every network call is
// fire-and-forget and every failure is swallowed.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEBOUNCE_MS = 1200;
const storageKey = (source) => `sb_draft_${source}`;

const endpoint = () => {
  const base = import.meta.env.VITE_API_URL;
  return base ? `${base}/api/incomplete-orders` : null;
};

const newDraftId = () => {
  // randomUUID needs a secure context; fall back for plain-http dev hosts.
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

// One id per form, reused across reloads so a customer who refreshes mid-form
// updates their existing draft instead of creating a second row.
const loadDraftId = (source) => {
  try {
    const existing = localStorage.getItem(storageKey(source));
    if (existing) return existing;
    const id = newDraftId();
    localStorage.setItem(storageKey(source), id);
    return id;
  } catch {
    return newDraftId(); // private mode / storage disabled — in-memory only
  }
};

// A draft is worth sending once the customer has typed any real delivery detail.
// Mirrors the server's rule so we don't spend requests on empty forms.
const hasText = (v, min = 2) => String(v || "").trim().length >= min;
const isContactable = (customer = {}) => {
  const phoneDigits = String(customer.phone || "").replace(/\D/g, "");
  return (
    phoneDigits.length >= 4 ||
    hasText(customer.name) ||
    hasText(customer.address, 3) ||
    hasText(customer.district) ||
    hasText(customer.thana)
  );
};

export default function useIncompleteOrder({ source, data, enabled = true }) {
  const [draftId] = useState(() => loadDraftId(source));

  // Once the order is placed the draft is dead. State (not a ref) so the render
  // below recomputes `shouldSave` and the debounce effect tears itself down.
  const [cleared, setCleared] = useState(false);

  // Serialized here so the effect below depends on the draft's *contents*, not
  // on the identity of an object the parent rebuilds every render.
  const payload = useMemo(
    () =>
      JSON.stringify({
        draftId,
        source,
        customer: data?.customer || {},
        items: data?.items || [],
        estimatedTotal: data?.estimatedTotal || 0,
        note: data?.note || null,
        attribution: data?.attribution || null,
      }),
    [draftId, source, data],
  );

  const shouldSave = enabled && !cleared && isContactable(data?.customer);

  // What the page-hide handler should send, or null when there's nothing worth
  // saving. Kept in a ref so that handler always sees the newest values without
  // re-registering its listeners on every keystroke, and synced in an effect
  // rather than during render.
  const pendingRef = useRef(null);
  useEffect(() => {
    pendingRef.current = shouldSave ? payload : null;
  }, [payload, shouldSave]);

  // Debounced save while typing.
  useEffect(() => {
    if (!shouldSave) return;
    const url = endpoint();
    if (!url) return;

    const id = setTimeout(() => {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        keepalive: true,
        body: payload,
      }).catch(() => {}); // background capture — never surface an error
    }, DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [payload, shouldSave]);

  // Final save when the customer leaves. `pagehide` and the hidden transition of
  // `visibilitychange` are the only events that fire reliably on mobile — a tab
  // switched away and then killed by the OS never fires `beforeunload`.
  useEffect(() => {
    const flush = () => {
      const body = pendingRef.current;
      if (!body) return;
      const url = endpoint();
      if (!url) return;
      try {
        // text/plain keeps the beacon a "simple" request: an application/json
        // beacon needs a CORS preflight the browser won't wait for on unload.
        // The route re-parses it.
        navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
      } catch {
        // Beacon unavailable or blocked — the debounced save above is the
        // fallback, and it has usually already run by this point.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Call right after the order is successfully placed. The server has already
  // deleted the draft by then (it receives `draftId` with the order); this just
  // retires the local id so the customer's next order starts a fresh draft.
  const clearDraft = useCallback(() => {
    setCleared(true);
    // Cleared directly rather than waiting for the effect to sync it: the form
    // usually navigates away immediately, and the page-hide flush reads this ref.
    pendingRef.current = null;
    try {
      localStorage.removeItem(storageKey(source));
    } catch {
      // Storage unavailable — the in-memory latch above is enough for this session.
    }
  }, [source]);

  return { draftId, clearDraft };
}
