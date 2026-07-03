// src/hooks/useAxios.jsx
import axios from "axios";
import { useEffect } from "react";
import useAuth from "./useAuth";
import { useNavigate } from "react-router";

const axiosSecure = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  withCredentials: true,
});

const useAxiosSecure = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const req = axiosSecure.interceptors.request.use(
      async (config) => {
        if (user) {
          const token = await user.getIdToken();
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

        if (error.response?.status === 401) {
          if (!originalRequest._retried) {
            originalRequest._retried = true;
            try {
              const freshToken = await user?.getIdToken(true);
              if (freshToken) {
                originalRequest.headers.authorization = `Bearer ${freshToken}`;
                return axiosSecure(originalRequest);
              }
            } catch (_refreshErr) {
              // Token refresh failed — session is truly expired
            }
          }
          await logOut();
          navigate("/login");
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosSecure.interceptors.request.eject(req);
      axiosSecure.interceptors.response.eject(res);
    };
  }, [user, logOut, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
