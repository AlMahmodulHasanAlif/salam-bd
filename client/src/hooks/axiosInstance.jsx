// src/api/axiosInstance.jsx
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Forward Facebook cookie values as headers for server-side CAPI tracking
axiosInstance.interceptors.request.use((config) => {
  const cookies = document.cookie.split("; ");
  const fbp = cookies.find((c) => c.startsWith("_fbp="))?.split("=")[1];
  const fbc = cookies.find((c) => c.startsWith("_fbc="))?.split("=")[1];
  if (fbp) config.headers["X-Fbp"] = fbp;
  if (fbc) config.headers["X-Fbc"] = fbc;
  return config;
});

const MAX_RETRIES = 1;
const RETRY_DELAY = 500;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;

    const status = error.response?.status;
    // Only retry on network errors and true server errors. NEVER retry 4xx
    // (esp. 401/403) — an auth failure won't succeed on retry and just delays
    // the error by seconds while hammering the server. Idempotent reads only.
    const method = (config.method || "get").toLowerCase();
    const isReadOnly = method === "get" || method === "head";
    const isRetryable = isReadOnly && (!status || status >= 500);

    if (isRetryable && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      await new Promise((r) => setTimeout(r, RETRY_DELAY * config.__retryCount));
      return axiosInstance(config);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
