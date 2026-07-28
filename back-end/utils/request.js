// Resolve the real client IP address. Prefers Cloudflare's `cf-connecting-ip`
// header when the app sits behind Cloudflare, then the first hop of
// `x-forwarded-for`, and finally Express's `req.ip`.
export const getClientIp = (req) => {
  const cf = req.headers["cf-connecting-ip"];
  if (cf) return String(cf).trim();

  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();

  return req.ip || req.socket?.remoteAddress || "";
};
