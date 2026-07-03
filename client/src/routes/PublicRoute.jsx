// src/routes/PublicRoute.jsx
// Guest-only guard: if the user is already logged in, keep them away from the
// login/register pages and send them back where they came from (or home).
import React from "react";
import { Navigate, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (user) {
    const dest = location.state?.from || "/";
    return <Navigate to={dest} replace />;
  }

  return children;
};

export default PublicRoute;
