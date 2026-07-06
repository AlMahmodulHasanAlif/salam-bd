// Sends order notifications to Telegram via the Bot API.
// Free, instant push alerts — no npm dependency (uses native fetch, Node 18+).
//
// Setup (one time):
//   1. Open Telegram → search @BotFather → /newbot → follow prompts → copy the token.
//   2. Add the bot to a group (or DM it), then send any message.
//   3. Visit https://api.telegram.org/bot<TOKEN>/getUpdates and copy "chat":{"id": ...}.
//   4. Put both in your .env:
//        TELEGRAM_BOT_TOKEN=123456:ABC...
//        TELEGRAM_CHAT_ID=-1001234567890

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const escapeHtml = (val) =>
  String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Fire-and-forget: never throws, never blocks the order response on failure.
export const sendTelegramMessage = async (text) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("[Telegram] Missing BOT_TOKEN or CHAT_ID — skipping");
    return;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error(`[Telegram] ✗ sendMessage failed (${res.status}):`, detail);
    } else {
      console.log("[Telegram] ✓ notification sent");
    }
  } catch (err) {
    console.error("[Telegram] ✗ notification error:", err.message);
  }
};

const money = (val) => (val == null ? "—" : `৳${val}`);

// Formats a new-order alert. Works for both the main order section
// and plugin orders, pulling whichever fields are present.
export const notifyNewOrder = async (order, { source = "Order" } = {}) => {
  const name =
    order?.shippingInfo?.name ||
    order?.billing?.name ||
    order?.name ||
    "Unknown";
  const phone =
    order?.shippingInfo?.phone ||
    order?.billing?.phone ||
    order?.phone ||
    "—";
  const address =
    order?.shippingInfo?.address ||
    order?.shipping?.address ||
    order?.billing?.address ||
    order?.address ||
    "—";
  const total =
    order?.totalPrice ??
    order?.totalAmount ??
    order?.total ??
    order?.pricing?.total ??
    null;

  // Line items — main orders use `items`, plugin orders use a single `product`.
  let itemLines = "";
  if (Array.isArray(order?.items) && order.items.length) {
    itemLines = order.items
      .map(
        (i) =>
          `• ${escapeHtml(i.name || i.title || i.productId)} ×${i.quantity || i.qty || 1}`,
      )
      .join("\n");
  } else if (order?.product) {
    const p = order.product;
    itemLines = `• ${escapeHtml(p.name || p.title || "Product")} ×${p.quantity || p.qty || 1}`;
  }

  const text = [
    `🛒 <b>New ${escapeHtml(source)}!</b>`,
    ``,
    `👤 <b>${escapeHtml(name)}</b>`,
    `📞 ${escapeHtml(phone)}`,
    `📍 ${escapeHtml(address)}`,
    itemLines ? `\n${itemLines}` : "",
    ``,
    `💰 <b>Total: ${escapeHtml(money(total))}</b>`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  await sendTelegramMessage(text);
};
