// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import AuthProvider from "../src/context/AuthProvider";
import router from "../src/routes/routes";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { captureAttribution } from "./utils/attribution";

// Runs before render so ad params are banked even if the visitor bounces to
// another page immediately. The landing/plugin funnel sits outside RootLayout,
// so this is the only place that covers both funnels.
captureAttribution();



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      // The axios interceptor already retries idempotent reads once. Don't stack
      // another 2 retries on top (that compounds to multi-second stalls). Never
      // retry client errors (4xx) — they won't succeed.
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});




ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
    </AuthProvider>
    </QueryClientProvider>
    
  </React.StrictMode>
);