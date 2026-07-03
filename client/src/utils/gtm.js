/**
 * GTM dataLayer helper — replaces the old Facebook Pixel utility.
 *
 * Every push lands in `window.dataLayer` where GTM picks it up
 * and fires the configured tags (GA4, FB Pixel, etc.).
 *
 * Each method returns an `eventId` string that can be forwarded to
 * the backend so Facebook CAPI can deduplicate browser ↔ server events.
 */

export const generateEventId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const push = (event, params = {}, eventId = null) => {
  const id = eventId || generateEventId();
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, eventId: id, ...params });
  return id;
};

export const GTM = {
  pageView(pagePath) {
    return push("page_view", { page_path: pagePath });
  },

  search(query) {
    return push("search", { search_term: query });
  },

  viewContent(data = {}) {
    return push("view_item", {
      content_ids: data.content_ids,
      content_name: data.content_name,
      content_type: data.content_type,
      value: data.value,
      currency: data.currency || "BDT",
    });
  },

  addToCart(data = {}) {
    return push("add_to_cart", {
      content_ids: data.content_ids,
      content_name: data.content_name,
      content_type: data.content_type,
      value: data.value,
      currency: data.currency || "BDT",
    });
  },

  initiateCheckout(data = {}, eventId = null) {
    return push("begin_checkout", {
      content_ids: data.content_ids,
      content_type: data.content_type,
      value: data.value,
      currency: data.currency || "BDT",
      num_items: data.num_items,
    }, eventId);
  },

  purchase(data = {}, eventId = null) {
    return push("purchase", {
      content_ids: data.content_ids,
      content_type: data.content_type,
      value: data.value,
      currency: data.currency || "BDT",
      num_items: data.num_items,
    }, eventId);
  },

  custom(eventName, data = {}) {
    return push(eventName, data);
  },
};
