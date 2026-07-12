// src/hooks/useAxios.jsx
import axios from "axios";
import { useEffect } from "react";
import { auth } from "../firebase/firebase.init";

const axiosSecure = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  withCredentials: true,
});

const useAxiosSecure = () => {
  useEffect(() => {
    const req = axiosSecure.interceptors.request.use(
      async (config) => {
        // Read the live Firebase user (not React state) so the token is
        // attached even during the brief window before `user` state updates.
        const current = auth.currentUser;
        if (current) {
          const token = await current.getIdToken();
          config.headers.authorization = `Bearer ${token}`;
        }
        // Forward Facebook cookies for server-side CAPI tracking
        const cookies = document.cookie.split("; ");
        const fbp = cookies.find((c) => c.startsWith("_fbp="))?.split("=")[1];
        const fbc = cookies.find((c) => c.startsWith("_fbc="))?.split("=")[1];
        if (fbp) config.headers["X-Fbp"] = fbp;
        if (fbc) config.headers["X-Fbc"] = fbc;
        return config;
      },
      (error) => Promise.reject(error),
    );

    const res = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const current = auth.currentUser;

        // Transparently recover from an expired/stale token: force-refresh the
        // ID token once and replay the request.
        //
        // We deliberately do NOT call logOut()/navigate() here. A single failed
        // request must never rip the user off the page they're on (that was the
        // cause of the "clicking Dashboard logs me out" bug). Genuinely
        // unauthenticated navigation is already handled by the route guards
        // (ProtectedRoute / AdminRoute), so a transient 401 just gets retried
        // and, if it still fails, is surfaced to the calling page to handle.
        if (
          error.response?.status === 401 &&
          current &&
          !originalRequest._retried
        ) {
          originalRequest._retried = true;
          try {
            const freshToken = await current.getIdToken(true);
            originalRequest.headers.authorization = `Bearer ${freshToken}`;
            return await axiosSecure(originalRequest);
          } catch {
            // Refresh failed — fall through and reject without disrupting the UI.
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosSecure.interceptors.request.eject(req);
      axiosSecure.interceptors.response.eject(res);
    };
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;
