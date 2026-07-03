// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import AuthProvider from "../src/context/AuthProvider";
import router from "../src/routes/routes";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";





const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
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